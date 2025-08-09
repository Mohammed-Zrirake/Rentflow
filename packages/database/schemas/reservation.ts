import { z } from "zod";
import { PaymentMethod, ReservationStatus } from "@prisma/client"; 
import dayjs from "dayjs"; 

export const ReservationFormSchema = z
  .object({
    clientId: z
      .string()
      .min(1, { message: "Veuillez sélectionner un client." }),
    vehicleId: z
      .string()
      .min(1, { message: "Veuillez sélectionner un véhicule." }),

    startDate: z.custom<dayjs.Dayjs>(
      (val) => dayjs.isDayjs(val) && val.isValid(),
      { message: "La date de début est requise." }
    ),

    endDate: z
      .custom<dayjs.Dayjs>((val) => dayjs.isDayjs(val) && val.isValid())
      .optional(),

    dailyRate: z.coerce.number().positive({
      message: "Le tarif journalier doit être un nombre positif.",
    }),

    cout_total: z.coerce.number().optional(),
    nombre_jours: z.coerce
      .number()
      .min(1, { message: "Le nombre de jours doit être d'au moins 1." })
      .optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    montant: z.coerce.number().optional(),
    reste: z.coerce.number().optional(),

    status: z.nativeEnum(ReservationStatus).optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.montant && data.montant > 0) {
        return !!data.paymentMethod;
      }
      return true;
    },
    {
      message: "Veuillez sélectionner une méthode de paiement.",
      path: ["paymentMethod"],
    }
  );

export type ReservationFormValues = z.infer<typeof ReservationFormSchema>;
