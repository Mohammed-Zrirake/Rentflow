import { z } from 'zod';

// This schema validates the RAW data coming from the frontend form
// It uses the same names (nom, ville, etc.) and coerces numbers from strings.
export const apiAgencySettingsValidator = z.object({
  nom: z.string().min(1),
  address: z.string().min(1),
  ville: z.string().min(1),
  code_postal: z.string().optional(),
  telephone: z.string().min(10),
  email: z.string().email(),
  ice: z.string().optional(),
  rc: z.string().optional(),
  patente: z.string().optional(),
  if: z.string().optional(),
  cnss: z.string().optional(),
  rappel_assurance: z.coerce.number().int().positive(),
  rappel_controle: z.coerce.number().int().positive(),
  rappel_circulation: z.coerce.number().int().positive(),
  rappel_reservation: z.coerce.number().int().positive(),
  rappel_arrivee_client: z.coerce.number().int().positive(),
  rappel_vidange: z.coerce.number().int().positive(),
});

// We infer the type from this validator
export type RawAgencySettingsDto = z.infer<typeof apiAgencySettingsValidator>;
