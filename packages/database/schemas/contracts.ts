import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const ContractFormSchema = z.object({
  reservationId: z.string().optional(),
  clientId: z
    .string()
    .min(1, { message: "Veuillez sélectionner un client principal." }),
  secondaryDriverId: z.string().nullable().optional(),

  vehicleId: z
    .string()
    .min(1, { message: "Veuillez sélectionner un véhicule." }),
  pickupMileage: z.coerce
    .number()
    .min(0, { message: "Le kilométrage doit être positif." }),
  returnMileage: z.coerce.number().min(0).optional(),
  returnFuelLevel: z.coerce.number().min(0).max(100).optional(),

  initialPaymentAmount: z.coerce.number().optional(),
  initialPaymentMethod: z.nativeEnum(PaymentMethod).optional(),
   remainingAmount: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.initialPaymentAmount && data.initialPaymentAmount > 0) {
        return !!data.initialPaymentMethod;
      }
      return true;
    },
    {
      message: "Veuillez sélectionner une méthode de paiement.",
      path: ["initialPaymentMethod"], 
    }
  )
  .refine(
  (data) => {
    if (data.secondaryDriverId) {
      return data.clientId !== data.secondaryDriverId;
    }
    return true; 
  },
  {
    message: "Le conducteur secondaire ne peut pas être le même que le conducteur principal.",
    path: ["secondaryDriverId"], 
  }
);

export type ContractFormValues = z.infer<typeof ContractFormSchema>;
