import React from 'react';
import { CheckCircle, Factory, Zap, Shield, Droplets, Monitor, Truck } from 'lucide-react';

import { useGame } from '../../context/GameContext';
import { FACILITY_OPTIONS } from '../../constants/economics';
import { useGameActions } from '../../hooks/useGameActions';
import { useAuthority } from '../../hooks/useAuthority';

const FACILITY_ICONS = {
  processing_plant: Factory,
  storage_export: Truck,
  water_treatment: Droplets,
  power_generation: Zap,
  safety_systems: Shield,
  control_monitoring: Monitor,
};

const H2Y3Startup = () => {
  const {
    selectedFacilities,
    projectData,
  } = useGame();
  const { dispatchSetShowDecisionGate } = useGameActions();
  const { authProps } = useAuthority();

  // Build facility summary from selections
  const facilityEntries = Object.entries(selectedFacilities).filter(
    ([, tierId]) => tierId !== 'none'
  );

  const totalCapex = Object.entries(selectedFacilities).reduce((sum, [facId, tierId]) => {
    const tier = FACILITY_OPTIONS[facId]?.tiers?.[tierId];
    return sum + (tier?.cost || 0);
  }, 0);

  const totalOpexMod = projectData.facilityOpexModifier || 0;
  const totalProdMod = projectData.facilityProductionModifier || 0;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-4">H2 Year 3: Production Startup</h3>

      {/* Core checklist */}
      <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-4 mb-4">
        <h4 className="font-bold mb-2">Pre-Startup Checklist Complete</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>All wells drilled and completed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>Production facilities commissioned</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>Safety systems certified</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>Operating procedures approved</span>
          </div>
        </div>
      </div>

      {/* Facility summary */}
      {facilityEntries.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 mb-4">
          <h4 className="font-bold mb-3 text-sm text-slate-300">Installed Facilities</h4>
          <div className="space-y-2">
            {facilityEntries.map(([facId, tierId]) => {
              const facility = FACILITY_OPTIONS[facId];
              const tier = facility?.tiers?.[tierId];
              if (!facility || !tier) return null;
              const Icon = FACILITY_ICONS[facId] || Factory;
              return (
                <div key={facId} className="flex items-center justify-between text-sm bg-slate-800/50 rounded p-2">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-slate-400" />
                    <span className="text-slate-300">{facility.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${tier.badgeColor}`}>{tier.badge}</span>
                    <span className="text-slate-400 text-xs">{tier.name}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Impact summary */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700">
            <div className="text-center">
              <div className="text-xs text-slate-400">Facility CAPEX</div>
              <div className="text-sm font-bold text-red-400">${(totalCapex / 1e6).toFixed(1)}M</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">OPEX Impact</div>
              <div className={`text-sm font-bold ${totalOpexMod <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalOpexMod > 0 ? '+' : ''}{(totalOpexMod * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Production Impact</div>
              <div className={`text-sm font-bold ${totalProdMod >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalProdMod > 0 ? '+' : ''}{(totalProdMod * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => dispatchSetShowDecisionGate(true)}
        disabled={authProps('advanceWithoutGate').disabled}
        title={authProps('advanceWithoutGate').title}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all"
      >
        Proceed to Decision Gate 5 — Start Production
      </button>
    </div>
  );
};

export default H2Y3Startup;
