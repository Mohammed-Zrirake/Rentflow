"use client";

import React from "react";
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
  Skeleton, // Keep Skeleton for loading states
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

const ReservationPaymentsTable = dynamic(
  () => import("../../ReservationPaymentsTable"), // Adjust path if needed
  {
    loading: () => <Skeleton active paragraph={{ rows: 3 }} />,
    ssr: false,
  }
);

const { Title, Text } = Typography;
const fakeReservationData = {
  id: "117",
  status: "En attente",
  client: "amine alami (CD4933029)",
  vehicle: "Alfa Romeo 2024 (49388821)",
  startDate: "29/07/2025 04:33 PM",
  duration: "4",
  endDate: "02/08/2025 04:33 PM",
  dailyRate: "300 MAD",
  totalCost: "1 200 MAD",
  payments: [
    { key: "1", amount: "1 000.00", date: "02-07-2025 16:33", method: "cash" },
  ],
};

const moreActionsMenu: MenuProps = {
  items: [
    {
      key: "1",
      label: "Télécharger le contrat",
      icon: <DownloadOutlined />,
    },
    {
      key: "2",
      label: "Annuler",
      icon: <DeleteOutlined />,
      danger: true,
    },
  ],
};

export default function ViewReservationPage({
  params,
}: {
  params: { reservationId: string };
}) {
  const reservation = fakeReservationData;

  const getStatusTagColor = (status: string) => {
    if (status === "En attente") return "orange";
    if (status === "Annulé") return "red";
    return "default";
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
                  Réservation #{reservation.id}
                </Title>
                <Tag
                  color={getStatusTagColor(reservation.status)}
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
                <Button
                  icon={<FileAddOutlined />}
                  style={{
                    borderRadius: "8px",
                    fontWeight: 500,
                  }}
                  size="large"
                >
                  Nouveau contrat
                </Button>
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

        {/* Informations Client */}
        <Card
          title={
            <Space>
              <UserOutlined style={{ color: "#1677ff" }} />
              <Text strong style={{ color: "#1677ff" }}>
                Informations client
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
          <Select
            defaultValue={reservation.client}
            style={{ width: "100%", borderRadius: "8px" }}
            size="large"
            disabled
          />
        </Card>

        {/* Véhicule */}
        <Card
          title={
            <Space>
              <CarOutlined style={{ color: "#1677ff" }} />
              <Text strong style={{ color: "#1677ff" }}>
                Véhicule
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
          <Select
            defaultValue={reservation.vehicle}
            style={{ width: "100%", borderRadius: "8px" }}
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
              <Text>{reservation.startDate}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Nombre de jours</Text>}>
              <Text>{reservation.duration} Jours</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Date de fin</Text>}>
              <Text>{reservation.endDate}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Tarif journalier</Text>}>
              <Text>{reservation.dailyRate}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Coût total</Text>} span={2}>
              <Text strong style={{ fontSize: "16px", color: "#1677ff" }}>
                {reservation.totalCost}
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
          <ReservationPaymentsTable payments={reservation.payments} />
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
