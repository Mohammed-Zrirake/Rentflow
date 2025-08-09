"use client";

import { Space,Form} from "antd";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import Typography from "antd/es/typography";
import Row from "antd/es/row";
import Col from "antd/es/col";
import Tag from "antd/es/tag";

// Heavier components with dynamic imports

const Card = dynamic(() => import("antd/es/card"), {
  loading: () => <div className="h-32 bg-gray-50 rounded" />, // Simple placeholder
  ssr: false,
});

const Skeleton = dynamic(() => import("antd/es/skeleton"), {
  ssr: false,
});

// Destructure Typography once
const { Title} = Typography;
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "react-toastify";
import api from "@/lib/api";
import {
  ClientFormSchema,
  type ClientFormValues,
} from "@rentflow/database/schemas";

const ClientForm = dynamic(() => import("../ClientForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 15 }} />,
  ssr: false,
});
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
export default function CreateClientPage() {
  const [form] = Form.useForm<ClientFormValues>(); 
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
   const onFinish = async (values: ClientFormValues) => {
     setIsSubmitting(true);
     try {
       const validatedData = ClientFormSchema.parse(values);
       const clientDto = mapFormValuesToDto(validatedData);

       const formData = new FormData();


       Object.entries(clientDto).forEach(([key, value]) => {
         if (value) {
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

       await api.post("/clients", formData);

       toast.success("Nouveau client ajouté avec succès !");
       router.push("/clients");
     } catch (error) {
       if (error instanceof z.ZodError) {
         toast.error("Veuillez corriger les erreurs dans le formulaire.");
         console.log(error.flatten().fieldErrors);
       } else {
         const errorMessage =
           (error as any).response?.data?.message || "Une erreur est survenue.";
         toast.error(errorMessage);
       }
     } finally {
       setIsSubmitting(false);
     }
   };


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
              <Title level={2} style={{ margin: 0, color: "#1677ff" }}>
                Nouveau client
              </Title>
            </Col>
            <Col>
              <Tag color="blue" style={{ fontWeight: 500 }}>
                Nouveau
              </Tag>
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
          <ClientForm onFinish={onFinish} isEditMode={false} submitting={isSubmitting} form={form} />
        </Card>
      </Space>
    </div>
  );
}
