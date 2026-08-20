/**
 * @file documents.js
 * @description Mock personal documents data for Trakive User Profile module.
 */

export const mockDocuments = [
  {
    id: 'doc_001',
    name: 'Sophia_Adeyemi_CV.pdf',
    displayName: 'CV / Resume',
    type: 'CV/Resume',
    category: 'Professional',
    size: 524288, // bytes → 512 KB
    mimeType: 'application/pdf',
    uploadedAt: '2026-01-06T09:30:00Z',
    status: 'Verified',
    statusColor: '#22c55e',
    icon: '📄',
  },
  {
    id: 'doc_002',
    name: 'National_ID_Card.jpg',
    displayName: 'National ID Card',
    type: 'ID Card',
    category: 'Identity',
    size: 1048576, // 1 MB
    mimeType: 'image/jpeg',
    uploadedAt: '2026-01-06T10:00:00Z',
    status: 'Verified',
    statusColor: '#22c55e',
    icon: '🪪',
  },
  {
    id: 'doc_003',
    name: 'Internship_Offer_Letter.pdf',
    displayName: 'Offer Letter',
    type: 'Offer Letter',
    category: 'Employment',
    size: 307200, // 300 KB
    mimeType: 'application/pdf',
    uploadedAt: '2026-01-04T08:00:00Z',
    status: 'Verified',
    statusColor: '#22c55e',
    icon: '📋',
  },
  {
    id: 'doc_004',
    name: 'React_Certification.pdf',
    displayName: 'React Certification',
    type: 'Training Certificate',
    category: 'Certification',
    size: 204800, // 200 KB
    mimeType: 'application/pdf',
    uploadedAt: '2026-03-15T14:20:00Z',
    status: 'Pending',
    statusColor: '#f59e0b',
    icon: '🏆',
  },
  {
    id: 'doc_005',
    name: 'Web_Accessibility_Certificate.pdf',
    displayName: 'Web Accessibility Certificate',
    type: 'Training Certificate',
    category: 'Certification',
    size: 180224, // ~176 KB
    mimeType: 'application/pdf',
    uploadedAt: '2026-05-22T16:40:00Z',
    status: 'Pending',
    statusColor: '#f59e0b',
    icon: '🏆',
  },
];

export const DOCUMENT_TYPES = [
  'CV/Resume',
  'ID Card',
  'Offer Letter',
  'Training Certificate',
  'Academic Transcript',
  'Reference Letter',
  'Other',
];
