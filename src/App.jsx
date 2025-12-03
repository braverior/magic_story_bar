import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import useStore from './store/useStore'
import Sidebar from './components/Sidebar'
import Settings from './components/Settings'
import BookReader from './components/BookReader'
import StoryCreator from './components/StoryCreator'
import StoryView from './components/StoryView'
import WelcomeScreen from './components/WelcomeScreen'

function App() {
  const { currentStory, isSettingsOpen, toggleSettings, apiConfig } = useStore()
  const [view, setView] = useState('welcome') // welcome, create, story
  const [isReading, setIsReading] = useState(false)
  
  // 当选中故事时，切换到故事视图
  useEffect(() => {
    if (currentStory) {
      setView('story')
    }
  }, [currentStory])
  
  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 阅读模式下的快捷键
      if (isReading) {
        if (e.key === 'Escape') {
          setIsReading(false)
        }
        return
      }
      
      // 全局快捷键
      if (e.key === 'Escape' && isSettingsOpen) {
        toggleSettings()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isReading, isSettingsOpen, toggleSettings])
  
  const handleNewStory = () => {
    setView('create')
  }
  
  const handleCloseCreate = () => {
    if (currentStory) {
      setView('story')
    } else {
      setView('welcome')
    }
  }
  
  const renderMainContent = () => {
    switch (view) {
      case 'create':
        return (
          <StoryCreator 
            onClose={handleCloseCreate}
            onOpenSettings={toggleSettings}
          />
        )
      case 'story':
        if (currentStory) {
          return <StoryView onRead={() => setIsReading(true)} />
        }
        return (
          <WelcomeScreen 
            onNewStory={handleNewStory}
            onOpenSettings={toggleSettings}
          />
        )
      default:
        return (
          <WelcomeScreen 
            onNewStory={handleNewStory}
            onOpenSettings={toggleSettings}
          />
        )
    }
  }
  
  return (
    <div className={`h-screen flex overflow-hidden font-${apiConfig.fontFamily || 'default'}`}>
      {/* 侧边栏 */}
      <Sidebar onNewStory={handleNewStory} />
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部工具栏 */}
        <div className="h-14 bg-white/50 backdrop-blur-sm border-b-2 border-candy-pink/20 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {currentStory && view === 'story' && (
              <span className="text-gray-600">
                📖 {currentStory.title}
              </span>
            )}
            {view === 'create' && (
              <span className="text-candy-purple font-bold">
                ✨ 正在创作新故事...
              </span>
            )}
            {view === 'welcome' && (
              <span className="text-gray-500">
                🏠 首页
              </span>
            )}
          </div>
          
          <button
            onClick={toggleSettings}
            className="w-10 h-10 rounded-full bg-candy-purple/10 hover:bg-candy-purple/20 
                     flex items-center justify-center transition-colors"
            title="设置"
          >
            <SettingsIcon className="w-5 h-5 text-candy-purple" />
          </button>
        </div>
        
        {/* 主要内容 */}
        <div className="flex-1 overflow-hidden flex">
          {renderMainContent()}
        </div>
      </div>
      
      {/* 设置面板 */}
      {isSettingsOpen && (
        <Settings onClose={toggleSettings} />
      )}
      
      {/* 绘本阅读器 */}
      {isReading && currentStory && (
        <BookReader onClose={() => setIsReading(false)} />
      )}
    </div>
  )
}

export default App
