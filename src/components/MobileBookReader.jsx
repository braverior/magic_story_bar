import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, X, Maximize, Minimize, ArrowLeft } from 'lucide-react'
import useStore from '../store/useStore'
import { textToSpeechStream } from '../services/api'
import { useStreamingAudio } from '../hooks/useStreamingAudio'

function MobileBookReader({ onClose }) {
  const { currentStory, currentPage, nextPage, prevPage, apiConfig, isReading, setIsReading, setCurrentPage } = useStore()
  // 手机端不需要全屏逻辑，因为本身就应该是全屏覆盖
  const [isAutoPageTurn, setIsAutoPageTurn] = useState(false)
  const containerRef = useRef(null)
  const prevPageRef = useRef(currentPage)
  const touchStartRef = useRef({ x: 0, y: 0 })
  
  // 处理触摸开始
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }

  // 处理触摸结束 - 实现左右滑动翻页
  const handleTouchEnd = (e) => {
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    }

    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y
    
    // 确保主要是水平滑动：水平距离 > 50 且 水平距离 > 垂直距离
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        // 向右滑动 -> 上一页
        prevPage()
      } else {
        // 向左滑动 -> 下一页
        nextPage()
      }
    }
  }
  
  // 流式音频播放器
  const {
    isPlaying,
    isLoading: isLoadingAudio,
    isStreamComplete,
    startStreaming,
    pause: pauseAudio,
    resume: resumeAudio,
    stop: stopAudio,
    cleanup: cleanupAudio,
    onEnded,
    audioElement
  } = useStreamingAudio()
  
  const page = currentStory?.pages[currentPage]
  const totalPages = currentStory?.pages.length || 0
  
  // 清理音频
  useEffect(() => {
    return () => {
      cleanupAudio()
    }
  }, [])
  
  // 同步播放状态到store
  useEffect(() => {
    setIsReading(isPlaying)
  }, [isPlaying, setIsReading])
  
  // 音频播放结束时自动翻到下一页
  useEffect(() => {
    const unsubscribe = onEnded(() => {
      if (currentPage < totalPages - 1) {
        setIsAutoPageTurn(true)
        setTimeout(() => {
          nextPage()
        }, 500)
      }
    })
    return unsubscribe
  }, [onEnded, currentPage, totalPages, nextPage])
  
  // 页面切换时处理播放逻辑
  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      stopAudio()
      
      if (isAutoPageTurn) {
        setIsAutoPageTurn(false)
        const currentPageData = currentStory?.pages[currentPage]
        if (currentPageData?.text) {
          setTimeout(async () => {
            try {
              await startStreaming(async (onChunk, signal) => {
                await textToSpeechStream(currentPageData.text, apiConfig, onChunk, signal)
              })
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error('自动朗读失败:', error)
              }
            }
          }, 300)
        }
      }
      
      prevPageRef.current = currentPage
    }
  }, [currentPage, isAutoPageTurn, currentStory, apiConfig, startStreaming, stopAudio])
  
  // 朗读当前页面
  const handleReadAloud = useCallback(async (forcePlay = false) => {
    if (isPlaying && !forcePlay) {
      pauseAudio()
      return
    }
    
    if (!isPlaying && !isLoadingAudio && !forcePlay && (isStreamComplete || (audioElement && audioElement.src))) {
      resumeAudio()
      return
    }
    
    if (!page?.text) return
    
    try {
      await startStreaming(async (onChunk, signal) => {
        await textToSpeechStream(page.text, apiConfig, onChunk, signal)
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('朗读失败:', error)
      }
    }
  }, [page?.text, apiConfig, isPlaying, isLoadingAudio, isStreamComplete, startStreaming, pauseAudio, resumeAudio, audioElement])
  
  if (!currentStory) return null
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black text-white overflow-hidden flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 顶部导航栏 - 浮动在上方 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3">
           <span className="text-sm font-medium text-white/90 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
            {currentPage + 1} / {totalPages}
          </span>
          
          <button
            onClick={() => handleReadAloud()}
            disabled={isLoadingAudio}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isReading 
                ? 'bg-candy-green text-white' 
                : 'bg-black/30 text-white hover:bg-white/20'
            }`}
          >
            {isLoadingAudio ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isReading ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* 主要内容区域 - 竖屏上图下文，横屏左图右文 */}
      <div className="flex-1 flex flex-col landscape:flex-row w-full h-full">
        {/* 图片区域 */}
        <div className="w-full h-[40%] landscape:h-full landscape:w-1/2 relative bg-gray-900 flex items-center justify-center">
          {page?.image ? (
            <img 
              src={page.image}
              alt={`Page ${currentPage + 1}`}
              className="w-full h-full object-contain landscape:object-cover"
            />
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <span className="text-4xl mb-2">🖼️</span>
              <span>图片加载中...</span>
            </div>
          )}
          
          {/* 上一页/下一页 触摸区域 - 覆盖在图片左右两侧 */}
          <div 
            className="absolute top-0 left-0 bottom-0 w-1/4 z-10"
            onClick={prevPage}
          />
          <div 
            className="absolute top-0 right-0 bottom-0 w-1/4 z-10"
            onClick={nextPage}
          />
        </div>
        
        {/* 文本区域 */}
        <div className="w-full h-[60%] landscape:h-full landscape:w-1/2 flex flex-col relative bg-gray-950">
          <div className="flex-1 overflow-y-auto p-6 pt-4 landscape:p-8 landscape:pt-16">
            <div className="min-h-full flex flex-col justify-center">
              <p className="text-lg leading-relaxed text-gray-100 font-medium">
                {page?.text}
              </p>
            </div>
          </div>
          
          {/* 底部控制栏 (仅在非阅读模式或点击时显示，这里简化为常驻底部但半透明) */}
          <div className="p-4 flex justify-between items-center bg-gray-900/50">
             <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`p-3 rounded-full ${currentPage === 0 ? 'text-gray-600' : 'text-white hover:bg-white/10'}`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            {/* 进度条 */}
            <div className="flex-1 mx-4 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-candy-pink transition-all duration-300"
                style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
              />
            </div>
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className={`p-3 rounded-full ${currentPage === totalPages - 1 ? 'text-gray-600' : 'text-white hover:bg-white/10'}`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileBookReader