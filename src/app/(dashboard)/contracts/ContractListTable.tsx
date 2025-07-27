// app/(dashboard)/contracts/ContractListTable.tsx
"use client";

import React from "react";
import { Table, Space, Tooltip, Button, Tag, Typography, Dropdown } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  MoreOutlined,
  DownloadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd/es/menu";
import Link from "next/link";
import dayjs from "dayjs";


const { Text } = Typography;

export interface ContractDataType {
  key: string;
  clientName: string;
  vehicle: string;
  createdBy: string;
  status: "Actif" | "Annulé" | "Terminé";
  totalDays: number;
  totalAmount: number;
  startDate: string;
  endDate: string;
  amountPaid:number
}
interface ContractListTableProps {
  data: ContractDataType[];
  loading: boolean;
  onTerminate: (contractId: string) => void;
  onCancel: (contractId: string) => void;
  onAddPayment:(contractId:string) =>void
}

export default function ContractListTable({
  data,
  loading,
  onTerminate,
  onCancel,
}: ContractListTableProps) {
  const columns: ColumnsType<ContractDataType> = [
    {
      title: "Nom du client",
      dataIndex: "clientName",
      key: "clientName",
      render: (text) => <Text strong>{text}</Text>,
    },
    { title: "Véhicule", dataIndex: "vehicle", key: "vehicle" },
    {
      title: "Créé par",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (text) => (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Actif"
              ? "green"
              : status === "Terminé"
              ? "default"
              : "red"
          }
          style={{ fontWeight: 500 }}
        >
          {status}
        </Tag>
      ),
    },
    { title: "Total jours", dataIndex: "totalDays", key: "totalDays" },
    {
      title: "Montant total (MAD)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => <Text strong>{amount.toFixed(2)}</Text>,
    },
    {
      title: "Date de début",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (date) => dayjs(date).format("DD-MM-YYYY HH:mm"),
    },
    {
      title: "Date de fin",
      dataIndex: "endDate",
      key: "endDate",
      sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
      render: (date) => dayjs(date).format("DD-MM-YYYY HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center",
      // --- MODIFICATION: La colonne Actions est maintenant une fonction qui applique votre logique ---
      render: (_, record) => {
        // Définition des actions possibles
        const menuItems: MenuProps["items"] = [];

        // Condition pour "Télécharger Contrat"
        menuItems.push({
          key: "download_contract",
          label: "Télécharger le contrat",
          icon: <DownloadOutlined />,
          // onClick: () => handleDownloadContract(record.key) // À implémenter
        });

        // Condition pour "Télécharger Facture"
        // (Ex: si le contrat est terminé ou annulé et a des paiements)
        if (record.status === "Terminé" || record.status === "Annulé") {
          menuItems.push({
            key: "download_invoice",
            label: "Télécharger la facture",
            icon: <FileTextOutlined />,
            // onClick: () => handleDownloadInvoice(record.key) // À implémenter
          });
        }

        // Condition pour "Annuler"
        if (record.status === "Actif") {
          menuItems.push({ type: "divider" });
          menuItems.push({
            key: "cancel",
            label: "Annuler le contrat",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => onCancel(record.key),
          });
        }

        return (
          <Space size="small">
            <Tooltip title="Voir les détails">
              <Link href={`/contracts/${record.key}/view`} passHref>
                <Button
                  type="text"
                  shape="circle"
                  icon={<EyeOutlined />}
                  style={{ color: "#1677ff" }}
                />
              </Link>
            </Tooltip>

            {/* Le bouton Modifier n'est visible que si le contrat est Actif */}
            {record.status === "Actif" && (
              <Tooltip title="Modifier">
                <Link href={`/contracts/${record.key}/edit`} passHref>
                  <Button
                    type="text"
                    shape="circle"
                    icon={<EditOutlined />}
                    style={{ color: "#1677ff" }}
                  />
                </Link>
              </Tooltip>
            )}

            {/* Le bouton Terminer n'est visible que si le contrat est Actif */}
            {record.status === "Actif" && (
              <Tooltip title="Terminer le contrat">
                <Button
                  type="text"
                  shape="circle"
                  icon={<CheckCircleOutlined />}
                  style={{ color: "#52c41a" }}
                  onClick={() => onTerminate(record.key)}
                />
              </Tooltip>
            )}

            {/* Le menu "Plus d'actions" est toujours visible mais son contenu change */}
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button
                type="text"
                shape="circle"
                icon={<MoreOutlined />}
                style={{ color: "#595959" }}
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

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