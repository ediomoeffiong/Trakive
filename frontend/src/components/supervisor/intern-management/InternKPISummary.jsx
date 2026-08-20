/**
 * @file InternKPISummary.jsx
 * @description KPI summary row for the Intern Management dashboard.
 * Reuses the existing KPICard component from the Supervisor Dashboard.
 */

import KPICard from '../KPICard';
import { InternKPILoader } from './InternSkeletonLoaders';

const InternKPISummary = ({ kpis = [], isLoading = false }) => {
  if (isLoading) {
    return <InternKPILoader />;
  }

  return (
    <section aria-label="Intern Management KPIs">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {kpis.map((card, idx) => (
          <KPICard key={card.id} card={card} index={idx} />
        ))}
      </div>
    </section>
  );
};

export default InternKPISummary;
