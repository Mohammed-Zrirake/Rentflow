"use client";

import React, { useState, useMemo, useEffect } from "react";
import "antd/dist/reset.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import {
  Typography,
  Button,
  Space,
  Row,
  Col,
  Segmented,
  Card,
  Badge,
  Skeleton,
  Divider,
  Form,
  InputNumber,
  Modal,
  Select, 
} from "antd";
import {
  DownloadOutlined,
  PlusOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ContractDataType } from "./ContractListTable";
import type { FilterValues } from "./FilterDrawer";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Contract, ContractStatus, PaymentMethod, Prisma } from "@rentflow/database";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "antd/es/form/Form";
import { useRouter } from "next/navigation";
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);


const ContractListTable = dynamic(
  () => import("./ContractListTable"),
  {
    loading: () => <Skeleton active paragraph={{ rows: 8 }} />,
    ssr: false,
  }
);
const FilterDrawer = dynamic(
  () => import("./FilterDrawer"), 
  {
    ssr: false,
  }
);
const { Title, Text } = Typography;

type ApiContract = Contract & {
  client: { firstName: string; lastName: string };
  vehicle: { make: string; model: string };
  createdBy: { name: string | null };
  payments: { amount: Prisma.Decimal }[];
};

const mapStatusToFrench = (
  status: ContractStatus
): "Actif" | "Annulé" | "Terminé" => {
  switch (status) {
    case "ACTIVE":
      return "Actif";
    case "CANCELLED":
      return "Annulé";
    case "COMPLETED":
      return "Terminé";
    default:
      return "Actif";
  }
};

export default function ContractsPage() {

 const router = useRouter();
 const { data: session } = useSession();
 const currentUserId = session?.user?.id;
 const [contracts, setContracts] = useState<ApiContract[]>([]);
 const [loading, setLoading] = useState(true); 
 const [activeStatusFilter, setActiveStatusFilter] = useState<string | number>(
    "Tous"
  );
 const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
 const [activeFilters, setActiveFilters] = useState<FilterValues>({});
 const [paymentForm] =useForm();
 const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
 const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
 const [contractToPay, setContractToPay] = useState<ApiContract | null>(null);


 
 const handleOpenPaymentModal = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (contract) {
      setContractToPay(contract);
      setIsPaymentModalVisible(true);
      paymentForm.resetFields();
    }
  };
 const handlePaymentSubmit = async (values: {
    amount?: number;
    method?: PaymentMethod;
  }) => {
    if (!contractToPay) return;
    setIsSubmittingPayment(true);
    try {
      const payload = { amount: values.amount, method: values.method };
      await api.post(`/contracts/${contractToPay.id}/payments`, payload);
      toast.success("Paiement ajouté avec succès !");
      setIsPaymentModalVisible(false);
    } catch (error) {
      toast.error(
        (error as any).response?.data?.message ||
          "Erreur lors de l'ajout du paiement."
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  };
 const handleApplyFilters = (values: FilterValues) => {
    setActiveFilters(values);
    setIsFilterDrawerVisible(false);
  };
 const handleResetFilters = () => {
    setActiveFilters({});
  };
 const tableData = useMemo((): ContractDataType[] => {
     if (!currentUserId) return [];
     return contracts.map((contract) => ({
       key: contract.id,
       clientName: `${contract.client.firstName} ${contract.client.lastName}`,
       vehicle: `${contract.vehicle.make} ${contract.vehicle.model}`,
       createdBy:
         contract.createdById === currentUserId
           ? "Vous"
           : contract.createdBy.name ?? "Inconnu",
       status: mapStatusToFrench(contract.status),
       totalDays: dayjs(contract.endDate).diff(
         dayjs(contract.startDate),
         "day"
       ),
       totalAmount: Number(contract.totalCost),
       amountPaid: contract.payments.reduce(
         (sum, p) => sum + Number(p.amount),
         0
       ),
       startDate: contract.startDate.toString(),
       endDate: contract.endDate.toString(),
     }));
   }, [contracts, currentUserId]);
 const filteredData = useMemo(() => {
     const statusFiltered = tableData.filter(
       (contract) =>
         activeStatusFilter === "Tous" || contract.status === activeStatusFilter
     );

     if (Object.keys(activeFilters).length === 0) {
       return statusFiltered;
     }

     return statusFiltered.filter((contract) => {
       const { vehicle, createdBy, dateType, singleDate, dateRange } =
         activeFilters;
       if (vehicle && contract.vehicle !== vehicle) return false;
       if (createdBy && contract.createdBy !== createdBy) return false;
       const contractStart = dayjs(contract.startDate);
       const contractEnd = dayjs(contract.endDate);
       if (dateType === "single" && singleDate) {
         if (
           !dayjs(singleDate).isBetween(contractStart, contractEnd, "day", "[]")
         )
           return false;
       }
       if (dateType === "range" && dateRange) {
         const [filterStart, filterEnd] = dateRange;
         if (
           !(
             contractStart.isSameOrBefore(filterEnd, "day") &&
             contractEnd.isSameOrAfter(filterStart, "day")
           )
         )
           return false;
       }
       return true;
     });
   }, [tableData, activeFilters, activeStatusFilter]);




 const uniqueVehicles = [...new Set(tableData.map((item) => item.vehicle))];
 const uniqueCreators = [...new Set(tableData.map((item) => item.createdBy))];


 const remainingForModal = contractToPay
    ? Number(contractToPay.totalCost) -
      contractToPay.payments.reduce((sum, p) => sum + Number(p.amount), 0)
    : 0;
 const fetchContracts = async () => {
      setLoading(true);
      try {
        const response = await api.get<ApiContract[]>("/contracts");
        setContracts(response.data);
      } catch (error) {
        console.error("Failed to fetch contracts:", error);
        toast.error("Échec du chargement des contrats.");
      } finally {
        setLoading(false);
      }
    };
  const handleTerminate = (contractId: string) => {
    Swal.fire({
      title: "Terminer le contrat",
      text: `Vous allez être redirigé pour finaliser le contrat #${contractId
        .slice(-6)
        .toUpperCase()}.`,
      icon: "info",
      confirmButtonText: "Continuer",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push(`/contracts/${contractId}/view?action=terminate`);
      }
    });
  };
  const handleCancel = (contractId: string) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action annulera le contrat et rendra le véhicule disponible. Elle est irréversible.", // Texte plus précis
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, annuler !",
      cancelButtonText: "Non",
    }).then((result) => {
      if (result.isConfirmed) {
        const cancelRequest = async () => {
          try {
            await api.patch(`/contracts/${contractId}/cancel`);
            Swal.fire(
              "Annulé !",
              "Le contrat a été annulé avec succès.",
              "success"
            );
            fetchContracts(); 
          } catch (error) {
            console.error("Failed to cancel contract:", error);
            const errorMessage =
              (error as any).response?.data?.message ||
              "Une erreur est survenue.";
            toast.error(errorMessage);
          }
        };
        cancelRequest();
      }
    });
  };
  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const response = await api.get<ApiContract[]>("/contracts");
        setContracts(response.data);
      } catch (error) {
        console.error("Failed to fetch contracts:", error);
        toast.error("Échec du chargement des contrats.");
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

 

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                Contrats
              </Title>
              {loading ? (
                <Text type="secondary">Chargement des contrats...</Text>
              ) : (
                <Text type="secondary">
                  {filteredData.length} contrats trouvés
                </Text>
              )}
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<DownloadOutlined />}
                  style={{ borderRadius: "8px" }}
                >
                  Télécharger
                </Button>
                <Link href="/contracts/create" passHref>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ borderRadius: "8px" }}
                    className="hover-scale"
                  >
                    Nouveau contrat
                  </Button>
                </Link>
              </Space>
            </Col>
          </Row>

          <div style={{ marginTop: "24px" }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Segmented
                  options={["Tous", "Actif", "Annulé", "Terminé"]}
                  value={activeStatusFilter}
                  onChange={setActiveStatusFilter}
                  style={{
                    borderRadius: "8px",
                    background: "#f5f5f5",
                    padding: "4px",
                  }}
                />
              </Col>
              <Col>
                <Badge
                  count={Object.keys(activeFilters).length}
                  offset={[-5, 5]}
                >
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setIsFilterDrawerVisible(true)}
                    style={{ borderRadius: "8px" }}
                  >
                    Plus de filtres
                  </Button>
                </Badge>
              </Col>
            </Row>
          </div>
        </Card>

        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <ContractListTable
            data={filteredData}
            loading={loading}
            onTerminate={handleTerminate}
            onCancel={handleCancel}
            onAddPayment={handleOpenPaymentModal}
            
          />
          <Modal
            title={`Ajouter un paiement au contrat #${contractToPay?.id
              .slice(-6)
              .toUpperCase()}`}
            open={isPaymentModalVisible}
            onCancel={() => setIsPaymentModalVisible(false)}
            confirmLoading={isSubmittingPayment}
            onOk={() => paymentForm.submit()}
            okText="Enregistrer le paiement"
            cancelText="Annuler"
          >
            <Form
              form={paymentForm}
              layout="vertical"
              onFinish={handlePaymentSubmit}
            >
              {contractToPay && (
                <>
                  <Space
                    direction="vertical"
                    style={{ width: "100%", marginBottom: 16 }}
                  >
                    <Text>
                      Montant total du contrat :{" "}
                      <Text strong>
                        {Number(contractToPay.totalCost).toFixed(2)} MAD
                      </Text>
                    </Text>
                    <Text>
                      Reste à payer :{" "}
                      <Text strong style={{ color: "#d33" }}>
                        {remainingForModal.toFixed(2)} MAD
                      </Text>
                    </Text>
                  </Space>
                  <Divider />
                </>
              )}
              <Form.Item
                name="amount"
                label="Montant du paiement (MAD)"
                rules={[{ required: true, message: "Le montant est requis" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={remainingForModal}
                  placeholder="ex: 500"
                />
              </Form.Item>
              <Form.Item
                name="method"
                label="Méthode de paiement"
                rules={[{ required: true, message: "La méthode est requise" }]}
              >
                <Select placeholder="Sélectionner une méthode">
                  <Select.Option value="CASH">Espèces</Select.Option>
                  <Select.Option value="CARD">Carte bancaire</Select.Option>
                  <Select.Option value="BANK_TRANSFER">Virement</Select.Option>
                  <Select.Option value="CHECK">Chèque</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </Space>

      {isFilterDrawerVisible && (
        <FilterDrawer
          open={isFilterDrawerVisible}
          onClose={() => setIsFilterDrawerVisible(false)}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          uniqueVehicles={uniqueVehicles}
          uniqueCreators={uniqueCreators}
        />
      )}

      <style jsx global>{`
        .hover-scale {
          transition: all 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-table-row:hover {
          background: #f5f5f5 !important;
        }
        .ant-segmented-item-selected {
          background: #1677ff !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
