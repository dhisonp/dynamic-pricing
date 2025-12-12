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
          border: 'border-red-600',
          bg: 'bg-red-50 dark:bg-red-950',
          text: 'text-red-600',
          label: 'PRIORITY_HIGH',
        };
      case 'medium':
        return {
          border: 'border-goldenrod-500',
          bg: 'bg-yellow-50 dark:bg-yellow-950',
          text: 'text-goldenrod-500',
          label: 'PRIORITY_MED',
        };
      case 'low':
        return {
          border: 'border-ocean-500',
          bg: 'bg-blue-50 dark:bg-blue-950',
          text: 'text-ocean-500',
          label: 'PRIORITY_LOW',
        };
      default:
        return {
          border: 'border-gray-400',
          bg: 'bg-gray-50 dark:bg-gray-900',
          text: 'text-gray-500',
          label: 'PRIORITY_STD',
        };
    }
  };

  return (
    <div className="mb-12">
      <h3 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-6 border-b border-default pb-2">
        System_Advisories // {activeRecommendations.length} ACTIVE
      </h3>

      <div className="space-y-0 border-t border-default">
        {activeRecommendations.map((rec) => {
          const styles = getPriorityStyles(rec.priority);
          const isExpanded = expandedId === rec.id;

          return (
            <div
              key={rec.id}
              className="group border-b border-default bg-white dark:bg-black transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <div
                className="flex items-stretch cursor-pointer min-h-[4rem]"
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
              >
                {/* Status Strip */}
                <div className={`w-1 ${styles.bg.replace('bg-', 'bg-').replace('dark:bg-', 'dark:bg-').split(' ')[0] === 'bg-white' ? 'bg-gray-200' : styles.bg.replace('bg-', 'bg-').split(' ')[0].replace('50', '600')} shrink-0`}></div>
                 {/* Actually let's use the border color for the strip */}
                 <div className={`w-1 ${styles.text.replace('text-', 'bg-')} shrink-0`}></div>

                <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`font-mono text-xs ${styles.text}`}>
                        {styles.label}
                      </span>
                      {rec.targetSection && (
                        <span className="font-mono text-xs text-gray-400 border border-gray-200 px-1">
                          SEC:{rec.targetSection}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-lg leading-tight">
                      {rec.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs text-gray-500">
                    <span className="hidden sm:inline">
                      CONF:{rec.confidence.toFixed(0)}%
                    </span>
                    {rec.estimatedImpact !== 0 && (
                      <span className={rec.estimatedImpact > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        IMP:{rec.estimatedImpact > 0 ? '+' : ''}{formatCurrency(rec.estimatedImpact)}
                      </span>
                    )}
                    <span className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {isExpanded ? '[-]' : '[+]'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(rec.id);
                  }}
                  className="px-4 border-l border-transparent group-hover:border-gray-100 dark:group-hover:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-300 hover:text-black dark:hover:text-white transition-all flex items-center justify-center"
                  aria-label="Dismiss recommendation"
                >
                  ×
                </button>
              </div>

              {isExpanded && (
                <div className="pl-5 pr-4 pb-6 pt-2 bg-gray-50 dark:bg-gray-900 border-t border-dashed border-gray-200 dark:border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="font-mono text-xs text-gray-500 mb-3 uppercase">Analysis</h5>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed max-w-prose">
                        {rec.reasoning}
                      </p>
                      
                      <div className="mt-6">
                        <h5 className="font-mono text-xs text-gray-500 mb-3 uppercase">Recommended Action</h5>
                        <div className="p-3 border-l-2 border-ocean-500 bg-white dark:bg-black">
                          <p className="text-sm font-medium">{rec.action}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-mono text-xs text-gray-500 mb-3 uppercase">Metrics</h5>
                      <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
                        {Object.entries(rec.metrics).map(([key, value]) => (
                          <div key={key} className="bg-white dark:bg-gray-900 p-3">
                            <span className="block font-mono text-[10px] text-gray-500 uppercase mb-1">
                              {key.replace(/([A-Z])/g, '_$1')}
                            </span>
                            <span className="block font-mono text-sm">
                              {typeof value === 'number' 
                                ? key.includes('percent') 
                                  ? formatPercentage(value, 1) 
                                  : key.includes('Velocity') 
                                    ? formatVelocity(value) 
                                    : value 
                                : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}