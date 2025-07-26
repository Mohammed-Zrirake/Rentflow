/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import {
  Layout,
  Button,
  Space,
  Badge,
  Dropdown,
  Avatar,
  MenuProps,
} from "antd";
import {
  BarChartOutlined,
  BookOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  GlobalOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { signOut } from "next-auth/react";

const { Header: AntdHeader } = Layout;

const items: MenuProps["items"] = [
  {
    key: "1",
    label: <Link href="/settings">Paramètres de l'entreprise</Link>,
    icon: <SettingOutlined />,
  },
  {
    key: "language-submenu",
    label: "Langue",
    icon: <GlobalOutlined />,
    children: [
      {
        key: "lang-fr",
        label: "Français",
        onClick: () => console.log("Changer la langue en Français"),
      },
      {
        key: "lang-en",
        label: "Anglais",
        onClick: () => console.log("Changer la langue en Anglais"),
      },
    ],
  },
  {
    type: "divider",
  },
  {
    key: "3",
    label: "Déconnexion",
    icon: <LogoutOutlined />,
    danger: true,
    onClick: () => signOut({ callbackUrl: "/login" }),
  },
];

const Header = () => {
  return (
    <AntdHeader
      style={{
        padding: "0 32px",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        borderBottom: "1px solid #f0f0f0",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
    
      <div style={{ flex: 1 }}></div>


      <div style={{ flex: 1, textAlign: "center" }}>
        <Link href="/vehicles/statistics" passHref>
          <Button
            type="primary"
            icon={<BarChartOutlined />}
            style={{
              height: 40,
              padding: "0 24px",
              fontWeight: 500,
              boxShadow: "0 2px 8px rgba(22, 119, 255, 0.3)",
              transition: "all 0.3s ease",
            }}
            className="hover-scale"
          >
            Statistiques des Véhicules
          </Button>
        </Link>
      </div>

      {/* Right column (user actions) */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        <Space size="middle" style={{ height: "100%" }}>
          <Button
            icon={<BookOutlined />}
            style={{
              border: "none",
              background: "transparent",
              color: "#1677ff",
              fontWeight: 500,
              height: "100%",
              padding: "0 16px",
            }}
            className="hover-underline"
          >
            Formation
          </Button>

          <Link href="/alerts" passHref>
            <Badge
              dot
              color="#ff4d4f"
              offset={[-5, 5]}
              style={{
                display: "flex",
                alignItems: "center",
                
              }}
            >
              <Button
                shape="circle"
                icon={<BellOutlined />}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#595959",
                  fontSize: 16,
                }}
                className="hover-scale"
              />
            </Badge>
          </Link>

          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <a onClick={(e) => e.preventDefault()}>
              <Avatar
                style={{
                  backgroundColor: "#1677ff",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                icon={<UserOutlined />}
                className="hover-scale"
                size="default"
              />
            </a>
          </Dropdown>
        </Space>
      </div>

      <style jsx global>{`
        .hover-scale:hover {
          transform: scale(1.05);
        }
        .hover-underline:hover {
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .ant-dropdown-menu {
          border-radius: 8px;
          padding: 8px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .ant-dropdown-menu-item {
          padding: 12px 16px;
          margin: 4px 0;
        }
        .ant-dropdown-menu-item:hover {
          background-color: #f5f5f5;
        }
        .ant-badge-dot {
          width: 10px;
          height: 10px;
        }
      `}</style>
    </AntdHeader>
  );
};

export default Header;
