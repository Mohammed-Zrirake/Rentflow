/* eslint-disable react/no-unescaped-entities */
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
  Form,
  Alert,
  Spin,
  Skeleton, 
} from "antd";
import { UserOutlined, WarningOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ApiUser } from "../../page";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { UserFormSchema, UserFormValues } from "@rentflow/database/schemas";
import z from "zod";

const { Title, Text } = Typography;
const TeamMemberForm = dynamic(() => import("../../TeamMembersForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 4 }} />,
  ssr: false,
});

export default function EditTeamMemberPage({
  params,
}: {
  params: { userId: string };
}) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!params.userId) return;
      setLoading(true);
      try {
        const response = await api.get<ApiUser>(`/users/${params.userId}`);
        const user = response.data;
        setUserData(user);
        form.setFieldsValue({
          name: user.name,
          email: user.email,
          status: user.status,
          password: "", // Always start with an empty password field
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error(
          "Impossible de récupérer les informations de l'utilisateur."
        );
        router.push("/users"); // Redirect if user not found
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [params.userId, form, router]);

  const onFinish = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      const validatedData = UserFormSchema.parse(values);

      const payload: Partial<UserFormValues> = { ...validatedData };

      if (!payload.password) {
        delete payload.password;
      }

      await api.put(`/users/${params.userId}`, payload);

      toast.success("Membre de l'équipe mis à jour avec succès !");
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
        console.error("Failed to update team member:", error);
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
    Laissez le champ du mot de passe vide si vous ne souhaitez pas le modifier.
    <br />
    Si vous entrez un nouveau mot de passe, assurez-vous de le communiquer au
    membre de l'équipe.
  </div>
);
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
        {/* Header */}
        <Card variant="borderless">
          <Row align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                Modifier le membre de l'équipe
              </Title>
              <Text type="secondary">{userData?.name}</Text>
            </Col>
          </Row>
        </Card>

        {/* Info Banner */}
        <Card variant="borderless">
          <Alert
            message={alertMessage}
            type="info"
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
            <TeamMemberForm isEditMode={true} />
          </Card>

          {/* Action Buttons */}
          <Card
            variant="borderless"
            style={{ textAlign: "right", marginTop: "24px" }}
          >
            <Space>
              <Link href="/users" passHref>
                <Button>Annuler</Button>
              </Link>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Enregistrer les modifications
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
        .ant-form-item-extra {
          font-size: 12px !important;
          color: #8c8c8c !important;
        }
      `}</style>
    </div>
  );
}
