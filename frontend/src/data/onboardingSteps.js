/**
 * @file onboardingSteps.js
 * @description Comprehensive mock onboarding steps for Trakive internship onboarding.
 * Each step covers a realistic internship onboarding scenario.
 */

export const mockOnboardingSteps = [
  // ── Welcome Category ──────────────────────────────────────────────────────
  {
    id: 'ob-001',
    title: 'Welcome to Trakive & CEO Intro',
    shortDescription: 'Watch the welcome video from our CEO and learn about Trakive\'s mission.',
    category: 'Welcome',
    categoryIcon: '👋',
    estimatedTime: 10,
    status: 'completed',
    requiresVerification: false,
    dueDate: '2026-07-18',
    priority: 'high',
    instructions: `Welcome to the Trakive team! We're thrilled to have you join us.

To kick things off, please watch the 8-minute welcome video from our CEO, Marcus Chen, where he shares Trakive's founding story, mission, and what makes our internship program unique.

After the video, take 5–10 minutes to explore the platform. Navigate to the Dashboard, browse the Tasks section, and review your Profile settings to confirm your details are accurate.

Feel free to jot down questions — you'll have a chance to ask them during your team orientation session.`,
    resources: [
      {
        id: 'res-001-1',
        title: 'CEO Welcome Video',
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        description: '8-minute welcome video from CEO Marcus Chen',
      },
      {
        id: 'res-001-2',
        title: 'Intern Handbook 2026',
        type: 'pdf',
        url: '/documents/intern-handbook-2026.pdf',
        description: 'Comprehensive guide covering everything you need to know',
      },
    ],
    faqs: [
      {
        id: 'faq-001-1',
        question: 'What should I do after completing this step?',
        answer: 'Move on to the HR Documents section — those are time-sensitive and need to be completed within your first 24 hours.',
      },
      {
        id: 'faq-001-2',
        question: 'Can I revisit the welcome video anytime?',
        answer: 'Absolutely. All resources in every step remain accessible throughout your internship. Click "View" on any completed step to revisit its resources.',
      },
    ],
    uploadedDocuments: [],
    verificationHistory: [],
  },
  {
    id: 'ob-002',
    title: 'Platform Tour & Navigation',
    shortDescription: 'Complete the interactive platform tour to understand Trakive\'s key features.',
    category: 'Welcome',
    categoryIcon: '👋',
    estimatedTime: 15,
    status: 'completed',
    requiresVerification: false,
    dueDate: '2026-07-18',
    priority: 'high',
    instructions: `This interactive tour walks you through all the core areas of the Trakive platform:

1. **Dashboard** — Your personal analytics hub showing progress, upcoming deadlines, and recent activities
2. **Tasks** — Where you'll receive, manage, and submit all assigned projects  
3. **Onboarding** — This very module guiding you through your initial setup
4. **Performance Reviews** — Where you'll see supervisor feedback and ratings
5. **Team** — Directory of colleagues and your assigned supervisor

Click "Launch Tour" below to start the interactive walkthrough. The tour takes approximately 10-12 minutes.`,
    resources: [
      {
        id: 'res-002-1',
        title: 'Platform Feature Overview',
        type: 'guide',
        url: '/guides/platform-overview',
        description: 'Written guide covering all platform features in detail',
      },
    ],
    faqs: [
      {
        id: 'faq-002-1',
        question: 'Is the tour mandatory?',
        answer: 'While not strictly required, we strongly recommend it. Interns who complete the tour resolve platform-related issues 60% faster.',
      },
    ],
    uploadedDocuments: [],
    verificationHistory: [],
  },

  // ── HR Documents Category ─────────────────────────────────────────────────
  {
    id: 'ob-003',
    title: 'Identity Verification & Form I-9',
    shortDescription: 'Upload your government-issued ID and completed Form I-9 for legal work authorization.',
    category: 'HR Documents',
    categoryIcon: '📄',
    estimatedTime: 20,
    status: 'verified',
    requiresVerification: true,
    dueDate: '2026-07-19',
    priority: 'high',
    instructions: `Federal law requires all employees to provide proof of identity and work authorization before starting work. Please complete the following:

**Step 1 — Download Form I-9**
Download the official USCIS Form I-9 from the link in the resources section.

**Step 2 — Fill Out Section 1**
Complete Section 1 of the form electronically or by hand. This section covers your personal information and attestation of citizenship status.

**Step 3 — Gather Your Documents**
You need documents from List A (e.g., US Passport, Permanent Resident Card) OR one document each from List B and List C (e.g., Driver's License + Social Security Card).

**Step 4 — Upload Clear Scans**
Upload clear, high-resolution color scans of both your ID document(s) and your signed Form I-9. File requirements:
- Formats: PDF, DOCX, JPG, PNG
- Maximum size: 5MB per file
- Minimum resolution: 300 DPI for printed documents`,
    resources: [
      {
        id: 'res-003-1',
        title: 'Official USCIS Form I-9',
        type: 'pdf',
        url: 'https://www.uscis.gov/sites/default/files/document/forms/i-9.pdf',
        description: 'Download and complete before uploading',
      },
      {
        id: 'res-003-2',
        title: 'I-9 Acceptable Documents Guide',
        type: 'link',
        url: 'https://www.uscis.gov/i-9-central/form-i-9-acceptable-documents',
        description: 'Lists of acceptable identification documents',
      },
    ],
    faqs: [
      {
        id: 'faq-003-1',
        question: 'Which documents does Trakive accept?',
        answer: 'We accept any document from the official USCIS Lists A, B, and C. The most common options are a US Passport (List A), or a combination of Driver\'s License (List B) + Social Security Card (List C).',
      },
      {
        id: 'faq-003-2',
        question: 'How long does HR verification take?',
        answer: 'Our HR team processes document submissions within 24–48 business hours. You\'ll receive an in-platform notification once your documents are verified.',
      },
      {
        id: 'faq-003-3',
        question: 'What if my document scan is blurry?',
        answer: 'HR will reject the submission with specific feedback. You can re-upload the corrected document directly from this page.',
      },
    ],
    uploadedDocuments: [
      {
        id: 'doc-003-1',
        name: 'passport_scan_alex_rivera.pdf',
        size: 1572864,
        type: 'application/pdf',
        uploadedAt: '2026-07-16T10:30:00.000Z',
        status: 'verified',
      },
    ],
    verificationHistory: [
      {
        id: 'vh-003-1',
        status: 'verified',
        reviewer: 'Jennifer Walsh',
        reviewerTitle: 'HR Compliance Manager',
        reviewerAvatar: null,
        date: '2026-07-16T14:45:00.000Z',
        notes: 'Documents are clear, complete, and fully compliant. Welcome to the team!',
      },
    ],
  },
  {
    id: 'ob-004',
    title: 'Sign Offer Letter & NDA Agreement',
    shortDescription: 'Review, sign, and return your Internship Offer Letter and Non-Disclosure Agreement.',
    category: 'HR Documents',
    categoryIcon: '📄',
    estimatedTime: 25,
    status: 'awaiting_verification',
    requiresVerification: true,
    dueDate: '2026-07-19',
    priority: 'high',
    instructions: `Before you can be granted full access to Trakive's code repositories and internal systems, you must complete two legal agreements:

**1. Internship Offer Letter**
This document formalizes the terms of your internship including start/end dates, compensation, working hours, and reporting structure.

**2. Non-Disclosure Agreement (NDA)**
By signing the NDA, you agree to protect Trakive's proprietary information, trade secrets, and client data during and after your internship.

**To complete this step:**
1. Download both documents from the links below
2. Read them thoroughly — if you have questions, email legal@trakive.com before signing
3. Sign electronically using DocuSign, Adobe Sign, or print, sign, and scan
4. Upload the signed copies as a single PDF or two separate files

**Important:** Both documents must be signed by the last name that appears on your ID.`,
    resources: [
      {
        id: 'res-004-1',
        title: 'Internship Offer Letter Template',
        type: 'pdf',
        url: '/documents/offer-letter-template.pdf',
        description: 'Pre-filled offer letter — review and sign',
      },
      {
        id: 'res-004-2',
        title: 'Non-Disclosure Agreement',
        type: 'pdf',
        url: '/documents/nda-agreement.pdf',
        description: 'NDA covering your internship period',
      },
    ],
    faqs: [
      {
        id: 'faq-004-1',
        question: 'Can I sign the documents electronically?',
        answer: 'Yes. You can use DocuSign, Adobe Sign, HelloSign, or any other legally recognized e-signature platform. You can also print, sign manually, and scan the pages.',
      },
      {
        id: 'faq-004-2',
        question: 'What if I disagree with an NDA clause?',
        answer: 'Please email legal@trakive.com before signing. We can clarify terms and, in some cases, discuss amendments for specific clauses.',
      },
    ],
    uploadedDocuments: [
      {
        id: 'doc-004-1',
        name: 'signed_offer_nda_alex_rivera.pdf',
        size: 786432,
        type: 'application/pdf',
        uploadedAt: '2026-07-17T08:15:00.000Z',
        status: 'pending',
      },
    ],
    verificationHistory: [],
  },
  {
    id: 'ob-005',
    title: 'Tax Forms & Direct Deposit Setup',
    shortDescription: 'Submit W-4 and banking information to set up payroll.',
    category: 'HR Documents',
    categoryIcon: '📄',
    estimatedTime: 20,
    status: 'not_started',
    requiresVerification: true,
    dueDate: '2026-07-20',
    priority: 'high',
    instructions: `To ensure your first paycheck arrives on time, please complete the following payroll setup:

**W-4 Federal Tax Withholding Form**
This tells your employer how much federal income tax to withhold from your paychecks. Use the IRS Withholding Estimator tool to calculate the right number of allowances for your situation.

**Direct Deposit Authorization**
To receive payment via direct deposit (which processes faster than paper checks), you'll need:
- Your bank's routing number (9-digit ABA routing number)
- Your personal account number
- A voided check or official bank statement showing both numbers

Upload your completed W-4 and direct deposit authorization form, or a voided check with your name printed on it.`,
    resources: [
      {
        id: 'res-005-1',
        title: 'IRS Form W-4 (2026)',
        type: 'pdf',
        url: 'https://www.irs.gov/pub/irs-pdf/fw4.pdf',
        description: 'Federal tax withholding form',
      },
      {
        id: 'res-005-2',
        title: 'IRS Withholding Estimator',
        type: 'link',
        url: 'https://www.irs.gov/individuals/tax-withholding-estimator',
        description: 'Calculate appropriate withholding allowances',
      },
    ],
    faqs: [
      {
        id: 'faq-005-1',
        question: 'Is direct deposit mandatory?',
        answer: 'It\'s strongly recommended for faster processing, but not strictly mandatory. Contact payroll@trakive.com if you prefer a paper check.',
      },
    ],
    uploadedDocuments: [],
    verificationHistory: [],
  },

  // ── Company Policies Category ─────────────────────────────────────────────
  {
    id: 'ob-006',
    title: 'Review Employee Handbook',
    shortDescription: 'Read the 2026 Employee Handbook covering culture, expectations, and company policies.',
    category: 'Company Policies',
    categoryIcon: '📋',
    estimatedTime: 45,
    status: 'in_progress',
    requiresVerification: false,
    dueDate: '2026-07-20',
    priority: 'medium',
    instructions: `The Trakive Employee Handbook is your comprehensive guide to working here. It covers:

- **Company Values & Culture** — Our commitment to innovation, inclusion, and psychological safety
- **Communication Standards** — How we communicate in meetings, Slack, and emails
- **Work Hours & Attendance** — Expectations for remote/hybrid schedules and time tracking  
- **Time Off & Leave Policies** — How to request PTO, sick days, and other leave types
- **Performance Review Process** — How your work is evaluated and how feedback is shared
- **Disciplinary Guidelines** — What happens when expectations aren't met

Please read the handbook in full. After reading, click "Mark as Completed" below to confirm. You may be asked questions about the handbook in your first supervisor check-in.`,
    resources: [
      {
        id: 'res-006-1',
        title: 'Trakive Employee Handbook 2026',
        type: 'pdf',
        url: '/documents/employee-handbook-2026.pdf',
        description: 'Full 48-page handbook — read in full',
      },
      {
        id: 'res-006-2',
        title: 'Company Values Quick Reference',
        type: 'pdf',
        url: '/documents/company-values-reference.pdf',
        description: '1-page summary of core values',
      },
    ],
    faqs: [
      {
        id: 'faq-006-1',
        question: 'Do I need to memorize the entire handbook?',
        answer: 'No memorization required. Just read it thoroughly so you\'re familiar with the policies. You can always come back to reference specific sections.',
      },
      {
        id: 'faq-006-2',
        question: 'What if I disagree with a policy?',
        answer: 'Schedule a conversation with your supervisor or reach out to HR at hr@trakive.com. We welcome constructive feedback on our policies.',
      },
    ],
    uploadedDocuments: [],
    verificationHistory: [],
  },
  {
    id: 'ob-007',
    title: 'Data Privacy & Security Training',
    shortDescription: 'Complete the mandatory 30-minute security awareness training module.',
    category: 'Company Policies',
    categoryIcon: '📋',
    estimatedTime: 35,
    status: 'not_started',
    requiresVerification: false,
    dueDate: '2026-07-21',
    priority: 'high',
    instructions: `Security is everyone's responsibility at Trakive. This training module covers:

1. **Data Classification** — Understanding what constitutes confidential vs. public information
2. **Password Best Practices** — Using a password manager, creating strong unique passwords
3. **Phishing Awareness** — Identifying and reporting suspicious emails and links
4. **Device Security** — Laptop encryption, screen locking, and remote wipe policies
5. **Incident Reporting** — What to do if you suspect a security breach

The training includes 4 short videos (5–8 minutes each) and a final quiz. You must score 80% or higher to pass. There's no limit on retries.`,
    resources: [
      {
        id: 'res-007-1',
        title: 'Security Awareness Training Module',
        type: 'guide',
        url: '/training/security-awareness',
        description: 'Interactive training with videos and quiz',
      },
      {
        id: 'res-007-2',
        title: 'Trakive Security Policy Summary',
        type: 'pdf',
        url: '/documents/security-policy-summary.pdf',
        description: 'Quick reference card for security protocols',
      },
    ],
    faqs: [
      {
        id: 'faq-007-1',
        question: 'What happens if I fail the security quiz?',
        answer: 'You can retake it immediately with no penalty. Each attempt randomizes the questions to help reinforce learning.',
      },
    ],
    uploadedDocuments: [],
    verificationHistory: [],
  },

  // ── IT Setup Category ────────────────────────────────────────────────────
  {
    id: 'ob-008',
    title: 'Development Environment Setup',
    shortDescription: 'Install Node.js, Git, and configure your local development environment.',
    category: 'IT Setup',
    categoryIcon: '💻',
    estimatedTime: 60,
    status: 'not_started',
    requiresVerification: false,
    dueDate: '2026-07-21',
    priority: 'high',
    instructions: `Getting your development environment right from day one prevents painful debugging later. Follow these steps carefully:

**Prerequisites**
- macOS 12+, Windows 11, or Ubuntu 20.04+
- At least 8GB RAM (16GB recommended)
- 20GB free disk space

**Step 1 — Install Node Version Manager (NVM)**
NVM allows you to switch between Node.js versions easily. Follow the platform-specific guide in the resources section.

**Step 2 — Install Node.js 20 LTS**
\`\`\`bash
nvm install 20
nvm use 20
nvm alias default 20
\`\`\`

**Step 3 — Install Git**
Download and install Git from git-scm.com. Configure your identity:
\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "your.email@trakive.com"
\`\`\`

**Step 4 — Clone and Run Trakive Frontend**
\`\`\`bash
git clone git@github.com:trakive/trakive-frontend.git
cd trakive-frontend
npm install
npm run dev
\`\`\`

**Step 5 — Verify Everything Works**
Open http://localhost:5173 in your browser. You should see the Trakive login page.`,
    resources: [
      {
        id: 'res-008-1',
        title: 'Dev Environment Setup Guide',
        type: 'guide',
        url: '/guides/dev-environment-setup',
        description: 'Platform-specific step-by-step installation guide',
      },
      {
        id: 'res-008-2',
        title: 'NVM Installation Tutorial (Video)',
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        description: '12-minute video walkthrough for Windows and macOS',
      },
      {
        id: 'res-008-3',
        title: 'Trakive Frontend README',
        type: 'link',
        url: 'https://github.com/trakive/trakive-frontend',
        description: 'Official repository documentation',
      },
    ],
    faqs: [
      {
        id: 'faq-008-1',
        question: 'What Node.js version should I use?',
        answer: 'Node.js 20.x LTS is required. We use features not available in earlier versions and want consistent behavior across the team.',
      },
      {
        id: 'faq-008-2',
        question: 'I\'m getting permission errors on Windows during npm install.',
        answer: 'Run VS Code or your terminal as Administrator. Also ensure Windows Build Tools are installed: run `npm install --global windows-build-tools` in an elevated PowerShell terminal.',
      },
    ],
    uploadedDocuments: [],
    verificationHistory: [],
  },
  {
    id: 'ob-009',
    title: 'SSH Key Setup & GitHub Access',
    shortDescription: 'Generate SSH keys and request access to Trakive\'s private repositories.',
    category: 'IT Setup',
    categoryIcon: '💻',
    estimatedTime: 30,
    status: 'not_started',
    requiresVerification: true,
    dueDate: '2026-07-21',
    priority: 'high',
    instructions: `Repository access requires SSH authentication. Please complete both steps:

**Step 1 — Generate an SSH Key Pair**
Open your terminal and run:
\`\`\`bash
ssh-keygen -t ed25519 -C "your.email@trakive.com"
\`\`\`
Press Enter to accept the default file location. Set a strong passphrase when prompted.

**Step 2 — Add Key to GitHub**
1. Copy your public key: \`cat ~/.ssh/id_ed25519.pub\`
2. Go to GitHub → Settings → SSH and GPG Keys → New SSH Key
3. Paste the public key and save

**Step 3 — Test the Connection**
\`\`\`bash
ssh -T git@github.com
\`\`\`
You should see: "Hi [username]! You've successfully authenticated..."

**Step 4 — Upload Verification Screenshot**
Take a screenshot of your GitHub SSH settings page showing your key listed as active, then upload it below for verification.`,
    resources: [
      {
        id: 'res-009-1',
        title: 'GitHub SSH Key Setup Guide',
        type: 'link',
        url: 'https://docs.github.com/en/authentication/connecting-to-github-with-ssh',
        description: 'Official GitHub documentation for SSH configuration',
      },
    ],
    faqs: [
      {
        id: 'faq-009-1',
        question: 'What should I upload for verification?',
        answer: 'A screenshot of your GitHub Settings → SSH and GPG Keys page, clearly showing your new key listed with "Active" status.',
      },
      {
        id: 'faq-009-2',
        question: 'What if I already have an SSH key?',
        answer: 'You can use an existing key. Just add it to GitHub and upload the screenshot showing it\'s active.',
      },
    ],
    uploadedDocuments: [],
    verificationHistory: [],
  },

  // ── Team Introduction Category ────────────────────────────────────────────
  {
    id: 'ob-010',
    title: 'Team Meet & Greet Session',
    shortDescription: 'Schedule and attend a 20-minute virtual introduction with your team and supervisor.',
    category: 'Team Introduction',
    categoryIcon: '🤝',
    estimatedTime: 30,
    status: 'not_started',
    requiresVerification: false,
    dueDate: '2026-07-22',
    priority: 'medium',
    instructions: `Meeting your team early sets a strong foundation for collaboration. Here's how to arrange your meet & greet:

**1. Find Your Team**
Visit the Team Directory (link in navigation) to find your assigned team and supervisor.

**2. Reach Out on Slack**
Join the #introductions channel and post a brief intro message including:
- Your name and where you're joining from
- What you studied and what you're excited to work on
- A fun personal fact (optional but encouraged!)

**3. Schedule the Meeting**
Message your supervisor directly on Slack to schedule a 20-minute Google Meet call. Typical timing: within your first 3 days.

**4. Prepare a Short Introduction**
Be ready to share:
- Your background and skills
- What you hope to learn this internship
- Any initial questions about the team or projects

Mark this step complete after you've attended your meet & greet session.`,
    resources: [
      {
        id: 'res-010-1',
        title: 'Team Directory',
        type: 'link',
        url: '/dashboard/team',
        description: 'Find your team members and supervisor',
      },
      {
        id: 'res-010-2',
        title: 'Trakive Slack Workspace',
        type: 'link',
        url: 'https://slack.com',
        description: 'Join the team communication hub',
      },
    ],
    faqs: [
      {
        id: 'faq-010-1',
        question: 'My supervisor hasn\'t responded to my message yet.',
        answer: 'Give it 24 hours, then try emailing them directly. You can find their email in the Team Directory. Copy your HR contact on the email as a follow-up.',
      },
    ],
    uploadedDocuments: [],
    verificationHistory: [],
  },

  // ── Training Category ────────────────────────────────────────────────────
  {
    id: 'ob-011',
    title: 'Frontend Engineering Standards',
    shortDescription: 'Review Trakive\'s React component patterns, CSS conventions, and Git workflow.',
    category: 'Training',
    categoryIcon: '🎓',
    estimatedTime: 90,
    status: 'not_started',
    requiresVerification: true,
    dueDate: '2026-07-25',
    priority: 'medium',
    instructions: `Before jumping into feature development, every frontend intern must understand our engineering standards. This ensures consistent, maintainable code across the team.

**Topics Covered:**

**1. React Component Architecture**
- Component composition patterns
- Custom hooks and when to use them
- Performance optimization with memo, useMemo, and useCallback

**2. CSS & Styling Conventions**
- Tailwind CSS utility-first approach
- CSS custom properties for design tokens
- Component-level vs. global styles

**3. Zustand State Management**
- Store structure and slices
- Selector patterns for performance
- Async actions and error handling

**4. Git Workflow**
- Branch naming: \`feature/ticket-id-short-description\`
- Commit message format: \`type(scope): message\`
- PR process: create draft → review ready → merge

**Deliverable:**
Build a small practice component demonstrating:
- A controlled form with React Hook Form
- State management with Zustand
- Proper TypeScript types (or JSDoc comments)
- Tailwind styling following our conventions

Upload a screenshot or screen recording of your completed component running locally.`,
    resources: [
      {
        id: 'res-011-1',
        title: 'Trakive Frontend Engineering Guide',
        type: 'guide',
        url: '/guides/frontend-engineering-standards',
        description: 'Complete coding standards and conventions',
      },
      {
        id: 'res-011-2',
        title: 'Zustand State Management Patterns',
        type: 'link',
        url: 'https://github.com/pmndrs/zustand',
        description: 'Official Zustand docs with patterns we follow',
      },
      {
        id: 'res-011-3',
        title: 'React Hook Form Documentation',
        type: 'link',
        url: 'https://react-hook-form.com',
        description: 'Form handling library we use across all forms',
      },
    ],
    faqs: [
      {
        id: 'faq-011-1',
        question: 'How complex should my practice component be?',
        answer: 'Keep it simple but complete. A controlled form with at least 3 fields, validation, a Zustand store slice, and proper Tailwind styling is ideal. Quality over complexity.',
      },
      {
        id: 'faq-011-2',
        question: 'Can I use a different state management approach?',
        answer: 'For real tasks, please stick to Zustand — it\'s what we use across the codebase. For the practice exercise, you may experiment, but document your reasoning.',
      },
    ],
    uploadedDocuments: [],
    verificationHistory: [],
  },
];
