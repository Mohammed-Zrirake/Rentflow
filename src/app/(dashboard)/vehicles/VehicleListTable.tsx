// app/(dashboard)/vehicles/VehicleListTable.tsx
"use client";

import React from "react";
import { Table, Button, Tag, Image, Tooltip, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import Link from "next/link";


export interface VehicleDataType {
  key: string;
  imageUrl: string;
  status: "Disponible" | "Loué" | "Réservé" | "Maintenance" | "Inactif";
  licensePlate: string;
  model: string;
  mileage: number;
  dailyRate: number;
}
interface VehicleListTableProps {
  data: VehicleDataType[];
}
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
    title: "Kilométrage Actuel (Km)",
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
    align: "center", // C'est bien d'aligner les actions au centre

    // --- MODIFICATION ICI ---
    render: (_, record) => (
      <Space size="small">
        {/* NOUVEAU: Bouton pour voir les détails */}
        <Tooltip title="Voir les détails">
          <Link href={`/vehicles/${record.key}/view`} passHref>
            <Button
              type="text"
              shape="circle"
              icon={<EyeOutlined />}
              style={{ color: "#1677ff" }}
            />
          </Link>
        </Tooltip>

        {/* Bouton Modifier existant */}
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

        {/* Vous pourriez ajouter un Dropdown pour d'autres actions plus tard */}
      </Space>
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
