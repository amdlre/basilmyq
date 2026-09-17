import { StatCard, type Stat } from "./stat-card";

type StatsGridProps = {
  stats: Stat[];
};

/** Used above every dashboard table, without exception. */
export function StatsGrid({ stats }: StatsGridProps) {
  if (stats.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
