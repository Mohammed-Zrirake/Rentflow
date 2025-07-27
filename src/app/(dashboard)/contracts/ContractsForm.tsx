// app/(dashboard)/contracts/ContractForm.tsx
"use client";

import React, { useMemo } from "react";
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
  Divider,
  FormInstance,
} from "antd";
import {
  UserOutlined,
  CarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ContractFormSchema, ContractFormValues } from "@rentflow/database/schemas";
import { createSchemaFieldRule } from "antd-zod";
import { Client, Vehicle } from "@rentflow/database";

const { Text } = Typography;
const { Option } = Select;
const rule = createSchemaFieldRule(ContractFormSchema);

interface ContractFormProps {
  form: FormInstance<ContractFormValues>;
  clients: Client[];
  vehicles: Vehicle[]; 
  isFromReservation: boolean;
  onOpenClientDrawer: () => void;
}

export default function ContractForm({
  form,
  clients,
  vehicles,
  isFromReservation,
  onOpenClientDrawer,
}: ContractFormProps) {

    const primaryDriverId = Form.useWatch("clientId", form);
    const secondaryDriverOptions = useMemo(() => {
      return clients
        .filter((client) => client.id !== primaryDriverId) 
        .map((client) => ({
          value: client.id,
          label: `${client.firstName} ${client.lastName} (${
            client.driverLicense || "N/A"
          })`,
        }));
    }, [clients, primaryDriverId]); 
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Section Informations client */}
      <Card
        title={
          <Space>
            <UserOutlined style={{ color: "#1677ff" }} />
            <Text strong style={{ color: "#1677ff" }}>
              Informations sur les conducteurs
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
              label={<Text strong>Conducteur Principal</Text>}
              rules={[rule]}
            >
              <Select
                showSearch
                placeholder="Sélectionner le client principal"
                size="large"
                disabled={isFromReservation}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Space style={{ padding: "0 8px 4px" }}>
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={onOpenClientDrawer}
                      >
                        Ajouter un nouveau client
                      </Button>
                    </Space>
                  </>
                )}
                options={clients.map((client) => ({
                  value: client.id,
                  label: `${client.firstName} ${client.lastName} (${
                    client.driverLicense || "N/A"
                  })`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="secondaryDriverId"
              label={<Text strong>Conducteur Secondaire (Optionnel)</Text>}
              rules={[rule]}
            >
              <Select
                showSearch
                placeholder="Sélectionner le second conducteur"
                allowClear
                size="large"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Space style={{ padding: "0 8px 4px" }}>
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={onOpenClientDrawer}
                      >
                        Ajouter un nouveau client
                      </Button>
                    </Space>
                  </>
                )}
                options={secondaryDriverOptions}
                disabled={!primaryDriverId}
              />
            </Form.Item>
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
          {!isFromReservation && (
            <Col xs={24} md={12}>
              <Form.Item
                name="vehicleId"
                label={<Text strong>Véhicule</Text>}
                rules={[rule]}
              >
                <Select
                  showSearch
                  placeholder="Sélectionner un véhicule disponible"
                  size="large"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={vehicles.map((v) => ({
                    value: v.id,
                    label: `${v.make} ${v.model} (${v.licensePlate})`,
                    disabled: v.status !== "AVAILABLE",
                  }))}
                />
              </Form.Item>
            </Col>
          )}
          <Col xs={24} md={8}>
            <Form.Item
              name="pickupMileage"
              label={<Text strong>Kilométrage de départ</Text>}
              rules={[rule]}
            >
              <InputNumber
                addonAfter="Km"
                style={{ width: "100%", borderRadius: "8px" }}
                size="large"
                placeholder="Entrez le kilométrage actuel"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={16}>
            <Form.Item
              name="pickupFuelLevel"
              label={<Text strong>Niveau de carburant au départ</Text>}
              rules={[rule]}
            >
              <Slider
                min={0}
                max={100}
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
              rules={[rule]}
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
            <Form.Item name="endDate" label={<Text strong>Date de fin</Text>}>
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
                size="large"
                placeholder="Calculée"
                disabled
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
            <Form.Item name="totalCost" label={<Text strong>Coût total</Text>}>
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
                size="large"
              >
                <Select.Option value="CASH">Espèces</Select.Option>
                <Select.Option value="CARD">Carte</Select.Option>
                <Select.Option value="BANK_TRANSFER">Virement</Select.Option>
                <Select.Option value="CHECK">Chèque</Select.Option>
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
            <Form.Item name="remainingAmount" label={<Text strong>Reste</Text>}>
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
  );
}
