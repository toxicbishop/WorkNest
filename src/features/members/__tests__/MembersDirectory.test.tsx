import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MembersDirectory } from "@/features/members/MembersDirectory";
import {
  INITIAL_MEMBERS,
  INITIAL_MEMBERSHIPS,
  INITIAL_LOCATIONS,
  INITIAL_MEMBERSHIP_PLANS,
} from "@/lib/mock-data";

describe("MembersDirectory Component", () => {
  it("renders member records and plan assignments", () => {
    render(
      <MembersDirectory
        members={INITIAL_MEMBERS}
        memberships={INITIAL_MEMBERSHIPS}
        locations={INITIAL_LOCATIONS}
        plans={INITIAL_MEMBERSHIP_PLANS}
        selectedLocation="All"
        onAddMember={vi.fn()}
        onUpdateMember={vi.fn()}
        onDeleteMember={vi.fn()}
        onUpdateStatus={vi.fn()}
        onRenew={vi.fn()}
      />
    );

    expect(screen.getByText("Maya Patel")).toBeInTheDocument();
    expect(screen.getByText("Vikram Malhotra")).toBeInTheDocument();
    expect(screen.getByText("Ananya Deshmukh")).toBeInTheDocument();
  });

  it("filters members based on search input", () => {
    render(
      <MembersDirectory
        members={INITIAL_MEMBERS}
        memberships={INITIAL_MEMBERSHIPS}
        locations={INITIAL_LOCATIONS}
        plans={INITIAL_MEMBERSHIP_PLANS}
        selectedLocation="All"
        onAddMember={vi.fn()}
        onUpdateMember={vi.fn()}
        onDeleteMember={vi.fn()}
        onUpdateStatus={vi.fn()}
        onRenew={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      "Search by name, company, email, or plan..."
    );
    fireEvent.change(searchInput, { target: { value: "Malhotra" } });

    expect(screen.getByText("Vikram Malhotra")).toBeInTheDocument();
    expect(screen.queryByText("Maya Patel")).not.toBeInTheDocument();
  });

  it("opens member detail modal on row click", () => {
    render(
      <MembersDirectory
        members={INITIAL_MEMBERS}
        memberships={INITIAL_MEMBERSHIPS}
        locations={INITIAL_LOCATIONS}
        plans={INITIAL_MEMBERSHIP_PLANS}
        selectedLocation="All"
        onAddMember={vi.fn()}
        onUpdateMember={vi.fn()}
        onDeleteMember={vi.fn()}
        onUpdateStatus={vi.fn()}
        onRenew={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Maya Patel"));
    expect(screen.getByText("Active Membership Contract")).toBeInTheDocument();
    expect(screen.getByText(/Assigned to Suite 304/)).toBeInTheDocument();
  });
});
