"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
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
  Skeleton, // Import Skeleton for loading state
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

const { Title, Text } = Typography;


const PaymentListTable = dynamic(
  () => import("./PaymentListTable"), 
  {
    loading: () => <Skeleton active paragraph={{ rows: 3 }} />,
    ssr: false,
  }
);

// --- MOCK DATA and MENU ---
const fakeContractData = {
  id: "1228",
  client: "amine alami (CD4933029)",
  secondDriver: "amine alami (CD4933029)",
  vehicle: "Alfa Romeo 2024 (49388821)",
  mileage: "20 000 Km",
  vehicleState: "Bon",
  fuelLevel: 15,
  startDate: "07/02/2025 04:25 PM",
  duration: "5 Jours",
  endDate: "07/07/2025 04:25 PM",
  dailyRate: "400 MAD",
  totalCost: "2 000 MAD",
  payments: [
    {
      key: "1",
      amount: "1 500.00",
      date: "02-07-2025 16:26",
      method: "Espèces",
    },
    { key: "2", amount: "200.00", date: "02-07-2025 16:46", method: "Espèces" },
  ],
  status: "Actif",
  paidAmount: 1700,
  totalAmount: 2000,
};

const actionMenu: MenuProps = {
  items: [
    { key: "1", label: "Télécharger le contrat", icon: <DownloadOutlined /> },
    { key: "2", label: "Télécharger la facture", icon: <FileTextOutlined /> },
    { key: "3", label: "Imprimer", icon: <PrinterOutlined /> },
    { type: "divider" },
    {
      key: "4",
      label: "Annuler le contrat",
      icon: <DeleteOutlined />,
      danger: true,
    },
  ],
};

export default function ViewContractPage({
  params,
}: {
  params: { contractId: string };
}) {
  const contract = fakeContractData;
  const paymentPercentage = (contract.paidAmount / contract.totalAmount) * 100;

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
                <Link href="/contracts" passHref>
                  <Button
                    type="text"
                    shape="circle"
                    icon={<ArrowLeftOutlined />}
                    style={{ color: "#1677ff" }}
                  />
                </Link>
                <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                  Contrat #{contract.id}
                </Title>
                <Tag
                  color={
                    contract.status === "Actif"
                      ? "green"
                      : contract.status === "Terminé"
                      ? "default"
                      : "red"
                  }
                  style={{ fontWeight: 500 }}
                >
                  {contract.status}
                </Tag>
              </Space>
            </Col>
            <Col>
              <Space>
                <Link href={`/contracts/${params.contractId}/edit`} passHref>
                  <Button
                    icon={<EditOutlined />}
                    style={{ borderRadius: "8px" }}
                  >
                    Modifier
                  </Button>
                </Link>
                <Button
                  icon={<CheckOutlined />}
                  style={{ borderRadius: "8px" }}
                  type="primary"
                >
                  Terminer
                </Button>
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
              status={paymentPercentage === 100 ? "success" : "active"}
              strokeColor={paymentPercentage === 100 ? "#52c41a" : "#1677ff"}
            />
            <Row justify="space-between">
              <Col>
                <Text strong>Payé:</Text> {contract.paidAmount} MAD
              </Col>
              <Col>
                <Text strong>Reste:</Text>{" "}
                {contract.totalAmount - contract.paidAmount} MAD
              </Col>
              <Col>
                <Text strong>Total:</Text> {contract.totalAmount} MAD
              </Col>
            </Row>
          </Space>
        </Card>

        {/* Informations Client */}
        <Card
          title={
            <Text strong style={{ color: "#1677ff" }}>
              Informations client
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
              <Text>{contract.client}</Text>
            </Col>
            <Col xs={24} md={12}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Deuxième conducteur
              </Text>
              <Text>{contract.secondDriver}</Text>
            </Col>
          </Row>
        </Card>

        {/* Véhicule */}
        <Card
          title={
            <Text strong style={{ color: "#1677ff" }}>
              Véhicule
            </Text>
          }
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label={<Text strong>Véhicule</Text>}>
              {contract.vehicle}
            </Descriptions.Item>
            <Descriptions.Item
              label={<Text strong>Kilométrage de départ</Text>}
            >
              {contract.mileage}
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>État du véhicule</Text>}>
              <Tag color="green">{contract.vehicleState}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Niveau de carburant</Text>}>
              <Progress
                percent={contract.fuelLevel}
                size="small"
                strokeColor="#1677ff"
                showInfo={false}
              />
              <Text>{contract.fuelLevel}%</Text>
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
            <Descriptions.Item label={<Text strong>Date de début</Text>}>
              {contract.startDate}
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Nombre de jours</Text>}>
              {contract.duration}
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Date de fin</Text>}>
              {contract.endDate}
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Tarif journalier</Text>}>
              {contract.dailyRate}
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Coût total</Text>} span={2}>
              <Text strong style={{ fontSize: "16px" }}>
                {contract.totalCost}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* --- DYNAMIC PAYMENT LIST --- */}
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
          <PaymentListTable payments={contract.payments} />
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
