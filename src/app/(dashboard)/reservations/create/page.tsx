"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Typography, Button, Space, Row, Divider, Form, Skeleton, Drawer } from "antd";
import Link from "next/link";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

import type { Client, Vehicle } from "@rentflow/database";

type NewClientData = Client;
const { Title, Text } = Typography;
const ReservationForm = dynamic(() => import("../ReservationForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 20 }} />,
  ssr: false,
});
const CreateClientInDrawer = dynamic(() => import("../../reservations/create/createClientInDrawer"), {
  loading: () => <Skeleton active paragraph={{ rows: 15 }} />,
  ssr: false,
});

export default function CreateReservationPage() {
const [form] = Form.useForm();
const router = useRouter();
 const [clients, setClients] = useState<Client[]>([]);
 const [loadingClients, setLoadingClients] = useState(true);
 const [vehicles, setVehicles] = useState<Vehicle[]>([]);
 const [loadingVehicles, setLoadingVehicles] = useState(true);
 const [isClientDrawerVisible, setIsClientDrawerVisible] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const handleClientCreated = (newClient: NewClientData) => {
     toast.success(
     `Client "${newClient.firstName} ${newClient.lastName}" créé avec succès !`)
    setClients(prevClients => [...prevClients, newClient]);
    form.setFieldsValue({ clientId: newClient.id });
    setIsClientDrawerVisible(false);
  };
  const handleFormChange = (changedValues: any, allValues: any) => {
  const { startDate, nombre_jours, tarif_journalier} = allValues;
   let { montant } = allValues;

    if (
      changedValues.hasOwnProperty("startDate") ||
      changedValues.hasOwnProperty("nombre_jours")
    ) {
      if (startDate && nombre_jours > 0) {
        const dateFin = dayjs(startDate).add(nombre_jours, "day");
        form.setFieldsValue({ endDate: dateFin });
      } else {
        form.setFieldsValue({ endDate: undefined });
      }
    }

    let coutTotal = form.getFieldValue("cout_total") || 0;
    if (
      changedValues.hasOwnProperty("nombre_jours") ||
      changedValues.hasOwnProperty("tarif_journalier")
    ) {
      if (nombre_jours > 0 && tarif_journalier > 0) {
        coutTotal = nombre_jours * tarif_journalier;
        form.setFieldsValue({ cout_total: coutTotal });
      } else {
        form.setFieldsValue({ cout_total: 0 });
        coutTotal = 0;
      }
    }

     if (montant > coutTotal) {
       montant = coutTotal; 
       form.setFieldsValue({ montant: coutTotal });
     }
    const reste = Math.max(coutTotal - (montant || 0), 0);
    form.setFieldsValue({ reste: reste });
  };

  
  const onFinish = async (values: any) => {
      setIsSubmitting(true);
      try {
        const reservationDto = {
          clientId: values.clientId,
          vehicleId: values.vehicleId,
          startDate: values.startDate
            ? dayjs(values.startDate).toISOString()
            : null,
          endDate: values.endDate ? dayjs(values.endDate).toISOString() : null,
          estimatedCost: Number(values.cout_total || 0),
          notes: values.notes || null, 
        };
        const payments = [];
        if (values.montant > 0 && values.paymentMethod) {
          payments.push({
            amount: Number(values.montant),
            method: values.paymentMethod,
          });
        }
        const finalPayload = {
          ...reservationDto,
          payments: payments,
        };
        if (!finalPayload.clientId) {
          toast.error("Veuillez sélectionner un client.");
          setIsSubmitting(false);
          return;
        }
        if (!finalPayload.vehicleId) {
          toast.error("Veuillez sélectionner un véhicule.");
          setIsSubmitting(false);
          return;
        }
        await api.post("/reservations", finalPayload);
        toast.success("Réservation créée avec succès !");
        router.push("/reservations");
      } catch (error) {
        console.error("Failed to create reservation:", error);
        const errorMessage =
          (error as any).response?.data?.message || "Une erreur est survenue.";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    };
   useEffect(() => {
     const fetchInitialData = async () => {
       try {
         setLoadingClients(true);
         setLoadingVehicles(true);
         const [clientsResponse, vehiclesResponse] = await Promise.all([
           api.get<Client[]>("/clients"),
           api.get<Vehicle[]>("/vehicles/status/AVAILABLE"),
         ]);
         setClients(clientsResponse.data);
         setVehicles(vehiclesResponse.data);
       } catch (error) {
         console.error("Failed to fetch initial data:", error);
         toast.error("Impossible de charger les clients et les véhicules.");
       } finally {
         setLoadingClients(false);
         setLoadingVehicles(false);
       }
     };
     fetchInitialData();
   }, []);

  return (
    <>
      <div style={{ padding: "24px", width: "100%" }}>
        <Form
          form={form}
          onFinish={onFinish}
          onValuesChange={handleFormChange} 
          layout="vertical"
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={2} style={{ color: "#1677ff", marginBottom: 0 }}>
              Nouvelle réservation
            </Title>
            <Text type="secondary">
              Remplissez les informations pour créer une nouvelle réservation
            </Text>
            <Divider style={{ margin: "16px 0" }} />

            <ReservationForm
              form={form}
              clients={clients}
              loadingClients={loadingClients}
              vehicles={vehicles}
              loadingVehicles={loadingVehicles}
              onOpenClientDrawer={() => setIsClientDrawerVisible(true)}
            />

            <Row justify="end">
              <Space>
                <Link href="/reservations" passHref>
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
                  onClick={() => form.submit()}
                  size="large"
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
        </Form>{" "}
      </div>

      <style jsx global>{`
        .hover-scale {
          transition: all 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
        .hover-underline:hover {
          text-decoration: underline;
          text-underline-offset: 4px;
        }
      `}</style>

      <Drawer
        title="Nouveau client"
        width={720}
        onClose={() => setIsClientDrawerVisible(false)}
        open={isClientDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
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
