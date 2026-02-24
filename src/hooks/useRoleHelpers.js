import { ROLES } from '../constants/roles';
import { QUARTERS } from '../constants/timeline';
import { DECISION_GATES, GATE_ROLE_REQUIREMENTS } from '../constants/gates';
import { useGame } from '../context/GameContext';

export const useRoleHelpers = () => {
  const { teamComposition, currentQuarterIndex, roleApprovals } = useGame();

  const currentQuarter = QUARTERS[currentQuarterIndex];
  const currentGate = currentQuarter?.gate ? DECISION_GATES[currentQuarter.gate] : null;

  const hasRole = (roleId) => teamComposition.includes(roleId);

  const getRoleBonus = (bonusType) => {
    let bonus = 0;
    teamComposition.forEach(roleId => {
      const role = ROLES.find(r => r.id === roleId);
      if (role?.skillBonuses?.[bonusType]) {
        bonus += role.skillBonuses[bonusType];
      }
    });
    return bonus;
  };

  const applyRoleBonuses = (baseValue, bonusType) => {
    const bonus = getRoleBonus(bonusType);
    return baseValue * (1 + bonus);
  };

  const getRoleInsight = (roleId, contextKey) => {
    const role = ROLES.find(r => r.id === roleId);
    if (!role?.insights) return null;
    return role.insights[contextKey] || role.insights.all || null;
  };

  const checkGateRoleRequirements = () => {
    if (!currentGate) return { met: true, missing: [], recommended: [] };

    const gateReqs = GATE_ROLE_REQUIREMENTS[currentQuarter.gate];
    if (!gateReqs) return { met: true, missing: [], recommended: [] };

    const missing = gateReqs.required.filter(roleId => !hasRole(roleId));
    const missingRecommended = gateReqs.recommended.filter(roleId => !hasRole(roleId));

    return {
      met: missing.length === 0,
      missing,
      recommended: missingRecommended,
      requiresSignatures: Math.min(gateReqs.minimumSignatures, teamComposition.length),
      required: gateReqs.required
    };
  };

  const getRoleApprovalCount = () => {
    const currentGateId = currentQuarter?.gate;
    if (!currentGateId) return 0;
    return Object.keys(roleApprovals[currentGateId] || {}).filter(
      roleId => roleApprovals[currentGateId][roleId] === true
    ).length;
  };

  return {
    currentQuarter,
    currentGate,
    hasRole,
    getRoleBonus,
    applyRoleBonuses,
    getRoleInsight,
    checkGateRoleRequirements,
    getRoleApprovalCount,
  };
};
