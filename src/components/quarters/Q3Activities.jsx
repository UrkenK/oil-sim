import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';

import { SEISMIC_PACKAGES, RISK_EFFECTS } from '../../constants/seismic';

import { useGame } from '../../context/GameContext';
import { useRoleHelpers } from '../../hooks/useRoleHelpers';
import { useGameActions } from '../../hooks/useGameActions';
import { useAuthority } from '../../hooks/useAuthority';
import RoleSection from '../game/RoleSection';

const Q3Activities = () => {
  const {
    projectData,
    riskAssessment,
    additionalStudy,
  } = useGame();

  const { hasRole } = useRoleHelpers();

  const {
    runAdditionalStudy,
    obtainDrillingPermit,
    advanceWithoutGate,
    dispatchSetRiskAssessment,
  } = useGameActions();

  const { authProps } = useAuthority();

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-4">Q3 Activities: Seismic Interpretation & Analysis</h3>

      <div className="space-y-4">
        {projectData.seismicComplete && projectData.seismicInterpretation && (
          <>
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <FileText className="text-blue-400" />
                Seismic Interpretation Report
              </h4>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-slate-400">Package Selected:</div>
                  <div className="font-bold">{SEISMIC_PACKAGES[projectData.seismicPackage]?.name}</div>
                </div>
                <div>
                  <div className="text-slate-400">Combined Probability:</div>
                  <div className="font-bold text-emerald-400 text-xl">
                    {(projectData.probabilityOfSuccess * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Structural Analysis */}
              <div className="bg-slate-900/50 rounded p-3 mb-3">
                <div className="font-semibold text-purple-400 mb-2">📐 Structural Analysis</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Closure Identified:</span>
                    <span className={projectData.seismicInterpretation.closureIdentified ? 'text-emerald-400' : 'text-red-400'}>
                      {projectData.seismicInterpretation.closureIdentified ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Closure Area:</span>
                    <span className="text-blue-300">
                      {projectData.seismicInterpretation.closureArea} acres
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trap Type:</span>
                    <span className="text-emerald-300 capitalize">
                      {projectData.seismicInterpretation.structuralType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">4-Way Closure:</span>
                    <span className={projectData.seismicInterpretation.fourWayDipClosure ? 'text-emerald-400' : 'text-yellow-400'}>
                      {projectData.seismicInterpretation.fourWayDipClosure ? '✓ Confirmed' : '~ Partial'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hydrocarbon Indicators */}
              <div className="bg-slate-900/50 rounded p-3 mb-3">
                <div className="font-semibold text-orange-400 mb-2">🔍 Hydrocarbon Indicators (DHI)</div>
                {projectData.seismicInterpretation.dhiPresent ? (
                  <div>
                    <div className="text-emerald-400 text-sm mb-2 font-semibold">
                      ✓ Direct Hydrocarbon Indicators Detected
                    </div>
                    <div className="space-y-1 text-xs">
                      {projectData.seismicInterpretation.dhiTypes.map((dhi, idx) => (
                        <div key={idx} className="text-slate-300">• {dhi}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-yellow-400 text-sm">
                    No direct hydrocarbon indicators observed
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amplitude Anomaly:</span>
                    <span className={projectData.seismicInterpretation.amplitudeAnomaly ? 'text-emerald-400' : 'text-slate-500'}>
                      {projectData.seismicInterpretation.amplitudeAnomaly ?
                        `${projectData.seismicInterpretation.amplitudeStrength}` : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flat Spot:</span>
                    <span className={projectData.seismicInterpretation.flatSpot ? 'text-emerald-400' : 'text-slate-500'}>
                      {projectData.seismicInterpretation.flatSpot ? '✓ Detected' : 'Not seen'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reservoir Parameters */}
              <div className="bg-slate-900/50 rounded p-3 mb-3">
                <div className="font-semibold text-blue-400 mb-2">📏 Reservoir Parameters</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Depth (TVDSS):</span>
                    <span className="text-blue-300">
                      {projectData.seismicInterpretation.reservoirDepth}m ± {projectData.seismicInterpretation.depthUncertainty}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thickness:</span>
                    <span className="text-emerald-300">
                      {projectData.seismicInterpretation.reservoirThickness}m (gross)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fault Count:</span>
                    <span className="text-purple-300">
                      {projectData.seismicInterpretation.faultsIdentified} identified
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fault Sealing:</span>
                    <span className={
                      projectData.seismicInterpretation.faultSealing === 'likely' ? 'text-emerald-400' : 'text-yellow-400'
                    }>
                      {projectData.seismicInterpretation.faultSealing}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence Levels */}
              <div className="bg-slate-900/50 rounded p-3 mb-3">
                <div className="font-semibold text-emerald-400 mb-2">📊 Confidence Assessment</div>
                <div className="space-y-2">
                  {[
                    { label: 'Structural', value: projectData.seismicInterpretation.structuralConfidence },
                    { label: 'Volumetric', value: projectData.seismicInterpretation.volumetricConfidence },
                    { label: 'Fluid', value: projectData.seismicInterpretation.fluidConfidence }
                  ].map((conf, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{conf.label}:</span>
                        <span className="font-semibold">{(conf.value * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            conf.value > 0.7 ? 'bg-emerald-500' :
                            conf.value > 0.4 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${conf.value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              {projectData.seismicInterpretation.risks.length > 0 && (
                <div className="bg-red-900/20 border border-red-600 rounded p-3">
                  <div className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Risk Factors ({projectData.seismicInterpretation.risks.length})
                  </div>
                  <ul className="space-y-2 text-xs">
                    {projectData.seismicInterpretation.risks.map((risk, idx) => {
                      const effect = RISK_EFFECTS[risk];
                      return (
                        <li key={idx}>
                          <div className="text-red-300 font-semibold">• {risk}</div>
                          {effect && (
                            <div className="ml-3 mt-0.5 space-y-0.5">
                              <div className="text-slate-400">
                                {effect.desc}
                                {' | Drilling: '}
                                <span className="text-red-400">{(effect.probPenalty * 100).toFixed(0)}%</span>
                                {effect.reserveModifier && (
                                  <span className="text-yellow-400"> | Reserves: {(effect.reserveModifier * 100).toFixed(0)}%</span>
                                )}
                                {effect.opexModifier && (
                                  <span className="text-orange-400"> | OPEX: +{(effect.opexModifier * 100).toFixed(0)}%</span>
                                )}
                                {effect.productionModifier && (
                                  <span className="text-orange-400"> | Production: {(effect.productionModifier * 100).toFixed(0)}%</span>
                                )}
                                {effect.declineRateBonus && (
                                  <span className="text-orange-400"> | Decline: +{(effect.declineRateBonus * 100).toFixed(0)}%/yr</span>
                                )}
                              </div>
                              <div className="text-blue-400">
                                {effect.mitigatedBy === 'additionalStudy' && '→ Mitigate: Run Additional Study'}
                                {effect.mitigatedBy === 'riskAssessmentFavorable' && '→ Mitigate: Favorable assessment + Geologist on team'}
                                {!effect.mitigatedBy && '→ Cannot be fully mitigated at this stage'}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {(() => {
                    let totalPenalty = 0;
                    projectData.seismicInterpretation.risks.forEach(r => {
                      const e = RISK_EFFECTS[r];
                      if (e) totalPenalty += e.probPenalty;
                    });
                    return totalPenalty !== 0 ? (
                      <div className="mt-2 pt-2 border-t border-red-800 text-xs font-bold text-red-300">
                        Combined drilling probability penalty: {(totalPenalty * 100).toFixed(0)}%
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
              {projectData.seismicInterpretation.risks.length === 0 && (
                <div className="bg-emerald-900/20 border border-emerald-600 rounded p-3">
                  <div className="font-semibold text-emerald-400 text-sm flex items-center gap-2">
                    ✓ All identified risks have been mitigated
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Participant Decisions */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <h4 className="font-bold text-sm mb-3 text-purple-400">Your Analysis & Decisions</h4>

          {/* Risk Assessment */}
          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-2">1. Based on the seismic report above, what is your risk assessment?</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'favorable', label: 'Favorable', desc: 'Data supports drilling', color: 'emerald' },
                { id: 'marginal', label: 'Marginal', desc: 'Mixed signals, proceed with caution', color: 'yellow' },
                { id: 'unfavorable', label: 'Unfavorable', desc: 'High risk, reconsider', color: 'red' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => dispatchSetRiskAssessment(opt.id)}
                  disabled={authProps('setRiskAssessment').disabled}
                  title={authProps('setRiskAssessment').title}
                  className={'p-3 rounded-lg border text-xs text-left transition-all ' + (riskAssessment === opt.id ? 'border-' + opt.color + '-400 bg-' + opt.color + '-900/30' : 'border-slate-600 hover:border-slate-500')}
                >
                  <div className={'font-bold text-' + opt.color + '-400'}>{opt.label}</div>
                  <div className="text-slate-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Study Option */}
          <RoleSection roles="geologist" className="mb-4">
            <div className="text-xs text-slate-400 mb-2">2. Request additional seismic reprocessing? ($2M — improves confidence levels)</div>
            <button
              onClick={runAdditionalStudy}
              disabled={additionalStudy || authProps('runAdditionalStudy').disabled}
              title={authProps('runAdditionalStudy').title}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-bold py-2 rounded-lg transition-all"
            >
              {additionalStudy ? '✓ Additional Study Complete — Confidence Improved' : 'Run Additional Seismic Reprocessing ($2M)'}
            </button>
          </RoleSection>

          {/* Geologist recommendation if on team */}
          {hasRole('geologist') && riskAssessment && (
            <div className="bg-emerald-900/20 border border-emerald-600/50 rounded-lg p-3 mb-4">
              <div className="text-xs font-bold text-emerald-400 mb-1">Geologist Recommendation:</div>
              <div className="text-xs text-slate-300">
                {projectData.probabilityOfSuccess > 0.25
                  ? 'The structural closure and reservoir indicators are promising. I recommend proceeding to drill.'
                  : projectData.probabilityOfSuccess > 0.15
                  ? 'Data is marginal. Consider additional studies or accept higher risk. The trap geometry needs further evaluation.'
                  : 'Significant uncertainties remain. The probability of success is low. Consider whether the potential upside justifies the drilling cost.'}
              </div>
            </div>
          )}

          <div className="text-xs text-slate-500 text-center">Complete your assessment, then apply for the drilling permit below.</div>
        </div>

        <RoleSection roles="operations">
          <button
            onClick={obtainDrillingPermit}
            disabled={projectData.drillingPermit || !riskAssessment || authProps('obtainDrillingPermit').disabled}
            title={authProps('obtainDrillingPermit').title}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
          >
            {projectData.drillingPermit ? '✓ Drilling Permit Approved' : 'Apply for Drilling Permit'}
          </button>
        </RoleSection>

        <button
          onClick={advanceWithoutGate}
          disabled={!projectData.drillingPermit || authProps('advanceWithoutGate').disabled}
          title={authProps('advanceWithoutGate').title}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
        >
          Complete Q3 → Advance to Q4
        </button>
      </div>
    </div>
  );
};

export default Q3Activities;
