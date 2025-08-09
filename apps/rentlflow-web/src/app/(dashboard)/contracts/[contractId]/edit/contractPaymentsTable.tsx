"use client";

import React from "react";
import { Table, Typography, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

interface PaymentData {
  key: string;
  amount: string;
  date: string;
  method: string;
}

interface ContractPaymentsTableProps {
  payments: PaymentData[];
}

const columns: ColumnsType<PaymentData> = [
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
  },
  {
    title: "Méthode",
    dataIndex: "method",
    key: "method",
    render: (text: string) => <Tag color="blue">{text.toUpperCase()}</Tag>,
  },
];

export default function ContractPaymentsTable({
  payments,
}: ContractPaymentsTableProps) {
  return (
    <Table
      columns={columns}
      dataSource={payments}
      pagination={false}
      size="small"
    />
  );
}
