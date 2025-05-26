import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl?: string;
  storyText: string;
}

type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, storyText }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLInputElement | null>(null);
  
  // Audio URL yoksa text-to-speech kullanarak örnek ses oluşturuyoruz
  // Gerçek uygulamada burada Supabase ve ElevenLabs/gTTS entegrasyonu yapılmalı
  useEffect(() => {
    if (!audioUrl && !audioRef.current?.src) {
      setIsLoading(true);
      // Burada normalde API'ye istek yapılıp ses dosyası oluşturulur
      // Örnek olarak dummy bir timeout kullanıyoruz
      setTimeout(() => {
        if (audioRef.current) {
          // Örnek bir ses URL'si (gerçekte bu API çağrısından gelecek)
          audioRef.current.src = 'https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3';
          setIsLoading(false);
        }
      }, 1500);
    }
  }, [audioUrl, storyText]);
  
  // Audio element yüklendiğinde süreyi ayarlıyoruz
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  // Oynatma/duraklatma işlevi
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        setError('Ses oynatılamadı: ' + err.message);
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // İleri sarma işlevi
  const forward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += 10;
  };
  
  // Geri sarma işlevi
  const rewind = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime -= 10;
  };
  
  // Zaman güncellemesi
  const updateTime = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };
  
  // Progress bar değeri değiştiğinde
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Oynatma hızını değiştirme
  const handleRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!audioRef.current) return;
    const newRate = parseFloat(e.target.value) as PlaybackRate;
    audioRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  };
  
  // Zaman formatını dönüştürme (saniye -> 00:00 formatı)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Kontrolleri göster/gizle
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 shadow-lg"
    >
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-red-100 text-red-700 p-3 rounded-md mb-3"
        >
          {error}
        </motion.div>
      )}
      
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={updateTime}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Hikaye Dinle</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleControls}
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {showControls ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </motion.button>
        </div>
        
        {/* Oynatma düğmesi ve zaman göstergesi */}
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </motion.button>
          
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatTime(currentTime)} <span className="text-gray-400 mx-1">/</span> {formatTime(duration)}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2 flex items-center relative">
          <input
            ref={progressBarRef}
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
            style={{margin: 0}}
            disabled={isLoading}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full relative"
          ></motion.div>
          <motion.div 
            className="absolute h-4 w-4 bg-white rounded-full shadow-md border-2 border-blue-600"
            style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% - 8px)` }}
            animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: isPlaying ? Infinity : 0, duration: 2 }}
          ></motion.div>
        </div>
        
        {/* Genişletilebilir kontroller */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Hız</label>
                  <select
                    value={playbackRate}
                    onChange={handleRateChange}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded px-2 py-1 text-sm"
                    disabled={isLoading}
                  >
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-1 px-3 rounded font-medium transition"
                    onClick={rewind}
                    disabled={isLoading}
                  >
                    -10s
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-1 px-3 rounded font-medium transition"
                    onClick={forward}
                    disabled={isLoading}
                  >
                    +10s
                  </motion.button>
                </div>
                
                <div className="col-span-2 md:col-span-1 flex justify-center items-center">
                  {isPlaying && (
                    <div className="flex gap-1 items-center">
                      <motion.div 
                        animate={{ height: [4, 12, 4] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                        className="w-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                      ></motion.div>
                      <motion.div 
                        animate={{ height: [4, 16, 4] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.2 }}
                        className="w-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                      ></motion.div>
                      <motion.div 
                        animate={{ height: [4, 8, 4] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }}
                        className="w-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                      ></motion.div>
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">Oynatılıyor</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-3 text-sm text-gray-600 dark:text-gray-400"
        >
          <div className="flex justify-center gap-1 mb-1">
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
              className="w-2 h-2 bg-blue-600 rounded-full"
            ></motion.div>
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }}
              className="w-2 h-2 bg-blue-600 rounded-full"
            ></motion.div>
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.4 }}
              className="w-2 h-2 bg-blue-600 rounded-full"
            ></motion.div>
          </div>
          Ses dosyası hazırlanıyor...
        </motion.div>
      )}
    </motion.div>
  );
};

export default AudioPlayer; 