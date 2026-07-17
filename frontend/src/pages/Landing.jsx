/**
 * @file Landing.jsx
 * @description Main landing page — assembles all landing section components.
 */

import Navbar            from '../components/landing/Navbar';
import HeroSection       from '../components/landing/HeroSection';
import FeaturesSection   from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import BenefitsSection   from '../components/landing/BenefitsSection';
import FAQSection        from '../components/landing/FAQSection';
import CTASection        from '../components/landing/CTASection';
import Footer            from '../components/landing/Footer';

const Landing = () => (
  <div style={{ minHeight: '100dvh', background: '#f8fafc' }}>
    <Navbar />
    <main id="landing-main">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <FAQSection />
      <CTASection />
    </main>
    <Footer />
  </div>
);

export default Landing;
