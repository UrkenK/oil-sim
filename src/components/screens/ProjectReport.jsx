import { ROLES } from '../../constants/roles';
import { GEOLOGICAL_CHARACTERISTICS } from '../../constants/geology';
import { SEISMIC_PACKAGES, SEISMIC_CONTRACTORS, PROCESSING_WORKFLOWS } from '../../constants/seismic';
import { APPRAISAL_STRATEGIES, WELL_TEST_TYPES, FACILITY_OPTIONS, FEED_STUDY_OPTIONS } from '../../constants/economics';

const ProjectReport = ({ data, onClose, onExport }) => {
  const { teamComposition, decisions, roleApprovals, projectData, wells, individualWells, budget, totalSpent, revenue, production,
    selectedSeismicPkg, selectedContractor, selectedDrillSite, appraisalStrategy, wellTestType, processingWorkflow,
    seismicObservations, riskAssessment, loanAssessment, dryHoleHistory, selectedFacilities, feedStudy, gameState,
    oilPrice, oilPriceHistory } = data;

  const financialHistory = production?.financialHistory || [];
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

        {/* Oil Price History */}
        {oilPriceHistory && oilPriceHistory.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h2 className="text-lg font-bold mb-4 text-blue-400">Oil Price History</h2>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Start: $75.00/bbl</span>
              <span>Final: ${oilPrice?.toFixed(2) || 'N/A'}/bbl</span>
            </div>
            {/* SVG Sparkline */}
            {(() => {
              const priceData = oilPriceHistory;
              if (priceData.length < 2) return null;

              const width = 700;
              const height = 200;
              const pad = { top: 20, right: 20, bottom: 30, left: 50 };
              const chartW = width - pad.left - pad.right;
              const chartH = height - pad.top - pad.bottom;

              const prices = priceData.map(d => d.price);
              const minP = Math.min(...prices) - 5;
              const maxP = Math.max(...prices) + 5;
              const minDay = priceData[0].day;
              const maxDay = priceData[priceData.length - 1].day;
              const dayRange = maxDay - minDay || 1;

              const x = (day) => pad.left + ((day - minDay) / dayRange) * chartW;
              const y = (price) => pad.top + chartH - ((price - minP) / (maxP - minP)) * chartH;

              const points = priceData.map(d => `${x(d.day)},${y(d.price)}`).join(' ');
              const events = priceData.filter(d => d.event && d.eventId !== 'stable_market');

              const gridLines = [30, 50, 75, 100, 130].filter(p => p >= minP && p <= maxP);

              return (
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: '250px' }}>
                  {gridLines.map(p => (
                    <g key={p}>
                      <line x1={pad.left} y1={y(p)} x2={width - pad.right} y2={y(p)}
                        stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                      <text x={pad.left - 5} y={y(p) + 4} textAnchor="end"
                        fill="#64748b" fontSize="10">${p}</text>
                    </g>
                  ))}
                  <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                  {events.map((d, i) => (
                    <circle key={i} cx={x(d.day)} cy={y(d.price)} r="4"
                      fill={d.price > 75 ? '#10b981' : '#ef4444'}
                      stroke="#1e293b" strokeWidth="1" />
                  ))}
                </svg>
              );
            })()}
            {/* Market Events List */}
            <div className="mt-4 space-y-1">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Market Events</div>
              {oilPriceHistory
                .filter(p => p.event)
                .map((p, idx) => (
                  <div key={idx} className="flex justify-between text-xs bg-slate-900/50 rounded p-2">
                    <span>
                      <span className="text-slate-500">Day {p.day}:</span>
                      <span className="text-slate-300 ml-2">{p.event}</span>
                    </span>
                    <span className="font-bold">${p.price.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Financial Performance Chart */}
        {financialHistory && financialHistory.length >= 2 && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h2 className="text-lg font-bold mb-4 text-blue-400">Monthly Financial Performance</h2>
            {(() => {
              const width = 700;
              const height = 250;
              const pad = { top: 20, right: 20, bottom: 35, left: 55 };
              const chartW = width - pad.left - pad.right;
              const chartH = height - pad.top - pad.bottom;

              const revData = financialHistory.map(d => d.revenue);
              const expData = financialHistory.map(d => d.opex + d.royalties + d.tax);
              const allVals = [...revData, ...expData];
              const maxVal = Math.max(...allVals) * 1.1;
              const minVal = 0;
              const valRange = maxVal - minVal || 1;

              const x = (i) => pad.left + (i / (financialHistory.length - 1)) * chartW;
              const y = (v) => pad.top + chartH - ((v - minVal) / valRange) * chartH;

              const revPoints = financialHistory.map((d, i) => `${x(i)},${y(d.revenue)}`).join(' ');
              const expPoints = financialHistory.map((d, i) => `${x(i)},${y(d.opex + d.royalties + d.tax)}`).join(' ');

              const gridCount = 4;
              const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => minVal + (valRange * i) / gridCount);

              const yearLabels = [];
              for (let i = 0; i < financialHistory.length; i++) {
                if (financialHistory[i].month % 12 === 0) {
                  yearLabels.push({ i, year: financialHistory[i].month / 12 });
                }
              }

              return (
                <>
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: '300px' }}>
                    {gridLines.map((v, i) => (
                      <g key={i}>
                        <line x1={pad.left} y1={y(v)} x2={width - pad.right} y2={y(v)}
                          stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                        <text x={pad.left - 5} y={y(v) + 4} textAnchor="end"
                          fill="#64748b" fontSize="10">${(v / 1e6).toFixed(1)}M</text>
                      </g>
                    ))}
                    {yearLabels.map(({ i, year }) => (
                      <g key={year}>
                        <line x1={x(i)} y1={pad.top} x2={x(i)} y2={pad.top + chartH}
                          stroke="#334155" strokeWidth="1" strokeDasharray="2,4" />
                        <text x={x(i)} y={height - 5} textAnchor="middle"
                          fill="#64748b" fontSize="10">Y{year}</text>
                      </g>
                    ))}
                    <polyline points={revPoints} fill="none" stroke="#10b981" strokeWidth="2" />
                    <polyline points={expPoints} fill="none" stroke="#ef4444" strokeWidth="2" />
                  </svg>
                  <div className="flex justify-center gap-6 mt-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-0.5 bg-emerald-500"></div>
                      <span className="text-slate-400">Gross Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-0.5 bg-red-500"></div>
                      <span className="text-slate-400">Total Expenses</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Individual Well Results */}
        {individualWells && individualWells.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h2 className="text-lg font-bold mb-4 text-amber-400">Individual Well Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left p-2">Well</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-right p-2">IP (bpd)</th>
                    <th className="text-right p-2">Final (bpd)</th>
                    <th className="text-right p-2">Cumulative</th>
                    <th className="text-right p-2">Water Cut</th>
                    <th className="text-right p-2">Health</th>
                    <th className="text-right p-2">Workovers</th>
                  </tr>
                </thead>
                <tbody>
                  {individualWells.map(w => (
                    <tr key={w.id} className="border-b border-slate-800">
                      <td className="p-2 font-bold">{w.name}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          w.status === 'producing' ? 'bg-emerald-900/50 text-emerald-400' :
                          w.status === 'shut_in' ? 'bg-yellow-900/50 text-yellow-400' :
                          w.status === 'abandoned' ? 'bg-red-900/50 text-red-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>{w.status.replace('_',' ')}</span>
                      </td>
                      <td className="p-2 text-right">{w.originalIP.toLocaleString()}</td>
                      <td className="p-2 text-right">{(w.dailyProduction || 0).toLocaleString()}</td>
                      <td className="p-2 text-right">{(w.cumulativeProduction/1e6).toFixed(2)}M bbl</td>
                      <td className="p-2 text-right">{(w.waterCut*100).toFixed(1)}%</td>
                      <td className="p-2 text-right">{w.health.toFixed(0)}%</td>
                      <td className="p-2 text-right">{w.workoverCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
