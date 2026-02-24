import { ROLES } from '../../constants/roles';
import { GEOLOGICAL_CHARACTERISTICS } from '../../constants/geology';
import { SEISMIC_PACKAGES, SEISMIC_CONTRACTORS, PROCESSING_WORKFLOWS } from '../../constants/seismic';
import { APPRAISAL_STRATEGIES, WELL_TEST_TYPES, FACILITY_OPTIONS, FEED_STUDY_OPTIONS } from '../../constants/economics';

const ProjectReport = ({ data, onClose, onExport }) => {
  const { teamComposition, decisions, roleApprovals, projectData, wells, budget, totalSpent, revenue, production,
    selectedSeismicPkg, selectedContractor, selectedDrillSite, appraisalStrategy, wellTestType, processingWorkflow,
    seismicObservations, riskAssessment, loanAssessment, dryHoleHistory, selectedFacilities, feedStudy, gameState } = data;

  const sortedDecisions = [...decisions].reverse();
  const geoName = projectData.geologicalType ? GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.name : 'N/A';
  const isTerminated = gameState === 'ended';
  const isProfitable = revenue > totalSpent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">Project Report</h1>
              <p className="text-slate-400 text-sm">{geoName} — {new Date().toLocaleDateString()}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
              isTerminated ? 'bg-red-900/50 text-red-400 border border-red-600' :
              isProfitable ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-600' :
              'bg-orange-900/50 text-orange-400 border border-orange-600'
            }`}>
              {isTerminated ? 'Project Terminated' : isProfitable ? 'Profitable' : 'Unprofitable'}
            </div>
          </div>

          {/* Team */}
          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-2 font-bold">Team Composition</div>
            <div className="flex gap-3">
              {teamComposition.map(roleId => {
                const role = ROLES.find(r => r.id === roleId);
                return role ? (
                  <div key={roleId} className="flex items-center gap-1 text-sm">
                    <span>{role.icon}</span>
                    <span style={{ color: role.color }}>{role.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/50 rounded p-3">
              <div className="text-xs text-slate-400">Total Investment</div>
              <div className="text-lg font-bold text-red-400">${(totalSpent/1e6).toFixed(1)}M</div>
            </div>
            <div className="bg-slate-900/50 rounded p-3">
              <div className="text-xs text-slate-400">Total Revenue</div>
              <div className="text-lg font-bold text-emerald-400">${(revenue/1e6).toFixed(1)}M</div>
            </div>
            <div className="bg-slate-900/50 rounded p-3">
              <div className="text-xs text-slate-400">Net Position</div>
              <div className={`text-lg font-bold ${budget - 100000000 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${((budget - 100000000)/1e6).toFixed(1)}M
              </div>
            </div>
            <div className="bg-slate-900/50 rounded p-3">
              <div className="text-xs text-slate-400">ROI</div>
              <div className={`text-lg font-bold ${revenue > totalSpent ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalSpent > 0 ? (((revenue - totalSpent) / totalSpent) * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
          </div>

          {/* Wells & Production */}
          {!isTerminated && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div className="bg-slate-900/50 rounded p-3">
                <div className="text-xs text-slate-400">Wells Drilled</div>
                <div className="text-lg font-bold">{wells.exploration + wells.appraisal + wells.production}</div>
              </div>
              <div className="bg-slate-900/50 rounded p-3">
                <div className="text-xs text-slate-400">Production Rate</div>
                <div className="text-lg font-bold">{production.daily.toLocaleString()} bpd</div>
              </div>
              <div className="bg-slate-900/50 rounded p-3">
                <div className="text-xs text-slate-400">Cumulative Production</div>
                <div className="text-lg font-bold">{(production.cumulative/1e6).toFixed(2)}M bbl</div>
              </div>
              <div className="bg-slate-900/50 rounded p-3">
                <div className="text-xs text-slate-400">Production Days</div>
                <div className="text-lg font-bold">{production.days}</div>
              </div>
            </div>
          )}
        </div>

        {/* Key Choices */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <h2 className="text-lg font-bold mb-4">Key Choices</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-900/50 rounded p-3">
              <div className="text-xs text-slate-400">Geological Area</div>
              <div className="font-bold">{geoName}</div>
            </div>
            {selectedSeismicPkg && (
              <div className="bg-slate-900/50 rounded p-3">
                <div className="text-xs text-slate-400">Seismic Package</div>
                <div className="font-bold">{SEISMIC_PACKAGES[selectedSeismicPkg]?.name || selectedSeismicPkg}</div>
              </div>
            )}
            {selectedContractor && (
              <div className="bg-slate-900/50 rounded p-3">
                <div className="text-xs text-slate-400">Seismic Contractor</div>
                <div className="font-bold">{SEISMIC_CONTRACTORS[selectedContractor]?.name || selectedContractor}</div>
              </div>
            )}
            {processingWorkflow && (
              <div className="bg-slate-900/50 rounded p-3">
                <div className="text-xs text-slate-400">Processing Workflow</div>
                <div className="font-bold">{PROCESSING_WORKFLOWS[processingWorkflow]?.name || processingWorkflow}</div>
              </div>
            )}
            {selectedDrillSite && (
              <div className="bg-slate-900/50 rounded p-3">
                <div className="text-xs text-slate-400">Drill Site</div>
                <div className="font-bold">Site {selectedDrillSite}</div>
              </div>
            )}
            {appraisalStrategy && (
              <div className="bg-slate-900/50 rounded p-3">
                <div className="text-xs text-slate-400">Appraisal Strategy</div>
                <div className="font-bold">{APPRAISAL_STRATEGIES[appraisalStrategy]?.name || appraisalStrategy}</div>
              </div>
            )}
            {wellTestType && (
              <div className="bg-slate-900/50 rounded p-3">
                <div className="text-xs text-slate-400">Well Test</div>
                <div className="font-bold">{WELL_TEST_TYPES[wellTestType]?.name || wellTestType}</div>
              </div>
            )}
            {feedStudy && (
              <div className="bg-slate-900/50 rounded p-3">
                <div className="text-xs text-slate-400">FEED Study</div>
                <div className="font-bold">{FEED_STUDY_OPTIONS[feedStudy]?.name || feedStudy}</div>
              </div>
            )}
          </div>
        </div>

        {/* Facility Selections */}
        {selectedFacilities && Object.keys(selectedFacilities).length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h2 className="text-lg font-bold mb-4">Facility Selections</h2>
            <div className="space-y-2">
              {Object.entries(selectedFacilities).filter(([, tierId]) => tierId !== 'none').map(([facId, tierId]) => {
                const facility = FACILITY_OPTIONS[facId];
                const tier = facility?.tiers?.[tierId];
                if (!facility || !tier) return null;
                return (
                  <div key={facId} className="flex justify-between items-center text-sm bg-slate-900/50 rounded p-3">
                    <div>
                      <span className="text-slate-300">{facility.name}</span>
                      <span className="text-slate-500 ml-2">— {tier.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${tier.badgeColor}`}>{tier.badge}</span>
                      <span className="text-red-400 text-xs font-bold">${(tier.cost / 1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Totals */}
            {(() => {
              const totals = Object.entries(selectedFacilities).reduce((acc, [facId, tierId]) => {
                const tier = FACILITY_OPTIONS[facId]?.tiers?.[tierId];
                if (tier) {
                  acc.capex += tier.cost;
                  acc.opex += tier.opexModifier || 0;
                  acc.prod += tier.productionModifier || 0;
                }
                return acc;
              }, { capex: 0, opex: 0, prod: 0 });
              return (
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-700 text-center text-sm">
                  <div>
                    <div className="text-xs text-slate-400">Total CAPEX</div>
                    <div className="font-bold text-red-400">${(totals.capex / 1e6).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">OPEX Impact</div>
                    <div className={`font-bold ${totals.opex <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {totals.opex > 0 ? '+' : ''}{(totals.opex * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Production Impact</div>
                    <div className={`font-bold ${totals.prod >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {totals.prod > 0 ? '+' : ''}{(totals.prod * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Participant Assessments */}
        {(seismicObservations.overallAssessment || riskAssessment || loanAssessment.riskAcceptance) && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h2 className="text-lg font-bold mb-4">Participant Assessments</h2>

            {seismicObservations.overallAssessment && (
              <div className="mb-4">
                <div className="text-sm font-bold text-blue-400 mb-2">Seismic Observations (Q2)</div>
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/50 rounded p-3">
                  <div>Structure visible: <span className="text-blue-300 capitalize">{seismicObservations.structureVisible || '—'}</span></div>
                  <div>Amplitude anomaly: <span className="text-blue-300 capitalize">{seismicObservations.amplitudeAnomaly || '—'}</span></div>
                  <div>Faults visible: <span className="text-blue-300 capitalize">{seismicObservations.faultsVisible || '—'}</span></div>
                  <div>Est. depth: <span className="text-blue-300 capitalize">{seismicObservations.estimatedDepth || '—'}</span></div>
                  <div className="col-span-2">Overall: <span className="text-blue-300 capitalize font-bold">{seismicObservations.overallAssessment}</span></div>
                </div>
              </div>
            )}

            {riskAssessment && (
              <div className="mb-4">
                <div className="text-sm font-bold text-purple-400 mb-2">Risk Assessment (Q3)</div>
                <div className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                  riskAssessment === 'favorable' ? 'bg-emerald-900/50 text-emerald-400' :
                  riskAssessment === 'marginal' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-red-900/50 text-red-400'
                }`}>
                  {riskAssessment}
                </div>
              </div>
            )}

            {loanAssessment.riskAcceptance && (
              <div>
                <div className="text-sm font-bold text-orange-400 mb-2">Loan Assessment (H1 Y3)</div>
                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-900/50 rounded p-3">
                  <div>Risk: <span className="text-orange-300 capitalize">{loanAssessment.riskAcceptance}</span></div>
                  <div>Repayment: <span className="text-orange-300 capitalize">{loanAssessment.repaymentSource || '—'}</span></div>
                  <div>Debt tolerance: <span className="text-orange-300 capitalize">{loanAssessment.debtTolerance || '—'}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dry Hole History */}
        {dryHoleHistory.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h2 className="text-lg font-bold mb-4">Dry Hole Recovery</h2>
            <div className="space-y-2">
              {dryHoleHistory.map((dh, idx) => (
                <div key={idx} className={`flex justify-between items-center text-sm p-3 rounded border ${
                  dh.success ? 'bg-emerald-900/20 border-emerald-600/50' : 'bg-red-900/20 border-red-600/50'
                }`}>
                  <div>
                    <span className="font-bold">Attempt #{dh.attempt}</span>
                    <span className="text-slate-400 ml-2">{dh.type}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-400">${(dh.cost/1e6).toFixed(1)}M</span>
                    <span className={dh.success ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{dh.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision Timeline */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <h2 className="text-lg font-bold mb-4">Decision Timeline</h2>
          <div className="space-y-3">
            {sortedDecisions.map((d, idx) => {
              const isGate = d.action.includes('FID');
              return (
                <div key={d.id || idx} className={`p-4 rounded-lg border ${
                  isGate ? 'bg-indigo-900/20 border-indigo-600/50' : 'bg-slate-900/50 border-slate-700'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-sm">{d.action}</div>
                      <div className="text-xs text-slate-400">{d.quarter} — {d.timestamp}</div>
                    </div>
                    {d.cost > 0 && (
                      <div className="text-sm font-bold text-red-400">-${(d.cost/1e6).toFixed(1)}M</div>
                    )}
                  </div>

                  <div className="text-sm text-slate-300 mb-1">{d.outcome}</div>

                  {d.risks && (
                    <div className="text-xs text-slate-400">Risks: {d.risks}</div>
                  )}

                  {d.justification && (
                    <div className="mt-2 text-xs bg-slate-800/50 rounded p-2 border border-slate-600">
                      <span className="text-slate-400">Justification: </span>
                      <span className="text-slate-300">{d.justification}</span>
                    </div>
                  )}

                  {d.approvedBy && d.approvedBy.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-400">Approved by:</span>
                      {d.approvedBy.map(roleId => {
                        const role = ROLES.find(r => r.id === roleId);
                        return role ? (
                          <span key={roleId} className="text-xs px-2 py-0.5 rounded" style={{ color: role.color, backgroundColor: role.color + '20', border: `1px solid ${role.color}40` }}>
                            {role.icon} {role.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  <div className="text-xs text-slate-500 mt-1">Budget after: ${(d.budget/1e6).toFixed(1)}M</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all">
            Back
          </button>
          <button onClick={onExport}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all">
            Export as JSON
          </button>
          <button onClick={() => window.location.reload()}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all">
            Start New Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectReport;
