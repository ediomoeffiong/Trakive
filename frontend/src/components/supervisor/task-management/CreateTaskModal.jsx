/**
 * @file CreateTaskModal.jsx
 * @description Polished, mobile-responsive Create/Edit Task modal using React Hook Form.
 * Features:
 * - Searchable intern assignment with filter and chips
 * - Real file attachments with upload progress and backend service integration
 * - Configurable task objectives & deliverables
 * - One-click "Create & Assign" (auto-publishes and assigns)
 * - Dedicated "Save Draft" option
 * - Mobile-first responsive design
 */

import { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiCloseLine,
  RiAddLine,
  RiDeleteBin6Line,
  RiFileUploadLine,
  RiInformationLine,
  RiCheckLine,
  RiSearchLine,
  RiDraftLine,
  RiFileTextLine,
  RiFilePdfLine,
  RiFileWordLine,
  RiFileZipLine,
  RiImageLine,
  RiCodeLine,
  RiDownloadLine,
  RiUserLine,
  RiSendPlaneLine,
} from 'react-icons/ri';
import { TASK_CATEGORIES } from '../../../data/taskCategories';
import { internManagementService } from '../../../services/internManagementService';
import { taskManagementService } from '../../../services/taskManagementService';
import { useAppStore } from '../../../store/useAppStore';

const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'low', label: 'Low', color: '#22c55e' },
];

const SECTIONS = [
  { id: 'basic', label: 'Task Details' },
  { id: 'assignment', label: 'Assignment' },
  { id: 'objectives', label: 'Objectives & Deliverables' },
];

const FormField = ({ label, required, error, children, hint }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
    <label
      style={{
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: 'var(--color-neutral-700)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
      }}
    >
      {label}
      {required && <span style={{ color: '#ef4444' }}>*</span>}
      {hint && (
        <span title={hint} style={{ color: 'var(--color-neutral-400)', cursor: 'help' }}>
          <RiInformationLine style={{ fontSize: '0.875rem' }} />
        </span>
      )}
    </label>
    {children}
    {error && <p style={{ margin: 0, fontSize: '0.75rem', color: '#dc2626' }}>{error}</p>}
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.75rem',
  border: '1px solid var(--color-neutral-200)',
  background: '#fff',
  fontSize: '0.875rem',
  color: 'var(--color-neutral-800)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const focusStyle = {
  borderColor: '#00b4d8',
  boxShadow: '0 0 0 3px rgba(0,180,216,0.15)',
};

// ── Searchable Intern Selector ────────────────────────────────────────────────
const SearchableInternSelector = ({
  value = [],
  onChange,
  interns = [],
  loading = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const departments = useMemo(() => {
    const depts = new Set();
    interns.forEach((i) => {
      if (i.department) depts.add(i.department);
    });
    return ['all', ...Array.from(depts)];
  }, [interns]);

  const filteredInterns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return interns.filter((intern) => {
      const matchSearch =
        !q ||
        intern.name?.toLowerCase().includes(q) ||
        intern.email?.toLowerCase().includes(q) ||
        intern.department?.toLowerCase().includes(q) ||
        intern.role?.toLowerCase().includes(q);

      const matchDept =
        selectedDept === 'all' || intern.department === selectedDept;

      return matchSearch && matchDept;
    });
  }, [interns, search, selectedDept]);

  const toggleIntern = (intern) => {
    const exists = value.some((i) => i.id === intern.id);
    if (exists) {
      onChange(value.filter((i) => i.id !== intern.id));
    } else {
      onChange([
        ...value,
        {
          id: intern.id,
          name: intern.name,
          email: intern.email,
          department: intern.department,
          avatar: intern.avatar,
          initials:
            intern.initials ||
            intern.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase() ||
            'IN',
        },
      ]);
    }
  };

  const handleSelectAllFiltered = () => {
    const newItems = [...value];
    filteredInterns.forEach((intern) => {
      if (!newItems.some((i) => i.id === intern.id)) {
        newItems.push({
          id: intern.id,
          name: intern.name,
          email: intern.email,
          department: intern.department,
          avatar: intern.avatar,
          initials:
            intern.initials ||
            intern.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase() ||
            'IN',
        });
      }
    });
    onChange(newItems);
  };

  const handleClearSelection = () => {
    onChange([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Selected Interns Chips */}
      {value.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            padding: '0.625rem 0.75rem',
            background: '#f0fbfd',
            borderRadius: '0.75rem',
            border: '1px solid #cceef6',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#007791',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Assigned Interns ({value.length})
            </span>
            <button
              type="button"
              onClick={handleClearSelection}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0 0.25rem',
              }}
            >
              Clear all
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.375rem',
              maxHeight: '80px',
              overflowY: 'auto',
            }}
          >
            {value.map((intern) => (
              <span
                key={intern.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '9999px',
                  background: '#00b4d8',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <span>{intern.name}</span>
                <button
                  type="button"
                  onClick={() => toggleIntern(intern)}
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  title={`Remove ${intern.name}`}
                >
                  <RiCloseLine style={{ fontSize: '0.75rem' }} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar + Controls */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <RiSearchLine
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-neutral-400)',
              fontSize: '0.9375rem',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search interns by name, department, or role..."
            style={{
              ...inputStyle,
              paddingLeft: '2.25rem',
              paddingRight: search ? '2rem' : '0.875rem',
            }}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-neutral-200)';
              e.target.style.boxShadow = 'none';
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '0.625rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--color-neutral-400)',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <RiCloseLine />
            </button>
          )}
        </div>

        {departments.length > 2 && (
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{
              ...inputStyle,
              width: 'auto',
              flex: '0 0 auto',
              cursor: 'pointer',
            }}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        )}

        {filteredInterns.length > 0 && (
          <button
            type="button"
            onClick={handleSelectAllFiltered}
            style={{
              padding: '0.5625rem 0.875rem',
              borderRadius: '0.75rem',
              border: '1px solid #cceef6',
              background: '#f0fbfd',
              color: '#007791',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Select All ({filteredInterns.length})
          </button>
        )}
      </div>

      {/* Intern List */}
      <div
        style={{
          maxHeight: '220px',
          overflowY: 'auto',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '0.75rem',
          background: '#fff',
        }}
      >
        {loading && (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--color-neutral-500)', fontSize: '0.8125rem' }}>
            Loading interns directory...
          </div>
        )}

        {!loading && interns.length === 0 && (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-neutral-500)', fontSize: '0.8125rem' }}>
            No interns found in the organization yet.
          </div>
        )}

        {!loading && interns.length > 0 && filteredInterns.length === 0 && (
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
              No interns match "{search}"
            </p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
              Try searching with another name, or clear the search input.
            </p>
          </div>
        )}

        {!loading &&
          filteredInterns.map((intern, i) => {
            const isSelected = value.some((v) => v.id === intern.id);
            return (
              <div
                key={intern.id}
                onClick={() => toggleIntern(intern)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  cursor: 'pointer',
                  background: isSelected ? '#f0fbfd' : 'transparent',
                  borderBottom:
                    i < filteredInterns.length - 1
                      ? '1px solid var(--color-neutral-100)'
                      : 'none',
                  transition: 'background 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isSelected ? '#00b4d8' : '#e2e8f0',
                      color: isSelected ? '#fff' : '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {intern.initials ||
                      intern.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() ||
                      'IN'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        fontWeight: isSelected ? 700 : 600,
                        color: 'var(--color-neutral-800)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {intern.name}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: 'var(--color-neutral-400)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {intern.department || intern.role || 'Intern'}
                      {intern.email ? ` · ${intern.email}` : ''}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    border: isSelected ? '2px solid #00b4d8' : '2px solid var(--color-neutral-300)',
                    background: isSelected ? '#00b4d8' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '0.75rem',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isSelected && <RiCheckLine />}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

// ── Real Attachment Manager ──────────────────────────────────────────────────
const TaskAttachmentManager = ({ value = [], onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const getFileIcon = (fileName = '') => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return <RiFilePdfLine style={{ color: '#ef4444' }} />;
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return <RiFileWordLine style={{ color: '#2563eb' }} />;
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return <RiImageLine style={{ color: '#059669' }} />;
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) return <RiFileZipLine style={{ color: '#d97706' }} />;
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py'].includes(ext)) return <RiCodeLine style={{ color: '#7c3aed' }} />;
    return <RiFileTextLine style={{ color: '#00b4d8' }} />;
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(10);

    const newAttachments = [...value];
    let hasError = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const uploaded = await taskManagementService.uploadTaskAttachment(
          file,
          (progress) => {
            setUploadProgress(Math.round(((i + progress / 100) / files.length) * 100));
          }
        );
        newAttachments.push(uploaded);
      } catch (err) {
        hasError = true;
        console.error('File upload error:', err);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    onChange(newAttachments);

    if (hasError) {
      toast.error('Some files could not be uploaded.');
    } else {
      toast.success(`${files.length} file(s) attached.`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeAttachment = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--color-neutral-200)',
          borderRadius: '0.875rem',
          padding: '1.25rem 1rem',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: 'var(--color-neutral-50)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!uploading) {
            e.currentTarget.style.borderColor = '#00b4d8';
            e.currentTarget.style.background = '#f0fbfd';
          }
        }}
        onMouseLeave={(e) => {
          if (!uploading) {
            e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
            e.currentTarget.style.background = 'var(--color-neutral-50)';
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
          style={{ display: 'none' }}
        />
        <RiFileUploadLine style={{ fontSize: '1.75rem', marginBottom: '0.35rem', color: '#00b4d8' }} />
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
          Drop reference files here or <span style={{ color: '#00b4d8' }}>browse</span>
        </p>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
          Supports PDF, Word, images, code files, and archives (up to 25MB)
        </p>

        {uploading && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  background: '#00b4d8',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#00b4d8', fontWeight: 600, marginTop: '0.25rem', display: 'block' }}>
              Uploading attachment... {uploadProgress}%
            </span>
          </div>
        )}
      </div>

      {/* Uploaded Attachments List */}
      {value.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {value.map((file, i) => (
            <div
              key={file.id || i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.625rem',
                background: '#fff',
                border: '1px solid var(--color-neutral-200)',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <span style={{ fontSize: '1.25rem', display: 'flex', flexShrink: 0 }}>
                  {getFileIcon(file.name)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--color-neutral-800)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </p>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
                    {file.size}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                {file.url && (
                  <button
                    type="button"
                    onClick={() => taskManagementService.downloadAttachment(file)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#00b4d8',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                    }}
                    title="Download / View"
                  >
                    <RiDownloadLine />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                  }}
                  title="Remove file"
                >
                  <RiDeleteBin6Line />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Modal Component ──────────────────────────────────────────────────────
const CreateTaskModal = ({
  isOpen,
  onClose,
  editingTask,
  onSubmit,
  isLoading,
}) => {
  const [activeSection, setActiveSection] = useState('basic');
  const [interns, setInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(false);
  const isEditingExistingTask = Boolean(editingTask?.id);
  const supervisorDepartment = useAppStore(
    (state) => state.user?.department_name || state.user?.department || ''
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'Engineering',
      priority: 'medium',
      department: supervisorDepartment || 'FifthLab',
      assignedInterns: [],
      dueDate: '',
      objectives: [''],
      submissionRequirements: '',
      attachments: [],
    },
  });

  const {
    fields: objectiveFields,
    append: addObjective,
    remove: removeObjective,
  } = useFieldArray({ control, name: 'objectives' });

  const assignedInterns = watch('assignedInterns');
  const attachments = watch('attachments');

  useEffect(() => {
    if (!isOpen) return undefined;
    let mounted = true;
    const loadInterns = async () => {
      setLoadingInterns(true);
      try {
        const { interns: list } = await internManagementService.fetchInternList({ limit: 100 });
        if (!mounted) return;
        setInterns(
          (list || []).map((intern) => ({
            id: intern.id || intern.internId,
            name: intern.name,
            email: intern.email,
            department: intern.department || intern.role || 'Intern',
            avatar: intern.avatar,
            initials:
              intern.name
                ?.split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase() || 'IN',
          }))
        );
      } catch {
        if (mounted) setInterns([]);
      } finally {
        if (mounted) setLoadingInterns(false);
      }
    };
    loadInterns();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (editingTask) {
      const existingObjs =
        editingTask.objectives?.length
          ? editingTask.objectives
          : editingTask.learningObjectives?.length
          ? editingTask.learningObjectives
          : [''];

      reset({
        title: editingTask.title || '',
        description: editingTask.description || '',
        category: editingTask.category || 'Engineering',
        priority: editingTask.priority || 'medium',
        department: editingTask.department || supervisorDepartment || 'FifthLab',
        assignedInterns: editingTask.assignedInterns || [],
        dueDate: editingTask.dueDate || '',
        objectives: existingObjs,
        submissionRequirements: editingTask.submissionRequirements || '',
        attachments: editingTask.attachments || [],
      });
    } else {
      reset({
        title: '',
        description: '',
        category: 'Engineering',
        priority: 'medium',
        department: supervisorDepartment || 'FifthLab',
        assignedInterns: [],
        dueDate: '',
        objectives: [''],
        submissionRequirements: '',
        attachments: [],
      });
    }
  }, [editingTask, reset, isOpen, supervisorDepartment]);

  // Primary Action: Publish & Assign
  const onFormSubmit = async (data) => {
    try {
      await onSubmit({
        ...data,
        status: isEditingExistingTask && editingTask?.status !== 'draft' ? editingTask.status : 'assigned',
        department: supervisorDepartment || data.department,
        objectives: data.objectives.filter(Boolean),
        learningObjectives: data.objectives.filter(Boolean),
        attachments: data.attachments || [],
      });

      const count = data.assignedInterns?.length || 0;
      toast.success(
        isEditingExistingTask
          ? 'Task updated successfully!'
          : count > 0
          ? `Task published and assigned to ${count} intern(s)!`
          : 'Task published and created!'
      );
      onClose();
    } catch {
      toast.error('Failed to save task. Please try again.');
    }
  };

  // Secondary Action: Save as Draft
  const handleSaveDraft = async () => {
    const data = watch();
    if (!data.title?.trim()) {
      toast.error('Please enter a task title before saving as draft.');
      setActiveSection('basic');
      return;
    }

    try {
      await onSubmit({
        ...data,
        status: 'draft',
        department: supervisorDepartment || data.department,
        objectives: (data.objectives || []).filter(Boolean),
        learningObjectives: (data.objectives || []).filter(Boolean),
        attachments: data.attachments || [],
      });
      toast.success('Task saved as draft. You can view and edit it in the Drafts tab.');
      onClose();
    } catch {
      toast.error('Failed to save draft.');
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            zIndex: 9999,
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            boxSizing: 'border-box',
          }}
        >
          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              zIndex: 10000,
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              background: '#fff',
              borderRadius: '1.25rem',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.125rem 1.5rem',
                borderBottom: '1px solid var(--color-neutral-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                background: '#00b4d8',
                color: '#fff',
              }}
            >
              <div>
                <h2
                  id="task-modal-title"
                  style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}
                >
                  {isEditingExistingTask ? 'Edit Task' : 'Create Task'}
                </h2>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.8125rem', color: '#e0f7fc' }}>
                  {isEditingExistingTask
                    ? 'Update task parameters, assignment, and deliverables'
                    : 'Publish a new task with real deliverables and assign to interns'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '1.125rem',
                }}
                aria-label="Close modal"
              >
                <RiCloseLine />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 0,
                borderBottom: '1px solid var(--color-neutral-200)',
                flexShrink: 0,
                overflowX: 'auto',
                background: '#fff',
                padding: '0 0.5rem',
              }}
            >
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    borderBottom: activeSection === sec.id ? '2.5px solid #00b4d8' : '2.5px solid transparent',
                    color: activeSection === sec.id ? '#00b4d8' : 'var(--color-neutral-500)',
                    fontWeight: activeSection === sec.id ? 700 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {sec.label}
                  {sec.id === 'assignment' && assignedInterns?.length > 0 && (
                    <span
                      style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '9999px',
                        background: activeSection === sec.id ? '#00b4d8' : '#e2e8f0',
                        color: activeSection === sec.id ? '#fff' : '#475569',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                      }}
                    >
                      {assignedInterns.length}
                    </span>
                  )}
                  {sec.id === 'basic' && attachments?.length > 0 && (
                    <span
                      style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '9999px',
                        background: '#e0f7fc',
                        color: '#007791',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                      }}
                    >
                      📎 {attachments.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleSubmit(onFormSubmit)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {/* ── 1. Basic Info / Task Details ─────────────────────────────────── */}
                {activeSection === 'basic' && (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                  >
                    <FormField label="Task Title" required error={errors.title?.message}>
                      <input
                        {...register('title', {
                          required: 'Task title is required',
                          minLength: { value: 3, message: 'Minimum 3 characters' },
                        })}
                        placeholder="e.g. Build User Authentication UI & Responsive Navigation"
                        style={{ ...inputStyle }}
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--color-neutral-200)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </FormField>

                    <FormField label="Description" required error={errors.description?.message}>
                      <textarea
                        {...register('description', { required: 'Description is required' })}
                        rows={3}
                        placeholder="Provide a clear, detailed overview of what needs to be accomplished..."
                        style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--color-neutral-200)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </FormField>

                    {/* Responsive 2-column or stacked fields */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      <FormField label="Category">
                        <select {...register('category')} style={{ ...inputStyle, cursor: 'pointer' }}>
                          {TASK_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Priority" required>
                        <select {...register('priority', { required: true })} style={{ ...inputStyle, cursor: 'pointer' }}>
                          {PRIORITIES.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label} Priority
                            </option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Due Date" required error={errors.dueDate?.message}>
                        <input
                          type="date"
                          {...register('dueDate', { required: 'Due date is required' })}
                          style={{ ...inputStyle }}
                          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--color-neutral-200)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </FormField>
                    </div>

                    <FormField
                      label="Submission Requirements"
                      hint="Specify what deliverables the intern must submit"
                    >
                      <textarea
                        {...register('submissionRequirements')}
                        rows={2}
                        placeholder="e.g. Pull Request link, screenshots of the UI, and a short summary walkthrough..."
                        style={{ ...inputStyle, resize: 'vertical' }}
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--color-neutral-200)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </FormField>

                    {/* Real Attachments Upload Manager */}
                    <FormField
                      label="Attachments & Reference Files"
                      hint="Upload reference docs, mockups, or specifications"
                    >
                      <TaskAttachmentManager
                        value={attachments}
                        onChange={(files) => setValue('attachments', files, { shouldDirty: true })}
                      />
                    </FormField>
                  </motion.div>
                )}

                {/* ── 2. Assignment Section ────────────────────────────────────────── */}
                {activeSection === 'assignment' && (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#f0fbfd',
                        borderRadius: '0.75rem',
                        border: '1px solid #cceef6',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#007791', fontWeight: 600 }}>
                        Search and select the interns assigned to this task. Once published, the task will be immediately active on their dashboard.
                      </p>
                    </div>

                    <FormField label="Assigned Interns">
                      <SearchableInternSelector
                        value={assignedInterns}
                        onChange={(newAssigned) =>
                          setValue('assignedInterns', newAssigned, { shouldDirty: true })
                        }
                        interns={interns}
                        loading={loadingInterns}
                      />
                    </FormField>
                  </motion.div>
                )}

                {/* ── 3. Objectives & Deliverables Section ──────────────────────────── */}
                {activeSection === 'objectives' && (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#f8fafc',
                        borderRadius: '0.75rem',
                        border: '1px solid var(--color-neutral-200)',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', fontWeight: 600 }}>
                        Task Objectives & Key Deliverables
                      </p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: 1.45 }}>
                        Specify the core objectives, required deliverables, or acceptance criteria for this task. Tasks can be product features, bug fixes, research, or documentation.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {objectiveFields.map((field, index) => (
                        <div
                          key={field.id}
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: 700,
                              color: '#00b4d8',
                              minWidth: '1.5rem',
                              textAlign: 'center',
                            }}
                          >
                            {index + 1}.
                          </span>
                          <input
                            {...register(`objectives.${index}`)}
                            placeholder={`Objective / Deliverable ${index + 1} (e.g. Pass all unit tests and submit PR)`}
                            style={{ ...inputStyle, flex: 1 }}
                            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'var(--color-neutral-200)';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                          {objectiveFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeObjective(index)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '0.5rem',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                color: '#dc2626',
                                display: 'flex',
                                flexShrink: 0,
                              }}
                              title="Remove objective"
                            >
                              <RiDeleteBin6Line />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addObjective('')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        padding: '0.5625rem 1rem',
                        border: '1.5px dashed #90e0ef',
                        borderRadius: '0.75rem',
                        background: '#f0fbfd',
                        color: '#007791',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      <RiAddLine /> Add Objective or Deliverable
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div
                style={{
                  padding: '0.875rem 1.25rem',
                  borderTop: '1px solid var(--color-neutral-200)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexShrink: 0,
                  background: 'var(--color-neutral-50)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '0.5625rem 0.875rem',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--color-neutral-200)',
                      background: '#fff',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--color-neutral-600)',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5625rem 0.875rem',
                      borderRadius: '0.75rem',
                      border: '1.5px dashed #90e0ef',
                      background: '#e0f7fc',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: '#007791',
                      cursor: 'pointer',
                    }}
                  >
                    <RiDraftLine /> Save Draft
                  </button>
                </div>

                <motion.button
                  whileHover={{ y: -1, boxShadow: '0 8px 24px rgba(0,180,216,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.625rem 1.375rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: '#00b4d8',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    boxShadow: '0 4px 14px rgba(0,180,216,0.25)',
                  }}
                >
                  <RiSendPlaneLine style={{ fontSize: '1rem' }} />
                  {isLoading
                    ? 'Saving...'
                    : isEditingExistingTask
                    ? 'Update Task'
                    : 'Create & Assign'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CreateTaskModal;
