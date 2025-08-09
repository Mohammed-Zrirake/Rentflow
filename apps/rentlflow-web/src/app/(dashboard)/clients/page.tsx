"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Typography,
  Button,
  Space,
  Input,
  Row,
  Col,
  Tooltip,
  Card,
  Tag,
  Skeleton,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  FileAddOutlined,
  CalendarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import dynamic from "next/dynamic"; 
import api from "@/lib/api";
import type { Client } from "@rentflow/database";
import { useDebounce } from "@/lib/hooks/useDebounce";

import type { ClientDataType } from "./ClientListTable";
type ApiClient = Client;

const { Title, Text } = Typography;
const ClientListTable = dynamic(() => import("./ClientListTable"), {
  loading: () => <Skeleton active paragraph={{ rows: 5 }} />,
  ssr: false, 
});
const mapApiClientToTableData = (client: ApiClient): ClientDataType => ({
  key: client.id,
  nomComplet: `${client.firstName} ${client.lastName}`,
  cin: client.cin ?? "N/A",
  permis: client.driverLicense,
  telephone: client.phone,
});

export default function ClientsPage() {
  const [clients, setClients]     = useState<ApiClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 300);


  useEffect(() => {
    setIsLoading(true);
    const fetchClients = async () => {
      try {
        const response = await api.get<ApiClient[]>("/clients", {
          params: { search: debouncedSearchText },
        });
        setClients(response.data);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        // Add toast error notification
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [debouncedSearchText]); 

const tableData = clients.map(mapApiClientToTableData);

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <Card variant="borderless">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                Clients
              </Title>
              {isLoading ? (
                <Text type="secondary">Chargement...</Text>
              ) : (
                <Text type="secondary">{clients.length} clients trouvés</Text>
              )}
            </Col>
            <Col>
              <Link href="/clients/create" passHref>
                <Button type="primary" icon={<PlusOutlined />}>
                  Nouveau client
                </Button>
              </Link>
            </Col>
          </Row>
        </Card>

        {/* Search Bar */}
        <Card variant="borderless">
          <Input
            placeholder="Rechercher par nom du client"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "300px" }}
            size="large"
          />
        </Card>

        {/* Clients Table */}
        <Card variant="borderless">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          ) : (
            <ClientListTable data={tableData} />
          )}
        </Card>
      </Space>

      <style jsx global>{`
        .hover-scale {
          transition: all 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-table-row:hover {
          background: #f5f5f5 !important;
        }
      `}</style>
    </div>
  );
}
