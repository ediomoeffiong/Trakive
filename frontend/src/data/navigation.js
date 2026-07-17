// navLinks — used in the top navigation bar (anchor links to page sections)
export const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

// footerLinks — used in the site footer
// Items with `to` are React Router links; items with `href` are anchor links.
export const footerLinks = [
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Contact', to: '/contact' },
];
