const GeologicalMap = ({ geoType }) => {
  if (!geoType) return null;
  const configs = {
    proven_basin: {
      label: 'Proven Basin — Cross Section',
      bgGradient: ['#1a2332', '#1e3a2f'],
      layers: [
        { y: 20, h: 25, color: '#4a6741', label: 'Sedimentary Cover', opacity: 0.7 },
        { y: 45, h: 20, color: '#8B7355', label: 'Reservoir Rock (Sandstone)', opacity: 0.8 },
        { y: 65, h: 15, color: '#6B5B4F', label: 'Source Rock (Shale)', opacity: 0.7 },
        { y: 80, h: 20, color: '#555555', label: 'Basement Rock', opacity: 0.6 },
      ],
      trap: { type: 'anticline', x: 50, y: 42, rx: 28, ry: 12 },
      oilPocket: { x: 50, y: 46, rx: 18, ry: 6, color: '#2d5a1e' },
      faults: [],
      wells: [{ x: 50, depth: 52, label: 'Target', status: 'proposed' }],
      notes: ['Anticline trap clearly visible', 'Mature source rock confirmed', 'Existing wells nearby — low risk'],
    },
    frontier_basin: {
      label: 'Frontier Basin — Cross Section',
      bgGradient: ['#1a2332', '#2a1a1a'],
      layers: [
        { y: 15, h: 30, color: '#5a6b55', label: 'Thick Sedimentary Sequence', opacity: 0.6 },
        { y: 45, h: 18, color: '#7a6b50', label: 'Potential Reservoir', opacity: 0.5 },
        { y: 63, h: 17, color: '#5a4a3a', label: 'Possible Source Rock', opacity: 0.4 },
        { y: 80, h: 20, color: '#444444', label: 'Crystalline Basement', opacity: 0.6 },
      ],
      trap: { type: 'fault', x: 55, y: 44, rx: 20, ry: 10 },
      oilPocket: null,
      faults: [
        { x1: 38, y1: 20, x2: 45, y2: 85 },
        { x1: 68, y1: 25, x2: 72, y2: 80 },
      ],
      wells: [{ x: 55, depth: 55, label: 'Target', status: 'proposed' }],
      notes: ['Fault trap — seal uncertain', 'No nearby wells — unproven area', 'High reward if successful'],
    },
    deepwater: {
      label: 'Deepwater — Cross Section',
      bgGradient: ['#0a1628', '#0a2035'],
      layers: [
        { y: 5, h: 20, color: '#1a3a5a', label: 'Ocean Water (>500m)', opacity: 0.8 },
        { y: 25, h: 15, color: '#3a5a4a', label: 'Seabed Sediment', opacity: 0.6 },
        { y: 40, h: 22, color: '#6a5a3a', label: 'Turbidite Reservoir', opacity: 0.7 },
        { y: 62, h: 15, color: '#5a4a3a', label: 'Pre-Salt Source Rock', opacity: 0.6 },
        { y: 77, h: 23, color: '#888888', label: 'Salt Layer', opacity: 0.5 },
      ],
      trap: { type: 'stratigraphic', x: 50, y: 40, rx: 25, ry: 14 },
      oilPocket: { x: 50, y: 48, rx: 15, ry: 5, color: '#1a4a2a' },
      faults: [{ x1: 30, y1: 25, x2: 35, y2: 90 }],
      wells: [{ x: 50, depth: 58, label: 'Subsea Target', status: 'proposed' }],
      notes: ['Sub-salt reservoir — complex imaging', 'High pressure, high productivity', 'Requires FPSO or platform'],
    },
    unconventional: {
      label: 'Unconventional — Cross Section',
      bgGradient: ['#1a2332', '#2a2020'],
      layers: [
        { y: 20, h: 20, color: '#5a6050', label: 'Overburden', opacity: 0.6 },
        { y: 40, h: 12, color: '#8a7a5a', label: 'Tight Sandstone', opacity: 0.7 },
        { y: 52, h: 18, color: '#6a5540', label: 'Shale (Source + Reservoir)', opacity: 0.8 },
        { y: 70, h: 10, color: '#7a6a4a', label: 'Tight Limestone', opacity: 0.5 },
        { y: 80, h: 20, color: '#555555', label: 'Basement', opacity: 0.6 },
      ],
      trap: null,
      oilPocket: null,
      faults: [
        { x1: 25, y1: 35, x2: 28, y2: 75 },
        { x1: 50, y1: 30, x2: 53, y2: 70 },
        { x1: 75, y1: 35, x2: 78, y2: 75 },
      ],
      wells: [
        { x: 35, depth: 60, label: 'Horizontal', status: 'proposed', horizontal: true },
      ],
      notes: ['Oil trapped in shale pores — needs fracking', 'Many wells required for production', 'Fast decline rates'],
    },
  };

  const cfg = configs[geoType];
  if (!cfg) return null;

  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-bold text-sm mb-3 text-center text-blue-400">{cfg.label}</h4>
      <svg viewBox="0 0 100 100" className="w-full rounded-lg" style={{ maxHeight: '280px', background: 'linear-gradient(180deg, ' + cfg.bgGradient[0] + ', ' + cfg.bgGradient[1] + ')' }}>
        {/* Surface line */}
        <line x1="0" y1={cfg.layers[0].y} x2="100" y2={cfg.layers[0].y} stroke="#5a7a5a" strokeWidth="0.5" />
        {geoType === 'deepwater' && <text x="50" y={cfg.layers[0].y + 10} textAnchor="middle" fill="#4a8aaa" fontSize="3" opacity="0.6">~ ~ ~ ~ ~ ~</text>}

        {/* Geological layers */}
        {cfg.layers.map((layer, i) => (
          <g key={i}>
            <rect x="0" y={layer.y} width="100" height={layer.h} fill={layer.color} opacity={layer.opacity} />
            <text x="3" y={layer.y + layer.h / 2 + 1} fill="white" fontSize="2.5" opacity="0.8">{layer.label}</text>
            {i > 0 && <line x1="0" y1={layer.y} x2="100" y2={layer.y} stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" strokeDasharray="2,1" />}
          </g>
        ))}

        {/* Anticline trap */}
        {cfg.trap && cfg.trap.type === 'anticline' && (
          <ellipse cx={cfg.trap.x} cy={cfg.trap.y} rx={cfg.trap.rx} ry={cfg.trap.ry} fill="none" stroke="#fbbf24" strokeWidth="0.6" strokeDasharray="1.5,1" opacity="0.8" />
        )}

        {/* Oil pocket */}
        {cfg.oilPocket && (
          <ellipse cx={cfg.oilPocket.x} cy={cfg.oilPocket.y} rx={cfg.oilPocket.rx} ry={cfg.oilPocket.ry} fill={cfg.oilPocket.color} opacity="0.6" />
        )}

        {/* Faults */}
        {cfg.faults.map((f, i) => (
          <line key={i} x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} stroke="#ef4444" strokeWidth="0.6" strokeDasharray="1,0.5" opacity="0.7" />
        ))}

        {/* Wells */}
        {cfg.wells.map((w, i) => (
          <g key={i}>
            <line x1={w.x} y1={cfg.layers[0].y - 2} x2={w.x} y2={w.depth} stroke="#22d3ee" strokeWidth="0.5" />
            {w.horizontal && <line x1={w.x} y1={w.depth} x2={w.x + 20} y2={w.depth} stroke="#22d3ee" strokeWidth="0.5" />}
            <circle cx={w.x} cy={cfg.layers[0].y - 2} r="1.2" fill="#22d3ee" />
            <text x={w.x + 2} y={cfg.layers[0].y - 3} fill="#22d3ee" fontSize="2.5">{w.label}</text>
          </g>
        ))}

        {/* Legend markers */}
        {cfg.trap && (
          <text x={cfg.trap.x} y={cfg.trap.y - cfg.trap.ry - 2} textAnchor="middle" fill="#fbbf24" fontSize="2.5" fontWeight="bold">Trap Structure</text>
        )}
      </svg>

      {/* Notes */}
      <div className="mt-3 space-y-1">
        {cfg.notes.map((note, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
            <span className={i === 0 ? 'text-emerald-400' : i === cfg.notes.length - 1 ? 'text-orange-400' : 'text-blue-400'}>&#x2022;</span>
            <span>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeologicalMap;
