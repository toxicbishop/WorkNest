import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingModal } from "@/features/bookings/BookingModal";
import {
  INITIAL_SPACES,
  INITIAL_LOCATIONS,
  INITIAL_MEMBERS,
  INITIAL_LEADS,
} from "@/lib/mock-data";

describe("BookingModal Component", () => {
  const mockCheckConflict = vi.fn().mockImplementation((spaceId, date, startTime, endTime) => {
    // Mock conflict if 10:00 to 12:00 on 2026-10-19 for spc-downtown-1
    if (
      spaceId === "spc-downtown-1" &&
      date === "2026-10-19" &&
      startTime < "12:00" &&
      endTime > "10:00"
    ) {
      return {
        hasConflict: true,
        conflictingBooking: {
          id: "bkg-1",
          title: "Q4 Partner Strategy Review",
          startTime: "10:00",
          endTime: "12:00",
          status: "Confirmed",
        },
      };
    }
    return { hasConflict: false };
  });

  it("renders the modal with form controls", () => {
    render(
      <BookingModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn().mockReturnValue({ success: true })}
        spaces={INITIAL_SPACES}
        locations={INITIAL_LOCATIONS}
        members={INITIAL_MEMBERS}
        leads={INITIAL_LEADS}
        checkConflict={mockCheckConflict}
        initialDate="2026-10-25"
        initialSpaceId="spc-downtown-1"
      />
    );

    expect(screen.getByText("New Space Reservation / Tour")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Q4 Strategy Review/i)).toBeInTheDocument();
    expect(screen.getByText("Confirm Reservation")).toBeInTheDocument();
  });

  it("displays conflict warning and disables confirm button when slot overlaps", () => {
    render(
      <BookingModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn().mockReturnValue({ success: true })}
        spaces={INITIAL_SPACES}
        locations={INITIAL_LOCATIONS}
        members={INITIAL_MEMBERS}
        leads={INITIAL_LEADS}
        checkConflict={mockCheckConflict}
        initialDate="2026-10-19"
        initialSpaceId="spc-downtown-1"
      />
    );

    // Default start/end are 10:00 - 11:00 on 2026-10-19 for spc-downtown-1
    expect(screen.getByText(/Schedule Conflict Detected/i)).toBeInTheDocument();
    expect(screen.getByText(/Q4 Partner Strategy Review/i)).toBeInTheDocument();

    const submitBtn = screen.getByText("Confirm Reservation");
    expect(submitBtn).toBeDisabled();
  });

  it("allows confirmation when time slot is free", () => {
    const handleSave = vi.fn().mockReturnValue({ success: true });
    render(
      <BookingModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={handleSave}
        spaces={INITIAL_SPACES}
        locations={INITIAL_LOCATIONS}
        members={INITIAL_MEMBERS}
        leads={INITIAL_LEADS}
        checkConflict={mockCheckConflict}
        initialDate="2026-10-25"
        initialSpaceId="spc-downtown-1"
      />
    );

    // Free slot
    expect(screen.getByText("Space is available for this slot")).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/Q4 Strategy Review/i);
    fireEvent.change(titleInput, { target: { value: "Sprint Planning Session" } });

    const submitBtn = screen.getByText("Confirm Reservation");
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sprint Planning Session",
        spaceId: "spc-downtown-1",
        date: "2026-10-25",
        status: "Confirmed",
      })
    );
  });
});
