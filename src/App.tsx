import React, { useState, useRef, useEffect } from 'react';
import { useSnake } from './hooks/useSnake';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal, AlertTriangle, Zap } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'ERR: MEMORY_LEAK',
    artist: '0x00A1',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '6:12',
  },
  {
    id: 2,
    title: 'NULL_POINTER_EXCEPTION',
    artist: 'SEGFault',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '7:05',
  },
  {
    id: 3,
    title: 'KERNEL_PANIC',
    artist: 'sys_admin',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '5:44',
  },
];

export default function App() {
  const {
    snake,
    food,
    gameOver,
    score,
    highScore,
    isPaused,
    gridSize,
    resetGame,
    setIsPaused: setSnakePaused,
  } = useSnake();

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleNextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const handlePrevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  const handleTrackEnded = () => handleNextTrack();

  useEffect(() => {
    if (canvasRef.current) canvasRef.current.focus();
  }, []);

  return (
    <div className="h-screen w-full bg-black text-[#e0e0e0] font-mono flex flex-col overflow-hidden select-none relative scanlines transition-all">
      <div className="static-noise"></div>
      
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={currentTrack.url} onEnded={handleTrackEnded} />

      {/* HEADER */}
      <header className="h-20 flex items-center w-full justify-between px-8 border-b-4 border-[#00ffff] bg-black flex-shrink-0 z-10 box-decoration-clone brutal-border drop-shadow-md m-4 w-[calc(100%-32px)]">
        <div className="flex items-center gap-4 tear-fx">
          <Terminal color="#ff00ff" size={32} className="animate-pulse" />
          <h1 className="text-3xl font-pixel glitch" data-text="SYS_SNAKE.EXE">SYS_SNAKE.EXE</h1>
        </div>
        <div className="flex gap-12 font-pixel hidden sm:flex text-sm">
          <div className="flex flex-col items-end">
            <span className="text-[12px] uppercase text-[#ff00ff]">VAR_SCORE</span>
            <span className="text-2xl text-[#00ffff]">{score.toString().padStart(4, '0')}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[12px] uppercase text-[#00ffff]">VAR_HIGH</span>
            <span className="text-2xl text-[#ff00ff]">{highScore.toString().padStart(4, '0')}</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex overflow-hidden p-4 pt-0 gap-4 z-10">
        
        {/* LEFT SIDEBAR - Playlist */}
        <aside className="w-80 bg-black brutal-border-alt p-6 flex flex-col gap-6 hidden md:flex h-full relative">
          <div className="space-y-6">
            <h2 className="text-lg font-pixel text-[#00ffff] border-b-2 border-[#00ffff] pb-2 flex gap-2 items-center">
              <Zap size={20} /> AURAL_LINK
            </h2>
            <div className="space-y-4">
              {TRACKS.map((track, idx) => (
                <div 
                  key={track.id} 
                  onClick={() => setCurrentTrackIndex(idx)}
                  className={`p-3 border-l-8 flex flex-col gap-1 cursor-pointer transition-none ${
                    idx === currentTrackIndex 
                      ? 'bg-[#222] border-[#00ffff] text-white' 
                      : 'bg-black border-[#ff00ff] hover:bg-[#111] text-gray-400'
                  }`}
                >
                  <span className={`text-sm font-pixel uppercase ${idx === currentTrackIndex ? 'animate-pulse text-[#00ffff]' : ''}`}>
                    {track.title}
                  </span>
                  <span className="text-sm border-t border-dashed border-gray-700 mt-1 pt-1 opacity-80">
                    {track.artist} | {track.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto p-4 border-2 border-[#00ffff] bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-[#00ffff] opacity-10 blur-md"></div>
            <div className="flex items-end gap-[4px] h-20 justify-around relative z-10">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-full bg-[#ff00ff] ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{ 
                    height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '5%',
                    transition: 'height 0.1s ease-in-out'
                  }}
                ></div>
              ))}
            </div>
            <p className="text-[14px] text-center mt-4 text-[#00ffff] font-pixel tracking-wider">
              {isPlaying ? '> STREAM_ACTV' : '> IDLE'}
            </p>
          </div>
        </aside>

        {/* CENTER - GAME */}
        <section className="flex-1 relative flex flex-col items-center justify-center p-4 bg-black brutal-border h-full overflow-hidden">
          
          <div 
            ref={canvasRef}
            tabIndex={0}
            className="z-20 relative w-full h-auto max-h-full max-w-[500px] aspect-square brutal-border-alt bg-[#050505] outline-none overflow-hidden container-glitch mb-4"
          >
            {/* Overlay for Game Over / Paused */}
            {(gameOver || isPaused) && (
              <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-8 border-[4px] border-red-600">
                <AlertTriangle color="red" size={64} className="mb-6 animate-ping" />
                <h2 className="text-5xl md:text-6xl font-pixel mb-6 text-center text-red-500 glitch" data-text={gameOver ? 'FATAL_ERR' : 'SYS_HALT'}>
                  {gameOver ? 'FATAL_ERR' : 'SYS_HALT'}
                </h2>
                {gameOver && <p className="text-[#00ffff] text-2xl font-mono mb-8 bg-[#ff00ff]/20 px-6 py-3 border border-[#ff00ff]">DUMP_VAL: {score}</p>}
                <button 
                  onClick={gameOver ? resetGame : () => setSnakePaused(false)}
                  className="px-8 py-4 bg-red-600 text-white font-pixel text-xl hover:bg-white hover:text-red-600 transition-none border-4 border-red-600 shadow-[4px_4px_0_#ff00ff]"
                >
                  {gameOver ? '> EXEC REBOOT' : '> RESUME_OP'}
                </button>
              </div>
            )}

            {/* Grid setup */}
            <div 
              className="w-full h-full relative"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              }}
            >
              {/* Draw Food - Magenta */}
              <div 
                style={{
                  gridColumnStart: food.x + 1,
                  gridRowStart: food.y + 1,
                }}
                className="bg-[#ff00ff] animate-pulse z-10"
              />
              
              {/* Draw Snake - Cyan/Magenta alternating */}
              {snake.map((segment, index) => {
                const isHead = index === 0;
                return (
                  <div
                    key={`${segment.x}-${segment.y}-${index}`}
                    style={{
                      gridColumnStart: segment.x + 1,
                      gridRowStart: segment.y + 1,
                    }}
                    className={`${isHead ? 'bg-white z-10 border border-[#00ffff]' : (index % 2 === 0 ? 'bg-[#00ffff]' : 'bg-[#ff00ff]')} p-[1px]`}
                  >
                     <div className="w-full h-full bg-black/20" />
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="z-20 text-[#00ffff] font-pixel text-sm flex gap-8 uppercase flex-wrap justify-center bg-black p-3 border-2 border-[#ff00ff] shadow-[-4px_4px_0_#00ffff]">
            <span className="flex items-center gap-2">[W,A,S,D] INPUT</span>
            <span className="flex items-center gap-2">[SPACE] HALT</span>
            <span><button onClick={gameOver ? resetGame : () => {}} className="text-[#ff00ff] hover:text-white underline decoration-dashed">REFOCUS</button></span>
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="h-20 bg-black border-4 border-[#ff00ff] flex items-center px-4 md:px-8 gap-4 flex-shrink-0 z-10 brutal-border-alt m-4 mt-0 w-[calc(100%-32px)]">
        <div className="flex items-center gap-4 w-auto sm:w-80">
          <div className="flex flex-col truncate">
            <span className="text-lg font-pixel truncate text-[#00ffff] mb-1">{currentTrack.title}</span>
            <span className="text-sm truncate text-[#ff00ff]">BY: {currentTrack.artist}</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center gap-8">
          <button onClick={handlePrevTrack} className="hover:text-[#00ffff]">
            <SkipBack fill="currentColor" size={28} />
          </button>
          <button onClick={handlePlayPause} className="w-14 h-14 bg-[#ff00ff] text-black flex items-center justify-center hover:bg-[#00ffff] border-2 border-[#00ffff]">
            {isPlaying ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} className="ml-1" />}
          </button>
          <button onClick={handleNextTrack} className="hover:text-[#00ffff]">
            <SkipForward fill="currentColor" size={28} />
          </button>
        </div>

        <div className="w-auto sm:w-80 flex justify-end items-center gap-6 hover:text-[#ff00ff] cursor-pointer" onClick={() => setIsMuted(!isMuted)}>
          <button>
             {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <div className="w-32 h-6 bg-[#222] border-2 border-[#00ffff] relative hidden sm:block p-[2px]">
            <div className={`h-full ${isMuted ? 'w-0' : 'w-3/4'} bg-[#ff00ff] relative transition-all`}></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
