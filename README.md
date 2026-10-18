# WorkNest CRM

![Next.js 16](https://img.shields.io/badge/Next.js-16.4.2-black?style=flat&logo=next.js&logoColor=white)
![React 19](https://img.shields.io/badge/React-19.3.0-%2320232a?style=flat&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-%23007ACC?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-12.3.4-%234a4a4a.svg?style=flat&logo=pnpm&logoColor=f69220)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)
![WCAG](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-059669?style=flat)
![Status](https://img.shields.io/badge/Release-Phase_1_Frontend_Foundation-20382F?style=flat)

WorkNest CRM is a dedicated coworking management and prospect conversion system. It unifies the complete coworking member lifecycle into one operational cockpit:

$$\text{Inquiry} \longrightarrow \text{Qualification} \longrightarrow \text{Follow-up} \longrightarrow \text{Tour} \longrightarrow \text{Membership Conversion} \longrightarrow \text{Booking/Engagement} \longrightarrow \text{Renewal/Retention}$$

---

## Highlights and Phase 1 Scope

- **Executive Operations Dashboard:**
  - KPI metrics with explicit, documented business definitions: Active Members, Open Pipeline Leads, Scheduled Tours (7d), and Recognized MRR.
  - Transparent banner and tags ensuring demo fixtures are never misrepresented as live production data.
- **Lead and Opportunity Pipeline:**
  - Complete operational stages: `New`, `Contacted`, `Tour Booked`, `Converted`, `Lost`.
  - Mandatory audit reason enforcement when marking a prospect as `Lost` (PRD Section 6.2).
  - Search across prospect names, emails, and company names with multi-parameter filtering.
  - Duplicate candidate detection on creation.
  - Conversion workflow allowing instant conversion of qualified leads into members.
- **Activities and Follow-ups:**
  - Automatic creation of initial follow-up tasks upon prospect inquiry.
  - Overdue task identification and one-click completion toggling.
- **Design System and UX:**
  - Styled with WorkNest brand tokens: Forest Green (`#20382F`) and warm off-white (`#F7F8F6`).
  - Fully accessible dialogs, WCAG 2.2 AA compliant contrast, and keyboard navigation (`Escape` dismissal, focus styles).
  - Responsive desktop sidebar and mobile slide-out drawer.
- **Client Persistence:**
  - In-browser local storage persistence ensuring state remains intact after page refresh.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) with React 19 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with WorkNest Design Tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Test Runner** | [Vitest](https://vitest.dev/) with `@testing-library/react` and `jsdom` |
| **Code Quality** | ESLint 9 (`eslint-config-next`) |

---

## Project Structure

```text
WorkNest/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout & providers
│   │   ├── page.tsx                 # Operations Dashboard
│   │   ├── leads/
│   │   │   └── page.tsx             # Dedicated Leads Pipeline
│   │   └── globals.css              # Design tokens & Tailwind theme
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx         # Responsive container shell
│   │   │   ├── Header.tsx           # Workspace header & location scope
│   │   │   ├── Sidebar.tsx          # Collapsible navigation
│   │   │   └── DemoBanner.tsx       # Mandatory fixture disclaimer
│   │   └── ui/
│   │       └── StatusBadge.tsx      # Stage status pill badges
│   ├── context/
│   │   └── WorkNestContext.tsx      # State store & localStorage sync
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── MetricCards.tsx      # KPI cards with definition tooltips
│   │   │   ├── PipelineBreakdown.tsx# Stage distribution bar & cards
│   │   │   └── ActivityFeed.tsx     # Follow-up feed & overdue checks
│   │   └── leads/
│   │       ├── LeadsTable.tsx       # Search, filter, and stage operations
│   │       ├── LeadModal.tsx        # Add/edit prospect form with validation
│   │       └── ConvertModal.tsx     # Lead conversion to active member
│   ├── lib/
│   │   ├── mock-data.ts             # Initial demo fixtures & metrics
│   │   ├── useCurrentTimestamp.ts   # Safe SSR/prerender timestamp hook
│   │   └── utils.ts                 # Formatting & class merging
│   └── types/
│       └── index.ts                 # Domain models (Lead, Activity, Metrics)
├── AGENTS.md                        # Coding agent guidelines & architecture
├── PRD.md                           # Product Requirements Document
├── vitest.config.ts                 # Vitest test suite configuration
└── package.json
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v20+` (Tested on `v24.16`)
- **pnpm**: `v9+` (Tested on `v12.3.4`)

### Installation
```bash
# Clone the repository
git clone https://github.com/toxicbishop/WorkNest.git
cd WorkNest

# Install dependencies
pnpm install
```

### Running Locally
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts local Next.js development server with hot-reload |
| `pnpm build` | Builds optimized production bundle via Turbopack |
| `pnpm start` | Starts production server |
| `pnpm lint` | Runs ESLint 9 checks |
| `pnpm typecheck`| Validates TypeScript across all modules (`tsc --noEmit`) |
| `pnpm test` | Runs unit & component tests using Vitest |

---

## License

This project is licensed under the [MIT LICENSE](LICENSE)- see the  file for details.
