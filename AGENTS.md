# AGENTS.md

## Project Overview

This is a Next.js 14 application demonstrating a dynamic ticket pricing model for live shows. It simulates real-time price adjustments based on event proximity, capacity, and demand using an interactive interface.

### Key Technologies
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React (client-side state management)
- date-fns
- PapaParse (CSV parsing)
- Recharts (charting library)

## Building and Running

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Lint
```bash
npm run lint
```

## Development Conventions

### Styling
- **Framework:** Tailwind CSS is used for styling.
- **Customization:** `tailwind.config.ts` defines custom colors based on CSS variables (`--background`, `--foreground`).

### Project Structure
- Standard Next.js App Router structure.
- `app/`: Contains root layout and main UI components.
- `lib/`: Houses core logic, including pricing algorithms (`pricing.ts`), CSV utilities (`csvGenerator.ts`, `csvTypes.ts`), and recommendation helpers.
- `components/`: Reusable React components for UI elements (e.g., `CSVUploader.tsx`, `DataTable.tsx`, `PriceChart.tsx`).

### TypeScript
- The project is configured with strict TypeScript checks (`"strict": true` in `tsconfig.json`).
- Path aliases are configured for `@/*` mapping to the project root.

### Linting
- ESLint is configured with `eslint-config-next`. Run `npm run lint` to check for issues.
