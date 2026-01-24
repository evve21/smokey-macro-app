
import React from 'react';
import { BASES, FRUIT_PACKS, FRUITS_MASTER } from '../constants';
import { SmoothieState } from '../types';

interface Props {
  state: SmoothieState;
  className?: string;
}

export const SmoothieCup: React.FC<Props> = ({ state, className = "w-full h-full" }) => {
  const baseColor = BASES.find(b => b.id === state.base)?.color || '#f1f1f1';
  const pack = FRUIT_PACKS.find(p => p.id === state.fruitPackId);
  const fruitColors = pack 
    ? pack.items.map(item => FRUITS_MASTER.find(f => f.id === item.fruitId)?.color || '#eee')
    : [];

  // Adjusted paths for a slightly sleeker, more compact cup
  const cupPath = `M 25,10 L 95,10 L 85,160 Q 85,170 75,170 L 45,170 Q 35,170 35,160 Z`;

  return (
    <div className={`relative flex justify-center items-center ${className}`}>
      <svg 
        viewBox="0 0 120 180" 
        className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_4px_10px_rgba(255,255,255,0.05)] relative z-10 overflow-visible"
      >
        <path d={cupPath} fill="white" fillOpacity="0.95" />
        <mask id="cupMask"><path d={cupPath} fill="white" /></mask>
        <g mask="url(#cupMask)">
           <rect x="0" y="100" width="120" height="80" fill={baseColor} />
           {fruitColors.length > 0 ? (
             fruitColors.map((color, idx) => {
               const layerHeight = 90 / fruitColors.length;
               const yPos = 10 + (idx * layerHeight);
               return <rect key={idx} x="0" y={yPos} width="120" height={layerHeight} fill={color} />;
             })
           ) : (
             <rect x="0" y="10" width="120" height="90" fill="#e5e7eb" fillOpacity="0.5" />
           )}
        </g>
        <path d={cupPath} fill="none" stroke="black" strokeWidth="2" strokeOpacity="0.05" className="dark:stroke-white dark:stroke-opacity-20" />
        {/* Straw */}
        <path d="M 60,20 L 60,0 L 75,-15" fill="none" stroke="#CA210E" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
  );
};
