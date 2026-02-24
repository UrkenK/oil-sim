// Maps game actions to required roles
// 'any' means any team member can do it
// 'admin' means only admin/host can do it
const ACTION_AUTHORITY = {
  // Q1 — Geological selection & Lease terms
  selectGeological: ['geologist'],
  setLeaseTermField: ['any'],
  secureLease: ['geologist', 'finance'],
  revokeLease: ['geologist', 'finance'],

  // Q2 — Seismic
  startSeismicAcquisition: ['geologist'],
  startSeismicProcessing: ['geologist'],
  runAdditionalStudy: ['geologist'],
  setSeismicObservation: ['geologist'],

  // Q3 — Permits & Risk
  obtainDrillingPermit: ['operations'],
  setRiskAssessment: ['any'],

  // Gate decisions
  toggleRoleApproval: ['own_role'], // special: player can only approve their own role
  setJustification: ['any'],
  makeGateDecision: ['admin'], // only host/admin can push the final button

  // Gate selections
  setSelectedSeismicPkg: ['any'],
  setSelectedContractor: ['any'],
  setSelectedDrillSite: ['any'],
  setFeedStudy: ['any'],

  // Appraisal
  setAppraisalStrategy: ['any'],
  setWellTestType: ['any'],
  drillAppraisalWells: ['engineer'],

  // Development planning
  approveDevelopmentPlan: ['finance', 'operations'],
  setFidSelection: ['any'],

  // H1 Y3 — Construction
  setLoanAssessment: ['any'],
  secureLoan: ['finance'],
  executeWellDrilling: ['engineer'],
  selectFacility: ['operations', 'engineer'],
  confirmFacilities: ['operations'],

  // Well management (detailed mode)
  shutInWell: ['operations'],
  restartWell: ['operations'],
  workoverWell: ['engineer', 'operations'],
  stimulateWell: ['engineer'],
  abandonWell: ['operations', 'finance'],
  repairWell: ['engineer', 'operations'],
  dismissWellEvent: ['operations'],

  // Dry hole
  drillAnotherWell: ['engineer'],
  relocateExploration: ['geologist'],
  farmOut: ['finance'],
  abandonProject: ['admin'],

  // Navigation
  advanceWithoutGate: ['admin'],
  startGame: ['admin'],
};

/**
 * Check if a player with the given role can execute an action.
 * @param {string|null} playerRole - 'geologist', 'engineer', 'finance', 'operations', or 'admin'
 * @param {string} actionName - key from ACTION_AUTHORITY
 * @param {object} [context] - optional context (e.g., { targetRoleId } for toggleRoleApproval)
 * @returns {boolean}
 */
export function canExecute(playerRole, actionName, context = {}) {
  // Admin can do everything
  if (playerRole === 'admin') return true;

  const required = ACTION_AUTHORITY[actionName];

  // If action is not in the map, default to allow (backwards compatibility)
  if (!required) return true;

  // 'any' — any role can do it
  if (required.includes('any')) return true;

  // 'admin' — only admin (already handled above, so deny)
  if (required.includes('admin') && playerRole !== 'admin') return false;

  // 'own_role' — special: player can only act on their own role
  if (required.includes('own_role')) {
    return context.targetRoleId === playerRole;
  }

  // Standard check: player's role must be in the allowed list
  return required.includes(playerRole);
}

/**
 * Get list of roles that can execute an action.
 * @param {string} actionName
 * @returns {string[]}
 */
export function getRequiredRoles(actionName) {
  return ACTION_AUTHORITY[actionName] || ['any'];
}

/**
 * Get human-readable authority message.
 * @param {string} actionName
 * @returns {string}
 */
export function getAuthorityMessage(actionName) {
  const roles = ACTION_AUTHORITY[actionName];
  if (!roles) return '';
  if (roles.includes('any')) return '';
  if (roles.includes('admin')) return 'Only the game host can do this';
  if (roles.includes('own_role')) return 'You can only approve your own role';

  const ROLE_NAMES = {
    geologist: 'Geologist',
    engineer: 'Drilling Engineer',
    finance: 'Finance Manager',
    operations: 'Operations Director',
  };

  const names = roles.map(r => ROLE_NAMES[r] || r).join(' or ');
  return `Only ${names} can do this`;
}
