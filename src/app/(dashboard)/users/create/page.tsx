/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Card,
  Form,
  Alert,
  Skeleton,
} from "antd";
import { UserOutlined, WarningOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "react-toastify";
import api from "@/lib/api";


import {
  UserFormSchema,
  type UserFormValues,
} from "@rentflow/database/schemas";

const { Title, Text } = Typography;

const TeamMemberForm = dynamic(() => import("../TeamMembersForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 4 }} />,
  ssr: false,
});

export default function CreateTeamMemberPage() {

  const [form] = Form.useForm<UserFormValues>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);


  const onFinish = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      const schemaForCreate = UserFormSchema.refine(
        (data) => data.password && data.password.length > 0,
        {
          message: "Le mot de passe est requis.",
          path: ["password"], 
        }
      );

      const validatedData = schemaForCreate.parse(values);

      await api.post("/users", validatedData);

      toast.success("Nouveau membre ajouté avec succès !");
      router.push("/users");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.map((issue) => ({
          name: issue.path[0],
          errors: [issue.message],
        }));
        form.setFields(fieldErrors);
        toast.error("Veuillez corriger les erreurs dans le formulaire.");
      } else {
        console.error("Failed to create team member:", error);
        const errorMessage =
          (error as any).response?.data?.message || "Une erreur est survenue.";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const alertMessage = (
    <div>
      Veuillez vous assurer d'utiliser une adresse email valide, car
      l'utilisateur devra confirmer son adresse email pour pouvoir se connecter.{" "}
      <br />
      Assurez-vous également de copier le mot de passe et de l'envoyer à
      l'utilisateur, car il ne sera plus affiché par la suite.
    </div>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <Card variant="borderless">
          <Row align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                Nouveau membre de l'équipe
              </Title>
              <Text type="secondary">
                Ajoutez un nouveau membre à votre équipe
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Warning Banner */}
        <Card variant="borderless">
          <Alert
            message={alertMessage}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
          />
        </Card>

        {/* Form */}
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Card
            variant="borderless"
            title={
              <Space>
                <UserOutlined />
                <Text strong>Informations du membre</Text>
              </Space>
            }
          >
            <TeamMemberForm isEditMode={false} />
          </Card>

          {/* Action Buttons */}
          <Card
            variant="borderless"
            style={{
              textAlign: "right",
              marginTop: "24px",
            }}
          >
            <Space>
              <Link href="/users" passHref>
                <Button>Annuler</Button>
              </Link>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Enregistrer
              </Button>
            </Space>
          </Card>
        </Form>
      </Space>

      <style jsx global>{`
        .ant-input,
        .ant-input-password,
        .ant-input-affix-wrapper,
        .ant-radio-wrapper {
          border-radius: 6px !important;
        }
        .ant-card-head {
          border-bottom: none !important;
        }
        .ant-card-head-title {
          padding: 16px 0 !important;
        }
      `}</style>
    </div>
  );
}
