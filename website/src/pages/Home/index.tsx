
import Navbar from '@/components/Navbar';
import HeroReimagined from './HeroReimagined';
import CapabilitiesSection from './CapabilitiesSection';
import AgentShowcaseWarmer from './AgentShowcaseWarmer';
import WhyLocalSection from './WhyLocalSection';
import DownloadCTA from './DownloadCTA';
import FooterRedesigned from './FooterRedesigned';

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-mory-bg selection:bg-mory-orange/30 text-mory-text-primary overflow-x-hidden font-sans">
      <Navbar />
      <main>
        <HeroReimagined />
        <CapabilitiesSection />
        <AgentShowcaseWarmer />
        <WhyLocalSection />
        <DownloadCTA />
      </main>
      <FooterRedesigned />
    </div>
  );
}
