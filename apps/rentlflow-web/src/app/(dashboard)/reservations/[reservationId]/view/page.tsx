"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Card,
  Tag,
  Select,
  Descriptions,
  Dropdown,
  Skeleton,
  Alert,
  Input,
  Progress, // Keep Skeleton for loading states
} from "antd";
import type { MenuProps } from "antd/es/menu";
import {
  UserOutlined,
  CarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  EditOutlined,
  FileAddOutlined,
  MoreOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import api from "@/lib/api";
import { Reservation, Client, Vehicle, Payment, PaymentMethod, ReservationStatus } from "@rentflow/database";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ReservationPaymentsTable = dynamic(
  () => import("../../ReservationPaymentsTable"), // Adjust path if needed
  {
    loading: () => <Skeleton active paragraph={{ rows: 3 }} />,
    ssr: false,
  }
);

const { Title, Text } = Typography;


// --- Types et Fonctions Helper ---
type FullReservationData = Reservation & {
  client: Client;
  vehicle: Vehicle;
  payments: Payment[];
};

const translatePaymentMethod = (method: PaymentMethod): string => {
  switch (method) {
    case 'CASH': return 'Espèces';
    case 'CARD': return 'Carte bancaire';
    case 'BANK_TRANSFER': return 'Virement';
    case 'CHECK': return 'Chèque';
    default: return method;
  }
};
const mapStatusToFrench = (status: ReservationStatus): "En attente" | "Confirmé" | "Annulé" | "Terminé" => {
  switch (status) {
    case 'PENDING': return 'En attente';
    case 'CONFIRMED': return 'Confirmé';
    case 'CANCELLED': return 'Annulé';
    case 'COMPLETED': return 'Terminé';
    default: return 'En attente';
  }
};
const getStatusColor = (status: ReservationStatus) => {
  switch(status) {
    case 'PENDING': return 'orange';
    case 'CONFIRMED': return 'green';
    case 'CANCELLED': return 'red';
    case 'COMPLETED': return 'default';
    default: return 'default';
  }
};

// --- COMPOSANT PRINCIPAL ---
export default function ViewReservationPage({ params }: { params: { reservationId: string } }) {
  const router = useRouter();
  const [reservation, setReservation] = useState<FullReservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservation = async () => {
    setLoading(true);
    try {
      const response = await api.get<FullReservationData>(`/reservations/${params.reservationId}`);
      setReservation(response.data);
    } catch (err) {
      setError("Impossible de charger les données de la réservation.");
      toast.error("Échec du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [params.reservationId]);

  const handleCancel = async () => {
    if (!reservation) return;
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Voulez-vous vraiment annuler cette réservation ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non'
    });
    if (result.isConfirmed) {
      try {
        await api.patch(`/reservations/${reservation.id}/cancel`);
        toast.success("Réservation annulée avec succès !");
        fetchReservation(); 
      } catch (err) {
        toast.error((err as any).response?.data?.message || "Erreur lors de l'annulation.");
      }
    }
  };

  if (loading) return <div style={{ padding: 24 }}><Card><Skeleton active paragraph={{ rows: 15 }} /></Card></div>;
  if (error) return <div style={{ padding: 24 }}><Alert message="Erreur" description={error} type="error" showIcon /></div>;
  if (!reservation) return <div style={{ padding: 24 }}><Alert message="Réservation non trouvée" type="warning" showIcon /></div>;

  const totalAmount = Number(reservation.estimatedCost);
  const durationDays = dayjs(reservation.endDate).diff(dayjs(reservation.startDate), 'day');
  const dailyRate = durationDays > 0 ? totalAmount / durationDays : 0;
    const paidAmount = reservation.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const remainingAmount = totalAmount - paidAmount;
    const paymentPercentage =
      totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;


  const canBeEdited = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';
  const canCreateContract = reservation.status === 'CONFIRMED';
  const canBeCancelled = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';

  const moreActionsMenu: MenuProps = {
    items: [
      { key: "1", label: "Télécharger la fiche de reservation", icon: <DownloadOutlined /> },
      ...(canBeCancelled ? [
        { type: 'divider' as const },
        { key: "2", label: "Annuler ", icon: <DeleteOutlined />, danger: true, onClick: handleCancel }
      ] : [])
    ]
  };

  return (
    <div style={{ padding: "24px", width: "100%" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center">
                <Title level={2} style={{ margin: 0, color: "#1677ff" }}>
                  #{reservation.id.slice(-6).toUpperCase()}
                </Title>
                <Tag
                  color={getStatusColor(reservation.status)}
                  style={{
                    fontWeight: 500,
                    fontSize: "14px",
                    padding: "4px 8px",
                  }}
                >
                  {reservation.status}
                </Tag>
              </Space>
            </Col>
            <Col>
              <Space>
                {canBeEdited && (
                  <Link
                    href={`/reservations/${params.reservationId}/edit`}
                    passHref
                  >
                    <Button
                      icon={<EditOutlined />}
                      style={{
                        borderRadius: "8px",
                        fontWeight: 500,
                      }}
                      size="large"
                    >
                      Modifier
                    </Button>
                  </Link>
                )}
                {canCreateContract && (
                  <Link
                    href={`/contracts/create?reservationId=${reservation.id}`}
                    passHref
                  >
                    <Button
                      icon={<FileAddOutlined />}
                      size="large"
                      type="primary"
                      style={{ borderRadius: "8px" }}
                    >
                      Nouveau contrat
                    </Button>
                  </Link>
                )}
                <Dropdown menu={moreActionsMenu} trigger={["click"]}>
                  <Button
                    icon={<MoreOutlined />}
                    style={{
                      borderRadius: "8px",
                      fontWeight: 500,
                    }}
                    size="large"
                  >
                    Actions
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card
          title="État du paiement"
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Progress
              percent={paymentPercentage}
              status={paymentPercentage >= 100 ? "success" : "active"}
              strokeColor={paymentPercentage >= 100 ? "#52c41a" : "#1677ff"}
            />
            <Row justify="space-between">
              <Col>
                <Text strong>Payé:</Text> {paidAmount.toFixed(2)} MAD
              </Col>
              <Col>
                <Text strong>Reste:</Text> {remainingAmount.toFixed(2)} MAD
              </Col>
              <Col>
                <Text strong>Total:</Text> {totalAmount.toFixed(2)} MAD
              </Col>
            </Row>
          </Space>
        </Card>

        {/* Informations Client */}
        <Card
          title={
            <Space>
              <UserOutlined /> Informations client
            </Space>
          }
          headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          style={{ borderRadius: "12px", border: "1px solid #f0f0f0" }}
        >
          <Input
            value={`${reservation.client.firstName} ${reservation.client.lastName} (${reservation.client.driverLicense})`}
            size="large"
            disabled
          />
        </Card>

        {/* Véhicule */}
        <Card
          title={
            <Space>
              <CarOutlined /> Véhicule
            </Space>
          }
          headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          style={{ borderRadius: "12px", border: "1px solid #f0f0f0" }}
        >
          <Input
            value={`${reservation.vehicle.make} ${reservation.vehicle.model} (${reservation.vehicle.licensePlate})`}
            size="large"
            disabled
          />
        </Card>

        {/* Périodes & tarifs */}
        <Card
          title={
            <Space>
              <CalendarOutlined style={{ color: "#1677ff" }} />
              <Text strong style={{ color: "#1677ff" }}>
                Périodes & tarifs de location
              </Text>
            </Space>
          }
          headStyle={{
            borderBottom: "1px solid #f0f0f0",
          }}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Descriptions
            bordered
            layout="horizontal"
            column={{ xs: 1, sm: 2, md: 3 }}
            size="middle"
          >
            <Descriptions.Item label={<Text strong>Date de début</Text>}>
              <Text>
                {dayjs(reservation.startDate).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Nombre de jours</Text>}>
              <Text>{durationDays} Jours</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Date de fin</Text>}>
              <Text>
                {dayjs(reservation.endDate).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Tarif journalier</Text>}>
              <Text>{dailyRate.toFixed(2)} MAD</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Coût total</Text>} span={2}>
              <Text strong style={{ fontSize: "16px", color: "#1677ff" }}>
                {totalAmount.toFixed(2)} MAD
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Liste des paiements */}

        <Card
          title={
            <Space>
              <CreditCardOutlined style={{ color: "#1677ff" }} />
              <Text strong style={{ color: "#1677ff" }}>
                Liste des paiements
              </Text>
            </Space>
          }
          headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f0f0f0",
          }}
        >
          <ReservationPaymentsTable
            payments={reservation.payments.map((p) => ({
              key: p.id,
              amount: Number(p.amount).toFixed(2),
              date: dayjs(p.paymentDate).format("DD/MM/YYYY HH:mm"),
              method: translatePaymentMethod(p.method),
            }))}
          />
        </Card>
      </Space>

      <style jsx global>{`
        .ant-descriptions-bordered .ant-descriptions-item-label {
          background-color: #fafafa;
        }
        .ant-descriptions-bordered .ant-descriptions-view {
          border-radius: 8px;
        }
        .ant-table {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
