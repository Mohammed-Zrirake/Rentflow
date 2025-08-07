"use client";

import React, { useEffect, useState } from "react";
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
  Slider,
  Alert,
} from "antd";
import dayjs from "dayjs";
import { CheckCircleOutlined, CreditCardOutlined, RedoOutlined } from "@ant-design/icons";
import { Prisma } from "@rentflow/database";

const { Text } = Typography;

interface TerminateContractFormProps {
  onFinish: (values: any) => void;
  onCancel: () => void;
  contract: {
    startDate: Date;
    pickupMileage: number;
    totalCost: Prisma.Decimal;
    payments: { amount: Prisma.Decimal }[];
    endDate: Date; 
    dailyRate: Prisma.Decimal;
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
  const [vehicleState, setVehicleState] = useState("GOOD");
  const startDate = dayjs(contract.startDate);
  const returnDate = Form.useWatch("returnDate", form);
  const returnMileage = Form.useWatch("returnMileage", form);
  const totalPaid = contract.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
  const plannedEndDate = dayjs(contract.endDate);
  const effectiveReturnDate = returnDate ? dayjs(returnDate) : dayjs(); 
  const actualDurationDays = Math.max(
    1,
    effectiveReturnDate.diff(startDate, "day")
  );
  const plannedDurationDays = plannedEndDate.diff(startDate, "day");
  const dailyRate = Number(contract.dailyRate);
  const remainingAmount = Number(contract.totalCost) - totalPaid;
  const newTotalCost = actualDurationDays * dailyRate;
  const newRemainingAmount = newTotalCost - totalPaid;
  const duration = Math.max(1, effectiveReturnDate.diff(startDate, "day"));
  const mileageDriven =
      (returnMileage || contract.pickupMileage) - contract.pickupMileage;
  const avgMileage = duration > 0 ? (mileageDriven / duration).toFixed(0) : 0;
   const disabledDate = (current: dayjs.Dayjs) => {
     return (
       current && current.isBefore(dayjs(contract.startDate).startOf("day"))
     );
   };

 useEffect(() => {
   form.setFieldsValue({ finalPaymentAmount: Math.max(0, newRemainingAmount) });
 }, [newRemainingAmount, form]);

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
        {actualDurationDays < plannedDurationDays && (
          <Alert
            message="Retour anticipé détecté"
            description={`Le coût total sera recalculé pour ${actualDurationDays} jours au lieu de ${plannedDurationDays}.`}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}
        {actualDurationDays > plannedDurationDays && (
          <Alert
            message="Retour en retard détecté"
            description={`Le coût total sera recalculé pour ${actualDurationDays} jours au lieu de ${plannedDurationDays}.`}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

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
                disabledDate={disabledDate}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Nombre de jours total">
              <Input value={actualDurationDays} disabled addonAfter="Jours" />
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
              <Radio.Group onChange={(e) => setVehicleState(e.target.value)}>
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
              {(vehicleState === "AVERAGE" || vehicleState === "DAMAGED") && (
                <Col xs={24}>
                  <Form.Item
                    name="returnNotes"
                    label="Notes de retour (décrire l'état)"
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder={
                        vehicleState === "AVERAGE"
                          ? "Décrire l'usure ou les problèmes mineurs..."
                          : "Décrire les dommages..."
                      }
                    />
                  </Form.Item>
                </Col>
              )}
            </Form.Item>
          </Col>
          <Col xs={24}></Col>
        </Row>

        <Space style={{ marginBottom: 16 }}>
          <Divider />
          {newRemainingAmount !== 0 &&
            (newRemainingAmount > 0 ? (
              <>
                <CreditCardOutlined style={{ color: "#1677ff" }} />{" "}
                <Text strong>Paiement du solde final</Text>
              </>
            ) : (
              <>
                <RedoOutlined style={{ color: "#52c41a" }} />{" "}
                <Text strong>Finalisation Financière</Text>
              </>
            ))}
        </Space>
        {newRemainingAmount > 0 ? (
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Typography.Text>
                Reste à payer :{" "}
                <Text strong style={{ color: "#d33" }}>
                  {newRemainingAmount.toFixed(2)} MAD
                </Text>
              </Typography.Text>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="finalPaymentAmount"
                label="Montant payé"
                rules={[
                  {
                    required: newRemainingAmount > 0,
                    message: "Le paiement final est requis.",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={newRemainingAmount}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="finalPaymentMethod"
                label="Méthode de paiement"
                rules={[{ required: true, message: "La méthode est requise." }]}
              >
                <Select placeholder="Choisir une méthode">
                  <Select.Option value="CASH">Espèces</Select.Option>
                  <Select.Option value="CARD">Carte bancaire</Select.Option>
                  <Select.Option value="BANK_TRANSFER">Virement</Select.Option>
                  <Select.Option value="CHECK">Chèque</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        ) : newRemainingAmount < 0 ? (
          <Row>
            <Col span={24}>
              <Alert
                message="Remboursement dû au client"
                description={
                  <Text>
                    Montant à rembourser :{" "}
                    <Text strong style={{ fontSize: 16 }}>
                      {" "}
                      {Math.abs(newRemainingAmount).toFixed(2)} MAD
                    </Text>
                  </Text>
                }
                type="success"
                showIcon
              />
            </Col>
          </Row>
        ) : (
          // CAS 3: Le solde est exactement à 0
          <Row>
            <Col span={24}>
              <Alert
                message="Le contrat est entièrement réglé."
                type="success"
                showIcon
              />
            </Col>
          </Row>
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
