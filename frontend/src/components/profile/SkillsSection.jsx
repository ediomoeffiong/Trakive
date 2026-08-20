/**
 * @file SkillsSection.jsx
 * @description Skills & competencies section with add/edit/delete
 * functionality and proficiency progress bars.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useProfileStore } from '../../store/useProfileStore';
import { PROFICIENCY_LEVELS, SKILL_CATEGORIES } from '../../data/skills';
import ProfileEmptyState from './ProfileEmptyState';
import { SkillsSkeleton } from './ProfileSkeletons';

// ── Proficiency Badge ─────────────────────────────────────────────────────────

const PROFICIENCY_COLORS = {
  Beginner:     { bg: '#fef2f2', color: '#dc2626' },
  Intermediate: { bg: '#fffbeb', color: '#d97706' },
  Advanced:     { bg: '#eff6ff', color: '#2563eb' },
  Expert:       { bg: '#f0fdf4', color: '#16a34a' },
};

const ProficiencyBadge = ({ level }) => {
  const c = PROFICIENCY_COLORS[level] ?? { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.625rem',
        borderRadius: 99,
        fontSize: '0.73rem',
        fontWeight: 700,
        background: c.bg,
        color: c.color,
        whiteSpace: 'nowrap',
      }}
    >
      {level}
    </span>
  );
};

// ── Skill Row ─────────────────────────────────────────────────────────────────

const SkillRow = ({ skill, onEdit, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -12, height: 0 }}
    transition={{ duration: 0.25 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
      padding: '0.875rem 1rem',
      background: 'var(--color-neutral-50)',
      border: '1px solid var(--color-neutral-200)',
      borderRadius: '0.75rem',
    }}
  >
    {/* Colour dot icon */}
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: '0.625rem',
        background: `${skill.color}15`,
        border: `1.5px solid ${skill.color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: skill.color }} />
    </div>

    {/* Info */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
          {skill.name}
        </p>
        <span
          style={{
            fontSize: '0.7rem',
            color: 'var(--color-neutral-500)',
            background: 'var(--color-neutral-200)',
            padding: '0.1rem 0.4rem',
            borderRadius: 99,
          }}
        >
          {skill.category}
        </span>
      </div>
      {/* Progress bar */}
      <div style={{ height: 5, background: 'var(--color-neutral-200)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${skill.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: skill.color, borderRadius: 99 }}
        />
      </div>
    </div>

    <ProficiencyBadge level={skill.proficiency} />

    {/* Actions */}
    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
      <button
        className="btn btn-ghost btn-icon"
        style={{ fontSize: '0.85rem', padding: '0.375rem' }}
        onClick={() => onEdit(skill)}
        aria-label={`Edit ${skill.name}`}
        title="Edit skill"
      >
        Edit
      </button>
      <button
        className="btn btn-ghost btn-icon"
        style={{ fontSize: '0.85rem', padding: '0.375rem', color: 'var(--color-danger-500)' }}
        onClick={() => onRemove(skill.id)}
        aria-label={`Remove ${skill.name}`}
        title="Remove skill"
      >
        Remove
      </button>
    </div>
  </motion.div>
);

// ── Add / Edit Modal ──────────────────────────────────────────────────────────

const SkillModal = ({ editTarget, onClose }) => {
  const { addSkill, updateSkill } = useProfileStore();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: editTarget
      ? {
          name:        editTarget.name,
          category:    editTarget.category,
          proficiency: editTarget.proficiency,
        }
      : { name: '', category: 'Technical', proficiency: 'Intermediate' },
  });

  const proficiencyWatch = watch('proficiency');
  const levelData = PROFICIENCY_LEVELS.find((l) => l.value === proficiencyWatch);

  const SKILL_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ec4899', '#8b5cf6', '#f97316', '#0ea5e9'];

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        percentage: levelData?.percentage ?? 50,
        color: editTarget?.color ?? SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)],
      };
      if (editTarget) {
        await updateSkill(editTarget.id, payload);
        toast.success('Skill updated!');
      } else {
        await addSkill(payload);
        toast.success('Skill added!');
      }
      onClose();
    } catch {
      toast.error('Failed to save skill. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1.5px solid var(--color-neutral-200)',
    borderRadius: '0.625rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    background: '#fff',
    color: 'var(--color-neutral-800)',
    outline: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{ position: 'relative', background: '#fff', borderRadius: '1.25rem', padding: '1.75rem', width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
            {editTarget ? 'Edit Skill' : 'Add Skill'}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>Close</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Skill name */}
            <div>
              <label htmlFor="skill-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
                Skill Name *
              </label>
              <input
                id="skill-name"
                style={errors.name ? { ...inputStyle, borderColor: 'var(--color-danger-400)' } : inputStyle}
                placeholder="e.g. JavaScript"
                {...register('name', { required: 'Skill name is required' })}
              />
              {errors.name && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-danger-600)', marginTop: '0.25rem' }}>⚠ {errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="skill-category" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
                Category
              </label>
              <select id="skill-category" style={inputStyle} {...register('category')}>
                {SKILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Proficiency */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.625rem' }}>
                Proficiency Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {PROFICIENCY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    htmlFor={`prof-${level.value}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 0.75rem',
                      border: `1.5px solid ${proficiencyWatch === level.value ? 'var(--color-primary-400)' : 'var(--color-neutral-200)'}`,
                      borderRadius: '0.625rem',
                      cursor: 'pointer',
                      background: proficiencyWatch === level.value ? 'var(--color-primary-50)' : '#fff',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input id={`prof-${level.value}`} type="radio" value={level.value} {...register('proficiency')} style={{ display: 'none' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>{level.label}</p>
                      <div style={{ height: 4, background: 'var(--color-neutral-200)', borderRadius: 99, marginTop: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${level.percentage}%`, height: '100%', background: 'var(--color-primary-500)', borderRadius: 99 }} />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving} id="save-skill-btn">
              {saving ? 'Saving...' : editTarget ? 'Update Skill' : 'Add Skill'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Main Section ──────────────────────────────────────────────────────────────

const SkillsSection = () => {
  const { skills, removeSkill, loadingSkills, addSkillOpen, editSkillTarget, setAddSkillOpen, setEditSkillTarget } =
    useProfileStore();

  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (skillId) => {
    setRemovingId(skillId);
    try {
      await removeSkill(skillId);
      toast.success('Skill removed.');
    } catch {
      toast.error('Failed to remove skill.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleEdit = (skill) => {
    setEditSkillTarget(skill);
    setAddSkillOpen(true);
  };

  const handleCloseModal = () => {
    setAddSkillOpen(false);
    setEditSkillTarget(null);
  };

  if (loadingSkills) return <SkillsSkeleton />;

  // Group by category
  const technical = skills.filter((s) => s.category === 'Technical');
  const soft      = skills.filter((s) => s.category === 'Soft Skill');
  const other     = skills.filter((s) => !['Technical', 'Soft Skill'].includes(s.category));

  const renderGroup = (label, icon, list) =>
    list.length > 0 && (
      <div key={label} style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {icon ? `${icon} ${label}` : label}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <AnimatePresence>
            {list.map((skill) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                onEdit={handleEdit}
                onRemove={handleRemove}
                removing={removingId === skill.id}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );

  return (
    <>
      <div className="card p-6">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Skills & Competencies</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                {skills.length} skill{skills.length !== 1 ? 's' : ''} listed
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setAddSkillOpen(true)}
            id="add-skill-btn"
          >
            Add Skill
          </button>
        </div>

        {/* Skill list or empty state */}
        {skills.length === 0 ? (
          <ProfileEmptyState
            icon=""
            title="No skills added yet"
            description="Add your technical and soft skills to show employers what you bring to the table."
            actionLabel="Add your first skill"
            onAction={() => setAddSkillOpen(true)}
            compact
          />
        ) : (
          <>
            {renderGroup('Technical Skills', '', technical)}
            {renderGroup('Soft Skills', '', soft)}
            {renderGroup('Other', '', other)}
          </>
        )}
      </div>

      {/* Skill Modal */}
      <AnimatePresence>
        {addSkillOpen && (
          <SkillModal editTarget={editSkillTarget} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </>
  );
};

export default SkillsSection;
