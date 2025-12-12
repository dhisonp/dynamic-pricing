import type {
  TicketSale,
  Recommendation,
  VelocityMetrics,
  BenchmarkData,
  EventMetadata,
} from './csvTypes';
import {
  daysBetween,
  daysUntil,
  variance,
  formatPercentage,
  formatVelocity,
  generateRecommendationId,
} from './recommendationHelpers';

export function calculateVelocity(
  sales: TicketSale[],
  now: Date = new Date()
): VelocityMetrics {
  const historicalSales = sales.filter((s) => new Date(s.timestamp) <= now);

  if (historicalSales.length === 0) {
    return {
      salesPerDay: 0,
      salesPerWeek: 0,
      totalSales: 0,
      daysActive: 0,
      projectionToEventDate: 0,
    };
  }

  const timestamps = historicalSales.map((s) => new Date(s.timestamp).getTime());
  const firstSaleDate = new Date(Math.min(...timestamps));
  const daysActive = Math.max(1, daysBetween(firstSaleDate, now));

  const salesPerDay = historicalSales.length / daysActive;
  const salesPerWeek = salesPerDay * 7;

  return {
    salesPerDay,
    salesPerWeek,
    totalSales: historicalSales.length,
    daysActive,
  };
}

export function calculateSectionVelocity(
  sales: TicketSale[],
  section: string,
  now: Date = new Date()
): VelocityMetrics {
  const sectionSales = sales.filter((s) => s.section === section);
  return calculateVelocity(sectionSales, now);
}

export function calculateBenchmark(
  sales: TicketSale[],
  metadata: EventMetadata
): BenchmarkData {
  const now = new Date();
  const historical = sales.filter((s) => new Date(s.timestamp) <= now);

  if (historical.length === 0) {
    return {
      averageSalesPerDay: 1.5,
      averageSalesPerWeek: 10.5,
      averageDailyRevenue: 150,
      typicalSelloutDays: 14,
    };
  }

  const velocity = calculateVelocity(sales, now);
  const avgPrice = historical.reduce((sum, s) => sum + s.price, 0) / historical.length;

  const daysUntilEvent = metadata.daysUntilEvent;
  let benchmarkMultiplier = 1.0;

  if (daysUntilEvent > 180) {
    benchmarkMultiplier = 0.6;
  } else if (daysUntilEvent > 60) {
    benchmarkMultiplier = 1.0;
  } else if (daysUntilEvent > 14) {
    benchmarkMultiplier = 1.5;
  } else {
    benchmarkMultiplier = 2.5;
  }

  const benchmarkSalesPerDay = velocity.salesPerDay * benchmarkMultiplier;

  return {
    averageSalesPerDay: benchmarkSalesPerDay,
    averageSalesPerWeek: benchmarkSalesPerDay * 7,
    averageDailyRevenue: benchmarkSalesPerDay * avgPrice,
    typicalSelloutDays: Math.floor(
      (metadata.totalCapacity - metadata.soldCount) / Math.max(benchmarkSalesPerDay, 1)
    ),
  };
}

export function detectVelocityPattern(
  current: VelocityMetrics,
  benchmark: BenchmarkData
): 'significantly_slow' | 'moderately_slow' | 'on_track' | 'moderately_fast' | 'significantly_fast' {
  if (benchmark.averageSalesPerDay === 0) return 'on_track';

  const velocityDiff =
    (current.salesPerDay - benchmark.averageSalesPerDay) / benchmark.averageSalesPerDay;

  if (velocityDiff < -0.3) return 'significantly_slow';
  if (velocityDiff < -0.15) return 'moderately_slow';
  if (velocityDiff > 0.3) return 'significantly_fast';
  if (velocityDiff > 0.15) return 'moderately_fast';
  return 'on_track';
}

export function detectUrgency(
  metadata: EventMetadata
): 'critical' | 'high' | 'moderate' | 'none' {
  const { daysUntilEvent, percentSold } = metadata;

  if (daysUntilEvent < 7 && percentSold < 70) return 'critical';
  if (daysUntilEvent < 14 && percentSold < 50) return 'high';
  if (daysUntilEvent < 30 && percentSold < 30) return 'moderate';
  return 'none';
}

export function detectSelloutRisk(
  velocity: VelocityMetrics,
  metadata: EventMetadata
): 'high' | 'moderate' | 'low' {
  if (metadata.daysUntilEvent === 0 || velocity.salesPerDay === 0) return 'low';

  const projectedSold =
    metadata.soldCount + velocity.salesPerDay * metadata.daysUntilEvent;
  const projectedPercent = (projectedSold / metadata.totalCapacity) * 100;

  if (projectedPercent > 95) return 'high';
  if (projectedPercent > 85) return 'moderate';
  return 'low';
}

export function calculateConfidence(
  dataPoints: number,
  timeSpan: number,
  varianceValue: number = 0
): number {
  const dataQualityScore = Math.min(1, dataPoints / 50);
  const timeSpanScore = Math.min(1, timeSpan / 30);
  const consistencyScore = varianceValue > 0 ? 1 - Math.min(1, varianceValue / 100) : 0.8;

  const confidence =
    (dataQualityScore * 0.4 + timeSpanScore * 0.3 + consistencyScore * 0.3) * 100;

  return Math.max(20, Math.min(95, confidence));
}

export function estimateRevenueImpact(
  type: string,
  metadata: EventMetadata,
  avgPrice: number
): number {
  const remaining = metadata.totalCapacity - metadata.soldCount;

  switch (type) {
    case 'price_increase':
      const priceMultiplier = 1.1;
      const demandMultiplier = 0.95;
      const increaseImpact =
        remaining * avgPrice * priceMultiplier * demandMultiplier - remaining * avgPrice;
      return Math.round(increaseImpact);

    case 'price_decrease':
      const decreaseMultiplier = 0.8;
      const demandBoost = 1.3;
      const decreaseImpact =
        remaining * avgPrice * decreaseMultiplier * demandBoost - remaining * avgPrice;
      return Math.round(decreaseImpact);

    case 'urgency':
      const flashSaleRevenue = remaining * avgPrice * 0.6;
      const lossIfUnsold = 0;
      return Math.round(flashSaleRevenue - lossIfUnsold);

    default:
      return 0;
  }
}

export function generateEventRecommendations(
  sales: TicketSale[],
  metadata: EventMetadata
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const now = new Date();

  if (metadata.daysUntilEvent < 0) return [];

  const velocity = calculateVelocity(sales, now);
  const benchmark = calculateBenchmark(sales, metadata);
  const velocityPattern = detectVelocityPattern(velocity, benchmark);
  const urgency = detectUrgency(metadata);
  const selloutRisk = detectSelloutRisk(velocity, metadata);

  const velocityDiff =
    benchmark.averageSalesPerDay > 0
      ? ((velocity.salesPerDay - benchmark.averageSalesPerDay) /
          benchmark.averageSalesPerDay) *
        100
      : 0;

  const historical = sales.filter((s) => new Date(s.timestamp) <= now);
  const avgPrice =
    historical.length > 0
      ? historical.reduce((sum, s) => sum + s.price, 0) / historical.length
      : 100;

  const confidence = calculateConfidence(
    historical.length,
    velocity.daysActive,
    variance(historical.map((s) => s.price))
  );

  if (
    (velocityPattern === 'significantly_slow' || velocityPattern === 'moderately_slow') &&
    (urgency === 'high' || urgency === 'critical')
  ) {
    const impact = estimateRevenueImpact('price_decrease', metadata, avgPrice);

    recommendations.push({
      id: generateRecommendationId(),
      type: 'price_decrease',
      scope: 'event',
      priority: urgency === 'critical' ? 'high' : 'medium',
      confidence,
      estimatedImpact: impact,
      title:
        urgency === 'critical'
          ? 'URGENT: Boost sales with immediate price reduction'
          : 'Increase sales velocity with price adjustment',
      description: `Sales are ${Math.abs(velocityDiff).toFixed(0)}% below expected pace with ${metadata.daysUntilEvent} days remaining`,
      reasoning: `Current velocity: ${formatVelocity(velocity.salesPerDay)}. Expected: ${formatVelocity(benchmark.averageSalesPerDay)}. ${formatPercentage(metadata.percentSold * 100 - 100)} of inventory (${metadata.totalCapacity - metadata.soldCount} seats) remains unsold. At current pace, event will be only ${Math.min(100, ((metadata.soldCount + velocity.salesPerDay * metadata.daysUntilEvent) / metadata.totalCapacity) * 100).toFixed(0)}% sold.`,
      action:
        urgency === 'critical'
          ? 'Reduce ticket prices by 25-30% immediately'
          : 'Reduce ticket prices by 15-20% for next 3-5 days',
      metrics: {
        currentVelocity: velocity.salesPerDay,
        benchmarkVelocity: benchmark.averageSalesPerDay,
        velocityDiff,
        daysUntilEvent: metadata.daysUntilEvent,
        percentSold: metadata.percentSold,
        percentUnsold: (1 - metadata.percentSold) * 100,
      },
      dismissed: false,
      createdAt: new Date(),
    });
  }

  if (
    (velocityPattern === 'significantly_fast' || velocityPattern === 'moderately_fast') &&
    selloutRisk === 'high' &&
    metadata.daysUntilEvent > 14
  ) {
    const impact = estimateRevenueImpact('price_increase', metadata, avgPrice);

    recommendations.push({
      id: generateRecommendationId(),
      type: 'price_increase',
      scope: 'event',
      priority: 'medium',
      confidence,
      estimatedImpact: impact,
      title: 'Opportunity: Increase prices on high-demand event',
      description: 'Strong sales velocity indicates high demand',
      reasoning: `Current velocity: ${formatVelocity(velocity.salesPerDay)}. Expected: ${formatVelocity(benchmark.averageSalesPerDay)}. Projected to sell out early with ${metadata.daysUntilEvent} days remaining. ${formatPercentage((1 - metadata.percentSold) * 100)} remaining inventory (${metadata.totalCapacity - metadata.soldCount} seats).`,
      action: 'Increase prices by 10-15% for remaining premium seats',
      metrics: {
        currentVelocity: velocity.salesPerDay,
        benchmarkVelocity: benchmark.averageSalesPerDay,
        velocityDiff,
        daysUntilEvent: metadata.daysUntilEvent,
        percentSold: metadata.percentSold,
        percentUnsold: (1 - metadata.percentSold) * 100,
      },
      dismissed: false,
      createdAt: new Date(),
    });
  }

  if (metadata.daysUntilEvent <= 3 && metadata.percentSold < 0.8) {
    const impact = estimateRevenueImpact('urgency', metadata, avgPrice);

    recommendations.push({
      id: generateRecommendationId(),
      type: 'urgency',
      scope: 'event',
      priority: 'high',
      confidence,
      estimatedImpact: impact,
      title: 'CRITICAL: Last-minute inventory clearance needed',
      description: `Only ${metadata.daysUntilEvent} days until event with significant unsold inventory`,
      reasoning: `${metadata.totalCapacity - metadata.soldCount} unsold seats with ${metadata.daysUntilEvent} day(s) remaining. Risk of empty seats and lost revenue.`,
      action: 'Flash sale: 30-40% discount for next 48-72 hours',
      metrics: {
        currentVelocity: velocity.salesPerDay,
        daysUntilEvent: metadata.daysUntilEvent,
        percentSold: metadata.percentSold,
        percentUnsold: (1 - metadata.percentSold) * 100,
      },
      dismissed: false,
      createdAt: new Date(),
    });
  }

  if (metadata.percentSold >= 1.0) {
    recommendations.push({
      id: generateRecommendationId(),
      type: 'opportunity',
      scope: 'event',
      priority: 'low',
      confidence: 100,
      estimatedImpact: 0,
      title: 'Event sold out - Congratulations!',
      description: 'All tickets have been sold',
      reasoning: 'Event has reached 100% capacity. Consider this pricing strategy for similar future events.',
      action: 'Analyze pricing performance for insights on future events',
      metrics: {
        percentSold: metadata.percentSold,
      },
      dismissed: false,
      createdAt: new Date(),
    });
  }

  return recommendations;
}

export function generateSectionRecommendations(
  sales: TicketSale[],
  metadata: EventMetadata
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const now = new Date();

  const sections = Array.from(new Set(sales.map((s) => s.section)));
  if (sections.length < 2) return [];

  const sectionMetrics = sections.map((section) => {
    const sectionSales = sales.filter((s) => s.section === section);
    const velocity = calculateSectionVelocity(sales, section, now);
    const historical = sectionSales.filter((s) => new Date(s.timestamp) <= now);
    const avgPrice =
      historical.length > 0
        ? historical.reduce((sum, s) => sum + s.price, 0) / historical.length
        : 100;

    return {
      section,
      velocity,
      avgPrice,
      sold: historical.length,
      total: sectionSales.length,
      percentSold: sectionSales.length > 0 ? historical.length / sectionSales.length : 0,
    };
  });

  const avgVelocity =
    sectionMetrics.reduce((sum, m) => sum + m.velocity.salesPerDay, 0) / sectionMetrics.length;

  sectionMetrics.forEach((metric) => {
    const velocityDiff = avgVelocity > 0 ? ((metric.velocity.salesPerDay - avgVelocity) / avgVelocity) * 100 : 0;

    if (metric.velocity.salesPerDay < avgVelocity * 0.7 && metric.percentSold < 0.6) {
      const otherSectionsAvg =
        sectionMetrics
          .filter((m) => m.section !== metric.section)
          .reduce((sum, m) => sum + m.percentSold, 0) /
        (sectionMetrics.length - 1);

      const confidence = calculateConfidence(metric.sold, metadata.daysUntilEvent);

      recommendations.push({
        id: generateRecommendationId(),
        type: 'marketing',
        scope: 'section',
        priority: 'medium',
        confidence,
        estimatedImpact: (metric.total - metric.sold) * metric.avgPrice * 0.2,
        title: `${metric.section} section selling below expectations`,
        description: `${metric.section} has sold ${formatPercentage(metric.percentSold * 100, 0)} vs ${formatPercentage(otherSectionsAvg * 100, 0)} average for other sections`,
        reasoning: `${metric.section} velocity: ${formatVelocity(metric.velocity.salesPerDay)}. Other sections average: ${formatVelocity(avgVelocity)}. Significant performance gap suggests pricing or marketing issue.`,
        action: `Consider 10-15% price reduction for ${metric.section} or targeted marketing campaign`,
        targetSection: metric.section,
        metrics: {
          currentVelocity: metric.velocity.salesPerDay,
          benchmarkVelocity: avgVelocity,
          velocityDiff,
          percentSold: metric.percentSold * 100,
        },
        dismissed: false,
        createdAt: new Date(),
      });
    }
  });

  return recommendations;
}

export function generateRecommendations(sales: TicketSale[]): Recommendation[] {
  if (sales.length < 5) {
    return [
      {
        id: generateRecommendationId(),
        type: 'opportunity',
        scope: 'event',
        priority: 'low',
        confidence: 0,
        estimatedImpact: 0,
        title: 'Insufficient data for recommendations',
        description: 'Need at least 5 sales records to generate insights',
        reasoning: `Currently have ${sales.length} sales record(s). Continue monitoring as more sales come in.`,
        action: 'Upload more sales data or wait for additional transactions',
        metrics: {},
        dismissed: false,
        createdAt: new Date(),
      },
    ];
  }

  const allDates = sales.map((s) => new Date(s.timestamp).getTime());
  const eventDate = new Date(Math.max(...allDates));
  const now = new Date();
  const daysUntilEvent = daysUntil(eventDate, now);

  const historical = sales.filter((s) => new Date(s.timestamp) <= now);
  const totalCapacity = sales.length;
  const soldCount = historical.length;
  const percentSold = soldCount / totalCapacity;

  const uniqueEventIds = Array.from(new Set(sales.map((s) => s.event_id)));
  const eventId = uniqueEventIds[0] || 'UNKNOWN';

  const metadata: EventMetadata = {
    eventId,
    eventDate,
    daysUntilEvent,
    totalCapacity,
    soldCount,
    percentSold,
  };

  const eventRecommendations = generateEventRecommendations(sales, metadata);
  const sectionRecommendations = generateSectionRecommendations(sales, metadata);

  const allRecommendations = [...eventRecommendations, ...sectionRecommendations];

  allRecommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.confidence - a.confidence;
  });

  return allRecommendations;
}
