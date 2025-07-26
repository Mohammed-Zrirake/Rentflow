"use client";

import { ToastContainer } from "react-toastify"; // 1. Import ToastContainer
import "react-toastify/dist/ReactToastify.css";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { App } from "antd";

const { Content } = Layout;

const SIDER_WIDTH = 260;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <App>
      <Layout style={{ minHeight: "100vh" }}>
        <Sidebar />
        <Layout style={{ marginLeft: SIDER_WIDTH }}>
          <Header />
          <Content
            style={{
              padding: "24px",
              background: "#F9FAFB",
            }}
          >
            {children}
          </Content>
        </Layout>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Layout>
    </App>
  );
}