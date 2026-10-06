"use client";

type ProgressBarProps = {
  step: number;
  total: number;
};

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const percent = (step / total) * 100;

  return (
    <div className="w-full" aria-hidden="true">
      <div className="mb-2 flex justify-between text-xs font-medium text-[var(--muted)]">
        <span>
          Step {step} of {total}
        </span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
