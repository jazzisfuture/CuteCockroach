import React from 'react';
import { SimulationConfig, InteractionType } from '../types';

interface ControlPanelProps {
  config: SimulationConfig;
  setConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig }) => {
  const handleChange = <K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-80 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-200 overflow-y-auto max-h-[90vh]">
      <h1 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
        🪳 Roach Farm
      </h1>
      
      <div className="space-y-4">
        {/* Interaction Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mouse Interaction</label>
          <div className="grid grid-cols-3 gap-2">
            {(['none', 'attract', 'repel'] as InteractionType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleChange('interactionType', type)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                  config.interactionType === type
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">Population</span>
            <span className="font-mono text-amber-700">{config.count}</span>
          </div>
          <input
            type="range"
            min="10"
            max="1500"
            step="10"
            value={config.count}
            onChange={(e) => handleChange('count', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
        </div>

        {/* Size Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Min Size</label>
            <input
              type="number"
              min="10"
              max="50"
              value={config.minSize}
              onChange={(e) => handleChange('minSize', parseInt(e.target.value))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Max Size</label>
            <input
              type="number"
              min="20"
              max="100"
              value={config.maxSize}
              onChange={(e) => handleChange('maxSize', parseInt(e.target.value))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Speed */}
        <div>
           <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">Scuttle Speed</span>
            <span className="font-mono text-amber-700">{config.speed.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={config.speed}
            onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Boid Behaviors</p>
          
          {/* Separation */}
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Personal Space</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={config.separation}
              onChange={(e) => handleChange('separation', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

           {/* Cohesion */}
           <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Group Hug</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.05"
              step="0.001"
              value={config.cohesion}
              onChange={(e) => handleChange('cohesion', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
          
           {/* Alignment */}
           <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Follow Peer</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.1"
              step="0.001"
              value={config.alignment}
              onChange={(e) => handleChange('alignment', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

      </div>
    </div>
  );
};