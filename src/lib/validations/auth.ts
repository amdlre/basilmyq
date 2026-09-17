import { z } from "zod";

/** Shared by the login form and the login Server Action — one source of truth. */
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
