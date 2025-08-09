"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Typography,
  Button,
  Space,
  Row,
  Card,
  Form,
  Tag,
  Skeleton,
  Alert,
  Drawer,
  Divider,
} from "antd";
import {
  CreditCardOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import dayjs from "dayjs";
import api from "@/lib/api";
import { Reservation, Payment, Client, Vehicle, PaymentMethod } from "@rentflow/database";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ReservationFormValues } from "@rentflow/database/schemas";

const { Title, Text } = Typography;


const ReservationForm = dynamic(() => import("../../ReservationForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 20 }} />,
  ssr: false,
});
const CreateClientInDrawer = dynamic(
  () => import("../../../reservations/create/createClientInDrawer"),
  {
    loading: () => <Skeleton active paragraph={{ rows: 15 }} />,
    ssr: false,
  }
);
const ReservationPaymentsTable = dynamic(
  () => import("../../ReservationPaymentsTable"),
  {
    loading: () => <Skeleton active paragraph={{ rows: 3 }} />,
    ssr: false,
  }
);

type VehicleWithAvailability = Vehicle & {
  engagements: { id: string; startDate: string; endDate: string }[];
};

type NewClientData = Client;
type FullReservation = Reservation & {
  payments: Payment[];
  client: Client;
  vehicle: Vehicle;
};

export default function EditReservationPage({
  params,
}: {
  params: { reservationId: string };
}) {
  const [form] = Form.useForm<ReservationFormValues>();
  const router = useRouter();
  const [reservation, setReservation] = useState<FullReservation | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<VehicleWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClientDrawerVisible, setIsClientDrawerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [selectedVehicle, setSelectedVehicle] =
       useState<VehicleWithAvailability | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resRes, clientsRes, vehiclesRes] = await Promise.all([
          api.get<FullReservation>(`/reservations/${params.reservationId}`),
          api.get<Client[]>("/clients"),
          api.get<VehicleWithAvailability[]>("/vehicles"),
        ]);

        setReservation(resRes.data);
        setClients(clientsRes.data);
        setVehicles(vehiclesRes.data);
        const currentVehicleWithEngagements = vehiclesRes.data.find(
             (v) => v.id === resRes.data.vehicleId
           );
           setSelectedVehicle(currentVehicleWithEngagements || null);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(
          "Impossible de charger les données de la réservation. Veuillez réessayer."
        );
        toast.error("Échec du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.reservationId]);

  useEffect(() => {
    if (reservation) {
      const startDate = dayjs(reservation.startDate);
      const endDate = dayjs(reservation.endDate);
      const nombre_jours = endDate.diff(startDate, "day");
      const dailyRate =
        nombre_jours > 0 ? Number(reservation.estimatedCost) / nombre_jours : 0;

      form.setFieldsValue({
        clientId: reservation.clientId,
        vehicleId: reservation.vehicleId,
        startDate: startDate,
        status: reservation.status,
        endDate: endDate,
        nombre_jours: nombre_jours,
        dailyRate: dailyRate,
        cout_total: Number(reservation.estimatedCost),
      });
    }
  }, [reservation, form]);

  const handleClientCreated = (newClient: NewClientData) => {
    toast.success(
      `Client "${newClient.firstName} ${newClient.lastName}" créé avec succès !`
    );
    setClients((prevClients) => [...prevClients, newClient]);
    form.setFieldsValue({ clientId: newClient.id });
    setIsClientDrawerVisible(false);
  };
 const handleFormChange = (changedValues: any, allValues: any) => {
   if (changedValues.hasOwnProperty("vehicleId")) {
     const vehicle = vehicles.find((v) => v.id === changedValues.vehicleId);
     setSelectedVehicle(vehicle || null);
     form.setFieldsValue({
       startDate: undefined,
       nombre_jours: undefined,
       endDate: undefined,
       dailyRate: undefined,
       cout_total: undefined,
       montant: undefined,
       reste: undefined,
     });
     return;
   }

   const { startDate, dailyRate } = allValues;
   let { nombre_jours, montant } = allValues;

   if (startDate && typeof nombre_jours === "number" && nombre_jours > 0) {
     if (selectedVehicle && selectedVehicle.engagements.length > 0) {

   const otherEngagements = selectedVehicle.engagements.filter(
     (e) => e.id !== params.reservationId
   );

       const nextEngagement = otherEngagements
         .map((e) => ({ start: dayjs(e.startDate) }))
         .filter((e) => e.start.isAfter(startDate))
         .sort((a, b) => a.start.diff(b.start))[0];

       if (nextEngagement) {
         const maxDuration = nextEngagement.start.diff(startDate, "day");

         if (nombre_jours > maxDuration) {
           nombre_jours = maxDuration;
           form.setFieldsValue({ nombre_jours: maxDuration });
           toast.info(
             `La durée a été ajustée à ${maxDuration} jours pour ne pas chevaucher l'engagement suivant.`,
             { autoClose: 4000 }
           );
         }
       }
     }

     const endDate = dayjs(startDate).add(nombre_jours, "day");
     form.setFieldsValue({ endDate: endDate });
   } else {
     form.setFieldsValue({ endDate: undefined });
   }

   let coutTotal = form.getFieldValue("cout_total") || 0;
   if (
     changedValues.hasOwnProperty("nombre_jours") ||
     changedValues.hasOwnProperty("dailyRate")
   ) {
     if (nombre_jours > 0 && dailyRate > 0) {
       coutTotal = nombre_jours * dailyRate;
       form.setFieldsValue({ cout_total: coutTotal });
     } else {
       coutTotal = 0;
       form.setFieldsValue({ cout_total: 0 });
     }
   }

   const totalAlreadyPaid = reservation
     ? reservation.payments.reduce((sum, p) => sum + Number(p.amount), 0)
     : 0;
   const remainingBalance = Math.max(0, coutTotal - totalAlreadyPaid);

   if (montant > remainingBalance) {
     montant = remainingBalance;
     form.setFieldsValue({ montant: remainingBalance });
   }

   const reste = Math.max(remainingBalance - (montant || 0), 0);
   form.setFieldsValue({ reste: reste });
 };




   const translatePaymentMethod = (method: PaymentMethod): string => {
  switch (method) {
    case "CASH":
      return "Espèces";
    case "CARD":
      return "Carte bancaire";
    case "BANK_TRANSFER":
      return "Virement";
    case "CHECK":
      return "Chèque";
    default:
      return method;
  }
  };
  const onFinish = async (values: ReservationFormValues) => {
    setIsSubmitting(true);
    try {
      const reservationData = {
        clientId: values.clientId,
        vehicleId: values.vehicleId,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate?.toISOString(),
        estimatedCost: values.cout_total,
        status:values.status,
      };

        const newPayments = [];
        if (values.montant && values.montant > 0 && values.paymentMethod) {
          newPayments.push({
            amount: Number(values.montant),
            method: values.paymentMethod,
          });
        }

         const payload = {
           ...reservationData,
           payments: newPayments, 
         };

      await api.patch(`/reservations/${params.reservationId}`, payload);
      toast.success("Réservation mise à jour avec succès !");
      router.push("/reservations");
    } catch (err) {
      console.error("Failed to update reservation:", err);
      toast.error(
        (err as any).response?.data?.message || "Une erreur est survenue."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return <Skeleton active paragraph={{ rows: 20 }} style={{ padding: 24 }} />;
  if (error)
    return (
      <Alert
        message="Erreur"
        description={error}
        type="error"
        showIcon
        style={{ margin: 24 }}
      />
    );
  if (!reservation)
    return (
      <Alert
        message="Réservation non trouvée"
        type="warning"
        showIcon
        style={{ margin: 24 }}
      />
    );
     const totalPaid = reservation.payments.reduce(
       (sum, p) => sum + Number(p.amount),
       0
     );
     const totalCost = Number(reservation.estimatedCost);
     const remainingAmount = totalCost - totalPaid;

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
            <Space
              align="center"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Title level={2} style={{ color: "#1677ff", margin: 0 }}>
                Modifier la réservation #
                {reservation.id.slice(-6).toUpperCase()}
              </Title>
              <Tag
                color="orange"
                style={{ fontWeight: 500, fontSize: 14, padding: "4px 8px" }}
              >
                {reservation.status}
              </Tag>
            </Space>
            <Text type="secondary">
              Mettez à jour les informations de la réservation.
            </Text>
            <Divider style={{ margin: "16px 0" }} />

            <ReservationForm
              form={form}
              clients={clients}
              loadingClients={loading}
              vehicles={vehicles}
              loadingVehicles={loading}
              onOpenClientDrawer={() => setIsClientDrawerVisible(true)}
              selectedVehicle={selectedVehicle}
              isEditMode={true}
            />
            <Card
              title={
                <Space>
                  <CreditCardOutlined style={{ color: "#1677ff" }} />
                  <Text strong style={{ color: "#1677ff" }}>
                    Paiements Enregistrés
                  </Text>
                  {remainingAmount > 0 && (
                    <Text type="danger">
                      (Reste à payer: {remainingAmount.toFixed(2)} MAD)
                    </Text>
                  )}
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                border: "1px solid #f0f0f0",
              }}
            >
              <ReservationPaymentsTable
                payments={reservation.payments.map((p) => ({
                  key: p.id,
                  amount: p.amount.toString(),
                  date: dayjs(p.paymentDate).format("DD/MM/YYYY HH:mm"),
                  method: translatePaymentMethod(p.method),
                }))}
              />
            </Card>

            <Row justify="end">
              <Space>
                <Link href="/reservations" passHref>
                  <Button size="large" icon={<ArrowLeftOutlined />}>
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  size="large"
                  icon={<SaveOutlined />}
                  loading={isSubmitting}
                  className="hover-scale"
                  style={{
                    width: "160px",
                    borderRadius: "8px",
                    fontWeight: 500,
                    boxShadow: "0 2px 8px rgba(22, 119, 255, 0.3)",
                  }}
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
        width="60%"
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