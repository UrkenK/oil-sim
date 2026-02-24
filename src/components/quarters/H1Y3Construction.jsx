import React from 'react';
import { AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';
import { COSTS, FACILITY_OPTIONS, FID_OPTIONS } from '../../constants/economics';
import { useGame } from '../../context/GameContext';
import { useRoleHelpers } from '../../hooks/useRoleHelpers';
import { useGameActions } from '../../hooks/useGameActions';
import { useAuthority } from '../../hooks/useAuthority';
import RoleSection from '../game/RoleSection';

const H1Y3Construction = () => {
  const {
    projectData,
    budget,
    loanAssessment,
    selectedFacilities,
    fidSelections,
  } = useGame();

  const { hasRole, getRoleBonus } = useRoleHelpers();

  const {
    executeWellDrilling,
    selectFacility,
    confirmFacilities,
    secureLoan,
    advanceWithoutGate,
    applyGeoCost,
    dispatchSetLoanAssessment,
  } = useGameActions();

  const { authProps } = useAuthority();

  const plan = projectData.developmentPlan;
  let wellCost = plan.wellCount * COSTS.developmentWell;
  if (hasRole('engineer')) {
    wellCost = Math.floor(wellCost * (1 - getRoleBonus('drillingCostReduction')));
  }

  // Calculate facility totals for display
  const facilityEntries = Object.entries(FACILITY_OPTIONS);
  const requiredFacilities = facilityEntries.filter(([, f]) => f.required);
  const allRequiredSelected = requiredFacilities.every(([id]) => selectedFacilities[id]);

  let totalFacilityCAPEX = 0;
  let combinedOpexMod = 0;
  let combinedProdMod = 0;
  Object.entries(selectedFacilities).forEach(([facilityId, tierId]) => {
    const f = FACILITY_OPTIONS[facilityId];
    if (!f) return;
    const t = f.tiers[tierId];
    if (!t) return;
    totalFacilityCAPEX += applyGeoCost(t.cost, 'facility');
    combinedOpexMod += t.opexModifier;
    combinedProdMod += t.productionModifier;
  });

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-4">H1 Year 3: Field Construction</h3>

      {/* Development Plan Summary */}
      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
        <h4 className="font-bold mb-2">Development Plan Sanctioned</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-400">Production Wells:</span>
            <div className="font-bold">{plan.wellCount}</div>
          </div>
          <div>
            <span className="text-slate-400">Target Production:</span>
            <div className="font-bold">{plan.estimatedProduction.toLocaleString()} bpd</div>
          </div>
        </div>
      </div>

      {/* FID Decisions Summary — shows what was approved at Gate 4 */}
      {fidSelections.developmentConcept && fidSelections.executionStrategy && fidSelections.financingStructure && (() => {
        const concept = FID_OPTIONS.developmentConcept.options[fidSelections.developmentConcept];
        const execution = FID_OPTIONS.executionStrategy.options[fidSelections.executionStrategy];
        const financing = FID_OPTIONS.financingStructure.options[fidSelections.financingStructure];
        return (
          <div className="bg-purple-900/20 border border-purple-600/50 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-purple-400 mb-3 text-sm">FID Decisions (Gate 4)</h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/50 rounded-lg p-2">
                <div className="text-slate-500 mb-1">Concept</div>
                <div className="font-bold text-slate-200">{concept.name}</div>
                <div className="text-purple-400 mt-1">${(concept.cost / 1e6).toFixed(0)}M</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2">
                <div className="text-slate-500 mb-1">Execution</div>
                <div className="font-bold text-slate-200">{execution.name}</div>
                {execution.capexModifier !== 0 && (
                  <div className={`mt-1 ${execution.capexModifier > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    CAPEX {execution.capexModifier > 0 ? '+' : ''}{(execution.capexModifier * 100).toFixed(0)}%
                  </div>
                )}
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2">
                <div className="text-slate-500 mb-1">Financing</div>
                <div className="font-bold text-slate-200">{financing.name}</div>
                {financing.debtRatio > 0 ? (
                  <div className="text-yellow-400 mt-1">{(financing.interestRate * 100).toFixed(0)}% interest</div>
                ) : (
                  <div className="text-emerald-400 mt-1">Equity funded</div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== PHASE 1: Well Drilling ===== */}
      {!projectData.wellsComplete && (
        <>
          <RoleSection roles="engineer">
            <button
              onClick={executeWellDrilling}
              disabled={budget < wellCost || authProps('executeWellDrilling').disabled}
              title={authProps('executeWellDrilling').title}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all"
            >
              Drill {plan.wellCount} Production Wells (${(wellCost/1e6).toFixed(1)}M)
            </button>
          </RoleSection>

          {/* Loan section if budget insufficient for wells */}
          {budget < wellCost && (() => {
            const shortfall = wellCost - budget;
            const loanAmount = Math.ceil(shortfall * 1.2);
            const baseRate = 0.12;
            const financeDiscount = hasRole('finance') ? getRoleBonus('betterFinancing') : 0;
            const effectiveRate = baseRate - financeDiscount;
            const totalRepayment = Math.floor(loanAmount * (1 + effectiveRate));
            const interestCost = totalRepayment - loanAmount;
            const assessmentComplete = Object.values(loanAssessment).filter(v => v !== null).length >= 2;

            return (
              <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-orange-400" size={20} />
                  <span className="font-bold text-orange-400">Insufficient Budget — Financing Required</span>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  Well drilling costs exceed your remaining budget. Review the loan terms and assess the risks.
                </p>

                <div className="text-xs text-slate-400 mb-4 space-y-1 bg-slate-900/50 rounded p-3">
                  <div className="font-bold text-sm text-slate-300 mb-2">Loan Terms Summary</div>
                  <div className="flex justify-between">
                    <span>Well drilling cost:</span>
                    <span className="text-red-400 font-semibold">${(wellCost/1e6).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current budget:</span>
                    <span className="text-emerald-400 font-semibold">${(budget/1e6).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shortfall:</span>
                    <span className="text-orange-400 font-semibold">${(shortfall/1e6).toFixed(1)}M</span>
                  </div>
                  <div className="border-t border-slate-700 my-2"></div>
                  <div className="flex justify-between">
                    <span>Loan amount (+ 20% buffer):</span>
                    <span className="text-yellow-400 font-semibold">${(loanAmount/1e6).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest rate:</span>
                    <span className={financeDiscount > 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                      {(effectiveRate * 100).toFixed(1)}%{financeDiscount > 0 && ' (Finance Mgr discount)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest cost:</span>
                    <span className="text-red-400 font-semibold">${(interestCost/1e6).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-slate-300">Total repayment:</span>
                    <span className="text-orange-400">${(totalRepayment/1e6).toFixed(1)}M</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 mb-4">
                  <h4 className="font-bold text-sm mb-3 text-purple-400">Team Assessment</h4>
                  <div className="mb-4">
                    <div className="text-xs text-slate-400 mb-2">1. Risk assessment for taking on this debt?</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'accept', label: 'Acceptable risk', desc: 'Revenue will cover repayment' },
                        { id: 'cautious', label: 'Cautious', desc: 'Tight margins, some risk' },
                        { id: 'reject', label: 'High risk', desc: 'Debt may jeopardize project' }
                      ].map(opt => (
                        <button key={opt.id}
                          onClick={() => dispatchSetLoanAssessment('riskAcceptance', opt.id)}
                          title={authProps('setLoanAssessment').title}
                          disabled={authProps('setLoanAssessment').disabled}
                          className={`p-2 rounded-lg border text-xs transition-all text-left ${
                            loanAssessment.riskAcceptance === opt.id
                              ? 'border-blue-400 bg-blue-900/30 text-blue-300'
                              : 'border-slate-600 hover:border-slate-500 text-slate-400'
                          }`}>
                          <div className="font-bold">{opt.label}</div>
                          <div className="text-slate-500 mt-1">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-xs text-slate-400 mb-2">2. How do you plan to service the debt?</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'production', label: 'Production revenue', desc: 'Pay from oil sales' },
                        { id: 'partner', label: 'Bring partner', desc: 'Share costs & revenue' },
                        { id: 'phased', label: 'Phased development', desc: 'Build in stages' }
                      ].map(opt => (
                        <button key={opt.id}
                          onClick={() => dispatchSetLoanAssessment('repaymentSource', opt.id)}
                          title={authProps('setLoanAssessment').title}
                          disabled={authProps('setLoanAssessment').disabled}
                          className={`p-2 rounded-lg border text-xs transition-all text-left ${
                            loanAssessment.repaymentSource === opt.id
                              ? 'border-blue-400 bg-blue-900/30 text-blue-300'
                              : 'border-slate-600 hover:border-slate-500 text-slate-400'
                          }`}>
                          <div className="font-bold">{opt.label}</div>
                          <div className="text-slate-500 mt-1">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs text-slate-400 mb-2">3. Acceptable debt-to-equity level?</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'low', label: 'Low (< 30%)', desc: 'Conservative approach' },
                        { id: 'medium', label: 'Medium (30-60%)', desc: 'Balanced leverage' },
                        { id: 'high', label: 'High (> 60%)', desc: 'Aggressive leverage' }
                      ].map(opt => (
                        <button key={opt.id}
                          onClick={() => dispatchSetLoanAssessment('debtTolerance', opt.id)}
                          title={authProps('setLoanAssessment').title}
                          disabled={authProps('setLoanAssessment').disabled}
                          className={`p-2 rounded-lg border text-xs transition-all text-left ${
                            loanAssessment.debtTolerance === opt.id
                              ? 'border-blue-400 bg-blue-900/30 text-blue-300'
                              : 'border-slate-600 hover:border-slate-500 text-slate-400'
                          }`}>
                          <div className="font-bold">{opt.label}</div>
                          <div className="text-slate-500 mt-1">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {hasRole('finance') && (
                    <div className="bg-emerald-900/20 border border-emerald-600/50 rounded-lg p-3 mt-3">
                      <div className="text-xs font-bold text-emerald-400 mb-1">Finance Manager Insight:</div>
                      <div className="text-xs text-slate-300">
                        Our negotiated rate of {(effectiveRate * 100).toFixed(1)}% saves ${((financeDiscount * loanAmount)/1e6).toFixed(1)}M in interest.
                        The project NPV of ${(plan.npv/1e6).toFixed(0)}M should cover the ${(totalRepayment/1e6).toFixed(1)}M repayment if production targets are met.
                      </div>
                    </div>
                  )}
                </div>

                <RoleSection roles="finance">
                  <button
                    onClick={secureLoan}
                    disabled={!assessmentComplete || authProps('secureLoan').disabled}
                    title={authProps('secureLoan').title}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <DollarSign size={18} />
                    {assessmentComplete ? 'Secure Project Finance Loan' : 'Complete assessment to proceed (min. 2 answers)'}
                  </button>
                </RoleSection>
              </div>
            );
          })()}
        </>
      )}

      {/* ===== PHASE 2: Facility Selection ===== */}
      {projectData.wellsComplete && !projectData.facilitiesComplete && (
        <RoleSection roles={['operations', 'engineer']} className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={20} className="text-emerald-400" />
            <span className="text-emerald-400 font-semibold">{plan.wellCount} production wells drilled</span>
          </div>

          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
            <h4 className="font-bold text-blue-400 mb-1">Select Production Facilities</h4>
            <p className="text-sm text-slate-300">
              Choose infrastructure modules for your oil field. Each facility affects construction cost (CAPEX),
              daily operating cost (OPEX), and production efficiency. Required facilities must be selected.
            </p>
          </div>

          {/* Running Total Bar */}
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-600 sticky top-0 z-10">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-400">Facility CAPEX</div>
                <div className="text-lg font-bold text-orange-400">${(totalFacilityCAPEX/1e6).toFixed(1)}M</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">OPEX Impact</div>
                <div className={`text-lg font-bold ${combinedOpexMod < 0 ? 'text-emerald-400' : combinedOpexMod > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {combinedOpexMod >= 0 ? '+' : ''}{(combinedOpexMod * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Production Impact</div>
                <div className={`text-lg font-bold ${combinedProdMod > 0 ? 'text-emerald-400' : combinedProdMod < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {combinedProdMod >= 0 ? '+' : ''}{(combinedProdMod * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 text-center mt-1">
              Budget remaining: ${(budget/1e6).toFixed(1)}M
            </div>
          </div>

          {/* Facility Cards */}
          {facilityEntries.map(([facilityId, facility]) => {
            const selectedTier = selectedFacilities[facilityId];
            return (
              <div key={facilityId} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{facility.icon}</span>
                    <div>
                      <h4 className="font-bold">{facility.name}</h4>
                      <p className="text-xs text-slate-400">{facility.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${facility.category === 'core' ? 'bg-blue-700 text-blue-200' : facility.category === 'safety' ? 'bg-red-700 text-red-200' : facility.category === 'utilities' ? 'bg-yellow-700 text-yellow-200' : 'bg-slate-600 text-slate-300'}`}>
                      {facility.category}
                    </span>
                    {facility.required && (
                      <span className="text-xs px-2 py-0.5 rounded bg-orange-700 text-orange-200">Required</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                  {Object.entries(facility.tiers).map(([tierId, tier]) => {
                    const isSelected = selectedTier === tierId;
                    const tierCost = applyGeoCost(tier.cost, 'facility');
                    return (
                      <button
                        key={tierId}
                        onClick={() => selectFacility(facilityId, tierId)}
                        title={authProps('selectFacility').title}
                        disabled={authProps('selectFacility').disabled}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-900/30'
                            : 'border-slate-600 bg-slate-700/50 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-bold text-sm">{tier.name}</div>
                          <span className={`text-xs px-2 py-0.5 rounded ${tier.badgeColor}`}>{tier.badge}</span>
                        </div>
                        <div className="text-xs text-slate-400 mb-2">{tier.description}</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Cost:</span>
                            <span className={`font-bold ${tierCost > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
                              {tierCost > 0 ? `$${(tierCost/1e6).toFixed(1)}M` : 'Free'}
                            </span>
                          </div>
                          {tier.opexModifier !== 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">OPEX:</span>
                              <span className={tier.opexModifier < 0 ? 'text-emerald-400' : 'text-red-400'}>
                                {tier.opexModifier > 0 ? '+' : ''}{(tier.opexModifier * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                          {tier.productionModifier !== 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Production:</span>
                              <span className={tier.productionModifier > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                {tier.productionModifier > 0 ? '+' : ''}{(tier.productionModifier * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>
                        {isSelected && <div className="text-xs text-emerald-400 mt-2 font-bold">Selected</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Role Insights */}
          {hasRole('operations') && (
            <div className="bg-emerald-900/20 border border-emerald-600/50 rounded-lg p-3">
              <div className="text-xs font-bold text-emerald-400 mb-1">Operations Director Insight:</div>
              <div className="text-xs text-slate-300">
                Invest in water re-injection and advanced monitoring to maximize long-term production and reduce OPEX.
                The savings compound over 10 years of production.
              </div>
            </div>
          )}
          {hasRole('engineer') && (
            <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-3">
              <div className="text-xs font-bold text-blue-400 mb-1">Drilling Engineer Insight:</div>
              <div className="text-xs text-slate-300">
                The processing plant tier directly affects how much oil we can handle.
                An advanced plant with gas turbine power gives the best efficiency per dollar.
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={confirmFacilities}
            disabled={!allRequiredSelected || authProps('confirmFacilities').disabled}
            title={authProps('confirmFacilities').title}
            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all"
          >
            {allRequiredSelected
              ? `Confirm & Commission Facilities ($${(totalFacilityCAPEX/1e6).toFixed(1)}M)`
              : 'Select all required facilities to continue'
            }
          </button>
        </RoleSection>
      )}

      {/* ===== PHASE 3: Construction Complete ===== */}
      {projectData.facilitiesComplete && (
        <div className="space-y-3">
          <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-4">
            <h4 className="font-bold text-emerald-400 mb-2">Construction Complete</h4>
            <div className="grid grid-cols-3 gap-3 text-sm text-center">
              <div>
                <div className="text-slate-400 text-xs">Facility CAPEX</div>
                <div className="font-bold text-orange-400">${(projectData.facilityInvestment/1e6).toFixed(1)}M</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">OPEX Impact</div>
                <div className={`font-bold ${projectData.facilityOpexModifier < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {projectData.facilityOpexModifier >= 0 ? '+' : ''}{(projectData.facilityOpexModifier * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">Production Impact</div>
                <div className="font-bold text-emerald-400">
                  +{(projectData.facilityProductionModifier * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={advanceWithoutGate}
            title={authProps('advanceWithoutGate').title}
            disabled={authProps('advanceWithoutGate').disabled}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            Advance to H2 Year 3
          </button>
        </div>
      )}
    </div>
  );
};

export default H1Y3Construction;
