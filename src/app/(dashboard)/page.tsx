"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Space,Skeleton } from "antd";
import {
  CarOutlined,
  FileDoneOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { toast } from "react-toastify";
const BookingCalendar = dynamic(
  () => import("./BookingCalendar"),
  {
    loading: () => <Skeleton active paragraph={{ rows: 8 }} />,
    ssr: false,
  }
);

interface DashboardData {
  bookingData: any[];
  stats: {
    vehiclesAvailable: number;
    activeContracts: number;
    pendingReservations: number;
  };
}
interface ApiBookingData {
  id: string;
  name: string;
  imageUrl: string | null;
  bookings: any[];
}



export default function DashboardHomePage() {  
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    
   useEffect(() => {
     console.log("DashboardHomePage: Le composant est monté. Début du fetch."); // LOG 1

     const fetchData = async () => {
       setLoading(true);
       try {
         console.log("DashboardHomePage: Appel à Promise.all..."); // LOG 2
         const [statsRes, calendarRes] = await Promise.all([
           api.get("/dashboard/stats"),
           api.get("/dashboard/calendar-data"),
         ]);

          const transformedBookingData = calendarRes.data.map(
            (vehicle: ApiBookingData) => ({
              ...vehicle,
              // On applique la même logique que pour la page des véhicules
              imageUrl: vehicle.imageUrl
                ? `${process.env.NEXT_PUBLIC_API_URL}${vehicle.imageUrl}`
                : "/default-vehicle.png", // Image de secours
            })
          );

         setData({
           stats: statsRes.data,
           bookingData: transformedBookingData,
         });

         console.log("DashboardHomePage: L'état 'data' a été mis à jour."); // LOG 4
       } catch (error) {
         console.error("DashboardHomePage: ERREUR PENDANT LE FETCH !", error); // LOG ERREUR
         toast.error(
           "Erreur lors du chargement des données du tableau de bord."
         );
       } finally {
         setLoading(false);
         console.log("DashboardHomePage: Fin du chargement (finally)."); // LOG FIN
       }
     };

     fetchData();
   }, []); 

   if (loading) {
     return (
       <div style={{ padding: 24 }}>
         <Skeleton active paragraph={{ rows: 15 }} />
       </div>
     );
   }

     if (!data) {
       return (
         <div style={{ padding: 24 }}>Erreur de chargement des données.</div>
       );
     }

     const { stats, bookingData } = data;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Section des statistiques */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              border: "1px solid #f0f0f0",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title="Véhicules disponibles"
              value={stats.vehiclesAvailable}
              prefix={<CarOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              border: "1px solid #f0f0f0",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title="Contrats actifs"
              value={stats.activeContracts}
              prefix={<FileDoneOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              border: "1px solid #f0f0f0",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title="Réservations en attente"
              value={stats.pendingReservations}
              prefix={<FieldTimeOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16", fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <div
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
          border: "1px solid #f0f0f0",
          background: "#fff",
          padding: "16px",
        }}
      >
        <BookingCalendar data={bookingData} />
      </div>

      <style jsx global>{`
        .hover-scale {
          transition: all 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
        .ant-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </Space>
  );
}
