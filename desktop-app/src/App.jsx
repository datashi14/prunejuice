import React, { useState } from 'react';
import './index.css';

// Components
const TabBar = ({ activeTab, onTabChange }) => (
  <div className="flex flex-col w-16 bg-gray-900 border-r border-gray-800 h-full">
    <div className="p-4 font-bold text-center text-blue-500">PJ</div>
    <TabIcon icon="🎨" label="Design" active={activeTab === 'design'} onClick={() => onTabChange('design')} />
    <TabIcon icon="🤖" label="AI" active={activeTab === 'ai'} onClick={() => onTabChange('ai')} />
    <TabIcon icon="📋" label="Templates" active={activeTab === 'templates'} onClick={() => onTabChange('templates')} />
    <div className="flex-grow" />
    <TabIcon icon="⚙️" label="Settings" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
  </div>
);

const TabIcon = ({ icon, label, active, onClick }) => (
  <button 
    className={`p-4 text-2xl hover:bg-gray-800 transition-colors tooltip flex justify-center ${active ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
    onClick={onClick}
    title={label}
  >
    {icon}
  </button>
);

// Tab Contents
const DesignTab = () => (
  <div className="w-full h-full flex flex-col">
    {/* Penpot Iframe Integration */}
    <iframe 
      src="http://localhost:9001" 
      className="w-full h-full border-none"
      title="Penpot Design Tool"
    />
  </div>
);

const AIGeneratorTab = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      // Direct call to Bridge
      const response = await fetch('http://localhost:8080/api/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ prompt, width: 1024, height: 1024 })
      });
      const data = await response.json();
      // In real app, we'd listen to WS for completion. 
      // For now, let's assume response gives us a job ID and we poll or wait.
      console.log("Job queued:", data);
      
      // Simulating a wait (replace with WS listener)
      // setTimeout(() => setImage("placeholder.png"), 3000); 
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full bg-gray-800 text-white overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6">AI Image Generator</h2>
      <div className="flex gap-6 h-full">
        <div className="w-1/3 flex flex-col gap-4">
          <textarea 
            className="w-full h-32 p-4 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
            placeholder="Describe your image..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button 
            className={`w-full py-3 rounded font-bold transition-all ${loading ? 'bg-gray-600' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-[1.02]'}`}
            onClick={generate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Art'}
          </button>
          
          {/* Settings Snippet */}
          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-bold mb-2">Settings</h3>
            <div className="flex justify-between items-center mb-2">
              <span>Size</span>
              <select className="bg-gray-800 rounded p-1 text-sm">
                <option>1024x1024</option>
                <option>512x512</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-black rounded-lg flex items-center justify-center border border-gray-700">
           {image ? <img src={image} alt="Result" className="max-h-full" /> : <span className="text-gray-500">Preview Area</span>}
        </div>
      </div>
    </div>
  );
};

const TemplatesTab = () => (
    <div className="p-8 text-white">
        <h2 className="text-3xl font-bold mb-6">Templates</h2>
        <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-gray-700 h-48 rounded hover:ring-2 ring-blue-500 cursor-pointer transition-all">
                    {/* Template Thumbnail */}
                </div>
            ))}
        </div>
    </div>
);

const SettingsTab = () => (
     <div className="p-8 text-white max-w-2xl">
        <h2 className="text-3xl font-bold mb-6">Settings</h2>
        <div className="bg-gray-700 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">Hardware</h3>
            <div className="flex justify-between items-center mb-4">
                <span>VRAM Limit</span>
                <input type="range" min="4" max="24" defaultValue="7.5" className="w-1/2" />
            </div>
            <div className="flex justify-between items-center">
                 <span>Enable xFormers</span>
                 <input type="checkbox" defaultChecked />
            </div>
        </div>
    </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('ai'); // Default to AI for now

  return (
    <div className="flex w-screen h-screen bg-gray-900 overflow-hidden font-sans">
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 h-full relative">
        {activeTab === 'design' && <DesignTab />}
        {activeTab === 'ai' && <AIGeneratorTab />}
        {activeTab === 'templates' && <TemplatesTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

export default App;
