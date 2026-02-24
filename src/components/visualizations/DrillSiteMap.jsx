import { DRILL_SITES } from '../../constants/geology';

const DrillSiteMap = ({ geoType, selected, onSelect }) => {
  if (!geoType) return null;
  const contourColors = { proven_basin: '#4ade80', frontier_basin: '#facc15', deepwater: '#38bdf8', unconventional: '#fb923c' };
  const cc = contourColors[geoType] || '#4ade80';
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 mb-4">
      <h4 className="font-bold text-sm mb-1 text-center text-blue-400">Structure Map — Top View</h4>
      <p className="text-xs text-slate-400 text-center mb-3">Select a drilling location. Contour lines show depth to reservoir (closer spacing = steeper).</p>
      <div className="flex gap-4">
        <svg viewBox="0 0 100 100" className="flex-1 rounded-lg border border-slate-700" style={{ maxHeight: '300px', background: '#0f172a' }}>
          {[20,40,60,80].map(v => (<g key={v}><line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" /><line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" /></g>))}
          <ellipse cx="50" cy="45" rx="40" ry="35" fill="none" stroke={cc} strokeWidth="0.3" opacity="0.25" />
          <ellipse cx="50" cy="43" rx="33" ry="28" fill="none" stroke={cc} strokeWidth="0.4" opacity="0.35" />
          <ellipse cx="50" cy="41" rx="26" ry="22" fill="none" stroke={cc} strokeWidth="0.4" opacity="0.45" />
          <ellipse cx="50" cy="39" rx="19" ry="16" fill="none" stroke={cc} strokeWidth="0.5" opacity="0.55" />
          <ellipse cx="50" cy="37" rx="12" ry="10" fill="none" stroke={cc} strokeWidth="0.5" opacity="0.7" />
          <ellipse cx="50" cy="36" rx="6" ry="5" fill="none" stroke={cc} strokeWidth="0.6" opacity="0.85" />
          <ellipse cx="50" cy="38" rx="15" ry="12" fill={cc} opacity="0.08" />
          <text x="85" y="46" fill={cc} fontSize="2.5" opacity="0.5">-2000m</text>
          <text x="78" y="38" fill={cc} fontSize="2.5" opacity="0.5">-1800m</text>
          <text x="70" y="30" fill={cc} fontSize="2.5" opacity="0.5">-1600m</text>
          <text x="58" y="25" fill={cc} fontSize="2.5" opacity="0.5">-1400m</text>
          <line x1="25" y1="15" x2="30" y2="85" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1.5,1" opacity="0.6" />
          <text x="22" y="13" fill="#ef4444" fontSize="2" opacity="0.6">Fault</text>
          {geoType === 'frontier_basin' && <line x1="70" y1="20" x2="75" y2="90" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1.5,1" opacity="0.6" />}
          <polygon points="93,3 95,8 91,8" fill="white" opacity="0.6" />
          <text x="91" y="11" fill="white" fontSize="2.5" opacity="0.6">N</text>
          <line x1="5" y1="95" x2="25" y2="95" stroke="white" strokeWidth="0.4" opacity="0.5" />
          <text x="5" y="93" fill="white" fontSize="2" opacity="0.5">2 km</text>
          {Object.entries(DRILL_SITES).map(([key, site]) => {
            const isSel = selected === key;
            return (
              <g key={key} onClick={() => onSelect(key)} style={{ cursor: 'pointer' }}>
                <circle cx={site.x} cy={site.y} r={isSel ? 4 : 3} fill={isSel ? site.color : 'transparent'} stroke={site.color} strokeWidth={isSel ? 1 : 0.6} opacity={isSel ? 1 : 0.7} />
                <circle cx={site.x} cy={site.y} r="1" fill={site.color} />
                <text x={site.x + 4} y={site.y + 1} fill={site.color} fontSize="3" fontWeight={isSel ? 'bold' : 'normal'}>{key}</text>
                {isSel && <circle cx={site.x} cy={site.y} r="5.5" fill="none" stroke={site.color} strokeWidth="0.3" strokeDasharray="1,1" opacity="0.5" />}
              </g>
            );
          })}
        </svg>
        <div className="w-48 space-y-2">
          {Object.entries(DRILL_SITES).map(([key, site]) => (
            <div key={key} onClick={() => onSelect(key)} className={'p-2 rounded-lg border cursor-pointer transition-all text-xs ' + (selected === key ? 'border-blue-400 bg-blue-900/30' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500')}>
              <div className="font-bold" style={{ color: site.color }}>{key}: {site.label.split(' — ')[1]}</div>
              <div className="text-slate-400 mt-0.5">{site.desc}</div>
              <div className="flex justify-between mt-1"><span className="text-slate-500">Risk:</span><span style={{ color: site.color }}>{site.risk}</span></div>
            </div>
          ))}
        </div>
      </div>
      {selected && (
        <div className="mt-3 bg-blue-900/20 border border-blue-600/50 rounded-lg p-3 text-sm">
          <span className="font-bold text-blue-400">Selected: </span>
          <span className="text-slate-300">{DRILL_SITES[selected].label}</span>
          <span className="text-slate-400"> — {DRILL_SITES[selected].desc}</span>
        </div>
      )}
    </div>
  );
};

export default DrillSiteMap;
