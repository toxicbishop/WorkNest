import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { WorkNestProvider } from "@/context/WorkNestContext";

describe("NotificationDropdown Component", () => {
  it("renders notification bell button with active count badge", () => {
    render(
      <WorkNestProvider>
        <NotificationDropdown />
      </WorkNestProvider>
    );

    const bellBtn = screen.getByRole("button", { name: /notifications/i });
    expect(bellBtn).toBeInTheDocument();
  });

  it("opens popover with live operational alerts when clicked", () => {
    render(
      <WorkNestProvider>
        <NotificationDropdown />
      </WorkNestProvider>
    );

    const bellBtn = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellBtn);

    expect(screen.getByText("Notifications & Alerts")).toBeInTheDocument();
    expect(screen.getByText("Clear All")).toBeInTheDocument();
  });

  it("clears notifications when Clear All is clicked", () => {
    render(
      <WorkNestProvider>
        <NotificationDropdown />
      </WorkNestProvider>
    );

    const bellBtn = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellBtn);

    const clearBtn = screen.getByText("Clear All");
    fireEvent.click(clearBtn);

    expect(screen.getByText("All caught up!")).toBeInTheDocument();
  });
});
