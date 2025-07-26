// app/(dashboard)/vehicles/VehicleListTable.tsx
"use client";

import React from "react";
import { Table, Button, Tag, Image, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined } from "@ant-design/icons";
import Link from "next/link";

// This interface is defined and exported here
export interface VehicleDataType {
  key: string;
  imageUrl: string;
  status: "Disponible" | "Loué" | "Réservé" | "Maintenance" | "Inactif";
  licensePlate: string;
  model: string;
  mileage: number;
  dailyRate: number;
}

// The props this component accepts
interface VehicleListTableProps {
  data: VehicleDataType[];
}

// A self-contained helper function for styling status tags
const getStatusColor = (status: string) => {
  switch (status) {
    case "Disponible":
      return "success";
    case "Loué":
      return "blue";
    case "Réservé":
      return "purple";
    case "Maintenance":
      return "warning";
    case "Inactif":
      return "default";
    default:
      return "default";
  }
};

// The columns definition for the table
const columns: ColumnsType<VehicleDataType> = [
  {
    title: "Image",
    dataIndex: "imageUrl",
    key: "image",
    render: (url: string) => (
      <Image width={80} src={url} alt="Véhicule" preview={false} />
    ),
  },
  {
    title: "Statut",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <Tag color={getStatusColor(status)}>{status}</Tag>
    ),
  },
  {
    title: "Plaque d'immatriculation",
    dataIndex: "licensePlate",
    key: "licensePlate",
  },
  {
    title: "Modèle du véhicule",
    dataIndex: "model",
    key: "model",
  },
  {
    title: "Kilométrage (Km)",
    dataIndex: "mileage",
    key: "mileage",
    render: (km: number) => km.toLocaleString("fr-FR"),
  },
  {
    title: "Tarif journalier (MAD)",
    dataIndex: "dailyRate",
    key: "dailyRate",
    render: (rate: number) => rate.toFixed(2),
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Tooltip title="Modifier">
        <Link href={`/vehicles/${record.key}/edit`} passHref>
          <Button
            type="text"
            shape="circle"
            icon={<EditOutlined />}
            style={{ color: "#1677ff" }}
          />
        </Link>
      </Tooltip>
    ),
  },
];

export default function VehicleListTable({ data }: VehicleListTableProps) {
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
