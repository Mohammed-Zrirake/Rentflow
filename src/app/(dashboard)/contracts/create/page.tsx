// app/(dashboard)/contracts/create/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Form, Typography, Divider, Skeleton, Button, Drawer, Row, Space } from "antd";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Client, Reservation, Vehicle } from "@rentflow/database";
import api from "@/lib/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { a } from "node_modules/framer-motion/dist/types.d-Bq-Qm38R";
import { all } from "axios";

type VehicleWithAvailability = Vehicle & {
  engagements: { startDate: string; endDate: string }[];
};

const { Title, Text } = Typography;

const ContractForm = dynamic(() => import("../ContractsForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 20 }} />,
  ssr: false,
});
const CreateClientInDrawer = dynamic(
  () => import("../../reservations/create/createClientInDrawer"),
  {
    loading: () => <Skeleton active paragraph={{ rows: 15 }} />,
    ssr: false,
  }
);


export default function CreateContractPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("reservationId");

   const [clients, setClients] = useState<Client[]>([]);
   const [vehicles, setVehicles] = useState<VehicleWithAvailability[]>([]);
   const [selectedVehicle, setSelectedVehicle] =
      useState<VehicleWithAvailability | null>(null);
   const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]); 
   const [loading, setLoading] = useState(true);
   const [isClientDrawerVisible, setIsClientDrawerVisible] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
    const [reservationData, setReservationData] = useState<
      (Reservation & { client: Client; vehicle: Vehicle }) | null
    >(null);

     useEffect(() => {
       const fetchInitialData = async () => {
         setLoading(true);
         try {
           const [clientsRes, vehiclesRes] = await Promise.all([
             api.get<Client[]>("/clients"),
             api.get<VehicleWithAvailability[]>("/vehicles"),
           ]);
           setClients(clientsRes.data);
           setVehicles(vehiclesRes.data);

           if (reservationId) {
             const res = await api.get<Reservation & { vehicle: Vehicle }>(
               `/reservations/${reservationId}`
             );
             const reservation = res.data;
             form.setFieldsValue({
               reservationId: reservation.id,
               clientId: reservation.clientId,
               vehicleId: reservation.vehicleId,
               pickupMileage: reservation.vehicle.mileage,
             });
  setSelectedVehicle(
    vehiclesRes.data.find((v) => v.id === reservation.vehicleId) || null
  );
           }
         } catch (error) {
           toast.error("Impossible de charger les données nécessaires.");
         } finally {
           setLoading(false);
         }
       };
       fetchInitialData();
     }, [reservationId, form]);

   const handleClientCreated = (newClient: Client) => {
     toast.success(
       `Client "${newClient.firstName} ${newClient.lastName}" créé avec succès !`
     );
     setClients((prev) => [...prev, newClient]);
     setIsClientDrawerVisible(false);
     form.setFieldsValue({ secondaryDriverId: newClient.id });
   };
    const handleFormChange = (changedValues: any, allValues: any) => {
      // 1. Gérer le changement de véhicule
      if (changedValues.hasOwnProperty("vehicleId")) {
        const vehicle = vehicles.find((v) => v.id === changedValues.vehicleId);
        setSelectedVehicle(vehicle || null);
        if (vehicle) {
          // Réinitialiser les champs dépendants et pré-remplir le kilométrage
          form.setFieldsValue({
            pickupMileage: vehicle.mileage,
            startDate: undefined,
            durationDays: undefined,
            endDate: undefined,
            dailyRate: undefined,
            totalCost: undefined,
            amountPaid: undefined,
            remainingAmount: undefined,
          });
        }
        return;
      }

      // 2. Préparer les variables pour les calculs
      const { startDate, dailyRate } = allValues;
      let { durationDays, amountPaid } = allValues;

      // 3. Calculer la durée et la date de fin, avec auto-correction
      if (startDate && typeof durationDays === "number" && durationDays > 0) {
        // LOGIQUE D'AUTO-CORRECTION
        if (selectedVehicle && selectedVehicle.engagements.length > 0) {
          const nextEngagement = selectedVehicle.engagements
            .map((e) => ({ start: dayjs(e.startDate) }))
            .filter((e) => e.start.isAfter(startDate))
            .sort((a, b) => a.start.diff(b.start))[0];

          if (nextEngagement) {
            const maxDuration = nextEngagement.start.diff(startDate, "day");
            if (durationDays > maxDuration) {
              durationDays = maxDuration; // Corriger la variable
              form.setFieldsValue({ durationDays: maxDuration }); // Corriger l'UI
              toast.info(
                `La durée a été ajustée à ${maxDuration} jours pour ne pas chevaucher l'engagement suivant.`,
                { autoClose: 4000 }
              );
            }
          }
        }

        const endDate = dayjs(startDate).add(durationDays, "day");
        form.setFieldsValue({ endDate: endDate });
      } else {
        form.setFieldsValue({ endDate: undefined });
      }

      // 4. Calculer le coût total
      let totalCost = 0;
      if (durationDays > 0 && dailyRate > 0) {
        totalCost = durationDays * dailyRate;
        form.setFieldsValue({ totalCost: totalCost });
      } else {
        form.setFieldsValue({ totalCost: 0 });
      }

      // 5. Plafonner le montant payé et calculer le reste
      if (amountPaid > totalCost) {
        amountPaid = totalCost;
        form.setFieldsValue({ amountPaid: totalCost });
      }
      const remainingAmount = Math.max(totalCost - (amountPaid || 0), 0);
      form.setFieldsValue({ remainingAmount: remainingAmount });
    };


   const onFinish = async (values: any) => {
     setIsSubmitting(true);
     try {
       await form.validateFields();
       const allFormValues = form.getFieldsValue(true);
       const payload = {
         reservationId: allFormValues.reservationId,
         clientId: allFormValues.clientId,
         vehicleId: allFormValues.vehicleId,
         secondaryDriverId: allFormValues.secondaryDriverId,

         startDate: dayjs(allFormValues.startDate).toISOString(),
         endDate: dayjs(allFormValues.endDate).toISOString(),
         dailyRate: allFormValues.dailyRate,
         totalCost: allFormValues.totalCost,

         pickupMileage: allFormValues.pickupMileage,
         pickupFuelLevel: allFormValues.pickupFuelLevel,
         pickupNotes: allFormValues.pickupNotes,

         payments:
           values.amountPaid > 0 && allFormValues.paymentMethod
             ? [
                 {
                   amount: allFormValues.amountPaid,
                   method: allFormValues.paymentMethod,
                 },
               ]
             : [],
       };
       if (
         !payload.clientId ||
         !payload.vehicleId ||
         !payload.startDate ||
         !payload.endDate ||
         !payload.totalCost
       ) {
         toast.error("Veuillez remplir tous les champs obligatoires.");
         setIsSubmitting(false);
         return;
       }

       await api.post("/contracts", payload);
       toast.success("Contrat créé avec succès !");
       router.push("/contracts");
     } catch (error) {
       console.error("Erreur de soumission ou de validation:", error);
       if ((error as any).errorFields) {
         toast.error("Veuillez corriger les erreurs dans le formulaire.");
       } else {
         toast.error(
           (error as any).response?.data?.message ||
             "Erreur lors de la création du contrat."
         );
       }
     } finally {
       setIsSubmitting(false);
     }
   };


  return (
    <>
      <div style={{ padding: "24px" }}>
        <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={handleFormChange} >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={2} style={{ color: "#1677ff", marginBottom: 0 }}>
              Nouveau contrat
            </Title>
            <Text type="secondary">
              {reservationId
                ? `Création d'un contrat à partir de la réservation #${reservationId.slice(
                    -6
                  )}`
                : "Remplissez les informations pour créer un nouveau contrat"}
            </Text>
            <Divider style={{ margin: "16px 0" }} />

            {loading ? (
              <Skeleton active paragraph={{ rows: 20 }} />
            ) : (
              <ContractForm
                form={form}
                clients={clients}
                vehicles={vehicles}
                isFromReservation={!!reservationId}
                onOpenClientDrawer={() => setIsClientDrawerVisible(true)}
                selectedVehicle={selectedVehicle}
              />
            )}

            <Row justify="end" style={{ marginTop: 24 }}>
              <Space>
                <Link href="/contracts">
                  <Button
                    size="large"
                    style={{
                      width: "120px",
                      borderRadius: "8px",
                      fontWeight: 500,
                    }}
                  >
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={isSubmitting}
                  style={{
                    width: "160px",
                    borderRadius: "8px",
                    fontWeight: 500,
                    boxShadow: "0 2px 8px rgba(22, 119, 255, 0.3)",
                  }}
                  className="hover-scale"
                >
                  Enregistrer
                </Button>
              </Space>
            </Row>
          </Space>
        </Form>
      </div>

      <Drawer
        title="Nouveau client"
        width='60%'
        onClose={() => setIsClientDrawerVisible(false)}
        open={isClientDrawerVisible}
        destroyOnClose
      >
        <CreateClientInDrawer
          onClose={() => setIsClientDrawerVisible(false)}
          onClientCreated={handleClientCreated}
        />
      </Drawer>
    </>
  );
}
