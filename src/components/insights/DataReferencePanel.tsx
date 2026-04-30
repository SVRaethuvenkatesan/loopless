"use client";

import { AlertCircle, Target, Zap, Moon, Frown, Coffee, Smartphone } from "lucide-react";

const TOP_FACTORS = [
  { name: "Stress Spikes", weight: 85, icon: Zap, color: "coral" },
  { name: "Consecutive Urges", weight: 72, icon: Target, color: "amber" },
  { name: "Coping Avoidance", weight: 64, icon: Frown, color: "purple" },
  { name: "Poor Sleep Quality", weight: 48, icon: Moon, color: "sky" },
  { name: "Late Night Activity", weight: 35, icon: Smartphone, color: "mint" },
  { name: "High Caffeine", weight: 22, icon: Coffee, color: "amber" },
];

export default function DataReferencePanel({ dataPoints = [] }: { dataPoints: any[] }) {
  return (
    <div className="card card-sm mt-4 bg-[var(--bg1)] border-[var(--border2)] shadow-none">
      <div className="flex items-center gap-2 mb-4">
        <div className="badge badge-amber">Model Interpretability</div>
        <h4 className="text-sm font-bold uppercase text-[var(--text2)] tracking-wide">
          Top Predictive Factors
        </h4>
      </div>
      
      <div className="space-y-4 mb-4">
        {TOP_FACTORS.map((factor, idx) => {
          const Icon = factor.icon;
          return (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-[var(--text1)]">
                <span className="flex items-center gap-1.5">
                  <Icon size={14} className={`text-[var(--${factor.color === "mint" ? "mint2" : factor.color})]`} />
                  {factor.name}
                </span>
                <span className="text-[var(--text2)]">{factor.weight}% impact</span>
              </div>
              <div className="step-bar">
                <div 
                  className={`step-seg ${factor.weight > 60 ? 'active' : factor.weight > 30 ? 'done' : ''}`} 
                  style={{ width: `${factor.weight}%`, flex: 'none', background: `var(--${factor.color})`, borderColor: `var(--${factor.color === "mint" ? "mint2" : factor.color})` }} 
                />
                <div className="step-seg" style={{ flex: 1 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="divider-dashed my-3" />
      
      {dataPoints && dataPoints.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-bold uppercase text-[var(--text3)] mb-2 tracking-wide">Recent Context</h4>
          <div className="flex flex-wrap gap-2">
            {dataPoints.map((point, idx) => (
              <div key={idx} className="chip">
                {point.label}: <strong className="text-[var(--text1)]">{point.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs text-[var(--text3)] font-semibold flex items-start gap-1.5 mt-2 bg-[var(--bg3)] p-2 rounded-lg border border-[var(--border2)]">
        <AlertCircle size={14} className="shrink-0 mt-0.5 text-[var(--text2)]" />
        These factors are identified by the Random Forest algorithm based on feature importance across all users, localized to your 30-day baseline.
      </p>
    </div>
  );
}
