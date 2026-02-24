import { QUARTERS } from '../constants/timeline';
import { ROLES } from '../constants/roles';
import { GEOLOGICAL_CHARACTERISTICS, DRILL_SITES } from '../constants/geology';
import { SEISMIC_PACKAGES, SEISMIC_ACQUISITION_MESSAGES, PROCESSING_WORKFLOWS, SEISMIC_CONTRACTORS, RISK_EFFECTS } from '../constants/seismic';
import { PROBABILITIES, COSTS, APPRAISAL_STRATEGIES, WELL_TEST_TYPES, FACILITY_OPTIONS, FEED_STUDY_OPTIONS, LEASE_OPTIONS, calculateRoyaltyRate, FID_OPTIONS } from '../constants/economics';
import { generateSeismicInterpretation, generateRawSeismicData } from '../utils/seismicGenerator';
import { useGame } from '../context/GameContext';
import { useRoleHelpers } from './useRoleHelpers';
import { canExecute, getAuthorityMessage } from '../multiplayer/ActionRouter';

export const useGameActions = () => {
  const {
    gameState, setGameState,
    gameMode,
    currentQuarterIndex, setCurrentQuarterIndex,
    teamComposition, setTeamComposition,
    showDecisionGate, setShowDecisionGate,
    gateDecision, setGateDecision,
    roleApprovals, setRoleApprovals,
    selectedDrillSite, setSelectedDrillSite,
    selectedSeismicPkg, setSelectedSeismicPkg,
    selectedContractor, setSelectedContractor,
    appraisalStrategy, setAppraisalStrategy,
    wellTestType, setWellTestType,
    riskAssessment, setRiskAssessment,
    additionalStudy, setAdditionalStudy,
    drillingInProgress, setDrillingInProgress,
    dryHoleHistory, setDryHoleHistory,
    seismicStep, setSeismicStep,
    seismicInProgress, setSeismicInProgress,
    rawSeismicData, setRawSeismicData,
    seismicObservations, setSeismicObservations,
    processingWorkflow, setProcessingWorkflow,
    budget, setBudget,
    totalSpent, setTotalSpent,
    revenue, setRevenue,
    projectData, setProjectData,
    wells, setWells,
    production, setProduction,
    decisions, setDecisions,
    notifications, setNotifications,
    justification, setJustification,
    selectedFacilities, setSelectedFacilities,
    feedStudy, setFeedStudy,
    loanAssessment, setLoanAssessment,
    leaseTerms, setLeaseTerms,
    fidSelections, setFidSelections,
    multiplayerState,
    actionDispatchRef,
  } = useGame();

  // Multiplayer dispatch: if we're a peer, send action to host instead of executing locally
  const isPeer = gameMode === 'multiplayer' && !multiplayerState?.isHost;

  const dispatch = (actionName, ...args) => {
    if (isPeer && actionDispatchRef?.current) {
      actionDispatchRef.current(actionName, args);
      return '__dispatched__';
    }
    return null; // execute locally
  };

  const {
    currentQuarter,
    currentGate,
    hasRole,
    getRoleBonus,
    checkGateRoleRequirements,
    getRoleApprovalCount,
  } = useRoleHelpers();

  // Authority check for multiplayer — in solo mode always returns true
  const playerRole = multiplayerState?.playerRole || null;
  const isMultiplayer = gameMode === 'multiplayer';

  const checkAuthority = (actionName, context = {}) => {
    if (!isMultiplayer) return true;
    return canExecute(playerRole, actionName, context);
  };

  const isAuthorized = (actionName, context = {}) => {
    if (!isMultiplayer) return true;
    return canExecute(playerRole, actionName, context);
  };

  const getAuthMessage = (actionName) => {
    if (!isMultiplayer) return '';
    return getAuthorityMessage(actionName);
  };

  // Helper to get geological characteristics
  const getGeoCharacteristics = () => {
    return projectData.geologicalType
      ? GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]
      : null;
  };

  // Apply geological cost multiplier
  const applyGeoCost = (baseCost, costType) => {
    const geo = getGeoCharacteristics();
    if (!geo) return baseCost;

    const multiplierMap = {
      lease: geo.leaseCostMultiplier,
      seismic: geo.seismicCostMultiplier,
      explorationWell: geo.explorationWellMultiplier,
      appraisalWell: geo.explorationWellMultiplier,
      developmentWell: geo.developmentWellMultiplier,
      facility: geo.facilityMultiplier,
      dailyOPEX: geo.dailyOPEXMultiplier
    };

    return baseCost * (multiplierMap[costType] || 1.0);
  };

  // Notifications & decisions
  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [{
      id: Date.now(),
      message,
      type,
      quarter: currentQuarter.name,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 15));
  };

  const logDecision = (action, cost, outcome, risks, approvedBy = []) => {
    setDecisions(prev => [{
      id: Date.now(),
      quarter: currentQuarter.name,
      action,
      cost,
      outcome,
      risks,
      budget: budget - cost,
      timestamp: new Date().toLocaleString(),
      justification,
      approvedBy
    }, ...prev]);
    setJustification('');
  };

  const calculateProbability = () => {
    const seismicQuality = projectData.seismicQuality;
    const geologicalType = projectData.geologicalType;

    if (!seismicQuality || !geologicalType) return 0;

    const seismicProb = PROBABILITIES.seismic[seismicQuality] || 0;
    const geoProb = PROBABILITIES.geological[geologicalType] || 0;
    return Math.min(0.95, (seismicProb + geoProb) / 2 + (Math.random() * 0.1 - 0.05));
  };

  const calculateNPV = (reserves, wellCount, dailyProd) => {
    const years = 20;
    const geo = getGeoCharacteristics();

    const annualProd = dailyProd * 365;
    const oilPrice = COSTS.oilPrice + (geo ? geo.oilPriceDiscount : 0);

    // Royalty deduction
    const royaltyOption = leaseTerms.royaltyTerms
      ? LEASE_OPTIONS.royaltyTerms.options[leaseTerms.royaltyTerms]
      : null;
    const royaltyRate = calculateRoyaltyRate(royaltyOption, oilPrice);

    // Fixed OPEX (annual)
    let fixedOPEX = COSTS.dailyOPEX * 365;
    if (geo) fixedOPEX *= geo.dailyOPEXMultiplier;

    // Variable OPEX (annual, at peak)
    let variableOPEX = dailyProd * COSTS.opexPerBarrel * 365;

    let totalOPEX = fixedOPEX + variableOPEX;
    if (hasRole('operations')) {
      totalOPEX *= (1 - getRoleBonus('operatingCostReduction'));
    }
    if (hasRole('finance')) {
      totalOPEX *= (1 - getRoleBonus('budgetEfficiency'));
    }

    let devCost = wellCount * COSTS.developmentWell + COSTS.facility;
    if (geo) {
      devCost = wellCount * applyGeoCost(COSTS.developmentWell, 'developmentWell') +
                applyGeoCost(COSTS.facility, 'facility');
    }

    if (hasRole('engineer')) {
      devCost *= (1 - getRoleBonus('drillingCostReduction'));
    }

    const baseDeclineRate = geo ? geo.declineRateAnnual : 0.05;
    const declineRate = baseDeclineRate + (projectData.riskDeclineBonus || 0);

    // Apply risk OPEX modifier
    if (projectData.riskOpexModifier) {
      totalOPEX *= (1 + projectData.riskOpexModifier);
    }

    let npv = -totalSpent - devCost;
    for (let year = 1; year <= years; year++) {
      const decline = Math.pow(1 - declineRate, year);
      const declinedRevenue = annualProd * oilPrice * (1 - royaltyRate) * decline;
      // Fixed OPEX stays constant, variable scales with decline
      let declinedOPEX = fixedOPEX + variableOPEX * decline;
      if (projectData.riskOpexModifier) declinedOPEX *= (1 + projectData.riskOpexModifier);
      let adjustedOPEX = declinedOPEX;
      if (hasRole('operations')) adjustedOPEX *= (1 - getRoleBonus('operatingCostReduction'));
      if (hasRole('finance')) adjustedOPEX *= (1 - getRoleBonus('budgetEfficiency'));

      const operatingProfit = declinedRevenue - adjustedOPEX;
      const tax = operatingProfit > 0 ? operatingProfit * COSTS.taxRate : 0;
      const netCash = operatingProfit - tax;
      npv += netCash / Math.pow(1 + COSTS.discountRate, year);
    }

    if (geo) {
      npv -= geo.abandonmentCost / Math.pow(1 + COSTS.discountRate, years);
    }

    return npv;
  };

  // Start game
  const startGame = () => {
    if (dispatch('startGame') === '__dispatched__') return;
    if (teamComposition.length === 0) {
      addNotification('Please select at least one team role!', 'error');
      return;
    }
    setGameState('playing');
    setShowDecisionGate(false);
    addNotification(`Project launched! Current period: ${currentQuarter.name}`, 'success');
    addNotification('Complete Q1 activities, then proceed to Decision Gate 1', 'info');
  };

  const toggleRole = (roleId) => {
    setTeamComposition(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  const toggleRoleApproval = (roleId) => {
    if (dispatch('toggleRoleApproval', roleId) === '__dispatched__') return;
    const currentGateId = currentQuarter?.gate;
    if (!currentGateId) return;

    setRoleApprovals(prev => ({
      ...prev,
      [currentGateId]: {
        ...(prev[currentGateId] || {}),
        [roleId]: !(prev[currentGateId]?.[roleId] || false)
      }
    }));
  };

  // Quarter actions
  const selectGeological = (type) => {
    if (dispatch('selectGeological', type) === '__dispatched__') return;
    setProjectData(prev => ({ ...prev, geologicalType: type }));
    addNotification(`Geological area selected: ${type.replace('_', ' ')}`, 'info');
  };

  const secureLease = () => {
    if (dispatch('secureLease') === '__dispatched__') return;
    const lt = leaseTerms;

    // Check all terms are selected
    if (!lt.licenseType || !lt.environmentalScope || !lt.blockSize || !lt.royaltyTerms) {
      addNotification('Please complete all lease term selections first!', 'error');
      return;
    }

    const lic = LEASE_OPTIONS.licenseType.options[lt.licenseType];
    const env = LEASE_OPTIONS.environmentalScope.options[lt.environmentalScope];
    const blk = LEASE_OPTIONS.blockSize.options[lt.blockSize];
    const roy = LEASE_OPTIONS.royaltyTerms.options[lt.royaltyTerms];

    const baseCost = lic.cost + env.cost + blk.cost + blk.permitCost + roy.cost;
    const cost = applyGeoCost(baseCost, 'lease');

    if (budget < cost) {
      addNotification('Insufficient budget!', 'error');
      return;
    }
    setBudget(prev => prev - cost);
    setTotalSpent(prev => prev + cost);
    setProjectData(prev => ({
      ...prev,
      leaseSecured: true,
      blockReserveMultiplier: blk.reserveMultiplier,
      environmentalDelayRisk: env.delayRisk,
      environmentalDelayDays: env.delayDays,
      licenseRenegotiable: lic.renegotiable || false,
      partnerWI: lic.partnerWI || 0,
    }));

    const geo = getGeoCharacteristics();
    const costNote = geo && geo.leaseCostMultiplier !== 1.0
      ? ` (${geo.leaseCostMultiplier}x for ${geo.name})`
      : '';

    addNotification(`Lease secured and permits obtained ($${(cost/1e6).toFixed(1)}M${costNote})`, 'success');
    logDecision(
      'Secure Lease & Permits',
      cost,
      `License: ${lic.name}, EIA: ${env.name}, Block: ${blk.name}, Royalty: ${roy.name}`,
      `Royalty: ${roy.type === 'sliding' ? '8-20%' : (roy.rate * 100) + '%'}, Env delay risk: ${(env.delayRisk * 100).toFixed(0)}%`
    );
  };

  const revokeLease = () => {
    if (dispatch('revokeLease') === '__dispatched__') return;
    if (!projectData.leaseSecured) return;

    // Recalculate cost from lease terms
    const lt = leaseTerms;
    const lic = LEASE_OPTIONS.licenseType.options[lt.licenseType];
    const env = LEASE_OPTIONS.environmentalScope.options[lt.environmentalScope];
    const blk = LEASE_OPTIONS.blockSize.options[lt.blockSize];
    const roy = LEASE_OPTIONS.royaltyTerms.options[lt.royaltyTerms];
    const baseCost = (lic?.cost || 0) + (env?.cost || 0) + (blk?.cost || 0) + (blk?.permitCost || 0) + (roy?.cost || 0);
    const cost = applyGeoCost(baseCost, 'lease');

    setBudget(prev => prev + cost);
    setTotalSpent(prev => prev - cost);
    setProjectData(prev => ({
      ...prev,
      leaseSecured: false,
      geologicalType: null,
      blockReserveMultiplier: undefined,
      environmentalDelayRisk: undefined,
      environmentalDelayDays: undefined,
      licenseRenegotiable: undefined,
      partnerWI: undefined,
    }));
    setLeaseTerms({ licenseType: null, environmentalScope: null, blockSize: null, royaltyTerms: null });
    addNotification('Lease revoked. Budget refunded. You can select a different area.', 'info');
  };

  const startSeismicAcquisition = (packageType) => {
    if (dispatch('startSeismicAcquisition', packageType) === '__dispatched__') return;
    const alreadyPaid = decisions.some(d => d.action.includes('FID 1'));
    const pkg = SEISMIC_PACKAGES[packageType];
    const baseCost = pkg.cost + pkg.processingCost;
    const cost = alreadyPaid ? 0 : applyGeoCost(baseCost, 'seismic');

    if (!alreadyPaid && budget < cost) {
      addNotification('Insufficient budget for seismic survey!', 'error');
      return;
    }

    const geoType = projectData.geologicalType;
    if (!geoType) {
      addNotification('Error: Geological type not selected!', 'error');
      return;
    }

    if (!alreadyPaid) {
      setBudget(prev => prev - cost);
      setTotalSpent(prev => prev + cost);
    }

    // Environmental delay risk from lease terms
    const envDelayRisk = projectData.environmentalDelayRisk || 0;
    if (envDelayRisk > 0 && Math.random() < envDelayRisk) {
      const delayCost = applyGeoCost(500000, 'lease');
      setBudget(prev => prev - delayCost);
      setTotalSpent(prev => prev + delayCost);
      addNotification(`Regulatory delay! Environmental compliance issue added $${(delayCost/1e6).toFixed(1)}M to costs.`, 'warning');
    }

    setProjectData(prev => ({
      ...prev,
      seismicPackage: packageType,
      seismicQuality: pkg.quality
    }));

    setSeismicStep(1);
    const messages = SEISMIC_ACQUISITION_MESSAGES[packageType] || SEISMIC_ACQUISITION_MESSAGES.standard_3d;
    setSeismicInProgress({ phase: 'acquisition', message: messages[0], progress: 0 });

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const msgIndex = Math.min(step, messages.length - 1);
      setSeismicInProgress(prev => prev ? {
        ...prev,
        progress: Math.min(step * 10, 90),
        message: messages[msgIndex]
      } : prev);
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      setSeismicInProgress(prev => prev ? {
        ...prev,
        progress: 100,
        message: 'Acquisition complete — data ready for review'
      } : prev);

      setTimeout(() => {
        const rawData = generateRawSeismicData(packageType, geoType);
        setRawSeismicData(rawData);

        let seismicProb = pkg.qualityScore;
        if (selectedContractor && SEISMIC_CONTRACTORS[selectedContractor]) {
          seismicProb += SEISMIC_CONTRACTORS[selectedContractor].qualityMod;
        }
        const geoProb = PROBABILITIES.geological[geoType] || 0;
        if (hasRole('geologist')) {
          seismicProb += getRoleBonus('seismicQualityBoost');
        }
        const combinedProb = Math.min(0.95, (seismicProb + geoProb) / 2 + (Math.random() * 0.1 - 0.05));
        const interpretation = generateSeismicInterpretation(packageType, geoType);

        setProjectData(prev => ({
          ...prev,
          seismicInterpretation: interpretation,
          probabilityOfSuccess: combinedProb
        }));

        const geo = getGeoCharacteristics();
        const costMsg = alreadyPaid
          ? '(already funded at Gate 1)'
          : geo && geo.seismicCostMultiplier !== 1.0
            ? `($${(cost/1e6).toFixed(1)}M - ${geo.seismicCostMultiplier}x for ${geo.name})`
            : `($${(cost/1e6).toFixed(1)}M)`;
        addNotification(`Seismic ${pkg.name} acquired ${costMsg}`, 'success');
        addNotification('Raw field data ready for your review. Examine the seismic section below.', 'info');
        if (hasRole('geologist')) {
          addNotification('Geologist expertise: Enhanced seismic interpretation (+10%)', 'success');
        }

        setSeismicInProgress(null);
        setSeismicStep(2);
      }, 500);
    }, 4000);
  };

  const startSeismicProcessing = (workflowId) => {
    if (dispatch('startSeismicProcessing', workflowId) === '__dispatched__') return;
    const workflow = PROCESSING_WORKFLOWS[workflowId];

    const processingCost = applyGeoCost(workflow.cost || 0, 'seismic');
    if (processingCost > 0) {
      if (budget < processingCost) {
        addNotification(`Insufficient budget for ${workflow.name}! Need $${(processingCost/1e6).toFixed(1)}M`, 'error');
        return;
      }
      setBudget(prev => prev - processingCost);
      setTotalSpent(prev => prev + processingCost);
    }

    setProcessingWorkflow(workflowId);
    setSeismicStep(4);

    const messages = workflow.messages;
    setSeismicInProgress({ phase: 'processing', message: messages[0], progress: 0 });

    let step = 0;
    const totalSteps = messages.length;
    const interval = setInterval(() => {
      step++;
      const msgIndex = Math.min(step, messages.length - 1);
      setSeismicInProgress(prev => prev ? {
        ...prev,
        progress: Math.min(Math.floor((step / totalSteps) * 90), 90),
        message: messages[msgIndex]
      } : prev);
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setSeismicInProgress(prev => prev ? {
        ...prev,
        progress: 100,
        message: 'Processing complete — results ready'
      } : prev);

      setTimeout(() => {
        const multiplier = workflow.qualityMultiplier;
        setProjectData(prev => {
          const interp = { ...prev.seismicInterpretation };
          interp.structuralConfidence = Math.min(0.95, interp.structuralConfidence * multiplier);
          interp.volumetricConfidence = Math.min(0.95, interp.volumetricConfidence * multiplier);
          interp.fluidConfidence = Math.min(0.95, interp.fluidConfidence * multiplier);
          return {
            ...prev,
            seismicInterpretation: interp,
            seismicComplete: true
          };
        });

        addNotification(`${workflow.name} complete ($${(processingCost/1e6).toFixed(1)}M). Seismic processing finished.`, 'info');

        setSeismicInProgress(null);
        setSeismicStep(5);
      }, 500);
    }, totalSteps * 500 + 1000);
  };

  const runAdditionalStudy = () => {
    if (dispatch('runAdditionalStudy') === '__dispatched__') return;
    const cost = 2000000;
    if (budget < cost) {
      addNotification('Insufficient budget for additional study!', 'error');
      return;
    }

    setBudget(prev => prev - cost);
    setTotalSpent(prev => prev + cost);
    setAdditionalStudy(true);

    setProjectData(prev => {
      const interp = { ...prev.seismicInterpretation };
      interp.structuralConfidence = Math.min(0.95, interp.structuralConfidence + 0.15);
      interp.volumetricConfidence = Math.min(0.95, interp.volumetricConfidence + 0.12);
      interp.fluidConfidence = Math.min(0.95, interp.fluidConfidence + 0.10);
      if (!interp.dhiPresent && Math.random() < 0.3) {
        interp.dhiPresent = true;
        interp.dhiTypes = ['Amplitude anomaly (reprocessed)'];
      }
      // Remove first risk that can be mitigated by additional study
      if (interp.risks.length > 0) {
        const idx = interp.risks.findIndex(r => {
          const effect = RISK_EFFECTS[r];
          return effect && effect.mitigatedBy === 'additionalStudy';
        });
        if (idx >= 0) {
          interp.risks = [...interp.risks.slice(0, idx), ...interp.risks.slice(idx + 1)];
        }
      }
      const newProb = Math.min(0.95, prev.probabilityOfSuccess + 0.05);
      return { ...prev, seismicInterpretation: interp, probabilityOfSuccess: newProb };
    });

    addNotification('Additional seismic reprocessing complete. Confidence levels improved (+5% probability).', 'success');
    logDecision('Additional Seismic Study', cost, 'Confidence improved', 'Reduced uncertainty');
  };

  const obtainDrillingPermit = () => {
    if (dispatch('obtainDrillingPermit') === '__dispatched__') return;

    // Fault seal mitigation: favorable assessment + geologist → remove 'Fault seal uncertainty'
    if (riskAssessment === 'favorable' && hasRole('geologist')) {
      setProjectData(prev => {
        const interp = prev.seismicInterpretation ? { ...prev.seismicInterpretation } : null;
        if (interp && interp.risks) {
          const idx = interp.risks.indexOf('Fault seal uncertainty');
          if (idx >= 0) {
            interp.risks = [...interp.risks.slice(0, idx), ...interp.risks.slice(idx + 1)];
            addNotification('Geologist analysis + favorable assessment: Fault seal risk mitigated', 'success');
          }
        }
        return { ...prev, drillingPermit: true, seismicInterpretation: interp || prev.seismicInterpretation };
      });
    } else {
      setProjectData(prev => ({ ...prev, drillingPermit: true }));
    }

    addNotification('Drilling permit approved', 'success');
  };

  const drillExplorationWell = (alreadyPaid = false) => {
    if (dispatch('drillExplorationWell', alreadyPaid) === '__dispatched__') return;
    const baseCost = COSTS.explorationWell;
    let cost = applyGeoCost(baseCost, 'explorationWell');

    if (hasRole('engineer') && !alreadyPaid) {
      const reduction = getRoleBonus('drillingCostReduction');
      cost = cost * (1 - reduction);
      addNotification(`Engineer expertise: Drilling cost optimized (-${(reduction*100).toFixed(0)}%)`, 'success');
    }

    if (!alreadyPaid) {
      if (budget < cost) {
        addNotification('Insufficient budget!', 'error');
        return false;
      }

      setBudget(prev => prev - cost);
      setTotalSpent(prev => prev + cost);
    }

    let prob = projectData.probabilityOfSuccess || calculateProbability();

    if (selectedDrillSite && DRILL_SITES[selectedDrillSite]) {
      const siteData = DRILL_SITES[selectedDrillSite];
      prob += siteData.probMod;
      addNotification('Drilling at ' + siteData.label + ' (probability: ' + (siteData.probMod >= 0 ? '+' : '') + (siteData.probMod * 100).toFixed(0) + '%)', 'info');
    }

    if (hasRole('geologist')) {
      prob += getRoleBonus('probabilityBoost');
      prob = Math.min(0.95, prob);
    }

    // Apply seismic risk penalties
    const interp = projectData.seismicInterpretation;
    let riskOpexMod = 0, riskProdMod = 0, riskDeclineBonus = 0;
    if (interp && interp.risks && interp.risks.length > 0) {
      let totalPenalty = 0;
      interp.risks.forEach(riskName => {
        const effect = RISK_EFFECTS[riskName];
        if (effect) {
          totalPenalty += effect.probPenalty;
          if (effect.opexModifier) riskOpexMod += effect.opexModifier;
          if (effect.productionModifier) riskProdMod += effect.productionModifier;
          if (effect.declineRateBonus) riskDeclineBonus += effect.declineRateBonus;
        }
      });
      prob += totalPenalty;
      if (totalPenalty !== 0) {
        addNotification(`Seismic risks (${interp.risks.length}): ${(totalPenalty*100).toFixed(0)}% probability adjustment`, 'warning');
      }
    }
    prob = Math.max(0.01, prob);

    const success = Math.random() < prob;

    if (success) {
      const geo = getGeoCharacteristics();

      const minReserves = geo ? geo.reserveRangeMin : 10000000;
      const maxReserves = geo ? geo.reserveRangeMax : 60000000;
      const blockMult = projectData.blockReserveMultiplier || 1.0;
      let reserves = Math.floor(Math.random() * (maxReserves - minReserves) + minReserves) * blockMult;

      if (hasRole('geologist')) {
        const accuracyBonus = getRoleBonus('reserveAccuracy');
        const variation = (1 - accuracyBonus) * 0.3;
        reserves = reserves * (1 + (Math.random() * variation * 2 - variation));
      }

      // Apply risk effects to reserves
      if (interp && interp.risks) {
        interp.risks.forEach(riskName => {
          const effect = RISK_EFFECTS[riskName];
          if (effect && effect.reserveModifier) {
            reserves = Math.floor(reserves * (1 + effect.reserveModifier));
          }
        });
      }

      let quality = 'medium';
      if (geo && geo.oilQualityWeights) {
        const rand = Math.random();
        const weights = geo.oilQualityWeights;
        if (rand < weights.heavy) quality = 'heavy';
        else if (rand < weights.heavy + weights.medium) quality = 'medium';
        else quality = 'light';
      } else {
        quality = Math.random() > 0.5 ? 'light' : Math.random() > 0.5 ? 'medium' : 'heavy';
      }

      setProjectData(prev => ({
        ...prev,
        oilDiscovered: true,
        reserveEstimate: Math.floor(reserves),
        oilQuality: quality,
        riskOpexModifier: riskOpexMod,
        riskProductionModifier: riskProdMod,
        riskDeclineBonus: riskDeclineBonus,
      }));
      setWells(prev => ({ ...prev, exploration: prev.exploration + 1, successful: prev.successful + 1 }));

      const geoNote = geo ? ` (${geo.name} typical range)` : '';
      addNotification(`OIL DISCOVERED! Estimated ${(reserves/1e6).toFixed(1)}M barrels of ${quality} crude${geoNote}`, 'success');
      return true;
    } else {
      setWells(prev => ({ ...prev, exploration: prev.exploration + 1, dry: prev.dry + 1 }));
      setProjectData(prev => ({ ...prev, oilDiscovered: false }));
      addNotification('Dry hole - no commercial oil found. Consider your options.', 'warning');
      setGameState('dry_hole');
      return false;
    }
  };

  const drillAppraisalWells = () => {
    if (dispatch('drillAppraisalWells') === '__dispatched__') return;
    if (!appraisalStrategy) {
      addNotification('Please select an appraisal strategy first!', 'error');
      return;
    }
    const strat = APPRAISAL_STRATEGIES[appraisalStrategy];
    if (!strat) return;

    let totalCost = applyGeoCost(strat.baseCost, 'appraisalWell');
    if (feedStudy && FEED_STUDY_OPTIONS[feedStudy]) {
      totalCost *= (1 + FEED_STUDY_OPTIONS[feedStudy].appraisalCostMod);
    }
    if (strat.includesWellTest && wellTestType) {
      totalCost += WELL_TEST_TYPES[wellTestType]?.cost || 0;
    }
    if (hasRole('engineer')) {
      totalCost *= (1 - getRoleBonus('drillingCostReduction'));
    }

    if (budget < totalCost) {
      addNotification('Insufficient budget for appraisal program!', 'error');
      return;
    }

    setBudget(prev => prev - totalCost);
    setTotalSpent(prev => prev + totalCost);
    setWells(prev => ({ ...prev, appraisal: strat.wells }));

    let range = strat.uncertaintyRange;
    if (feedStudy && FEED_STUDY_OPTIONS[feedStudy]) {
      range *= (1 - FEED_STUDY_OPTIONS[feedStudy].uncertaintyReduction);
    }
    if (strat.includesWellTest && wellTestType) {
      range -= WELL_TEST_TYPES[wellTestType]?.accuracyBonus || 0;
      range = Math.max(0.03, range);
    }
    if (hasRole('geologist')) {
      range *= (1 - getRoleBonus('reserveAccuracy') * 0.5);
    }
    if (hasRole('engineer')) {
      range *= 0.9;
    }

    const refinement = 1 + (Math.random() * range * 2 - range);
    const p50 = Math.floor(projectData.reserveEstimate * refinement);
    const p10 = Math.floor(p50 * (1 - range));
    const p90 = Math.floor(p50 * (1 + range));

    setProjectData(prev => ({
      ...prev,
      reserveEstimate: p50,
      appraisalComplete: true,
      appraisalStrategy: appraisalStrategy,
      appraisalWellTest: wellTestType,
      appraisalP10: p10,
      appraisalP50: p50,
      appraisalP90: p90,
    }));

    addNotification(`Appraisal complete: ${strat.name} (${strat.wells} wells). Reserves refined to ${(p50/1e6).toFixed(1)}M bbl (P10: ${(p10/1e6).toFixed(1)}M, P90: ${(p90/1e6).toFixed(1)}M)`, 'success');
  };

  const approveDevelopmentPlan = (wellCount) => {
    if (dispatch('approveDevelopmentPlan', wellCount) === '__dispatched__') return;
    const devCost = wellCount * COSTS.developmentWell + COSTS.facility;
    const estimatedProd = wellCount * 2000;
    const npv = calculateNPV(projectData.reserveEstimate, wellCount, estimatedProd);

    setProjectData(prev => ({
      ...prev,
      costEstimate: true,
      developmentPlan: {
        wellCount,
        estimatedCost: devCost,
        estimatedProduction: estimatedProd,
        npv
      }
    }));

    addNotification(`Development plan approved: ${wellCount} wells, NPV: $${(npv/1e6).toFixed(1)}M`, 'success');
  };

  const secureLoan = () => {
    if (dispatch('secureLoan') === '__dispatched__') return;
    const plan = projectData.developmentPlan;
    if (!plan) return;

    let cost = plan.estimatedCost;
    if (hasRole('engineer')) {
      cost = cost * (1 - getRoleBonus('drillingCostReduction'));
    }

    const shortfall = cost - budget;
    if (shortfall <= 0) {
      addNotification('Budget is sufficient — no loan needed.', 'info');
      return;
    }

    const loanAmount = Math.ceil(shortfall * 1.2);
    let interestRate = 0.12;

    if (hasRole('finance')) {
      interestRate -= getRoleBonus('betterFinancing');
      addNotification(`Finance Manager: Negotiated better loan terms (${(interestRate * 100).toFixed(1)}% vs 12%)`, 'success');
    }

    const totalRepayment = Math.floor(loanAmount * (1 + interestRate));

    const loanInterestAmount = totalRepayment - loanAmount;

    setBudget(prev => prev + loanAmount);
    setTotalSpent(prev => prev + loanInterestAmount);

    // Store loan info for display during production
    setProjectData(prev => ({
      ...prev,
      loanAmount: (prev.loanAmount || 0) + loanAmount,
      loanInterest: (prev.loanInterest || 0) + loanInterestAmount,
      loanSource: prev.loanSource || 'h1y3',
    }));

    addNotification(
      `Project finance secured: $${(loanAmount/1e6).toFixed(1)}M loan at ${(interestRate*100).toFixed(1)}% interest. Repayment: $${(totalRepayment/1e6).toFixed(1)}M`,
      'success'
    );
    logDecision(
      'Secure Project Finance Loan',
      loanInterestAmount,
      `Loan: $${(loanAmount/1e6).toFixed(1)}M, Interest: $${(loanInterestAmount/1e6).toFixed(1)}M`,
      'Debt increases project risk, reduces NPV'
    );
  };

  // Phase 1: Drill production wells only
  const executeWellDrilling = () => {
    if (dispatch('executeWellDrilling') === '__dispatched__') return;
    const plan = projectData.developmentPlan;
    if (!plan) return;

    let wellCost = plan.wellCount * COSTS.developmentWell;

    // Apply execution strategy modifier from FID
    if (projectData.executionCapexModifier) {
      wellCost *= (1 + projectData.executionCapexModifier);
    }

    if (hasRole('engineer')) {
      const reduction = getRoleBonus('drillingCostReduction');
      wellCost = Math.floor(wellCost * (1 - reduction));
      addNotification(`Engineer: Drilling costs optimized (-${(reduction*100).toFixed(0)}%)`, 'success');
    }

    if (budget < wellCost) {
      addNotification('Insufficient budget for well drilling!', 'error');
      return;
    }

    setBudget(prev => prev - wellCost);
    setTotalSpent(prev => prev + wellCost);
    setWells(prev => ({ ...prev, production: plan.wellCount }));
    setProjectData(prev => ({ ...prev, wellsComplete: true }));

    addNotification(`Well drilling complete! ${plan.wellCount} production wells ($${(wellCost/1e6).toFixed(1)}M)`, 'success');
    logDecision('Drill Production Wells', wellCost, `${plan.wellCount} wells drilled`, 'Well performance risk');
  };

  // Phase 2: Select/replace individual facility
  const selectFacility = (facilityId, tierId) => {
    if (dispatch('selectFacility', facilityId, tierId) === '__dispatched__') return;
    const facilityDef = FACILITY_OPTIONS[facilityId];
    if (!facilityDef) return;
    const tierDef = facilityDef.tiers[tierId];
    if (!tierDef) return;

    let cost = applyGeoCost(tierDef.cost, 'facility');
    if (feedStudy && FEED_STUDY_OPTIONS[feedStudy]) {
      cost *= (1 + FEED_STUDY_OPTIONS[feedStudy].costOverrunRisk);
    }

    // If replacing a previous selection, refund it
    const prevTierId = selectedFacilities[facilityId];
    let refund = 0;
    if (prevTierId) {
      const prevTierDef = facilityDef.tiers[prevTierId];
      refund = applyGeoCost(prevTierDef.cost, 'facility');
      if (feedStudy && FEED_STUDY_OPTIONS[feedStudy]) {
        refund *= (1 + FEED_STUDY_OPTIONS[feedStudy].costOverrunRisk);
      }
    }

    const netCost = cost - refund;
    if (netCost > 0 && budget < netCost) {
      addNotification(`Insufficient budget for ${facilityDef.name}!`, 'error');
      return;
    }

    setBudget(prev => prev - netCost);
    setTotalSpent(prev => prev + netCost);
    setSelectedFacilities(prev => ({ ...prev, [facilityId]: tierId }));

    addNotification(`${facilityDef.name}: ${tierDef.name} selected ($${(cost/1e6).toFixed(1)}M)`, 'info');
  };

  // Phase 3: Confirm all facilities and set production
  const confirmFacilities = () => {
    if (dispatch('confirmFacilities') === '__dispatched__') return;
    // Check all required facilities are selected
    const requiredFacilities = Object.values(FACILITY_OPTIONS).filter(f => f.required);
    const missingRequired = requiredFacilities.filter(f => !selectedFacilities[f.id]);
    if (missingRequired.length > 0) {
      addNotification(`Missing required: ${missingRequired.map(f => f.name).join(', ')}`, 'error');
      return;
    }

    // Calculate combined modifiers
    let totalFacilityCost = 0;
    let combinedOpexMod = 0;
    let combinedProdMod = 0;
    let hasSafetyCert = false;

    const feedCostMod = feedStudy && FEED_STUDY_OPTIONS[feedStudy]
      ? FEED_STUDY_OPTIONS[feedStudy].costOverrunRisk : 0;

    Object.entries(selectedFacilities).forEach(([facilityId, tierId]) => {
      const facilityDef = FACILITY_OPTIONS[facilityId];
      if (!facilityDef) return;
      const tierDef = facilityDef.tiers[tierId];
      if (!tierDef) return;
      totalFacilityCost += applyGeoCost(tierDef.cost, 'facility') * (1 + feedCostMod);
      combinedOpexMod += tierDef.opexModifier;
      combinedProdMod += tierDef.productionModifier;
      if (tierDef.certifiesSafety) hasSafetyCert = true;
    });

    // Apply FID concept + execution modifiers
    combinedOpexMod += projectData.conceptOpexModifier || 0;
    combinedProdMod += projectData.conceptProductionModifier || 0;
    combinedProdMod += projectData.executionProductionModifier || 0;

    // Calculate daily production with role bonuses + facility bonus
    let dailyProd = projectData.developmentPlan.estimatedProduction;

    if (hasRole('operations')) {
      const boost = getRoleBonus('productionOptimization');
      dailyProd = Math.floor(dailyProd * (1 + boost));
      addNotification(`Operations: Production optimized (+${(boost*100).toFixed(0)}%)`, 'success');
    }

    if (hasRole('engineer')) {
      const boost = getRoleBonus('wellPerformanceBoost');
      dailyProd = Math.floor(dailyProd * (1 + boost));
      addNotification(`Engineer: Well productivity enhanced (+${(boost*100).toFixed(0)}%)`, 'success');
    }

    // Apply facility production modifier
    dailyProd = Math.floor(dailyProd * (1 + combinedProdMod));

    // Apply risk-based production modifier (e.g., compartmentalization)
    if (projectData.riskProductionModifier) {
      const riskProdMod = projectData.riskProductionModifier;
      dailyProd = Math.floor(dailyProd * (1 + riskProdMod));
      if (riskProdMod !== 0) {
        addNotification(`Risk factor impact on production: ${(riskProdMod*100).toFixed(0)}%`, 'warning');
      }
    }

    setProduction(prev => ({ ...prev, daily: dailyProd }));
    setProjectData(prev => ({
      ...prev,
      facilitiesComplete: true,
      safetyCertified: hasSafetyCert,
      proceduresApproved: true,
      facilityInvestment: totalFacilityCost,
      facilityOpexModifier: combinedOpexMod,
      facilityProductionModifier: combinedProdMod,
    }));

    addNotification(
      `Facilities commissioned! CAPEX: $${(totalFacilityCost/1e6).toFixed(1)}M | Production: ${dailyProd.toLocaleString()} bpd | OPEX: ${combinedOpexMod >= 0 ? '+' : ''}${(combinedOpexMod*100).toFixed(0)}%`,
      'success'
    );
    logDecision(
      'Commission Facilities',
      0,
      `${Object.keys(selectedFacilities).length} modules. OPEX: ${(combinedOpexMod*100).toFixed(0)}%, Prod: +${(combinedProdMod*100).toFixed(0)}%`,
      'Facility performance risk'
    );
  };

  // Decision gate handling
  const evaluateGate = () => {
    if (!currentGate) return { canProceed: true, missing: [] };

    const missing = [];
    for (const req of currentGate.requirements) {
      if (req.key === 'budgetCheck') {
        if (budget < req.amount) missing.push(`Budget insufficient (need $${(req.amount/1e6).toFixed(1)}M)`);
      } else if (req.key === 'probabilityCalculated') {
        if (projectData.probabilityOfSuccess === 0) missing.push('Probability not calculated');
      } else if (req.key === 'preliminaryNPV') {
        const npv = calculateNPV(projectData.reserveEstimate || 0, 5, 10000);
        if (npv < req.threshold) missing.push('NPV does not meet threshold');
      } else if (req.key === 'reservesEstimated') {
        if (!projectData.reserveEstimate || projectData.reserveEstimate === 0) missing.push('Reserves not estimated');
      } else if (req.key === 'npvApproved') {
        if (!projectData.developmentPlan || projectData.developmentPlan.npv < req.threshold) {
          missing.push(`NPV below hurdle rate (need $${(req.threshold/1e6).toFixed(0)}M)`);
        }
      } else if (!projectData[req.key]) {
        missing.push(req.item);
      }
    }

    if (currentQuarter.gate === 'GATE_1') {
      if (!selectedSeismicPkg) {
        missing.push('Seismic package not selected');
      }
      if (!selectedContractor) {
        missing.push('Seismic contractor not selected');
      }
    }

    if (currentQuarter.gate === 'GATE_2' && !selectedDrillSite) {
      missing.push('Drill site location not selected (use the map above)');
    }

    if (currentQuarter.gate === 'GATE_3' && !feedStudy) {
      missing.push('FEED study scope not selected');
    }

    if (currentQuarter.gate === 'GATE_4') {
      if (!fidSelections.developmentConcept) missing.push('Development concept not selected');
      if (!fidSelections.executionStrategy) missing.push('Execution strategy not selected');
      if (!fidSelections.financingStructure) missing.push('Financing structure not selected');
    }

    return { canProceed: missing.length === 0, missing };
  };

  // Dry Hole Recovery Options
  const drillAnotherWell = () => {
    if (dispatch('drillAnotherWell') === '__dispatched__') return;
    const baseCost = COSTS.explorationWell;
    let cost = applyGeoCost(baseCost, 'explorationWell');

    if (hasRole('engineer')) {
      const reduction = getRoleBonus('drillingCostReduction');
      cost = cost * (1 - reduction);
    }

    if (budget < cost) {
      addNotification('Insufficient budget for another exploration well!', 'error');
      return;
    }

    setDrillingInProgress({ type: 'solo', message: 'Drilling exploration well...', progress: 0 });

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDrillingInProgress(prev => prev ? { ...prev, progress: Math.min(step * 10, 90), message: step < 4 ? 'Setting up rig...' : step < 7 ? 'Drilling in progress...' : 'Analyzing core samples...' } : prev);
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setDrillingInProgress(prev => prev ? { ...prev, progress: 100, message: 'Evaluating results...' } : prev);

      setTimeout(() => {
        setBudget(prev => prev - cost);
        setTotalSpent(prev => prev + cost);

        let prob = (projectData.probabilityOfSuccess || 0.20) * 0.85;
        if (hasRole('geologist')) {
          prob += getRoleBonus('probabilityBoost');
          prob = Math.min(0.95, prob);
        }

        // Apply seismic risk penalties
        const redrillInterp = projectData.seismicInterpretation;
        let redrillRiskOpex = 0, redrillRiskProd = 0, redrillRiskDecline = 0;
        if (redrillInterp && redrillInterp.risks && redrillInterp.risks.length > 0) {
          let totalPenalty = 0;
          redrillInterp.risks.forEach(riskName => {
            const effect = RISK_EFFECTS[riskName];
            if (effect) {
              totalPenalty += effect.probPenalty;
              if (effect.opexModifier) redrillRiskOpex += effect.opexModifier;
              if (effect.productionModifier) redrillRiskProd += effect.productionModifier;
              if (effect.declineRateBonus) redrillRiskDecline += effect.declineRateBonus;
            }
          });
          prob += totalPenalty;
        }
        prob = Math.max(0.01, prob);

        const success = Math.random() < prob;

        if (success) {
          const geo = getGeoCharacteristics();
          const minReserves = geo ? geo.reserveRangeMin : 10000000;
          const maxReserves = geo ? geo.reserveRangeMax : 60000000;
          const blockMult = projectData.blockReserveMultiplier || 1.0;
          let reserves = Math.floor(Math.random() * (maxReserves - minReserves) + minReserves) * blockMult;

          if (hasRole('geologist')) {
            const accuracyBonus = getRoleBonus('reserveAccuracy');
            const variation = (1 - accuracyBonus) * 0.3;
            reserves = reserves * (1 + (Math.random() * variation * 2 - variation));
          }

          // Apply risk effects to reserves
          if (redrillInterp && redrillInterp.risks) {
            redrillInterp.risks.forEach(riskName => {
              const effect = RISK_EFFECTS[riskName];
              if (effect && effect.reserveModifier) {
                reserves = Math.floor(reserves * (1 + effect.reserveModifier));
              }
            });
          }

          let quality = 'medium';
          if (geo && geo.oilQualityWeights) {
            const rand = Math.random();
            const weights = geo.oilQualityWeights;
            if (rand < weights.heavy) quality = 'heavy';
            else if (rand < weights.heavy + weights.medium) quality = 'medium';
            else quality = 'light';
          }

          setProjectData(prev => ({
            ...prev,
            oilDiscovered: true,
            reserveEstimate: Math.floor(reserves),
            oilQuality: quality,
            riskOpexModifier: redrillRiskOpex,
            riskProductionModifier: redrillRiskProd,
            riskDeclineBonus: redrillRiskDecline,
          }));
          setWells(prev => ({ ...prev, exploration: prev.exploration + 1, successful: prev.successful + 1 }));
          setDryHoleHistory(prev => [...prev, { attempt: prev.length + 1, type: 'Solo Drill', cost, result: 'OIL FOUND', success: true }]);
          addNotification(`OIL DISCOVERED on re-drill! Estimated ${(reserves/1e6).toFixed(1)}M barrels of ${quality} crude`, 'success');
          setGameState('playing');
          setCurrentQuarterIndex(4);
          setShowDecisionGate(false);
        } else {
          setWells(prev => ({ ...prev, exploration: prev.exploration + 1, dry: prev.dry + 1 }));
          setDryHoleHistory(prev => [...prev, { attempt: prev.length + 1, type: 'Solo Drill', cost, result: 'DRY HOLE', success: false }]);
          addNotification('Well was dry. Consider a different strategy.', 'warning');
        }

        logDecision(
          'Drill Another Well (Same Lease)',
          cost,
          success ? 'Oil Discovered!' : 'Dry Hole',
          'Re-drill risk on existing lease'
        );

        setDrillingInProgress(null);
      }, 500);
    }, 3000);
  };

  const relocateExploration = (newGeoType) => {
    if (dispatch('relocateExploration', newGeoType) === '__dispatched__') return;
    const geo = GEOLOGICAL_CHARACTERISTICS[newGeoType];
    const relocationCost = applyGeoCost(COSTS.lease + COSTS.environmental + COSTS.permits, 'lease') * 0.7;
    const seismicCost = applyGeoCost(COSTS.seismic + COSTS.dataProcessing, 'seismic') * 0.5;
    const totalCost = relocationCost + seismicCost;

    if (budget < totalCost) {
      addNotification('Insufficient budget for relocation!', 'error');
      return;
    }

    setBudget(prev => prev - totalCost);
    setTotalSpent(prev => prev + totalCost);

    setProjectData(prev => ({
      ...prev,
      geologicalType: newGeoType,
      leaseSecured: true,
      seismicComplete: true,
      seismicPackage: prev.seismicPackage,
      seismicQuality: prev.seismicQuality,
      oilDiscovered: false,
      probabilityOfSuccess: geo.probability + (PROBABILITIES.seismic[prev.seismicQuality] || 0.10),
      reserveEstimate: 0,
      oilQuality: null,
      appraisalComplete: false,
      developmentPlan: null
    }));

    addNotification(`Relocated to ${geo.name}. New lease and fast-track seismic complete ($${(totalCost/1e6).toFixed(1)}M)`, 'success');
    logDecision(
      `Relocate to ${geo.name}`,
      totalCost,
      'New exploration area secured',
      'Fresh geological risk, prior investment lost'
    );

    setSeismicStep(5);
    setSeismicInProgress(null);
    setRawSeismicData(null);
    setSeismicObservations({ structureVisible: null, amplitudeAnomaly: null, faultsVisible: null, estimatedDepth: null, overallAssessment: null });
    setProcessingWorkflow(null);

    setGameState('playing');
    setCurrentQuarterIndex(3);
    setShowDecisionGate(false);
  };

  const farmOut = () => {
    if (dispatch('farmOut') === '__dispatched__') return;
    const partnerContribution = budget * 0.5;
    const drillingCost = applyGeoCost(COSTS.explorationWell, 'explorationWell');
    const ourCost = drillingCost * 0.5;

    if (budget + partnerContribution < ourCost) {
      addNotification('Insufficient budget even with partner!', 'error');
      return;
    }

    setDrillingInProgress({ type: 'partner', message: 'Negotiating partnership terms...', progress: 0 });

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDrillingInProgress(prev => prev ? { ...prev, progress: Math.min(step * 10, 90), message: step < 3 ? 'Negotiating partnership terms...' : step < 5 ? 'Partner signed. Mobilizing rig...' : step < 8 ? 'Joint venture drilling...' : 'Analyzing results...' } : prev);
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setDrillingInProgress(prev => prev ? { ...prev, progress: 100, message: 'Evaluating results...' } : prev);

      setTimeout(() => {
        setBudget(prev => prev + partnerContribution - ourCost);
        setTotalSpent(prev => prev + ourCost);

        let prob = (projectData.probabilityOfSuccess || 0.20) * 0.9;
        prob += 0.08;
        if (hasRole('geologist')) {
          prob += getRoleBonus('probabilityBoost');
        }
        prob = Math.min(0.95, prob);

        const success = Math.random() < prob;

        if (success) {
          const geo = getGeoCharacteristics();
          const minReserves = geo ? geo.reserveRangeMin : 10000000;
          const maxReserves = geo ? geo.reserveRangeMax : 60000000;
          let reserves = Math.floor(Math.random() * (maxReserves - minReserves) + minReserves) * 0.6;

          let quality = 'medium';
          if (geo && geo.oilQualityWeights) {
            const rand = Math.random();
            const weights = geo.oilQualityWeights;
            if (rand < weights.heavy) quality = 'heavy';
            else if (rand < weights.heavy + weights.medium) quality = 'medium';
            else quality = 'light';
          }

          setProjectData(prev => ({
            ...prev,
            oilDiscovered: true,
            reserveEstimate: Math.floor(reserves),
            oilQuality: quality
          }));
          setWells(prev => ({ ...prev, exploration: prev.exploration + 1, successful: prev.successful + 1 }));
          setDryHoleHistory(prev => [...prev, { attempt: prev.length + 1, type: 'Farm-Out', cost: ourCost, result: 'OIL FOUND (60/40)', success: true }]);
          addNotification(`OIL DISCOVERED with partner! Your share: ${(reserves/1e6).toFixed(1)}M barrels (60/40 split)`, 'success');
          setGameState('playing');
          setCurrentQuarterIndex(4);
          setShowDecisionGate(false);
        } else {
          setWells(prev => ({ ...prev, exploration: prev.exploration + 1, dry: prev.dry + 1 }));
          setDryHoleHistory(prev => [...prev, { attempt: prev.length + 1, type: 'Farm-Out', cost: ourCost, result: 'DRY HOLE (shared loss)', success: false }]);
          addNotification('Joint venture well was dry. Partner absorbs shared losses.', 'warning');
        }

        logDecision(
          'Farm-Out: Joint Venture Well',
          ourCost,
          success ? 'Oil Discovered (60/40 split)' : 'Dry Hole (shared loss)',
          'Shared risk with partner, reduced upside'
        );

        setDrillingInProgress(null);
      }, 500);
    }, 3500);
  };

  const abandonProject = () => {
    if (dispatch('abandonProject') === '__dispatched__') return;
    logDecision('Abandon Project', 0, 'Project Abandoned after dry hole', 'Cut losses');
    addNotification('Project abandoned. All exploration costs are sunk.', 'error');
    setGameState('ended');
  };

  const makeGateDecision = (proceed) => {
    if (dispatch('makeGateDecision', proceed) === '__dispatched__') return;
    if (proceed) {
      const evaluation = evaluateGate();
      if (!evaluation.canProceed) {
        addNotification(`Cannot proceed: ${evaluation.missing.join(', ')}`, 'error');
        return;
      }

      const approvalCount = getRoleApprovalCount();
      const roleReqs = checkGateRoleRequirements();

      if (approvalCount < roleReqs.requiresSignatures) {
        addNotification(
          `Insufficient approvals: Need ${roleReqs.requiresSignatures}, have ${approvalCount}`,
          'error'
        );
        return;
      }

      if (!roleReqs.met) {
        const shouldProceed = window.confirm(
          `WARNING: You are missing required roles (${roleReqs.missing.map(rid => ROLES.find(r => r.id === rid)?.name).join(', ')}). This increases project risk. Proceed anyway?`
        );
        if (!shouldProceed) return;
      }

      if (currentGate.cost > 0) {
        if (budget < currentGate.cost) {
          addNotification('Insufficient budget for this decision!', 'error');
          return;
        }
        setBudget(prev => prev - currentGate.cost);
        setTotalSpent(prev => prev + currentGate.cost);
      }

      // Gate-specific actions
      if (currentQuarter.gate === 'GATE_1') {
        if (selectedSeismicPkg) {
          setProjectData(prev => ({ ...prev, seismicPackage: selectedSeismicPkg }));
        }
        const ctr = selectedContractor ? SEISMIC_CONTRACTORS[selectedContractor] : null;
        const ctrName = ctr ? ctr.name : 'Default';
        addNotification('Seismic survey contract awarded to ' + ctrName, 'success');
      } else if (currentQuarter.gate === 'GATE_2') {
        const drillSuccess = drillExplorationWell(true);
        if (!drillSuccess) {
          setTimeout(() => {
            setShowDecisionGate(false);
          }, 2000);
          return;
        }
      } else if (currentQuarter.gate === 'GATE_3' && feedStudy) {
        const feedOpt = FEED_STUDY_OPTIONS[feedStudy];
        if (feedOpt) {
          const feedCost = feedOpt.cost;
          if (budget < feedCost) {
            addNotification('Insufficient budget for FEED study!', 'error');
            return;
          }
          setBudget(prev => prev - feedCost);
          setTotalSpent(prev => prev + feedCost);
          addNotification(`${feedOpt.name} completed ($${(feedCost/1e6).toFixed(1)}M)`, 'success');
        }
      } else if (currentQuarter.gate === 'GATE_4') {
        const concept = FID_OPTIONS.developmentConcept.options[fidSelections.developmentConcept];
        const execution = FID_OPTIONS.executionStrategy.options[fidSelections.executionStrategy];
        const financing = FID_OPTIONS.financingStructure.options[fidSelections.financingStructure];

        const conceptCost = applyGeoCost(concept.cost, 'facility');
        const plan = projectData.developmentPlan;
        const wellCost = plan.wellCount * applyGeoCost(COSTS.developmentWell, 'developmentWell') * (1 + execution.capexModifier);

        // Minimum facilities estimate (required facilities at basic tier)
        const minFacilityCost = Object.values(FACILITY_OPTIONS)
          .filter(f => f.required)
          .reduce((sum, f) => {
            const cheapestTier = Object.values(f.tiers).reduce((min, t) => t.cost < min ? t.cost : min, Infinity);
            return sum + applyGeoCost(cheapestTier, 'facility');
          }, 0);

        const totalProjectCost = conceptCost + wellCost + minFacilityCost;
        const budgetAfterConcept = budget - conceptCost;

        // Store modifiers for downstream use
        setProjectData(prev => ({
          ...prev,
          conceptOpexModifier: concept.opexModifier,
          conceptProductionModifier: concept.productionModifier,
          executionCapexModifier: execution.capexModifier,
          executionProductionModifier: execution.productionModifier,
        }));

        // Apply financing: loan covers shortfall for entire project (concept + wells + facilities)
        let loanAmount = 0;
        let loanInterest = 0;
        if (financing.debtRatio > 0) {
          const shortfall = totalProjectCost - budget;
          if (shortfall > 0) {
            loanAmount = Math.ceil(shortfall * financing.loanMultiplier);
            let interestRate = financing.interestRate;
            if (hasRole('finance')) {
              interestRate -= getRoleBonus('betterFinancing');
            }
            loanInterest = Math.floor(loanAmount * interestRate);
            setBudget(prev => prev + loanAmount - conceptCost);
            setTotalSpent(prev => prev + conceptCost + loanInterest);
            addNotification(
              `${financing.name}: $${(loanAmount/1e6).toFixed(1)}M loan at ${(interestRate*100).toFixed(1)}%. Interest: $${(loanInterest/1e6).toFixed(1)}M`,
              'success'
            );
          } else {
            // No shortfall — just deduct concept cost
            setBudget(prev => prev - conceptCost);
            setTotalSpent(prev => prev + conceptCost);
          }
        } else {
          // Corporate finance (equity only) — just deduct concept cost
          setBudget(prev => prev - conceptCost);
          setTotalSpent(prev => prev + conceptCost);
        }

        // Store loan info for display during production
        if (loanAmount > 0) {
          setProjectData(prev => ({
            ...prev,
            loanAmount,
            loanInterest,
            loanSource: 'gate4',
          }));
        }

        addNotification(`FID approved: ${concept.name} + ${execution.name} + ${financing.name}`, 'success');
      }

      const currentGateId = currentQuarter.gate;
      const approvedRoles = Object.keys(roleApprovals[currentGateId] || {}).filter(
        roleId => roleApprovals[currentGateId][roleId] === true
      );
      logDecision(
        currentGate.name,
        currentGate.cost,
        `Approved - Proceed (${approvalCount} team approvals)`,
        currentGate.risks.map(r => r.name).join(', '),
        approvedRoles
      );
      addNotification(`${currentGate.name} - APPROVED by ${approvalCount} team members`, 'success');
      setGateDecision('approved');

      setTimeout(() => {
        setShowDecisionGate(false);
        setGateDecision(null);
        if (currentQuarterIndex < QUARTERS.length - 1) {
          setCurrentQuarterIndex(prev => prev + 1);
          setTimeout(() => {
            if (QUARTERS[currentQuarterIndex + 1].gate && !["GATE_3", "GATE_4", "GATE_5"].includes(QUARTERS[currentQuarterIndex + 1].gate)) {
              setShowDecisionGate(true);
            }
          }, 1000);
        }
      }, 2000);

    } else {
      logDecision(
        currentGate.name,
        0,
        'Rejected - Project Terminated',
        'Risk mitigation: Exit before further investment'
      );
      addNotification(`${currentGate.name} - REJECTED. Project terminated.`, 'error');
      setGameState('ended');
    }
  };

  const advanceWithoutGate = () => {
    if (dispatch('advanceWithoutGate') === '__dispatched__') return;
    if (currentQuarterIndex < QUARTERS.length - 1) {
      setCurrentQuarterIndex(prev => prev + 1);
      addNotification(`Advanced to ${QUARTERS[currentQuarterIndex + 1].name}`, 'info');
      if (QUARTERS[currentQuarterIndex + 1].gate) {
        setTimeout(() => setShowDecisionGate(true), 500);
      }
    }
  };

  const exportSession = () => {
    const sessionData = {
      exportDate: new Date().toISOString(),
      version: 'v1',
      team: teamComposition,
      geologicalType: projectData.geologicalType,
      outcome: gameState === 'ended' ? 'terminated' :
               revenue > totalSpent ? 'profitable' : 'unprofitable',
      financials: { budget, totalSpent, revenue },
      production: { daily: production.daily, cumulative: production.cumulative, days: production.days },
      wells,
      decisions: [...decisions].reverse(),
      roleApprovals,
      choices: {
        seismicPackage: selectedSeismicPkg,
        contractor: selectedContractor,
        drillSite: selectedDrillSite,
        appraisalStrategy,
        wellTestType,
        processingWorkflow,
        selectedFacilities,
        feedStudy
      },
      participantAssessments: { seismicObservations, riskAssessment, loanAssessment },
      dryHoleHistory
    };
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oil-sim-${projectData.geologicalType || 'session'}-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Action registry for multiplayer Host — maps action names to functions
  const actionRegistry = {
    startGame,
    toggleRoleApproval,
    selectGeological,
    secureLease,
    revokeLease,
    startSeismicAcquisition,
    startSeismicProcessing,
    runAdditionalStudy,
    obtainDrillingPermit,
    drillExplorationWell,
    drillAppraisalWells,
    approveDevelopmentPlan,
    secureLoan,
    executeWellDrilling,
    selectFacility,
    confirmFacilities,
    drillAnotherWell,
    relocateExploration,
    farmOut,
    abandonProject,
    makeGateDecision,
    advanceWithoutGate,
    // Direct setter wrappers
    setSelectedSeismicPkg: (pkgId) => setSelectedSeismicPkg(pkgId),
    setSelectedContractor: (cId) => setSelectedContractor(cId),
    setFeedStudy: (feedId) => setFeedStudy(feedId),
    setSelectedDrillSite: (siteId) => setSelectedDrillSite(siteId),
    setRiskAssessment: (value) => setRiskAssessment(value),
    setSeismicObservation: (field, value) => setSeismicObservations(prev => ({ ...prev, [field]: value })),
    setAppraisalStrategy: (stratId) => setAppraisalStrategy(stratId),
    setWellTestType: (typeId) => setWellTestType(typeId),
    setLoanAssessment: (field, value) => setLoanAssessment(prev => ({ ...prev, [field]: value })),
    setJustification: (text) => setJustification(text),
    setShowDecisionGate: (show) => setShowDecisionGate(show),
    setSeismicStep: (step) => setSeismicStep(step),
    setLeaseTermField: (field, value) => setLeaseTerms(prev => ({ ...prev, [field]: value })),
    setFidSelection: (field, value) => setFidSelections(prev => ({ ...prev, [field]: value })),
  };

  // Dispatch-aware wrappers for direct state setters (used by components)
  const dispatchSetSelectedSeismicPkg = (pkgId) => {
    if (dispatch('setSelectedSeismicPkg', pkgId) === '__dispatched__') return;
    setSelectedSeismicPkg(pkgId);
  };
  const dispatchSetSelectedContractor = (cId) => {
    if (dispatch('setSelectedContractor', cId) === '__dispatched__') return;
    setSelectedContractor(cId);
  };
  const dispatchSetFeedStudy = (feedId) => {
    if (dispatch('setFeedStudy', feedId) === '__dispatched__') return;
    setFeedStudy(feedId);
  };
  const dispatchSetSelectedDrillSite = (siteId) => {
    if (dispatch('setSelectedDrillSite', siteId) === '__dispatched__') return;
    setSelectedDrillSite(siteId);
  };
  const dispatchSetRiskAssessment = (value) => {
    if (dispatch('setRiskAssessment', value) === '__dispatched__') return;
    setRiskAssessment(value);
  };
  const dispatchSetSeismicObservation = (field, value) => {
    if (dispatch('setSeismicObservation', field, value) === '__dispatched__') return;
    setSeismicObservations(prev => ({ ...prev, [field]: value }));
  };
  const dispatchSetAppraisalStrategy = (stratId) => {
    if (dispatch('setAppraisalStrategy', stratId) === '__dispatched__') return;
    setAppraisalStrategy(stratId);
  };
  const dispatchSetWellTestType = (typeId) => {
    if (dispatch('setWellTestType', typeId) === '__dispatched__') return;
    setWellTestType(typeId);
  };
  const dispatchSetLoanAssessment = (field, value) => {
    if (dispatch('setLoanAssessment', field, value) === '__dispatched__') return;
    setLoanAssessment(prev => ({ ...prev, [field]: value }));
  };
  const dispatchSetJustification = (text) => {
    if (dispatch('setJustification', text) === '__dispatched__') return;
    setJustification(text);
  };
  const dispatchSetShowDecisionGate = (show) => {
    if (dispatch('setShowDecisionGate', show) === '__dispatched__') return;
    setShowDecisionGate(show);
  };
  const dispatchSetSeismicStep = (step) => {
    if (dispatch('setSeismicStep', step) === '__dispatched__') return;
    setSeismicStep(step);
  };
  const dispatchSetLeaseTermField = (field, value) => {
    if (dispatch('setLeaseTermField', field, value) === '__dispatched__') return;
    setLeaseTerms(prev => ({ ...prev, [field]: value }));
  };
  const dispatchSetFidSelection = (field, value) => {
    if (dispatch('setFidSelection', field, value) === '__dispatched__') return;
    setFidSelections(prev => ({ ...prev, [field]: value }));
  };

  return {
    // Geo helpers
    getGeoCharacteristics,
    applyGeoCost,
    // Notifications
    addNotification,
    logDecision,
    // Calculations
    calculateProbability,
    calculateNPV,
    // Game flow
    startGame,
    toggleRole,
    toggleRoleApproval,
    // Q1
    selectGeological,
    secureLease,
    revokeLease,
    // Q2 - Seismic
    startSeismicAcquisition,
    startSeismicProcessing,
    runAdditionalStudy,
    // Q3
    obtainDrillingPermit,
    // Q4 / Drilling
    drillExplorationWell,
    // Appraisal
    drillAppraisalWells,
    // Development
    approveDevelopmentPlan,
    secureLoan,
    executeWellDrilling,
    selectFacility,
    confirmFacilities,
    // Gates
    evaluateGate,
    makeGateDecision,
    advanceWithoutGate,
    // Dry hole
    drillAnotherWell,
    relocateExploration,
    farmOut,
    abandonProject,
    // Export
    exportSession,
    // Authority (multiplayer)
    isAuthorized,
    getAuthMessage,
    checkAuthority,
    // Multiplayer
    actionRegistry,
    // Dispatch-aware setters (for multiplayer sync)
    dispatchSetSelectedSeismicPkg,
    dispatchSetSelectedContractor,
    dispatchSetFeedStudy,
    dispatchSetSelectedDrillSite,
    dispatchSetRiskAssessment,
    dispatchSetSeismicObservation,
    dispatchSetAppraisalStrategy,
    dispatchSetWellTestType,
    dispatchSetLoanAssessment,
    dispatchSetJustification,
    dispatchSetShowDecisionGate,
    dispatchSetSeismicStep,
    dispatchSetLeaseTermField,
    dispatchSetFidSelection,
  };
};
