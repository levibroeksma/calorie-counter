import { z } from 'astro/zod';

export const referenceUnitSchema = z.enum(['g', 'ml']);

export const macrosSchema = z.object({
  calories: z.number().min(0),
  protein: z.number().min(0),
  fibres: z.number().min(0).optional(),
  fats: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
});

export const foodItemFieldsSchema = z.object({
  name: z.string().min(1),
  referenceAmount: z.number().int().min(1),
  referenceUnit: referenceUnitSchema,
  macros: macrosSchema,
});

export const writeTokenSchema = z.object({
  writeToken: z.string().min(1),
});

export const preferencesSchema = z.object({
  targetCalories: z.number().min(0),
  targetProtein: z.number().min(0),
  targetFibres: z.number().min(0),
  targetFats: z.number().min(0),
  targetCarbs: z.number().min(0),
});

export const createItemInputSchema = z
  .object({
    ...writeTokenSchema.shape,
    ...foodItemFieldsSchema.shape,
    logToToday: z.boolean().optional().default(false),
    amount: z.number().int().min(1).optional(),
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
  id: z.number().int(),
  ...foodItemFieldsSchema.shape,
});

export const updatePreferencesInputSchema = z.object({
  ...writeTokenSchema.shape,
  ...preferencesSchema.shape,
});

export const addConsumptionInputSchema = z.object({
  ...writeTokenSchema.shape,
  itemId: z.number().int(),
  amount: z.number().int().min(1),
  unit: referenceUnitSchema,
});
