"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Card,
  Dropdown,
  Skeleton,
  Spin,
} from "antd";
import type { MenuProps } from "antd/es/menu";
import {
  EyeOutlined,
  MoreOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import dayjs from "dayjs";
import { Form } from "antd";

const { Title, Text } = Typography;
const ContractForm = dynamic(() => import("../../ContractsForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 20 }} />,
  ssr: false,
});

const fakeContractData = {
  id: "1228",
  client: "amine alami (CD4933029)",
  vehicle: "Alfa Romeo 2024 (49388821)",
  mileage: 20000,
  vehicleState: "Bon",
  fuelLevel: 15,
  startDate: "2025-02-07T16:25:00",
  duration: 5,
  endDate: "2025-07-07T16:25:00",
  dailyRate: 400,
  totalCost: 2000,
};

const actionMenu: MenuProps = {
  items: [
    { key: "1", label: "Télécharger le contrat", icon: <DownloadOutlined /> },
    { key: "2", label: "Télécharger la facture", icon: <FileTextOutlined /> },
    { type: "divider" },
    { key: "3", label: "Supprimer", icon: <DeleteOutlined />, danger: true },
  ],
};

export default function EditContractPage({
  params,
}: {
  params: { contractId: string };
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialValues = {
      ...fakeContractData,
      startDate: fakeContractData.startDate
        ? dayjs(fakeContractData.startDate)
        : null,
      endDate: fakeContractData.endDate
        ? dayjs(fakeContractData.endDate)
        : null,
    };
    form.setFieldsValue(initialValues);
    setLoading(false);
  }, [params.contractId, form]);

  const onFinish = (values: any) => {
    console.log("Formulaire soumis:", values);
    // Add API call logic here to update the contract
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header - This loads instantly */}
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center">
                <Link href="/contracts" passHref>
                  <Button
                    type="text"
                    shape="circle"
                    icon={<ArrowLeftOutlined />}
                    style={{ color: "#1677ff" }}
                  />
                </Link>
                <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                  Modifier le contrat #{fakeContractData.id}
                </Title>
              </Space>
            </Col>
            <Col>
              <Space>
                <Link href={`/contracts/${params.contractId}/view`} passHref>
                  <Button
                    icon={<EyeOutlined />}
                    style={{ borderRadius: "8px" }}
                  >
                    Voir
                  </Button>
                </Link>
                <Dropdown menu={actionMenu} trigger={["click"]}>
                  <Button
                    icon={<MoreOutlined />}
                    style={{ borderRadius: "8px" }}
                  >
                    Actions
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* --- DYNAMIC FORM RENDER --- */}
        <ContractForm form={form} onFinish={onFinish} />

        <style jsx global>{`
          .hover-scale {
            transition: all 0.2s ease;
          }
          .hover-scale:hover {
            transform: scale(1.02);
          }
          .hover-underline:hover {
            text-decoration: underline;
            text-underline-offset: 4px;
          }
          .ant-radio-button-wrapper-checked:not(
              .ant-radio-button-wrapper-disabled
            ) {
            color: #1677ff;
            border-color: #1677ff;
          }
          .ant-radio-button-wrapper-checked:not(
              .ant-radio-button-wrapper-disabled
            ):hover {
            color: #4096ff;
            border-color: #4096ff;
          }
          .ant-radio-button-wrapper-checked:not(
              .ant-radio-button-wrapper-disabled
            )::before {
            background-color: #1677ff !important;
          }
        `}</style>
      </Space>
    </div>
  );
}
