import { useGame } from '../context/GameContext';
import { canExecute, getAuthorityMessage } from '../multiplayer/ActionRouter';

/**
 * Hook for checking multiplayer authority in components.
 * In solo mode, everything is authorized.
 *
 * Usage:
 *   const { isAuthorized, authProps } = useAuthority();
 *   <button {...authProps('selectGeological')} onClick={...}>
 *
 * authProps returns { disabled, title } if unauthorized,
 * or empty object if authorized.
 */
export const useAuthority = () => {
  const { gameMode, multiplayerState } = useGame();
  const isMultiplayer = gameMode === 'multiplayer';
  const playerRole = multiplayerState?.playerRole || null;

  const isAuthorized = (actionName, context = {}) => {
    if (!isMultiplayer) return true;
    return canExecute(playerRole, actionName, context);
  };

  /**
   * Returns props to spread on a button.
   * If unauthorized: { disabled: true, title: "Only ... can do this" }
   * If authorized: {}
   */
  const authProps = (actionName, context = {}) => {
    if (!isMultiplayer) return {};
    if (canExecute(playerRole, actionName, context)) return {};
    return {
      disabled: true,
      title: getAuthorityMessage(actionName),
    };
  };

  return { isAuthorized, authProps, isMultiplayer, playerRole };
};
