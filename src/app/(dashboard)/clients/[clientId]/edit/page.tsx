"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Typography from "antd/es/typography";
import Space from "antd/es/space";
import Row from "antd/es/row";
import Col from "antd/es/col";
import Tag from "antd/es/tag";


const Card = dynamic(() => import("antd/es/card"), {
  loading: () => <div className="min-h-[200px] bg-gray-50 rounded-lg" />,
  ssr: false,
});
const Spin = dynamic(() => import("antd/es/spin"), { ssr: false });
const Skeleton = dynamic(() => import("antd/es/skeleton"), { ssr: false });
const Form = dynamic(() => import("antd/es/form"), { ssr: false });
import api from "@/lib/api";
import { ClientFormSchema, ClientFormValues } from "@rentflow/database/schemas";
import { useRouter,useParams } from "next/navigation";
import { toast } from "react-toastify";
import { z } from "zod";
import { Client } from "@rentflow/database"; 
import { useForm } from "antd/es/form/Form";


const { Title } = Typography;



const ClientForm = dynamic(() => import("../../ClientForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 15 }} />,
  ssr: false,
});
const mapApiDataToFormValues = (client: Client): ClientFormValues => {
  return {
    firstName: client.firstName || "", // Convert null to empty string
    lastName: client.lastName || "", // Convert null to empty string
    phone: client.phone || "", // Convert null to empty string
    email: client.email || "", // Convert null to empty string
    driverLicense: client.driverLicense || "",
    cin: client.cin || "",
    address: client.address || "", // Convert null to empty string

    // For dropdowns/radios, provide a valid default if the value is null
    nationality: client.nationality || "marocain",
    gender: client.gender || "MALE",

    // File fields are not present in the Client model, so they will be undefined, which is fine.
    identityDocumentUrl: undefined,
    idCardUrlFront: undefined,
    idCardUrlBack: undefined,
    driverLicenseUrlFront: undefined,
    driverLicenseUrlBack: undefined,
    passportUrlFront: undefined,
    passportUrlBack: undefined,
  };
};

const mapFormValuesToDto = (values: ClientFormValues) => ({
  firstName: values.firstName,
  lastName: values.lastName,
  phone: values.phone,
  driverLicense: values.driverLicense,
  cin: values.cin,
  email: values.email,
  address: values.address,
  nationality: values.nationality,
  gender: values.gender,
});

export default function EditClientPage() {
  const [form] = useForm(); 
  const router = useRouter();
  const params = useParams(); 
  const clientId = params.clientId as string;
  const [initialData, setInitialData] = useState<ClientFormValues | null>(null);
  const [clientCin, setClientCin] = useState<string>("");
  const [loading, setLoading] = useState(!!clientId); 
  const [isSubmitting, setIsSubmitting] = useState(false);



  useEffect(() => {
      if (!clientId) return;
      const fetchClient = async () => {
        try {
          const response = await api.get<Client>(`/clients/${clientId}`);
          setInitialData(response.data);
        } catch (error) {
          toast.error("Impossible de récupérer les données du client.");
          router.push("/clients");
        } finally {
          setLoading(false);
        }
      };
      fetchClient();
    }, [clientId, router]);

  useEffect(() => {
    if (initialData) {
      const formValues = mapApiDataToFormValues(initialData);
      form.setFieldsValue(formValues);
      setLoading(false); 
    }
  }, [initialData, form]);


  const onFinish = async (values: ClientFormValues) => {
    setIsSubmitting(true);
    try {
      const validatedData = ClientFormSchema.parse(values);
      const clientDto = mapFormValuesToDto(validatedData);

      const formData = new FormData();
      Object.entries(clientDto).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      if (validatedData.identityDocumentUrl?.[0]?.originFileObj) {
        formData.append(
          "identityDocumentUrl",
          validatedData.identityDocumentUrl[0].originFileObj
        );
      }
      if (validatedData.idCardUrlFront?.[0]?.originFileObj) {
        formData.append(
          "idCardUrlFront",
          validatedData.idCardUrlFront[0].originFileObj
        );
      }
      if (validatedData.idCardUrlBack?.[0]?.originFileObj) {
        formData.append(
          "idCardUrlBack",
          validatedData.idCardUrlBack[0].originFileObj
        );
      }
      if (validatedData.driverLicenseUrlFront?.[0]?.originFileObj) {
        formData.append(
          "driverLicenseUrlFront",
          validatedData.driverLicenseUrlFront[0].originFileObj
        );
      }
      if (validatedData.driverLicenseUrlBack?.[0]?.originFileObj) {
        formData.append(
          "driverLicenseUrlBack",
          validatedData.driverLicenseUrlBack[0].originFileObj
        );
      }
      if (validatedData.passportUrlFront?.[0]?.originFileObj) {
        formData.append(
          "passportUrlFront",
          validatedData.passportUrlFront[0].originFileObj
        );
      }
      if (validatedData.passportUrlBack?.[0]?.originFileObj) {
        formData.append(
          "passportUrlBack",
          validatedData.passportUrlBack[0].originFileObj
        );
      }

      await api.put(`/clients/${params.clientId}`, formData);
      toast.success("Client mis à jour avec succès !");
      router.push("/clients");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("Veuillez corriger les erreurs dans le formulaire.");
      } else {
        const errorMessage =
          (error as any).response?.data?.message || "Une erreur est survenue.";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", width: "100%" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center">
                <Title level={2} style={{ margin: 0, color: "#1677ff" }}>
                  Modifier le client
                </Title>
                <Tag color="blue" style={{ fontWeight: 500, fontSize: "14px" }}>
                  {clientCin}
                </Tag>
              </Space>
            </Col>
          </Row>
        </Card>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f0f0f0",
          }}
        >
          {initialData && (
            <ClientForm
              form={form}
              onFinish={onFinish}
              isEditMode={true}
              submitting={isSubmitting}
            />
          )}
        </Card>
      </Space>
    </div>
  );
}