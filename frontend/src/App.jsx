import React, { useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ImageCanvas from './components/ImageCanvas';
import useImageStore from './store/useImageStore';
import { processImageAPI } from './services/api';

function App() {
  const { currentOperations, originalFile, setCurrentImageUrl, setIsProcessing } = useImageStore();
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (!originalFile) return;

    const processImage = async () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      setIsProcessing(true);
      try {
        const url = await processImageAPI(originalFile, currentOperations, abortControllerRef.current.signal);
        setCurrentImageUrl(url);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.message !== 'canceled') {
          console.error("Failed to process image", err);
        }
      } finally {
        setIsProcessing(false);
      }
    };

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    setIsProcessing(true);
    debounceTimerRef.current = setTimeout(processImage, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [currentOperations, originalFile]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen w-full bg-[#0b0e14] overflow-hidden font-sans text-[#e1e4e8]">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <TopBar />
        <ImageCanvas />
      </div>
    </div>
  );
}

export default App;
