// app/(dashboard)/invoices/AddPaymentModal.tsx
"use client";

import React, { useEffect } from "react";
import { Modal, Form, Button, InputNumber, Select } from "antd";
import type { InvoiceDataType } from "./InvoiceListTable";
import { PaymentMethod } from "@rentflow/database";

const { Option } = Select;

interface AddPaymentModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  invoice: InvoiceDataType | null;
  submitting?: boolean; 
}

export default function AddPaymentModal({
  open,
  onCancel,
  onSubmit,
  invoice,
  submitting,
}: AddPaymentModalProps) {
  const [form] = Form.useForm();

    const remainingAmount = invoice
      ? invoice.totalAmount - invoice.paidAmount
      : 0;

    useEffect(() => {
      if (open) {
        form.resetFields();
      }
    }, [open, invoice, form]);

  return (
    <Modal
      title={`Ajouter un paiement pour la facture #${invoice?.key
        .slice(-6)
        .toUpperCase()}`}
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
          loading={submitting}
        >
          Ajouter le paiment
        </Button>,
      ]}
      destroyOnClose
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
            max={remainingAmount}
            placeholder={`Maximum ${remainingAmount.toFixed(2)}`}
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
            <Option value={PaymentMethod.CASH}>Espèces</Option>
            <Option value={PaymentMethod.CARD}>Carte bancaire</Option>
            <Option value={PaymentMethod.BANK_TRANSFER}>Virement</Option>
            <Option value={PaymentMethod.CHECK}>Chèque</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
