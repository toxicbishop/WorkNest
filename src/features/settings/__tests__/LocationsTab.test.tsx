import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocationsTab } from "@/features/settings/LocationsTab";
import { INITIAL_LOCATIONS } from "@/lib/mock-data";

describe("LocationsTab Component", () => {
  it("renders all configured co-working locations", () => {
    render(
      <LocationsTab
        locations={INITIAL_LOCATIONS}
        onAddLocation={vi.fn()}
        onUpdateLocation={vi.fn()}
        onDeleteLocation={vi.fn()}
      />
    );

    expect(screen.getByText("Downtown Hub")).toBeInTheDocument();
    expect(screen.getByText("Westside Commons")).toBeInTheDocument();
    expect(screen.getByText("Tech District")).toBeInTheDocument();
  });

  it("opens add location modal and submits new location", () => {
    const handleAdd = vi.fn();
    render(
      <LocationsTab
        locations={INITIAL_LOCATIONS}
        onAddLocation={handleAdd}
        onUpdateLocation={vi.fn()}
        onDeleteLocation={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Add Location"));
    expect(screen.getByText("Add New Co-working Location")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("e.g. Marina Arts Loft"), {
      target: { value: "Marina Arts Loft" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. 700 S Grand Ave, 4th Floor"), {
      target: { value: "100 Boardwalk Ave" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Los Angeles"), {
      target: { value: "Venice" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Sarah Jenkins"), {
      target: { value: "David Kim" },
    });

    fireEvent.click(screen.getByText("Create Location"));
    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Marina Arts Loft",
        city: "Venice",
        managerName: "David Kim",
      })
    );
  });
});
