"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Typography, Space, Row, Col, Segmented, Card, Skeleton } from "antd";
import type { InvoiceDataType } from "./InvoiceListTable";

const { Title } = Typography;
const InvoiceListTable = dynamic(() => import("./InvoiceListTable"), {
  loading: () => <Skeleton active paragraph={{ rows: 8 }} />,
  ssr: false,
});

const AddPaymentModal = dynamic(
  () => import("./AddPaymentModal"),
  {
    ssr: false,
  }
);

const fakeInvoicesData: InvoiceDataType[] = [
  {
    key: "INV-001",
    totalAmount: 1200.0,
    paidAmount: 1000.0,
    status: "Partiellement payé",
    reservationId: "117",
  },
  {
    key: "INV-002",
    totalAmount: 800.0,
    paidAmount: 800.0,
    status: "Payé",
    contractId: "1228",
  },
  {
    key: "INV-003",
    totalAmount: 500.0,
    paidAmount: 0.0,
    status: "En attente",
    reservationId: "118",
  },
  {
    key: "INV-004",
    totalAmount: 300.0,
    paidAmount: 0.0,
    status: "Annulé",
    reservationId: "119",
  },
];

export default function InvoicesPage() {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | number>(
    "Partiellement payé"
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceDataType | null>(null);
  const filteredData = useMemo(() => {
    if (activeStatusFilter === "Tous") {
      return fakeInvoicesData;
    }
    return fakeInvoicesData.filter(
      (invoice) => invoice.status === activeStatusFilter
    );
  }, [activeStatusFilter]);

  const showPaymentModal = (invoice: InvoiceDataType) => {
    setSelectedInvoice(invoice);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedInvoice(null);
  };

  const handlePaymentSubmit = (values: any) => {
    console.log(
      "Nouveau paiement pour la facture",
      selectedInvoice?.key,
      ":",
      values
    );
    // Add API call logic here
    handleModalCancel();
  };

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                Factures
              </Title>
            </Col>
          </Row>
        </Card>

        {/* Filters */}
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Segmented
            options={[
              "Tous",
              "Payé",
              "Partiellement payé",
              "En attente",
              "Annulé",
            ]}
            value={activeStatusFilter}
            onChange={setActiveStatusFilter}
            size="large"
          />
        </Card>

        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <InvoiceListTable
            data={filteredData}
            onAddPayment={showPaymentModal}
          />
        </Card>
      </Space>

      {isModalVisible && (
        <AddPaymentModal
          open={isModalVisible}
          onCancel={handleModalCancel}
          onSubmit={handlePaymentSubmit}
          invoice={selectedInvoice}
        />
      )}

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
