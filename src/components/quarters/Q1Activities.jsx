import React from 'react';
import { AlertTriangle, Target } from 'lucide-react';

import { PROBABILITIES, COSTS, LEASE_OPTIONS, calculateRoyaltyRate } from '../../constants/economics';
import { GEOLOGICAL_CHARACTERISTICS } from '../../constants/geology';
import GeologicalMap from '../visualizations/GeologicalMap';

import { useGame } from '../../context/GameContext';
import { useRoleHelpers } from '../../hooks/useRoleHelpers';
import { useGameActions } from '../../hooks/useGameActions';
import { useAuthority } from '../../hooks/useAuthority';
import RoleSection from '../game/RoleSection';

const Q1Activities = () => {
  const {
    projectData,
    leaseTerms,
    oilPrice,
  } = useGame();

  const { hasRole } = useRoleHelpers();

  const {
    selectGeological,
    secureLease,
    revokeLease,
    applyGeoCost,
    dispatchSetShowDecisionGate,
    dispatchSetLeaseTermField,
  } = useGameActions();

  const { authProps } = useAuthority();

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-4">Q1 Activities: Lease & Planning</h3>

      <div className="space-y-4">
        <RoleSection roles="geologist">
          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-300 mb-2"><span className="font-bold text-blue-400">Your first strategic decision.</span> Each geological area has a unique risk/reward profile. High probability areas have smaller reserves, while risky areas can yield massive discoveries.</p>
          <div className="flex items-center gap-2 text-xs mt-2">
            <span className="bg-emerald-600/30 text-emerald-400 px-2 py-1 rounded">Low Risk</span>
            <span className="text-slate-500">Proven Basin</span>
            <span className="text-slate-600 mx-1">&rarr;</span>
            <span className="text-slate-500">Frontier</span>
            <span className="text-slate-600 mx-1">&rarr;</span>
            <span className="text-slate-500">Deepwater</span>
            <span className="text-slate-600 mx-1">&rarr;</span>
            <span className="text-slate-500">Unconventional</span>
            <span className="bg-red-600/30 text-red-400 px-2 py-1 rounded">High Risk</span>
          </div>
          <p className="text-xs text-emerald-400 mt-2">Recommendation: Start with <span className="font-bold">Proven Basin</span> — highest success rate (40%).</p>
        </div>

        <label className="block text-sm font-semibold mb-2">1. Select Geological Area</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(PROBABILITIES.geological).map(type => {
              const geo = GEOLOGICAL_CHARACTERISTICS[type];
              return (
                <button
                  key={type}
                  onClick={() => selectGeological(type)}
                  title={authProps('selectGeological').title}
                  disabled={authProps('selectGeological').disabled}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    projectData.geologicalType === type
                      ? 'border-emerald-400 bg-emerald-900/30'
                      : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1"><div className="font-bold text-lg">{geo.name}</div><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${geo.probability >= 0.30 ? 'bg-emerald-600/30 text-emerald-400' : geo.probability >= 0.15 ? 'bg-yellow-600/30 text-yellow-400' : geo.probability >= 0.12 ? 'bg-orange-600/30 text-orange-400' : 'bg-red-600/30 text-red-400'}`}>{geo.probability >= 0.30 ? 'Beginner' : geo.probability >= 0.15 ? 'Moderate' : geo.probability >= 0.12 ? 'Advanced' : 'Expert'}</span></div>
                  <div className="text-xs text-slate-400 mb-3">{geo.description}</div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Success Probability <span className="text-slate-500">(chance of finding oil)</span>:</span>
                      <span className={`font-semibold ${
                        geo.probability >= 0.30 ? 'text-emerald-400' :
                        geo.probability >= 0.15 ? 'text-yellow-400' :
                        'text-orange-400'
                      }`}>{(geo.probability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reserve Size <span className="text-slate-500">(potential volume)</span>:</span>
                      <span className="font-semibold text-blue-400">
                        {(geo.reserveRangeMin/1e6).toFixed(0)}-{(geo.reserveRangeMax/1e6).toFixed(0)}M bbl
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exploration Well:</span>
                      <span className={`font-semibold ${
                        geo.explorationWellMultiplier > 2 ? 'text-red-400' :
                        geo.explorationWellMultiplier > 1 ? 'text-orange-400' :
                        'text-emerald-400'
                      }`}>
                        ${(COSTS.explorationWell * geo.explorationWellMultiplier / 1e6).toFixed(0)}M
                        {geo.explorationWellMultiplier !== 1.0 && ` (${geo.explorationWellMultiplier}x)`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Typical Oil Quality:</span>
                      <span className="font-semibold text-purple-400">
                        {geo.oilQualityWeights.light > 0.5 ? 'Light' :
                         geo.oilQualityWeights.heavy > 0.4 ? 'Heavy' : 'Mixed'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time to First Oil:</span>
                      <span className="font-semibold text-slate-300">
                        {Math.floor(geo.timeToFirstOil / 12)}y {geo.timeToFirstOil % 12}m
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </RoleSection>

        {projectData.geologicalType && (
          <GeologicalMap geoType={projectData.geologicalType} />
        )}

        <div>
          <label className="block text-sm font-semibold mb-3">
            2. Lease & Permit Terms <span className="text-slate-400 font-normal text-xs">(configure before securing)</span>
          </label>

          {!projectData.leaseSecured && projectData.geologicalType && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {Object.entries(LEASE_OPTIONS).map(([fieldKey, category]) => (
                <RoleSection key={fieldKey} roles={category.role}>
                  <h5 className="text-sm font-bold mb-2 text-slate-200">{category.label}</h5>
                  <div className="space-y-2">
                    {Object.entries(category.options).map(([optId, opt]) => {
                      const isSelected = leaseTerms[fieldKey] === optId;
                      const geoCost = applyGeoCost(opt.cost + (opt.permitCost || 0), 'lease');
                      return (
                        <button
                          key={optId}
                          onClick={() => dispatchSetLeaseTermField(fieldKey, optId)}
                          disabled={authProps('setLeaseTermField').disabled}
                          title={authProps('setLeaseTermField').title}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all text-xs ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-900/30'
                              : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm">{opt.name}</span>
                            <span className="text-orange-400 font-semibold">${(geoCost/1e6).toFixed(1)}M</span>
                          </div>
                          <div className="text-slate-400">{opt.desc}</div>
                          {opt.rate !== undefined && (
                            <div className="mt-1 text-yellow-400">Royalty: {(opt.rate * 100).toFixed(0)}%</div>
                          )}
                          {opt.type === 'sliding' && (
                            <div className="mt-1 text-yellow-400">Royalty: 8-20% (oil price dependent)</div>
                          )}
                          {opt.reserveMultiplier !== undefined && (
                            <div className="mt-1 text-blue-400">Reserve multiplier: {opt.reserveMultiplier}x</div>
                          )}
                          {opt.delayRisk !== undefined && (
                            <div className="mt-1 text-red-400">Regulatory delay risk: {(opt.delayRisk * 100).toFixed(0)}%</div>
                          )}
                          {opt.renegotiable && (
                            <div className="mt-1 text-emerald-400">Renegotiable at FID</div>
                          )}
                          {opt.partnerWI && (
                            <div className="mt-1 text-purple-400">Partner takes {(opt.partnerWI * 100).toFixed(0)}% working interest</div>
                          )}
                          {isSelected && <div className="text-emerald-400 mt-1 font-bold">Selected</div>}
                        </button>
                      );
                    })}
                  </div>
                </RoleSection>
              ))}
            </div>
          )}

          {/* Cost Summary */}
          {!projectData.leaseSecured && projectData.geologicalType && (() => {
            const lt = leaseTerms;
            const allSelected = lt.licenseType && lt.environmentalScope && lt.blockSize && lt.royaltyTerms;
            if (!allSelected) {
              const remaining = [
                !lt.licenseType && 'License Type',
                !lt.environmentalScope && 'Environmental Assessment',
                !lt.blockSize && 'Block Size',
                !lt.royaltyTerms && 'Royalty Terms',
              ].filter(Boolean);
              return (
                <div className="bg-slate-900/50 rounded-lg p-3 mb-3 text-sm text-slate-400">
                  Still needed: {remaining.join(', ')}
                </div>
              );
            }
            const lic = LEASE_OPTIONS.licenseType.options[lt.licenseType];
            const env = LEASE_OPTIONS.environmentalScope.options[lt.environmentalScope];
            const blk = LEASE_OPTIONS.blockSize.options[lt.blockSize];
            const roy = LEASE_OPTIONS.royaltyTerms.options[lt.royaltyTerms];
            const baseCost = lic.cost + env.cost + blk.cost + blk.permitCost + roy.cost;
            const totalCost = applyGeoCost(baseCost, 'lease');
            const royaltyRate = calculateRoyaltyRate(roy, oilPrice);
            return (
              <div className="bg-slate-900/50 rounded-lg p-4 mb-3 border border-slate-700">
                <h5 className="text-sm font-bold text-slate-200 mb-2">Cost Summary</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">License ({lic.name}):</span><span>${(applyGeoCost(lic.cost, 'lease')/1e6).toFixed(1)}M</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">EIA ({env.name}):</span><span>${(applyGeoCost(env.cost, 'lease')/1e6).toFixed(1)}M</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Block ({blk.name}):</span><span>${(applyGeoCost(blk.cost + blk.permitCost, 'lease')/1e6).toFixed(1)}M</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Royalty signing ({roy.name}):</span><span>${(applyGeoCost(roy.cost, 'lease')/1e6).toFixed(1)}M</span></div>
                  <div className="border-t border-slate-600 my-1"></div>
                  <div className="flex justify-between font-bold"><span>Total:</span><span className="text-orange-400">${(totalCost/1e6).toFixed(1)}M</span></div>
                  <div className="flex justify-between text-yellow-400"><span>Effective royalty rate:</span><span>{(royaltyRate * 100).toFixed(1)}%</span></div>
                  <div className="flex justify-between text-blue-400"><span>Reserve multiplier:</span><span>{blk.reserveMultiplier}x</span></div>
                </div>
              </div>
            );
          })()}

          <RoleSection roles={['geologist', 'finance']}>
            <button
              onClick={secureLease}
              disabled={
                !projectData.geologicalType ||
                projectData.leaseSecured ||
                !leaseTerms.licenseType ||
                !leaseTerms.environmentalScope ||
                !leaseTerms.blockSize ||
                !leaseTerms.royaltyTerms ||
                authProps('secureLease').disabled
              }
              title={authProps('secureLease').title}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
            >
              {projectData.leaseSecured ? '✓ Lease Secured' : 'Secure Lease & Environmental Permits'}
            </button>
            {projectData.leaseSecured && (
              <button
                onClick={revokeLease}
                title={authProps('revokeLease').title}
                disabled={authProps('revokeLease').disabled}
                className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-sm py-2 rounded-lg transition-all border border-slate-600"
              >
                Cancel Lease & Change Area
              </button>
            )}
          </RoleSection>

          {/* Lease secured summary */}
          {projectData.leaseSecured && (() => {
            const lt = leaseTerms;
            const lic = lt.licenseType ? LEASE_OPTIONS.licenseType.options[lt.licenseType] : null;
            const env = lt.environmentalScope ? LEASE_OPTIONS.environmentalScope.options[lt.environmentalScope] : null;
            const blk = lt.blockSize ? LEASE_OPTIONS.blockSize.options[lt.blockSize] : null;
            const roy = lt.royaltyTerms ? LEASE_OPTIONS.royaltyTerms.options[lt.royaltyTerms] : null;
            if (!lic || !env || !blk || !roy) return null;
            return (
              <div className="bg-emerald-900/20 border border-emerald-600 rounded-lg p-3 mt-3 text-xs">
                <div className="font-bold text-emerald-400 mb-2">Lease Terms Secured</div>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-400">License:</span> <span className="text-slate-200">{lic.name}</span></div>
                  <div><span className="text-slate-400">EIA:</span> <span className="text-slate-200">{env.name}</span></div>
                  <div><span className="text-slate-400">Block:</span> <span className="text-slate-200">{blk.name}</span></div>
                  <div><span className="text-slate-400">Royalty:</span> <span className="text-slate-200">{roy.name}</span></div>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-orange-400" />
            <span className="font-bold">Decision Gate 1 Ahead</span>
          </div>
          <p className="text-sm text-slate-300">
            After completing Q1 activities, you'll face your first major decision:
            whether to invest $6.5M in seismic surveys.
          </p>
        </div>

        <button
          onClick={() => dispatchSetShowDecisionGate(true)}
          disabled={!projectData.leaseSecured || !projectData.geologicalType || authProps('advanceWithoutGate').disabled}
          title={authProps('advanceWithoutGate').title}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Target size={20} />
          Proceed to Decision Gate 1
        </button>
      </div>
    </div>
  );
};

export default Q1Activities;
