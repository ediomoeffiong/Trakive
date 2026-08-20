/**
 * @file InternOverviewTable.jsx
 * @description Reusable intern roster table with search, sorting, filtering, pagination, and quick actions.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiSearchLine,
  RiFilter3Line,
  RiArrowUpDownLine,
  RiMore2Fill,
  RiStarFill,
  RiEyeLine,
  RiTaskLine,
  RiUserFollowLine,
} from 'react-icons/ri';
import Avatar from '../ui/Avatar';
import EmptyStates from './EmptyStates';

const DEPARTMENTS = ['All', 'Frontend Engineering', 'Backend Engineering', 'UI/UX Design', 'DevOps', 'Product Management', 'Data Science'];
const STATUSES = ['All', 'Active', 'Pending Review', 'Needs Help', 'On Leave'];

const STATUS_STYLING = {
  Active: { bg: '#dcfce7', text: '#15803d' },
  'Pending Review': { bg: '#fef3c7', text: '#b45309' },
  'Needs Help': { bg: '#fee2e2', text: '#b91c1c' },
  'On Leave': { bg: '#f3f4f6', text: '#4b5563' },
};

const InternOverviewTable = ({ interns = [], isLoading = false }) => {
  const navigate = useNavigate();

  // Local State
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filter & Sort Logic
  const filteredInterns = useMemo(() => {
    return interns
      .filter((intern) => {
        const matchesSearch =
          intern.name.toLowerCase().includes(search.toLowerCase()) ||
          intern.currentTask.toLowerCase().includes(search.toLowerCase()) ||
          intern.email.toLowerCase().includes(search.toLowerCase());
        const matchesDept = department === 'All' || intern.department === department;
        const matchesStatus = status === 'All' || intern.status === status;
        return matchesSearch && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [interns, search, department, status, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredInterns.length / pageSize) || 1;
  const paginatedInterns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInterns.slice(start, start + pageSize);
  }, [filteredInterns, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRowClick = (internId) => {
    navigate(`/supervisor/interns/${internId}`);
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Table Header Controls */}
      <div
        style={{
          padding: '1.25rem',
          borderBottom: '1px solid var(--color-neutral-200)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Intern Overview Roster
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
            Track active interns, current assignments, and performance ratings
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '220px' }}>
            <RiSearchLine
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-neutral-400)',
              }}
            />
            <input
              type="text"
              placeholder="Search intern or task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem', height: '36px', fontSize: '0.8125rem' }}
            />
          </div>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field"
            style={{ height: '36px', fontSize: '0.8125rem', padding: '0 0.5rem', width: '160px' }}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field"
            style={{ height: '36px', fontSize: '0.8125rem', padding: '0 0.5rem', width: '140px' }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)', color: 'var(--color-neutral-600)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleSort('name')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  Intern Name <RiArrowUpDownLine />
                </div>
              </th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Department</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Current Task</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleSort('performanceScore')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  Rating <RiArrowUpDownLine />
                </div>
              </th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleSort('onboardingProgress')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  Onboarding <RiArrowUpDownLine />
                </div>
              </th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Last Active</th>
              <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedInterns.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem' }}>
                    <EmptyStates type="no-interns" message="No interns found matching your current filter criteria." />
                  </td>
                </tr>
              ) : (
                paginatedInterns.map((intern) => {
                  const statusStyle = STATUS_STYLING[intern.status] || STATUS_STYLING.Active;
                  return (
                    <motion.tr
                      key={intern.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ backgroundColor: 'var(--color-neutral-50)' }}
                      onClick={() => handleRowClick(intern.id)}
                      style={{
                        borderBottom: '1px solid var(--color-neutral-100)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Avatar name={intern.name} src={intern.avatar} size="md" />
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                              {intern.name}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                              {intern.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontWeight: 500, color: 'var(--color-neutral-700)' }}>
                          {intern.department}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', maxWidth: '200px' }}>
                        <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-neutral-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {intern.currentTask}
                        </p>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                          <RiStarFill style={{ color: '#f59e0b', fontSize: '0.95rem' }} />
                          {intern.performanceScore}
                        </div>
                      </td>

                      <td style={{ padding: '1rem', minWidth: '130px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                            <span>{intern.onboardingProgress}%</span>
                          </div>
                          <div style={{ height: '6px', width: '100%', background: 'var(--color-neutral-200)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${intern.onboardingProgress}%`,
                                background: 'linear-gradient(90deg, #4f46e5 0%, #10b981 100%)',
                                borderRadius: '99px',
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                          }}
                        >
                          {intern.status}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                        {intern.lastActivity}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            className="btn btn-ghost btn-icon"
                            title="View Profile"
                            onClick={() => handleRowClick(intern.id)}
                            style={{ fontSize: '1rem', padding: '0.35rem' }}
                          >
                            <RiEyeLine />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon"
                            title="Assign Task"
                            onClick={() => toast.success(`Assign task form opened for ${intern.name}`)}
                            style={{ fontSize: '1rem', padding: '0.35rem', color: 'var(--color-primary-600)' }}
                          >
                            <RiTaskLine />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Table Pagination */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--color-neutral-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          color: 'var(--color-neutral-500)',
        }}
      >
        <span>
          Showing {filteredInterns.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredInterns.length)} of {filteredInterns.length} interns
        </span>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
          >
            Previous
          </button>
          <button
            className="btn btn-secondary"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternOverviewTable;
