import React from "react";
import { Settings } from "lucide-react";

/**
 * SettingsIcon — Wraps lucide-react's <Settings /> gear icon.
 *
 * The lucide Settings icon is a mathematically-perfect 8-tooth gear:
 *   - viewBox="0 0 24 24", centered at (12, 12)
 *   - Stroke-based (no fill-clipping artifacts)
 *   - No stray anchor points or protruding paths
 *
 * Size: 26px (fits inside a 38px motion.div wrapper with comfortable padding).
 * Color: inherits from parent via `color` CSS property.
 * transform-origin is enforced on the SVG element itself so rotation
 * always pivots on the gear's geometric center.
 */
const SettingsIcon = (props) => (
  <Settings
    size={26}
    strokeWidth={2}
    style={{
      display: "block",
      transformOrigin: "center center",
      flexShrink: 0,
      overflow: "visible",
    }}
    {...props}
  />
);

export default SettingsIcon;
