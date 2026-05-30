import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        
        {/* Scrollable sections to demonstrate Navbar state transition */}
        <section
          id="journey"
          className="min-h-screen bg-[#071E4A] py-24 px-6 md:px-12 flex items-center justify-center border-t border-[#BF9200]/10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-[12px] font-semibold tracking-[0.02em] leading-[1.7] text-[#BF9200] block mb-2">
              The Path to Glory
            </span>
            <h2 className="text-[28px] lg:text-[40px] font-bold text-white tracking-[-0.02em] leading-[1.15] mb-6">
              The Journey
            </h2>
            <p className="text-[#F5F0E8]/70 text-[16px] font-normal leading-[1.7] tracking-normal max-w-2xl mx-auto">
              Follow the journey of delegates as they undergo rigorous leadership training, cultural exploration, and community engagement.
            </p>
          </div>
        </section>

        <section
          id="contestants"
          className="min-h-screen bg-[#0B2D6B] py-24 px-6 md:px-12 flex items-center justify-center"
        >
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-[12px] font-semibold tracking-[0.02em] leading-[1.7] text-[#BF9200] block mb-2">
              The Delegates
            </span>
            <h2 className="text-[28px] lg:text-[40px] font-bold text-white tracking-[-0.02em] leading-[1.15] mb-6">
              Contestants
            </h2>
            <p className="text-[#F5F0E8]/70 text-[16px] font-normal leading-[1.7] tracking-normal max-w-2xl mx-auto">
              Meet the inspiring young women from across the globe representing their cultural heritage with grace and intellect.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

