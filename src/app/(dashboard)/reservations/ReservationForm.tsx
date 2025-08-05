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
  InputNumber,
  Space,
  Typography,
  Card,
  Divider,
  Tag,
  Alert,
} from "antd";
import {
  UserOutlined,
  CarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  PlusOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { createSchemaFieldRule } from "antd-zod";
import {
  ReservationFormSchema,
  type ReservationFormValues,
} from "@rentflow/database/schemas"; 
import { FormInstance } from "antd/lib/form";
import { type Client, type Vehicle, VehicleStatus } from "@rentflow/database"; 
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const rule = createSchemaFieldRule(ReservationFormSchema);
const { Text } = Typography;
const { Option } = Select;

type VehicleWithAvailability = Vehicle & {
  engagements: { startDate: string; endDate: string }[];
};

interface ReservationFormProps {
  form: FormInstance<ReservationFormValues>;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  isClientPreselected?: boolean;
  clients: Client[];
  loadingClients: boolean;
  loadingVehicles: boolean;
  onOpenClientDrawer: () => void;
  vehicles: VehicleWithAvailability[];
  selectedVehicle?: VehicleWithAvailability | null;
}

const getStatusTag = (status: VehicleStatus) => {
  switch (status) {
    case "AVAILABLE":
      return <Tag color="green">Disponible</Tag>;
    case "RENTED":
      return <Tag color="red">Loué</Tag>;
    case "RESERVED":
      return <Tag color="orange">Réservé</Tag>;
    case "MAINTENANCE":
      return <Tag color="blue">En Maintenance</Tag>;
    case "INACTIVE":
      return <Tag color="default">Inactif</Tag>;
  }
};

export default function ReservationForm({
  form,
  clients,
  loadingClients,
  vehicles,
  loadingVehicles,
  onOpenClientDrawer,
  isClientPreselected,
  selectedVehicle,
}: ReservationFormProps) {
  const disabledDate = (current: dayjs.Dayjs) => {
    // Règle 1: On ne peut pas sélectionner de dates dans le passé
    if (current && current.isBefore(dayjs().startOf("day"))) {
      return true;
    }
    // Règle 2: Si un véhicule est sélectionné et a des engagements,
    // on vérifie si la date 'current' est dans l'un de ces intervalles
    if (selectedVehicle && selectedVehicle.engagements.length > 0) {
      for (const engagement of selectedVehicle.engagements) {
        const start = dayjs(engagement.startDate);
        const end = dayjs(engagement.endDate);

        // On désactive la date si elle est entre le début et la fin d'un engagement (inclus)
        // '[]' signifie que les jours de début et de fin sont inclus dans l'intervalle
        if (current.isBetween(start, end, "day", "[]")) {
          return true;
        }
      }
    }

    // Si aucune règle n'a retourné 'true', la date est valide
    return false;
  };

  return (
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
          <Col span={24}>
            <Form.Item
              name="clientId"
              label={<Text strong>Client</Text>}
              rules={[rule]}
            >
              <Select
                showSearch
                placeholder="Sélectionner ou rechercher un client"
                size="large"
                loading={loadingClients}
                optionFilterProp="children"
                disabled={isClientPreselected}
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
                        Nouveau client
                      </Button>
                    </Space>
                  </>
                )}
                options={clients.map(
                  (client: {
                    id: any;
                    firstName: any;
                    lastName: any;
                    cin: any;
                  }) => ({
                    value: client.id,
                    label: `${client.firstName} ${client.lastName} (${
                      client.cin || "N/A"
                    })`,
                  })
                )}
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
            <Text strong>Véhicule</Text>
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
          <Col span={24}>
            <Form.Item
              name="vehicleId"
              label={<Text strong>Véhicule</Text>}
              rules={[rule]}
            >
              <Select
                showSearch
                placeholder="Sélectionner un véhicule"
                size="large"
                loading={loadingVehicles}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {/* On utilise .map sur les options pour un affichage personnalisé */}
                {vehicles.map((vehicle) => (
                  <Option
                    key={vehicle.id}
                    value={vehicle.id}
                    disabled={
                      vehicle.status === "INACTIVE" ||
                      vehicle.status === "MAINTENANCE"
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{`${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`}</span>
                      {getStatusTag(vehicle.status)}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Alerte d'information conditionnelle */}
          {selectedVehicle && selectedVehicle.engagements.length > 0 && (
            <Col span={24}>
              <Alert
                message="Ce véhicule a des engagements futurs"
                description={
                  <div>
                    <p>
                      Les dates suivantes sont déjà réservées et ne peuvent être
                      sélectionnées :
                    </p>
                    <ul>
                      {selectedVehicle.engagements.map((eng, index) => (
                        <li key={index}>
                          Du {dayjs(eng.startDate).format("DD/MM/YYYY")} au{" "}
                          {dayjs(eng.endDate).format("DD/MM/YYYY")}
                        </li>
                      ))}
                    </ul>
                  </div>
                }
                type="info"
                showIcon
              />
            </Col>
          )}
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
                placeholder="jj/mm/aaaa --:--"
                disabledDate={disabledDate}
                disabled={!form.getFieldValue("vehicleId")}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="nombre_jours"
              label={<Text strong>Nombre de jours</Text>}
              rules={[rule]}
            >
              <InputNumber
                style={{ width: "100%", borderRadius: "8px" }}
                addonAfter="Jours"
                min={1}
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="endDate" label={<Text strong>Date de fin</Text>}>
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%", borderRadius: "8px" }}
                size="large"
                placeholder="Calculée automatiquement"
                disabled
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="tarif_journalier"
              label={<Text strong>Tarif journalier</Text>}
              rules={[rule]}
            >
              <InputNumber
                style={{ width: "100%", borderRadius: "8px" }}
                addonAfter="MAD"
                min={0}
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="cout_total" label={<Text strong>Coût total</Text>}>
              <InputNumber
                style={{ width: "100%", borderRadius: "8px" }}
                addonAfter="MAD"
                disabled
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Section Détails du paiement */}
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
              rules={[rule]}
            >
              <Select
                placeholder="Sélectionner une méthode"
                allowClear
                size="large"
              >
                <Select.Option value="CASH">Espèces</Select.Option>
                <Select.Option value="CARD">Carte bancaire</Select.Option>
                <Select.Option value="BANK_TRANSFER">Virement</Select.Option>
                <Select.Option value="CHECK">Chèque</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="montant" label={<Text strong>Montant</Text>}>
              <InputNumber
                style={{ width: "100%", borderRadius: "8px" }}
                addonAfter="MAD"
                min={0}
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="reste" label={<Text strong>Reste</Text>}>
              <InputNumber
                style={{ width: "100%", borderRadius: "8px" }}
                addonAfter="MAD"
                disabled
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Action Buttons are kept in the parent component to allow for different behaviors (e.g., different cancel links) */}

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
      `}</style>
    </Space>
  );
}
