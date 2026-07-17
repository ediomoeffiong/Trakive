/**
 * @file GoalsList.jsx
 * @description Grid of GoalCard components with filter tabs and empty state.
 */

import { useState } from 'react';
import GoalCard from './GoalCard';
import { NoGoalsEmpty } from './ReviewEmptyStates';

const FILTER_TABS = [
  { key: 'all',             label: 'All Goals' },
  { key: 'in-progress',    label: 'In Progress' },
  { key: 'nearly-complete',label: 'Almost Done' },
  { key: 'completed',      label: 'Completed' },
];

const GoalsList = ({ goals = [] }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered =
    activeFilter === 'all' ? goals : goals.filter((g) => g.status === activeFilter);

  return (
    <section
      style={{
        background: 'var(--color-surface)',
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        padding: '1.75rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
          🎯 Development Goals
        </h2>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-primary-600)',
            background: 'var(--color-primary-50)',
            padding: '0.25rem 0.75rem',
            borderRadius: '99px',
          }}
        >
          {goals.length} goals
        </span>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.375rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.75rem',
        }}
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '0.5rem',
              border: '1px solid transparent',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: activeFilter === tab.key ? 'var(--color-primary-600)' : 'var(--color-neutral-100)',
              color: activeFilter === tab.key ? '#fff' : 'var(--color-neutral-600)',
            }}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span style={{ marginLeft: '0.35rem', opacity: 0.7 }}>
                ({goals.filter((g) => g.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {filtered.map((goal, i) => (
            <GoalCard key={goal.id} goal={goal} index={i} />
          ))}
        </div>
      ) : (
        <NoGoalsEmpty />
      )}
    </section>
  );
};

export default GoalsList;
