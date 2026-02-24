import React from 'react';
import { Target, CheckCircle, XCircle, AlertTriangle, FileText, Users, MapPin, DollarSign } from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { GEOLOGICAL_CHARACTERISTICS } from '../../constants/geology';
import { SEISMIC_PACKAGES, SEISMIC_CONTRACTORS } from '../../constants/seismic';
import { COSTS, FEED_STUDY_OPTIONS, FID_OPTIONS, FACILITY_OPTIONS } from '../../constants/economics';
import DrillSiteMap from '../visualizations/DrillSiteMap';
import RoleSection from './RoleSection';
import { useGame } from '../../context/GameContext';
import { useRoleHelpers } from '../../hooks/useRoleHelpers';
import { useGameActions } from '../../hooks/useGameActions';
import { useAuthority } from '../../hooks/useAuthority';

const DecisionGateModal = ({ gateEvaluation }) => {
  const {
    budget, projectData, roleApprovals, teamComposition,
    selectedDrillSite,
    selectedSeismicPkg,
    selectedContractor,
    feedStudy,
    fidSelections,
    justification,
  } = useGame();
  const {
    currentQuarter, currentGate, hasRole,
    getRoleInsight, checkGateRoleRequirements, getRoleApprovalCount,
  } = useRoleHelpers();
  const {
    applyGeoCost, getGateDynamicCost, calculateNPV, makeGateDecision, toggleRoleApproval,
    dispatchSetSelectedSeismicPkg, dispatchSetSelectedContractor,
    dispatchSetFeedStudy, dispatchSetSelectedDrillSite, dispatchSetJustification,
    dispatchSetFidSelection,
  } = useGameActions();
  const { authProps, isAuthorized } = useAuthority();

  if (!currentGate) return null;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border-4 border-orange-500 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Target size={32} className="text-orange-400" />
        <div>
          <h2 className="text-2xl font-bold text-orange-400">{currentGate.name}</h2>
          <p className="text-slate-300">{currentGate.description}</p>
        </div>
      </div>

      {/* Selected Area Info */}
      {projectData.geologicalType && (
        <div className="bg-slate-900/50 rounded-lg p-4 mb-6 flex items-center gap-4">
          <MapPin size={24} className="text-emerald-400 shrink-0" />
          <div className="flex-1">
            <div className="text-xs text-slate-400 mb-1">Selected Geological Area</div>
            <div className="font-bold text-lg text-emerald-400">{GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.name}</div>
            <div className="text-xs text-slate-400">{GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.description}</div>
          </div>
          <div className="text-right text-xs space-y-1">
            <div><span className="text-slate-400">Success Rate: </span><span className="text-emerald-400 font-semibold">{(GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.probability * 100).toFixed(0)}%</span></div>
            <div><span className="text-slate-400">Reserves: </span><span className="text-blue-400 font-semibold">{(GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.reserveRangeMin/1e6).toFixed(0)}-{(GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.reserveRangeMax/1e6).toFixed(0)}M bbl</span></div>
            <div><span className="text-slate-400">Well Cost: </span><span className="text-orange-400 font-semibold">${(15 * GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.explorationWellMultiplier).toFixed(0)}M</span></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Requirements */}
        <div className="bg-slate-900/50 p-4 rounded-lg">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-400" />
            Requirements
          </h3>
          <div className="space-y-2">
            {currentGate.requirements.map((req, idx) => {
              let met = false;
              if (req.key === 'budgetCheck') met = budget >= req.amount;
              else if (req.key === 'probabilityCalculated') met = projectData.probabilityOfSuccess > 0;
              else if (req.key === 'reservesEstimated') met = projectData.reserveEstimate > 0;
              else if (req.key === 'preliminaryNPV') met = calculateNPV(projectData.reserveEstimate || 0, 5, 10000) > 0;
              else if (req.key === 'npvApproved') met = projectData.developmentPlan?.npv > (req.threshold || 0);
              else met = projectData[req.key];

              return (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {met ?
                    <CheckCircle size={16} className="text-emerald-400" /> :
                    <XCircle size={16} className="text-red-400" />
                  }
                  <span className={met ? 'text-slate-300' : 'text-red-400'}>{req.item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risks */}
        <div className="bg-slate-900/50 p-4 rounded-lg">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-400" />
            Key Risks
          </h3>
          <div className="space-y-2">
            {currentGate.risks.map((risk, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    risk.level === 'high' ? 'bg-red-500/20 text-red-300' :
                    risk.level === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>{risk.level.toUpperCase()}</span>
                  <span className="font-semibold">{risk.name}</span>
                </div>
                <div className="text-slate-400 ml-2 mt-1">{risk.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Questions */}
      <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <FileText size={20} className="text-blue-400" />
          Key Questions for Decision
        </h3>
        <ul className="space-y-2 text-sm">
          {currentGate.keyQuestions.map((q, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span className="text-slate-300">{q}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Decision Justification */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Decision Justification (Required)</label>
        <textarea
          value={justification}
          onChange={(e) => dispatchSetJustification(e.target.value)}
          placeholder="Explain your decision rationale, risk assessment, and expected outcomes..."
          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm h-24 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Decision Status */}
      {!gateEvaluation.canProceed && (
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="text-red-400" />
            <span className="font-bold">Cannot Proceed - Missing Requirements:</span>
          </div>
          <ul className="text-sm space-y-1 ml-6">
            {gateEvaluation.missing.map((m, idx) => (
              <li key={idx} className="text-red-300">• {m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Role Requirements & Approvals */}
      {(() => {
        const roleReqs = checkGateRoleRequirements();
        const approvalCount = getRoleApprovalCount();
        const currentGateId = currentQuarter?.gate;

        return (
          <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4 mb-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Users size={20} className="text-purple-400" />
              Team Approvals {approvalCount > 0 && `(${approvalCount}/${roleReqs.requiresSignatures} required)`}
            </h3>

            {/* Missing required roles warning */}
            {!roleReqs.met && (
              <div className="bg-red-900/30 border border-red-500 rounded p-3 mb-3">
                <div className="font-semibold text-red-300 mb-1">⚠️ Missing Required Roles:</div>
                <div className="text-sm text-red-200">
                  {roleReqs.missing.map(roleId => ROLES.find(r => r.id === roleId)?.name).join(', ')}
                </div>
                <div className="text-xs text-red-300 mt-1">
                  Add these roles to your team or proceed with higher risk
                </div>
              </div>
            )}

            {/* Role approvals for team members */}
            <div className="space-y-2">
              {teamComposition.map(roleId => {
                const role = ROLES.find(r => r.id === roleId);
                const isApproved = roleApprovals[currentGateId]?.[roleId] || false;
                const insight = getRoleInsight(roleId, currentQuarter.id) || getRoleInsight(roleId, currentGateId);

                return (
                  <div key={roleId} className="bg-slate-900/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{role.icon}</span>
                        <div>
                          <div className="font-semibold" style={{ color: role.color }}>
                            {role.name}
                            {roleReqs.required && roleReqs.required.includes(roleId) && (
                              <span className="ml-2 text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded">REQUIRED</span>
                            )}
                          </div>
                          {insight && (
                            <div className="text-xs text-slate-400 mt-1">{insight}</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleRoleApproval(roleId)}
                        disabled={authProps('toggleRoleApproval', { targetRoleId: roleId }).disabled}
                        title={authProps('toggleRoleApproval', { targetRoleId: roleId }).title}
                        className={`px-4 py-2 rounded font-semibold transition-all ${
                          isApproved
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        } disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed`}
                      >
                        {isApproved ? '✓ Approved' : 'Click to Approve'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Approval count status */}
            <div className="mt-3 text-sm">
              {approvalCount >= roleReqs.requiresSignatures ? (
                <div className="text-emerald-400 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Minimum signatures met ({approvalCount}/{roleReqs.requiresSignatures})
                </div>
              ) : (
                <div className="text-orange-400 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Need {roleReqs.requiresSignatures - approvalCount} more approval(s)
                </div>
              )}
            </div>

            {/* Recommended roles */}
            {roleReqs.recommended && roleReqs.recommended.length > 0 && (
              <div className="mt-3 text-xs text-slate-400">
                💡 Recommended: {roleReqs.recommended.map(rid => ROLES.find(r => r.id === rid)?.name).join(', ')}
              </div>
            )}
          </div>
        );
      })()}

      {/* Investment Summary */}
      {(() => {
        const dynamicCost = getGateDynamicCost(currentQuarter.gate);
        const displayCost = dynamicCost > 0 ? dynamicCost : currentGate.cost;
        if (displayCost <= 0) return null;
        return (
          <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Investment Required:</span>
              <span className="text-2xl font-bold text-orange-400">${(displayCost/1e6).toFixed(1)}M</span>
            </div>
          </div>
        );
      })()}

      {/* Seismic Package & Contractor Selection for GATE_1 */}
      {currentQuarter.gate === "GATE_1" && (
        <div className="space-y-4 mb-4">
          {/* Seismic Package Selection */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-600">
            <h4 className="font-bold text-blue-400 mb-1">1. Select Seismic Survey Package</h4>
            <p className="text-xs text-slate-400 mb-3">Better data quality increases the chance of finding oil, but costs more.</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(SEISMIC_PACKAGES).map(([pkgId, pkg]) => {
                const totalCost = applyGeoCost(pkg.cost + pkg.processingCost, "seismic");
                const isSelected = selectedSeismicPkg === pkgId;
                return (
                  <button key={pkgId} onClick={() => dispatchSetSelectedSeismicPkg(pkgId)}
                    disabled={authProps('setSelectedSeismicPkg').disabled}
                    title={authProps('setSelectedSeismicPkg').title}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected ? "border-emerald-400 bg-emerald-900/30" : "border-slate-600 bg-slate-700/50 hover:border-blue-500"} disabled:opacity-50 disabled:cursor-not-allowed`}>
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-sm">{pkg.name}</div>
                      <div className={`text-sm font-bold ${totalCost > 10e6 ? "text-red-400" : totalCost > 6e6 ? "text-orange-400" : "text-emerald-400"}`}>
                        ${(totalCost/1e6).toFixed(1)}M</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{pkg.description}</div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-slate-600 px-2 py-0.5 rounded">Quality: {Math.round(pkg.qualityScore*100)}%</span>
                      <span className="text-xs bg-slate-600 px-2 py-0.5 rounded">{pkg.quality}</span>
                    </div>
                    {isSelected && <div className="text-xs text-emerald-400 mt-1 font-bold">Selected</div>}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Contractor Selection */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-600">
            <h4 className="font-bold text-blue-400 mb-1">2. Select Seismic Contractor</h4>
            <p className="text-xs text-slate-400 mb-3">Contractor quality affects data reliability and project timeline.</p>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(SEISMIC_CONTRACTORS).map(([cId, ctr]) => {
                const isSelected = selectedContractor === cId;
                const totalCtrCost = ctr.mobilization + ctr.dailyRate * 35;
                return (
                  <button key={cId} onClick={() => dispatchSetSelectedContractor(cId)}
                    disabled={authProps('setSelectedContractor').disabled}
                    title={authProps('setSelectedContractor').title}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected ? "border-emerald-400 bg-emerald-900/30" : "border-slate-600 bg-slate-700/50 hover:border-blue-500"} disabled:opacity-50 disabled:cursor-not-allowed`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-sm">{ctr.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded ${ctr.badgeColor}`}>{ctr.badge}</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">{ctr.description}</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Daily rate:</span><span>${(ctr.dailyRate/1000).toFixed(0)}K/day</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Mobilization:</span><span>${(ctr.mobilization/1e6).toFixed(1)}M</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Est. total:</span><span className="font-bold">${(totalCtrCost/1e6).toFixed(1)}M</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Schedule:</span><span>{ctr.schedule}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Experience:</span><span>{ctr.experience}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Quality mod:</span><span className={`${ctr.qualityMod > 0 ? "text-emerald-400" : ctr.qualityMod < 0 ? "text-red-400" : "text-slate-300"}`}>{ctr.qualityMod > 0 ? "+" : ""}{(ctr.qualityMod*100).toFixed(0)}%</span></div>
                    </div>
                    <div className="text-xs text-orange-400/80 mt-2">Risk: {ctr.risk}</div>
                    {isSelected && <div className="text-xs text-emerald-400 mt-1 font-bold">Selected</div>}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Budget Impact Analysis */}
          {selectedSeismicPkg && selectedContractor && (
            <div className="bg-slate-800/80 rounded-xl p-4 border border-amber-600/50">
              <h4 className="font-bold text-amber-400 mb-2">3. Budget Impact Analysis</h4>
              {(() => {
                const pkg = SEISMIC_PACKAGES[selectedSeismicPkg];
                const ctr = SEISMIC_CONTRACTORS[selectedContractor];
                const seismicCost = applyGeoCost(pkg.cost + pkg.processingCost, "seismic");
                const contractorCost = ctr.mobilization + ctr.dailyRate * 35;
                const totalGateCost = seismicCost + contractorCost;
                const drillCost = applyGeoCost(15000000, "explorationWell");
                const remaining = budget - totalGateCost;
                const canAffordDrill = remaining >= drillCost;
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Current budget:</span><span className="font-bold">${(budget/1e6).toFixed(1)}M</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Seismic ({pkg.name}):</span><span className="text-red-400">-${(seismicCost/1e6).toFixed(1)}M</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Contractor ({ctr.name}):</span><span className="text-red-400">-${(contractorCost/1e6).toFixed(1)}M</span></div>
                    <div className="border-t border-slate-600 my-1"></div>
                    <div className="flex justify-between font-bold"><span>After FID 1:</span><span className={`${remaining > 0 ? "text-emerald-400" : "text-red-400"}`}>${(remaining/1e6).toFixed(1)}M</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Est. drilling cost (next):</span><span className="text-slate-400">~${(drillCost/1e6).toFixed(1)}M</span></div>
                    {!canAffordDrill && (
                      <div className="bg-red-900/30 border border-red-600 rounded p-2 text-xs text-red-300 mt-1">
                        Warning: Remaining budget may be insufficient for exploration drilling.
                      </div>
                    )}
                    {canAffordDrill && (
                      <div className="bg-emerald-900/30 border border-emerald-600 rounded p-2 text-xs text-emerald-300 mt-1">
                        Budget sufficient to proceed to exploration drilling.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Drill Site Selection for GATE_2 */}
      {currentQuarter.gate === 'GATE_2' && (
        <DrillSiteMap geoType={projectData.geologicalType} selected={selectedDrillSite} onSelect={dispatchSetSelectedDrillSite} />
      )}

      {/* FEED Study Selection for GATE_3 */}
      {currentQuarter.gate === 'GATE_3' && (
        <div className="space-y-4 mb-4">
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-600">
            <h4 className="font-bold text-blue-400 mb-1">Select FEED Study Scope</h4>
            <p className="text-xs text-slate-400 mb-3">
              Front-End Engineering & Design determines cost certainty for development. Better FEED reduces appraisal costs and construction overruns.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(FEED_STUDY_OPTIONS).map(([feedId, opt]) => {
                const isSelected = feedStudy === feedId;
                return (
                  <button key={feedId} onClick={() => dispatchSetFeedStudy(feedId)}
                    disabled={authProps('setFeedStudy').disabled}
                    title={authProps('setFeedStudy').title}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected ? 'border-emerald-400 bg-emerald-900/30' : 'border-slate-600 bg-slate-700/50 hover:border-blue-500'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-sm">{opt.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded ${opt.badgeColor}`}>{opt.badge}</span>
                    </div>
                    <div className="text-lg font-bold text-orange-400 mb-1">${(opt.cost / 1e6).toFixed(0)}M</div>
                    <div className="text-xs text-slate-400 mb-2">{opt.description}</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Uncertainty reduction:</span>
                        <span className={opt.uncertaintyReduction > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                          {opt.uncertaintyReduction > 0 ? `-${(opt.uncertaintyReduction * 100).toFixed(0)}%` : 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cost overrun risk:</span>
                        <span className={opt.costOverrunRisk > 0 ? 'text-red-400' : opt.costOverrunRisk < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                          {opt.costOverrunRisk > 0 ? '+' : ''}{(opt.costOverrunRisk * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Appraisal discount:</span>
                        <span className={opt.appraisalCostMod < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                          {opt.appraisalCostMod < 0 ? `${(opt.appraisalCostMod * 100).toFixed(0)}%` : 'None'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-600">
                      <div className="text-xs text-slate-500 mb-1">Deliverables:</div>
                      <div className="text-xs text-slate-400">
                        {opt.deliverables.map((d, i) => (
                          <span key={i}>{i > 0 ? ' · ' : ''}{d}</span>
                        ))}
                      </div>
                    </div>
                    {isSelected && <div className="text-xs text-emerald-400 mt-2 font-bold">Selected</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Impact for GATE_3 */}
          {feedStudy && (
            <div className="bg-slate-800/80 rounded-xl p-4 border border-amber-600/50">
              <h4 className="font-bold text-amber-400 mb-2">Budget Impact Analysis</h4>
              {(() => {
                const opt = FEED_STUDY_OPTIONS[feedStudy];
                const remaining = budget - opt.cost;
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Current budget:</span><span className="font-bold">${(budget / 1e6).toFixed(1)}M</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">FEED ({opt.name}):</span><span className="text-red-400">-${(opt.cost / 1e6).toFixed(1)}M</span></div>
                    <div className="border-t border-slate-600 my-1"></div>
                    <div className="flex justify-between font-bold"><span>After FID 3:</span><span className={remaining > 0 ? 'text-emerald-400' : 'text-red-400'}>${(remaining / 1e6).toFixed(1)}M</span></div>
                    {opt.costOverrunRisk > 0 && (
                      <div className="bg-yellow-900/30 border border-yellow-600 rounded p-2 text-xs text-yellow-300 mt-1">
                        Note: Desktop study carries +{(opt.costOverrunRisk * 100).toFixed(0)}% risk of facility cost overruns during construction.
                      </div>
                    )}
                    {opt.costOverrunRisk < 0 && (
                      <div className="bg-emerald-900/30 border border-emerald-600 rounded p-2 text-xs text-emerald-300 mt-1">
                        Full FEED reduces facility cost overrun risk by {Math.abs(opt.costOverrunRisk * 100).toFixed(0)}% during construction.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* FID Selections for GATE_4 */}
      {currentQuarter.gate === 'GATE_4' && (
        <div className="space-y-4 mb-4">
          {/* Development Concept */}
          <RoleSection roles={['engineer']}>
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-600">
              <h4 className="font-bold text-blue-400 mb-1">1. Development Concept</h4>
              <p className="text-xs text-slate-400 mb-3">Select the facility type for field development. Affects CAPEX, OPEX, and production capacity.</p>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(FID_OPTIONS.developmentConcept.options).map(([optId, opt]) => {
                  const isSelected = fidSelections.developmentConcept === optId;
                  const totalCost = applyGeoCost(opt.cost, 'facility');
                  return (
                    <button key={optId} onClick={() => dispatchSetFidSelection('developmentConcept', optId)}
                      disabled={authProps('setFidSelection').disabled}
                      title={authProps('setFidSelection').title}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected ? 'border-emerald-400 bg-emerald-900/30' : 'border-slate-600 bg-slate-700/50 hover:border-blue-500'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-sm">{opt.name}</div>
                        <span className={`text-xs px-2 py-0.5 rounded ${opt.badgeColor}`}>{opt.badge}</span>
                      </div>
                      <div className="text-lg font-bold text-orange-400 mb-1">${(totalCost/1e6).toFixed(0)}M</div>
                      <div className="text-xs text-slate-400 mb-2">{opt.desc}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">OPEX impact:</span>
                          <span className={opt.opexModifier > 0 ? 'text-red-400' : opt.opexModifier < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                            {opt.opexModifier > 0 ? '+' : ''}{(opt.opexModifier * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Production:</span>
                          <span className={opt.productionModifier > 0 ? 'text-emerald-400' : opt.productionModifier < 0 ? 'text-red-400' : 'text-slate-400'}>
                            {opt.productionModifier > 0 ? '+' : ''}{(opt.productionModifier * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      {isSelected && <div className="text-xs text-emerald-400 mt-2 font-bold">Selected</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </RoleSection>

          {/* Execution Strategy */}
          <RoleSection roles={['operations']}>
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-600">
              <h4 className="font-bold text-blue-400 mb-1">2. Execution Strategy</h4>
              <p className="text-xs text-slate-400 mb-3">Choose how to execute the development. Affects well drilling costs and production ramp-up.</p>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(FID_OPTIONS.executionStrategy.options).map(([optId, opt]) => {
                  const isSelected = fidSelections.executionStrategy === optId;
                  return (
                    <button key={optId} onClick={() => dispatchSetFidSelection('executionStrategy', optId)}
                      disabled={authProps('setFidSelection').disabled}
                      title={authProps('setFidSelection').title}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected ? 'border-emerald-400 bg-emerald-900/30' : 'border-slate-600 bg-slate-700/50 hover:border-blue-500'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-sm">{opt.name}</div>
                        <span className={`text-xs px-2 py-0.5 rounded ${opt.badgeColor}`}>{opt.badge}</span>
                      </div>
                      <div className="text-xs text-slate-400 mb-2">{opt.desc}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">CAPEX impact:</span>
                          <span className={opt.capexModifier > 0 ? 'text-red-400' : opt.capexModifier < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                            {opt.capexModifier > 0 ? '+' : ''}{(opt.capexModifier * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Production:</span>
                          <span className={opt.productionModifier > 0 ? 'text-emerald-400' : opt.productionModifier < 0 ? 'text-red-400' : 'text-slate-400'}>
                            {opt.productionModifier > 0 ? '+' : ''}{(opt.productionModifier * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Risk:</span>
                          <span className={opt.riskModifier > 0 ? 'text-red-400' : opt.riskModifier < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                            {opt.riskModifier > 0 ? '+' : ''}{(opt.riskModifier * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      {isSelected && <div className="text-xs text-emerald-400 mt-2 font-bold">Selected</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </RoleSection>

          {/* Financing Structure */}
          <RoleSection roles={['finance']}>
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-600">
              <h4 className="font-bold text-blue-400 mb-1">3. Financing Structure</h4>
              <p className="text-xs text-slate-400 mb-3">How to finance the development. Debt reduces upfront equity needs but adds interest costs.</p>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(FID_OPTIONS.financingStructure.options).map(([optId, opt]) => {
                  const isSelected = fidSelections.financingStructure === optId;
                  return (
                    <button key={optId} onClick={() => dispatchSetFidSelection('financingStructure', optId)}
                      disabled={authProps('setFidSelection').disabled}
                      title={authProps('setFidSelection').title}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected ? 'border-emerald-400 bg-emerald-900/30' : 'border-slate-600 bg-slate-700/50 hover:border-blue-500'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-sm">{opt.name}</div>
                        <span className={`text-xs px-2 py-0.5 rounded ${opt.badgeColor}`}>{opt.badge}</span>
                      </div>
                      <div className="text-xs text-slate-400 mb-2">{opt.desc}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Debt ratio:</span>
                          <span className="text-slate-300">{(opt.debtRatio * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Interest rate:</span>
                          <span className={opt.interestRate > 0 ? 'text-orange-400' : 'text-emerald-400'}>
                            {opt.interestRate > 0 ? `${(opt.interestRate * 100).toFixed(0)}%` : 'None'}
                          </span>
                        </div>
                      </div>
                      {isSelected && <div className="text-xs text-emerald-400 mt-2 font-bold">Selected</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </RoleSection>

          {/* Budget Impact Analysis for GATE_4 */}
          {fidSelections.developmentConcept && fidSelections.executionStrategy && fidSelections.financingStructure && (
            <div className="bg-slate-800/80 rounded-xl p-4 border border-amber-600/50">
              <h4 className="font-bold text-amber-400 mb-2">Budget Impact Analysis</h4>
              {(() => {
                const concept = FID_OPTIONS.developmentConcept.options[fidSelections.developmentConcept];
                const execution = FID_OPTIONS.executionStrategy.options[fidSelections.executionStrategy];
                const financing = FID_OPTIONS.financingStructure.options[fidSelections.financingStructure];
                const plan = projectData.developmentPlan;

                const conceptCost = applyGeoCost(concept.cost, 'facility');
                const wellCost = plan ? plan.wellCount * applyGeoCost(COSTS.developmentWell, 'developmentWell') * (1 + execution.capexModifier) : 0;

                // Minimum facilities estimate
                const minFacilityCost = Object.values(FACILITY_OPTIONS)
                  .filter(f => f.required)
                  .reduce((sum, f) => {
                    const cheapestTier = Object.values(f.tiers).reduce((min, t) => t.cost < min ? t.cost : min, Infinity);
                    return sum + applyGeoCost(cheapestTier, 'facility');
                  }, 0);

                const totalProjectCost = conceptCost + wellCost + minFacilityCost;

                let loanAmount = 0;
                let interest = 0;
                if (financing.debtRatio > 0) {
                  const shortfall = totalProjectCost - budget;
                  if (shortfall > 0) {
                    loanAmount = Math.ceil(shortfall * financing.loanMultiplier);
                    interest = Math.floor(loanAmount * financing.interestRate);
                  }
                }

                const afterFID = budget - conceptCost + loanAmount;

                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Current budget:</span><span className="font-bold">${(budget/1e6).toFixed(1)}M</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">{concept.name} CAPEX:</span><span className="text-red-400">-${(conceptCost/1e6).toFixed(1)}M</span></div>
                    <div className="text-xs text-slate-500 mt-1 mb-1">Upcoming costs (next phase):</div>
                    {plan && (
                      <div className="flex justify-between pl-3">
                        <span className="text-slate-500">Well drilling ({plan.wellCount}x):</span>
                        <span className="text-slate-500">${(wellCost/1e6).toFixed(1)}M</span>
                      </div>
                    )}
                    <div className="flex justify-between pl-3">
                      <span className="text-slate-500">Facilities (min. required):</span>
                      <span className="text-slate-500">${(minFacilityCost/1e6).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between pl-3 font-semibold">
                      <span className="text-slate-400">Total project cost:</span>
                      <span className="text-orange-400">${(totalProjectCost/1e6).toFixed(1)}M</span>
                    </div>
                    {loanAmount > 0 && (
                      <>
                        <div className="border-t border-slate-600 my-1"></div>
                        <div className="flex justify-between"><span className="text-slate-400">{financing.name} loan:</span><span className="text-emerald-400">+${(loanAmount/1e6).toFixed(1)}M</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Interest cost:</span><span className="text-red-400">-${(interest/1e6).toFixed(1)}M</span></div>
                      </>
                    )}
                    {financing.debtRatio === 0 && (
                      <div className="flex justify-between"><span className="text-slate-400">Financing:</span><span className="text-emerald-400">No debt (equity only)</span></div>
                    )}
                    <div className="border-t border-slate-600 my-1"></div>
                    <div className="flex justify-between font-bold">
                      <span>After FID 4:</span>
                      <span className={afterFID > 0 ? 'text-emerald-400' : 'text-red-400'}>${(afterFID/1e6).toFixed(1)}M</span>
                    </div>
                    {financing.debtRatio === 0 && afterFID < wellCost + minFacilityCost && (
                      <div className="bg-red-900/30 border border-red-600 rounded p-2 text-xs text-red-300 mt-1">
                        Warning: Equity-only financing may not cover wells + facilities. Consider debt financing or a cheaper concept.
                      </div>
                    )}
                    {loanAmount > 0 && afterFID < wellCost + minFacilityCost && (
                      <div className="bg-yellow-900/30 border border-yellow-600 rounded p-2 text-xs text-yellow-300 mt-1">
                        Warning: Budget may be tight. Additional loan may be required during construction.
                      </div>
                    )}
                    {afterFID >= wellCost + minFacilityCost && (
                      <div className="bg-emerald-900/30 border border-emerald-600 rounded p-2 text-xs text-emerald-300 mt-1">
                        Budget sufficient for well drilling and minimum facilities.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Decision Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => makeGateDecision(false)}
          disabled={authProps('makeGateDecision').disabled}
          title={authProps('makeGateDecision').title}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <XCircle size={20} />
          REJECT - Terminate Project
        </button>
        <button
          onClick={() => makeGateDecision(true)}
          disabled={!gateEvaluation.canProceed || !justification.trim() || authProps('makeGateDecision').disabled}
          title={authProps('makeGateDecision').title}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          APPROVE - Proceed
        </button>
      </div>
    </div>
  );
};

export default DecisionGateModal;
