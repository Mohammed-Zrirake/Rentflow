"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Card,
  Form,
  Spin,
  Tag,
  Skeleton,
} from "antd";
import { toast } from "react-toastify";
import api from "@/lib/api";
import Link from "next/link";
import dayjs from "dayjs";
import { Vehicle, VehicleImage } from "@rentflow/database";
import { VehicleFormSchema, VehicleFormValues } from "@rentflow/database/schemas";
import { useRouter , useParams} from "next/navigation";
import z from "zod";

const { Title } = Typography;
const VehicleForm = dynamic(() => import("../../VehiclesForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 20 }} />,
  ssr: false,
});

type ApiVehicle = Vehicle & { images: VehicleImage[] };


const mapDtoToFormValues = (vehicle: ApiVehicle) => ({
  marque: vehicle.make,
  modele: vehicle.model,
  annee: vehicle.year,
  plaque: vehicle.licensePlate,
  statut: vehicle.status,
  tarif_journalier: Number(vehicle.dailyRate),
  kilometrage: vehicle.mileage,
  prochaine_vidange: vehicle.nextOilChangeMileage,
  date_assurance: vehicle.insuranceExpiryDate
    ? dayjs(vehicle.insuranceExpiryDate)
    : null,
  date_controle: vehicle.technicalInspectionExpiryDate
    ? dayjs(vehicle.technicalInspectionExpiryDate)
    : null,
  date_circulation: vehicle.trafficLicenseExpiryDate
    ? dayjs(vehicle.trafficLicenseExpiryDate)
    : null,
  images: vehicle.images.map((img) => ({
    uid: img.id,
    name: img.url.split("/").pop(),
    status: "done",
    url: `${process.env.NEXT_PUBLIC_API_URL}${img.url}`,
  })),
});



export default function EditVehiclePage()  {
   const [form] = Form.useForm<VehicleFormValues>();
   const router = useRouter();
   const [initialData, setInitialData] = useState<ApiVehicle | null>(null);
   const [loading, setLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const params = useParams();
   const vehicleId = params.vehicleId as string;
 
    useEffect(() => {
      if (!vehicleId) return;
      const fetchVehicle = async () => {
        try {
          const response = await api.get<ApiVehicle>(`/vehicles/${vehicleId}`);
          setInitialData(response.data);
        } catch (error) {
          toast.error("Impossible de récupérer les données du véhicule.");
          router.push("/vehicles");
        } finally {
          setLoading(false);
        }
      };
      fetchVehicle();
    }, [vehicleId, router]);

 useEffect(() => {
   if (initialData) {
     // Map the fetched data to the format the form expects
     const formValues = {
       ...initialData,
       vin: initialData.vin ?? undefined,
       dailyRate: Number(initialData.dailyRate), // Convert Decimal to number
       // Convert date strings from DB to dayjs objects for the DatePicker
       insuranceExpiryDate: initialData.insuranceExpiryDate
         ? dayjs(initialData.insuranceExpiryDate)
         : null,
       technicalInspectionExpiryDate: initialData.technicalInspectionExpiryDate
         ? dayjs(initialData.technicalInspectionExpiryDate)
         : null,
       trafficLicenseExpiryDate: initialData.trafficLicenseExpiryDate
         ? dayjs(initialData.trafficLicenseExpiryDate)
         : null,
       // Format the images array for Ant Design's Upload component
       images: initialData.images.map((img) => ({
         uid: img.id,
         name: img.url.split("/").pop() || "image.png",
         status: "done",
         url: `${process.env.NEXT_PUBLIC_API_URL}${img.url}`,
       })),
     };
     form.setFieldsValue(formValues);
   }
 }, [initialData, form]);
 




 const onFinish = useCallback(
   async (values: any) => {
     setIsSubmitting(true);
     try {
       const validatedData = VehicleFormSchema.parse(values);
       const formData = new FormData();
       const initialImageIds = initialData?.images.map((img) => img.id) || [];
       const currentImageUids =
         validatedData.images?.map((file: { uid: any; }) => file.uid) || [];
       const imagesToDelete = initialImageIds.filter(
         (id) => !currentImageUids.includes(id)
       );
       if (imagesToDelete.length > 0) {
         imagesToDelete.forEach((id) =>
           formData.append("imagesToDelete[]", id)
         );
       }


       const newImages =
         validatedData.images?.filter((file: { originFileObj: any; }) => file.originFileObj) || [];
       if (newImages.length > 0) {
         newImages.forEach((file: { originFileObj: string | Blob; }) =>
           formData.append("images", file.originFileObj)
         );
       }


  if (imagesToDelete.length > 0) {
    imagesToDelete.forEach((id) => formData.append("imagesToDelete[]", id));
  }

       for (const key in validatedData) {
         // On s'assure que la clé appartient bien à l'objet
         if (Object.prototype.hasOwnProperty.call(validatedData, key)) {
           // On caste la clé pour rassurer TypeScript
           const typedKey = key as keyof VehicleFormValues;

           const value = validatedData[typedKey];


           if (typedKey !== "images" && value !== null && value !== undefined) {
             if (dayjs.isDayjs(value)) {
               formData.append(typedKey, value.toISOString());
             } else {
               formData.append(typedKey, String(value));
             }
           }
         }
       }

       await api.put(`/vehicles/${vehicleId}`, formData);
       toast.success("Véhicule mis à jour avec succès !");
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
         const errorMessage =
           (error as any).response?.data?.message || "Une erreur est survenue.";
         toast.error(errorMessage);
       }
     } finally {
       setIsSubmitting(false);
     }
   },
   [form, initialData, router, vehicleId]
 );

     if (loading) {
       return (
         <div style={{ padding: "24px", textAlign: "center" }}>
           <Spin size="large" style={{ display: "block", marginTop: "50px" }} />
         </div>
       );
     }

  return (
    <div style={{ padding: "24px", width: "100%" }}>
      {/* The Form provider now wraps the dynamic component */}
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
                <Space align="center">
                  <Title level={2} style={{ margin: 0, color: "#1677ff" }}>
                    Modifier le véhicule
                  </Title>
                  <Tag
                    color="blue"
                    style={{ fontWeight: 500, fontSize: "14px" }}
                  >
                    {initialData?.licensePlate}
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>


          <VehicleForm isEditMode={true} />

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
        .ant-upload.ant-upload-drag {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
