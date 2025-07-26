"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  Typography,
  Space,
  Row,
  Col,
  Card,
  Skeleton, 
} from "antd";
import dayjs from "dayjs";
import type { PaymentDataType } from "./PaymentListTableFull";

const { Title, Text } = Typography;
const PaymentListTable = dynamic(
  () => import("./PaymentListTableFull"),
  {
    loading: () => <Skeleton active paragraph={{ rows: 8 }} />, 
    ssr: false, 
  }
);
const fakePaymentsData: PaymentDataType[] = [
  {
    key: "PAY-001",
    amount: 200.0,
    date: "2025-07-02 16:46",
    method: "cash",
    contractId: "1228",
  },
  {
    key: "PAY-002",
    amount: 1000.0,
    date: "2025-07-02 16:33",
    method: "cash",
    reservationId: "117",
  },
  {
    key: "PAY-003",
    amount: 1500.0,
    date: "2025-07-02 16:26",
    method: "cash",
    contractId: "1228",
  },
  {
    key: "PAY-004",
    amount: 450.0,
    date: "2025-06-15 11:00",
    method: "card",
    contractId: "1229",
  },
];

export default function PaymentsPage() {
  const sortedData = [...fakePaymentsData].sort(
    (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()
  );

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
                Paiements
              </Title>
              <Text type="secondary">
                {sortedData.length} paiements enregistrés
              </Text>
            </Col>
          </Row>
        </Card>
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <PaymentListTable data={sortedData} />
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
        .ant-tag {
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
