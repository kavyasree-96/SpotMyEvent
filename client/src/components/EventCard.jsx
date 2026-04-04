import React, { useState } from "react";

export default function EventCard({ 
  title, 
  subtitle, 
  description, 
  date, 
  location, 
  thumbnail, 
  badge, 
  actionLabel, 
  onAction, 
  index = 0,
  compact = false,
  isExpired = false           // new prop – default false
}) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const accent = "#F8CB2E"; // fallback accent color

  // Compact mode dimensions
  const imageHeight = compact ? "120px" : "180px";
  const padding = compact ? "12px" : "20px";
  const titleSize = compact ? "0.9rem" : "1rem";
  const hideDescription = compact; // hide description in compact mode

  // Determine displayed badge (override if expired)
  const displayBadge = isExpired ? "Expired" : badge;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#111",
        border: `1px solid ${hovered ? accent + "44" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "14px",
        overflow: "hidden",
        transition: "transform 0.2s, border-color 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
        filter: isExpired ? "grayscale(100%)" : "none",
        opacity: isExpired ? 0.7 : 1,
      }}
    >
      {/* Image container – relative for badge positioning */}
      <div style={{ position: "relative", height: imageHeight, background: "#1a1a1a" }}>
        {thumbnail && !imgError ? (
          <img
            src={thumbnail}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#555",
            }}
          >
            No image
          </div>
        )}
        {displayBadge && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: isExpired ? "#666" : "#EE5007",
              color: "#fff",
              padding: "3px 10px",
              borderRadius: "100px",
              fontSize: "0.68rem",
              fontWeight: "bold",
            }}
          >
            {displayBadge}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding }}>
        <h3
          style={{
            color: "#fff",
            fontSize: titleSize,
            fontWeight: "bold",
            margin: "0 0 8px 0",
            lineHeight: 1.3,
          }}
        >
          {title || "Untitled"}
        </h3>
        {subtitle && (
          <p style={{ color: "#888", fontSize: "0.8rem", margin: "4px 0" }}>
            {subtitle}
          </p>
        )}
        {date && (
          <p style={{ color: "#666", fontSize: "0.75rem", margin: "4px 0" }}>
            {date}
          </p>
        )}
        {location && (
          <p style={{ color: "#666", fontSize: "0.75rem", margin: "4px 0" }}>
            {location}
          </p>
        )}
        {!hideDescription && description && (
          <p
            style={{
              color: "#aaa",
              fontSize: "0.85rem",
              marginTop: "12px",
              lineHeight: 1.4,
            }}
          >
            {description.length > 100 ? description.substring(0, 100) + "..." : description}
          </p>
        )}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            style={{
              marginTop: "16px",
              background: "transparent",
              border: `1px solid ${accent}`,
              color: accent,
              padding: compact ? "6px 12px" : "8px 16px",
              borderRadius: "100px",
              fontSize: compact ? "0.75rem" : "0.85rem",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = accent;
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = accent;
            }}
          >
            {actionLabel} →
          </button>
        )}
      </div>
    </div>
  );
}