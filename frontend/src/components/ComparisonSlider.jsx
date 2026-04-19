import React, { useState, useRef, useEffect } from 'react';

const ComparisonSlider = ({ originalUrl, modifiedUrl }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const updatePosition = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <div 
       className="relative w-full h-full select-none flex items-center justify-center overflow-hidden cursor-ew-resize" 
       ref={containerRef}
       onPointerDown={handlePointerDown}
    >
      {/* Background Modified Image */}
      <img src={modifiedUrl} className="absolute max-w-full max-h-full object-contain drop-shadow-2xl pointer-events-none" alt="Modified" />
      
      {/* Target Labels */}
      <div className="absolute top-8 left-8 bg-[#2f3446]/80 backdrop-blur px-4 py-2 rounded text-xs font-semibold tracking-widest uppercase text-[#8b949e] border border-[#2f3446] pointer-events-none z-10">
        Original Base
      </div>
      <div className="absolute top-8 right-8 bg-[#7000FF]/40 backdrop-blur px-4 py-2 rounded text-xs font-semibold tracking-widest uppercase text-white border border-[#7000FF]/50 shadow-[0_0_15px_rgba(112,0,255,0.3)] pointer-events-none z-10">
        Active Filter Matrix
      </div>

      {/* Foreground Original Image */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={originalUrl} className="absolute max-w-full max-h-full object-contain drop-shadow-2xl" alt="Original" />
      </div>

      {/* Center Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-[#00D1FF] z-20 shadow-[0_0_10px_rgba(0,209,255,0.8)] pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-12 bg-[#181b24] border-2 border-[#2f3446] rounded-full flex flex-col items-center justify-center gap-1 shadow-lg pointer-events-auto">
           <div className="w-0.5 h-1.5 bg-[#8b949e] rounded-full"></div>
           <div className="w-0.5 h-1.5 bg-[#8b949e] rounded-full"></div>
           <div className="w-0.5 h-1.5 bg-[#8b949e] rounded-full"></div>
        </div>
      </div>

      {/* View Toggles Overlaid cleanly! */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-30 pointer-events-none">
        <button onPointerDown={(e) => { e.stopPropagation(); setSliderPosition(100); }} className="pointer-events-auto px-6 py-2 bg-[#1d212b]/95 backdrop-blur-xl text-xs font-semibold text-[#8b949e] hover:text-white border border-[#2f3446] hover:border-[#00D1FF]/50 rounded-lg transition shadow-2xl">Show Before</button>
        <button onPointerDown={(e) => { e.stopPropagation(); setSliderPosition(0); }} className="pointer-events-auto px-6 py-2 bg-[#1d212b]/95 backdrop-blur-xl text-xs font-semibold text-[#8b949e] hover:text-white border border-[#2f3446] hover:border-[#00D1FF]/50 rounded-lg transition shadow-2xl">Show After</button>
      </div>
    </div>
  );
};

export default ComparisonSlider;
