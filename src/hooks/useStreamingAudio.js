import { useRef, useCallback, useState } from 'react'

/**
 * 流式音频播放器Hook
 * 使用MediaSource API实现边接收边播放MP3音频
 */
export function useStreamingAudio() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreamComplete, setIsStreamComplete] = useState(false)
  
  const audioRef = useRef(null)
  const mediaSourceRef = useRef(null)
  const sourceBufferRef = useRef(null)
  const audioQueueRef = useRef([])
  const isAppendingRef = useRef(false)
  const abortControllerRef = useRef(null)
  
  // 创建或获取audio元素
  const getAudioElement = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
      })
      audioRef.current.addEventListener('pause', () => {
        setIsPlaying(false)
      })
      audioRef.current.addEventListener('play', () => {
        setIsPlaying(true)
        // 音频开始播放后，设置loading为false
        setIsLoading(false)
      })
    }
    return audioRef.current
  }, [])
  
  // 追加音频数据到SourceBuffer
  const appendBuffer = useCallback(() => {
    if (isAppendingRef.current || !sourceBufferRef.current || audioQueueRef.current.length === 0) {
      return
    }
    
    if (sourceBufferRef.current.updating) {
      return
    }
    
    isAppendingRef.current = true
    const chunk = audioQueueRef.current.shift()
    
    try {
      sourceBufferRef.current.appendBuffer(chunk)
    } catch (e) {
      console.error('appendBuffer错误:', e)
      isAppendingRef.current = false
    }
  }, [])
  
  // 初始化MediaSource
  const initMediaSource = useCallback(() => {
    return new Promise((resolve, reject) => {
      const audio = getAudioElement()
      
      // 清理之前的MediaSource
      if (mediaSourceRef.current) {
        try {
          if (audio.src) {
            URL.revokeObjectURL(audio.src)
          }
        } catch (e) {}
      }
      
      mediaSourceRef.current = new MediaSource()
      sourceBufferRef.current = null
      audioQueueRef.current = []
      isAppendingRef.current = false
      
      audio.src = URL.createObjectURL(mediaSourceRef.current)
      
      mediaSourceRef.current.addEventListener('sourceopen', () => {
        try {
          // MP3的MIME类型
          const mimeType = 'audio/mpeg'
          if (MediaSource.isTypeSupported(mimeType)) {
            sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer(mimeType)
            
            sourceBufferRef.current.addEventListener('updateend', () => {
              isAppendingRef.current = false
              appendBuffer()
              
              // 有数据后开始播放
              if (audio.paused && sourceBufferRef.current.buffered.length > 0) {
                const playPromise = audio.play()
                if (playPromise) {
                  playPromise.catch(e => console.warn('播放失败:', e))
                }
              }
            })
            
            sourceBufferRef.current.addEventListener('error', (e) => {
              console.error('SourceBuffer错误:', e)
            })
            
            resolve()
          } else {
            reject(new Error('浏览器不支持MP3流式播放'))
          }
        } catch (e) {
          reject(e)
        }
      })
      
      mediaSourceRef.current.addEventListener('error', (e) => {
        console.error('MediaSource错误:', e)
        reject(e)
      })
    })
  }, [getAudioElement, appendBuffer])
  
  // 添加音频chunk
  const addAudioChunk = useCallback((chunk) => {
    if (!sourceBufferRef.current) {
      console.warn('SourceBuffer未初始化')
      return
    }
    
    audioQueueRef.current.push(chunk)
    appendBuffer()
  }, [appendBuffer])
  
  // 开始流式播放
  const startStreaming = useCallback(async (streamFn) => {
    try {
      setIsLoading(true)
      setIsStreamComplete(false)
      
      // 创建abort controller用于取消
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal
      
      await initMediaSource()
      
      // 调用流式函数，传入回调和signal
      await streamFn(async (chunk) => {
        addAudioChunk(chunk)
      }, signal)
      
      // 流结束，关闭MediaSource
      setIsStreamComplete(true)
      
      // 等待所有数据添加完成后再endOfStream
      const waitForQueue = () => {
        return new Promise((resolve) => {
          const checkQueue = () => {
            if (audioQueueRef.current.length === 0 && 
                sourceBufferRef.current && 
                !sourceBufferRef.current.updating) {
              resolve()
            } else {
              setTimeout(checkQueue, 100)
            }
          }
          checkQueue()
        })
      }
      
      await waitForQueue()
      
      if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
        try {
          mediaSourceRef.current.endOfStream()
        } catch (e) {
          console.warn('endOfStream失败:', e)
        }
      }
      
    } catch (error) {
      console.error('流式播放错误:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [initMediaSource, addAudioChunk])
  
  // 暂停
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [])
  
  // 继续播放
  const resume = useCallback(() => {
    if (audioRef.current) {
      const playPromise = audioRef.current.play()
      if (playPromise) {
        playPromise.catch(e => console.warn('继续播放失败:', e))
      }
    }
  }, [])
  
  // 停止并清理
  const stop = useCallback(() => {
    // 先取消正在进行的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    // 清空音频队列
    audioQueueRef.current = []
    
    // 关闭并清理MediaSource
    if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
      try {
        mediaSourceRef.current.endOfStream()
      } catch (e) {
        // 忽略endOfStream错误
      }
    }
    
    // 清理SourceBuffer引用
    sourceBufferRef.current = null
    mediaSourceRef.current = null
    
    // 停止并清理音频元素
    if (audioRef.current) {
      audioRef.current.pause()
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src)
        audioRef.current.src = ''
      }
      audioRef.current.currentTime = 0
    }
    
    setIsPlaying(false)
    setIsLoading(false)
    setIsStreamComplete(false)
  }, [])
  
  // 设置播放结束回调
  const onEnded = useCallback((callback) => {
    const audio = getAudioElement()
    const handler = () => {
      callback()
    }
    audio.addEventListener('ended', handler)
    return () => audio.removeEventListener('ended', handler)
  }, [getAudioElement])
  
  // 清理
  const cleanup = useCallback(() => {
    stop()
    if (audioRef.current?.src) {
      URL.revokeObjectURL(audioRef.current.src)
    }
    audioRef.current = null
    mediaSourceRef.current = null
    sourceBufferRef.current = null
  }, [stop])
  
  return {
    isPlaying,
    isLoading,
    isStreamComplete,
    startStreaming,
    pause,
    resume,
    stop,
    cleanup,
    onEnded,
    audioElement: audioRef.current
  }
}

export default useStreamingAudio
