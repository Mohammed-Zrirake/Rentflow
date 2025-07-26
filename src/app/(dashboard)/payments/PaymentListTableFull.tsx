"use client";

import React from "react";
import { Table, Button, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import dayjs from "dayjs";

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
    title: "Réservation",
    dataIndex: "reservationId",
    key: "reservation",
    render: (reservationId) =>
      reservationId ? (
        <Link href={`/reservations/${reservationId}/view`}>
          <Button type="link">Voir réservation</Button>
        </Link>
      ) : (
        <Text type="secondary">N/A</Text>
      ),
  },
  {
    title: "Contrat",
    dataIndex: "contractId",
    key: "contract",
    render: (contractId) =>
      contractId ? (
        <Link href={`/contracts/${contractId}/view`}>
          <Button type="link">Voir contrat</Button>
        </Link>
      ) : (
        <Text type="secondary">N/A</Text>
      ),
  },
];

export default function PaymentListTable({ data }: PaymentListTableProps) {
  return (
    <Table
      columns={columns}
      dataSource={data}
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
