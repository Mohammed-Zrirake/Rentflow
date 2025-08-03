"use client";

import React from "react";
import {
  Form,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Radio,
  Input,
  Space,
  Button,
  Typography,
  Card,
  Divider,
  Select,
} from "antd";
import type { FormInstance } from "antd/lib/form";
import dayjs from "dayjs";
import { CheckCircleOutlined, CreditCardOutlined } from "@ant-design/icons";
import { Prisma } from "@rentflow/database";

const { Text } = Typography;

interface TerminateContractFormProps {
  onFinish: (values: any) => void;
  onCancel: () => void;
  contract: {
    startDate: Date;
    pickupMileage: number;
    totalCost: Prisma.Decimal;
    payments:  { amount: Prisma.Decimal }[];
  };
  submitting: boolean;
}

export default function TerminateContractForm({
  onFinish,
  onCancel,
  contract,
  submitting,
}: TerminateContractFormProps) {
  const [form] = Form.useForm();
  const returnDate = Form.useWatch("returnDate", form);
  const returnMileage = Form.useWatch("returnMileage", form);
  const duration = returnDate
    ? dayjs(returnDate).diff(dayjs(contract.startDate), "day")
    : 0;
  const mileageDriven = (returnMileage || 0) - contract.pickupMileage;
  const avgMileage = duration > 0 ? (mileageDriven / duration).toFixed(0) : 0;
  const totalPaid = contract.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const remainingAmount = Number(contract.totalCost) - totalPaid;

  return (
    <Card
      title={
        <Space>
          <CheckCircleOutlined style={{ color: "#d33" }} />
          <Text strong style={{ color: "#d33" }}>
            Terminer le contrat
          </Text>
        </Space>
      }
      style={{
        marginTop: 24,
        border: "1px solid #ffccc7",
        background: "#fff2f0",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ returnDate: dayjs(), vehicleState: "GOOD" }}
      >
        <Row gutter={24}>
          <Col xs={24} md={6}>
            <Form.Item
              name="returnDate"
              label="Date de retour effective"
              rules={[{ required: true, message: "La date est requise" }]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Nombre de jours total">
              <Input value={duration} disabled addonAfter="Jours" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="returnMileage"
              label="Kilométrage au retour"
              rules={[{ required: true, message: "Le kilométrage est requis" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                addonAfter="Km"
                min={contract.pickupMileage}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Kilométrage moyen quotidien">
              <Input value={avgMileage} disabled addonAfter="Km/j" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="vehicleState"
              label="État du véhicule au retour"
              rules={[{ required: true, message: "L'état est requis" }]}
            >
              <Radio.Group>
                <Radio value="GOOD">Bon</Radio>
                <Radio value="AVERAGE">Moyen</Radio>
                <Radio value="DAMAGED">Endommagé</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="returnFuelLevel"
              label="Niveau de carburant au retour (%)"
            >
              <InputNumber
                addonAfter="%"
                style={{ width: "100%" }}
                min={0}
                max={100}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="returnNotes" label="Notes de retour (Optionnel)">
              <Input.TextArea
                rows={2}
                placeholder="Ex: frais de nettoyage, dommages mineurs, etc."
              />
            </Form.Item>
          </Col>
        </Row>
        {remainingAmount > 0 && (
          <>
            <Divider />
            <Space style={{ marginBottom: 16 }}>
              <CreditCardOutlined style={{ color: "#1677ff" }} />
              <Text strong>Paiement du solde final</Text>
            </Space>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Typography.Text>
                  Reste à payer :{" "}
                  <Text strong style={{ color: "#d33" }}>
                    {remainingAmount.toFixed(2)} MAD
                  </Text>
                </Typography.Text>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="finalPaymentAmount"
                  label="Montant payé"
                  rules={[
                    {
                      required: true,
                      message: "Le paiement final est requis.",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={remainingAmount}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="finalPaymentMethod"
                  label="Méthode de paiement"
                  rules={[
                    { required: true, message: "La méthode est requise." },
                  ]}
                >
                  <Select placeholder="Choisir une méthode">
                    <Select.Option value="CASH">Espèces</Select.Option>
                    <Select.Option value="CARD">Carte bancaire</Select.Option>
                    <Select.Option value="BANK_TRANSFER">
                      Virement
                    </Select.Option>
                    <Select.Option value="CHECK">Chèque</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
        <Row justify="end">
          <Space>
            <Button onClick={onCancel}>Annuler</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Enregistrer et Terminer
            </Button>
          </Space>
        </Row>
      </Form>
    </Card>
  );
}
