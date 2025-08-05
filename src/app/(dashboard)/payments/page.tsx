"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Payment, PaymentMethod } from "@rentflow/database";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

const { Title, Text } = Typography;
const PaymentListTable = dynamic(
  () => import("./PaymentListTableFull"),
  {
    loading: () => <Skeleton active paragraph={{ rows: 8 }} />, 
    ssr: false, 
  }
);
type ApiPayment = Payment & {
  reservation: { id: string } | null;
  contract: { id: string } | null;
};

const translatePaymentMethod = (method: PaymentMethod): string => {
  switch (method) {
    case "CASH":
      return "Espèces";
    case "CARD":
      return "Carte";
    case "BANK_TRANSFER":
      return "Virement";
    case "CHECK":
      return "Chèque";
    default:
      return method;
  }
};


export default function PaymentsPage() {
   const [payments, setPayments] = useState<ApiPayment[]>([]);
   const [loading, setLoading] = useState(true);
     const searchParams = useSearchParams();
     const invoiceIdFilter = searchParams.get("invoiceId");

 useEffect(() => {
   const fetchPayments = async () => {
     setLoading(true);
     try {
       const url = invoiceIdFilter
         ? `/payments?invoiceId=${invoiceIdFilter}`
         : "/payments";
       const response = await api.get<ApiPayment[]>(url);
       setPayments(response.data);
     } catch (error) {
       console.error("Failed to fetch payments:", error);
       toast.error("Échec du chargement des paiements.");
     } finally {
       setLoading(false);
     }
   };
   fetchPayments();
 }, [invoiceIdFilter]); 

 const tableData = useMemo((): PaymentDataType[] => {
   return payments.map((payment) => ({
     key: payment.id,
     amount: Number(payment.amount),
     date: payment.paymentDate.toString(),
     method: translatePaymentMethod(payment.method),
     reservationId: payment.reservation?.id,
     contractId: payment.contract?.id,
   }));
 }, [payments]);

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
                {invoiceIdFilter
                  ? `Paiements pour la facture #${invoiceIdFilter.slice(-6)}`
                  : "Tous les Paiements"}
              </Title>
              <Text type="secondary">
                {tableData.length} paiements enregistrés
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
          <PaymentListTable data={tableData} loading={loading} />
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
