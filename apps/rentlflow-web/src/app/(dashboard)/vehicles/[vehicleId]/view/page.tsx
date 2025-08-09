"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Card,
  Descriptions,
  Tag,
  Skeleton,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import api from "@/lib/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import type { Vehicle, VehicleImage, VehicleStatus } from "@rentflow/database";

const { Title, Text } = Typography;


type VehicleWithImages = Vehicle & {
  images: VehicleImage[];
};

const getStatusTag = (status: VehicleStatus) => {
  switch (status) {
    case "AVAILABLE":
      return <Tag color="green">Disponible</Tag>;
    case "RENTED":
      return <Tag color="red">Loué</Tag>;
    case "RESERVED":
      return <Tag color="orange">Réservé</Tag>;
    case "MAINTENANCE":
      return <Tag color="blue">En Maintenance</Tag>;
    case "INACTIVE":
      return <Tag color="default">Inactif</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};


export default function ViewVehiclePage({
  params,
}: {
  params: { vehicleId: string };
}) {
  const [vehicle, setVehicle] = useState<VehicleWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const response = await api.get<VehicleWithImages>(
          `/vehicles/${params.vehicleId}`
        );
        setVehicle(response.data);
      } catch (err) {
        setError("Impossible de charger les données du véhicule.");
        toast.error("Échec du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    if (params.vehicleId) {
      fetchVehicle();
    }
  }, [params.vehicleId]);

  if (loading)
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  if (error)
    return (
      <div style={{ padding: 24 }}>
        <Alert message="Erreur" description={error} type="error" showIcon />
      </div>
    );
  if (!vehicle)
    return (
      <div style={{ padding: 24 }}>
        <Alert message="Véhicule non trouvé" type="warning" showIcon />
      </div>
    );

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <Card bordered={false}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center">
                <Link href="/vehicles">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<ArrowLeftOutlined />}
                  />
                </Link>
                <Title level={3} style={{ margin: 0 }}>
                  {`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
                </Title>
                {getStatusTag(vehicle.status)}
              </Space>
            </Col>
            <Col>
              <Link href={`/vehicles/${params.vehicleId}/edit`}>
                <Button icon={<EditOutlined />}>Modifier</Button>
              </Link>
            </Col>
          </Row>
        </Card>

        {/* Informations Générales */}
        <Card
          title={
            <Space>
              <CarOutlined /> Informations Générales
            </Space>
          }
        >
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Marque">{vehicle.make}</Descriptions.Item>
            <Descriptions.Item label="Modèle">
              {vehicle.model}
            </Descriptions.Item>
            <Descriptions.Item label="Année">{vehicle.year}</Descriptions.Item>
            <Descriptions.Item label="Plaque d'immatriculation">
              {vehicle.licensePlate}
            </Descriptions.Item>
            <Descriptions.Item label="Tarif Journalier">
              {Number(vehicle.dailyRate).toFixed(2)} MAD
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Suivi et Maintenance */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined /> Suivi & Maintenance
            </Space>
          }
        >
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Kilométrage Actuel">
              <Text strong style={{ color: "#1677ff" }}>
                {vehicle.mileage.toLocaleString()} Km
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Prochaine Vidange (Km)">
              {vehicle.nextOilChangeMileage?.toLocaleString() || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Expiration Assurance">
              {vehicle.insuranceExpiryDate
                ? dayjs(vehicle.insuranceExpiryDate).format("DD/MM/YYYY")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Expiration Visite Technique">
              {vehicle.technicalInspectionExpiryDate
                ? dayjs(vehicle.technicalInspectionExpiryDate).format(
                    "DD/MM/YYYY"
                  )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item
              label="Expiration Autorisation de Circulation"
              span={2}
            >
              {vehicle.trafficLicenseExpiryDate
                ? dayjs(vehicle.trafficLicenseExpiryDate).format("DD/MM/YYYY")
                : "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
}
