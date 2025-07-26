"use client";
import React from "react";
import { Row, Col, Card, Statistic, Space,Skeleton } from "antd";
import {
  CarOutlined,
  FileDoneOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
const BookingCalendar = dynamic(
  () => import("./BookingCalendar"),
  {
    // This is what users will see while the calendar component is loading
    loading: () => <Skeleton active paragraph={{ rows: 8 }} />,
    // For highly interactive components, it's often best to disable SSR
    // as they can't be fully interactive until the JS loads anyway.
    ssr: false,
  }
);

interface DashboardData {
  bookingData: any[]; // Or a more specific type
  stats: any; // Or a more specific type
}




export default function DashboardHomePage({ initialData }: { initialData: DashboardData }) {
  const { stats, bookingData } = initialData;
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
  
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              border: "1px solid #f0f0f0",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title="Véhicules disponibles"
              value={stats.vehiclesAvailable}
              prefix={<CarOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              border: "1px solid #f0f0f0",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title="Contrats actifs"
              value={stats.activeContracts}
              prefix={<FileDoneOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              border: "1px solid #f0f0f0",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title="Réservations en attente"
              value={stats.pendingReservations}
              prefix={<FieldTimeOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16", fontWeight: 600 }}
            />
          </Card>
        </Col>

      </Row>

  
      <div
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
          border: "1px solid #f0f0f0",
          background: "#fff",
          padding: "16px",
        }}
      >
        <BookingCalendar data={bookingData} />
      </div>

      <style jsx global>{`
        .hover-scale {
          transition: all 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
        .ant-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </Space>
  );
}
