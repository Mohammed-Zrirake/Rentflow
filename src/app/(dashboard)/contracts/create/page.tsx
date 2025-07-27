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
   const [vehicles, setVehicles] = useState<Vehicle[]>([]); 
   const [loading, setLoading] = useState(true);
   const [isClientDrawerVisible, setIsClientDrawerVisible] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => {
     const fetchInitialData = async () => {
       setLoading(true);
       try {
         // On récupère toujours la liste de tous les clients
         const clientsResponse = await api.get<Client[]>("/clients");
         setClients(clientsResponse.data);

         if (reservationId) {
           // Cas 1: On vient d'une réservation, on récupère ses détails
           const reservationResponse = await api.get<
             Reservation & { client: Client; vehicle: Vehicle }
           >(`/reservations/${reservationId}`);
           const reservation = reservationResponse.data;

           form.setFieldsValue({
             reservationId: reservation.id,
             clientId: reservation.clientId,
             vehicleId: reservation.vehicleId,
             // On peut aussi pré-remplir le kilométrage actuel du véhicule
             pickupMileage: reservation.vehicle.mileage,
           });
         } else {
           // Cas 2: Création d'un contrat direct, on a besoin des véhicules disponibles
           const vehiclesResponse = await api.get<Vehicle[]>(
             "/vehicles/status/AVAILABLE"
           );
           setVehicles(vehiclesResponse.data);
         }
       } catch (error) {
         toast.error("Impossible de charger les données nécessaires.");
         console.error(error);
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
       const { startDate, durationDays, dailyRate } = allValues;
       let { amountPaid } = allValues;

       if (
         changedValues.hasOwnProperty("startDate") ||
         changedValues.hasOwnProperty("durationDays")
       ) {
         if (startDate && durationDays > 0) {
           form.setFieldsValue({
             endDate: dayjs(startDate).add(durationDays, "day"),
           });
         } else {
           form.setFieldsValue({ endDate: undefined });
         }
       }

       let totalCost = form.getFieldValue("totalCost") || 0;
       if (
         changedValues.hasOwnProperty("durationDays") ||
         changedValues.hasOwnProperty("dailyRate")
       ) {
         if (durationDays > 0 && dailyRate > 0) {
           totalCost = durationDays * dailyRate;
           form.setFieldsValue({ totalCost: totalCost });
         } else {
           totalCost = 0;
           form.setFieldsValue({ totalCost: 0 });
         }
       }

       if (amountPaid > totalCost) {
         amountPaid = totalCost;
         form.setFieldsValue({ amountPaid: totalCost });
       }

       const remainingAmount = Math.max(totalCost - (amountPaid || 0), 0);
       form.setFieldsValue({ remainingAmount: remainingAmount });
    };
   const onFinish = async (values: any) => {
   setIsSubmitting(true);
   
     const payload = {
     
       reservationId: values.reservationId,
       clientId: values.clientId,
       vehicleId: values.vehicleId,
       secondaryDriverId: values.secondaryDriverId,

       
       startDate: dayjs(values.startDate).toISOString(),
       endDate: dayjs(values.endDate).toISOString(),
       dailyRate: values.dailyRate,
       totalCost: values.totalCost,

     
       pickupMileage: values.pickupMileage,
       pickupFuelLevel: values.pickupFuelLevel,
       pickupNotes: values.pickupNotes,

       payments:
         values.amountPaid > 0 && values.paymentMethod
           ? [
               {
                 amount: values.amountPaid,
                 method: values.paymentMethod,
               },
             ]
           : [],
     };

   try {
     await api.post("/contracts", payload);
     toast.success("Contrat créé avec succès !");
     router.push("/contracts");
   } catch (error) {
     console.error(error);
     toast.error(
       (error as any).response?.data?.message ||
         "Erreur lors de la création du contrat."
     );
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
        width={720}
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
