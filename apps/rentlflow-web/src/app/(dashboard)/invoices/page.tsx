"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Typography, Space, Row, Col, Segmented, Card, Skeleton } from "antd";
const { Title, Text } = Typography;
import type { InvoiceDataType } from "./InvoiceListTable";
import { Invoice, InvoiceStatus } from "@rentflow/database";
import api from "@/lib/api";
import { toast } from "react-toastify";
// Already destructured Title and Text above

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


type ApiInvoice = Invoice;

// --- Fonction Helper pour traduire le statut ---
const mapStatusToFrench = (
  status: InvoiceStatus
): InvoiceDataType["status"] => {
  switch (status) {
    case "PAID":
      return "Payé";
    case "PARTIALLY_PAID":
      return "Partiellement payé";
    case "PENDING":
      return "En attente";
    case "VOID":
      return "Annulé";
    default:
      return "En attente";
  }
};



export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | number>(
    "Partiellement payé"
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false); 
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceDataType | null>(null);
    

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiInvoice[]>("/invoices");
      setInvoices(response.data);
    } catch (error) {
      toast.error("Échec du chargement des factures.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInvoices();
  }, []);

  const showPaymentModal = (invoice: InvoiceDataType) => {
    setSelectedInvoice(invoice);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedInvoice(null);
  };

  const tableData = useMemo((): InvoiceDataType[] => {
    return invoices.map((invoice) => ({
      key: invoice.id,
      totalAmount: Number(invoice.totalAmount),
      paidAmount: Number(invoice.amountPaid),
      status: mapStatusToFrench(invoice.status),
      reservationId: invoice.reservationId ?? undefined,
      contractId: invoice.contractId ?? undefined,
    }));
  }, [invoices]);

  const filteredData = useMemo(() => {
    if (activeStatusFilter === "Tous") {
      return tableData;
    }
    return tableData.filter((invoice) => invoice.status === activeStatusFilter);
  }, [tableData, activeStatusFilter]);

  const handlePaymentSubmit = async (values: {
    amount: number;
    method: string;
  }) => {
    if (!selectedInvoice) return;
       setIsSubmittingPayment(true); 

    try {
      await api.post(`/invoices/${selectedInvoice.key}/payments`, values);
      toast.success("Paiement ajouté avec succès !");
      fetchInvoices(); 
      handleModalCancel();
    } catch (error) {
      toast.error(
        (error as any).response?.data?.message ||
          "Erreur lors de l'ajout du paiement."
      );
    }
    finally {
      setIsSubmittingPayment(false); 
    }
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
              {!loading && (
                <Text type="secondary">
                  {tableData.length} factures enregistrées
                </Text>
              )}
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
            loading={loading}
          />
        </Card>
      </Space>

      {isModalVisible && (
        <AddPaymentModal
          open={isModalVisible}
          onCancel={handleModalCancel}
          onSubmit={handlePaymentSubmit}
          invoice={selectedInvoice}
          submitting={isSubmittingPayment}
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
