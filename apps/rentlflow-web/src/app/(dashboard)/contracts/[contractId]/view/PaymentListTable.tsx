// app/(dashboard)/contracts/[contractId]/PaymentListTable.tsx
"use client";

import React from "react";
import { Table, Typography, Tag } from "antd";

const { Text } = Typography;

interface Payment {
  key: string;
  amount: string;
  date: string;
  method: string;
}

interface PaymentListTableProps {
  payments: Payment[];
}

const paymentColumns = [
  {
    title: "Montant (MAD)",
    dataIndex: "amount",
    key: "amount",
    render: (text: string) => <Text strong>{text}</Text>,
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (text: string) => <Text>{text}</Text>,
  },
  {
    title: "Méthode",
    dataIndex: "method",
    key: "method",
    render: (text: string) => <Tag color="blue">{text}</Tag>,
  },
];

export default function PaymentListTable({ payments }: PaymentListTableProps) {
  return (
    <Table
      columns={paymentColumns}
      dataSource={payments}
      pagination={false}
      size="middle"
      rowKey="key"
    />
  );
}
