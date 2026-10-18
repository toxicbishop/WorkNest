import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InvoicesDirectory } from "@/features/billing/InvoicesDirectory";
import { WorkNestProvider } from "@/context/WorkNestContext";

describe("InvoicesDirectory Component", () => {
  it("renders financial metrics cards and invoice records", () => {
    render(
      <WorkNestProvider>
        <InvoicesDirectory />
      </WorkNestProvider>
    );

    expect(screen.getByText("Total Invoiced")).toBeInTheDocument();
    expect(screen.getByText("Collected Revenue")).toBeInTheDocument();
    expect(screen.getByText("Outstanding Balance")).toBeInTheDocument();
    expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
    expect(screen.getByText("INV-2026-002")).toBeInTheDocument();
    expect(screen.getByText("INV-2026-005")).toBeInTheDocument();
  });

  it("filters invoices based on search query", () => {
    render(
      <WorkNestProvider>
        <InvoicesDirectory />
      </WorkNestProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search invoice #, member, company...");
    fireEvent.change(searchInput, { target: { value: "Malhotra" } });

    expect(screen.getByText("INV-2026-002")).toBeInTheDocument();
    expect(screen.queryByText("INV-2026-001")).not.toBeInTheDocument();
  });

  it("opens create invoice modal when clicking Create Invoice button", () => {
    render(
      <WorkNestProvider>
        <InvoicesDirectory />
      </WorkNestProvider>
    );

    const createBtn = screen.getByRole("button", { name: /Create Invoice/i });
    fireEvent.click(createBtn);

    expect(screen.getByText("Generate New Invoice")).toBeInTheDocument();
  });

  it("opens invoice detail view when clicking on an invoice row", () => {
    render(
      <WorkNestProvider>
        <InvoicesDirectory />
      </WorkNestProvider>
    );

    const row = screen.getByText("INV-2026-001");
    fireEvent.click(row);

    expect(screen.getByText("TAX INVOICE")).toBeInTheDocument();
    expect(screen.getByText("WorkNest Coworking")).toBeInTheDocument();
  });
});
