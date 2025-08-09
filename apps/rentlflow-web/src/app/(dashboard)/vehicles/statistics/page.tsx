"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  DatePicker,
  Progress,
  Image,
  Alert,
  Spin,
  Card,
} from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface VehicleStat {
  id: string;
  imageUrl: string;
  revenue: number;
  rentedDays: number;
  totalDaysInPeriod: number;
}

const fakeStatsData: VehicleStat[] = [
  {
    id: "1",
    imageUrl: "https://i.ibb.co/VvzS2Y2/alfa-romeo.png",
    revenue: 8300,
    rentedDays: 26,
    totalDaysInPeriod: 31,
  },
  // ... (rest of your fake data remains unchanged)
].sort((a, b) => b.revenue - a.revenue);

export default function VehicleStatisticsPage() {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [statsData, setStatsData] = useState<VehicleStat[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearch = React.useCallback(() => {
    setLoading(true);
    console.log("Recherche de statistiques pour la période:", dateRange);
    setTimeout(() => {
      setStatsData(fakeStatsData);
      setLoading(false);
    }, 1000);
  }, [dateRange]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Filter Bar */}
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Row align="middle" gutter={16}>
            <Col>
              <Text strong>Sélectionnez une plage de dates</Text>
            </Col>
            <Col>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates || [null, null])}
                style={{ borderRadius: "8px" }}
              />
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
                style={{ borderRadius: "8px" }}
                className="hover-scale"
              >
                Rechercher
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Statistics List */}
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {/* List Header */}
              <Row
                gutter={16}
                style={{
                  color: "grey",
                  fontWeight: 600,
                  backgroundColor: "#fafafa",
                  padding: "12px 8px",
                  borderRadius: "8px",
                }}
              >
                <Col span={4}>Véhicule</Col>
                <Col span={4}>Revenu</Col>
                <Col span={16}>Total de jours loués</Col>
              </Row>

              {/* List Items */}
              {statsData.map((stat) => (
                <Row
                  key={stat.id}
                  gutter={16}
                  align="middle"
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    padding: "12px 8px",
                    transition: "background-color 0.3s",
                  }}
                  className="hover-row"
                >
                  <Col span={4}>
                    <Image
                      width={80}
                      src={stat.imageUrl}
                      alt="Vehicle image"
                      preview={false}
                      style={{ borderRadius: "4px" }}
                    />
                  </Col>
                  <Col span={4}>
                    <Text strong style={{ color: "#1677ff", fontSize: "16px" }}>
                      {stat.revenue.toLocaleString("fr-FR")} MAD
                    </Text>
                  </Col>
                  <Col span={16}>
                    <Row align="middle">
                      <Col span={4}>
                        <Text>
                          {stat.rentedDays}/{stat.totalDaysInPeriod} Jours
                        </Text>
                      </Col>
                      <Col span={20}>
                        <Progress
                          percent={
                            (stat.rentedDays / stat.totalDaysInPeriod) * 100
                          }
                          showInfo={false}
                          strokeColor="#1677ff"
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              ))}
            </Space>
          )}
        </Card>

        {/* Information Note */}
        <Alert
          message="Veuillez noter que ces statistiques sont basées uniquement sur les contrats terminés (les contrats actifs ne sont pas inclus)."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ borderRadius: "8px" }}
        />
      </Space>

      <style jsx global>{`
        .hover-scale {
          transition: all 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
        .hover-row:hover {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
}
