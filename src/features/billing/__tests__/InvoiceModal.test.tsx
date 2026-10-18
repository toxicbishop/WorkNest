import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InvoiceModal } from "@/features/billing/InvoiceModal";
import { INITIAL_MEMBERS, INITIAL_LOCATIONS } from "@/lib/mock-data";

describe("InvoiceModal Component", () => {
  it("renders the invoice generation form with line item table", () => {
    render(
      <InvoiceModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        members={INITIAL_MEMBERS}
        locations={INITIAL_LOCATIONS}
        existingInvoicesCount={5}
      />
    );

    expect(screen.getByText("Generate New Invoice")).toBeInTheDocument();
    expect(screen.getByText("Itemized Line Items")).toBeInTheDocument();
    expect(screen.getByText("Total Payable:")).toBeInTheDocument();
    expect(screen.getByText("Create Invoice")).toBeInTheDocument();
  });

  it("calculates subtotal, 18% GST tax, and total amount when line items change", () => {
    render(
      <InvoiceModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        members={INITIAL_MEMBERS}
        locations={INITIAL_LOCATIONS}
        existingInvoicesCount={5}
      />
    );

    // Initial item is 6500. GST 18% is 1170. Total is 7670.
    expect(screen.getByText("₹7,670")).toBeInTheDocument();

    const rateInput = screen.getByDisplayValue("6500");
    fireEvent.change(rateInput, { target: { value: "10000" } });

    // Subtotal 10000, 18% tax 1800, Total 11800
    expect(screen.getByText("₹11,800")).toBeInTheDocument();
  });

  it("submits the invoice with computed totals", () => {
    const handleSave = vi.fn();
    render(
      <InvoiceModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={handleSave}
        members={INITIAL_MEMBERS}
        locations={INITIAL_LOCATIONS}
        existingInvoicesCount={5}
      />
    );

    const submitBtn = screen.getByText("Create Invoice");
    fireEvent.click(submitBtn);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceNumber: "INV-2026-006",
        memberName: "Maya Patel",
        currency: "INR",
        taxRatePercent: 18,
        status: "Open",
      })
    );
  });
});
