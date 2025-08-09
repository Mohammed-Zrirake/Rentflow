// In: packages/database/schemas/clients.ts

import { z } from "zod";
import { Gender } from "@prisma/client";


const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];



const fileSchema = z.any()
  .refine((files) => files?.[0] ? files[0].size <= MAX_FILE_SIZE : true, { message: "La taille maximale est de 5MB." })
  .refine((files) => files?.[0] ? ACCEPTED_IMAGE_TYPES.includes(files[0].type) : true, { message: ".jpg, .jpeg, .png et .webp sont les formats supportés." })
  .optional();

export const ClientFormSchema = z.object({
  firstName: z.string().min(1, { message: "Le prénom est requis." }),
  lastName: z.string().min(1, { message: "Le nom de famille est requis." }),
  phone: z
    .string()
    .min(10, { message: "Le numéro de téléphone doit être valide." }),
  email: z
    .string()
    .email({ message: "L'adresse email est invalide." })
    .optional()
    .or(z.literal("")),

  driverLicense: z
    .string()
    .min(1, { message: "Le numéro de permis de conduire est requis." }),
  cin: z
    .string()
    .min(1, { message: "Le numéro de CIN ou passeport est requis." }),

  address: z.string().optional(),
  nationality: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),

  identityDocumentUrl: fileSchema,
  idCardUrlFront: fileSchema,
  idCardUrlBack: fileSchema,
  driverLicenseUrlFront: fileSchema,
  driverLicenseUrlBack: fileSchema,
  passportUrlFront: fileSchema,
  passportUrlBack: fileSchema,
});

export type ClientFormValues = z.infer<typeof ClientFormSchema>;