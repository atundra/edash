import { useMemo, useEffect, useRef, EffectCallback, RefObject, DependencyList } from 'react';
import { randomInt, randomRange, randomBool } from 'fp-ts/lib/Random';
import { pipe } from 'fp-ts/lib/pipeable';
import * as IO from 'fp-ts/lib/IO';
import * as ROA from 'fp-ts/lib/ReadonlyArray';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import { Lens } from 'monocle-ts';
import { constVoid, flow } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

const OPACITY = 0.4;

const getColors = (opacity: number) => [
  'rgba(0,135,61,' + opacity + ')',
  'rgba(61,19,141,' + opacity + ')',
  'rgba(0,115,157,' + opacity + ')',
  'rgba(162,66,61,' + opacity + ')',
];

const currentLens = () => Lens.fromProp<RefObject<HTMLCanvasElement>>()('current');

const drawCircle = (context: CanvasRenderingContext2D) => (x: number, y: number, radius: number, color: string) => {
  context.fillStyle = color;
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fill();
  context.ellipse;
};

type Circle = {
  x: number;
  velocity: number;
  yFunc: (x: number) => number;
  size: number;
  color: string;
};

const move = (circles: Circle[], delta: number, maxX: number): Circle[] =>
  circles.map((c) => {
    const cx = c.x + c.velocity * delta;
    const r = maxX + c.size / 2;
    const l = 0 - c.size / 2;
    const x = cx > r ? l : cx < l ? r : cx;

    return { ...c, x };
  });

const getRandomColor = () => {
  const colors = getColors(OPACITY);
  return colors[randomInt(0, colors.length - 1)()];
};

const generateCircles = (maxX: number): Circle[] =>
  A.makeBy(100, (i) => {
    const A = randomRange(-1, 1)();
    const B = randomRange(-1000, 1000)();
    const size = randomInt(5, 20)();
    const vsign = randomBool() ? 1 : -1;
    return {
      x: randomInt(0, maxX)(),
      velocity: vsign * (randomRange(1, 2)() / size),
      yFunc: (x) => A * x + B,
      size,
      color: getRandomColor(),
    };
  });

const getRenderRoutine = (canvas: HTMLCanvasElement): AnimationRoutine => {
  let circles: Circle[] = generateCircles(canvas.width);
  let prevTimestamp = performance.now();

  return (timestamp) => {
    circles = move(circles, timestamp - prevTimestamp, canvas.width);
    prevTimestamp = timestamp;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach((c) => {
      context.beginPath();
      pipe(context, drawCircle, (a) => a(c.x, c.yFunc(c.x), c.size, c.color));
      context.closePath();
    });
  };
};

type AnimationFrameRequestId = ReturnType<typeof window.requestAnimationFrame>;

const setCanvasDimensions = (canvas: HTMLCanvasElement): IO.IO<void> => () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
};

type AnimationRoutine = (timestamp: DOMHighResTimeStamp) => void;

type Cleanup = IO.IO<void>;

const createAnimation = (routine: AnimationRoutine): IO.IO<Cleanup> => () => {
  let requestId: AnimationFrameRequestId;
  const loop: FrameRequestCallback = (timestamp) => {
    routine(timestamp);
    requestId = requestAnimationFrame(loop);
  };
  requestId = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(requestId);
  };
};

const addWindowEventListener = (...args: Parameters<typeof addEventListener>): IO.IO<Cleanup> => () => {
  addEventListener(...args);
  return () => removeEventListener(...args);
};

const sequenceTIO = sequenceT(IO.io);

const canvasAnimationEffect = (canvas: HTMLCanvasElement): ReturnType<EffectCallback> => {
  const resizer = setCanvasDimensions(canvas);
  resizer();
  const animation = pipe(canvas, getRenderRoutine, createAnimation);
  const ioSequence = sequenceTIO(addWindowEventListener('resize', resizer), animation);
  const [animationCleanup, resizeCleanup] = ioSequence();

  return pipe(sequenceTIO(animationCleanup, resizeCleanup), constVoid);
};

const getEffect: (r: RefObject<HTMLCanvasElement>) => EffectCallback = flow(
  IO.of,
  IO.map(currentLens().get),
  IO.map(O.fromNullable),
  IO.map(O.fold(constVoid, canvasAnimationEffect))
);

export const MovingDots = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(getEffect(ref), [ref.current]);
  return <canvas style={{ width: '100%', height: '100%' }} ref={ref} />;
};
