import React, { useState } from 'react';
import { Simulation } from './components/Simulation';
import { ControlPanel } from './components/ControlPanel';
import { SimulationConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>({
    count: 100,
    minSize: 20,
    maxSize: 45,
    interactionType: 'repel', // Default to repel because it's funnier for roaches
    speed: 6,
    separation: 1.5,
    alignment: 0.02,
    cohesion: 0.005,
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100 font-sans">
      <ControlPanel config={config} setConfig={setConfig} />
      <Simulation config={config} />
      
      {/* Overlay Tip */}
      <div className="absolute bottom-4 right-4 bg-white/50 backdrop-blur px-4 py-2 rounded-full text-xs text-gray-600 pointer-events-none select-none">
        Move your mouse to {config.interactionType === 'none' ? 'observe' : config.interactionType} them!
      </div>
    </div>
  );
};

export default App;