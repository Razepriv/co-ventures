import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { SearchFilterBar } from '@/components/search/SearchFilterBar';
import { WhyCoHousingSection } from '@/components/home/WhyCoHousingSection';
import { FeaturedPropertiesSection } from '@/components/home/FeaturedPropertiesSection';
import { AICommitteeSection } from '@/components/home/AICommitteeSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { TestimonialsMarquee } from '@/components/home/TestimonialsMarquee';
import { ByTheNumbersSection } from '@/components/home/ByTheNumbersSection';
import { BlogInsightsSection } from '@/components/home/BlogInsightsSection';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <div className="py-8 bg-gray-50 relative z-50 overflow-visible">
          <SearchFilterBar />
        </div>
        <WhyCoHousingSection />
        <FeaturedPropertiesSection />
        <AICommitteeSection />
        <HowItWorksSection />
        <ServicesSection />
        <TestimonialsMarquee />
        <ByTheNumbersSection />
        <BlogInsightsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
