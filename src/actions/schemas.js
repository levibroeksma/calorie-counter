import { z } from 'astro/zod';

export const referenceUnitSchema = z.enum(['g', 'ml']);

const nonNegativeNumber = z.coerce.number().min(0);

export const macrosSchema = z.object({
  calories: nonNegativeNumber,
  protein: nonNegativeNumber,
  fibres: nonNegativeNumber.optional(),
  fats: nonNegativeNumber.optional(),
  carbs: nonNegativeNumber.optional(),
});

export const foodItemFieldsSchema = z.object({
  name: z.string().min(1),
  referenceAmount: z.coerce.number().int().min(1),
  referenceUnit: referenceUnitSchema,
  macros: macrosSchema,
});

export const writeTokenSchema = z.object({
  writeToken: z.string().min(1),
});

export const preferencesSchema = z.object({
  targetCalories: nonNegativeNumber,
  targetProtein: nonNegativeNumber,
  targetFibres: nonNegativeNumber,
  targetFats: nonNegativeNumber,
  targetCarbs: nonNegativeNumber,
});

export const createItemInputSchema = z
  .object({
    ...writeTokenSchema.shape,
    ...foodItemFieldsSchema.shape,
    logToToday: z.boolean().optional().default(false),
    amount: z.coerce.number().int().min(1).optional(),
    unit: referenceUnitSchema.optional(),
  })
  .superRefine((value, context) => {
    if (!value.logToToday) {
      return;
    }

    if (value.amount == null) {
      context.addIssue({
        code: 'custom',
        message: 'required',
        path: ['amount'],
      });
    }

    if (value.unit == null) {
      context.addIssue({
        code: 'custom',
        message: 'required',
        path: ['unit'],
      });
    }
  });

export const updateItemInputSchema = z.object({
  ...writeTokenSchema.shape,
  id: z.coerce.number().int(),
  ...foodItemFieldsSchema.shape,
});

export const updatePreferencesInputSchema = z.object({
  ...writeTokenSchema.shape,
  ...preferencesSchema.shape,
});

export const addConsumptionInputSchema = z.object({
  ...writeTokenSchema.shape,
  itemId: z.coerce.number().int(),
  amount: z.coerce.number().int().min(1),
  unit: referenceUnitSchema,
});
