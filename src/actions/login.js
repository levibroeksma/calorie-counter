import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import {
  isAppPasswordValid,
  WRITE_TOKEN,
} from '../lib/auth/password.server.js';

export const login = defineAction({
  input: z.object({
    password: z.string(),
  }),
  handler: async ({ password }) => {
    if (!isAppPasswordValid(password)) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: 'invalid_password',
      });
    }

    return {
      success: true,
      writeToken: WRITE_TOKEN,
    };
  },
});
