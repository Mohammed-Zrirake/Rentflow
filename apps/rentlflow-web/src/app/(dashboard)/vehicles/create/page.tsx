"use client"

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
  Tag,
  Skeleton, 
} from "antd";
import Link from "next/link";
import { VehicleFormSchema, VehicleFormValues } from "@rentflow/database/schemas";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import z from "zod";
import { toast } from "react-toastify";


const { Title } = Typography;
const VehicleForm = dynamic(() => import("../VehiclesForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 20 }} />, 
  ssr: false,
});

const mapFormValuesToDto = (values: VehicleFormValues) => {
  return {
    make: values.make,
    model: values.model,
    year: values.year,
    licensePlate: values.licensePlate,
    status: values.status,
    dailyRate: values.dailyRate,
    mileage: values.mileage || 0, 
    nextOilChangeMileage: values.nextOilChangeMileage,
    
    insuranceExpiryDate: values.insuranceExpiryDate
      ? values.insuranceExpiryDate.toISOString()
      : null,
    technicalInspectionExpiryDate: values.technicalInspectionExpiryDate
      ? values.technicalInspectionExpiryDate.toISOString()
      : null,
    trafficLicenseExpiryDate: values.technicalInspectionExpiryDate
      ? values.technicalInspectionExpiryDate.toISOString()
      : null,
  };
};

export default function CreateVehiclePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  
   const [isSubmitting, setIsSubmitting] = useState(false);

   const onFinish = async (values: VehicleFormValues) => {
     setIsSubmitting(true);
     try {
       const validatedData = VehicleFormSchema.parse(values);
       const vehicleDto = mapFormValuesToDto(validatedData);
       const formData = new FormData();
       Object.entries(vehicleDto).forEach(([key, value]) => {
         if (value !== null && value !== undefined) {
           formData.append(key, String(value));
         }
       });

       if (validatedData.images && validatedData.images.length > 0) {
         validatedData.images.forEach((file: { originFileObj: string | Blob; }) => {
           if (file.originFileObj) {
             formData.append("images", file.originFileObj);
           }
         });
       }

       await api.post("/vehicles", formData);
       toast.success("Nouveau véhicule ajouté avec succès !");
       router.push("/vehicles");
     } catch (error) {
       if (error instanceof z.ZodError) {
         const fieldErrors = error.issues.map((issue) => ({
           name: issue.path, 
           errors: [issue.message],
         }));
         form.setFields(fieldErrors);
         toast.error("Veuillez corriger les erreurs dans le formulaire.");
       } else {
         console.error("Failed to create vehicle:", error);
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
      {/* The Form provider now wraps the dynamic component and action buttons */}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header - This loads instantly */}
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
                  Nouveau véhicule
                </Title>
              </Col>
              <Col>
                <Tag color="blue" style={{ fontWeight: 500 }}>
                  Nouveau
                </Tag>
              </Col>
            </Row>
          </Card>

          <VehicleForm isEditMode={false} />

          {/* Action Buttons are kept at the page level */}
          <Row justify="end">
            <Space>
              <Link href="/vehicles" passHref>
                <Button
                  size="large"
                  style={{
                    width: "120px",
                    borderRadius: "8px",
                    fontWeight: 500,
                  }}
                >
                  Annuler
                </Button>
              </Link>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  width: "160px",
                  borderRadius: "8px",
                  fontWeight: 500,
                  boxShadow: "0 2px 8px rgba(22, 119, 255, 0.3)",
                }}
                loading={isSubmitting}
                className="hover-scale"
              >
                Enregistrer
              </Button>
            </Space>
          </Row>
        </Space>
      </Form>

      <style jsx global>{`
        .hover-scale {
          transition: all 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
