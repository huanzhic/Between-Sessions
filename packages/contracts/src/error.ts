import { z } from "zod";

// Messages must stay generic: never echo reflection, letter or model content.
export const ApiError = z.strictObject({
  error: z.strictObject({
    code: z.string().min(1),
    message: z.string().min(1),
    requestId: z.string().min(1),
  }),
});

export type ApiError = z.infer<typeof ApiError>;
