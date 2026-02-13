import React from "react";

// Reusable badge for displaying tier labels with consistent colors.
// Maps various input forms to the tailwind-based CSS classes defined in index.css
export default function TierBadge({ tier, className = "", ...props }) {
  if (!tier && tier !== 0) return null;

  // normalize by removing spaces/hyphens/underscores so "Grand Master", "grand-master" and "grandmaster" all become "grandmaster"
  const normalized = String(tier)
    .trim()
    .toLowerCase()
    .replace(/[\s-_]+/g, "");

  const tierClassMap = {
    easy: "tier-easy",
    medium: "tier-medium",
    hard: "tier-hard",
    elite: "tier-elite",
    master: "tier-master",
    grandmaster: "tier-grandmaster",
    // allow short variants too
    gm: "tier-grandmaster",
    m: "tier-master",
    e: "tier-easy",
  };

  const mapped = tierClassMap[normalized] || `tier-${normalized}`;

  return (
    <span className={`tier-badge ${mapped} ${className}`.trim()} {...props}>
      {String(tier)}
    </span>
  );
}
