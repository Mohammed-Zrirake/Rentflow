"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; 
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Card,
  Descriptions,
  Tag,
  Progress,
  Dropdown,
  MenuProps,
  Skeleton,
  Alert,
} from "antd";
import {
  EditOutlined,
  CheckOutlined,
  MoreOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import api from "@/lib/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import type {
  Contract,
  Client,
  Vehicle,
  Payment,
  Invoice,
  PaymentMethod,
  ContractStatus,
} from "@rentflow/database";
import Swal from "sweetalert2";

const { Title, Text } = Typography;


const PaymentListTable = dynamic(() => import("./PaymentListTable"), {
  loading: () => <Skeleton active paragraph={{ rows: 3 }} />,
  ssr: false,
});

const TerminateContractForm = dynamic(() => import("./terminateContractForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 5 }} />,
  ssr: false,
});



type FullContractData = Contract & {
  client: Client;
  secondaryDriver: Client | null;
  vehicle: Vehicle;
  payments: Payment[];
  invoice: Invoice | null;
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
const mapStatusToFrench = (
  status: ContractStatus
): "Actif" | "Annulé" | "Terminé" => {
  switch (status) {
    case "ACTIVE":
      return "Actif";
    case "CANCELLED":
      return "Annulé";
    case "COMPLETED":
      return "Terminé";
    default:
      return "Actif";
  }
};
const getStatusColor = (status: ContractStatus) => {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "CANCELLED":
      return "red";
    case "COMPLETED":
      return "default";
    default:
      return "default";
  }
};


export default function ViewContractPage({
  params,
}: {
  params: { contractId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTerminating = searchParams.get("action") === "terminate";
  const [contract, setContract] = useState<FullContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchContract = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<FullContractData>(
        `/contracts/${params.contractId}`
      );
      setContract(response.data);
    } catch (err) {
      setError("Impossible de charger les données du contrat.");
      toast.error("Échec du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, [params.contractId]);

 const handleCancel = async () => {
    if (!contract) return;
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action annulera le contrat et rendra le véhicule disponible. Elle est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, annuler !",
      cancelButtonText: "Non",
    });
    if (result.isConfirmed) {
      try {
        await api.patch(`/contracts/${contract.id}/cancel`);
        toast.success("Contrat annulé avec succès !");
        fetchContract();
      } catch (err) {
        toast.error(
          (err as any).response?.data?.message || "Erreur lors de l'annulation."
        );
      }
    }
  };

 const handleTerminateSubmit = async (values: any) => {
   if (!contract) return;
   setIsSubmitting(true);
    try {
      const payload = {
        returnDate: dayjs(values.returnDate).toISOString(),
        returnMileage: values.returnMileage,
        returnFuelLevel: values.returnFuelLevel,
        returnNotes: values.returnNotes,
        vehicleState: values.vehicleState,
        finalPaymentAmount: values.finalPaymentAmount,
        finalPaymentMethod: values.finalPaymentMethod,
      };
      await api.patch(`/contracts/${contract.id}/terminate`, payload);
      toast.success("Contrat terminé avec succès !");
      router.push("/contracts");
    } catch (error) {
      toast.error(
        (error as any).response?.data?.message ||
          "Erreur lors de la terminaison."
      );
    } finally {
      setIsSubmitting(false);
    }
 };


 
  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<FullContractData>(
          `/contracts/${params.contractId}`
        );
        setContract(response.data);
      } catch (err) {
        setError("Impossible de charger les données du contrat.");
        toast.error("Échec du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    if (params.contractId) {
      fetchContract();
    }
  }, [params.contractId]);

  if (loading) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <Skeleton active paragraph={{ rows: 20 }} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert message="Erreur" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!contract) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Contrat non trouvé"
          description="Le contrat que vous cherchez n'existe pas ou vous n'avez pas les permissions pour le voir."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const paidAmount = contract.payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const totalAmount = Number(contract.totalCost);
  const remainingAmount = totalAmount - paidAmount;
  const paymentPercentage =
    totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  const durationDays = dayjs(contract.endDate).diff(
    dayjs(contract.startDate),
    "day"
  );
  const canBeEdited = contract.status === "ACTIVE";
  const canBeTerminated = contract.status === "ACTIVE";
  const canBeCancelled = contract.status === "ACTIVE";


  const actionMenu: MenuProps = {
    items: [
      { key: "1", label: "Télécharger le contrat", icon: <DownloadOutlined /> },
      { key: "2", label: "Télécharger la facture", icon: <FileTextOutlined />,disabled: !contract.invoice,},
      { key: "3", label: "Imprimer", icon: <PrinterOutlined /> },
      ...(canBeCancelled
        ? [
            { type: "divider" as const },
            {
              key: "4",
              label: "Annuler le contrat",
              icon: <DeleteOutlined />,
              danger: true,
              onClick: () => {
                handleCancel() 
              },
            },
          ]
        : []),
    ],
  };

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center">
                <Link href="/contracts">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<ArrowLeftOutlined style={{ color: "#1677ff" }} />}
                  />
                </Link>
                <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                  Contrat #{contract.id.slice(-6).toUpperCase()}
                </Title>
                <Tag
                  color={getStatusColor(contract.status)}
                  style={{ fontWeight: 500 }}
                >
                  {mapStatusToFrench(contract.status)}
                </Tag>
              </Space>
            </Col>
            <Col>
              <Space>
                {canBeEdited && (
                  <Link href={`/contracts/${params.contractId}/edit`}>
                    <Button
                      icon={<EditOutlined />}
                      style={{ borderRadius: "8px" }}
                    >
                      Modifier
                    </Button>
                  </Link>
                )}
                {canBeTerminated && (
                  <Button
                    icon={<CheckOutlined />}
                    style={{ borderRadius: "8px" }}
                    type="primary"
                  >
                    Terminer
                  </Button>
                )}
                <Dropdown menu={actionMenu} trigger={["click"]}>
                  <Button
                    icon={<MoreOutlined />}
                    style={{ borderRadius: "8px" }}
                  >
                    Actions
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>
        </Card>
        {isTerminating && canBeTerminated && (
          <TerminateContractForm
            contract={contract}
            onFinish={handleTerminateSubmit}
            onCancel={() => router.push(`/contracts/${contract.id}/view`)}
            submitting={isSubmitting}
          />
        )}
        {/* Payment Progress */}
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
            <Text strong style={{ color: "#1677ff" }}>
              Informations sur les conducteurs
            </Text>
          }
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Client principal
              </Text>
              <Text>{`${contract.client.firstName} ${contract.client.lastName} (${contract.client.driverLicense})`}</Text>
            </Col>
            <Col xs={24} md={12}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Deuxième conducteur
              </Text>
              <Text>
                {contract.secondaryDriver
                  ? `${contract.secondaryDriver.firstName} ${contract.secondaryDriver.lastName} (${contract.secondaryDriver.driverLicense})`
                  : "N/A"}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Véhicule */}
        <Card
          title={
            <Text strong style={{ color: "#1677ff" }}>
              Véhicule & État de départ
            </Text>
          }
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Véhicule">{`${contract.vehicle.make} ${contract.vehicle.model} (${contract.vehicle.licensePlate})`}</Descriptions.Item>
            <Descriptions.Item label="Kilométrage de départ">
              {contract.pickupMileage.toLocaleString()} Km
            </Descriptions.Item>
            <Descriptions.Item label="Niveau carburant départ">
              {contract.pickupFuelLevel ?? "N/A"}%
            </Descriptions.Item>
            <Descriptions.Item label="Notes de départ" span={2}>
              {contract.pickupNotes || "Aucune note"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Périodes & tarifs */}
        <Card
          title={
            <Text strong style={{ color: "#1677ff" }}>
              Périodes & tarifs de location
            </Text>
          }
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Date de début">
              {dayjs(contract.startDate).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Nombre de jours">
              {durationDays} Jours
            </Descriptions.Item>
            <Descriptions.Item label="Date de fin">
              {dayjs(contract.endDate).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Tarif journalier">
              {Number(contract.dailyRate).toFixed(2)} MAD
            </Descriptions.Item>
            <Descriptions.Item label="Coût total" span={2}>
              <Text strong style={{ fontSize: "16px" }}>
                {totalAmount.toFixed(2)} MAD
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Liste des paiements */}
        <Card
          title={
            <Text strong style={{ color: "#1677ff" }}>
              Liste des paiements
            </Text>
          }
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <PaymentListTable
            payments={contract.payments.map((p) => ({
              key: p.id,
              amount: Number(p.amount).toFixed(2),
              date: dayjs(p.paymentDate).format("DD/MM/YYYY HH:mm"),
              method: translatePaymentMethod(p.method),
            }))}
          />
        </Card>
      </Space>

      <style jsx global>{`
        .ant-descriptions-item-label {
          font-weight: 500 !important;
        }
        .ant-card-head-title {
          font-weight: 500 !important;
        }
      `}</style>
    </div>
  );
}
