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
  Dropdown,
  Skeleton,
  Spin,
  Drawer,
} from "antd";
import type { MenuProps } from "antd/es/menu";
import {
  EyeOutlined,
  MoreOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import dayjs from "dayjs";
import { Form } from "antd";
import { Client, Contract, Vehicle } from "@rentflow/database";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { PaymentMethod } from "@rentflow/database"; 

const { Title, Text } = Typography;


const ContractPaymentsTable = dynamic(
  () => import("./contractPaymentsTable"),
  {
    loading: () => <Skeleton active paragraph={{ rows: 3 }} />,
    ssr: false,
  }
);

const ContractForm = dynamic(() => import("../../ContractsForm"), {
  loading: () => <Skeleton active paragraph={{ rows: 20 }} />,
  ssr: false,
});

type VehicleWithAvailability = Vehicle & {
  engagements: { startDate: string; endDate: string }[];
};

type FullContractData = Contract & {
  client: Client;
  vehicle: Vehicle 
  payments: any[];
};

const CreateClientInDrawer = dynamic(
  () => import("../../../reservations/create/createClientInDrawer"),
  {
    loading: () => <Skeleton active paragraph={{ rows: 15 }} />,
    ssr: false,
  }
);

const translatePaymentMethod = (method: PaymentMethod): string => {
  switch (method) {
    case "CASH":
      return "Espèces";
    case "CARD":
      return "Carte bancaire";
    case "BANK_TRANSFER":
      return "Virement";
    case "CHECK":
      return "Chèque";
    default:
      return method;
  }
};

const actionMenu: MenuProps = {
  items: [
    { key: "1", label: "Télécharger le contrat", icon: <DownloadOutlined /> },
    { key: "2", label: "Télécharger la facture", icon: <FileTextOutlined /> },
    { type: "divider" },
    { key: "3", label: "Supprimer", icon: <DeleteOutlined />, danger: true },
  ],
};

export default function EditContractPage({
  params,
}: {
  params: { contractId: string };
}) {
   const [form] = Form.useForm();
   const router = useRouter();

   const [contract, setContract] = useState<FullContractData | null>(null);
   const [clients, setClients] = useState<Client[]>([]);
   const [allVehicles, setAllVehicles] = useState<VehicleWithAvailability[]>([]);
   const [loading, setLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isClientDrawerVisible, setIsClientDrawerVisible] = useState(false);
    const [vehicles, setVehicles] = useState<VehicleWithAvailability[]>([]);
    const [selectedVehicle, setSelectedVehicle] =
         useState<VehicleWithAvailability | null>(null);

       useEffect(() => {
     const fetchInitialData = async () => {
       setLoading(true);
       try {
         const [contractRes, clientsRes, vehiclesRes] = await Promise.all([
           api.get<FullContractData>(`/contracts/${params.contractId}`),
           api.get<Client[]>("/clients"),
           api.get<VehicleWithAvailability[]>("/vehicles"),
         ]);

         const contractData = contractRes.data;
         setContract(contractData);
         setClients(clientsRes.data);
         setAllVehicles(vehiclesRes.data);

         // Pré-remplissage du formulaire
        const durationDays = dayjs(contractData.endDate).diff(
          dayjs(contractData.startDate),
          "day"
        );
        form.setFieldsValue({
          // Infos client
          clientId: contractData.clientId,
          secondaryDriverId: contractData.secondaryDriverId,

          // Infos véhicule
          vehicleId: contractData.vehicleId,
          pickupMileage: contractData.pickupMileage,
          pickupFuelLevel: contractData.pickupFuelLevel,
          pickupNotes: contractData.pickupNotes,

          // Dates et coûts
          startDate: dayjs(contractData.startDate),
          endDate: dayjs(contractData.endDate),
          durationDays: durationDays,
          dailyRate: Number(contractData.dailyRate),
          totalCost: Number(contractData.totalCost),
        });
       } catch (error) {
         toast.error("Impossible de charger les données.");
       } finally {
         setLoading(false);
       }
     };
     fetchInitialData();
   }, [params.contractId, form]);
      const handleClientCreated = (newClient: Client) => {
     toast.success(
       `Client "${newClient.firstName} ${newClient.lastName}" créé avec succès !`
     );
     setClients((prev) => [...prev, newClient]);
     setIsClientDrawerVisible(false);
     form.setFieldsValue({ secondaryDriverId: newClient.id });
   };
     const handleFormChange = (changedValues: any, allValues: any) => {
       if (changedValues.hasOwnProperty("vehicleId")) {
         const vehicle = vehicles.find((v) => v.id === changedValues.vehicleId);
         setSelectedVehicle(vehicle || null);
         if (vehicle) {
           form.setFieldsValue({
             pickupMileage: vehicle.mileage,
             startDate: undefined,
             durationDays: undefined,
             endDate: undefined,
             dailyRate: undefined,
             totalCost: undefined,
             amountPaid: undefined,
             remainingAmount: undefined,
           });
         }
         return;
       }

       const { startDate, dailyRate } = allValues;
       let { durationDays } = allValues;
       if (startDate && typeof durationDays === "number" && durationDays > 0) {
         if (selectedVehicle && selectedVehicle.engagements.length > 0) {
           const nextEngagement = selectedVehicle.engagements
             .map((e) => ({ start: dayjs(e.startDate) }))
             .filter((e) => e.start.isAfter(startDate))
             .sort((a, b) => a.start.diff(b.start))[0];

           if (nextEngagement) {
             const maxDuration = nextEngagement.start.diff(startDate, "day");
             if (durationDays > maxDuration) {
               durationDays = maxDuration;
               form.setFieldsValue({ durationDays: maxDuration });
               toast.info(
                 `La durée a été ajustée à ${maxDuration} jours pour ne pas chevaucher l'engagement suivant.`,
                 { autoClose: 4000 }
               );
             }
           }
         }

         const endDate = dayjs(startDate).add(durationDays, "day");
         form.setFieldsValue({ endDate: endDate });
       } else {
         form.setFieldsValue({ endDate: undefined });
       }

       const { totalCost } = allValues;
       let { amountPaid } = allValues;

       const totalAlreadyPaid = contract
         ? contract.payments.reduce((sum, p) => sum + Number(p.amount), 0)
         : 0;

       // 3. Calculer le solde restant réel AVANT d'ajouter ce nouveau paiement
       const remainingBalance = Math.max(
         0,
         (totalCost || 0) - totalAlreadyPaid
       );

       // 4. Plafonner le NOUVEAU montant si nécessaire
       if (amountPaid > remainingBalance) {
         amountPaid = remainingBalance; // On met à jour la variable
         form.setFieldsValue({ amountPaid: remainingBalance }); // On met à jour l'UI
       }

       // 5. Calculer le "Reste" final à afficher dans le formulaire
       const finalRemaining = Math.max(0, remainingBalance - (amountPaid || 0));
       form.setFieldsValue({ remainingAmount: finalRemaining });
     };
   const onFinish = async (values: any) => {
     setIsSubmitting(true);
     try {
     const updatePayload = {
       secondaryDriverId: values.secondaryDriverId,
       totalCost: values.totalCost,
       pickupMileage: values.pickupMileage,
       pickupFuelLevel: values.pickupFuelLevel,
       pickupNotes: values.pickupNotes,
     };
       await api.patch(`/contracts/${params.contractId}`, updatePayload);
        if (values.amountPaid > 0 && values.paymentMethod) {
          await api.post(`/contracts/${params.contractId}/payments`, {
            amount: values.amountPaid,
            method: values.paymentMethod,
          });
        }

       toast.success("Contrat mis à jour avec succès !");
       router.push(`/contracts/${params.contractId}/view`);
     } catch (error) {
       toast.error(
         (error as any).response?.data?.message ||
           "Erreur lors de la mise à jour."
       );
     } finally {
       setIsSubmitting(false);
     }
   };

   if (loading || !contract) {
     return (
       <div style={{ padding: "24px" }}>
         <Skeleton active paragraph={{ rows: 15 }} />
       </div>
     );
   }
  const totalPaid = contract.payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const totalCost = Number(contract.totalCost);
  const remainingAmount = totalCost - totalPaid;
  return (
    <>
      <div style={{ padding: "24px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleFormChange}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Header - This loads instantly */}
            <Card
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Space align="center">
                    <Link href="/contracts">
                      <Button
                        type="text"
                        shape="circle"
                        icon={<ArrowLeftOutlined />}
                      />
                    </Link>
                    <Title
                      level={2}
                      style={{ color: "#1677ff", marginBottom: 0 }}
                    >
                      Modifier le contrat #{contract.id.slice(-6)}
                    </Title>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Link
                      href={`/contracts/${params.contractId}/view`}
                      passHref
                    >
                      <Button
                        icon={<EyeOutlined />}
                        style={{ borderRadius: "8px" }}
                      >
                        Voir
                      </Button>
                    </Link>
                    <Dropdown menu={actionMenu} trigger={["click"]}>
                      <Button
                        icon={<MoreOutlined />}
                        style={{ borderRadius: "8px" }}
                      >
                        Actions
                      </Button>
                    </Dropdown>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* --- DYNAMIC FORM RENDER --- */}
            <ContractForm
              form={form}
              clients={clients}
              vehicles={allVehicles}
              selectedVehicle={
                allVehicles.find((v) => v.id === contract.vehicleId) || null
              }
              isEditMode={true}
              onOpenClientDrawer={() => setIsClientDrawerVisible(true)}
            />
            <Card
              title={
                <Space>
                  <CreditCardOutlined style={{ color: "#1677ff" }} />
                  <Text strong style={{ color: "#1677ff" }}>
                    Paiements Enregistrés
                  </Text>
                  {remainingAmount > 0 && (
                    <Text type="danger">
                      (Reste à payer: {remainingAmount.toFixed(2)} MAD)
                    </Text>
                  )}
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              }}
            >
              <ContractPaymentsTable
                payments={contract.payments.map((p) => ({
                  key: p.id,
                  amount: Number(p.amount).toFixed(2),
                  date: dayjs(p.paymentDate).format("DD/MM/YYYY HH:mm"),
                  method: translatePaymentMethod(p.method),
                }))}
              />
            </Card>
            <Row justify="end" style={{ marginTop: 24 }}>
              <Space>
                <Link href={`/contracts/${params.contractId}/view`}>
                  <Button size="large" style={{ width: "120px" }}>
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={isSubmitting}
                  style={{ width: "160px" }}
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
          .hover-underline:hover {
            text-decoration: underline;
            text-underline-offset: 4px;
          }
          .ant-radio-button-wrapper-checked:not(
              .ant-radio-button-wrapper-disabled
            ) {
            color: #1677ff;
            border-color: #1677ff;
          }
          .ant-radio-button-wrapper-checked:not(
              .ant-radio-button-wrapper-disabled
            ):hover {
            color: #4096ff;
            border-color: #4096ff;
          }
          .ant-radio-button-wrapper-checked:not(
              .ant-radio-button-wrapper-disabled
            )::before {
            background-color: #1677ff !important;
          }
        `}</style>
      </div>
      <Drawer
        title="Nouveau client"
        width="60%"
        onClose={() => setIsClientDrawerVisible(false)}
        open={isClientDrawerVisible}
        destroyOnClose
      >
        <CreateClientInDrawer
          onClose={() => setIsClientDrawerVisible(false)}
          onClientCreated={handleClientCreated}
        />
      </Drawer>
    </>
  );
}

