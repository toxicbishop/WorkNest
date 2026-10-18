import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SpacesDirectory } from "@/features/spaces/SpacesDirectory";
import { WorkNestProvider } from "@/context/WorkNestContext";

describe("SpacesDirectory Component", () => {
  it("renders spaces catalog, metrics, and room cards", () => {
    render(
      <WorkNestProvider>
        <SpacesDirectory />
      </WorkNestProvider>
    );

    expect(screen.getByText("Total Spaces")).toBeInTheDocument();
    expect(screen.getByText("Kaveri Boardroom")).toBeInTheDocument();
    expect(screen.getByText("Godavari Focus Pod")).toBeInTheDocument();
    expect(screen.getByText("Brahmaputra Townhall Arena")).toBeInTheDocument();
  });

  it("filters spaces based on search query", () => {
    render(
      <WorkNestProvider>
        <SpacesDirectory />
      </WorkNestProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search spaces, amenities, floors...");
    fireEvent.change(searchInput, { target: { value: "Podcast" } });

    expect(screen.getByText("Cauvery Podcast Studio")).toBeInTheDocument();
    expect(screen.queryByText("Kaveri Boardroom")).not.toBeInTheDocument();
  });

  it("opens add space modal when clicking Add Space button", () => {
    render(
      <WorkNestProvider>
        <SpacesDirectory />
      </WorkNestProvider>
    );

    const addBtn = screen.getByRole("button", { name: /Add Space/i });
    fireEvent.click(addBtn);

    expect(screen.getByText("Add New Space")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Kaveri Boardroom/i)).toBeInTheDocument();
  });
});
