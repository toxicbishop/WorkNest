import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LEAD_STATUSES } from "@/types";

describe("StatusBadge", () => {
  it.each(LEAD_STATUSES)("renders badge with text for status: %s", (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });
});
