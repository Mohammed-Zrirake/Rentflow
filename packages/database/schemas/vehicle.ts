import { z } from "zod";
import { VehicleStatus } from "@prisma/client";

export const VehicleFormSchema = z.object({
  make: z.string().min(1, { message: "La marque est requise." }),
  model: z.string().min(1, { message: "Le modèle est requis." }),
  year: z.coerce
    .number()
    .int({ message: "L'année doit être un nombre entier valide." }) 
    .min(1980, { message: "L'année doit être après 1980." })
    .max(new Date().getFullYear() + 1, { message: "L'année est invalide." }),

  licensePlate: z
    .string()
    .min(1, { message: "La plaque d'immatriculation est requise." }),
  vin: z.string().optional(),

  dailyRate: z.coerce
    .number() 
    .positive({ message: "Le tarif journalier doit être un nombre positif." }), 

  status: z.nativeEnum(VehicleStatus),

  mileage: z.coerce
    .number() // 
    .int({ message: "Le kilométrage doit être un nombre entier valide." }) 
    .min(0, { message: "Le kilométrage ne peut pas être négatif." }),

  insuranceExpiryDate: z.coerce.date().optional().nullable(),
  technicalInspectionExpiryDate: z.coerce.date().optional().nullable(),
  trafficLicenseExpiryDate: z.coerce.date().optional().nullable(),


  nextOilChangeMileage: z.coerce
    .number() 
    .int({ message: "Le kilométrage doit être un nombre entier valide." })
    .positive()
    .optional()
    .nullable(),

  images: z.any().optional(),
});

export type VehicleFormValues = z.infer<typeof VehicleFormSchema>;
