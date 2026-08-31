import React from "react";

export default function Logo({ size = 34, withText = true }) {
  return (
    <div className="fn-logo">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 34L16 14L23 25L28 17L44 34H4Z"
          fill="var(--fn-indigo)"
        />
        <path
          d="M23 25L28 17L33 25L28 30L23 25Z"
          fill="var(--fn-marigold)"
        />
        <circle cx="37" cy="12" r="5" fill="var(--fn-marigold)" />
      </svg>
      {withText && (
        <span className="fn-logo-text">
          Feedback <em>Nepal</em>
        </span>
      )}
    </div>
  );
}
