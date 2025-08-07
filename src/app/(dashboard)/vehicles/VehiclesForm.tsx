// app/(dashboard)/vehicles/VehicleForm.tsx
"use client";

import React from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Tabs,
  Upload,
  Space,
} from "antd";
import {
  InboxOutlined,
  CarOutlined,
  ToolOutlined,
  FileTextOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { VehicleStatus } from "@rentflow/database";

const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Dragger } = Upload;

interface VehicleFormProps {
  isEditMode: boolean;
  initialImages?: any[]; 
}

export default function VehicleForm({
  isEditMode,
  initialImages,
}: VehicleFormProps) {
  return (
    <Card
      style={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        border: "1px solid #f0f0f0",
      }}
    >
      <Tabs defaultActiveKey="info">
        <TabPane
          tab={
            <span>
              <CarOutlined />
              Informations
            </span>
          }
          key="info"
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {/* Informations véhicule */}
            <Card
              title={
                <Text strong>
                  <CarOutlined style={{ marginRight: 8 }} />
                  Informations véhicule
                </Text>
              }
              bordered={false}
              style={{ boxShadow: "none" }}
            >
              <Row gutter={24}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="make"
                    label={<Text strong>Marque</Text>}
                    rules={[{ required: true }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="model"
                    label={<Text strong>Modèle</Text>}
                    rules={[{ required: true }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="year"
                    label={<Text strong>Année</Text>}
                    rules={[{ required: true }]}
                  >
                    <InputNumber style={{ width: "100%" }} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="licensePlate"
                    label={<Text strong>Plaque</Text>}
                    rules={[{ required: true }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label={<Text strong>Statut</Text>}
                    initialValue="Disponible"
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Option value={VehicleStatus.AVAILABLE}>
                        Disponible
                      </Option>

                      <Option value={VehicleStatus.MAINTENANCE}>
                        Maintenance
                      </Option>
                      <Option value={VehicleStatus.INACTIVE}>Inactif</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="dailyRate"
                    label={<Text strong>Tarif</Text>}
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      addonAfter="MAD"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Informations de maintenance */}
            <Card
              title={
                <Text strong>
                  <ToolOutlined style={{ marginRight: 8 }} />
                  Maintenance
                </Text>
              }
              bordered={false}
              style={{ boxShadow: "none" }}
            >
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="mileage"
                    label={<Text strong>Kilométrage</Text>}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      addonAfter="Km"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="nextOilChangeMileage"
                    label={<Text strong>Prochaine vidange</Text>}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      addonAfter="Km"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Documentation & Assurance */}
            <Card
              title={
                <Text strong>
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  Documentation
                </Text>
              }
              bordered={false}
              style={{ boxShadow: "none" }}
            >
              <Row gutter={24}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="insuranceExpiryDate"
                    label={<Text strong>Expiration assurance</Text>}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="technicalInspectionExpiryDate"
                    label={<Text strong>Expiration contrôle</Text>}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="trafficLicenseExpiryDate"
                    label={<Text strong>Expiration circulation</Text>}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Space>
        </TabPane>

        <TabPane
          tab={
            <span>
              <FileImageOutlined />
              Images
            </span>
          }
          key="images"
          forceRender={true}
        >
          <Card bordered={false} style={{ boxShadow: "none" }}>
            <Form.Item
              name="images"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              noStyle
            >
              <Dragger
                name="file"
                multiple={true}
                beforeUpload={() => false}
                listType="picture"
                accept="image/png, image/jpeg, image/webp"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Cliquez pour télécharger ou faites glisser et déposez
                </p>
                <p className="ant-upload-hint">
                  Vous pouvez télécharger plusieurs images. La première sera
                  l'image principale. Seuls les fichiers PNG, JPG et WEBP sont
                  acceptés.
                </p>
              </Dragger>
            </Form.Item>
          </Card>
        </TabPane>
      </Tabs>
    </Card>
  );
}