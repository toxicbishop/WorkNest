import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingsDirectory } from "@/features/bookings/BookingsDirectory";
import { WorkNestProvider } from "@/context/WorkNestContext";

describe("BookingsDirectory Component", () => {
  it("renders bookings operational dashboard, KPI summary, and reservation table", () => {
    render(
      <WorkNestProvider>
        <BookingsDirectory />
      </WorkNestProvider>
    );

    expect(screen.getByText("Today's Reservations")).toBeInTheDocument();
    expect(screen.getByText("Checked In Now")).toBeInTheDocument();
    expect(screen.getByText("Q4 Partner Strategy Review")).toBeInTheDocument();
    expect(screen.getByText("Architecture Design Sprint")).toBeInTheDocument();
  });

  it("filters bookings based on search query", () => {
    render(
      <WorkNestProvider>
        <BookingsDirectory />
      </WorkNestProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search title, member, space, location...");
    fireEvent.change(searchInput, { target: { value: "Robotics" } });

    expect(screen.getByText("Robotics Industry Demo Night")).toBeInTheDocument();
    expect(screen.queryByText("Q4 Partner Strategy Review")).not.toBeInTheDocument();
  });

  it("opens new reservation modal when clicking New Reservation", () => {
    render(
      <WorkNestProvider>
        <BookingsDirectory />
      </WorkNestProvider>
    );

    const newBtn = screen.getByRole("button", { name: /New Reservation/i });
    fireEvent.click(newBtn);

    expect(screen.getByText("New Space Reservation / Tour")).toBeInTheDocument();
  });
});
