"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Swal from "sweetalert2"; 
import type {
  Reservation,
  ReservationStatus,
  Prisma,
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
  Modal
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import type { ReservationDataType } from "./ReservationsListTable"
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";




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
const fakeReservationsData: ReservationDataType[] = [
  {
    key: "117",
    clientName: "amine alami",
    vehicle: "2024",
    createdBy: "Vous",
    status: "En attente",
    totalDays: 4,
    montantPaye: 1000.0,
    startDate: "2025-07-29 16:33",
    endDate: "2025-08-02 16:33",
  },
  {
    key: "118",
    clientName: "Fatima Zahra",
    vehicle: "Clio 5",
    createdBy: "Admin",
    status: "Terminé",
    totalDays: 10,
    montantPaye: 3500.0,
    startDate: "2025-06-10 12:00",
    endDate: "2025-06-20 12:00",
  },
  {
    key: "119",
    clientName: "Youssef Karim",
    vehicle: "Duster",
    createdBy: "Vous",
    status: "Annulé",
    totalDays: 7,
    montantPaye: 0.0,
    startDate: "2025-09-01 09:00",
    endDate: "2025-09-08 09:00",
  },
];
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
  
   const { data: session } = useSession();
   const currentUserId = session?.user?.id;
   const [reservations, setReservations] = useState<ApiReservation[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const statusOptions = ["En attente", "Confirmé", "Terminé", "Annulé"];
   const [activeStatusFilter, setActiveStatusFilter] = useState<
     string | number
   >(statusOptions[0]);
 
 
    const handleCancelReservation = (reservationId: string) => {
      Swal.fire({
        title: "Êtes-vous sûr ?",
        text: "Cette action est irréversible et annulera la réservation.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33", // Red color for the confirm button
        cancelButtonColor: "#3085d6", // Blue color for the cancel button
        confirmButtonText: "Oui, annuler !",
        cancelButtonText: "Non, garder",
      }).then((result) => {
        // This block runs AFTER the user clicks a button
        if (result.isConfirmed) {
          // If they clicked "Oui, annuler !", we run the API call.
          const cancelRequest = async () => {
            try {
              // Make the API call. No need to store the result.
              await api.patch(`/reservations/${reservationId}/cancel`);

              // Update the local state for an instant UI update
              setReservations((prevReservations) =>
                prevReservations.map((res) =>
                  res.id === reservationId
                    ? { ...res, status: "CANCELLED" }
                    : res
                )
              );

              // Show a success message
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

              // Show an error message using SweetAlert
              Swal.fire("Erreur !", errorMessage, "error");
            }
          };

          // Execute the async function
          cancelRequest();
        }
      });
    };


     useEffect(() => {
       const fetchReservations = async () => {
         setIsLoading(true);
         try {
           const response = await api.get<ApiReservation[]>("/reservations");
           setReservations(response.data);
         } catch (error) {
           console.error("Failed to fetch reservations:", error);
          toast.error("Echec du chargements des données des reservations")
         } finally {
           setIsLoading(false);
         }
       };
       fetchReservations();
     }, []);


   const tableData = useMemo(() => {
         if (!currentUserId) return [];
         return reservations.map((res) =>
           mapApiReservationToTableData(res, currentUserId)
         );
       }, [reservations, currentUserId]);
   const filteredData = useMemo(() => {
           return tableData.filter(
             (reservation) => reservation.status === activeStatusFilter
           );
         }, [tableData, activeStatusFilter]);



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
            <ReservationListTable data={filteredData} loading={isLoading} onCancel={handleCancelReservation}/>
          )}
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
