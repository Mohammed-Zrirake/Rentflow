"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Swal from "sweetalert2"; 
import type {
  Reservation,
  ReservationStatus,
  Prisma,
  PaymentMethod,
} from "@rentflow/database";
import api from "@/lib/api";
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Segmented,
  Card,
  Skeleton,
  Spin, 
  Modal,
  Divider
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import type { ReservationDataType } from "./ReservationsListTable"
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { Form, InputNumber, Select } from "antd"; 




type ApiReservation = Reservation & {
  client: { firstName: string; lastName: string };
  vehicle: { make: string; model: string };
  createdBy: { name: string | null };
  payments: { amount: Prisma.Decimal }[];
};
const mapStatusToFrench = (
  status: ReservationStatus
): "En attente" | "Annulé" | "Terminé" | "Confirmé" => {
  switch (status) {
    case "PENDING":
      return "En attente";
    case "CANCELLED":
      return "Annulé";
    case "COMPLETED":
      return "Terminé";
    case "CONFIRMED":
      return "Confirmé";
    default:
      return "En attente";
  }
};
const { Title, Text } = Typography;
const ReservationListTable = dynamic(
  () => import("./ReservationsListTable"),
  {
    loading: () => <Skeleton active paragraph={{ rows: 8 }} />, 
    ssr: false, 
  }
);
const mapApiReservationToTableData = (
  res: ApiReservation,
  currentUserId: string
): ReservationDataType => {
  const totalPaid = res.payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  return {
    key: res.id,
    clientName: `${res.client.firstName} ${res.client.lastName}`,
    vehicle: `${res.vehicle.make} ${res.vehicle.model}`,
    createdBy:
      res.createdById === currentUserId
        ? "Vous"
        : res.createdBy.name ?? "Inconnu",
    status: mapStatusToFrench(res.status),
    totalDays: dayjs(res.endDate).diff(dayjs(res.startDate), "day"),
    montantPaye: totalPaid,
    startDate: res.startDate.toString(),
    endDate: res.endDate.toString(),
  };
};

export default function ReservationsPage() {
   const [form] = Form.useForm();
   const { data: session } = useSession();
   const currentUserId = session?.user?.id;
   const [reservations, setReservations] = useState<ApiReservation[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const statusOptions = ["En attente", "Confirmé", "Terminé", "Annulé"];
   const [activeStatusFilter, setActiveStatusFilter] = useState<
     string | number
   >(statusOptions[0]);
 
   const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
   const [selectedReservationId, setSelectedReservationId] = useState<
     string | null
   >(null);

  const [isConfirming, setIsConfirming] = useState(false);

const [reservationToConfirm, setReservationToConfirm] =
    useState<ApiReservation | null>(null);

 const fetchReservations = async () => {
   setIsLoading(true);
   try {
     const response = await api.get<ApiReservation[]>("/reservations");
     setReservations(response.data);
   } catch (error) {
     console.error("Failed to fetch reservations:", error);
     toast.error("Echec du chargement des données des réservations");
   } finally {
     setIsLoading(false);
   }
 };
 const handleCancelReservation = (reservationId: string) => {
      Swal.fire({
        title: "Êtes-vous sûr ?",
        text: "Cette action est irréversible et annulera la réservation.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33", 
        cancelButtonColor: "#3085d6", 
        confirmButtonText: "Oui, annuler !",
        cancelButtonText: "Non, garder",
      }).then((result) => {
        if (result.isConfirmed) {
          const cancelRequest = async () => {
            try {
              await api.patch(`/reservations/${reservationId}/cancel`);
              fetchReservations(); 
              Swal.fire(
                "Annulée !",
                "La réservation a été annulée avec succès.",
                "success"
              );
            } catch (error) {
              console.error("Failed to cancel reservation:", error);
              const errorMessage =
                (error as any).response?.data?.message ||
                "Une erreur est survenue lors de l'annulation.";
              Swal.fire("Erreur !", errorMessage, "error");
            }
          };
          cancelRequest();
        }
      });
    };

    
    const handleOpenConfirmModal = (reservationId: string) => {
      const reservation = reservations.find((res) => res.id === reservationId);
      if (!reservation) {
        toast.error("Données de la réservation introuvables.");
        return;
      }
      const totalPaid = reservation.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      const totalCost = Number(reservation.estimatedCost);
      const remainingAmount = totalCost - totalPaid;

      // --- NOUVELLE LOGIQUE DE CONFIRMATION DIRECTE ---
      if (remainingAmount <= 0) {
        // Si le solde est nul ou négatif, la réservation est déjà payée.
        Swal.fire({
          title: "Déjà entièrement réglée",
          text: "Cette réservation est déjà payée. Voulez-vous la confirmer directement ?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Oui, confirmer",
          cancelButtonText: "Non",
        }).then((result) => {
          if (result.isConfirmed) {
            // On appelle directement la logique de soumission, sans ouvrir le modal
            // et sans envoyer de données de paiement.
            handleConfirmSubmit({});
          }
        });
        // On stocke l'ID au cas où l'utilisateur confirme
        setSelectedReservationId(reservationId);
        return; // On arrête ici pour ne pas ouvrir le modal.
      }

      // Si un solde reste à payer, on ouvre le modal comme avant
      setReservationToConfirm(reservation);
      setSelectedReservationId(reservationId); // Assurez-vous que l'ID est bien stocké
      setIsConfirmModalVisible(true);
      form.resetFields();
    };


 const handleConfirmSubmit = async (values: {
   amount?: number;
   method?: PaymentMethod;
 }) => {
   const targetReservationId =
     selectedReservationId || reservationToConfirm?.id;

   if (!targetReservationId) {
     toast.error("Impossible de trouver l'ID de la réservation à confirmer.");
     return;
   }

   setIsConfirming(true);
   try {
     const payload = {
       downPaymentAmount: values.amount,
       downPaymentMethod: values.method,
     };

     await api.patch(`/reservations/${targetReservationId}/confirm`, payload);

     toast.success("Réservation confirmée avec succès !");
     fetchReservations(); 

    
     setIsConfirmModalVisible(false);
     setReservationToConfirm(null);
     setSelectedReservationId(null);
   } catch (error) {
     console.error("Failed to confirm reservation:", error);
     const errorMessage =
       (error as any).response?.data?.message || "Une erreur est survenue.";
     toast.error(errorMessage);
   } finally {
     setIsConfirming(false);
   }
 };

  useEffect(() => {
      fetchReservations();
    }, []);



  const tableData = useMemo(() => {
    if (!currentUserId) return [];
    return reservations.map((res) => ({
      key: res.id,
      clientName: `${res.client.firstName} ${res.client.lastName}`,
      vehicle: `${res.vehicle.make} ${res.vehicle.model}`,
      createdBy:
        res.createdById === currentUserId
          ? "Vous"
          : res.createdBy.name ?? "Inconnu",
      status: mapStatusToFrench(res.status),
      totalDays: dayjs(res.endDate).diff(dayjs(res.startDate), "day"),
      montantPaye: res.payments.reduce((sum, p) => sum + Number(p.amount), 0),
      startDate: res.startDate.toString(),
      endDate: res.endDate.toString(),
    }));
  }, [reservations, currentUserId]);

   const filteredData = useMemo(() => {
           return tableData.filter(
             (reservation) => reservation.status === activeStatusFilter
           );
         }, [tableData, activeStatusFilter]);

 const remainingForModal = reservationToConfirm
   ? Number(reservationToConfirm.estimatedCost) -
     reservationToConfirm.payments.reduce((sum, p) => sum + Number(p.amount), 0)
   : 0;


  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                Réservations
              </Title>
              {isLoading ? (
                <Text type="secondary">Chargement des réservations...</Text>
              ) : (
                <Text type="secondary">
                  {tableData.length} réservations au total
                </Text>
              )}
            </Col>
            <Col>
              <Link href="/reservations/create" passHref>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ borderRadius: "8px" }}
                  className="hover-scale"
                >
                  Nouvelle réservation
                </Button>
              </Link>
            </Col>
          </Row>
        </Card>
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Segmented
            options={statusOptions}
            value={activeStatusFilter}
            onChange={setActiveStatusFilter}
            style={{
              borderRadius: "8px",
              background: "#f5f5f5",
              padding: "4px",
            }}
          />
        </Card>
        <Card bordered={false}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          ) : (
            <ReservationListTable
              data={filteredData}
              loading={isLoading}
              onCancel={handleCancelReservation}
              onConfirm={handleOpenConfirmModal}
            />
          )}

          <Modal
            title={`Confirmer la réservation #${reservationToConfirm?.id
              .slice(-6)
              .toUpperCase()}`}
            open={isConfirmModalVisible}
            onCancel={() => setIsConfirmModalVisible(false)}
            confirmLoading={isConfirming}
            onOk={() => form.submit()}
            okText="Confirmer la réservation"
            cancelText="Annuler"
          >
            <Form form={form} layout="vertical" onFinish={handleConfirmSubmit}>
              {reservationToConfirm && (
                <>
                  <Space
                    direction="vertical"
                    style={{ width: "100%", marginBottom: 16 }}
                  >
                    <Text>
                      Coût total :{" "}
                      <Text strong>
                        {Number(reservationToConfirm.estimatedCost).toFixed(2)}{" "}
                        MAD
                      </Text>
                    </Text>
                    <Text>
                      Reste à payer :{" "}
                      <Text strong style={{ color: "#1677ff" }}>
                        {remainingForModal.toFixed(2)} MAD
                      </Text>
                    </Text>
                  </Space>
                  <Divider />
                </>
              )}
              <p>
                <p>
                  Vous pouvez confirmer cette réservation. Si le client paie un
                  acompte maintenant, ajoutez-le ci-dessous.
                </p>
              </p>
              <Form.Item name="amount" label="Montant de l'acompte (MAD) optionnel">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={remainingForModal}
                  placeholder="ex: 200"
                />
              </Form.Item>
              <Form.Item name="method" label="Méthode de paiement">
                <Select placeholder="Sélectionner une méthode" allowClear>
                  <Select.Option value="CASH">Espèces</Select.Option>
                  <Select.Option value="CARD">Carte bancaire</Select.Option>
                  <Select.Option value="BANK_TRANSFER">Virement</Select.Option>
                  <Select.Option value="CHECK">Chèque</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </Space>
      <style jsx global>{`
        .hover-scale {
          transition: all 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-table-row:hover {
          background: #f5f5f5 !important;
        }
        .ant-segmented-item-selected {
          background: #1677ff !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
