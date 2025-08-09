import { z } from "zod";
import { UserStatus } from "@prisma/client";


export const UserFormSchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis." }),
  email: z
    .string()
    .min(1, { message: "L'email est requis." })
    .email({ message: "Veuillez entrer une adresse email valide." }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit faire au moins 8 caractères." })
    .optional()
    .or(z.literal("")), 
  status: z.nativeEnum(UserStatus),
});


export type UserFormValues = z.infer<typeof UserFormSchema>;
