import React, { useState } from 'react';
import axios from 'axios';

// Expose axios to window just in case, or use directly.
window.axios = axios;

// --- Icons (Using Inline SVGs for no-dependency robustness) ---
const Icons = {
  Design: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
  ),
  AI: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2V4h0"></path><path d="M12 20v2h0"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M6.34 17.66l-1.41 1.41"></path><path d="M19.07 4.93l-1.41 1.41"></path><circle cx="12" cy="12" r="4"></circle></svg>
  ),
  Templates: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
  ),
  Settings: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
  )
};

// --- Sub-Components ---
const SidebarItem = ({ active, icon: Icon, onClick }) => (
  <button 
    onClick={onClick}
    className={`sidebar-icon ${active ? 'active' : ''}`}
  >
    <Icon />
  </button>
);

const DesignTab = () => {
  // For Alpha release, Penpot integration requires Docker setup
  // Show a helpful placeholder with info
  return (
    <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-xl">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20">
          <Icons.Design />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Design Canvas
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed">
          The full Penpot design integration requires running the Penpot server via Docker.
          For this <span className="text-accent font-semibold">Public Alpha</span>, the AI Image Generator is fully functional!
        </p>
        
        <div className="glass-panel p-6 text-left space-y-4 mt-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-accent">To Enable Penpot:</h3>
          <ol className="text-slate-400 space-y-2 list-decimal list-inside">
            <li>Install <a href="https://docker.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Docker Desktop</a></li>
            <li>Run: <code className="bg-slate-800 px-2 py-1 rounded text-xs">docker-compose up -d penpot</code></li>
            <li>Restart Prune Juice</li>
          </ol>
        </div>

        <div className="pt-4 flex gap-4 justify-center">
          <a 
            href="https://penpot.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            Learn about Penpot
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
};

const AIGeneratorTab = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  // Import axios manually or ensure it's available in scope
  // For simplicity in this single-file React component, we assume axios is imported at top or available window.
  // Ideally: import axios from 'axios'; inside your project setup.
  
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photographic');
  const [size, setSize] = useState('1024x1024');
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setHasResult(false);
    setGeneratedImage(null);

    try {
      // 1. Submit Job
      // Parse size string '1024x1024' -> width, height
      const [width, height] = size.split('x').map(Number) || [1024, 1024]; // Fallback to square if splitting fails, though 'x' is expected.

      const response = await window.axios.post('http://localhost:8080/api/generate', {
        prompt: prompt,
        width: width,
        height: height,
        style: style.toLowerCase()
      });

      const { job_id } = response.data;

      // 2. Poll for Status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await window.axios.get(`http://localhost:8080/api/job/${job_id}`);
          const { status, result } = statusRes.data;

          if (status === 'completed') {
            clearInterval(pollInterval);
            // Result contains { image_url: "http://..." }
            setGeneratedImage(result.image_url || result);
            setHasResult(true);
            setIsGenerating(false);
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            alert('Generation Failed');
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 1000);

    } catch (error) {
      console.error("Generation error", error);
      setIsGenerating(false);
      alert('Failed to start generation. Make sure the Bridge is running!');
    }
  };

  return (
    <div className="flex flex-col p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AI Image Generator</h1>
        <p className="text-slate-400">Describe what you want to create and let Prune Juice do the magic.</p>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <textarea 
          className="input-field w-full h-32 resize-none"
          placeholder="A futuristic hydroponic garden in a cyberpunk city, highly detailed, neon lights..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <select 
              className="input-field bg-slate-800 text-sm"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              <option value="1024x1024">1024x1024 (Square)</option>
              <option value="1024x1792">1024x1792 (Tall)</option>
              <option value="1792x1024">1792x1024 (Wide)</option>
            </select>
            <select 
              className="input-field bg-slate-800 text-sm"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="Photographic">Photographic</option>
              <option value="Anime">Anime</option>
              <option value="Cinematic">Cinematic</option>
            </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`btn-primary flex items-center space-x-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
            <svg className={isGenerating ? 'animate-spin' : ''} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </button>
        </div>
      </div>

      <div className={`glass-panel h-80 flex items-center justify-center border-dashed border-white/5 relative overflow-hidden group ${isGenerating ? 'animate-pulse bg-accent/5' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="text-center space-y-2 z-10 font-sans">
          {isGenerating ? (
             <div className="space-y-4">
                <div className="w-16 h-1 bg-accent/20 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-accent animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }} />
                </div>
                <p className="text-accent animate-pulse">Dreaming up your pixels...</p>
             </div>
          ) : hasResult ? (
            <div className="relative group w-full h-full flex items-center justify-center p-4">
                <img 
                  src={generatedImage} 
                  alt="Generated Masterpiece" 
                  className="max-h-full max-w-full rounded-lg shadow-2xl border border-white/10"
                />
                <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-md transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.AI />
              </div>
              <p className="text-slate-500 font-medium text-lg">Your masterpiece will appear here</p>
              <p className="text-slate-600 text-sm">Enter a prompt and click generate to start</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TemplatesTab = () => (
  <div className="p-8 space-y-8 animate-in fade-in duration-500">
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-white">Project Templates</h1>
      <p className="text-slate-400">Start with a professional layout designed for the best results.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="glass-panel group cursor-pointer overflow-hidden transition-all hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5">
          <div className="h-40 bg-slate-800 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">Social Media</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-slate-100 group-hover:text-accent transition-colors">Instagram Product Post #{i}</h3>
            <p className="text-sm text-slate-500 mt-1">1080 x 1080 • Vector Ready</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SettingsTab = () => (
  <div className="p-8 max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500">
    <h1 className="text-3xl font-bold text-white mb-8">System Settings</h1>
    
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-accent">Performance</h2>
        <div className="glass-panel p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">VRAM Usage Limit</p>
              <p className="text-sm text-slate-500">Adjust how much GPU memory Prune Juice uses.</p>
            </div>
            <select className="input-field bg-slate-800">
              <option>6 GB</option>
              <option>8 GB (Recommended)</option>
              <option>12 GB+</option>
            </select>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Enable xFormers</p>
              <p className="text-sm text-slate-500">Significant speed boost for NVIDIA GPUs.</p>
            </div>
            <input type="checkbox" className="w-12 h-6 bg-slate-800 rounded-full appearance-none checked:bg-accent relative transition-all cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-6 before:transition-transform" defaultChecked />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-rose-500">Danger Zone</h2>
        <div className="glass-panel border-rose-500/20 p-6">
          <button className="text-rose-500 hover:text-rose-400 font-medium transition-colors">Reset Cache & Configuration</button>
        </div>
      </section>
    </div>
  </div>
);

// --- Main App Shell ---
export default function App() {
  const [activeTab, setActiveTab] = useState('design');

  const renderContent = () => {
    switch (activeTab) {
      case 'design': return <DesignTab />;
      case 'ai': return <AIGeneratorTab />;
      case 'templates': return <TemplatesTab />;
      case 'settings': return <SettingsTab />;
      default: return <DesignTab />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <nav className="glass-sidebar w-20 flex flex-col items-center py-8 space-y-8 z-50">
        <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/40 mb-4">
          <span className="font-black text-white text-lg italic mt-[-2px]">PJ</span>
        </div>
        
        <SidebarItem icon={Icons.Design} active={activeTab === 'design'} onClick={() => setActiveTab('design')} />
        <SidebarItem icon={Icons.AI} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        <SidebarItem icon={Icons.Templates} active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
        
        <div className="flex-grow" />
        
        <SidebarItem icon={Icons.Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow relative overflow-y-auto">
        {/* Subtle Background Glow */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        {renderContent()}
      </main>
    </div>
  );
}
