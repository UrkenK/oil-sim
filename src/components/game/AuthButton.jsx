import React from 'react';
import { Lock } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { canExecute, getAuthorityMessage } from '../../multiplayer/ActionRouter';

/**
 * AuthButton — wraps a button with multiplayer authority checks.
 * In solo mode, behaves exactly like a normal button.
 * In multiplayer, disables the button if the player lacks authority,
 * and shows a tooltip explaining who can do this action.
 *
 * Props:
 * - action: string — action name from ActionRouter (e.g. 'selectGeological')
 * - context: object — optional context for authority check (e.g. { targetRoleId })
 * - disabled: boolean — additional disabled state (from parent)
 * - className: string — button classes
 * - onClick: function — click handler
 * - children: ReactNode — button content
 * - ...rest: any other button props
 */
const AuthButton = ({ action, context = {}, disabled = false, className = '', onClick, children, ...rest }) => {
  const { gameMode, multiplayerState } = useGame();

  const isMultiplayer = gameMode === 'multiplayer';
  const playerRole = multiplayerState?.playerRole || null;

  const authorized = !isMultiplayer || canExecute(playerRole, action, context);
  const authMessage = !authorized ? getAuthorityMessage(action) : '';

  const isDisabled = disabled || !authorized;

  return (
    <div className="relative group">
      <button
        className={className}
        disabled={isDisabled}
        onClick={onClick}
        {...rest}
      >
        {!authorized && <Lock size={12} className="inline mr-1 opacity-60" />}
        {children}
      </button>
      {!authorized && authMessage && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 border border-slate-600 rounded text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {authMessage}
        </div>
      )}
    </div>
  );
};

export default AuthButton;
