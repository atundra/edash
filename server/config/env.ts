const enum Env {
  DEV,
  PROD,
}

export const parseEnv = (env: unknown): Env => (env === 'production' ? Env.PROD : Env.DEV);

export const isDev = (env: Env): boolean => env === Env.DEV;
