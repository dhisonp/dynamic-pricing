import { calculateDynamicPrice } from './pricing';
import type { TicketSale } from './csvTypes';

interface Section {
  name: string;
  basePrice: number;
  capacity: number;
  seatPrefix: string;
}

const SECTIONS: Section[] = [
  { name: 'Orchestra', basePrice: 150, capacity: 50, seatPrefix: 'A' },
  { name: 'Balcony', basePrice: 100, capacity: 60, seatPrefix: 'B' },
  { name: 'General Admission', basePrice: 75, capacity: 40, seatPrefix: 'G' },
];

const EVENT_ID = 'EVT-2025-001';
const today = new Date();
const EVENT_DATE = new Date(today);
EVENT_DATE.setMonth(EVENT_DATE.getMonth() + 12);

export function generateExampleCSV(): TicketSale[] {
  const sales: TicketSale[] = [];

  const seatCounter = { A: 1, B: 1, G: 1 };
  let currentSold = 0;

  for (let i = 0; i < 150; i++) {
    const monthOffset = -12 + (i / 150) * 24;
    const saleDate = new Date(today);
    saleDate.setMonth(saleDate.getMonth() + monthOffset);

    const actualDaysUntilEvent = Math.floor(
      (EVENT_DATE.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysUntilEvent = Math.max(0, Math.min(30, actualDaysUntilEvent));

    const demandScore = Math.min(
      10,
      Math.max(1, 3 + Math.sin((i / 150) * Math.PI * 2) * 3 + Math.random() * 2)
    );

    currentSold = (i / 150) * 100;
    const percentSold = Math.min(100, currentSold);

    const sectionIndex = i % SECTIONS.length;
    const section = SECTIONS[sectionIndex];

    const breakdown = calculateDynamicPrice({
      daysUntilEvent,
      percentSold,
      demandScore,
    });

    const priceFactor = section.basePrice / 100;
    const finalPrice = Math.round(breakdown.finalPrice * priceFactor * 100) / 100;

    const seatNumber = seatCounter[section.seatPrefix as keyof typeof seatCounter]++;
    const seat = `${section.seatPrefix}-${String(seatNumber).padStart(3, '0')}`;

    sales.push({
      event_id: EVENT_ID,
      timestamp: saleDate.toISOString(),
      price: finalPrice,
      seat,
      section: section.name,
    });
  }

  sales.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return sales;
}

export function convertToCSVString(sales: TicketSale[]): string {
  const headers = ['event_id', 'timestamp', 'price', 'seat', 'section'];
  const rows = sales.map((sale) =>
    [sale.event_id, sale.timestamp, sale.price, sale.seat, sale.section].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
