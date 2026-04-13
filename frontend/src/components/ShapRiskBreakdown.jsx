import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const RISK_COLOR = '#ef4444';
const SAFE_COLOR = '#22c55e';

const formatFeatureList = (items) => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

export const generateExplanation = (shapData = []) => {
  const normalized = Array.isArray(shapData)
    ? shapData.filter((item) => item && typeof item.feature === 'string' && Number.isFinite(item.value))
    : [];

  const riskSorted = normalized
    .filter((item) => item.value > 0)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const safeSorted = normalized
    .filter((item) => item.value < 0)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const topRisk = riskSorted.slice(0, 2).map((item) => item.feature);
  const topSafe = safeSorted.slice(0, 2).map((item) => item.feature);

  let sentence = 'Risk impact is balanced with no dominant SHAP drivers.';
  if (topRisk.length && topSafe.length) {
    sentence = `Risk is high mainly due to ${formatFeatureList(topRisk)}. Risk is reduced due to ${formatFeatureList(topSafe)}.`;
  } else if (topRisk.length) {
    sentence = `Risk is high mainly due to ${formatFeatureList(topRisk)}.`;
  } else if (topSafe.length) {
    sentence = `Risk is reduced due to ${formatFeatureList(topSafe)}.`;
  }

  return {
    riskFactors: topRisk,
    safeFactors: topSafe,
    sentence,
  };
};

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid #374151',
  borderRadius: '8px',
};

const ShapRiskBreakdown = ({ shapData = [] }) => {
  const normalizedData = useMemo(() => {
    if (!Array.isArray(shapData)) return [];

    return shapData
      .filter((item) => item && typeof item.feature === 'string' && Number.isFinite(item.value))
      .map((item) => ({
        feature: item.feature,
        value: Number(item.value),
      }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [shapData]);

  const explanation = useMemo(() => generateExplanation(normalizedData), [normalizedData]);

  return (
    <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-2">SHAP Risk Score Breakdown</h3>
      <p className="text-gray-400 mb-6">
        Positive bars increase risk and negative bars reduce risk.
      </p>

      <div className="bg-dark-700 rounded-lg p-4">
        {normalizedData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={normalizedData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis type="category" dataKey="feature" width={140} stroke="#d1d5db" />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  contentStyle={tooltipStyle}
                  formatter={(value) => [Number(value).toFixed(2), 'SHAP Value']}
                />
                <ReferenceLine x={0} stroke="#9ca3af" strokeDasharray="4 4" />
                <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                  {normalizedData.map((entry) => (
                    <Cell key={entry.feature} fill={entry.value >= 0 ? RISK_COLOR : SAFE_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-400">No SHAP contribution data available for this user.</p>
        )}
      </div>

      <div className="mt-6 bg-gray-900/70 border border-gray-700 rounded-xl p-5">
        <h4 className="text-white font-semibold mb-3">🔍 Risk Explanation</h4>

        <p className="text-gray-200 leading-relaxed mb-4">{explanation.sentence}</p>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-red-800/40 bg-red-950/20 p-3">
            <p className="text-red-300 font-medium mb-2">🔴 Risk Drivers</p>
            {explanation.riskFactors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {explanation.riskFactors.map((factor) => (
                  <span key={factor} className="px-2 py-1 rounded-md bg-red-900/30 text-red-300 text-sm">
                    {factor}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-200/80">No major risk-increasing factors.</p>
            )}
          </div>

          <div className="rounded-lg border border-green-800/40 bg-green-950/20 p-3">
            <p className="text-green-300 font-medium mb-2">🟢 Risk Reducers</p>
            {explanation.safeFactors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {explanation.safeFactors.map((factor) => (
                  <span key={factor} className="px-2 py-1 rounded-md bg-green-900/30 text-green-300 text-sm">
                    {factor}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-green-200/80">No major risk-reducing factors.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapRiskBreakdown;
