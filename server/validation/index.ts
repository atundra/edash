import * as t from 'io-ts';
import { isLeft, Either, left, right } from 'fp-ts/lib/Either';

import { WidgetId, WidgetPosition, WidgetConfig } from '../renderer/types';
import widgetRegistry from '../renderer/widgets/registry';

const WidgetConfigShape = t.array(
  t.intersection([
    t.type({
      id: WidgetId,
      position: WidgetPosition,
    }),
    t.partial({ options: t.object }),
  ])
);

const widgetConfigValidations =
  Object
    .entries(widgetRegistry)
    .reduce((acc, [id, widget]) => {
      const optionsSchema = widget.definition.optionsSchema;

      acc[id] = t.type({
        id: t.literal(id),
        position: WidgetPosition,
        ...(optionsSchema ? { options: optionsSchema } : {}),
      });

      return acc;
    }, {} as Record<string, t.Any>);

export const validateWidgetConfig = (response: unknown): Either<t.Errors, WidgetConfig> => {
  const shapeValidationResult = WidgetConfigShape.decode(response);

  if (isLeft(shapeValidationResult)) {
    return shapeValidationResult;
  }

  const validationErrors: t.Errors = [];

  shapeValidationResult.right.forEach((config) => {
    const validationResult = widgetConfigValidations[config.id].decode(config);
    if (isLeft(validationResult)) {
      validationErrors.push(...validationResult.left);
    }
  });

  if (validationErrors.length) {
    return left(validationErrors);
  }

  // TODO: Make unified io-ts type
  return right(response as any);
};
