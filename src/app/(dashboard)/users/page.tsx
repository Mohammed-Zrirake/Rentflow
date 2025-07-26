/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

// Extend the session user type to include 'role'
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user?: User;
  }
}
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Card,
  Alert,
  Skeleton,
  Spin, 
} from "antd";
import { PlusOutlined, InfoCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import type { TeamMemberDataType } from "./TeamListTable";
import api from "@/lib/api";
import type { User, Role, UserStatus } from "@rentflow/database";
export type ApiUser = Omit<User, "password">;

const { Title, Text } = Typography;
const TeamListTable = dynamic(() => import("./TeamListTable"), {
  loading: () => <Skeleton active paragraph={{ rows: 5 }} />, 
  ssr: false, 
});

const mapApiUserToTableData = (user: ApiUser): TeamMemberDataType => ({
  key: user.id,
  name: user.name ?? "N/A",
  email: user.email,
  role: user.role === "ADMIN" ? "Admin" : "Membre",
  status: user.status === "ACTIVE" ? "Actif" : "Inactif",
});


export default function TeamPage() {
   const { data: session } = useSession();
    const currentUserRole = session?.user?.role;
     const [users, setUsers] = useState<ApiUser[]>([]);
     const [isLoading, setIsLoading] = useState(true);


 useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<ApiUser[]>('/users'); // Expect an array of ApiUser
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
        // You can add a toast notification here for the error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);
  const tableData = users.map(mapApiUserToTableData);

  const alertMessage = (
    <div>
      <p>
        Voici une liste de tous les utilisateurs de votre équipe. Vous pouvez
        ajouter, modifier ou bloquer des membres de l'équipe.
      </p>
      <p>
        Si vous voyez ce message, cela signifie que vous êtes le propriétaire de
        l'équipe (admin).
      </p>
      <p>
        Tous les membres de l'équipe ont les mêmes permissions que vous, à
        l'exception de la possibilité d'ajouter ou de supprimer des membres de
        l'équipe.
      </p>
    </div>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Only show the detailed alert to Admins */}
        {currentUserRole === "ADMIN" && (
          <Card variant="borderless">
            <Alert
              message={alertMessage}
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />
          </Card>
        )}

        {/* Header with title and button */}
        <Card variant="borderless">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                Équipe
              </Title>
              {isLoading ? (
                <Text type="secondary">Chargement des membres...</Text>
              ) : (
                <Text type="secondary">
                  {users.length} membres dans l'équipe
                </Text>
              )}
            </Col>
            {/* 8. Conditionally render the "Add Member" button based on role */}
            {currentUserRole === "ADMIN" && (
              <Col>
                <Link href="/users/create" passHref>
                  <Button type="primary" icon={<PlusOutlined />}>
                    Nouveau membre
                  </Button>
                </Link>
              </Col>
            )}
          </Row>
        </Card>

        {/* Members Table */}
        <Card variant="borderless">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          ) : (
            <TeamListTable data={tableData} currentUserRole={currentUserRole} />
          )}
        </Card>
      </Space>

      {/* Your global styles remain the same */}
      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-table-row:hover {
          background: #f5f5f5 !important;
        }
        .ant-tag {
          border-radius: 4px;
        }
        .ant-btn-circle {
          border-radius: 50% !important;
        }
      `}</style>
    </div>
  );
}
