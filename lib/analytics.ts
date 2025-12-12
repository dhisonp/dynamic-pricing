import type {
  TicketSale,
  SalesAnalytics,
  SectionData,
  TimeSeriesDataPoint,
} from './csvTypes';

export function calculateStats(sales: TicketSale[]): SalesAnalytics {
  if (sales.length === 0) {
    return {
      totalSales: 0,
      totalRevenue: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      historicalSales: 0,
      projectedSales: 0,
      historicalRevenue: 0,
      projectedRevenue: 0,
    };
  }

  const now = new Date();
  const prices = sales.map((s) => s.price);

  const historical = sales.filter((s) => new Date(s.timestamp) <= now);
  const projected = sales.filter((s) => new Date(s.timestamp) > now);

  return {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + s.price, 0),
    averagePrice: sales.reduce((sum, s) => sum + s.price, 0) / sales.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    historicalSales: historical.length,
    projectedSales: projected.length,
    historicalRevenue: historical.reduce((sum, s) => sum + s.price, 0),
    projectedRevenue: projected.reduce((sum, s) => sum + s.price, 0),
  };
}

export function groupBySection(sales: TicketSale[]): SectionData[] {
  const sectionMap = new Map<string, TicketSale[]>();

  sales.forEach((sale) => {
    if (!sectionMap.has(sale.section)) {
      sectionMap.set(sale.section, []);
    }
    sectionMap.get(sale.section)!.push(sale);
  });

  const sectionData: SectionData[] = [];

  sectionMap.forEach((sectionSales, section) => {
    const prices = sectionSales.map((s) => s.price);
    sectionData.push({
      section,
      totalSales: sectionSales.length,
      averagePrice: sectionSales.reduce((sum, s) => sum + s.price, 0) / sectionSales.length,
      totalRevenue: sectionSales.reduce((sum, s) => sum + s.price, 0),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    });
  });

  return sectionData.sort((a, b) => b.averagePrice - a.averagePrice);
}

export function splitHistoricalProjected(sales: TicketSale[]): {
  historical: TicketSale[];
  projected: TicketSale[];
} {
  const now = new Date();

  return {
    historical: sales.filter((s) => new Date(s.timestamp) <= now),
    projected: sales.filter((s) => new Date(s.timestamp) > now),
  };
}

export function generateTimeSeriesData(sales: TicketSale[]): TimeSeriesDataPoint[] {
  const now = new Date();

  return sales
    .map((sale) => {
      const saleDate = new Date(sale.timestamp);
      return {
        date: sale.timestamp,
        price: sale.price,
        timestamp: saleDate.getTime(),
        isHistorical: saleDate <= now,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}
