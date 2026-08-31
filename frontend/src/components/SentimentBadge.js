import React from "react";

const LABELS = {
  positive: { text: "Positive", cls: "fn-badge-positive" },
  neutral: { text: "Neutral", cls: "fn-badge-neutral" },
  negative: { text: "Needs attention", cls: "fn-badge-negative" },
};

export default function SentimentBadge({ label }) {
  const info = LABELS[label] || LABELS.neutral;
  return <span className={`fn-badge ${info.cls}`}>{info.text}</span>;
}
