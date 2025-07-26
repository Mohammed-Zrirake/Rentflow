/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Button, Typography, Space, Divider } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  CarOutlined,
  WalletOutlined,
  CreditCardOutlined,
  BellOutlined,
  SettingOutlined,
  TeamOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import Image from "next/image";

const { Sider } = Layout;
const { Text } = Typography;


const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "Tableau de bord" },
  { type: "divider" },
  { key: "/contracts", icon: <FileTextOutlined />, label: "Contrats" },
  { key: "/reservations", icon: <CalendarOutlined />, label: "Réservations" },
  { key: "/clients", icon: <UserOutlined />, label: "Clients" },
  { key: "/vehicles", icon: <CarOutlined />, label: "Véhicules" },
  { type: "divider" },
  { key: "/invoices", icon: <WalletOutlined />, label: "Factures" },
  { key: "/payments", icon: <CreditCardOutlined />, label: "Paiements" },
  { key: "/alerts", icon: <BellOutlined />, label: "Alertes" },
  { type: "divider" },
  { key: "/settings", icon: <SettingOutlined />, label: "Paramètres" },
  { key: "/users", icon: <TeamOutlined />, label: "Équipe" },
  { key: "/website", icon: <GlobalOutlined />, label: "Site web" },
];

const SIDER_WIDTH = 260; 

const Sidebar = () => {
  const pathname = usePathname();

  const getRootKey = () => {
    if (pathname === "/") return "/";
    const pathParts = pathname.split("/");
    return pathParts.length > 1 && pathParts[1] ? `/${pathParts[1]}` : "/";
  };

  const selectedRootKey = getRootKey();

  const itemsWithLinks = menuItems.map((item) =>
    item.type === "divider"
      ? { type: "divider", key: Math.random() }
      : {
          key: item.key,
          icon: item.icon,
          label: <Link href={item.key}>{item.label}</Link>,
          className: "menu-item",
        }
  );



  
  return (
    <Sider
      theme="dark"
      width={SIDER_WIDTH}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #001529 0%, #000c17 100%)",
        boxShadow: "4px 0 12px rgba(0, 0, 0, 0.15)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          marginBottom: "8px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* <Image
          src=nul
          alt="Studio Logo"
          width={140}
          height={40}
          style={{
            objectFit: "contain",
            filter: "brightness(0) invert(1)",
            transition: "all 0.3s ease",
          }}
          className="logo-hover"
        /> */}
      </div>

      <div style={{ padding: "16px 24px", marginBottom: "8px" }}>
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.85)",
            fontWeight: 500,
            fontSize: 16,
            display: "block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
        Nom d entreprise
        </Text>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedRootKey]}
        items={itemsWithLinks}
        style={{
          flex: 1,
          borderRight: 0,
          background: "transparent",
          padding: "0 12px", 
        }}
      />

      <Space
        direction="vertical"
        style={{
          width: "100%",
          padding: "16px",
          marginTop: "auto",
          background: "rgba(0, 0, 0, 0.2)",
        }}
      >
        <Divider
          style={{ margin: "8px 0", background: "rgba(255, 255, 255, 0.1)" }}
        />
        <Button
          block
          icon={<QuestionCircleOutlined />}
          className="sidebar-footer-button"
        >
          Besoin d'aide ?
        </Button>
        <Button
          block
          icon={<MobileOutlined />}
          className="sidebar-footer-button"
        >
          Application mobile
        </Button>
      </Space>

      <style jsx global>{`
        .ant-menu-dark.ant-menu-inline {
          background: transparent !important;
        }
        .menu-item.ant-menu-item {
          display: flex !important;
          align-items: center !important;
          padding: 0 12px !important;
          height: 44px !important;
          border-radius: 8px !important;
          margin: 2px 0 !important;
          transition: background-color 0.2s ease !important;
        }
        .ant-menu-title-content {
          margin-left: 12px !important;
          font-weight: 500;
        }
        .ant-menu-dark .ant-menu-item .ant-menu-title-content a {
          color: rgba(255, 255, 255, 0.85) !important;
          transition: color 0.2s ease;
        }

        /* === Icon "Button" Styling === */
        .ant-menu-item-icon {
          font-size: 16px !important;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          background-color: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.75);
          transition: all 0.2s ease;
        }

        /* === Hover State === */
        .ant-menu-dark .ant-menu-item:not(.ant-menu-item-selected):hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .ant-menu-dark
          .ant-menu-item:not(.ant-menu-item-selected):hover
          .ant-menu-item-icon {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
        }
        .ant-menu-dark
          .ant-menu-item:not(.ant-menu-item-selected):hover
          .ant-menu-title-content
          a {
          color: white !important;
        }

        /* === Selected State (Blue Gradient) === */
        .ant-menu-dark .ant-menu-item-selected {
          background: linear-gradient(
            90deg,
            #1677ff 0%,
            #4096ff 100%
          ) !important;
        }
        .ant-menu-dark .ant-menu-item-selected .ant-menu-item-icon {
          background-color: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }
        .ant-menu-dark .ant-menu-item-selected .ant-menu-title-content a {
          color: white !important;
        }

        /* === Divider === */
        .ant-menu-dark.ant-menu-inline .ant-menu-item-divider {
          background-color: rgba(255, 255, 255, 0.1) !important;
          margin: 8px 0 !important;
        }

        /* === Footer Buttons (restored original style) === */
        .sidebar-footer-button {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.85);
          border: none;
          height: 40px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .sidebar-footer-button:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          color: white !important;
          transform: scale(1.02);
        }
        .logo-hover:hover {
          transform: scale(1.05);
        }
      `}</style>
    </Sider>
  );
};

export default Sidebar;
