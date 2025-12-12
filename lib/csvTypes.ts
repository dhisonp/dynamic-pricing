export interface TicketSale {
  event_id: string;
  timestamp: string;
  price: number;
  seat: string;
  section: string;
}

export interface SalesAnalytics {
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  historicalSales: number;
  projectedSales: number;
  historicalRevenue: number;
  projectedRevenue: number;
}

export interface SectionData {
  section: string;
  totalSales: number;
  averagePrice: number;
  totalRevenue: number;
  minPrice: number;
  maxPrice: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  price: number;
  timestamp: number;
  isHistorical: boolean;
}

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationType =
  | 'price_increase'
  | 'price_decrease'
  | 'urgency'
  | 'opportunity'
  | 'marketing';
export type RecommendationScope = 'event' | 'section';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  scope: RecommendationScope;
  priority: RecommendationPriority;
  confidence: number;
  estimatedImpact: number;
  title: string;
  description: string;
  reasoning: string;
  action: string;
  targetSection?: string;
  metrics: {
    currentVelocity?: number;
    benchmarkVelocity?: number;
    velocityDiff?: number;
    daysUntilEvent?: number;
    percentSold?: number;
    percentUnsold?: number;
  };
  dismissed?: boolean;
  createdAt: Date;
}

export interface VelocityMetrics {
  salesPerDay: number;
  salesPerWeek: number;
  totalSales: number;
  daysActive: number;
  projectionToEventDate?: number;
}

export interface BenchmarkData {
  averageSalesPerDay: number;
  averageSalesPerWeek: number;
  averageDailyRevenue: number;
  typicalSelloutDays: number;
}

export interface EventMetadata {
  eventId: string;
  eventDate: Date;
  daysUntilEvent: number;
  totalCapacity: number;
  soldCount: number;
  percentSold: number;
}
