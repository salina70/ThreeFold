import React from "react";

export default function StarRating({ value = 0, onChange, size = 20 }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === "function";

  return (
    <div className={`fn-stars ${interactive ? "fn-stars-input" : ""}`} style={{ fontSize: size }}>
      {stars.map((s) => (
        <span
          key={s}
          className={s <= Math.round(value) ? "fn-star fn-star-filled" : "fn-star"}
          onClick={() => interactive && onChange(s)}
          role={interactive ? "button" : undefined}
          aria-label={interactive ? `Rate ${s} stars` : undefined}
        >
          &#9733;
        </span>
      ))}
    </div>
  );
}
