"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Typography,
  Space,
  Row,
  Col,
  Tabs,
  Empty,
  Card,
  Button, 
  Progress,
  Badge,
  Tag,
  Spin,
} from "antd";


import type { AlertWithDetails, Client, Vehicle } from "@rentflow/database";
import  { AlertType } from "@rentflow/database";

const { Title, Text } = Typography;


type AlertCardViewModel = {
  id: string;
  displayType: string; // User-friendly type name (e.g., "Assurance")
  title: string; // e.g., "Mercedes-Benz G Class"
  details: Record<string, string>;
  remainingValue: number;
  remainingUnit: string;
  progressPercent: number;
  isResolved: boolean;
};

const transformAlertToViewModel = (
  alert: AlertWithDetails
): AlertCardViewModel => {
  const now = new Date();
  let viewModel: Omit<AlertCardViewModel, "id" | "isResolved"> = {
    displayType: "Custom",
    title: "System Alert",
    details: { Message: alert.message },
    remainingValue: 0,
    remainingUnit: "",
    progressPercent: 0,
  };

  switch (alert.type) {
    case AlertType.INSURANCE:
    case AlertType.TECHNICAL_INSPECTION:
    case AlertType.TRAFFIC_LICENSE:
      const expiryDate = alert.dueDate ? new Date(alert.dueDate) : now;
      const totalPeriod = 30; // Assume we track alerts for 30 days
      const remainingDays = Math.max(
        0,
        Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
      );
      viewModel = {
        displayType: alert.type.replace(/_/g, " "),
        title: alert.vehicle
          ? `${alert.vehicle.make} ${alert.vehicle.model}`
          : "Unknown Vehicle",
        details: { "Date d'expiration": expiryDate.toLocaleDateString() },
        remainingValue: remainingDays,
        remainingUnit: "Jours",
        progressPercent: (remainingDays / totalPeriod) * 100,
      };
      break;

    case AlertType.OIL_CHANGE:
      const nextMileage = alert.vehicle?.nextOilChangeMileage || 0;
      const currentMileage = alert.vehicle?.mileage || 0;
      const remainingKm = Math.max(0, nextMileage - currentMileage);
      const oilChangeInterval = 10000; // Assume a 10,000 Km interval
      viewModel = {
        displayType: "Vidange",
        title: alert.vehicle
          ? `${alert.vehicle.make} ${alert.vehicle.model}`
          : "Unknown Vehicle",
        details: {
          "Prochain à": `${nextMileage.toLocaleString()} Km`,
          Actuel: `${currentMileage.toLocaleString()} Km`,
        },
        remainingValue: remainingKm,
        remainingUnit: "Km",
        progressPercent: 100 - (remainingKm / oilChangeInterval) * 100,
      };
      break;

    case AlertType.CLIENT_ARRIVAL:
    case AlertType.CUSTOM: // You can add a custom case if needed
      const arrivalDate = alert.dueDate ? new Date(alert.dueDate) : now;
      const remainingArrivalDays = Math.max(
        0,
        Math.floor((arrivalDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
      );
      viewModel = {
        displayType:
          alert.type === "CLIENT_ARRIVAL" ? "Arrivée du client" : "Custom",
        title: alert.client
          ? `${alert.client.firstName} ${alert.client.lastName}`
          : "Unknown Client",
        details: { Date: arrivalDate.toLocaleString() },
        remainingValue: remainingArrivalDays,
        remainingUnit: "Jours",
        progressPercent:
          remainingArrivalDays > 7 ? 100 : (remainingArrivalDays / 7) * 100,
      };
      break;
  }

  return { ...viewModel, id: alert.id, isResolved: alert.isResolved };
};


const AlertCard = ({ alert }: { alert: AlertCardViewModel }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "INSURANCE":
      case "TECHNICAL INSPECTION":
      case "TRAFFIC LICENSE":
        return "red";
      case "Vidange":
        return "orange";
      case "CLIENT ARRIVAL":
        return "green";
      default:
        return "blue";
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent > 85) return "#ff4d4f"; // Red when close to due
    if (percent > 60) return "#faad14"; // Orange in the middle
    return "#52c41a"; // Green when far
  };

  return (
    <Card
      style={{
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        height: "100%",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Tag color={getTypeColor(alert.displayType)}>{alert.displayType}</Tag>
          <Button
            type="primary"
            size="small"
            ghost
            disabled={alert.isResolved}
            onClick={() => {}}
          >
            {alert.isResolved ? "Résolu" : "Résoudre"}
          </Button>
        </div>

        <Text strong style={{ fontSize: "16px" }}>
          {alert.title}
        </Text>

        {Object.entries(alert.details).map(([key, value]) => (
          <div
            key={key}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Text type="secondary">{key}:</Text>
            <Text>{value}</Text>
          </div>
        ))}

        <div style={{ marginTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Restant:</Text>
            <Text strong>
              {alert.remainingValue.toLocaleString()} {alert.remainingUnit}
            </Text>
          </div>
          <Progress
            percent={alert.progressPercent}
            strokeColor={getProgressColor(alert.progressPercent)}
            showInfo={false}
            size="small"
          />
        </div>
      </Space>
    </Card>
  );
};

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState("Tout");
  const [processedAlerts, setProcessedAlerts] = useState<AlertCardViewModel[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessAlerts = async () => {
      setLoading(true);
      try {
        // --- API CALL COMMENTED OUT ---
        // const response = await axios.get('/api/alerts');
        // const rawAlerts: AlertWithDetails[] = response.data.data;

        // MOCK DATA that matches the shape of our real API response
        const rawAlerts: AlertWithDetails[] = [
          {
            id: "1",
            type: AlertType.INSURANCE,
            message: "Expiry soon",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 13)),
            isResolved: false,
            agencyId: "1",
            vehicle: {
              id: "v1",
              make: "Mercedes-Benz",
              model: "G Class",
            } as Vehicle,
            client: null,
            createdAt: new Date(),
            vehicleId: "v1",
            clientId: null,
          },
          {
            id: "2",
            type: AlertType.TECHNICAL_INSPECTION,
            message: "Expiry soon",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 12)),
            isResolved: false,
            agencyId: "1",
            vehicle: { id: "v2", make: "Peugeot", model: "2008" } as Vehicle,
            client: null,
            createdAt: new Date(),
            vehicleId: "v2",
            clientId: null,
          },
          {
            id: "3",
            type: AlertType.OIL_CHANGE,
            message: "Oil change needed",
            dueDate: null,
            isResolved: false,
            agencyId: "1",
            vehicle: {
              id: "v3",
              make: "Dacia",
              model: "Sandero",
              mileage: 8300,
              nextOilChangeMileage: 10000,
            } as Vehicle,
            client: null,
            createdAt: new Date(),
            vehicleId: "v3",
            clientId: null,
          },
          {
            id: "4",
            type: AlertType.CLIENT_ARRIVAL,
            message: "Client arrival",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
            isResolved: false,
            agencyId: "1",
            vehicle: null,
            client: { id: "c1", firstName: "Abdellah", lastName: "Brache" } as Client,
            createdAt: new Date(),
            vehicleId: null,
            clientId: "c1",
          },
          {
            id: "5",
            type: AlertType.INSURANCE,
            message: "Expiry soon",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
            isResolved: true,
            agencyId: "1",
            vehicle: { id: "v4", make: "Renault", model: "Clio" } as Vehicle,
            client: null,
            createdAt: new Date(),
            vehicleId: "v4",
            clientId: null,
          },
        ];
        const viewModels = rawAlerts.map(transformAlertToViewModel);

        setTimeout(() => {
          setProcessedAlerts(viewModels);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Failed to process alerts:", error);
        setLoading(false);
      }
    };
    fetchAndProcessAlerts();
  }, []);


  const filteredAlerts = useMemo(() => {
    if (activeTab === "Tout") {
      return processedAlerts;
    }
    return processedAlerts.filter((alert) => alert.displayType === activeTab);
  }, [activeTab, processedAlerts]);

  const alertTypes = useMemo(
    () => [...new Set(processedAlerts.map((a) => a.displayType))],
    [processedAlerts]
  );

  const getCountForType = (type: string) => {
    return processedAlerts.filter((alert) => alert.displayType === type).length;
  };

  const tabItems = [
    { key: "Tout", label: "Tout" },
    ...alertTypes.map((type) => ({
      key: type,
      label: (
        <Space>
          {type}
          <Badge count={getCountForType(type)} color="#f5222d" />
        </Space>
      ),
    })),
  ];

  if (loading) {
    return (
      <Spin
        size="large"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Row align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                Alertes
              </Title>
              <Text type="secondary">
                {processedAlerts.length} alertes au total
              </Text>
            </Col>
          </Row>
        </Card>

        <Card bordered={false} bodyStyle={{ padding: "0" }}>
          <Tabs
            defaultActiveKey="Tout"
            items={tabItems}
            onChange={setActiveTab}
            style={{ padding: "0 16px" }}
          />
        </Card>

        {filteredAlerts.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredAlerts.map((alert) => (
              <Col key={alert.id} xs={24} sm={12} lg={8}>
                <AlertCard alert={alert} />
              </Col>
            ))}
          </Row>
        ) : (
          <Card
            bordered={false}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
            }}
          >
            <Empty description="Aucune alerte dans cette catégorie" />
          </Card>
        )}
      </Space>
    </div>
  );
}
