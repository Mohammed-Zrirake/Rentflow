// app/(dashboard)/contracts/create/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Form, Typography, Divider, Skeleton } from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ContractForm = dynamic(() => import("../ContractsForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 20 }} />,
  ssr: false,
});

export default function CreateContractPage() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Données du nouveau contrat:", values);
    alert("Contrat enregistré ! (Voir la console pour les données)");
  };

  const initialValues = {
    startDate: dayjs(),
    vehicleState: "Bon",
    fuelLevel: 5,
  };

  // Set initial values once the form is available
  React.useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form]);

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ color: "#1677ff", marginBottom: 0 }}>
        Nouveau contrat
      </Title>
      <Text type="secondary">
        Remplissez les informations pour créer un nouveau contrat de location
      </Text>
      <Divider style={{ margin: "16px 0" }} />
      <ContractForm form={form} onFinish={onFinish} />
    </div>
  );
}
