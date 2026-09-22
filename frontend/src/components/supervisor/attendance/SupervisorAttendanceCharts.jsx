import { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card, Skeleton } from '../../../components/ui';

const STATUS_COLORS = {
  Present: '#22c55e',
  Late: '#f59e0b',
  Online: '#0ea5e9',
  Pending: '#cbd5e1',
  Absent: '#ef4444',
  Excused: '#8b5cf6',
};

const SupervisorAttendanceCharts = ({ dashboard, loading }) => {
  const counts = dashboard?.counts || {};
  const expected = dashboard?.expected || [];

  // Pie chart data: Status breakdown
  const pieData = useMemo(() => {
    const data = [];
    if (counts.present > 0) data.push({ name: 'Present', value: counts.present, color: STATUS_COLORS.Present });
    if (counts.late > 0) data.push({ name: 'Late', value: counts.late, color: STATUS_COLORS.Late });
    if (counts.remote > 0) data.push({ name: 'Online', value: counts.remote, color: STATUS_COLORS.Online });
    if (counts.pending > 0) data.push({ name: 'Pending', value: counts.pending, color: STATUS_COLORS.Pending });
    if (counts.absent > 0) data.push({ name: 'Absent', value: counts.absent, color: STATUS_COLORS.Absent });
    if (counts.excused > 0) data.push({ name: 'Excused', value: counts.excused, color: STATUS_COLORS.Excused });

    if (data.length === 0) {
      data.push({ name: 'No Data', value: 1, color: '#e2e8f0' });
    }
    return data;
  }, [counts.present, counts.late, counts.remote, counts.pending, counts.absent, counts.excused]);

  // Bar chart data: Department breakdown
  const deptData = useMemo(() => {
    const deptMap = new Map();
    expected.forEach((row) => {
      const dept = row.department_name || 'General';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { department: dept, present: 0, total: 0 });
      }
      const item = deptMap.get(dept);
      item.total += 1;
      if (row.status === 'present' || row.status === 'late' || row.status === 'remote') {
        item.present += 1;
      }
    });

    return Array.from(deptMap.values()).map((d) => ({
      ...d,
      attendanceRate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
    }));
  }, [expected]);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <Skeleton height="320px" borderRadius="14px" />
        <Skeleton height="320px" borderRadius="14px" />
      </div>
    );
  }

  const totalTracked = (counts.present || 0) + (counts.late || 0) + (counts.remote || 0) + (counts.pending || 0);
  const presentCount = (counts.present || 0) + (counts.late || 0) + (counts.remote || 0);
  const overallRate = totalTracked > 0 ? Math.round((presentCount / totalTracked) * 100) : 100;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
      {/* 1. Status Distribution Donut */}
      <Card
        header={
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Daily Attendance Breakdown
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--color-neutral-500)' }}>
              Proportion of present, late, online, and pending interns.
            </p>
          </div>
        }
      >
        <div style={{ width: '100%', height: '260px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                formatter={(value, name) => [`${value} intern${value === 1 ? '' : 's'}`, name]}
                contentStyle={{
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: 'none',
                  fontSize: '0.8125rem',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '0.8rem' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered KPI text */}
          <div style={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', display: 'block', lineHeight: 1 }}>
              {overallRate}%
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>
              Attendance Rate
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Department Breakdown Bar Chart */}
      <Card
        header={
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Department Attendance Rates
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--color-neutral-500)' }}>
              Credited attendance percentage across department cohorts.
            </p>
          </div>
        }
      >
        {deptData.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
            No department data available for this date.
          </div>
        ) : (
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 15, right: 15, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-200)" />
                <XAxis
                  dataKey="department"
                  tick={{ fill: 'var(--color-neutral-600)', fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: 'var(--color-neutral-500)', fontSize: 11 }}
                  unit="%"
                />
                <ChartTooltip
                  formatter={(value, name, props) => [`${value}% (${props.payload.present}/${props.payload.total} interns)`, 'Attendance Rate']}
                  contentStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: 'none',
                    fontSize: '0.8125rem',
                  }}
                />
                <Bar
                  dataKey="attendanceRate"
                  fill="var(--color-primary-500)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SupervisorAttendanceCharts;
