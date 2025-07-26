// In: app/(dashboard)/reservations/CreateClientInDrawer.tsx

"use client";

import React, { useState } from "react";
import { Form } from "antd";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "react-toastify";
import api from "@/lib/api";
import {
  ClientFormSchema,
  type ClientFormValues,
} from "@rentflow/database/schemas";
import type { Client } from "@rentflow/database";
import ClientForm from "../../clients/ClientForm"; 

interface CreateClientInDrawerProps {
  onClose: () => void;
  onClientCreated: (newClient: Client) => void;
}
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

export default function CreateClientInDrawer({
  onClose,
  onClientCreated,
}: CreateClientInDrawerProps) {
  const [form] = Form.useForm<ClientFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFinish = async (values: ClientFormValues) => {
    setIsSubmitting(true);
    try {
      const validatedData = ClientFormSchema.parse(values);
      const formData = new FormData();
      Object.entries(mapFormValuesToDto(validatedData)).forEach(
        ([key, value]) => {
          if (value) {
            formData.append(key, String(value));
          }
        }
      );
      const response = await api.post<Client>("/clients", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onClientCreated(response.data);
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
    <ClientForm
      form={form}
      onFinish={onFinish}
      isEditMode={false} 
      submitting={isSubmitting}
      onCancel={onClose}
    />
  );
}
