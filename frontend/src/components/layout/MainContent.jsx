/**
 * @file MainContent.jsx
 * @description Scrollable main content area for Trakive's AppLayout.
 * Wraps page content with consistent padding, max-width, and fade-in animation.
 */

import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/** Page transition variants */
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {boolean} [props.maxWidth=true]  Constrain content to 1280px
 */
const MainContent = ({ children, className = '', maxWidth = true }) => {
  const { pathname } = useLocation();

  return (
    <main
      className={['app-content', className].filter(Boolean).join(' ')}
      id="main-content"
      role="main"
    >
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={
          maxWidth
            ? { maxWidth: '1280px', width: '100%', margin: '0 auto' }
            : undefined
        }
      >
        {children}
      </motion.div>
    </main>
  );
};

export default MainContent;
