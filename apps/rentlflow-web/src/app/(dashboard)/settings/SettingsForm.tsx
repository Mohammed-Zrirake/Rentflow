"use client";

import React from "react";
import { toast } from "react-toastify";
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Card,
  Form,
  Input,
  InputNumber,
  Upload,
  Tabs,
  Divider,
} from "antd";
import type { FormInstance } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { createSchemaFieldRule } from "antd-zod";
import {
  AgencySettingsFormSchema,
  type AgencySettingsFormValues,
} from "@rentflow/database/schemas";


const { Text } = Typography;

interface SettingsFormProps {
  form: FormInstance<AgencySettingsFormValues>;
  onFinish: (values: AgencySettingsFormValues) => void;
  loading: boolean;
}

export default function SettingsForm({
  form,
  onFinish,
  loading,
}: SettingsFormProps) {
 
  const tabItems = [
    {
      key: "info",
      label: "Informations",
      forceRender: true, 
      children: (
        <div style={{ padding: "16px" }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {/* Informations générales */}
            <Card
              title="Informations générales"
              bordered={false}
              style={{ boxShadow: "none" }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="nom"
                    label="Nom"
                    required
                    validateTrigger="onBlur"
                    rules={[createSchemaFieldRule(AgencySettingsFormSchema)]}
                  >
                    <Input style={{ borderRadius: "6px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="address"
                    label="Adresse"
                    required
                    validateTrigger="onBlur"
                    rules={[createSchemaFieldRule(AgencySettingsFormSchema)]}
                  >
                    <Input style={{ borderRadius: "6px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="ville"
                    label="Ville"
                    required
                    validateTrigger="onBlur"
                    rules={[createSchemaFieldRule(AgencySettingsFormSchema)]}
                  >
                    <Input style={{ borderRadius: "6px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="code_postal" label="Code postal">
                    <Input style={{ borderRadius: "6px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Divider style={{ margin: "8px 0" }} />

            {/* Informations de contact */}
            <Card
              title="Informations de contact"
              bordered={false}
              style={{ boxShadow: "none" }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="telephone"
                    label="Téléphone"
                    required
                    validateTrigger="onBlur"
                    rules={[createSchemaFieldRule(AgencySettingsFormSchema)]}
                  >
                    <Input style={{ borderRadius: "6px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    required
                    validateTrigger="onBlur"
                    rules={[createSchemaFieldRule(AgencySettingsFormSchema)]}
                  >
                    <Input style={{ borderRadius: "6px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Divider style={{ margin: "8px 0" }} />

            {/* Informations légales */}
            <Card
              title="Informations légales"
              bordered={false}
              style={{ boxShadow: "none" }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="ice" label="ICE">
                    <Input style={{ borderRadius: "6px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="rc" label="RC">
                    <Input style={{ borderRadius: "6px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="patente" label="Patente">
                    <Input style={{ borderRadius: "6px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="if" label="IF">
                    <Input style={{ borderRadius: "6px" }} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="cnss" label="CNSS">
                    <Input style={{ borderRadius: "6px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Divider style={{ margin: "8px 0" }} />

            {/* Logo et tampon */}
            <Card
              title="Logo et tampon"
              bordered={false}
              style={{ boxShadow: "none" }}
              extra={
                <Text type="secondary">
                  * Essayez d'utiliser des images avec un fond transparent
                </Text>
              }
            >
              <Row gutter={24}>
                <Col>
                  <Form.Item
                    label="Logo"
                    name="logo"
                    valuePropName="fileList"
                    getValueFromEvent={(e) =>
                      Array.isArray(e) ? e : e?.fileList
                    }
                  >
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={() => false}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item
                    label="Tampon"
                    name="tampon"
                    valuePropName="fileList"
                    getValueFromEvent={(e) =>
                      Array.isArray(e) ? e : e?.fileList
                    }
                  >
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={() => false}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Space>
        </div>
      ),
    },
    {
      key: "notifications",
      label: "Notifications",
      forceRender: true, 
      children: (
        <div style={{ padding: "16px" }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {/* Rappels de conformité */}
            <Card
              title="Rappels de conformité"
              bordered={false}
              style={{ boxShadow: "none" }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="rappel_assurance"
                    label="Rappel d'assurance"
                    required
                    validateTrigger="onBlur"
                    rules={[createSchemaFieldRule(AgencySettingsFormSchema)]}
                  >
                    <InputNumber
                      style={{ width: "100%", borderRadius: "6px" }}
                      addonAfter="Jours"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="rappel_controle"
                    label="Rappel de contrôle technique"
                    required
                    validateTrigger="onBlur"
                    rules={[createSchemaFieldRule(AgencySettingsFormSchema)]}
                  >
                    <InputNumber
                      style={{ width: "100%", borderRadius: "6px" }}
                      addonAfter="Jours"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="rappel_circulation"
                    label="Rappel d'autorisation de circulation"
                    required
                    validateTrigger="onBlur"
                    rules={[createSchemaFieldRule(AgencySettingsFormSchema)]}
                  >
                    <InputNumber
                      style={{ width: "100%", borderRadius: "6px" }}
                      addonAfter="Jours"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Divider style={{ margin: "8px 0" }} />

            {/* Notifications client */}
            <Card
              title="Notifications client"
              bordered={false}
              style={{ boxShadow: "none" }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="rappel_arrivee_client"
                    label="Arrivée client"
                    required
                    validateTrigger="onBlur"
                    rules={[createSchemaFieldRule(AgencySettingsFormSchema)]}
                  >
                    <InputNumber
                      style={{ width: "100%", borderRadius: "6px" }}
                      addonAfter="Jours"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="rappel_reservation"
                    label="Rappel de réservation"
                    required
                    validateTrigger="onBlur"
                    rules={[createSchemaFieldRule(AgencySettingsFormSchema)]}
                  >
                    <InputNumber
                      style={{ width: "100%", borderRadius: "6px" }}
                      addonAfter="Jours"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Divider style={{ margin: "8px 0" }} />

            {/* Entretien du véhicule */}
            <Card
              title="Entretien du véhicule"
              bordered={false}
              style={{ boxShadow: "none" }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="rappel_vidange"
                    label="Rappel de vidange"
                    required
                    validateTrigger="onBlur"
                    rules={[createSchemaFieldRule(AgencySettingsFormSchema)]}
                  >
                    <InputNumber
                      style={{ width: "100%", borderRadius: "6px" }}
                      addonAfter="Km"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card
          variant="borderless" 
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
          styles={{ body: { padding: 0 } }} 
        >

          <Tabs
            defaultActiveKey="info"
            items={tabItems}
            style={{ padding: "0 16px" }}
          />
        </Card>

        <Card
          variant="borderless" 
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            textAlign: "right",
          }}
        >
          <Space>
            <Button
              onClick={() => form.resetFields()}
              style={{ borderRadius: "6px" }}
            >
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ borderRadius: "6px" }}
              loading={loading}
            >
              Enregistrer
            </Button>
          </Space>
        </Card>
      </Space>
    </Form>
  );
}
