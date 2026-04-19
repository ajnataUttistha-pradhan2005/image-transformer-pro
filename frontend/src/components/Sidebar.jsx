import React, { useState } from 'react';
import useImageStore from '../store/useImageStore';
import { Maximize, SlidersHorizontal, Hexagon, Crop, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import SliderControl from './SliderControl';

const Accordion = ({ title, icon: Icon, isOpen, onClick, onReset, children }) => (
  <div className="border-b border-[#212631]">
    <div className={clsx(
        "w-full flex items-center justify-between px-6 py-4 transition-colors",
        isOpen ? "bg-[#1d212b] text-white border-l-2 border-[#00D1FF]" : "text-[#8b949e] hover:bg-[#181b24] hover:text-white border-l-2 border-transparent"
      )}>
      <button onClick={onClick} className="flex flex-1 items-center gap-3">
        <Icon size={18} className={isOpen ? "text-[#00D1FF]" : ""} />
        <span className="font-medium text-sm tracking-wide">{title}</span>
      </button>
      {onReset && (
        <button onClick={(e) => { e.stopPropagation(); onReset(); }} className="text-[#8b949e] hover:text-[#00D1FF] transition p-1" title="Reset Section">
          <RotateCcw size={14} />
        </button>
      )}
    </div>
    {isOpen && (
      <div className="px-6 py-6 pb-8 bg-[#181b24] space-y-6">
         {children}
      </div>
    )}
  </div>
);

const Sidebar = () => {
  const { currentOperations, updateOperationsDraft, commitHistory, originalFile, resetTransform, resetAdjustments, resetFilters, cropModeActive, setCropMode } = useImageStore();
  const [activeSection, setActiveSection] = useState('Transform');

  const handleSliderChange = (key, value) => updateOperationsDraft({ [key]: value });
  const handleDragEnd = () => commitHistory(currentOperations);
  const setFormat = (key, value) => {
    updateOperationsDraft({ [key]: value });
    commitHistory({ ...currentOperations, [key]: value });
  };

  return (
    <div className="w-[320px] h-full bg-[#141720] flex flex-col border-r border-[#212631] shrink-0 z-20">
      {/* Header */}
      <div className="px-6 py-8">
        <h2 className="text-[#e1e4e8] font-display font-bold text-lg tracking-[0.2em] italic mb-1 uppercase">Studio Engine</h2>
        <p className="text-[#8b949e] text-[11px] tracking-wider">Image Processor v2.0</p>
      </div>

      {/* Accordions */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Accordion 
          title="Transform" icon={Maximize} 
          isOpen={activeSection === 'Transform'} 
          onClick={() => setActiveSection(activeSection === 'Transform' ? null : 'Transform')}
          onReset={resetTransform}
        >
          <SliderControl
            label="Rotate Angle" min={-180} max={180} value={currentOperations.rotate?.angle || 0}
            onChange={(val) => handleSliderChange('rotate', { ...currentOperations.rotate, angle: val })}
            onDragEnd={handleDragEnd}
          />
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#8b949e] tracking-widest uppercase">Flip Mode</span>
            <div className="flex gap-2">
              {['None', 'Horizontal', 'Vertical'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setFormat('flip', opt === 'None' ? null : opt.toLowerCase())}
                  className={clsx(
                    "flex-1 py-1.5 text-xs rounded border transition",
                    (currentOperations.flip === (opt === 'None' ? null : opt.toLowerCase()))
                      ? "border-[#00D1FF] bg-[#00D1FF]/10 text-white"
                      : "border-[#2f3446] hover:bg-[#2f3446]/50 text-[#8b949e]"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </Accordion>

        <Accordion 
          title="Adjust" icon={SlidersHorizontal} 
          isOpen={activeSection === 'Adjust'} 
          onClick={() => setActiveSection(activeSection === 'Adjust' ? null : 'Adjust')}
          onReset={resetAdjustments}
        >
          <SliderControl
            label="Brightness" min={-100} max={100} value={currentOperations.brightness}
            onChange={(val) => handleSliderChange('brightness', val)} onDragEnd={handleDragEnd}
          />
          <SliderControl
            label="Contrast" min={0.5} max={1.5} step={0.05} value={currentOperations.contrast}
            onChange={(val) => handleSliderChange('contrast', val)} onDragEnd={handleDragEnd}
          />
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-[#8b949e] tracking-widest uppercase">Grayscale Matrix</span>
            <button
              onClick={() => setFormat('grayscale', !currentOperations.grayscale)}
              className={clsx(
                "relative w-10 h-5 rounded-full transition-colors",
                currentOperations.grayscale ? "bg-[#7000FF]" : "bg-[#2f3446]"
              )}
            >
              <span className={clsx(
                "absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform outline-none",
                currentOperations.grayscale && "transform translate-x-5 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              )} />
            </button>
          </div>
        </Accordion>

        <Accordion 
          title="Filters" icon={Hexagon} 
          isOpen={activeSection === 'Filters'} 
          onClick={() => setActiveSection(activeSection === 'Filters' ? null : 'Filters')}
          onReset={resetFilters}
        >
          <SliderControl
            label="Gaussian Blur" min={0} max={25} step={2} value={currentOperations.blur}
            onChange={(val) => handleSliderChange('blur', val)} onDragEnd={handleDragEnd}
          />
          <SliderControl
            label="Sharpen Intensity" min={0} max={3.0} step={0.1} value={currentOperations.sharpen}
            onChange={(val) => handleSliderChange('sharpen', val)} onDragEnd={handleDragEnd}
          />
          <div className="pt-4 border-t border-[#2f3446] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8b949e] tracking-widest uppercase">Sobel Edge</span>
              <button
                onClick={() => setFormat('sobel', !currentOperations.sobel)}
                className={clsx("relative w-10 h-5 rounded-full", currentOperations.sobel ? "bg-[#00D1FF]" : "bg-[#2f3446]")}
              >
                <span className={clsx("absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform", currentOperations.sobel && "transform translate-x-5")} />
              </button>
            </div>
          </div>
        </Accordion>

        <Accordion 
          title="Crop Tool" icon={Crop} 
          isOpen={activeSection === 'Crop'} 
          onClick={() => setActiveSection(activeSection === 'Crop' ? null : 'Crop')}
        >
          <div className="flex justify-between items-center bg-[#2f3446]/40 p-4 rounded-lg border border-[#2f3446]">
            <span className="text-xs font-semibold text-white tracking-widest uppercase">Select Box</span>
            <button
               onClick={() => setCropMode(!cropModeActive)}
               className={clsx("relative w-12 h-6 rounded-full transition-colors", cropModeActive ? "bg-[#00D1FF]" : "bg-[#2f3446]")}
            >
               <span className={clsx("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow", cropModeActive && "transform translate-x-6")} />
            </button>
          </div>
          <p className="text-[#8b949e] text-xs leading-relaxed mt-4">Toggle visual selection mode. Draw a selection on the main canvas to explicitly specify crop regions.</p>
        </Accordion>
      </div>

      {/* Footer Apply Button (Visual mostly, or forces history push) */}
      <div className="p-6 pb-8 border-t border-[#212631]">
        <button 
           onClick={() => commitHistory(currentOperations)}
           disabled={!originalFile}
           className={clsx(
             "w-full py-3 rounded-lg text-sm font-semibold tracking-widest uppercase transition-all duration-300",
             originalFile 
               ? "bg-[#222532] text-white border border-[#2f3446] hover:bg-[#32374b] hover:border-[#7000FF]/50" 
               : "bg-[#181b24] text-[#8b949e] border border-transparent cursor-not-allowed opacity-50"
           )}
        >
          Push State to History
        </button>
        <p className="text-[10px] text-[#5a6476] text-center mt-3 tracking-widest uppercase">Take Snapshot</p>
      </div>
    </div>
  );
};
export default Sidebar;
