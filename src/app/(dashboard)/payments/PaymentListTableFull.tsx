"use client";

import React from "react";
import { Table, Button, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import dayjs from "dayjs";
import { LinkOutlined } from "@ant-design/icons";

const { Text } = Typography;
// This interface is defined here and can be exported to be used by the parent page
export interface PaymentDataType {
  key: string;
  amount: number;
  date: string;
  method: string;
  reservationId?: string;
  contractId?: string;
}
// The props this component accepts
interface PaymentListTableProps {
  data: PaymentDataType[];
  loading: boolean
}
// A self-contained helper function for styling the tags
const getMethodColor = (method: string) => {
  switch (method) {
    case "cash":
      return "blue";
    case "card":
      return "purple";
    case "transfer":
      return "green";
    default:
      return "default";
  }
};
// The columns definition for the table
const columns: ColumnsType<PaymentDataType> = [
  {
    title: "Montant (MAD)",
    dataIndex: "amount",
    key: "amount",
    render: (amount: number) => (
      <Text strong style={{ color: "#1677ff" }}>
        {amount.toFixed(2)}
      </Text>
    ),
    sorter: (a, b) => a.amount - b.amount,
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
  },
  {
    title: "Méthode",
    dataIndex: "method",
    key: "method",
    render: (method: string) => (
      <Tag color={getMethodColor(method)}>
        {method === "cash" ? "Espèces" : method === "card" ? "Carte" : method}
      </Tag>
    ),
  },
  {
    title: "Lié à",
    key: "linkedTo",
    // Une seule colonne pour plus de clarté
    render: (_, record) => {
      if (record.reservationId) {
        return (
          <Link href={`/reservations/${record.reservationId}/view`}>
            <Button type="link" icon={<LinkOutlined />}>
              Réservation #{record.reservationId.slice(-6)}
            </Button>
          </Link>
        );
      }
      if (record.contractId) {
        return (
          <Link href={`/contracts/${record.contractId}/view`}>
            <Button type="link" icon={<LinkOutlined />}>
              Contrat #{record.contractId.slice(-6)}
            </Button>
          </Link>
        );
      }
      return <Text type="secondary">N/A</Text>;
    },
  },
];

export default function PaymentListTable({ data,loading }: PaymentListTableProps) {
  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        position: ["bottomRight"],
        showSizeChanger: true,
        showQuickJumper: true,
      }}
      rowKey="key"
      size="middle"
    />
  );
}
