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
  type: "CONTRACT" | "RESERVATION";
}

interface VehicleWithBookings {
  id: string;
  name: string;
  imageUrl: string | null;
  bookings: Booking[];
}

interface BookingCalendarProps {
  data: VehicleWithBookings[];
}

const ROW_HEIGHT = 70; // Slightly increased row height

const BookingCalendar: React.FC<BookingCalendarProps> = ({ data }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const startOfMonth = currentDate.startOf("month");
  const [hoveredBooking, setHoveredBooking] = useState<string | null>(null);
  const endOfMonth = currentDate.endOf("month");
  const daysInMonth = endOfMonth.date();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  return (
    <Card
      bodyStyle={{
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Header with month/year and navigation buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Title
          level={4}
          style={{
            textTransform: "capitalize",
            margin: 0,
            color: "#1d1d1d",
            fontWeight: 600,
          }}
        >
          {currentDate.format("MMMM YYYY")}
        </Title>
        <Space>
          <Button
            shape="circle"
            icon={<LeftOutlined />}
            onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
            style={{ borderColor: "#d9d9d9" }}
          />
          <Button
            shape="circle"
            icon={<RightOutlined />}
            onClick={() => setCurrentDate(currentDate.add(1, "month"))}
            style={{ borderColor: "#d9d9d9" }}
          />
        </Space>
      </div>

      {/* Calendar grid container */}
      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `220px repeat(${daysInMonth}, minmax(50px, 1fr))`,
            gridTemplateRows: `auto repeat(${data.length}, ${ROW_HEIGHT}px)`,
            minWidth: `${220 + daysInMonth * 50}px`,
          }}
        >
          {/* Vehicle column header */}
          <div
            style={{
              gridColumn: 1,
              gridRow: 1,
              padding: "12px 16px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              color: "#595959",
              backgroundColor: "#fafafa",
              position: "sticky",
              left: 0,
              zIndex: 3,
            }}
          >
            Véhicule
          </div>

          {/* Day headers */}
          {daysArray.map((day, dayIndex) => (
            <div
              key={day.format("YYYY-MM-DD")}
              style={{
                gridColumn: dayIndex + 2,
                gridRow: 1,
                textAlign: "center",
                padding: "12px 4px",
                borderLeft: "1px solid #f0f0f0",
                backgroundColor:
                  day.day() === 0 || day.day() === 6 ? "#f5f5f5" : "#fafafa",
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              <Text
                type="secondary"
                style={{
                  textTransform: "capitalize",
                  fontSize: "12px",
                  display: "block",
                  marginBottom: "4px",
                  color:
                    day.day() === 0
                      ? "#ff4d4f"
                      : day.day() === 6
                      ? "#1890ff"
                      : "#8c8c8c",
                }}
              >
                {day.format("ddd")}
              </Text>
              <Text
                strong
                style={{
                  fontSize: "14px",
                  color:
                    day.day() === 0
                      ? "#ff4d4f"
                      : day.day() === 6
                      ? "#1890ff"
                      : "#1d1d1d",
                }}
              >
                {day.format("D")}
              </Text>
            </div>
          ))}

          {/* Vehicle rows */}
          {data.map((vehicle, vehicleIndex) => (
            <React.Fragment key={vehicle.id}>
              {/* Vehicle name cell (fixed column) */}
              <div
                style={{
                  gridRow: vehicleIndex + 2,
                  gridColumn: 1,
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderTop: "1px solid #f0f0f0",
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#fff",
                  zIndex: 2,
                }}
              >
                <Space>
                  <Image
                    src={vehicle.imageUrl || "/default-vehicle.png"}
                    width={48}
                    height={48}
                    style={{
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #f0f0f0",
                    }}
                    preview={false}
                    alt={vehicle.name}
                  />
                  <Text strong style={{ color: "#1d1d1d" }}>
                    {vehicle.name}
                  </Text>
                </Space>
              </div>

              {/* Empty grid cells for this vehicle row */}
              {daysArray.map((day, dayIndex) => (
                <div
                  key={`${vehicle.id}-${day.format("DD")}`}
                  style={{
                    gridRow: vehicleIndex + 2,
                    gridColumn: dayIndex + 2,
                    borderLeft: "1px solid #f0f0f0",
                    borderTop: "1px solid #f0f0f0",
                    backgroundColor:
                      day.day() === 0 || day.day() === 6 ? "#f9f9f9" : "#fff",
                  }}
                ></div>
              ))}

              {/* Vehicle bookings */}
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

                const isContract = booking.type === "CONTRACT";
                const backgroundColor = isContract ? "#f0f7ff" : "#fff7e6";
                const borderColor = isContract ? "#69b1ff" : "#ffd666";
                const textColor = isContract ? "#1677ff" : "#fa8c16";

                return (
                  <Tooltip
                    key={booking.id}
                    title={`${isContract ? "Contrat" : "Réservation"} avec ${
                      booking.clientName
                    } (${bookingStart.format("D MMM")} - ${bookingEnd.format(
                      "D MMM YYYY"
                    )})`}
                  >
                    <div
                      style={{
                        gridRow: vehicleIndex + 2,
                        gridColumn: `${startDay + 1} / span ${duration}`,
                        backgroundColor: backgroundColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        margin: "8px 4px",
                        padding: "8px 12px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        transition: "all 0.2s",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                        height: "44px",
                        transform:
                          hoveredBooking === booking.id
                            ? "translateY(-1px)"
                            : "none",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          color: textColor,
                          fontSize: "13px",
                        }}
                      >
                        {booking.clientName}
                      </Text>
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
