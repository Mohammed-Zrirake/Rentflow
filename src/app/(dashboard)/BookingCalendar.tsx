/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useState } from "react";
import { Typography, Image, Space, Card, Button, Tooltip } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

const { Title, Text } = Typography;
interface Booking {
  id: string;
  clientName: string;
  startDate: string;
  endDate: string;
}
interface VehicleWithBookings {
  id: string;
  name: string;
  imageUrl: string;
  bookings: Booking[];
}
interface BookingCalendarProps {
  data: VehicleWithBookings[];
}

const ROW_HEIGHT = 60; 
const BookingCalendar: React.FC<BookingCalendarProps> = ({ data }) => {
  const [currentDate, setCurrentDate] = useState(dayjs("2024-07-01"));
  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const daysInMonth = endOfMonth.date();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  return (
    <Card bodyStyle={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={4} style={{ textTransform: "capitalize", margin: 0 }}>
          {currentDate.format("MMMM YYYY")}
        </Title>
        <Space>
          <Button
            icon={<LeftOutlined />}
            onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
          />
          <Button
            icon={<RightOutlined />}
            onClick={() => setCurrentDate(currentDate.add(1, "month"))}
          />
        </Space>
      </div>

      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `200px repeat(${daysInMonth}, minmax(45px, 1fr))`,
            gridTemplateRows: `auto repeat(${data.length}, ${ROW_HEIGHT}px)`,
            minWidth: `${200 + daysInMonth * 45}px`,
          }}
        >
         
          <div
            style={{
              gridColumn: 1,
              gridRow: 1,
              padding: "8px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
            }}
          >
            Véhicule
          </div>
          {daysArray.map((day, dayIndex) => (
            <div
              key={day.format("YYYY-MM-DD")}
              style={{
                gridColumn: dayIndex + 2,
                gridRow: 1,
                textAlign: "center",
                padding: "8px 4px",
                borderLeft: "1px solid #f0f0f0",
              }}
            >
              <Text type="secondary" style={{ textTransform: "capitalize" }}>
                {day.format("ddd")}
              </Text>
              <br />
              <Text strong>{day.format("D")}</Text>
            </div>
          ))}

          
          {data.map((vehicle, vehicleIndex) => (
            <React.Fragment key={vehicle.id}>

              <div
                style={{
                  gridRow: vehicleIndex + 2,
                  gridColumn: 1,
                  display: "flex",
                  alignItems: "center",
                  padding: "8px",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <Space>
                  <Image
                    src={vehicle.imageUrl}
                    width={40}
                    height={40}
                    style={{ objectFit: "cover" }}
                    preview={false}
                  />
                  <Text>{vehicle.name}</Text>
                </Space>
              </div>

              
              {daysArray.map((day, dayIndex) => (
                <div
                  key={day.format("DD")}
                  style={{
                    gridRow: vehicleIndex + 2,
                    gridColumn: dayIndex + 2,
                    borderLeft: "1px solid #f0f0f0",
                    borderTop: "1px solid #f0f0f0",
                  }}
                ></div>
              ))}


              {vehicle.bookings.map((booking) => {
                const bookingStart = dayjs(booking.startDate);
                const bookingEnd = dayjs(booking.endDate);

                if (
                  bookingEnd.isBefore(startOfMonth, "day") ||
                  bookingStart.isAfter(endOfMonth, "day")
                ) {
                  return null;
                }

                const startDay = bookingStart.isBefore(startOfMonth)
                  ? 1
                  : bookingStart.date();
                const endDay = bookingEnd.isAfter(endOfMonth)
                  ? daysInMonth
                  : bookingEnd.date();
                const duration = endDay - startDay + 1;

                return (
                  <Tooltip
                    key={booking.id}
                    title={`${vehicle.name} - ${booking.clientName}`}
                  >
                    <div
                      style={{
                        gridRow: vehicleIndex + 2,
                        gridColumn: `${startDay + 1} / span ${duration}`,
                        backgroundColor: "#b7eb8f",
                        borderRadius: "4px",
                        margin: "12px 2px",
                        padding: "4px 8px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Text>{booking.clientName}</Text>
                    </div>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default BookingCalendar;
