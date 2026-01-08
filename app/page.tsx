import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { SearchBarSection } from '@/components/home/SearchBarSection';
import { WhyCoHousingSection } from '@/components/home/WhyCoHousingSection';
import { FeaturedPropertiesSection } from '@/components/home/FeaturedPropertiesSection';
import { AICommitteeSection } from '@/components/home/AICommitteeSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { SuccessStoriesSection } from '@/components/home/SuccessStoriesSection';
import { ByTheNumbersSection } from '@/components/home/ByTheNumbersSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { BlogInsightsSection } from '@/components/home/BlogInsightsSection';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <SearchBarSection />
        <WhyCoHousingSection />
        <FeaturedPropertiesSection />
        <AICommitteeSection />
        <HowItWorksSection />
        <ServicesSection />
        <SuccessStoriesSection />
        <ByTheNumbersSection />
        <TestimonialsSection />
        <BlogInsightsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
