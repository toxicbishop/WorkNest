import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LeadsTable } from "@/features/leads/LeadsTable";
import { Lead } from "@/types";

const mockLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Jane Smith",
    email: "jane@test.com",
    phone: "123-456-7890",
    company: "Acme Corp",
    interestedPlan: "Dedicated Desk",
    preferredLocation: "Downtown Hub",
    teamSize: 2,
    source: "Website Form",
    status: "New",
    assignedTo: "Marcus Vance",
    createdAt: "2026-10-18T10:00:00Z",
    updatedAt: "2026-10-18T10:00:00Z",
  },
  {
    id: "lead-2",
    name: "John Doe",
    email: "john@startup.io",
    phone: "987-654-3210",
    company: "Startup Co",
    interestedPlan: "Private Office",
    preferredLocation: "Westside Commons",
    teamSize: 5,
    source: "Referral",
    status: "Tour Booked",
    assignedTo: "Sarah Jenkins",
    createdAt: "2026-10-17T10:00:00Z",
    updatedAt: "2026-10-17T10:00:00Z",
  },
];

describe("LeadsTable", () => {
  it("renders leads and displays contact info", () => {
    render(
      <LeadsTable
        leads={mockLeads}
        onEditLead={vi.fn()}
        onDeleteLead={vi.fn()}
        onStatusChange={vi.fn()}
        onConvertLead={vi.fn()}
        onOpenNewLead={vi.fn()}
        selectedLocationFilter="All"
      />
    );

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Startup Co")).toBeInTheDocument();
  });

  it("filters leads by search input", () => {
    render(
      <LeadsTable
        leads={mockLeads}
        onEditLead={vi.fn()}
        onDeleteLead={vi.fn()}
        onStatusChange={vi.fn()}
        onConvertLead={vi.fn()}
        onOpenNewLead={vi.fn()}
        selectedLocationFilter="All"
      />
    );

    const searchInput = screen.getByPlaceholderText(/search by prospect name/i);
    fireEvent.change(searchInput, { target: { value: "Startup" } });

    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders empty state when no leads match", () => {
    render(
      <LeadsTable
        leads={mockLeads}
        onEditLead={vi.fn()}
        onDeleteLead={vi.fn()}
        onStatusChange={vi.fn()}
        onConvertLead={vi.fn()}
        onOpenNewLead={vi.fn()}
        selectedLocationFilter="All"
      />
    );

    const searchInput = screen.getByPlaceholderText(/search by prospect name/i);
    fireEvent.change(searchInput, { target: { value: "NonExistentCompany" } });

    expect(screen.getByText(/no matching leads found/i)).toBeInTheDocument();
  });

  it("calls onConvertLead when Convert button is clicked", () => {
    const handleConvert = vi.fn();
    render(
      <LeadsTable
        leads={mockLeads}
        onEditLead={vi.fn()}
        onDeleteLead={vi.fn()}
        onStatusChange={vi.fn()}
        onConvertLead={handleConvert}
        onOpenNewLead={vi.fn()}
        selectedLocationFilter="All"
      />
    );

    const convertButton = screen.getByRole("button", { name: `Convert ${mockLeads[0].name} to member` });
    fireEvent.click(convertButton);

    expect(handleConvert).toHaveBeenCalledWith(mockLeads[0]);
  });
});
