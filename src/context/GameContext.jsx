import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const GameContext = createContext(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};

export const GameProvider = ({ children }) => {
  // Game state
  const [gameState, setGameState] = useState('setup');
  const [gameMode, setGameMode] = useState(null); // null | 'solo' | 'multiplayer'
  const [currentQuarterIndex, setCurrentQuarterIndex] = useState(0);
  const [teamComposition, setTeamComposition] = useState([]);
  const [showDecisionGate, setShowDecisionGate] = useState(false);
  const [gateDecision, setGateDecision] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [roleApprovals, setRoleApprovals] = useState({});
  const [selectedDrillSite, setSelectedDrillSite] = useState(null);
  const [selectedSeismicPkg, setSelectedSeismicPkg] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [appraisalStrategy, setAppraisalStrategy] = useState(null);
  const [wellTestType, setWellTestType] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [additionalStudy, setAdditionalStudy] = useState(false);
  const [drillingInProgress, setDrillingInProgress] = useState(null);
  const [dryHoleHistory, setDryHoleHistory] = useState([]);
  const [feedStudy, setFeedStudy] = useState(null);

  // Seismic acquisition sub-steps (Q2)
  const [seismicStep, setSeismicStep] = useState(0);
  const [seismicInProgress, setSeismicInProgress] = useState(null);
  const [rawSeismicData, setRawSeismicData] = useState(null);
  const [seismicObservations, setSeismicObservations] = useState({
    structureVisible: null,
    amplitudeAnomaly: null,
    faultsVisible: null,
    estimatedDepth: null,
    overallAssessment: null
  });
  const [processingWorkflow, setProcessingWorkflow] = useState(null);

  // Project report
  const [showReport, setShowReport] = useState(false);

  // Loan decision (H1 Y3)
  const [loanAssessment, setLoanAssessment] = useState({
    riskAcceptance: null,
    repaymentSource: null,
    debtTolerance: null
  });

  // Lease terms (Q1)
  const [leaseTerms, setLeaseTerms] = useState({
    licenseType: null,
    environmentalScope: null,
    blockSize: null,
    royaltyTerms: null,
  });

  // FID selections (Gate 4)
  const [fidSelections, setFidSelections] = useState({
    developmentConcept: null,
    executionStrategy: null,
    financingStructure: null,
  });

  // Facility selections (H1 Y3)
  const [selectedFacilities, setSelectedFacilities] = useState({});

  // Financial
  const [budget, setBudget] = useState(100000000);
  const [totalSpent, setTotalSpent] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [quarterlyFinancials, setQuarterlyFinancials] = useState([]);

  // Project data
  const [projectData, setProjectData] = useState({
    geologicalType: null,
    leaseSecured: false,
    seismicPackage: null,
    seismicQuality: null,
    seismicComplete: false,
    seismicInterpretation: null,
    probabilityOfSuccess: 0,
    drillingPermit: false,
    oilDiscovered: false,
    reserveEstimate: 0,
    oilQuality: null,
    appraisalComplete: false,
    developmentPlan: null,
    facilitiesComplete: false,
    wellsComplete: false,
    safetyCertified: false,
    proceduresApproved: false,
    facilityInvestment: 0,
    facilityOpexModifier: 0,
    facilityProductionModifier: 0,
    loanAmount: 0,
    loanInterest: 0,
    loanSource: null,
    detailedWellMode: false,
  });

  // Wells
  const [wells, setWells] = useState({
    exploration: 0,
    appraisal: 0,
    production: 0,
    successful: 0,
    dry: 0
  });

  // Individual well management (detailed mode)
  const [individualWells, setIndividualWells] = useState([]);
  const [pendingWellEvents, setPendingWellEvents] = useState([]);

  // Production
  const [production, setProduction] = useState({
    daily: 0,
    cumulative: 0,
    days: 0,
    totalOPEX: 0,
    totalRoyalties: 0,
    totalTax: 0,
    currentDaily: 0,
  });

  // Oil price (dynamic market events)
  const [oilPrice, setOilPrice] = useState(75);
  const [oilPriceHistory, setOilPriceHistory] = useState([]);
  const [currentMarketEvent, setCurrentMarketEvent] = useState(null);

  // Financial history (monthly snapshots during production)
  const [financialHistory, setFinancialHistory] = useState([]);

  // Decisions & notifications
  const [decisions, setDecisions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [justification, setJustification] = useState('');

  // ======== Multiplayer State ========
  const [multiplayerState, setMultiplayerState] = useState({
    roomId: null,
    isHost: false,
    playerRole: null,   // 'geologist' | 'engineer' | 'finance' | 'operations' | 'admin'
    playerName: '',
    connectedPlayers: [],
    connectionStatus: 'disconnected',
  });

  // ======== Action Dispatch (multiplayer) ========
  // In multiplayer peer mode, actions are sent to host instead of executing locally.
  // actionDispatchRef.current is set by App.jsx: (actionName, args) => void
  // If null or solo mode, actions execute locally (normal behavior).
  const actionDispatchRef = useRef(null);

  // Get full game state snapshot (for broadcasting to peers)
  const getSnapshot = useCallback(() => ({
    gameState,
    gameMode,
    currentQuarterIndex,
    teamComposition,
    showDecisionGate,
    gateDecision,
    roleApprovals,
    selectedDrillSite,
    selectedSeismicPkg,
    selectedContractor,
    appraisalStrategy,
    wellTestType,
    riskAssessment,
    additionalStudy,
    dryHoleHistory,
    feedStudy,
    seismicStep,
    seismicInProgress,
    rawSeismicData,
    seismicObservations,
    processingWorkflow,
    loanAssessment,
    leaseTerms,
    fidSelections,
    selectedFacilities,
    budget,
    totalSpent,
    revenue,
    quarterlyFinancials,
    projectData,
    wells,
    individualWells,
    pendingWellEvents,
    production,
    oilPrice,
    oilPriceHistory,
    currentMarketEvent,
    financialHistory,
    decisions,
    notifications,
    justification,
    drillingInProgress,
  }), [
    gameState, gameMode, currentQuarterIndex, teamComposition, showDecisionGate,
    gateDecision, roleApprovals, selectedDrillSite, selectedSeismicPkg,
    selectedContractor, appraisalStrategy, wellTestType, riskAssessment,
    additionalStudy, dryHoleHistory, feedStudy, seismicStep, seismicInProgress,
    rawSeismicData, seismicObservations, processingWorkflow, loanAssessment, leaseTerms,
    fidSelections, selectedFacilities, budget, totalSpent, revenue, quarterlyFinancials,
    projectData, wells, individualWells, pendingWellEvents, production,
    oilPrice, oilPriceHistory, currentMarketEvent, financialHistory,
    decisions, notifications, justification, drillingInProgress,
  ]);

  // Apply state snapshot from host (used by peers)
  const applySnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    if (snapshot.gameState !== undefined) setGameState(snapshot.gameState);
    if (snapshot.gameMode !== undefined) setGameMode(snapshot.gameMode);
    if (snapshot.currentQuarterIndex !== undefined) setCurrentQuarterIndex(snapshot.currentQuarterIndex);
    if (snapshot.teamComposition !== undefined) setTeamComposition(snapshot.teamComposition);
    if (snapshot.showDecisionGate !== undefined) setShowDecisionGate(snapshot.showDecisionGate);
    if (snapshot.gateDecision !== undefined) setGateDecision(snapshot.gateDecision);
    if (snapshot.roleApprovals !== undefined) setRoleApprovals(snapshot.roleApprovals);
    if (snapshot.selectedDrillSite !== undefined) setSelectedDrillSite(snapshot.selectedDrillSite);
    if (snapshot.selectedSeismicPkg !== undefined) setSelectedSeismicPkg(snapshot.selectedSeismicPkg);
    if (snapshot.selectedContractor !== undefined) setSelectedContractor(snapshot.selectedContractor);
    if (snapshot.appraisalStrategy !== undefined) setAppraisalStrategy(snapshot.appraisalStrategy);
    if (snapshot.wellTestType !== undefined) setWellTestType(snapshot.wellTestType);
    if (snapshot.riskAssessment !== undefined) setRiskAssessment(snapshot.riskAssessment);
    if (snapshot.additionalStudy !== undefined) setAdditionalStudy(snapshot.additionalStudy);
    if (snapshot.drillingInProgress !== undefined) setDrillingInProgress(snapshot.drillingInProgress);
    if (snapshot.dryHoleHistory !== undefined) setDryHoleHistory(snapshot.dryHoleHistory);
    if (snapshot.feedStudy !== undefined) setFeedStudy(snapshot.feedStudy);
    if (snapshot.seismicStep !== undefined) setSeismicStep(snapshot.seismicStep);
    if (snapshot.seismicInProgress !== undefined) setSeismicInProgress(snapshot.seismicInProgress);
    if (snapshot.rawSeismicData !== undefined) setRawSeismicData(snapshot.rawSeismicData);
    if (snapshot.seismicObservations !== undefined) setSeismicObservations(snapshot.seismicObservations);
    if (snapshot.processingWorkflow !== undefined) setProcessingWorkflow(snapshot.processingWorkflow);
    if (snapshot.loanAssessment !== undefined) setLoanAssessment(snapshot.loanAssessment);
    if (snapshot.leaseTerms !== undefined) setLeaseTerms(snapshot.leaseTerms);
    if (snapshot.fidSelections !== undefined) setFidSelections(snapshot.fidSelections);
    if (snapshot.selectedFacilities !== undefined) setSelectedFacilities(snapshot.selectedFacilities);
    if (snapshot.budget !== undefined) setBudget(snapshot.budget);
    if (snapshot.totalSpent !== undefined) setTotalSpent(snapshot.totalSpent);
    if (snapshot.revenue !== undefined) setRevenue(snapshot.revenue);
    if (snapshot.quarterlyFinancials !== undefined) setQuarterlyFinancials(snapshot.quarterlyFinancials);
    if (snapshot.projectData !== undefined) setProjectData(snapshot.projectData);
    if (snapshot.wells !== undefined) setWells(snapshot.wells);
    if (snapshot.individualWells !== undefined) setIndividualWells(snapshot.individualWells);
    if (snapshot.pendingWellEvents !== undefined) setPendingWellEvents(snapshot.pendingWellEvents);
    if (snapshot.production !== undefined) setProduction(snapshot.production);
    if (snapshot.oilPrice !== undefined) setOilPrice(snapshot.oilPrice);
    if (snapshot.oilPriceHistory !== undefined) setOilPriceHistory(snapshot.oilPriceHistory);
    if (snapshot.currentMarketEvent !== undefined) setCurrentMarketEvent(snapshot.currentMarketEvent);
    if (snapshot.financialHistory !== undefined) setFinancialHistory(snapshot.financialHistory);
    if (snapshot.decisions !== undefined) setDecisions(snapshot.decisions);
    if (snapshot.notifications !== undefined) setNotifications(snapshot.notifications);
    if (snapshot.justification !== undefined) setJustification(snapshot.justification);
  }, []);

  const value = {
    // Game state
    gameState, setGameState,
    gameMode, setGameMode,
    currentQuarterIndex, setCurrentQuarterIndex,
    teamComposition, setTeamComposition,
    showDecisionGate, setShowDecisionGate,
    gateDecision, setGateDecision,
    activeRole, setActiveRole,
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
    feedStudy, setFeedStudy,

    // Seismic
    seismicStep, setSeismicStep,
    seismicInProgress, setSeismicInProgress,
    rawSeismicData, setRawSeismicData,
    seismicObservations, setSeismicObservations,
    processingWorkflow, setProcessingWorkflow,

    // Report
    showReport, setShowReport,

    // Loan
    loanAssessment, setLoanAssessment,

    // Lease terms
    leaseTerms, setLeaseTerms,

    // FID selections (Gate 4)
    fidSelections, setFidSelections,

    // Facilities
    selectedFacilities, setSelectedFacilities,

    // Financial
    budget, setBudget,
    totalSpent, setTotalSpent,
    revenue, setRevenue,
    quarterlyFinancials, setQuarterlyFinancials,

    // Project data
    projectData, setProjectData,

    // Wells
    wells, setWells,
    individualWells, setIndividualWells,
    pendingWellEvents, setPendingWellEvents,

    // Production
    production, setProduction,

    // Oil price
    oilPrice, setOilPrice,
    oilPriceHistory, setOilPriceHistory,
    currentMarketEvent, setCurrentMarketEvent,

    // Financial history
    financialHistory, setFinancialHistory,

    // Decisions & notifications
    decisions, setDecisions,
    notifications, setNotifications,
    justification, setJustification,

    // Multiplayer
    multiplayerState, setMultiplayerState,
    getSnapshot,
    applySnapshot,
    actionDispatchRef,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
