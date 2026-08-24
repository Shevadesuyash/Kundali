import './TagBadge.css';

const TAG_CONFIG = {
  self:    { label: 'Self',    color: 'purple' },
  family:  { label: 'Family',  color: 'blue'   },
  friend:  { label: 'Friend',  color: 'green'  },
  partner: { label: 'Partner', color: 'pink'   },
  client:  { label: 'Client',  color: 'amber'  },
};

/**
 * TagBadge — displays a small pill badge for the profile relationship tag.
 * Props:
 *   tag: 'self' | 'family' | 'friend' | 'partner' | 'client'
 */
export default function TagBadge({ tag = 'self' }) {
  const normalized = (tag || 'self').toLowerCase();
  const cfg = TAG_CONFIG[normalized] || { label: tag, color: 'gray' };

  return (
    <span className={`tag-badge tag-badge--${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
