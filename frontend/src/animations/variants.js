// Framer Motion animation variants for Trakive
// All durations are intentionally short and subtle for a snappy, professional feel.

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  // Alias used by landing page components
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  // Alias used by landing page components
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// Designed for use with AnimatePresence — wrap the expanding content with this.
export const accordionExpand = {
  initial: { height: 0, opacity: 0, overflow: 'hidden' },
  animate: {
    height: 'auto',
    opacity: 1,
    overflow: 'hidden',
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

// Use as whileHover prop: <motion.div whileHover={hoverLift} />
export const hoverLift = {
  y: -3,
  transition: { duration: 0.2, ease: 'easeOut' },
};

// Use as whileTap prop: <motion.div whileTap={tapPress} />
export const tapPress = {
  scale: 0.97,
};
