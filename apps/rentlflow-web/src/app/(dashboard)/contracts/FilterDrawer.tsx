// app/(dashboard)/contracts/FilterDrawer.tsx
"use client";

import React, { useState } from "react";
import {
  Drawer,
  Form,
  Button,
  Space,
  Select,
  Radio,
  DatePicker,
  Typography,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import type { RadioChangeEvent } from "antd/es/radio";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

export interface FilterValues {
  vehicle?: string;
  createdBy?: string;
  dateType?: "single" | "range";
  singleDate?: dayjs.Dayjs;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (values: FilterValues) => void;
  onResetFilters: () => void;
  uniqueVehicles: string[];
  uniqueCreators: string[];
}

export default function FilterDrawer({
  open,
  onClose,
  onApplyFilters,
  onResetFilters,
  uniqueVehicles,
  uniqueCreators,
}: FilterDrawerProps) {
  const [form] = Form.useForm();
  const [dateFilterType, setDateFilterType] = useState<"single" | "range">(
    "single"
  );

  const handleReset = () => {
    form.resetFields();
    onResetFilters();
    setDateFilterType("single");
  };

  const onDateTypeChange = (e: RadioChangeEvent) => {
    const newType = e.target.value;
    setDateFilterType(newType);
    form.setFieldsValue(
      newType === "single"
        ? { dateRange: undefined }
        : { singleDate: undefined }
    );
  };

  return (
    <Drawer
      title={
        <Space>
          <FilterOutlined style={{ color: "#1677ff" }} />
          <Text strong>Filtres avancés</Text>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={360}
      footer={
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={handleReset}>Réinitialiser</Button>
          <Button type="primary" onClick={() => form.submit()}>
            Appliquer
          </Button>
        </Space>
      }
      styles={
        {
          /* ... same styles as before ... */
        }
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onApplyFilters}
        initialValues={{ dateType: "single" }}
      >
        <Form.Item name="vehicle" label={<Text strong>Véhicule</Text>}>
          <Select placeholder="Sélectionner un véhicule" allowClear>
            {uniqueVehicles.map((v) => (
              <Select.Option key={v} value={v}>
                {v}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="createdBy" label={<Text strong>Créé par</Text>}>
          <Select placeholder="Sélectionner un utilisateur" allowClear>
            {uniqueCreators.map((c) => (
              <Select.Option key={c} value={c}>
                {c}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="dateType" label={<Text strong>Dates</Text>}>
          <Radio.Group onChange={onDateTypeChange}>
            <Radio value="single">Jour unique</Radio>
            <Radio value="range">Intervalle</Radio>
          </Radio.Group>
        </Form.Item>
        {dateFilterType === "single" ? (
          <Form.Item name="singleDate" label={<Text strong>Jour</Text>}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        ) : (
          <Form.Item name="dateRange" label={<Text strong>Intervalle</Text>}>
            <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
}
