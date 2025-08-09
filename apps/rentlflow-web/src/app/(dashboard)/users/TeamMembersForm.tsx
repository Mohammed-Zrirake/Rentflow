"use client";

import React from "react";
import { Form, Input, Radio, Row, Col, Divider } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { UserStatus } from "@rentflow/database";


import { UserFormSchema } from "@rentflow/database/schemas";

interface TeamMemberFormProps {
  isEditMode: boolean;
}

export default function TeamMemberForm({ isEditMode }: TeamMemberFormProps) {
  return (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="name"
            label="Nom complet"
            required
            rules={[createSchemaFieldRule(UserFormSchema)]}
          >
            <Input
              placeholder="Nom complet de l'utilisateur"
              autoComplete="off"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="email"
            label="Adresse email"
            required
            rules={[createSchemaFieldRule(UserFormSchema)]}
          >
            <Input placeholder="adresse@email.com" autoComplete="off" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="password"
            label="Mot de passe"
            required={!isEditMode}
            rules={[createSchemaFieldRule(UserFormSchema)]}
            help={
              isEditMode
                ? "Laissez vide pour ne pas changer le mot de passe."
                : undefined
            }
          >
            <Input.Password
              placeholder={
                isEditMode
                  ? "Nouveau mot de passe (optionnel)"
                  : "Créer un mot de passe sécurisé"
              }
              autoComplete="new-password"
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider style={{ margin: "16px 0" }} />

      <Row>
        <Col span={24}>
          <Form.Item
            name="status"
            label="Statut"
            initialValue={UserStatus.ACTIVE}
          >
            <Radio.Group>
              <Radio value={UserStatus.ACTIVE}>Actif</Radio>
              <Radio value={UserStatus.INACTIVE}>Inactif</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
