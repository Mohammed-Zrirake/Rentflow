// app/(dashboard)/users/TeamListTable.tsx
"use client";

import React from "react";
import { Table, Button, Tag, Typography, Tooltip,Space,TableProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined } from "@ant-design/icons";
import Link from "next/link";
import { Role } from "@rentflow/database";


const { Text } = Typography;

// The interface is defined and exported here
export interface TeamMemberDataType {
  key: string;
  name: string;
  email: string;
  role: "Admin" | "Membre";
  status: "Actif" | "Inactif";
}

// The props this component accepts
interface TeamListTableProps {
  data: TeamMemberDataType[];
  currentUserRole?: Role;
}

// The columns definition for the table


export default function TeamListTable({ data,currentUserRole }: TeamListTableProps) {
  const columns: ColumnsType<TeamMemberDataType> = [
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Rôle",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag
          color={role === "Admin" ? "blue" : "default"}
          style={{ borderRadius: "4px" }}
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={status === "Actif" ? "green" : "red"}
          style={{ borderRadius: "4px" }}
        >
          {status}
        </Tag>
      ),
    },
  ];
    if(currentUserRole === 'ADMIN') {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space> {/* Use Space for better alignment of future buttons */}
          <Tooltip title="Modifier">
            <Link href={`/users/${record.key}/edit`} passHref>
              <Button
                type="text"
                shape="circle"
                icon={<EditOutlined />}
                style={{ color: "#1677ff" }}
              />
            </Link>
          </Tooltip>
        </Space>
      ),
    });
  }
  
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
    />
  );
}
