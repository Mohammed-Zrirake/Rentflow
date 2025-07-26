// app/(dashboard)/clients/ClientListTable.tsx

"use client";

import React from "react";
import { Table, Space, Tooltip, Button, Tag, Typography } from "antd";
import {
  EditOutlined,
  FileAddOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";

const { Text } = Typography;


export interface ClientDataType {
  key: string;
  nomComplet: string;
  cin: string;
  permis: string;
  telephone: string;
}

interface ClientListTableProps {
  data: ClientDataType[];
}


const columns: ColumnsType<ClientDataType> = [
  {
    title: "Nom complet",
    dataIndex: "nomComplet",
    key: "nomComplet",
    render: (text) => <Text strong>{text}</Text>,
  },
  {
    title: "CIN / Passport",
    dataIndex: "cin",
    key: "cin",
    render: (text) => <Tag color="blue">{text}</Tag>,
  },
  {
    title: "Permis de conduire",
    dataIndex: "permis",
    key: "permis",
  },
  {
    title: "Numéro de téléphone",
    dataIndex: "telephone",
    key: "telephone",
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space size="small">
        <Tooltip title="Modifier">
          <Link href={`/clients/${record.key}/edit`} passHref>
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined />}
              style={{ color: "#1677ff" }}
            />
          </Link>
        </Tooltip>
        <Tooltip title="Nouveau contrat">
          <Link href={`/contracts/create?clientId=${record.key}`} passHref>
            <Button
              type="text"
              shape="circle"
              icon={<FileAddOutlined />}
              style={{ color: "#1677ff" }}
            />
          </Link>
        </Tooltip>
        <Tooltip title="Nouvelle réservation">
          <Link href={`/reservations/create?clientId=${record.key}`} passHref>
            <Button
              type="text"
              shape="circle"
              icon={<CalendarOutlined />}
              style={{ color: "#1677ff" }}
            />
          </Link>
        </Tooltip>
      </Space>
    ),
  },
];

export default function ClientListTable({ data }: ClientListTableProps) {
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
