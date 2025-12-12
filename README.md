# Dynamic Pricing Model for Live Shows

A minimal Next.js 14 application demonstrating dynamic ticket pricing based on real-time factors like event proximity, capacity, and demand.

## Features

- **Real-time Price Calculation**: Watch ticket prices update instantly as you adjust factors
- **Three Pricing Factors**:
  - **Time Decay**: Exponential price increase in the last 7 days before the event
  - **Scarcity**: Price multiplier increases as capacity fills (1.0× to 1.5×)
  - **Demand Score**: External demand signal (1-10 scale) influencing price
- **Interactive Simulation**: Sliders to test different scenarios
- **Transparent Breakdown**: See exactly how each factor contributes to the final price

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Client-side state management (no database)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Pricing Algorithm

### Base Price
Starting price: $100

### Time Decay Multiplier
- **30+ days out**: Minimal increase (1.0 - 1.23×)
- **Last 7 days**: Exponential curve (up to 1.5×)
- Formula: Uses exponential growth based on days remaining

### Scarcity Multiplier
- **0-50% sold**: 1.0× (no increase)
- **50-70% sold**: 1.0 - 1.1× (gradual increase)
- **70-90% sold**: 1.1 - 1.3× (steeper increase)
- **90-100% sold**: 1.3 - 1.5× (maximum scarcity premium)

### Demand Multiplier
- **Score 1-10**: 1.0× to 1.45×
- Each point adds 5% to the price
- Simulates external demand signals (social media buzz, artist popularity, etc.)

### Final Price Calculation
```
Final Price = Base Price × Time Decay × Scarcity × Demand
```

## Project Structure

```
dynamic-pricing/
├── app/
│   ├── page.tsx          # Main UI component
│   └── layout.tsx        # Root layout
├── lib/
│   └── pricing.ts        # Pricing algorithm logic
└── README.md
```

## Future Enhancements

- Database integration for persistent events
- Historical price tracking and analytics
- Multiple event management
- API endpoints for price queries
- Advanced demand signals (weather, competing events, etc.)
- Price floor/ceiling constraints
- A/B testing different pricing curves

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).
