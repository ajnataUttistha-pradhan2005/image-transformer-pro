import React from 'react';
import useImageStore, { defaultOperations } from '../store/useImageStore';
import SliderControl from './SliderControl';
import { Settings, Sliders, Image, Move, RotateCw, Crop, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';

const SectionHeader = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 text-text-primary mb-4 pb-2 border-b border-surface-2">
    <Icon size={16} className="text-neon-magenta" />
    <h3 className="text-sm font-medium uppercase tracking-wider">{title}</h3>
  </div>
);

const Toolbar = () => {
  const { currentOperations, updateOperationsDraft, commitHistory, originalFile } = useImageStore();

  const handleSliderChange = (key, value) => {
    updateOperationsDraft({ [key]: value });
  };

  const handleDragEnd = () => {
    commitHistory(currentOperations);
  };

  const setFormat = (key, value) => {
    updateOperationsDraft({ [key]: value });
    commitHistory({ ...currentOperations, [key]: value });
  };
  
  if (!originalFile) return null;

  return (
    <div className="w-80 bg-surface-1 border-l border-surface-2 h-full overflow-y-auto shrink-0 z-10 glass-panel">
      <div className="p-6 space-y-8">
        
        {/* Transform Tools */}
        <section>
          <SectionHeader title="Transform" icon={Move} />
          
          <div className="mb-4">
            <label className="text-sm font-medium text-text-secondary block mb-2">Rotate Layout</label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 90, 180, 270].map(angle => (
                <button
                  key={angle}
                  onClick={() => setFormat('rotate', { angle })}
                  className={clsx(
                    "py-1 text-xs rounded border transition",
                    currentOperations.rotate?.angle === angle 
                      ? "border-electric-cyan bg-electric-cyan/10 text-white shadow-[0_0_8px_rgba(0,209,255,0.3)]" 
                      : "border-surface-2 hover:border-vivid-violet bg-surface-2/50 text-text-secondary"
                  )}
                >
                  {angle}°
                </button>
              ))}
            </div>
          </div>

          <SliderControl
            label="Custom Angle"
            min={-180} max={180}
            value={currentOperations.rotate?.angle || 0}
            onChange={(val) => handleSliderChange('rotate', { ...currentOperations.rotate, angle: val })}
            onDragEnd={handleDragEnd}
          />
          
          <div className="mb-4">
            <label className="text-sm font-medium text-text-secondary block mb-2">Flip Image</label>
            <div className="grid grid-cols-3 gap-2">
              {['None', 'Horizontal', 'Vertical'].map(opt => {
                const val = opt === 'None' ? null : opt.toLowerCase();
                return (
                  <button
                    key={opt}
                    onClick={() => setFormat('flip', val)}
                    className={clsx(
                      "py-1 text-xs rounded border transition",
                      currentOperations.flip === val
                        ? "border-electric-cyan bg-electric-cyan/10 text-white"
                        : "border-surface-2 hover:border-vivid-violet bg-surface-2/50 text-text-secondary"
                    )}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Adjustment Tools */}
        <section>
          <SectionHeader title="Adjustments" icon={Sliders} />
          
          <SliderControl
            label="Brightness" min={-100} max={100}
            value={currentOperations.brightness}
            onChange={(val) => handleSliderChange('brightness', val)}
            onDragEnd={handleDragEnd}
          />
          <SliderControl
            label="Contrast" min={0.5} max={1.5} step={0.05}
            value={currentOperations.contrast}
            onChange={(val) => handleSliderChange('contrast', val)}
            onDragEnd={handleDragEnd}
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm font-medium text-text-secondary">Grayscale Mode</span>
            <button
              onClick={() => setFormat('grayscale', !currentOperations.grayscale)}
              className={clsx(
                "relative w-12 h-6 rounded-full transition-colors",
                currentOperations.grayscale ? "bg-vivid-violet" : "bg-surface-2"
              )}
            >
              <span className={clsx(
                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                currentOperations.grayscale && "transform translate-x-6 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              )} />
            </button>
          </div>
        </section>

        {/* Filter Tools */}
        <section>
          <SectionHeader title="Filters & Effects" icon={Settings} />
          
          <SliderControl
            label="Gaussian Blur" min={0} max={25} step={2}
            value={currentOperations.blur}
            onChange={(val) => handleSliderChange('blur', val)}
            onDragEnd={handleDragEnd}
          />
          <SliderControl
            label="Sharpen Intensity" min={0} max={3.0} step={0.1}
            value={currentOperations.sharpen}
            onChange={(val) => handleSliderChange('sharpen', val)}
            onDragEnd={handleDragEnd}
          />
          
          <div className="mt-4 border-t border-surface-2 pt-4">
            <div className="flex justify-between mb-4">
              <span className="text-sm font-medium text-text-secondary">Sobel Edge Detect</span>
              <button
                onClick={() => setFormat('sobel', !currentOperations.sobel)}
                className={clsx(
                  "relative w-12 h-6 rounded-full transition-colors",
                  currentOperations.sobel ? "bg-electric-cyan" : "bg-surface-2"
                )}
              >
                <span className={clsx(
                  "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                  currentOperations.sobel && "transform translate-x-6"
                )} />
              </button>
            </div>

            {/* Canny Toggle */}
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary">Canny Edge Detect</span>
              <button
                onClick={() => {
                  if (currentOperations.canny) setFormat('canny', null);
                  else setFormat('canny', { t1: 100, t2: 200 });
                }}
                className={clsx(
                  "px-3 py-1 text-xs rounded transition",
                  currentOperations.canny ? "bg-neon-magenta text-white shadow-[0_0_10px_rgba(189,0,255,0.4)]" : "bg-surface-2 text-text-secondary hover:text-white"
                )}
              >
                {currentOperations.canny ? "Active" : "Enable"}
              </button>
            </div>
            {currentOperations.canny && (
              <div className="pl-4 border-l-2 border-neon-magenta/30 space-y-2 mt-4 inline-block w-full">
                <SliderControl
                  label="Lower Threshold" min={0} max={255}
                  value={currentOperations.canny.t1}
                  onChange={(val) => handleSliderChange('canny', { ...currentOperations.canny, t1: val })}
                  onDragEnd={handleDragEnd}
                />
                <SliderControl
                  label="Upper Threshold" min={0} max={255}
                  value={currentOperations.canny.t2}
                  onChange={(val) => handleSliderChange('canny', { ...currentOperations.canny, t2: val })}
                  onDragEnd={handleDragEnd}
                />
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Toolbar;
