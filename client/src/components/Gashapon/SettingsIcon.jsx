import React from "react";

/**
 * SettingsIcon – a reusable SVG gear icon used in the Gashapon loot machine UI.
 * The component forwards any received props (e.g., className, style) to the <svg> element,
 * allowing callers to control size, color, and other styling via Tailwind or custom CSS.
 */
const SettingsIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M19.43 12.98c.04-.32.07-.66.07-1 0-.34-.03-.68-.07-1l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.07 7.07 0 0 0-1.71-.99l-.38-2.65A.5.5 0 0 0 14.1 4h-4a.5.5 0 0 0-.5.42l-.38 2.66a7.07 7.07 0 0 0-1.71.99l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64L4.57 11c-.04.32-.07.66-.07 1 0 .34.03.68.07 1L2.46 14.65a.5.5 0 0 0-.12.64l2 3.46c.14.24.44.33.68.22l2.49-1c.53.42 1.13.77 1.71.99l.38 2.66c.03.27.25.42.5.42h4c.27 0 .5-.15.5-.42l.38-2.66c.58-.22 1.18-.57 1.71-.99l2.49 1a.5.5 0 0 0 .68-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.66zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
  </svg>
);

export default SettingsIcon;
