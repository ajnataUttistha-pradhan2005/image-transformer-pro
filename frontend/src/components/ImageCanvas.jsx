import React, { useState, useRef, useEffect } from 'react';
import useImageStore from '../store/useImageStore';
import ComparisonSlider from './ComparisonSlider';
import { Undo2, Redo2, CloudUpload, Image as ImageIcon, X, Check, Info, History as HistoryIcon } from 'lucide-react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCanvas = () => {
  const { originalFile, originalImageUrl, currentImageUrl, currentOperations, setOriginalImage, undo, redo, historyStack, redoStack, isProcessing, cropModeActive, setCropMode, updateOperationsDraft, commitHistory, jumpToHistory } = useImageStore();
  const [compareMode, setCompareMode] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [crop, setCrop] = useState({ unit: '%', width: 50, height: 50, x: 25, y: 25 });

  const getOperationSummary = (op) => {
     let changes = [];
     if (op.rotate?.angle) changes.push(`Rotate ${op.rotate.angle}°`);
     if (op.flip) changes.push(`Flip ${op.flip}`);
     if (op.brightness !== 0) changes.push(`Bright ${op.brightness}`);
     if (op.contrast !== 1.0) changes.push(`Cont ${op.contrast}`);
     if (op.grayscale) changes.push(`Grayscale`);
     if (op.blur > 0) changes.push(`Blur ${op.blur}`);
     if (op.sharpen > 0) changes.push(`Sharp ${op.sharpen}`);
     if (op.sobel) changes.push(`Sobel`);
     if (op.crop && Object.keys(op.crop).some(k => op.crop[k] > 0)) changes.push(`Crop`);
     return changes.length > 0 ? changes.join(' | ') : 'Base State';
  };

  // Pan and Zoom state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleWheel = (e) => {
    if (!originalImageUrl || compareMode || cropModeActive) return;
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, scale + delta), 5);
    setScale(newScale);
  };

  const handleMouseDown = (e) => {
    if (!originalImageUrl || compareMode || cropModeActive) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !originalImageUrl || compareMode || cropModeActive) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setOriginalImage(file);
    }
  };

  if (!originalImageUrl) {
    return (
      <div 
        className="flex-1 flex flex-col items-center justify-center relative pointer-events-auto"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
      >
        <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
        <label className="z-10 w-[460px] bg-[#1d212b] border border-[#2f3446] rounded-[24px] shadow-2xl p-10 flex flex-col items-center text-center cursor-pointer hover:border-[#00D1FF]/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-[#2a2f3f] flex items-center justify-center mb-6 shadow-inner">
            <CloudUpload size={32} className="text-[#00D1FF]" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-white mb-3 tracking-tight">Drag & Drop Image</h2>
          <p className="text-[#8b949e] text-sm mb-8 leading-relaxed px-4">Initiate the transformation process by dropping your high-resolution file here, or click to browse.</p>
          
          <div className="flex items-center gap-2 bg-[#42485a] hover:bg-[#4d5469] transition px-6 py-3 rounded text-sm font-semibold tracking-wide text-[#e1e4e8]">
            <ImageIcon size={16} className="text-[#00D1FF]" />
            SELECT FILE
          </div>
          <p className="mt-8 text-[10px] font-bold tracking-widest uppercase text-[#5a6476]">SUPPORTS JPG, PNG, WEBP, TIFF (MAX 50MB)</p>
          
          <input type="file" className="hidden" accept="image/jpeg, image/png, image/jpg" onChange={(e) => {
             const file = e.target.files[0];
             if (file) setOriginalImage(file);
          }} />
        </label>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex flex-col relative bg-[#0b0e14] overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

      {/* Main Image Viewport Area ensures flexible mapping inside central bounds */}
      <div className="absolute inset-8 bottom-24 flex items-center justify-center">
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-[#141720] border border-[#212631]">
          {compareMode ? (
            <ComparisonSlider originalUrl={originalImageUrl} modifiedUrl={currentImageUrl} />
          ) : cropModeActive ? (
            <div className="w-full h-full flex items-center justify-center relative bg-black/40">
               <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} className="max-w-full max-h-full">
                  <img src={currentImageUrl} alt="Crop Canvas" className="max-w-full max-h-full object-contain drop-shadow-2xl pointer-events-none select-none" />
               </ReactCrop>
               <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#1d212b]/95 backdrop-blur-xl px-4 py-2 rounded-lg border border-[#2f3446] flex gap-4 z-[60] shadow-2xl">
                  <button onClick={() => {
                      updateOperationsDraft({ crop: { left: Math.round(crop.x), top: Math.round(crop.y), right: Math.round(100 - (crop.x + crop.width)), bottom: Math.round(100 - (crop.y + crop.height)) } });
                      commitHistory(currentOperations);
                      setCropMode(false);
                      setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 }); // reset ui
                  }} className="text-xs font-semibold text-[#00D1FF] flex items-center gap-1 hover:text-white transition"><Check size={14}/> Apply Interactive Crop</button>
                  <button onClick={() => setCropMode(false)} className="text-xs font-semibold text-[#e1e4e8] hover:text-[#ff4d4d] flex items-center gap-1 transition"><X size={14}/> Cancel</button>
               </div>
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
              style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transition: isDragging.current ? 'none' : 'transform 0.1s ease-out' }}
            >
              <img 
                 src={currentImageUrl} 
                 alt="Canvas" 
                 className="max-w-full max-h-full object-contain pointer-events-none select-none drop-shadow-2xl" 
                 draggable="false"
              />
            </div>
          )}

          {isProcessing && (
            <div className="absolute top-4 right-4 bg-[#181b24]/90 backdrop-blur px-4 py-2 rounded border border-[#2f3446] flex items-center gap-3 animate-pulse z-[60]">
              <div className="w-4 h-4 rounded-full border-2 border-[#00D1FF] border-t-transparent animate-spin" />
              <span className="text-xs font-semibold tracking-widest uppercase text-white">Generating</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Buttons tightly restrained */}
      {!compareMode && !cropModeActive && (
        <div className="absolute bottom-20 right-8 flex gap-4 z-40 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3">
             <span className="text-[10px] font-bold tracking-widest text-[#5a6476] uppercase bg-[#181b24] px-3 py-2 rounded-full border border-[#2f3446] shadow-xl">Scale {Math.round(scale * 100)}%</span>
             <button 
               onClick={undo} disabled={historyStack.length === 0}
               className={`w-12 h-12 rounded-full bg-[#181b24] border border-[#2f3446] flex items-center justify-center transition-all shadow-xl ${historyStack.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#222532] hover:border-[#00D1FF]/50 hover:text-white text-[#e1e4e8]'}`}
             >
               <Undo2 size={18} />
             </button>
             <button 
               onClick={redo} disabled={redoStack.length === 0}
               className={`w-12 h-12 rounded-full bg-[#181b24] border border-[#2f3446] flex items-center justify-center transition-all shadow-xl ${redoStack.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#222532] hover:border-[#00D1FF]/50 hover:text-white text-[#e1e4e8]'}`}
             >
               <Redo2 size={18} />
             </button>
          </div>
        </div>
      )}

      {/* Bottom Footer Fixed absolute edge */}
      <div className="absolute bottom-0 w-full h-14 bg-[#141720]/95 backdrop-blur border-t border-[#212631] px-8 flex justify-end items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex gap-8">
          <button 
             onClick={() => { setCompareMode(!compareMode); setScale(1); setPosition({x:0, y:0}); setCropMode(false); }}
             className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${compareMode ? 'text-[#00D1FF]' : 'text-[#8b949e] hover:text-white'}`}
          >
            Compare Original
          </button>
          <button onClick={() => setShowMetadata(true)} className="text-[10px] font-bold tracking-widest text-[#5a6476] hover:text-[#8b949e] uppercase transition">View Metadata</button>
          <button onClick={() => setShowHistory(true)} className="text-[10px] font-bold tracking-widest text-[#5a6476] hover:text-[#8b949e] uppercase transition">History</button>
        </div>
      </div>

      {/* Dynamic Modals mapped directly onto topmost z-100 layer completely replacing body space! */}
      {showMetadata && (
        <div className="absolute inset-0 z-[100] bg-[#080A0F]/80 backdrop-blur-md flex items-center justify-center">
            <div className="bg-[#141720] border border-[#212631] w-[400px] rounded-2xl p-6 shadow-2xl relative">
               <button onClick={() => setShowMetadata(false)} className="absolute top-4 right-4 text-[#8b949e] hover:text-[#ff4d4d] transition"><X size={18}/></button>
               <h3 className="text-white font-display font-semibold mb-6 flex items-center gap-2"><Info size={18} className="text-[#00D1FF]"/> Metadata Inspector</h3>
               <div className="space-y-4">
                  <div className="flex justify-between border-b border-[#212631] pb-2">
                     <span className="text-xs text-[#8b949e] uppercase tracking-widest">Filename</span>
                     <span className="text-sm text-white font-mono">{originalFile?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#212631] pb-2">
                     <span className="text-xs text-[#8b949e] uppercase tracking-widest">File Size</span>
                     <span className="text-sm text-white font-mono">{(originalFile?.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between border-b border-[#212631] pb-2">
                     <span className="text-xs text-[#8b949e] uppercase tracking-widest">MIME Type</span>
                     <span className="text-sm text-white font-mono">{originalFile?.type}</span>
                  </div>
               </div>
            </div>
        </div>
      )}

      {showHistory && (
        <div className="absolute inset-0 z-[100] bg-[#080A0F]/80 backdrop-blur-md flex items-center justify-center">
            <div className="bg-[#141720] border border-[#212631] w-[500px] rounded-2xl p-6 shadow-2xl relative max-h-[80%] flex flex-col">
               <button onClick={() => setShowHistory(false)} className="absolute top-4 right-4 text-[#8b949e] hover:text-[#ff4d4d] transition"><X size={18}/></button>
               <h3 className="text-white font-display font-semibold mb-6 flex items-center gap-2"><HistoryIcon size={18} className="text-[#00D1FF]"/> Operational History</h3>
               <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {historyStack.map((op, i) => (
                      <div key={i} onClick={() => { jumpToHistory(i); setShowHistory(false); }} className="p-4 bg-[#1d212b] border border-[#2f3446] rounded-xl flex justify-between items-center cursor-pointer hover:border-[#00D1FF]/50 transition group">
                          <div>
                            <span className="block text-sm text-white font-semibold">Evolution Index {i}</span>
                            <span className="text-[10px] text-[#8b949e] uppercase tracking-widest">{getOperationSummary(op)}</span>
                          </div>
                          <span className="text-xs text-[#00D1FF] opacity-0 group-hover:opacity-100 transition">Jump Back</span>
                      </div>
                  ))}
                  {historyStack.length === 0 && <p className="text-[#8b949e] text-xs text-center py-8">No historical matrix recorded yet. Make adjustments!</p>}
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageCanvas;
