"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Typography,
  Space,
  Row,
  Col,
  Card,
  Spin,
  Form,
  Skeleton,
  notification,
} from "antd";
import axios from "axios";
import { z } from "zod";
import { toast } from "react-toastify"; 

import type { Agency } from "@rentflow/database";
import {
  AgencySettingsFormSchema,
  type AgencySettingsFormValues,
} from "@rentflow/database/schemas";

const { Title, Text } = Typography;
import api from "@/lib/api"; 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


const SettingsForm = dynamic(() => import("./SettingsForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 20 }} />,
  ssr: false,
});

const agencyToFormValues = (agency: Agency): any => ({
  nom: agency.name,
  address: agency.address ?? "",
  ville: agency.city ?? "",
  code_postal: agency.postalCode ?? "",
  telephone: agency.phone ?? "",
  email: agency.contactEmail ?? "",
  ice: agency.ice ?? "",
  rc: agency.rc ?? "",
  patente: agency.patente ?? "",
  if: agency.iff ?? "",
  cnss: agency.cnss ?? "",
  rappel_assurance: agency.insuranceReminderDays ?? 30,
  rappel_controle: agency.techInspectionReminderDays ?? 30,
  rappel_circulation: agency.trafficLicenseReminderDays ?? 30,
  rappel_arrivee_client: agency.clientArrivalReminderDays ?? 3,
  rappel_reservation: agency.reservationReminderDays ?? 3,
  rappel_vidange: agency.oilChangeReminderKm ?? 2000,

  logo: agency.logoUrl
    ? [
        {
          uid: "-1",
          name: "logo.png",
          status: "done",
          url: `${process.env.NEXT_PUBLIC_API_URL}${agency.logoUrl}`,
        },
      ]
    : [],
  tampon: agency.stampUrl
    ? [
        {
          uid: "-2",
          name: "tampon.png",
          status: "done",
          url: `${process.env.NEXT_PUBLIC_API_URL}${agency.stampUrl}`,
        },
      ]
    : [],
});

export default function CompanySettingsPage() {
  const [form] = Form.useForm<AgencySettingsFormValues>();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
   const [initialData, setInitialData] = useState<Agency | null>(null);

const router = useRouter();
  useEffect(() => {
    const fetchSettings = async () => {
      try {
       const response = await api.get("/agency/settings");
       setInitialData(response.data);
      } catch (error) {
        notification.error({
          message: "Erreur de Chargement",
          description:
            "Impossible de récupérer les paramètres de l'agence. Veuillez réessayer.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (initialData) {
      const formValues = agencyToFormValues(initialData);
      form.setFieldsValue(formValues);
    }
  }, [initialData, form]);
  
const onFinish = useCallback(async (values: any) => {
  setIsSubmitting(true);
  try {
    const { logo: logoList, tampon: tamponList, ...textValues } = values;
    const validatedTextData = AgencySettingsFormSchema.omit({
      logo: true,
      tampon: true,
    }).parse(textValues);

    const newLogoFile = logoList?.[0]?.originFileObj;
    const newTamponFile = tamponList?.[0]?.originFileObj;
    const formData = new FormData();
    Object.entries(validatedTextData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    if (newLogoFile instanceof File) {
      formData.append("logo", newLogoFile);
    }
    if (newTamponFile instanceof File) {
      formData.append("tampon", newTamponFile);
    }
    await api.put("/agency/settings", formData);
   toast.success(
   "Les informations de l'agence ont été mises à jour avec succès !"
 );
    router.refresh();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues
        .filter((issue) => issue.path.length > 0)
        .map((issue) => {
          const fieldName = issue.path[0];
          const validFields: (keyof AgencySettingsFormValues)[] = [
            "nom",
            "address",
            "ville",
            "code_postal",
            "telephone",
            "email",
            "ice",
            "rc",
            "patente",
            "if",
            "cnss",
            "rappel_assurance",
            "rappel_controle",
            "rappel_circulation",
            "rappel_arrivee_client",
            "rappel_reservation",
            "rappel_vidange",
            "logo",
            "tampon",
          ];

          if (
            typeof fieldName === "string" &&
            validFields.includes(fieldName as keyof AgencySettingsFormValues)
          ) {
            return {
              name: fieldName as keyof AgencySettingsFormValues,
              errors: [issue.message],
            };
          }
          return null;
        })
        .filter(Boolean) as Array<{
        name: keyof AgencySettingsFormValues;
        errors: string[];
      }>;
      toast.error("Veuillez corriger les champs en rouge.");
      form.setFields(fieldErrors);
     
    } else {
      toast.error("Une erreur est survenue pendant la mise à jour.");
    }
  } finally {
    setIsSubmitting(false);
  }
},[form,router]);

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card bordered={false}>
          <Row align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                Paramètres de l'entreprise
              </Title>
              <Text type="secondary">
                Configurez les informations et préférences de votre entreprise
              </Text>
            </Col>
          </Row>
        </Card>
        {loading ? (
          <Card bordered={false}>
            <Spin
              size="large"
              style={{ display: "block", margin: "50px auto" }}
            />
          </Card>
        ) : (
          <SettingsForm
            form={form}
            onFinish={onFinish}
            loading={isSubmitting}
          />
        )}
      </Space>
    </div>
  );
}
