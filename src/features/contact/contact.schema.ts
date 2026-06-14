import { z } from "zod";

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  companyName: z.string().max(160).optional().or(z.literal("")),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(2000, "El mensaje no puede superar los 2000 caracteres"),
  source: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
