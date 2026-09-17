import { z } from "zod";

/** Shared by the contact form and the Server Action that stores the message. */
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(5000),
  /**
   * Honeypot. Hidden from real users, so anything in it is a bot. Kept in the
   * schema rather than checked ad hoc, so the field cannot be forgotten.
   */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
