import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatMoney } from "../../utils/formatMoney";
import type { BudgetPeriodStats } from "../../services/expense.service";

interface PeriodRowProps {
  label: string;
  stats: BudgetPeriodStats;
}

function PeriodRow({ label, stats }: PeriodRowProps) {
  const { limit, spent, remaining, percentageUsed, isExceeded, overBy } = stats;
  const isNear = !isExceeded && percentageUsed >= 80;
  const pct = Math.min(percentageUsed, 100);

  const barColor = isExceeded
    ? "bg-rose-500"
    : isNear
    ? "bg-amber-400"
    : "bg-emerald-500";

  const textColor = isExceeded
    ? "text-rose-700"
    : isNear
    ? "text-amber-700"
    : "text-emerald-700";

  const subTextColor = isExceeded ? "text-rose-500" : "text-gray-500";

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
          {label}
        </span>
        <span className={`text-xs font-bold tabular-nums ${textColor}`}>
          {formatMoney(spent)} / {formatMoney(limit)}
        </span>
      </div>

      {/* progress bar */}
      <div className="w-full bg-gray-200/70 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* sub-line */}
      <p className={`text-xs mt-1 ${subTextColor}`}>
        {isExceeded ? (
          <>
            Over by{" "}
            <span className="font-semibold text-rose-600">{formatMoney(overBy)}</span>
          </>
        ) : (
          <>
            <span className="font-semibold text-gray-700">{formatMoney(remaining)}</span>{" "}
            remaining · {pct.toFixed(0)}% used
          </>
        )}
      </p>
    </div>
  );
}

interface BudgetStatusBannerProps {
  monthly: BudgetPeriodStats;
  yearly: BudgetPeriodStats;
}

/**
 * Shared banner shown on both the Dashboard and Expenses pages.
 * Renders nothing when neither budget is configured.
 */
export default function BudgetStatusBanner({ monthly, yearly }: BudgetStatusBannerProps) {
  const hasMonthly = monthly.limit > 0;
  const hasYearly = yearly.limit > 0;

  if (!hasMonthly && !hasYearly) return null;

  const anyExceeded = (hasMonthly && monthly.isExceeded) || (hasYearly && yearly.isExceeded);
  const anyNear =
    !anyExceeded &&
    ((hasMonthly && monthly.percentageUsed >= 80) ||
      (hasYearly && yearly.percentageUsed >= 80));

  const borderClass = anyExceeded
    ? "border-rose-200 bg-rose-50"
    : anyNear
    ? "border-amber-200 bg-amber-50"
    : "border-emerald-200 bg-emerald-50";

  const Icon = anyExceeded ? AlertTriangle : anyNear ? TrendingUp : CheckCircle2;
  const iconColor = anyExceeded
    ? "text-rose-500"
    : anyNear
    ? "text-amber-500"
    : "text-emerald-500";

  const headline = anyExceeded
    ? "Budget limit exceeded"
    : anyNear
    ? "Approaching budget limit"
    : "Budget on track";

  const headlineColor = anyExceeded
    ? "text-rose-700"
    : anyNear
    ? "text-amber-700"
    : "text-emerald-700";

  return (
    <div className={`rounded-2xl border px-5 py-4 shadow-sm ${borderClass}`}>
      {/* top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className={iconColor} strokeWidth={2} />
          <span className={`text-sm font-bold ${headlineColor}`}>{headline}</span>
        </div>
        <Link
          to="/dashboard/budgets"
          className="text-xs font-medium text-blue-600 hover:underline whitespace-nowrap"
        >
          Manage →
        </Link>
      </div>

      {/* period rows */}
      <div className="flex flex-col sm:flex-row gap-4">
        {hasMonthly && <PeriodRow label="Monthly" stats={monthly} />}
        {hasMonthly && hasYearly && (
          <div className="hidden sm:block w-px bg-gray-200 self-stretch" />
        )}
        {hasYearly && <PeriodRow label="Yearly" stats={yearly} />}
      </div>
    </div>
  );
}
