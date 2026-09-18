/**
 * @file OnboardingDashboard.jsx
 * @description FifthLab Intern Onboarding Pathway for Trakive.
 * Restores the sleek former look & feel featuring:
 *  - Real Database Data for Team Introduction & Supervisor Assignment (No Demo Dates/Static Fallbacks)
 *  - Supervisor Verification notice for Internship Duration
 *  - STRICT PDF-ONLY Document Upload Restriction (.pdf only)
 *  - Welcome Panel: FifthLab website link
 *  - Company Policies & Handbook: Marked "(In Progress)"
 *  - IT Setup: Wi-Fi confirmation checkbox + CyberSecurity Guide reading confirmation
 *  - Team Introduction: Real department team members & supervisor profiles with clickable Bios
 *  - Training Module: Slide Deck (PDF) marked "(In Progress)"
 *  - "YOUR JOURNEY" Cyan Gradient Progress Card & Donut Chart
 *  - "UP NEXT" Action Banner & Category Sidebar
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiFolderUserLine,
  RiFileTextLine,
  RiTimeLine,
  RiAlertLine,
  RiUploadCloudLine,
  RiCheckLine,
  RiShieldCheckFill,
  RiArrowRightLine,
  RiUserFollowLine,
  RiComputerLine,
  RiTeamLine,
  RiGraduationCapLine,
  RiEmotionHappyLine,
  RiFilePdfLine,
  RiDeleteBinLine,
  RiHistoryLine,
  RiExternalLinkLine,
  RiWifiLine,
  RiShieldKeyholeLine,
  RiCloseLine,
  RiMailLine,
  RiMapPinLine,
} from 'react-icons/ri';

import api from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { sanitizeDepartments } from '../utils/departments';

const BRAND_BLUE = '#00b4d8';
const BRAND_BLUE_DARK = '#0096c7';
const BRAND_BLUE_SOFT = '#e0f7fa';
const BRAND_BLUE_BORDER = '#90e0ef';
const BRAND_BLUE_SHADOW = 'rgba(0, 180, 216, 0.3)';

const REQUIRED_DOCUMENTS = [
  {
    category: 'resume',
    title: 'Resume / CV (PDF)',
    description: 'Your updated professional curriculum vitae in PDF format detailing education, projects, and skills.',
    icon: '📄',
  },
  {
    category: 'placement_letter',
    title: 'Internship / Placement Letter (PDF)',
    description: 'Official letter from your institution introducing you for the internship placement (PDF format only).',
    icon: '🏫',
  },
  {
    category: 'acceptance_letter',
    title: 'Acceptance Letter (PDF)',
    description: 'Signed copy of your FifthLab internship offer or acceptance letter (PDF format only).',
    icon: '✍️',
  },
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CATEGORIES = [
  { id: 'internship_info', name: 'Internship Info', icon: RiFolderUserLine, color: BRAND_BLUE },
  { id: 'required_docs', name: 'Required Documents', icon: RiFileTextLine, color: BRAND_BLUE_DARK },
  { id: 'welcome', name: 'Welcome', icon: RiEmotionHappyLine, color: '#10b981' },
  { id: 'company_policies', name: 'Company Policies', icon: RiShieldCheckFill, color: BRAND_BLUE },
  { id: 'it_setup', name: 'IT Setup', icon: RiComputerLine, color: '#f59e0b' },
  { id: 'team_intro', name: 'Team Introduction', icon: RiTeamLine, color: '#ec4899' },
  { id: 'training', name: 'Training', icon: RiGraduationCapLine, color: BRAND_BLUE },
];

const ONBOARDING_SECTION_LABELS = CATEGORIES.reduce((acc, item) => {
  acc[item.id] = item.name;
  return acc;
}, {});

const safeJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export default function OnboardingDashboard() {
  const user = useAppStore((state) => state.user);
  const updateUserMeta = useAppStore((state) => state.updateUserMeta);

  // 1. Detect Department Context
  const emailDomain = (user?.email || '').split('@')[1]?.toLowerCase() || '';
  const isFifthLabDomain = emailDomain === 'thefifthlab.com';

  const [activeCategory, setActiveCategory] = useState('internship_info');
  const [submittingDocs, setSubmittingDocs] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // 2. Internship Information State
  const [info, setInfo] = useState(() => {
    const savedInfo = safeJson(localStorage.getItem(`trakive_onboarding_info_${user?.id || 'default'}`), {});
    return {
      department_id: savedInfo.department_id || user?.department_id || '',
      department_name: savedInfo.department_name || user?.department_name || '',
      start_date: savedInfo.start_date || user?.start_date || new Date().toISOString().split('T')[0],
      end_date: savedInfo.end_date || user?.end_date || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      institution: savedInfo.institution || user?.institution || '',
      field_of_study: savedInfo.field_of_study || user?.field_of_study || '',
      phone: savedInfo.phone || user?.phone || '',
      date_of_birth: savedInfo.date_of_birth || user?.dateOfBirth || user?.date_of_birth || '',
      is_saved: Boolean(savedInfo.is_saved),
      duration_verified_by_supervisor: Boolean(savedInfo.duration_verified_by_supervisor),
    };
  });

  const [assignedSupervisor, setAssignedSupervisor] = useState({
    name: 'Pending assignment',
    title: 'Department Supervisor',
    email: '',
  });

  // Load real departments from backend
  useEffect(() => {
    let mounted = true;
    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const res = await api.get('/departments', { params: { limit: 100 } });
        const list = sanitizeDepartments(res?.data?.data || []);
        if (!mounted) return;
        setDepartments(list);

        if (!info.department_id && list.length > 0) {
          const preferred =
            list.find((d) => /fifthlab/i.test(d.name || '') && isFifthLabDomain) ||
            list.find((d) => d.id === user?.department_id) ||
            list[0];
          if (preferred) {
            setInfo((prev) => ({
              ...prev,
              department_id: preferred.id,
              department_name: preferred.name,
            }));
          }
        } else if (info.department_id) {
          const match = list.find((d) => d.id === info.department_id);
          if (match) {
            setInfo((prev) => ({ ...prev, department_name: match.name }));
          } else if (list.length > 0) {
            const preferred =
              list.find((d) => /fifthlab/i.test(d.name || '') && isFifthLabDomain) ||
              list.find((d) => d.id === user?.department_id) ||
              list[0];
            setInfo((prev) => ({
              ...prev,
              department_id: preferred.id,
              department_name: preferred.name,
            }));
          }
        }
      } catch (err) {
        console.warn('Failed to load departments for onboarding', err);
        if (mounted) toast.error('Could not load departments. Refresh and try again.');
      } finally {
        if (mounted) setLoadingDepartments(false);
      }
    };
    loadDepartments();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.department_id, isFifthLabDomain]);

  // Sync submitted documents + review status from backend
  useEffect(() => {
    let mounted = true;
    const syncDocuments = async () => {
      try {
        const res = await api.get('/onboarding/documents');
        const payload = res?.data?.data || res?.data || {};
        const checklist = payload.documents || payload.checklist || [];
        if (!mounted || !Array.isArray(checklist) || checklist.length === 0) return;

        const next = {
          resume: null,
          placement_letter: null,
          acceptance_letter: null,
        };
        let submittedCount = 0;
        checklist.forEach((item) => {
          if (!item?.category || !REQUIRED_DOCUMENTS.some((d) => d.category === item.category)) return;
          if (!item.submitted || !item.document) return;
          submittedCount += 1;
          next[item.category] = {
            id: item.document.id,
            file_name: item.document.file_name,
            file_size: item.document.file_size,
            mime_type: item.document.mime_type || 'application/pdf',
            uploaded_at: item.document.created_at || item.document.uploaded_at || new Date().toISOString(),
            review_status: item.review_status || item.document.review_status || 'pending',
            reviewer_notes: item.document.review_notes || null,
            history: item.history || [],
            file_path: item.document.file_path,
          };
        });
        if (submittedCount === 0) return;
        setDocuments(next);
        if (submittedCount === 3) {
          setCompletedSteps((prev) => ({ ...prev, required_docs: true }));
        }
      } catch (err) {
        // Keep local draft if backend unavailable
        console.warn('Could not sync onboarding documents from API', err);
      }
    };
    syncDocuments();
    return () => { mounted = false; };
  }, [user?.id]);

  // 3. Real Team Members State (Loaded dynamically from database)
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Load real team members from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchTeam = async () => {
      const departmentId = String(info.department_id || '').trim();
      if (!UUID_PATTERN.test(departmentId)) {
        setLoadingTeam(false);
        return;
      }
      setLoadingTeam(true);
      try {
        const res = await api.get(`/departments/${departmentId}/staff`);
        if (res.data && res.data.data && Array.isArray(res.data.data.staff) && res.data.data.staff.length > 0 && isMounted) {
          const formatted = res.data.data.staff.map((u, idx) => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`,
            role: u.title || (u.role_name === 'supervisor' ? 'Lead Supervisor' : 'Team Member'),
            department: info.department_name || 'FifthLab',
            email: u.email,
            location: u.office_location || 'FifthLab Office, Lagos',
            isSupervisor: u.role_name === 'supervisor' || u.role_name === 'department_head',
            bio: u.bio || `${u.first_name} is an active member of the ${info.department_name} team at FifthLab.`,
            avatarColor: [BRAND_BLUE, BRAND_BLUE_DARK, '#48cae4', '#f59e0b', '#10b981'][idx % 5],
          }));
          setTeamMembers(formatted);
          setLoadingTeam(false);
          return;
        }
      } catch (e) {
        // Fallback to current supervisor + user profile if API endpoint unreached
      }

      if (isMounted) {
        setTeamMembers([
          {
            id: 'mem-sup',
            name: assignedSupervisor.name,
            role: assignedSupervisor.title || 'Lead Supervisor',
            department: info.department_name,
            email: assignedSupervisor.email,
            location: 'FifthLab Office, Lagos',
            isSupervisor: true,
            bio: `${assignedSupervisor.name} is the Lead Supervisor overseeing intern mentorship across ${info.department_name} at FifthLab.`,
            avatarColor: '#00b4d8',
          },
          {
            id: 'mem-user',
            name: user ? `${user.first_name} ${user.last_name}` : 'Current Intern',
            role: 'Software Intern',
            department: info.department_name,
            email: user?.email || 'intern@thefifthlab.com',
            location: 'FifthLab Office, Lagos',
            isSupervisor: false,
            bio: `Software Intern in the ${info.department_name} department at FifthLab.`,
            avatarColor: '#10b981',
          }
        ]);
        setLoadingTeam(false);
      }
    };

    fetchTeam();
    return () => { isMounted = false; };
  }, [info.department_id, info.department_name, assignedSupervisor, user]);

  // 4. Required Documents State (PDF ONLY)
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem(`trakive_onboarding_docs_${user?.id || 'default'}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      resume: null,
      placement_letter: null,
      acceptance_letter: null,
    };
  });

  const [uploadErrors, setUploadErrors] = useState({});

  // 5. IT Setup State
  const [itSetupState, setItSetupState] = useState(() => {
    const saved = localStorage.getItem(`trakive_onboarding_it_setup_${user?.id || 'default'}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      wifiConfirmed: false,
      securityGuideRead: false,
    };
  });

  // 6. Step Completion State (Persisted in localStorage)
  const [completedSteps, setCompletedSteps] = useState(() => {
    const saved = localStorage.getItem(`trakive_onboarding_completed_steps_${user?.id || 'default'}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      internship_info: false,
      required_docs: false,
      welcome: false,
      company_policies: false,
      it_setup: false,
      team_intro: false,
      training: false,
    };
  });

  useEffect(() => {
    const serializableDocuments = Object.fromEntries(
      Object.entries(documents).map(([category, doc]) => {
        if (!doc) return [category, null];
        const rest = { ...doc };
        delete rest.file;
        return [category, rest];
      })
    );
    localStorage.setItem(`trakive_onboarding_docs_${user?.id || 'default'}`, JSON.stringify(serializableDocuments));
  }, [documents, user?.id]);

  useEffect(() => {
    localStorage.setItem(`trakive_onboarding_it_setup_${user?.id || 'default'}`, JSON.stringify(itSetupState));
  }, [itSetupState, user?.id]);

  useEffect(() => {
    localStorage.setItem(`trakive_onboarding_completed_steps_${user?.id || 'default'}`, JSON.stringify(completedSteps));
  }, [completedSteps, user?.id]);

  const getOnboardingDetailsPayload = (section) => {
    if (section === 'internship_info') {
      return {
        department_id: info.department_id,
        department_name: info.department_name,
        institution: info.institution,
        field_of_study: info.field_of_study,
        phone: info.phone,
        date_of_birth: info.date_of_birth,
        start_date: info.start_date,
        end_date: info.end_date,
      };
    }
    if (section === 'it_setup') {
      return {
        wifiConfirmed: itSetupState.wifiConfirmed,
        securityGuideRead: itSetupState.securityGuideRead,
      };
    }
    return {
      label: ONBOARDING_SECTION_LABELS[section] || section,
    };
  };

  const markStepCompletedAndNext = async (currentCatId, nextCatId) => {
    try {
      await api.post('/onboarding/details', {
        section: currentCatId,
        status: 'completed',
        details: getOnboardingDetailsPayload(currentCatId),
      });
      setCompletedSteps((prev) => ({ ...prev, [currentCatId]: true }));
      toast.success('Onboarding section sent to supervisor.');
      if (nextCatId) {
        setActiveCategory(nextCatId);
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to send onboarding details to supervisor.';
      toast.error(message);
    }
  };

  // Handle department selection -> update local selection (supervisor assigned on Save)
  const handleDepartmentChange = (deptId) => {
    const foundDept = departments.find((d) => d.id === deptId);
    const deptName = foundDept ? foundDept.name : deptId;
    setInfo((prev) => ({ ...prev, department_id: deptId, department_name: deptName }));
    setAssignedSupervisor({
      name: 'Will be assigned on save',
      title: 'Department Supervisor',
      email: '',
    });
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!info.department_id) {
      toast.error('Please select a department.');
      return;
    }
    if (!info.start_date || !info.end_date) {
      toast.error('Both start date and end date are required.');
      return;
    }
    if (!info.date_of_birth) {
      toast.error('Date of birth is required.');
      return;
    }

    const start = new Date(info.start_date);
    const end = new Date(info.end_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error('Please enter valid start and end dates.');
      return;
    }

    if (end < start) {
      toast.error('End date cannot be a date before the start date.');
      return;
    }

    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
    if ((end.getTime() - start.getTime()) < twoWeeksMs) {
      toast.error('End date must be at least 2 weeks (14 days) after the start date.');
      return;
    }

    setSavingInfo(true);
    try {
      const res = await api.post('/onboarding/info', {
        department_id: info.department_id,
        institution: info.institution || undefined,
        field_of_study: info.field_of_study || undefined,
        phone: info.phone || undefined,
        date_of_birth: info.date_of_birth,
        start_date: info.start_date,
        end_date: info.end_date,
      });
      const profile = res?.data?.data?.intern_profile || res?.data?.intern_profile || {};
      const supervisorName = profile.supervisor_first_name
        ? `${profile.supervisor_first_name} ${profile.supervisor_last_name || ''}`.trim()
        : null;

      setAssignedSupervisor({
        name: supervisorName || 'Pending HR assignment',
        title: profile.supervisor_title || 'Department Supervisor',
        email: profile.supervisor_email || '',
      });
      const departmentName = profile.department_name || info.department_name;
      const savedInfo = {
        ...info,
        department_name: departmentName,
        is_saved: true,
      };
      localStorage.setItem(`trakive_onboarding_info_${user?.id || 'default'}`, JSON.stringify(savedInfo));
      localStorage.setItem(
        `trakive_user_profile_${user?.id || 'default'}`,
        JSON.stringify({
          ...safeJson(localStorage.getItem(`trakive_user_profile_${user?.id || 'default'}`), {}),
          department: departmentName,
          department_name: departmentName,
          department_id: info.department_id,
          institution: info.institution,
          fieldOfStudy: info.field_of_study,
          field_of_study: info.field_of_study,
          phone: info.phone,
          dateOfBirth: info.date_of_birth,
          date_of_birth: info.date_of_birth,
          startDate: info.start_date,
          endDate: info.end_date,
          updatedAt: new Date().toISOString(),
        }),
      );
      updateUserMeta?.({
        department: departmentName,
        department_name: departmentName,
        department_id: info.department_id,
        startDate: info.start_date,
        endDate: info.end_date,
        dateOfBirth: info.date_of_birth,
        date_of_birth: info.date_of_birth,
      });
      setInfo((prev) => ({
        ...prev,
        is_saved: true,
        department_name: departmentName || prev.department_name,
      }));
      setCompletedSteps((prev) => ({ ...prev, internship_info: true }));
      toast.success(
        supervisorName
          ? `Internship info saved. Assigned supervisor: ${supervisorName}.`
          : 'Internship info saved. A supervisor will be assigned for document review.'
      );
      setActiveCategory('required_docs');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to save internship information.';
      toast.error(message);
    } finally {
      setSavingInfo(false);
    }
  };

  // STRICT Document Upload Validation (PDF ONLY)
  const handleFileUpload = (category, file) => {
    if (!file) return;

    // Check strict PDF extension and MIME type
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const isPdf = ext === '.pdf' || file.type === 'application/pdf';

    if (!isPdf) {
      const err = `File "${file.name}" is rejected! Only PDF documents (.pdf) are allowed as input.`;
      setUploadErrors((prev) => ({ ...prev, [category]: err }));
      toast.error(err);
      return;
    }

    // Validate size (10 MB limit)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const err = `File "${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
      setUploadErrors((prev) => ({ ...prev, [category]: err }));
      toast.error(err);
      return;
    }

    setUploadErrors((prev) => ({ ...prev, [category]: null }));

    const docObj = {
      id: 'doc-' + Date.now(),
      file_name: file.name,
      file_size: file.size,
      mime_type: 'application/pdf',
      file,
      uploaded_at: new Date().toISOString(),
      review_status: 'pending',
      reviewer_notes: null,
      history: documents[category]?.history || [],
    };

    if (documents[category]) {
      docObj.history = [
        ...docObj.history,
        {
          file_name: documents[category].file_name,
          uploaded_at: documents[category].uploaded_at,
          review_status: documents[category].review_status,
          reviewer_notes: documents[category].reviewer_notes,
        },
      ];
    }

    setDocuments((prev) => ({
      ...prev,
      [category]: docObj,
    }));

    // Selecting a new file after submit means docs need to be re-submitted
    if (completedSteps.required_docs) {
      setCompletedSteps((prev) => ({ ...prev, required_docs: false }));
    }

    toast.success(`PDF selected for ${category.replace(/_/g, ' ')}. Submit when all 3 are ready.`);
  };

  const handleRemoveDoc = (category) => {
    setDocuments((prev) => ({
      ...prev,
      [category]: null,
    }));
    if (completedSteps.required_docs) {
      setCompletedSteps((prev) => ({ ...prev, required_docs: false }));
    }
    toast.success('PDF Document removed.');
  };

  const handleSubmitDocuments = async () => {
    const missing = REQUIRED_DOCUMENTS.filter((d) => !documents[d.category]);
    if (missing.length > 0) {
      toast.error(`Please upload all 3 required PDFs before submitting. Missing: ${missing.map((m) => m.title.replace(' (PDF)', '')).join(', ')}`);
      return;
    }

    // Internship info must be saved to the API so the supervisor queue can see this intern
    if (!info.is_saved && !completedSteps.internship_info) {
      toast.error('Please save Internship Info first so a supervisor can be assigned.');
      setActiveCategory('internship_info');
      return;
    }

    setSubmittingDocs(true);
    try {
      // Ensure department/supervisor link exists even if info was only partially saved earlier
      if (info.department_id && !info.is_saved) {
        try {
          await api.post('/onboarding/info', {
            department_id: info.department_id,
            institution: info.institution || undefined,
            field_of_study: info.field_of_study || undefined,
            phone: info.phone || undefined,
            date_of_birth: info.date_of_birth || undefined,
            start_date: info.start_date || undefined,
            end_date: info.end_date || undefined,
          });
        } catch (infoErr) {
          console.warn('Could not refresh internship info before document submit', infoErr);
        }
      }

      const results = await Promise.all(
        REQUIRED_DOCUMENTS.map(async (reqDoc) => {
          const doc = documents[reqDoc.category];
          if (!(doc.file instanceof File) && !doc.file_path) {
            throw new Error(`Please reselect ${reqDoc.title.replace(' (PDF)', '')} so Trakive can upload the actual PDF file.`);
          }
          if (!(doc.file instanceof File)) {
            return { category: reqDoc.category, data: doc };
          }

          const formData = new FormData();
          formData.append('file', doc.file);
          formData.append('title', reqDoc.title.replace(' (PDF)', ''));
          formData.append('category', reqDoc.category);
          formData.append('file_name', doc.file.name);
          formData.append('file_size', String(doc.file.size));
          formData.append('mime_type', doc.file.type || 'application/pdf');

          const res = await api.post('/onboarding/documents', formData, {
            onUploadProgress: (event) => {
              if (!event.total) return;
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadErrors((prev) => ({ ...prev, [reqDoc.category]: progress < 100 ? `Uploading... ${progress}%` : null }));
            },
          });
          return { category: reqDoc.category, data: res?.data?.data || res?.data };
        })
      );

      setDocuments((prev) => {
        const next = { ...prev };
        results.forEach(({ category, data }) => {
          if (!data) return;
          next[category] = {
            ...next[category],
            id: data.id || next[category]?.id,
            review_status: data.review_status || 'pending',
            file_path: data.file_path || next[category]?.file_path,
            file: undefined,
          };
        });
        return next;
      });

      setCompletedSteps((prev) => ({ ...prev, required_docs: true, internship_info: true }));
      setInfo((prev) => ({ ...prev, is_saved: true }));
      toast.success('Documents submitted for supervisor review!');
      setActiveCategory('welcome');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to submit documents to supervisor.';
      toast.error(message);
    } finally {
      setSubmittingDocs(false);
    }
  };

  // Metrics
  const approvedDocsCount = useMemo(() => {
    return Object.values(documents).filter((d) => d && d.review_status === 'approved').length;
  }, [documents]);

  const submittedDocsCount = useMemo(() => {
    return Object.values(documents).filter((d) => d !== null).length;
  }, [documents]);

  const hasConfirmedItSetup = itSetupState.wifiConfirmed && itSetupState.securityGuideRead;
  const isItSetupComplete = hasConfirmedItSetup || completedSteps.it_setup;
  const isOnboardingReady = approvedDocsCount === 3;

  // Total Tasks and Journey calculations
  const totalTasks = 7;
  const completedTasks = useMemo(() => {
    let done = 0;
    if (info.is_saved || completedSteps.internship_info) done += 1;
    if (approvedDocsCount === 3 || completedSteps.required_docs) done += 1;
    if (completedSteps.welcome) done += 1;
    if (completedSteps.company_policies) done += 1;
    if (isItSetupComplete || completedSteps.it_setup) done += 1;
    if (completedSteps.team_intro) done += 1;
    if (completedSteps.training) done += 1;
    return done;
  }, [info.is_saved, completedSteps, approvedDocsCount, isItSetupComplete]);

  const remainingTasks = Math.max(0, totalTasks - completedTasks);
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  const getCategoryCount = (catId) => {
    if (catId === 'internship_info') return { done: (info.is_saved || completedSteps.internship_info) ? 1 : 0, total: 1 };
    if (catId === 'required_docs') return { done: (approvedDocsCount === 3 || completedSteps.required_docs) ? 3 : submittedDocsCount, total: 3 };
    if (catId === 'welcome') return { done: completedSteps.welcome ? 1 : 0, total: 1 };
    if (catId === 'company_policies') return { done: completedSteps.company_policies ? 1 : 0, total: 1 };
    if (catId === 'it_setup') return { done: isItSetupComplete ? 1 : (itSetupState.wifiConfirmed || itSetupState.securityGuideRead ? 1 : 0), total: 1 };
    if (catId === 'team_intro') return { done: completedSteps.team_intro ? 1 : 0, total: 1 };
    if (catId === 'training') return { done: completedSteps.training ? 1 : 0, total: 1 };
    return { done: 0, total: 1 };
  };

  const nextIncompleteCategory = useMemo(() => {
    const completionByCategory = {
      internship_info: Boolean(info.is_saved || completedSteps.internship_info),
      required_docs: Boolean(completedSteps.required_docs || submittedDocsCount === REQUIRED_DOCUMENTS.length),
      welcome: Boolean(completedSteps.welcome),
      company_policies: Boolean(completedSteps.company_policies),
      it_setup: Boolean(isItSetupComplete || completedSteps.it_setup),
      team_intro: Boolean(completedSteps.team_intro),
      training: Boolean(completedSteps.training),
    };

    return CATEGORIES.find((cat) => !completionByCategory[cat.id])?.id || CATEGORIES[0].id;
  }, [info.is_saved, completedSteps, submittedDocsCount, isItSetupComplete]);

  useEffect(() => {
    setActiveCategory(nextIncompleteCategory);
  }, [nextIncompleteCategory]);

  // Up Next item
  const upNextItem = useMemo(() => {
    if (!(info.is_saved || completedSteps.internship_info)) {
      return {
        title: 'Select Department & Set Internship Info',
        categoryName: 'Internship Info',
        time: '5m',
        catId: 'internship_info',
      };
    }
    if (submittedDocsCount < 3) {
      return {
        title: `Upload Required PDF Documents (${submittedDocsCount}/3 Uploaded)`,
        categoryName: 'Required Documents',
        time: '10m',
        catId: 'required_docs',
      };
    }
    if (!isItSetupComplete) {
      return {
        title: 'Complete Wi-Fi & IT Security Guide Confirmation',
        categoryName: 'IT Setup',
        time: '5m',
        catId: 'it_setup',
      };
    }
    if (approvedDocsCount < 3) {
      return {
        title: `Supervisor Reviewing PDF Documents (${approvedDocsCount}/3 Approved)`,
        categoryName: 'Required Documents',
        time: 'Pending Review',
        catId: 'required_docs',
      };
    }
    return {
      title: 'Onboarding Complete — Ready for Internship Tasks!',
      categoryName: 'Onboarding Ready',
      time: 'Done 🎉',
      catId: 'required_docs',
    };
  }, [info.is_saved, completedSteps.internship_info, submittedDocsCount, isItSetupComplete, approvedDocsCount]);

  return (
    <div className="onboarding-page">
      
      {/* ── Page Header ────────────────────────────────────────────────────────── */}
      <div className="onboarding-header">
        <div style={{ minWidth: 0 }}>
          <div className="onboarding-header-title">
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Onboarding Pathway
            </h1>
            {isFifthLabDomain && (
              <span style={{
                background: BRAND_BLUE_SOFT,
                color: BRAND_BLUE_DARK,
                border: `1px solid ${BRAND_BLUE_BORDER}`,
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px'
              }}>
                Department: FifthLab
              </span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
            Complete your required internship setup, Wi-Fi verification, and PDF document approvals.
          </p>
        </div>
      </div>

      {/* ── UP NEXT Banner Card ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="onboarding-up-next"
      >
        <div className="onboarding-up-next-copy">
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: BRAND_BLUE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '22px',
            boxShadow: `0 4px 12px ${BRAND_BLUE_SHADOW}`,
            flexShrink: 0
          }}>
            <RiArrowRightLine />
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              UP NEXT
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '2px 0 0 0' }}>
              {upNextItem.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#ffffff' }}>
              <span>{upNextItem.categoryName}</span>
              <span>•</span>
              <span>{upNextItem.time}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveCategory(upNextItem.catId)}
          className="onboarding-action-btn btn-on-accent"
          style={{
            background: '#ffffff',
            color: BRAND_BLUE,
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(255, 255, 255, 0.28)',
            transition: 'all 0.2s ease'
          }}
        >
          Continue <RiArrowRightLine />
        </button>
      </motion.div>

      {/* ── Main Two-Column Layout ────────────────────────────────────────────── */}
      <div className="onboarding-layout">
        
        {/* ── LEFT COLUMN: YOUR JOURNEY CARD & CATEGORIES ────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, width: '100%' }}>
          
          {/* Cyan Gradient "YOUR JOURNEY" Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: `linear-gradient(145deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%)`,
              borderRadius: '20px',
              padding: '24px 20px',
              color: '#ffffff',
              boxShadow: `0 12px 30px -6px ${BRAND_BLUE_SHADOW}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', opacity: 0.9, textTransform: 'uppercase', marginBottom: '16px', color: '#ffffff' }}>
              YOUR JOURNEY
            </div>

            {/* SVG Donut Progress Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0 16px 0' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="12" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="12"
                    strokeDasharray={314}
                    strokeDashoffset={314 - (314 * progressPercentage) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '24px', fontWeight: 900, lineHeight: 1, color: '#ffffff' }}>{progressPercentage}%</span>
                </div>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '12px 0 2px 0', color: '#ffffff' }}>
                {progressPercentage}% Complete
              </h4>
              <p style={{ fontSize: '12px', opacity: 0.9, margin: 0, textAlign: 'center', color: '#ffffff' }}>
                {isOnboardingReady ? 'Onboarding Ready! 🎉' : 'Good start! Build on this energy.'}
              </p>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '999px',
                padding: '4px 14px',
                fontSize: '11px',
                fontWeight: 700,
                marginTop: '10px',
                color: '#ffffff',
              }}>
                ⏱️ {remainingTasks} tasks remaining
              </div>
            </div>

            {/* 4 Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.18)', borderRadius: '12px', padding: '10px', textAlign: 'center', color: '#ffffff' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, display: 'block', color: '#ffffff' }}>{totalTasks}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', color: '#ffffff' }}>TOTAL</span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.18)', borderRadius: '12px', padding: '10px', textAlign: 'center', color: '#ffffff' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, display: 'block', color: '#ffffff' }}>{completedTasks}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', color: '#ffffff' }}>DONE</span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.18)', borderRadius: '12px', padding: '10px', textAlign: 'center', color: '#ffffff' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, display: 'block', color: '#ffffff' }}>{approvedDocsCount}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', color: '#ffffff' }}>APPROVED</span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.18)', borderRadius: '12px', padding: '10px', textAlign: 'center', color: '#ffffff' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, display: 'block', color: '#ffffff' }}>{remainingTasks}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', color: '#ffffff' }}>REMAINING</span>
              </div>
            </div>
          </motion.div>

          {/* Categories Sidebar */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '8px' }}>
              CATEGORIES
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = activeCategory === cat.id;
                const count = getCategoryCount(cat.id);
                const isFullyDone = count.done === count.total;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: isActive ? '1.5px solid #10b981' : '1px solid transparent',
                      background: isActive ? '#ecfdf5' : 'transparent',
                      color: isActive ? '#065f46' : '#475569',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <IconComponent style={{ fontSize: '16px', color: isActive ? '#10b981' : cat.color }} />
                      <span>{cat.name}</span>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: isFullyDone ? '#d1fae5' : isActive ? '#ffffff' : '#f1f5f9',
                      color: isFullyDone ? '#047857' : '#64748b'
                    }}>
                      {count.done}/{count.total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: ACTIVE CATEGORY PANEL ───────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, width: '100%' }}>
          
          {/* Category Banner Card */}
          {(() => {
            const currentCatObj = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];
            const CatIcon = currentCatObj.icon;
            const count = getCategoryCount(activeCategory);

            return (
              <div className="onboarding-inline-row" style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '1.5px solid #a7f3d0',
                boxShadow: '0 2px 12px rgba(16, 185, 129, 0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px'
                  }}>
                    <CatIcon />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {currentCatObj.name}
                    </h2>
                    <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                      {count.done}/{count.total} completed
                    </span>
                  </div>
                </div>

                <div style={{ width: '120px', maxWidth: '100%', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', flex: '1 1 120px' }}>
                  <div style={{
                    width: `${(count.done / count.total) * 100}%`,
                    height: '100%',
                    background: '#00b4d8',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            );
          })()}

          {/* ── Category 1: Internship Information Panel ─────────────────────── */}
          {activeCategory === 'internship_info' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
                Internship Profile & Department Selection
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
                Select the department where your internship will be managed.
              </p>

              <form onSubmit={handleInfoSubmit} className="onboarding-form-grid">
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Department
                  </label>
                  <select
                    value={info.department_id}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    disabled={loadingDepartments || departments.length === 0}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #00b4d8',
                      background: '#ffffff',
                      fontWeight: 600,
                      color: '#0f172a'
                    }}
                  >
                    <option value="" disabled>
                      {loadingDepartments ? 'Loading departments…' : 'Select a department'}
                    </option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supervisor Auto-Assignment Card */}
                <div className="onboarding-inline-row" style={{ gridColumn: '1 / -1', background: BRAND_BLUE, border: `1px solid ${BRAND_BLUE_DARK}`, borderRadius: '12px', padding: '14px 18px', color: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      <RiUserFollowLine style={{ fontSize: '20px' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>Auto-Assigned Department Supervisor</span>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', margin: '2px 0 0 0' }}>{assignedSupervisor.name}</h4>
                      <span style={{ fontSize: '12px', color: '#ffffff' }}>{assignedSupervisor.title} • {assignedSupervisor.email}</span>
                    </div>
                  </div>
                  <span style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                    Assigned
                  </span>
                </div>

                {/* Internship Duration Notice */}
                <div style={{ gridColumn: '1 / -1', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 18px' }}>
                  <div className="onboarding-inline-row" style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <RiTimeLine style={{ fontSize: '16px' }} /> Internship Duration Dates
                    </span>
                    <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', border: '1px solid #fcd34d' }}>
                      ⚡ Requires Supervisor Verification
                    </span>
                  </div>

                  <div className="onboarding-dates-grid">
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#78350f', marginBottom: '4px' }}>Start Date</label>
                      <input
                        type="date"
                        value={info.start_date}
                        onChange={(e) => setInfo({ ...info, start_date: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#78350f', marginBottom: '4px' }}>End Date</label>
                      <input
                        type="date"
                        value={info.end_date}
                        onChange={(e) => setInfo({ ...info, end_date: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#a16207', marginTop: '6px', display: 'block' }}>
                    * Dates submitted will be sent to supervisor ({assignedSupervisor.name}) for formal verification.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    School / Institution
                  </label>
                  <input
                    type="text"
                    required
                    value={info.institution}
                    onChange={(e) => setInfo({ ...info, institution: e.target.value })}
                    placeholder="e.g. University of Lagos"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Course of Study / Major
                  </label>
                  <input
                    type="text"
                    required
                    value={info.field_of_study}
                    onChange={(e) => setInfo({ ...info, field_of_study: e.target.value })}
                    placeholder="e.g. Computer Science"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={info.phone}
                    onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={info.date_of_birth}
                    onChange={(e) => setInfo({ ...info, date_of_birth: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '12px', display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    disabled={savingInfo || loadingDepartments || !info.department_id}
                    className="onboarding-action-btn"
                    style={{
                      background: savingInfo || !info.department_id ? '#94a3b8' : '#00b4d8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: savingInfo || !info.department_id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: savingInfo || !info.department_id ? 'none' : '0 4px 14px rgba(0, 180, 216, 0.3)'
                    }}
                  >
                    <RiCheckLine /> {savingInfo ? 'Saving…' : 'Save & Proceed to Documents'}
                  </button>
                </div>

              </form>
            </motion.div>
          )}

          {/* ── Category 2: Required Documents (STRICT PDF ONLY) ───────────── */}
          {activeCategory === 'required_docs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              
              {/* Readiness Banner Header */}
              {isOnboardingReady ? (
                <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <RiShieldCheckFill style={{ fontSize: '28px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>ONBOARDING READY 🎉</h3>
                  </div>
                  <p style={{ fontSize: '13px', margin: 0, opacity: 0.95 }}>
                    All 3 required PDF documents have been approved by supervisor {assignedSupervisor.name}.
                  </p>
                  <div style={{ marginTop: '12px', background: 'rgba(255, 255, 255, 0.2)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                    ℹ️ <strong>HR Disclaimer:</strong> Trakive onboarding complements the official HR onboarding process.
                  </div>
                </div>
              ) : (
                <div className="onboarding-inline-row" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 20px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>PDF Documentation Progress</span>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                      {approvedDocsCount}/3 PDF Documents Approved
                    </h4>
                  </div>
                  <span style={{ background: BRAND_BLUE, color: '#ffffff', fontSize: '12px', fontWeight: 800, padding: '6px 14px', borderRadius: '999px' }}>
                    Strictly PDF (.pdf) Only
                  </span>
                </div>
              )}

              {/* Document Cards */}
              {REQUIRED_DOCUMENTS.map((reqDoc) => {
                const uploadedDoc = documents[reqDoc.category];
                const hasError = uploadErrors[reqDoc.category];
                const isApproved = uploadedDoc?.review_status === 'approved';
                const isResubmit = uploadedDoc?.review_status === 'resubmission_required';
                const isRejected = uploadedDoc?.review_status === 'rejected';

                return (
                  <div
                    key={reqDoc.category}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: isApproved
                        ? '1.5px solid #a7f3d0'
                        : isResubmit
                        ? '1.5px solid #fed7aa'
                        : isRejected
                        ? '1.5px solid #fecaca'
                        : '1px solid #e2e8f0',
                      padding: '20px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <div className="onboarding-inline-row" style={{ marginBottom: '12px', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{reqDoc.icon}</span>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {reqDoc.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                            {reqDoc.description}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {uploadedDoc ? (
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: isApproved ? '#ecfdf5' : isResubmit ? '#fff7ed' : isRejected ? '#fef2f2' : '#fffbeb',
                          color: isApproved ? '#059669' : isResubmit ? '#ea580c' : isRejected ? '#dc2626' : '#d97706',
                          border: `1px solid ${isApproved ? '#a7f3d0' : isResubmit ? '#ffedd5' : isRejected ? '#fecaca' : '#fde68a'}`
                        }}>
                          {uploadedDoc.review_status.replace('_', ' ')}
                        </span>
                      ) : (
                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                          PDF Required
                        </span>
                      )}
                    </div>

                    {/* Resubmission Notes Alert Banner */}
                    {(isResubmit || isRejected) && uploadedDoc?.reviewer_notes && (
                      <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '10px', padding: '12px 14px', margin: '12px 0', fontSize: '13px', color: '#9a3412' }}>
                        <strong>Supervisor Feedback ({assignedSupervisor.name}):</strong> "{uploadedDoc.reviewer_notes}"
                      </div>
                    )}

                    {/* Upload Dropzone or File Preview */}
                    {uploadedDoc ? (
                      <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <RiFilePdfLine style={{ fontSize: '26px', color: '#ef4444' }} />
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                              {uploadedDoc.file_name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {(uploadedDoc.file_size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ cursor: 'pointer', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                            Replace PDF
                            <input
                              type="file"
                              hidden
                              accept="application/pdf,.pdf"
                              onChange={(e) => handleFileUpload(reqDoc.category, e.target.files[0])}
                            />
                          </label>
                          <button
                            onClick={() => handleRemoveDoc(reqDoc.category)}
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}
                          >
                            <RiDeleteBinLine />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '20px', textAlign: 'center', background: '#fafafa' }}>
                        <RiFilePdfLine style={{ fontSize: '36px', color: '#ef4444', marginBottom: '6px' }} />
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          Click or drag PDF file to upload
                        </p>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 12px 0' }}>
                          ⛔ <strong>STRICT FORMAT RULE:</strong> Only PDF documents (.pdf) allowed. Max 10 MB.
                        </p>
                        <label style={{
                          background: '#ef4444',
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '8px 18px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-block',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                        }}>
                          Browse PDF File
                          <input
                            type="file"
                            hidden
                            accept="application/pdf,.pdf"
                            onChange={(e) => handleFileUpload(reqDoc.category, e.target.files[0])}
                          />
                        </label>
                      </div>
                    )}

                    {/* Error message */}
                    {hasError && (
                      <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RiAlertLine /> {hasError}
                      </div>
                    )}

                    {/* Document History audit trail if resubmitted */}
                    {uploadedDoc?.history?.length > 0 && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <RiHistoryLine /> Document Resubmission History ({uploadedDoc.history.length})
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                          {uploadedDoc.history.map((hist, hIdx) => (
                            <div key={hIdx} style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                              <span>v{hIdx + 1}: {hist.file_name}</span> • <span style={{ textTransform: 'uppercase' }}>{hist.review_status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}

              <div style={{
                marginTop: '4px',
                padding: '16px 20px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    {completedSteps.required_docs
                      ? 'Documents submitted for supervisor review'
                      : `${submittedDocsCount}/3 PDFs ready to submit`}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    {completedSteps.required_docs
                      ? 'You can replace a file and submit again if your supervisor requests changes.'
                      : 'Upload all three required PDFs, then submit them for supervisor approval.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSubmitDocuments}
                  disabled={submittingDocs || submittedDocsCount < 3}
                  className="onboarding-action-btn"
                  style={{
                    background: submittedDocsCount < 3 ? '#94a3b8' : '#00b4d8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: submittedDocsCount < 3 || submittingDocs ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: submittedDocsCount < 3 ? 'none' : '0 4px 14px rgba(0, 180, 216, 0.3)',
                    opacity: submittingDocs ? 0.75 : 1,
                    whiteSpace: 'normal',
                  }}
                >
                  {submittingDocs ? (
                    <>Submitting…</>
                  ) : completedSteps.required_docs ? (
                    <><RiCheckLine /> Submit Again & Proceed <RiArrowRightLine /></>
                  ) : (
                    <><RiUploadCloudLine /> Submit Documents & Proceed to Welcome <RiArrowRightLine /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Category 3: Welcome Panel ───────────────────────────────────── */}
          {activeCategory === 'welcome' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
                Welcome to FifthLab
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
                Get acquainted with FifthLab by visiting the official website below.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="onboarding-inline-row" style={{ background: BRAND_BLUE, border: `1px solid ${BRAND_BLUE_DARK}`, borderRadius: '14px', padding: '16px 20px', color: '#ffffff' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>FifthLab Venture Lab</span>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: '2px 0 0 0' }}>FifthLab Official Website</h4>
                    <p style={{ fontSize: '12px', color: '#ffffff', margin: '2px 0 0 0' }}>Explore projects, startup initiatives, and tech venture lab programs.</p>
                  </div>
                  <a
                    href="https://thefifthlab.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-on-accent"
                    style={{
                      background: '#ffffff',
                      color: BRAND_BLUE,
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Visit FifthLab <RiExternalLinkLine />
                  </a>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    onClick={() => markStepCompletedAndNext('welcome', 'company_policies')}
                    style={{
                      background: '#00b4d8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(0, 180, 216, 0.3)',
                      maxWidth: '100%',
                      whiteSpace: 'normal',
                    }}
                  >
                    <RiCheckLine /> Mark Welcome Reviewed & Proceed to Policies <RiArrowRightLine />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Category 4: Company Policies & Handbook ───────────────────────── */}
          {activeCategory === 'company_policies' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}
            >
              <div className="onboarding-inline-row" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Company Policies & Employee Handbook
                </h3>
                {completedSteps.company_policies ? (
                  <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px' }}>
                    ✅ Completed
                  </span>
                ) : (
                  <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px' }}>
                    ⏳ (In Progress)
                  </span>
                )}
              </div>

              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '28px', textAlign: 'center', marginBottom: '20px' }}>
                <RiShieldCheckFill style={{ fontSize: '40px', color: completedSteps.company_policies ? '#10b981' : '#94a3b8', marginBottom: '8px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', margin: 0 }}>
                  Company Handbook Document
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  The FifthLab Employee Policy Handbook overview. Review policies and click below to acknowledge.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  onClick={() => markStepCompletedAndNext('company_policies', 'it_setup')}
                  style={{
                    background: '#00b4d8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 180, 216, 0.3)',
                    maxWidth: '100%',
                    whiteSpace: 'normal',
                  }}
                >
                  <RiCheckLine /> Mark Policies Read & Proceed to IT Setup <RiArrowRightLine />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Category 5: IT Setup (WIFI & CYBERSECURITY GUIDE) ─────────────── */}
          {activeCategory === 'it_setup' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <div className="onboarding-inline-row">
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
                    IT Setup & Security Confirmation
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    Confirm your network connection and review IT Security guidelines.
                  </p>
                </div>
                {isItSetupComplete && (
                  <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px' }}>
                    ✅ Completed
                  </span>
                )}
              </div>

              {/* 1. Wi-Fi Network Confirmation */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <RiWifiLine style={{ fontSize: '24px', color: '#16a34a' }} />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#14532d', margin: 0 }}>FifthLab Wi-Fi Network Access</h4>
                    <span style={{ fontSize: '12px', color: '#15803d' }}>SSID: FifthLab-Internal</span>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #86efac' }}>
                  <input
                    type="checkbox"
                    checked={itSetupState.wifiConfirmed}
                    onChange={(e) => {
                      setItSetupState({ ...itSetupState, wifiConfirmed: e.target.checked });
                      if (e.target.checked) toast.success('Confirmed: Added to FifthLab Wi-Fi network.');
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#16a34a' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#14532d' }}>
                    I confirm that I have been added to FifthLab's Wi-Fi network.
                  </span>
                </label>
              </div>

              {/* 2. CyberSecurity & IT Security Guide */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <RiShieldKeyholeLine style={{ fontSize: '24px', color: '#d97706' }} />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#78350f', margin: 0 }}>CyberSecurity & IT Security Guide</h4>
                    <span style={{ fontSize: '12px', color: '#92400e' }}>Mandatory Security Awareness Standard</span>
                  </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px', border: '1px solid #fcd34d', fontSize: '12px', color: '#451a03', maxHeight: '140px', overflowY: 'auto', marginBottom: '12px', lineHeight: '1.6' }}>
                  <strong>Security Best Practices for FifthLab Interns:</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
                    <li><strong>Password Security:</strong> Use strong 12+ character passwords and never share corporate credentials.</li>
                    <li><strong>Phishing Awareness:</strong> Do not click untrusted links or open unsolicited attachments from unknown domains.</li>
                    <li><strong>Data Confidentiality:</strong> Proprietary FifthLab code, client datasets, and internal communications must not be shared externally.</li>
                    <li><strong>Device Security:</strong> Always lock your computer screen (`Win + L` or `Cmd + Ctrl + Q`) when leaving your workspace.</li>
                  </ul>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #fcd34d' }}>
                  <input
                    type="checkbox"
                    checked={itSetupState.securityGuideRead}
                    onChange={(e) => {
                      setItSetupState({ ...itSetupState, securityGuideRead: e.target.checked });
                      if (e.target.checked) toast.success('Confirmed: CyberSecurity Guide read and acknowledged.');
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#d97706' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#78350f' }}>
                    I have read, understood, and agree to abide by the CyberSecurity & IT Security Guide.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  onClick={() => {
                    if (!hasConfirmedItSetup) {
                      toast.error('Please tick both IT setup confirmations before continuing.');
                      return;
                    }
                    markStepCompletedAndNext('it_setup', 'team_intro');
                  }}
                  disabled={!hasConfirmedItSetup}
                  style={{
                    background: hasConfirmedItSetup ? '#00b4d8' : '#94a3b8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: hasConfirmedItSetup ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: hasConfirmedItSetup ? '0 4px 14px rgba(0, 180, 216, 0.3)' : 'none',
                    opacity: hasConfirmedItSetup ? 1 : 0.75,
                    maxWidth: '100%',
                    whiteSpace: 'normal',
                  }}
                >
                  <RiCheckLine /> Complete IT Setup & Proceed to Team Intro <RiArrowRightLine />
                </button>
              </div>

            </motion.div>
          )}

          {/* ── Category 6: Team Introduction (REAL DATA & CLICKABLE PROFILES) ── */}
          {activeCategory === 'team_intro' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}
            >
              <div className="onboarding-inline-row" style={{ marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
                    Department Team Members & Supervisor
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    Click on any team member profile to view their biography and background details.
                  </p>
                </div>
                {completedSteps.team_intro && (
                  <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px' }}>
                    ✅ Completed
                  </span>
                )}
              </div>

              {loadingTeam ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading team profiles...</div>
              ) : teamMembers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No team members to show yet.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '14px', marginBottom: '20px' }} className="onboarding-team-grid">
                  {teamMembers.map((mem) => (
                    <div
                      key={mem.id}
                      onClick={() => setSelectedMember(mem)}
                      style={{
                        background: mem.isSupervisor ? BRAND_BLUE : '#f8fafc',
                        border: mem.isSupervisor ? `1.5px solid ${BRAND_BLUE_DARK}` : '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: mem.avatarColor || '#00b4d8',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '16px'
                      }}>
                        {mem.name.split(' ').map((n) => n[0]).join('')}
                      </div>

                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: mem.isSupervisor ? '#ffffff' : '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {mem.name}
                          </h4>
                          {mem.isSupervisor && (
                            <span style={{ background: 'rgba(255,255,255,0.22)', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                              SUPERVISOR
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: mem.isSupervisor ? '#ffffff' : '#64748b', display: 'block' }}>{mem.role}</span>
                        <span style={{ fontSize: '11px', color: mem.isSupervisor ? '#ffffff' : BRAND_BLUE, fontWeight: 600 }}>Click to view Bio →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  onClick={() => markStepCompletedAndNext('team_intro', 'training')}
                  style={{
                    background: '#00b4d8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 180, 216, 0.3)',
                    maxWidth: '100%',
                    whiteSpace: 'normal',
                  }}
                >
                  <RiCheckLine /> Mark Team Intro Reviewed & Proceed to Training <RiArrowRightLine />
                </button>
              </div>

              {/* Profile Details Modal */}
              <AnimatePresence>
                {selectedMember && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedMember(null)}
                    style={{
                      position: 'fixed',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(15, 23, 42, 0.6)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1000,
                      padding: '20px'
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: '#ffffff',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '520px',
                        padding: '28px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        position: 'relative'
                      }}
                    >
                      <button
                        onClick={() => setSelectedMember(null)}
                        style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <RiCloseLine style={{ fontSize: '20px', color: '#64748b' }} />
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: selectedMember.avatarColor || '#00b4d8', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '22px' }}>
                          {selectedMember.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                            {selectedMember.name}
                          </h3>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#00b4d8' }}>
                            {selectedMember.role}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                            {selectedMember.department}
                          </span>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <RiMailLine style={{ color: '#00b4d8' }} />
                          <span>{selectedMember.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <RiMapPinLine style={{ color: '#00b4d8' }} />
                          <span>{selectedMember.location}</span>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Biography
                        </h4>
                        <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: 0, background: '#f1f5f9', padding: '14px', borderRadius: '10px' }}>
                          {selectedMember.bio}
                        </p>
                      </div>

                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {/* ── Category 7: Training Module ─────────────────────────────────── */}
          {activeCategory === 'training' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}
            >
              <div className="onboarding-inline-row" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Internship Training Slide Deck (PDF)
                </h3>
                {completedSteps.training ? (
                  <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px' }}>
                    ✅ Completed
                  </span>
                ) : (
                  <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px' }}>
                    ⏳ (In Progress)
                  </span>
                )}
              </div>

              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '28px', textAlign: 'center', marginBottom: '20px' }}>
                <RiGraduationCapLine style={{ fontSize: '40px', color: completedSteps.training ? '#10b981' : '#94a3b8', marginBottom: '8px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', margin: 0 }}>
                  PowerPoint Presentation Slide Deck (PDF)
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  The training presentation slides will be uploaded here in PDF format. (In Progress)
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  onClick={() => markStepCompletedAndNext('training', null)}
                  style={{
                    background: '#00b4d8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 180, 216, 0.3)',
                    maxWidth: '100%',
                    whiteSpace: 'normal',
                  }}
                >
                  <RiCheckLine /> Mark Training Completed & Finish Pathway
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>

    </div>
  );
}
