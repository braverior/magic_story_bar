import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, X, BookOpen, Maximize, Minimize } from 'lucide-react'
import useStore from '../store/useStore'
import { readPageAloud } from '../services/api'

function BookReader({ onClose }) {
  const { currentStory, currentPage, nextPage, prevPage, apiConfig, isReading, setIsReading } = useStore()
  const [audioUrl, setAudioUrl] = useState(null)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const audioRef = useRef(null)
  const containerRef = useRef(null)
  
  const page = currentStory?.pages[currentPage]
  const totalPages = currentStory?.pages.length || 0
  
  // 清理音频
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])
  
  // 页面切换时停止播放
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsReading(false)
    setAudioUrl(null)
  }, [currentPage])
  
  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])
  
  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevPage()
      } else if (e.key === 'ArrowRight') {
        nextPage()
      } else if (e.key === ' ') {
        e.preventDefault()
        handleReadAloud()
      } else if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, isReading, isFullscreen])
  
  // 朗读当前页面
  const handleReadAloud = async () => {
    if (isReading) {
      audioRef.current?.pause()
      setIsReading(false)
      return
    }
    
    if (!page?.text) return
    
    // 如果已有音频，直接播放
    if (audioUrl) {
      audioRef.current?.play()
      setIsReading(true)
      return
    }
    
    // 生成新的音频
    setIsLoadingAudio(true)
    try {
      const url = await readPageAloud(page.text, apiConfig)
      setAudioUrl(url)
      setIsReading(true)
      
      // 等待音频元素加载完成后播放
      setTimeout(() => {
        audioRef.current?.play()
      }, 100)
    } catch (error) {
      console.error('朗读失败:', error)
      alert(error.message || '朗读失败，请检查语音API配置')
    } finally {
      setIsLoadingAudio(false)
    }
  }
  
  // 音频播放结束
  const handleAudioEnded = () => {
    setIsReading(false)
    // 自动翻到下一页
    if (currentPage < totalPages - 1) {
      setTimeout(() => {
        nextPage()
      }, 1000)
    }
  }
  
  // 切换全屏
  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }
  
  // 进入全屏
  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen()
    } else if (containerRef.current?.webkitRequestFullscreen) {
      containerRef.current.webkitRequestFullscreen()
    }
  }
  
  // 退出全屏
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  }
  
  if (!currentStory) return null
  
  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-500 ${
        isFullscreen 
          ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' 
          : 'bg-black/80 p-4'
      }`}
    >
      {/* 隐藏的音频元素 */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={handleAudioEnded}
          onPause={() => setIsReading(false)}
          onPlay={() => setIsReading(true)}
        />
      )}
      
      {/* 全屏模式下的星空背景 */}
      {isFullscreen && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.5 + 0.3
              }}
            />
          ))}
        </div>
      )}
      
      <div className={`w-full animate-fade-in ${isFullscreen ? 'max-w-7xl px-8' : 'max-w-5xl'}`}>
        {/* 顶部控制栏 */}
        <div className={`flex items-center justify-between mb-4 ${isFullscreen ? 'mb-8' : ''}`}>
          <div className="flex items-center gap-3">
            <BookOpen className={`text-candy-pink ${isFullscreen ? 'w-8 h-8' : 'w-6 h-6'}`} />
            <h2 className={`font-bold text-white ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
              {currentStory.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* 朗读按钮 */}
            <button
              onClick={handleReadAloud}
              disabled={isLoadingAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isReading 
                  ? 'bg-candy-green text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              } ${isFullscreen ? 'px-6 py-3 text-lg' : ''}`}
            >
              {isLoadingAudio ? (
                <>
                  <div className="loading-magic">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="text-sm">准备中...</span>
                </>
              ) : isReading ? (
                <>
                  <Pause className={`${isFullscreen ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  <span className={isFullscreen ? 'text-base' : 'text-sm'}>暂停朗读</span>
                </>
              ) : (
                <>
                  <Volume2 className={`${isFullscreen ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  <span className={isFullscreen ? 'text-base' : 'text-sm'}>朗读故事</span>
                </>
              )}
            </button>
            
            {/* 全屏按钮 */}
            <button
              onClick={toggleFullscreen}
              className={`bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors ${
                isFullscreen ? 'w-12 h-12' : 'w-10 h-10'
              }`}
              title={isFullscreen ? '退出全屏 (F)' : '全屏阅读 (F)'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>
            
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className={`bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors ${
                isFullscreen ? 'w-12 h-12' : 'w-10 h-10'
              }`}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* 绘本内容 */}
        <div className="flex gap-4 items-center">
          {/* 左箭头 */}
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`rounded-full flex items-center justify-center transition-all ${
              currentPage === 0
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-white/20 text-white hover:bg-white/30 hover:scale-110'
            } ${isFullscreen ? 'w-16 h-16' : 'w-12 h-12'}`}
          >
            <ChevronLeft className={isFullscreen ? 'w-8 h-8' : 'w-6 h-6'} />
          </button>
          
          {/* 书页 */}
          <div className={`flex-1 book-page p-6 flex flex-col md:flex-row gap-6 ${
            isFullscreen ? 'min-h-[70vh] p-10' : 'min-h-[500px]'
          }`}>
            {/* 插图 */}
            <div className="md:w-1/2 flex items-center justify-center">
              {page?.image ? (
                <img 
                  src={page.image}
                  alt={`第${currentPage + 1}页插图`}
                  className={`max-w-full rounded-2xl shadow-lg object-contain ${
                    isFullscreen ? 'max-h-[60vh]' : 'max-h-[400px]'
                  }`}
                />
              ) : (
                <div className={`w-full bg-gradient-to-br from-candy-pink/20 to-candy-blue/20 rounded-2xl flex flex-col items-center justify-center ${
                  isFullscreen ? 'h-[50vh]' : 'h-[300px]'
                }`}>
                  <span className={`mb-4 ${isFullscreen ? 'text-8xl' : 'text-6xl'}`}>🎨</span>
                  <p className="text-gray-400 text-sm">
                    {page?.imageError || '插图加载中...'}
                  </p>
                </div>
              )}
            </div>
            
            {/* 文字内容 */}
            <div className="md:w-1/2 flex flex-col justify-center">
              <div className={`leading-relaxed text-gray-700 ${
                isReading ? 'animate-pulse-soft' : ''
              } ${isFullscreen ? 'text-2xl leading-loose' : 'text-lg'}`}>
                {page?.text}
              </div>
              
              {/* 页码 */}
              <div className={`flex justify-center ${isFullscreen ? 'mt-10' : 'mt-6'}`}>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all cursor-pointer ${
                        i === currentPage
                          ? 'bg-candy-pink scale-125'
                          : 'bg-gray-300 hover:bg-candy-blue'
                      } ${isFullscreen ? 'w-4 h-4' : 'w-3 h-3'}`}
                      onClick={() => {
                        // 直接跳转到指定页面
                        const store = useStore.getState()
                        store.setCurrentPage(i)
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className={`text-center text-gray-400 mt-2 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                第 {currentPage + 1} / {totalPages} 页
              </div>
            </div>
          </div>
          
          {/* 右箭头 */}
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className={`rounded-full flex items-center justify-center transition-all ${
              currentPage === totalPages - 1
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-white/20 text-white hover:bg-white/30 hover:scale-110'
            } ${isFullscreen ? 'w-16 h-16' : 'w-12 h-12'}`}
          >
            <ChevronRight className={isFullscreen ? 'w-8 h-8' : 'w-6 h-6'} />
          </button>
        </div>
        
        {/* 键盘提示 */}
        <div className={`text-center mt-4 text-white/60 ${isFullscreen ? 'text-base mt-8' : 'text-sm'}`}>
          使用 ← → 方向键翻页 · 按 Space 朗读 · 按 F 切换全屏
        </div>
      </div>
    </div>
  )
}

export default BookReader
