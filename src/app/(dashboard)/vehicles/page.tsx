"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Segmented,
  Card,
  Skeleton,
  Spin,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import api from "@/lib/api";
import type { Vehicle, VehicleImage, VehicleStatus } from "@rentflow/database";
import type { VehicleDataType } from "./VehicleListTable";
import { toast } from "react-toastify";


type ApiVehicle = Vehicle & { images: VehicleImage[] };
const { Title, Text } = Typography;
const VehicleListTable = dynamic(() => import("./VehicleListTable"), {
  loading: () => <Skeleton active paragraph={{ rows: 8 }} />,
  ssr: false,
});


const statusMap: Record<VehicleStatus, string> = {
  AVAILABLE: "Disponible",
  RENTED: "Loué",
  RESERVED: "Réservé",
  MAINTENANCE: "Maintenance",
  INACTIVE: "Inactif",
};

const mapApiVehicleToTableData = (vehicle: ApiVehicle): VehicleDataType => ({
  key: vehicle.id,
  imageUrl: vehicle.images?.[0]?.url
    ? `${process.env.NEXT_PUBLIC_API_URL}${vehicle.images[0].url}`
    : "/default-vehicle-image.png", 
  status: statusMap[vehicle.status] as VehicleDataType["status"],
  licensePlate: vehicle.licensePlate,
  model: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
  mileage: vehicle.mileage,
  dailyRate: Number(vehicle.dailyRate),
});

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("Tous");

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<ApiVehicle[]>("/vehicles");
        setVehicles(response.data);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        toast.error("Erreur lors du chargement des véhicules.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filteredData = useMemo(() => {
    const tableData = vehicles.map(mapApiVehicleToTableData);
    if (activeStatusFilter === "Tous") {
      return tableData;
    }
    return tableData.filter((vehicle) => vehicle.status === activeStatusFilter);
  }, [vehicles, activeStatusFilter]);

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <Card variant="borderless">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                Véhicules
              </Title>
              {isLoading ? (
                <Text type="secondary">Chargement des véhicules...</Text>
              ) : (
                <Text type="secondary">
                  {filteredData.length} véhicule(s) trouvé(s)
                </Text>
              )}
            </Col>
            <Col>
              <Link href="/vehicles/create" passHref>
                <Button type="primary" icon={<PlusOutlined />}>
                  Nouveau véhicule
                </Button>
              </Link>
            </Col>
          </Row>
        </Card>

        {/* Status Filters */}
        <Card variant="borderless">
          <Segmented
            options={[
              "Tous",
              "Disponible",
              "Loué",
              "Réservé",
              "Maintenance",
              "Inactif",
            ]}
            value={activeStatusFilter}
            onChange={(value) => setActiveStatusFilter(String(value))}
            size="large"
          />
        </Card>

        {/* Vehicles Table */}
        <Card variant="borderless">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          ) : (
            <VehicleListTable data={filteredData} />
          )}
        </Card>
      </Space>

      <style jsx global>{`
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
