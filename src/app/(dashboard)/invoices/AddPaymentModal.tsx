// app/(dashboard)/invoices/AddPaymentModal.tsx
"use client";

import React from "react";
import { Modal, Form, Button, InputNumber, Select } from "antd";
import type { InvoiceDataType } from "./InvoiceListTable";

const { Option } = Select;

interface AddPaymentModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  invoice: InvoiceDataType | null;
}

export default function AddPaymentModal({
  open,
  onCancel,
  onSubmit,
  invoice,
}: AddPaymentModalProps) {
  const [form] = Form.useForm();

  return (
    <Modal
      title={`Ajouter un paiement pour la facture #${invoice?.key}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel} style={{ borderRadius: "8px" }}>
          Annuler
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          style={{ borderRadius: "8px" }}
        >
          Ajouter
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item label="Montant restant à payer">
          <InputNumber
            style={{ width: "100%", color: "red", fontWeight: "bold" }}
            value={(invoice?.totalAmount || 0) - (invoice?.paidAmount || 0)}
            disabled
          />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Montant du paiement"
          rules={[{ required: true, message: "Veuillez entrer un montant" }]}
        >
          <InputNumber
            style={{ width: "100%", borderRadius: "8px" }}
            addonAfter="MAD"
            min={0.01}
          />
        </Form.Item>
        <Form.Item
          name="method"
          label="Méthode de paiement"
          rules={[{ required: true, message: "Veuillez choisir une méthode" }]}
        >
          <Select
            placeholder="Choisir une méthode"
            style={{ borderRadius: "8px" }}
          >
            <Option value="cash">Espèces</Option>
            <Option value="card">Carte bancaire</Option>
            <Option value="transfer">Virement</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
