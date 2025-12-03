import React, { useState } from 'react'
import { Wand2, Sparkles, AlertCircle } from 'lucide-react'
import useStore from '../store/useStore'
import { generatePictureBook } from '../services/api'

function StoryCreator({ onClose, onOpenSettings }) {
  const { apiConfig, updateApiConfig, addStory, setIsGenerating, isGenerating } = useStore()
  const [prompt, setPrompt] = useState('')
  const [progress, setProgress] = useState({ message: '', percent: 0 })
  const [error, setError] = useState('')
  
  const storyIdeas = [
    '🐰 一只勇敢的小兔子',
    '🦋 会飞的花朵',
    '🌈 彩虹桥上的冒险',
    '🐻 小熊找朋友',
    '🌟 星星的愿望',
    '🐠 海底的宝藏',
    '🦄 独角兽的秘密',
    '🍎 会说话的苹果树',
  ]
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请告诉我你想听什么故事呀！')
      return
    }

    // 确保使用最新的配置
    const currentConfig = useStore.getState().apiConfig
    
    // 检查API配置
    if (!apiConfig.textApiKey) {
      setError('请先配置故事生成的API Key')
      return
    }
    
    setError('')
    setIsGenerating(true)
    
    try {
      const story = await generatePictureBook(
        prompt.trim(),
        currentConfig,
        (message, percent) => {
          setProgress({ message, percent })
        }
      )
      
      addStory(story)
      onClose()
    } catch (error) {
      console.error('生成故事失败:', error)
      setError(error.message || '生成故事时出错了，请稍后重试')
    } finally {
      setIsGenerating(false)
      setProgress({ message: '', percent: 0 })
    }
  }
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bubble-bg">
      <div className="w-full max-w-2xl">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Wand2 className="w-10 h-10 text-candy-purple animate-bounce-gentle" />
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue">
              创作魔法故事
            </h2>
            <Sparkles className="w-10 h-10 text-candy-yellow animate-twinkle" />
          </div>
          <p className="text-gray-500">告诉我你想听什么故事，魔法小精灵会为你创作专属绘本！</p>
        </div>
        
        {/* 输入框 */}
        <div className="card-kid p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-600 font-bold">
              ✨ 我想听一个关于...的故事
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => updateApiConfig({ storyLanguage: 'zh' })}
                className={`px-3 py-1 rounded-full text-sm transition-all ${apiConfig.storyLanguage === 'zh' ? 'bg-candy-purple text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                中文
              </button>
              <button
                onClick={() => updateApiConfig({ storyLanguage: 'en' })}
                className={`px-3 py-1 rounded-full text-sm transition-all ${apiConfig.storyLanguage === 'en' ? 'bg-candy-purple text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                English
              </button>
            </div>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：一只住在月亮上的小兔子，它每天都会给地球上的小朋友送去甜甜的梦..."
            className="input-kid w-full h-32 resize-none"
            disabled={isGenerating}
          />
          
          {/* 快速选择 */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">💡 或者试试这些有趣的主题：</p>
            <div className="flex flex-wrap gap-2">
              {storyIdeas.map((idea, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(idea.slice(2))}
                  disabled={isGenerating}
                  className="px-3 py-1 bg-gradient-to-r from-candy-yellow/50 to-candy-orange/50 
                           rounded-full text-sm text-gray-600 hover:from-candy-yellow hover:to-candy-orange 
                           transition-all hover:scale-105 disabled:opacity-50"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
            {error.includes('API') && (
              <button
                onClick={onOpenSettings}
                className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-full text-red-600 text-sm transition-colors"
              >
                去配置
              </button>
            )}
          </div>
        )}
        
        {/* 生成进度 */}
        {isGenerating && (
          <div className="mb-6 card-kid p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="loading-magic">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="text-candy-purple font-bold">{progress.message || '魔法施展中...'}</span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full animate-rainbow rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="text-center text-gray-400 text-sm mt-2">
              请耐心等待，魔法小精灵正在为你绘制精美的故事书... ✨
            </p>
          </div>
        )}
        
        {/* 按钮 */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-6 py-3 rounded-full border-3 border-gray-300 text-gray-500 
                     hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="btn-magic text-xl px-8 py-3 flex items-center gap-2"
          >
            <Wand2 className="w-6 h-6" />
            {isGenerating ? '魔法施展中...' : '开始创作魔法 ✨'}
          </button>
        </div>
        
        {/* 底部装饰 */}
        <div className="mt-12 text-center">
          <div className="inline-flex gap-4 text-4xl">
            <span className="animate-float" style={{ animationDelay: '0s' }}>🌙</span>
            <span className="animate-float" style={{ animationDelay: '0.2s' }}>⭐</span>
            <span className="animate-float" style={{ animationDelay: '0.4s' }}>🦋</span>
            <span className="animate-float" style={{ animationDelay: '0.6s' }}>🌸</span>
            <span className="animate-float" style={{ animationDelay: '0.8s' }}>🌈</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryCreator
