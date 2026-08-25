"use client";

import { useState } from "react";
import { Download, ShieldCheck, Zap, Sparkles, Video, CheckCircle2, Music, Menu, X, HelpCircle, FileText, Lock, ChevronDown } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{ title: string; author: string; thumbnail: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setStatus("Processing audio stream...");
    setVideoInfo(null);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setVideoInfo({
        title: data.title,
        author: data.author,
        thumbnail: data.thumbnail,
      });
      setStatus("Ready for download!");
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 md:p-12 max-w-7xl mx-auto relative">
      {/* Top Navbar / Header */}
      <header className="w-full flex items-center justify-between py-4 border-b border-white/10 mb-12 sm:mb-20">
        <div className="flex items-center gap-3">
          <img 
            src="https://res.cloudinary.com/dsfwafyc2/image/upload/v1787464208/Picsart_26-08-23_11-18-49-742_vho2ih.png" 
            alt="Velo MP3 Logo" 
            className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" 
          />
          <span className="text-xl font-bold tracking-tight text-white">Velo<span className="text-blue-400">MP3</span></span>
        </div>

        {/* Desktop Links & Badge */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
          <a href="#howitworks" className="text-sm text-zinc-400 hover:text-white transition-colors">How It Works</a>
          <a href="#faq" className="text-sm text-zinc-400 hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs sm:text-sm text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Data Collection</span>
          </div>

          {/* Hamburger Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl glass-button text-white md:hidden cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Hamburger Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-4 right-4 z-50 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col gap-4 md:hidden shadow-2xl backdrop-blur-2xl bg-zinc-950/90">
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-300 hover:text-white text-base font-medium py-2 border-b border-white/5"
          >
            Features
          </a>
          <a 
            href="#howitworks" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-300 hover:text-white text-base font-medium py-2 border-b border-white/5"
          >
            How It Works
          </a>
          <a 
            href="#faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-300 hover:text-white text-base font-medium py-2 border-b border-white/5"
          >
            FAQ
          </a>
          <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Data Collection & 100% Secure</span>
          </div>
        </div>
      )}

      {/* Hero Section & Converter Input */}
      <div className="w-full flex-1 flex flex-col items-center justify-start text-center mb-20 px-4 sm:px-0">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-panel text-xs sm:text-sm text-blue-400 mb-8 border-blue-500/20">
          <Sparkles className="w-4 h-4" />
          <span>Lightning Fast YouTube to MP3 Converter</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
          Pure Audio, <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Zero Distractions.
          </span>
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto mb-12 text-sm sm:text-lg md:text-xl">
          Convert links to pristine MP3 audio with embedded cover art and track metadata instantly. Completely ad-free.
        </p>

        {/* Converter Card */}
        <div className="w-full max-w-3xl glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleConvert} className="flex flex-col gap-5">
            <div className="relative flex items-center">
              <Video className="absolute left-5 w-6 h-6 text-zinc-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube link here (e.g., https://youtu.be/...)"
                className="w-full !pl-14 pr-6 py-5 sm:py-6 glass-input text-base sm:text-lg text-white placeholder-zinc-500 rounded-2xl"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 sm:py-6 glass-button bg-blue-600/80 hover:bg-blue-600 border-blue-400/30 text-lg font-semibold flex items-center justify-center gap-3 rounded-2xl shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{status || "Processing..."}</span>
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  <span>Convert MP3</span>
                </>
              )}
            </button>
          </form>

          {/* Video Preview Card */}
          {videoInfo && (
            <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center gap-4 text-left animate-fadeIn">
              <img 
                src={videoInfo.thumbnail} 
                alt="Thumbnail" 
                className="w-full sm:w-32 h-20 object-cover rounded-xl border border-white/10" 
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm sm:text-base truncate">{videoInfo.title}</h4>
                <p className="text-zinc-400 text-xs sm:text-sm">{videoInfo.author}</p>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                <Music className="w-4 h-4" />
                <span>Download MP3</span>
              </a>
            </div>
          )}

          {status && !loading && !videoInfo && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm sm:text-base flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{status}</span>
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <section id="howitworks" className="w-full mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">How Velo MP3 Works</h2>
        <p className="text-zinc-400 text-center mb-10 text-sm sm:text-base">Convert media in three simple steps with zero permanent storage.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl text-left relative">
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">1</div>
            <h3 className="font-semibold text-white text-lg mb-2">Copy the Link</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Copy the URL of the YouTube video or track you want to convert.</p>
          </div>
          <div className="glass-panel p-6 sm:p-8 rounded-3xl text-left relative">
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">2</div>
            <h3 className="font-semibold text-white text-lg mb-2">Start Conversion</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Paste the link into the box above and hit the Convert MP3 button.</p>
          </div>
          <div className="glass-panel p-6 sm:p-8 rounded-3xl text-left relative">
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">3</div>
            <h3 className="font-semibold text-white text-lg mb-2">Download Audio</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Instantly stream and save your high-quality MP3 audio file directly.</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl text-left">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-base sm:text-lg mb-2">Ephemeral Processing</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">Files are processed temporarily and auto-deleted immediately after download.</p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl text-left">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-base sm:text-lg mb-2">Rich Metadata</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">Automatically fetches and embeds YouTube thumbnails, track names, and artist info.</p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-base sm:text-lg mb-2">100% Ad-Free</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">Enjoy a clean, distraction-free user experience supported solely by optional donations.</p>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="w-full max-w-4xl mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">Frequently Asked Questions</h2>
        <p className="text-zinc-400 text-center mb-10 text-sm sm:text-base">Answers about audio conversions, mobile use, and privacy.</p>
        
        <div className="flex flex-col gap-4">
          {[
            { q: "Is Velo MP3 free to use?", a: "Yes, Velo MP3 is completely free, unlimited, and supported entirely through optional user contributions." },
            { q: "Do I need to create an account or sign up?", a: "No account or personal information is required. You can start converting instantly." },
            { q: "Are my downloaded files stored on servers?", a: "No. All conversions are ephemeral, meaning files are generated on the fly and deleted immediately after download." },
            { q: "Does it work on mobile browsers?", a: "Yes! Velo MP3 is fully optimized for mobile devices, tablets, and desktop systems alike." }
          ].map((faq, index) => (
            <div key={index} className="glass-panel rounded-2xl overflow-hidden transition-all">
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full p-6 text-left flex items-center justify-between text-white font-medium text-base cursor-pointer hover:bg-white/5"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${openFaq === index ? "rotate-180 text-blue-400" : ""}`} />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="w-full pt-10 pb-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-500">
        <div className="flex items-center gap-3">
          <img 
            src="https://res.cloudinary.com/dsfwafyc2/image/upload/v1787464208/Picsart_26-08-23_11-18-49-742_vho2ih.png" 
            alt="Velo MP3 Logo" 
            className="w-7 h-7 object-contain opacity-80" 
          />
          <span className="text-zinc-300 font-semibold">Velo MP3</span>
          <span>• Built for privacy and speed.</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
          <a href="#" className="hover:text-white transition-colors flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> Contact</a>
        </div>
      </footer>
    </main>
  );
}
