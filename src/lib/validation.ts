import { z } from "zod";

export const itemSchema = z.object({
  birthdate: z.coerce.date()
    .min(new Date('1900-01-01'), 'Date must be after 1900')
    .max(new Date(), 'Date cannot be in the future'),
  first_name: z.string(),
  last_name: z.string(),
  t_number: z.string(),
  gender: z.string(),
  o_r_status: z.string().default("false"),
  house_number: z.string().default("0"),
  community: z.string(),
  contact_number: z.string(),
  option: z.string().default("none"),
  email: z.string().email()
});

export const userSchema = z.object({
  fist_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email(),
  department: z.string().default("admin")
});

