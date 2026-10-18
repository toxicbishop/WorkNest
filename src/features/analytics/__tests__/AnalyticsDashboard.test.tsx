import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AnalyticsDashboard } from "@/features/analytics/AnalyticsDashboard";
import { WorkNestProvider } from "@/context/WorkNestContext";

describe("AnalyticsDashboard Component", () => {
  it("renders operations analytics cockpit and occupancy cards", async () => {
    render(
      <WorkNestProvider>
        <AnalyticsDashboard />
      </WorkNestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Analytics & Occupancy Cockpit")).toBeInTheDocument();
    });

    expect(screen.getByText("Conversion Rate")).toBeInTheDocument();
    expect(screen.getByText("Membership Retention")).toBeInTheDocument();
    expect(screen.getByText("Location Occupancy & Capacity")).toBeInTheDocument();
    expect(screen.getByText("Meeting Room & Space Utilization")).toBeInTheDocument();
  });

  it("renders location occupancy rates and capacity metrics", async () => {
    render(
      <WorkNestProvider>
        <AnalyticsDashboard />
      </WorkNestProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Downtown Hub")).toBeInTheDocument();
    });

    expect(screen.getByText("Westside Commons")).toBeInTheDocument();
    expect(screen.getByText("Tech District")).toBeInTheDocument();
  });
});
