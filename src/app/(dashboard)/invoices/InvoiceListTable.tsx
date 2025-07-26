"use client";

import React from "react";
import { Table, Button, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";

// This interface is correctly defined here and can be exported
export interface InvoiceDataType {
  key: string;
  totalAmount: number;
  paidAmount: number;
  status: "Payé" | "Partiellement payé" | "En attente" | "Annulé";
  reservationId?: string;
  contractId?: string;
}

// The props interface is also correct
interface InvoiceListTableProps {
  data: InvoiceDataType[];
  onAddPayment: (invoice: InvoiceDataType) => void;
}

// This is a helper function. It's self-contained and perfect to keep here.
const getStatusColor = (status: string) => {
  switch (status) {
    case "Payé":
      return "success";
    case "Partiellement payé":
      return "warning";
    case "En attente":
      return "processing";
    case "Annulé":
      return "error";
    default:
      return "default";
  }
};

// The columns definition function
const columns = (
  onAddPayment: (invoice: InvoiceDataType) => void
): ColumnsType<InvoiceDataType> => [
  {
    title: "Montant total (MAD)",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (amount) => amount.toFixed(2),
  },
  {
    title: "Statut",
    dataIndex: "status",
    key: "status",
    render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
  },
  {
    title: "Montant payé (MAD)",
    dataIndex: "paidAmount",
    key: "paidAmount",
    render: (amount) => amount.toFixed(2),
  },
  {
    title: "Paiements",
    key: "payments",
    render: (_, record) => (
      <Link href={`/payments?invoiceId=${record.key}`}>View payments</Link>
    ),
  },
  {
    title: "Réservation",
    dataIndex: "reservationId",
    key: "reservation",
    render: (reservationId) =>
      reservationId ? (
        <Link href={`/reservations/${reservationId}/view`}>
          Voir la réservation
        </Link>
      ) : (
        "N/A"
      ),
  },
  {
    title: "Contrat",
    dataIndex: "contractId",
    key: "contract",
    render: (contractId) =>
      contractId ? (
        <Link href={`/contracts/${contractId}/view`}>Voir le contrat</Link>
      ) : (
        "N/A"
      ),
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Button
        icon={<PlusOutlined />}
        // --- THIS IS THE FIX ---
        // Call the 'onAddPayment' function passed in via props
        onClick={() => onAddPayment(record)}
        disabled={record.status === "Payé" || record.status === "Annulé"}
        style={{ borderRadius: "8px" }}
        className="hover-scale"
      >
        Nouveau paiement
      </Button>
    ),
  },
];

export default function InvoiceListTable({
  data,
  onAddPayment,
}: InvoiceListTableProps) {
  return (
    <Table
      columns={columns(onAddPayment)}
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
