const RawSeismicSection = ({ data, processed }) => {
  if (!data) return null;

  const { traces, numTraces, numSamples, faultTrace, hasAmplitudeAnomaly } = data;
  const viewWidth = 400;
  const viewHeight = 300;
  const traceSpacing = viewWidth / (numTraces + 1);
  const sampleSpacing = (viewHeight - 20) / numSamples;

  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-bold text-sm mb-1 text-center text-blue-400">
        {processed ? 'Processed Seismic Section' : 'Raw Field Seismic Section (Unprocessed)'}
      </h4>
      <p className="text-xs text-slate-400 text-center mb-3">
        {processed
          ? 'Processed data with improved signal-to-noise and structural imaging'
          : 'Review the raw seismic traces below. Can you identify structural features, reflectors, and potential anomalies?'
        }
      </p>
      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full rounded-lg border border-slate-700"
           style={{ maxHeight: '350px', background: '#0a0a1a' }}>
        {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => (
          <text key={i} x="2" y={15 + frac * (viewHeight - 20)} fill="#4a5568" fontSize="7">
            {Math.floor(frac * 4000)}m
          </text>
        ))}

        {[0, 9, 19, 29].map((t, i) => (
          <text key={i} x={traceSpacing * (t + 1)} y="10" fill="#4a5568" fontSize="7" textAnchor="middle">
            {t + 1}
          </text>
        ))}

        {traces.map((trace, traceIdx) => {
          const centerX = traceSpacing * (traceIdx + 1);
          const scale = processed ? traceSpacing * 0.6 : traceSpacing * 0.4;

          let pathD = `M ${centerX} 15`;
          let fillD = '';
          let inPositive = false;

          for (let s = 0; s < trace.length; s++) {
            const y = 15 + s * sampleSpacing;
            const amp = processed ? trace[s] * 1.3 : trace[s];
            const x = centerX + amp * scale;
            pathD += ` L ${x} ${y}`;

            if (amp > 0 && !inPositive) {
              fillD += `M ${centerX} ${y} L ${x} ${y}`;
              inPositive = true;
            } else if (amp > 0 && inPositive) {
              fillD += ` L ${x} ${y}`;
            } else if (amp <= 0 && inPositive) {
              fillD += ` L ${centerX} ${y} Z `;
              inPositive = false;
            }
          }
          if (inPositive) {
            fillD += ` L ${centerX} ${15 + (trace.length - 1) * sampleSpacing} Z`;
          }

          return (
            <g key={traceIdx}>
              {fillD && <path d={fillD} fill={processed ? '#3b82f6' : '#1e40af'} opacity={processed ? 0.5 : 0.3} />}
              <path d={pathD} fill="none" stroke={processed ? '#60a5fa' : '#374151'} strokeWidth="0.8" />
            </g>
          );
        })}

        {faultTrace && (
          <line
            x1={traceSpacing * (faultTrace + 1)} y1="15"
            x2={traceSpacing * (faultTrace + 1) + 10} y2={viewHeight}
            stroke="#ef4444" strokeWidth="1" strokeDasharray="4,3" opacity={processed ? 0.6 : 0.2}
          />
        )}

        {processed && hasAmplitudeAnomaly && (
          <ellipse
            cx={traceSpacing * 16} cy={(viewHeight - 20) * 0.55 + 15} rx={traceSpacing * 5} ry="12"
            fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.7"
          />
        )}

        <text x={viewWidth / 2} y={viewHeight - 3} textAnchor="middle" fill="#4a5568" fontSize="7">
          Distance (traces)
        </text>
      </svg>

      {!processed && (
        <div className="mt-3 bg-slate-800/50 rounded p-3 border border-slate-600">
          <div className="text-xs font-bold text-blue-400 mb-1">Reading Guide:</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>• Strong reflections = lithology changes</div>
            <div>• Curved reflectors = structural folding</div>
            <div>• Bright amplitudes = possible fluids</div>
            <div>• Discontinuities = possible faults</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawSeismicSection;
