import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardHomePage from "./DashboardHomePage";

async function getDashboardData() {
  // const response = await fetch('http://your-nest-api/dashboard-stats');
  // const data = await response.json();
  // return data;

  // For now, we'll return the mock data
  return {
  stats:{
  vehiclesAvailable: 0,
  activeContracts: 1,
  pendingReservations: 1,
},
 bookingData:[
  {
    id: "v1",
    name: "Alfa Romeo",
    imageUrl: "https://i.ibb.co/VvzS2Y2/alfa-romeo.png",
    bookings: [
      {
        id: "b1",
        clientName: "amine alami",
        startDate: "2024-07-04",
        endDate: "2024-07-07",
      },
      {
        id: "b_overlap_start",
        clientName: "Client Débordement Début",
        startDate: "2024-06-28",
        endDate: "2024-07-02",
      },
    ],
  },
  {
    id: "v2",
    name: "Dacia Duster",
    imageUrl: "https://i.ibb.co/bFw1G8M/dacia-duster.png",
    bookings: [
      {
        id: "b2",
        clientName: "fatima zahra",
        startDate: "2024-07-10",
        endDate: "2024-07-15",
      },
      {
        id: "b3",
        clientName: "youssef karim",
        startDate: "2024-07-20",
        endDate: "2024-07-22",
      },
      {
        id: "b_overlap_end",
        clientName: "Client Débordement Fin",
        startDate: "2024-07-29",
        endDate: "2024-08-03",
      },
    ],
  },
  {
    id: "v3",
    name: "Renault Clio",
    imageUrl: "https://placehold.co/40x40/e6f4ff/1677ff?text=RC",
    bookings: [
      {
        id: "b_august",
        clientName: "Client Août",
        startDate: "2024-08-10",
        endDate: "2024-08-15",
      },
    ],
  },
  {
    id: "v4",
    name: "Dacia Duster",
    imageUrl: "https://i.ibb.co/bFw1G8M/dacia-duster.png",
    bookings: [
      {
        id: "b_overlap",
        clientName: "Client Longue Durée",
        startDate: "2024-07-28",
        endDate: "2024-08-03",
      },
    ],
  },
],
  };
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }
   const dashboardData = await getDashboardData();
  return <DashboardHomePage initialData={dashboardData} />;
}
