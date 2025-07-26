"use client";

import React from "react";
import { Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;


export interface PaymentDataType {
  key: string;
  amount: string;
  date: string;
  method: string;
}

interface ReservationPaymentsTableProps {
  payments: PaymentDataType[];
}

const paymentColumns: ColumnsType<PaymentDataType> = [
  {
    title: "Montant (MAD)",
    dataIndex: "amount",
    key: "amount",
    render: (text) => <Text strong>{text}</Text>,
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (text) => <Text>{text}</Text>,
  },
  {
    title: "Méthode",
    dataIndex: "method",
    key: "method",
    render: (text) => <Tag color="blue">{text}</Tag>,
  },
];

export default function ReservationPaymentsTable({
  payments,
}: ReservationPaymentsTableProps) {
  return (
    <Table
      columns={paymentColumns}
      dataSource={payments}
      pagination={false}
      size="middle"
      style={{ borderRadius: "8px" }}
    />
  );
}
