// app/(dashboard)/contracts/ContractForm.tsx
"use client";

import React from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  DatePicker,
  Radio,
  Slider,
  InputNumber,
  Space,
  Typography,
  Card,
} from "antd";
import {
  UserOutlined,
  CarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

interface ContractFormProps {
  form: any; // Antd form instance
  onFinish: (values: any) => void;
}

export default function ContractForm({ form, onFinish }: ContractFormProps) {
  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Section Informations client */}
        <Card
          title={
            <Space>
              <UserOutlined style={{ color: "#1677ff" }} />
              <Text strong style={{ color: "#1677ff" }}>
                Informations client
              </Text>
            </Space>
          }
          headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="clientId"
                label={<Text strong>Client</Text>}
                rules={[{ required: true, message: "Ce champ est requis" }]}
              >
                <Select
                  placeholder="Sélectionner un client"
                  style={{ borderRadius: "8px" }}
                  size="large"
                >
                  <Option value="1">Amine Alami (CD4933029)</Option>
                  <Option value="2">Fatima Zahra (AB123456)</Option>
                </Select>
              </Form.Item>
              <Button
                type="link"
                icon={<PlusOutlined />}
                style={{ paddingLeft: 0, color: "#1677ff", fontWeight: 500 }}
                className="hover-underline"
              >
                Nouveau client
              </Button>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="secondDriverId"
                label={<Text strong>Deuxième conducteur</Text>}
              >
                <Select
                  placeholder="Sélectionner un deuxième conducteur"
                  allowClear
                  style={{ borderRadius: "8px" }}
                  size="large"
                >
                  <Option value="2">Fatima Zahra (AB123456)</Option>
                  <Option value="3">Youssef El Fassi (XY987654)</Option>
                </Select>
              </Form.Item>
              <Button
                type="link"
                icon={<PlusOutlined />}
                style={{ paddingLeft: 0, color: "#1677ff", fontWeight: 500 }}
                className="hover-underline"
              >
                Nouveau client
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Section Véhicule */}
        <Card
          title={
            <Space>
              <CarOutlined style={{ color: "#1677ff" }} />
              <Text strong style={{ color: "#1677ff" }}>
                Véhicule
              </Text>
            </Space>
          }
          headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="vehicleId"
                label={<Text strong>Véhicule</Text>}
                rules={[{ required: true, message: "Ce champ est requis" }]}
              >
                <Select
                  placeholder="Sélectionner un véhicule"
                  style={{ borderRadius: "8px" }}
                  size="large"
                >
                  <Option value="v1">Dacia Logan (1234-A-56)</Option>
                  <Option value="v2">Renault Clio (5678-B-21)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="startMileage"
                label={<Text strong>Kilométrage de départ</Text>}
                rules={[{ required: true, message: "Ce champ est requis" }]}
              >
                <InputNumber
                  addonAfter="Km"
                  style={{ width: "100%", borderRadius: "8px" }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="vehicleState"
                label={<Text strong>État du véhicule</Text>}
              >
                <Radio.Group>
                  <Radio.Button value="Bon">Bon</Radio.Button>
                  <Radio.Button value="Moyen">Moyen</Radio.Button>
                  <Radio.Button value="Endommagé">Endommagé</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="fuelLevel"
                label={<Text strong>Niveau de carburant</Text>}
              >
                <Slider
                  marks={{
                    0: "0%",
                    25: "25%",
                    50: "50%",
                    75: "75%",
                    100: "100%",
                  }}
                  trackStyle={{ backgroundColor: "#1677ff" }}
                  handleStyle={{ borderColor: "#1677ff" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Section Périodes & tarifs */}
        <Card
          title={
            <Space>
              <CalendarOutlined style={{ color: "#1677ff" }} />
              <Text strong style={{ color: "#1677ff" }}>
                Périodes & tarifs de location
              </Text>
            </Space>
          }
          headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Row gutter={24}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="startDate"
                label={<Text strong>Date de début</Text>}
                rules={[{ required: true, message: "Ce champ est requis" }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: "100%", borderRadius: "8px" }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="durationDays"
                label={<Text strong>Nombre de jours</Text>}
                rules={[{ required: true, message: "Ce champ est requis" }]}
              >
                <InputNumber
                  addonAfter="Jours"
                  style={{ width: "100%", borderRadius: "8px" }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label={<Text strong>Date de fin</Text>}>
                <Input
                  placeholder="Calculée automatiquement"
                  disabled
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="dailyRate"
                label={<Text strong>Tarif journalier</Text>}
                rules={[{ required: true, message: "Ce champ est requis" }]}
              >
                <InputNumber
                  addonAfter="MAD"
                  style={{ width: "100%", borderRadius: "8px" }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label={<Text strong>Coût total</Text>}>
                <InputNumber
                  addonAfter="MAD"
                  style={{ width: "100%", borderRadius: "8px" }}
                  disabled
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Section Paiement */}
        <Card
          title={
            <Space>
              <CreditCardOutlined style={{ color: "#1677ff" }} />
              <Text strong style={{ color: "#1677ff" }}>
                Détails du paiement (Facultatif)
              </Text>
            </Space>
          }
          headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="paymentMethod"
                label={<Text strong>Méthode de paiement</Text>}
              >
                <Select
                  placeholder="Sélectionner une méthode"
                  allowClear
                  style={{ borderRadius: "8px" }}
                  size="large"
                >
                  <Option value="cash">Espèces</Option>
                  <Option value="card">Carte bancaire</Option>
                  <Option value="transfer">Virement</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="amountPaid" label={<Text strong>Montant</Text>}>
                <InputNumber
                  addonAfter="MAD"
                  style={{ width: "100%", borderRadius: "8px" }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={<Text strong>Reste</Text>}>
                <InputNumber
                  addonAfter="MAD"
                  style={{ width: "100%", borderRadius: "8px" }}
                  disabled
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Action Buttons */}
        <Row justify="end">
          <Space>
            <Button
              onClick={() => form.resetFields()}
              size="large"
              style={{ width: "120px", borderRadius: "8px", fontWeight: 500 }}
            >
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                width: "160px",
                borderRadius: "8px",
                fontWeight: 500,
                boxShadow: "0 2px 8px rgba(22, 119, 255, 0.3)",
              }}
              className="hover-scale"
            >
              Enregistrer
            </Button>
          </Space>
        </Row>

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
    </Form>
  );
}
