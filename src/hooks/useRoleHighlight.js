import { useGame } from '../context/GameContext';
import { ROLES } from '../constants/roles';

/**
 * Compute visual highlighting state for a section owned by specific roles.
 *
 * @param {string|string[]} ownerRoles - Role IDs that own this section,
 *   or 'any' for shared sections.
 * @returns {{ state: 'mine'|'other'|'shared'|'solo', ownerRoleObjects: object[], primaryColor: string|null }}
 */
export const useRoleHighlight = (ownerRoles) => {
  const { gameMode, multiplayerState } = useGame();
  const isMultiplayer = gameMode === 'multiplayer';
  const playerRole = multiplayerState?.playerRole || null;

  const owners = Array.isArray(ownerRoles) ? ownerRoles : [ownerRoles];

  const ownerRoleObjects = owners
    .filter(r => r !== 'any' && r !== 'admin' && r !== 'own_role')
    .map(id => ROLES.find(r => r.id === id))
    .filter(Boolean);

  let state;
  let primaryColor = ownerRoleObjects[0]?.color || null;

  if (!isMultiplayer || playerRole === 'admin') {
    state = 'solo';
  } else if (owners.includes('any')) {
    state = 'shared';
  } else if (owners.includes(playerRole)) {
    state = 'mine';
    // Use player's own color for multi-role sections
    const playerRoleObj = ROLES.find(r => r.id === playerRole);
    if (playerRoleObj) primaryColor = playerRoleObj.color;
  } else {
    state = 'other';
  }

  return { state, ownerRoleObjects, primaryColor };
};
