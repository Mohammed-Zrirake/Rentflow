import { z } from "zod";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const AgencySettingsFormSchema = z.object({
  nom: z.string().min(1, { message: "Le nom de l'entreprise est requis." }),
  address: z.string().min(1, { message: "L'adresse est requise." }),
  ville: z.string().min(1, { message: "La ville est requise." }),
  code_postal: z.string().optional(),
  telephone: z.string().min(10, {
    message: "Le numéro de téléphone est requis et doit être valide.",
  }),
  email: z
    .string()
    .min(1, { message: "L'email est requis." })
    .email({ message: "Veuillez entrer une adresse email valide." }),

  // --- Legal Info (Kept as optional) ---
  ice: z.string().optional(),
  rc: z.string().optional(),
  patente: z.string().optional(),
  if: z.string().optional(),
  cnss: z.string().optional(),

  // --- Reminder Settings (UPDATED) ---
  rappel_assurance: z.coerce
    .number()
    .int()
    .positive({ message: "Doit être un nombre positif." }),
  rappel_controle: z.coerce
    .number()
    .int()
    .positive({ message: "Doit être un nombre positif." }),
  rappel_circulation: z.coerce
    .number()
    .int()
    .positive({ message: "Doit être un nombre positif." }),
  rappel_arrivee_client: z.coerce
    .number()
    .int()
    .positive({ message: "Doit être un nombre positif." }),
  rappel_reservation: z.coerce
    .number()
    .int()
    .positive({ message: "Doit être un nombre positif." }),
  rappel_vidange: z.coerce
    .number()
    .int()
    .positive({ message: "Doit être un nombre positif." }),

  logo: z
    .instanceof(File, { message: "Veuillez télécharger un logo." })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `La taille maximale est de 5MB.`
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      ".jpg, .jpeg, .png et .webp sont les formats supportés."
    )
    .optional(), 

  tampon: z
    .instanceof(File, { message: "Veuillez télécharger un tampon." })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `La taille maximale est de 5MB.`
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      ".jpg, .jpeg, .png et .webp sont les formats supportés."
    )
    .optional(),
});


export type AgencySettingsFormValues = z.infer<typeof AgencySettingsFormSchema>;
