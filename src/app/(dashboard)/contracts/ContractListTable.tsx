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
}

interface ContractListTableProps {
  data: ContractDataType[];
  loading: boolean;
}

const actionMenu = (record: ContractDataType): MenuProps => ({
  items: [
    {
      key: "1",
      label: "Télécharger le contrat",
      icon: <DownloadOutlined />,
    },
    {
      key: "2",
      label: "Télécharger la facture",
      icon: <FileTextOutlined />,
    },
    {
      key: "3",
      label: "Annuler",
      icon: <DeleteOutlined />,
      danger: true,
    },
  ],
});

 const columns: ColumnsType<ContractDataType> = [
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
   {
     title: "Total jours",
     dataIndex: "totalDays",
     key: "totalDays",
     render: (text) => <Text>{text}</Text>,
   },
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
     render: (_, record) => (
       <Space size="small">
         <Tooltip title="Voir">
           <Link href={`/contracts/${record.key}/view`} passHref>
             <Button
               type="text"
               shape="circle"
               icon={<EyeOutlined />}
               style={{ color: "#1677ff" }}
             />
           </Link>
         </Tooltip>
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
         <Tooltip title="Terminer">
           <Button
             type="text"
             shape="circle"
             icon={<CheckOutlined />}
             style={{ color: "#52c41a" }}
           />
         </Tooltip>
         <Dropdown menu={actionMenu(record)} trigger={["click"]}>
           <Button
             type="text"
             shape="circle"
             icon={<MoreOutlined />}
             style={{ color: "#595959" }}
           />
         </Dropdown>
       </Space>
     ),
   },
 ];

export default function ContractListTable({
  data,
  loading,
}: ContractListTableProps) {
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
