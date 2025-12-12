'use client';

import { useState } from 'react';
import type { Recommendation } from '@/lib/csvTypes';
import { formatCurrency, formatPercentage, formatVelocity } from '@/lib/recommendationHelpers';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  onDismiss: (id: string) => void;
}

export default function RecommendationsPanel({
  recommendations,
  onDismiss,
}: RecommendationsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeRecommendations = recommendations.filter((r) => !r.dismissed);

  if (activeRecommendations.length === 0) {
    return null;
  }

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          gradient: 'from-red-500 to-rose-600',
          icon: '🔴',
          label: 'HIGH PRIORITY',
          labelColor: 'text-red-100',
        };
      case 'medium':
        return {
          gradient: 'from-orange-500 to-amber-600',
          icon: '🟡',
          label: 'MEDIUM PRIORITY',
          labelColor: 'text-orange-100',
        };
      case 'low':
        return {
          gradient: 'from-blue-500 to-cyan-600',
          icon: '🔵',
          label: 'LOW PRIORITY',
          labelColor: 'text-blue-100',
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          icon: '⚪',
          label: 'PRIORITY',
          labelColor: 'text-gray-100',
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price_increase':
        return '📈';
      case 'price_decrease':
        return '📉';
      case 'urgency':
        return '⚠️';
      case 'opportunity':
        return '💡';
      case 'marketing':
        return '📢';
      default:
        return '💭';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          🎯 Recommendations ({activeRecommendations.length} Active)
        </h3>
      </div>

      <div className="space-y-4">
        {activeRecommendations.map((rec) => {
          const styles = getPriorityStyles(rec.priority);
          const isExpanded = expandedId === rec.id;

          return (
            <div
              key={rec.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <div
                className={`bg-gradient-to-br ${styles.gradient} p-4 text-white cursor-pointer`}
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold ${styles.labelColor}">
                        {styles.label}
                      </span>
                      {rec.targetSection && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                          {rec.targetSection}
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span>{getTypeIcon(rec.type)}</span>
                      <span>{rec.title}</span>
                    </h4>

                    <p className="text-sm opacity-90 mb-3">{rec.description}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-white/20 px-3 py-1 rounded-full">
                        Confidence: {rec.confidence.toFixed(0)}%
                      </span>
                      {rec.estimatedImpact !== 0 && (
                        <span
                          className={`px-3 py-1 rounded-full ${
                            rec.estimatedImpact > 0
                              ? 'bg-green-500/30'
                              : 'bg-red-500/30'
                          }`}
                        >
                          Impact: {rec.estimatedImpact > 0 ? '+' : ''}
                          {formatCurrency(rec.estimatedImpact)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(rec.id);
                    }}
                    className="ml-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                    aria-label="Dismiss recommendation"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="space-y-4">
                    {Object.keys(rec.metrics).length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                          📊 Metrics
                        </h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {rec.metrics.currentVelocity !== undefined && (
                            <div className="bg-white dark:bg-gray-600 p-2 rounded">
                              <span className="text-gray-600 dark:text-gray-300">
                                Current Velocity:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {formatVelocity(rec.metrics.currentVelocity)}
                              </span>
                            </div>
                          )}

                          {rec.metrics.benchmarkVelocity !== undefined && (
                            <div className="bg-white dark:bg-gray-600 p-2 rounded">
                              <span className="text-gray-600 dark:text-gray-300">
                                Expected:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {formatVelocity(rec.metrics.benchmarkVelocity)}
                              </span>
                            </div>
                          )}

                          {rec.metrics.velocityDiff !== undefined && (
                            <div className="bg-white dark:bg-gray-600 p-2 rounded">
                              <span className="text-gray-600 dark:text-gray-300">
                                Velocity Difference:
                              </span>
                              <span
                                className={`ml-2 font-medium ${
                                  rec.metrics.velocityDiff > 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                {rec.metrics.velocityDiff > 0 ? '+' : ''}
                                {formatPercentage(rec.metrics.velocityDiff, 1)}
                              </span>
                            </div>
                          )}

                          {rec.metrics.daysUntilEvent !== undefined && (
                            <div className="bg-white dark:bg-gray-600 p-2 rounded">
                              <span className="text-gray-600 dark:text-gray-300">
                                Days Until Event:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {rec.metrics.daysUntilEvent}
                              </span>
                            </div>
                          )}

                          {rec.metrics.percentSold !== undefined && (
                            <div className="bg-white dark:bg-gray-600 p-2 rounded">
                              <span className="text-gray-600 dark:text-gray-300">
                                Percent Sold:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {formatPercentage(rec.metrics.percentSold, 0)}
                              </span>
                            </div>
                          )}

                          {rec.metrics.percentUnsold !== undefined && (
                            <div className="bg-white dark:bg-gray-600 p-2 rounded">
                              <span className="text-gray-600 dark:text-gray-300">
                                Percent Unsold:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {formatPercentage(rec.metrics.percentUnsold, 0)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                        💭 Reasoning
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 p-3 rounded">
                        {rec.reasoning}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                        ✅ Recommended Action
                      </h5>
                      <p className="text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-600 p-3 rounded border-l-4 border-blue-500">
                        {rec.action}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> Click on any recommendation to view detailed metrics and reasoning. Dismiss recommendations you&apos;ve acted on using the × button.
        </p>
      </div>
    </div>
  );
}
