"use client";

import React, { useEffect } from "react";
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Card,
  Form,
  Input,
  Radio,
  Upload,
  Tabs,
  FormInstance,

} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  IdcardOutlined,
  FileAddOutlined,
  FileImageOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { Gender } from "@rentflow/database";
import { ClientFormSchema } from "@rentflow/database/schemas";
import { createSchemaFieldRule } from "antd-zod"; 


const { Text } = Typography;
const { TabPane } = Tabs;

interface ClientFormProps {
  form:FormInstance;
  onFinish: (values: any) => void;
  initialData?: any;
  isEditMode: boolean;
  submitting?: boolean;
  onCancel?: () => void;
}

const rule = createSchemaFieldRule(ClientFormSchema);

export default function ClientForm({
  form,
  onFinish,
  submitting,
  onCancel,
}: ClientFormProps) {


  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Tabs defaultActiveKey="info">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Informations
              </span>
            }
            key="info"
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Card
                title={
                  <Text strong style={{ color: "#1677ff" }}>
                    <FileAddOutlined style={{ marginRight: 8 }} />
                    Documents d'identité
                  </Text>
                }
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Form.Item
                  name="identityDocumentUrl"
                  rules={[rule]}
                  valuePropName="fileList"
                  label="Choisissez un document"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/png, image/jpeg, image/webp"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      style={{ borderRadius: "8px" }}
                      size="large"
                    >
                      Télécharger un document (Permis/CIN)
                    </Button>
                  </Upload>
                </Form.Item>
              </Card>

              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="type"
                      rules={[rule]}
                      label={<Text strong>Type</Text>}
                      initialValue="individu"
                    >
                      <Radio.Group>
                        <Radio.Button value="individu">Individu</Radio.Button>
                        <Radio.Button value="entreprise">
                          Entreprise
                        </Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="nationality"
                      rules={[rule]}
                      label={<Text strong>Nationalité</Text>}
                      initialValue="marocain"
                    >
                      <Radio.Group>
                        <Radio.Button value="marocain">Marocain</Radio.Button>
                        <Radio.Button value="etranger">Étranger</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="gender"
                      rules={[rule]}
                      label={<Text strong>Genre</Text>}
                      initialValue="homme"
                    >
                      <Radio.Group>
                        <Radio.Button value={Gender.MALE}>Homme</Radio.Button>
                        <Radio.Button value={Gender.FEMALE}>Femme</Radio.Button>
                        <Radio.Button value={Gender.OTHER}>Autre</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card
                title={
                  <Text strong style={{ color: "#1677ff" }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Informations personnelles
                  </Text>
                }
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      rules={[rule]}
                      name="firstName"
                      label={<Text strong>Prénom</Text>}
                    >
                      <Input
                        placeholder="Prénom du client"
                        size="large"
                        style={{ borderRadius: "8px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="lastName"
                      label={<Text strong>Nom</Text>}
                      rules={[rule]}
                    >
                      <Input
                        placeholder="Nom de famille du client"
                        size="large"
                        style={{ borderRadius: "8px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phone"
                      label={<Text strong>Téléphone</Text>}
                      rules={[rule]}
                    >
                      <Input
                        placeholder="06 XX XX XX XX"
                        size="large"
                        style={{ borderRadius: "8px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="address"
                      label={<Text strong>Adresse</Text>}
                      rules={[rule]}
                    >
                      <Input
                        placeholder="Adresse de résidence"
                        size="large"
                        style={{ borderRadius: "8px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="email"
                      label={<Text strong>Email</Text>}
                      rules={[rule]}
                    >
                      <Input
                        placeholder="exemple@email.com"
                        size="large"
                        style={{ borderRadius: "8px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card
                title={
                  <Text strong style={{ color: "#1677ff" }}>
                    <IdcardOutlined style={{ marginRight: 8 }} />
                    Informations sur les documents
                  </Text>
                }
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="cin"
                      label={<Text strong>Numéro de pièce d'identité</Text>}
                      rules={[rule]}
                    >
                      <Input
                        placeholder="Ex: CD123456"
                        size="large"
                        style={{ borderRadius: "8px" }}
                        addonAfter="CIN/Passeport"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="driverLicense"
                      label={<Text strong>Numéro du permis de conduire</Text>}
                      rules={[rule]}
                    >
                      <Input
                        placeholder="Ex: CJF123456"
                        size="large"
                        style={{ borderRadius: "8px" }}
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
                <FileImageOutlined /> Documents
              </span>
            }
            key="documents"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card title={<Text strong>CIN</Text>} bordered={false}>
                  <Space>
                    <Form.Item
                      name="idCardUrlFront"
                      valuePropName="fileList"
                      rules={[rule]}
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                    >
                      <Upload
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false}
                        accept="image/png, image/jpeg, image/webp"
                      >
                        <div>
                          <PlusOutlined />
                          <div>Recto</div>
                        </div>
                      </Upload>
                    </Form.Item>
                    <Form.Item
                      name="idCardUrlBack"
                      rules={[rule]}
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                    >
                      <Upload
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false}
                        accept="image/png, image/jpeg, image/webp"
                      >
                        <div>
                          <PlusOutlined />
                          <div>Verso</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card
                  title={<Text strong>Driver license</Text>}
                  bordered={false}
                >
                  <Space>
                    <Form.Item
                      rules={[rule]}
                      name="driverLicenseUrlFront"
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                    >
                      <Upload
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false}
                        accept="image/png, image/jpeg, image/webp"
                      >
                        <div>
                          <PlusOutlined />
                          <div>Recto</div>
                        </div>
                      </Upload>
                    </Form.Item>
                    <Form.Item
                      rules={[rule]}
                      name="driverLicenseUrlBack"
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                    >
                      <Upload
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false}
                        accept="image/png, image/jpeg, image/webp"
                      >
                        <div>
                          <PlusOutlined />
                          <div>Verso</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Space>
                </Card>
              </Col>

              {/* ----- Passport ----- */}
              <Col xs={24} md={8}>
                <Card title={<Text strong>Passport</Text>} bordered={false}>
                  <Space>
                    <Form.Item
                      rules={[rule]}
                      name="passportUrlFront"
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                    >
                      <Upload
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false}
                        accept="image/png, image/jpeg, image/webp"
                      >
                        <div>
                          <PlusOutlined />
                          <div>Recto</div>
                        </div>
                      </Upload>
                    </Form.Item>
                    <Form.Item
                      name="passportUrlBack"
                      rules={[rule]}
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                    >
                      <Upload
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false}
                        accept="image/png, image/jpeg, image/webp"
                      >
                        <div>
                          <PlusOutlined />
                          <div>Verso</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        {/* Action Buttons are now part of this component */}
    <Row justify="end">
    <Space>
      {/* Conditionally render the button */}
      {onCancel ? (
        <Button size="large" style={{ width: "120px" }} onClick={onCancel}>
          Annuler
        </Button>
      ) : (
        <Link href="/clients" passHref>
          <Button size="large" style={{ width: "120px" }}>
            Annuler
          </Button>
        </Link>
      )}

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        loading={submitting}
        style={{ width: "160px" }}
        className="hover-scale"
      >
        Enregistrer
      </Button>
    </Space>
  </Row>
      </Space>
    </Form>
  );
}