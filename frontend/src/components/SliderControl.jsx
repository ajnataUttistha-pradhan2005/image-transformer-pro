import React from 'react';

const SliderControl = ({ label, min, max, step = 1, value, onChange, onDragEnd }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-3">
        <label className="text-[11px] font-bold text-[#e1e4e8] uppercase">{label}</label>
        <input 
           type="number" 
           value={value} 
           min={min} 
           max={max} 
           step={step}
           onBlur={onDragEnd}
           onChange={(e) => onChange(Number(e.target.value))}
           className="w-14 text-right text-[11px] font-bold text-[#00D1FF] bg-[#00D1FF]/10 px-2 py-0.5 rounded tracking-wide outline-none border border-transparent focus:border-[#00D1FF]/50" 
        />
      </div>
      <div className="flex items-center gap-4 relative">
        <div className="absolute inset-0 top-1/2 -mt-[2px] h-1 bg-[#2f3446] rounded-full w-full pointer-events-none" />
        <div 
           className="absolute left-0 top-1/2 -mt-[2px] h-1 bg-neon-gradient rounded-full pointer-events-none" 
           style={{ width: `${((value - min) / (max - min)) * 100}%` }} 
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseUp={onDragEnd}
          onTouchEnd={onDragEnd}
          className="w-full opacity-0 z-10 cursor-pointer h-5"
        />
        <div 
           className="absolute top-1/2 -mt-2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(0,209,255,0.8)] pointer-events-none transition-transform"
           style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 8px)` }}
        />
      </div>
    </div>
  );
};

export default SliderControl;
