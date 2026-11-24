import React from "react";

function StatCard({ stat }) {
  return (
    <article className="stat-card">
      <div className="stat-header">
        <span className="stat-icon">{stat.icon}</span>
        <span className="stat-title">{stat.title}</span>
      </div>

      <p className="stat-value">
        <span>{stat.statistics?.value ?? 0}</span>
        {stat.statistics?.unit && (
          <span className="stat-unit">{stat.statistics.unit}</span>
        )}
      </p>
    </article>
  );
}

export default StatCard;