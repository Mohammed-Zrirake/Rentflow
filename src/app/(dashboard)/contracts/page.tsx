"use client";

import React, { useState, useMemo } from "react";
import "antd/dist/reset.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import dayjs from "dayjs";


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
} from "antd";
import {
  DownloadOutlined,
  PlusOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ContractDataType } from "./ContractListTable";
import type { FilterValues } from "./FilterDrawer";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
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


const fakeData: ContractDataType[] = [
  {
    key: "1",
    clientName: "amine alami",
    vehicle: "Dacia Duster",
    createdBy: "Vous",
    status: "Actif",
    totalDays: 5,
    totalAmount: 2000.0,
    startDate: "2025-07-02 16:25",
    endDate: "2025-07-07 16:25",
  },
  {
    key: "2",
    clientName: "fatima zahra",
    vehicle: "Renault Clio 4",
    createdBy: "Admin",
    status: "Terminé",
    totalDays: 10,
    totalAmount: 4500.0,
    startDate: "2025-06-15 10:00",
    endDate: "2025-06-25 10:00",
  },
  {
    key: "3",
    clientName: "karim bennani",
    vehicle: "Dacia Duster",
    createdBy: "Vous",
    status: "Annulé",
    totalDays: 3,
    totalAmount: 900.0,
    startDate: "2025-08-01 09:00",
    endDate: "2025-08-04 09:00",
  },
];

export default function ContractsPage() {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | number>(
    "Tous"
  );
  const [data] = useState<ContractDataType[]>(fakeData);
  const [loading] = useState(false);
  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({});

  const handleApplyFilters = (values: FilterValues) => {
    setActiveFilters(values);
    setIsFilterDrawerVisible(false);
  };

  const handleResetFilters = () => {
    setActiveFilters({});
  };

  const filteredData = useMemo(() => {
    const statusFilteredData = data.filter((contract) => {
      if (activeStatusFilter === "Tous") return true;
      return contract.status === activeStatusFilter;
    });

    if (Object.keys(activeFilters).length === 0) {
      return statusFilteredData;
    }

    return statusFilteredData.filter((contract) => {
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
  }, [data, activeFilters, activeStatusFilter]);


  const uniqueVehicles = [...new Set(data.map((item) => item.vehicle))];
  const uniqueCreators = [...new Set(data.map((item) => item.createdBy))];

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
              <Text type="secondary">
                {filteredData.length} contrats trouvés
              </Text>
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
          <ContractListTable data={filteredData} loading={loading} />
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
