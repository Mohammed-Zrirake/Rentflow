"use client";

import React from "react";
import { Table, Button, Space, Tag, Typography, Dropdown, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd/es/menu";
import {
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  FileAddOutlined,
  DownloadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import dayjs from "dayjs";

const { Text } = Typography;

export interface ReservationDataType {
  key: string;
  clientName: string;
  vehicle: string;
  createdBy: string;
  status: "En attente" | "Confirmé" | "Annulé" | "Terminé";
  totalDays: number;
  montantPaye: number;
  startDate: string;
  endDate: string;
}
interface ReservationListTableProps {
  data: ReservationDataType[];
  loading: boolean;
  onCancel: (reservationId: string) => void;
  onConfirm: (reservationId: string) => void;
}

export default function ReservationListTable({
  data,
  loading,
  onCancel, 
  onConfirm,
}: ReservationListTableProps) {

  const columns: ColumnsType<ReservationDataType> = [
    {
      title: "Nom du client",
      dataIndex: "clientName",
      key: "clientName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Véhicule",
      dataIndex: "vehicle",
      key: "vehicle",
      render: (text) => <Text>{text}</Text>,
    },
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
      render: (status) => {
        let color: string;
        switch (status) {
          case "En attente":
            color = "orange";
            break;
          case "Confirmé":
            color = "green";
            break;
          case "Terminé":
            color = "default";
            break;
          case "Annulé":
            color = "red";
            break;
          default:
            color = "default";
        }
        return (
          <Tag color={color} style={{ fontWeight: 500 }}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Total jours",
      dataIndex: "totalDays",
      key: "totalDays",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Montant payé (MAD)",
      dataIndex: "montantPaye",
      key: "montantPaye",
      render: (amount: number) => <Text strong>{amount.toFixed(2)}</Text>,
    },
    {
      title: "Date de début",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (date) => <Text>{dayjs(date).format("DD-MM-YYYY HH:mm")}</Text>,
    },
    {
      title: "Date de fin",
      dataIndex: "endDate",
      key: "endDate",
      sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
      render: (date) => <Text>{dayjs(date).format("DD-MM-YYYY HH:mm")}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => {
        const canBeCancelled =
          record.status === "En attente" || record.status === "Confirmé";
        const canBeEdited =
          record.status === "En attente" || record.status === "Confirmé";
        const canDownloadContract = record.status === "Terminé";
        const canCreateContract = record.status === "Confirmé";
        const canBeConfirmed = record.status === "En attente";

        const menuItems: MenuProps["items"] = [];

        if (canDownloadContract) {
          menuItems.push({
            key: "download_contract",
            label: "Télécharger le contrat",
            icon: <DownloadOutlined />,
          });
        }

        if (canBeCancelled) {
          menuItems.push({
            key: "cancel",
            label: "Annuler",
            icon: <DeleteOutlined />,
            danger: true,
          });
        }
        const handleMenuClick: MenuProps["onClick"] = (e) => {
          if (e.key === "cancel") {
            onCancel(record.key); 
          }
          if (e.key === "download_contract") {
            console.log("Download contract for:", record.key);
          }
        };

        return (
          <Space size="small">
            <Tooltip title="Voir les détails">
              <Link href={`/reservations/${record.key}/view`} passHref>
                <Button
                  type="text"
                  shape="circle"
                  icon={<EyeOutlined />}
                  style={{ color: "#1677ff" }}
                />
              </Link>
            </Tooltip>

            {canBeConfirmed && (
              <Tooltip title="Confirmer la réservation">
                <Button
                  type="text"
                  shape="circle"
                  icon={<CheckCircleOutlined />}
                  style={{ color: "green" }}
                  onClick={() => onConfirm(record.key)}
                />
              </Tooltip>
            )}

            {/* Conditionally render the Edit button */}
            {canBeEdited && (
              <Tooltip title="Modifier">
                <Link href={`/reservations/${record.key}/edit`} passHref>
                  <Button
                    type="text"
                    shape="circle"
                    icon={<EditOutlined />}
                    style={{ color: "#1677ff" }}
                  />
                </Link>
              </Tooltip>
            )}
            {/* Show New Contract button only when reservation is Confirmed */}
            {canCreateContract && (
              <Tooltip title="Nouveau contrat">
                <Link
                  href={`/contracts/create?reservationId=${record.key}`}
                  passHref
                >
                  <Button
                    type="text"
                    shape="circle"
                    icon={<FileAddOutlined />}
                    style={{ color: "#1677ff" }}
                  />
                </Link>
              </Tooltip>
            )}

            {/* Conditionally render the Dropdown menu */}
            {menuItems.length > 0 && (
              <Dropdown
                menu={{ items: menuItems, onClick: handleMenuClick }}
                trigger={["click"]}
              >
                <Button
                  type="text"
                  shape="circle"
                  icon={<MoreOutlined />}
                  style={{ color: "#595959" }}
                />
              </Dropdown>
            )}
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