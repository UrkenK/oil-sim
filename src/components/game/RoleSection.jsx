import React from 'react';
import { useRoleHighlight } from '../../hooks/useRoleHighlight';

const RoleBadge = ({ role, isMine, isOther }) => {
  const style = isMine
    ? { backgroundColor: `${role.color}30`, color: role.color, borderColor: `${role.color}60` }
    : isOther
    ? { backgroundColor: 'rgb(51 65 85 / 0.5)', borderColor: 'rgb(71 85 105)', color: 'rgb(148 163 184)' }
    : { backgroundColor: `${role.color}15`, color: role.color, borderColor: `${role.color}40` };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${isMine ? 'font-semibold' : 'font-medium'}`}
      style={style}
    >
      <span>{role.icon}</span>
      <span>{role.name}</span>
    </span>
  );
};

/**
 * Wraps a decision section with role-based visual highlighting.
 *
 * In multiplayer:
 * - "mine": colored border + glow in role color + bright badge
 * - "other": dashed neutral border + muted badge
 * - "shared": no decoration
 *
 * In solo/admin:
 * - Shows subtle role badges, no border effects
 */
const RoleSection = ({ roles, children, className = '' }) => {
  const { state, ownerRoleObjects, primaryColor } = useRoleHighlight(roles);

  // Shared sections with no specific roles — render children as-is
  if (state === 'shared' && ownerRoleObjects.length === 0) {
    return <div className={className}>{children}</div>;
  }

  let containerClasses = '';
  let containerStyle = {};

  switch (state) {
    case 'mine':
      containerClasses = 'rounded-lg p-3 relative';
      containerStyle = {
        borderColor: primaryColor,
        boxShadow: `inset 0 0 30px ${primaryColor}12, 0 0 10px ${primaryColor}18`,
        borderWidth: '2px',
        borderStyle: 'solid',
      };
      break;
    case 'other':
      containerClasses = 'border border-dashed border-slate-600/60 rounded-lg p-3 relative opacity-80';
      break;
    case 'solo':
      containerClasses = 'relative';
      break;
    default: // shared
      containerClasses = 'relative';
      break;
  }

  return (
    <div className={`${containerClasses} ${className}`} style={containerStyle}>
      {ownerRoleObjects.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          {ownerRoleObjects.map(role => (
            <RoleBadge
              key={role.id}
              role={role}
              isMine={state === 'mine'}
              isOther={state === 'other'}
            />
          ))}
        </div>
      )}
      {children}
    </div>
  );
};

export default RoleSection;
