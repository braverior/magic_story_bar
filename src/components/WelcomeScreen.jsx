import React from 'react'
import { Sparkles, Settings, BookOpen, Wand2 } from 'lucide-react'

function WelcomeScreen({ onNewStory, onOpenSettings }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bubble-bg">
      <div className="text-center max-w-xl">
        {/* 大标题动画 */}
        <div className="mb-8">
          <div className="text-8xl mb-4 animate-bounce-gentle">📚</div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue mb-2">
            欢迎来到魔法绘本屋
          </h1>
          <p className="text-gray-500 text-lg">
            在这里，每一个故事都是独一无二的魔法 ✨
          </p>
        </div>
        
        {/* 特性介绍 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-kid p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-candy-pink/20 rounded-full flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-candy-pink" />
            </div>
            <h3 className="font-bold text-gray-700 text-sm">AI创作</h3>
            <p className="text-xs text-gray-500">智能生成故事</p>
          </div>
          <div className="card-kid p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-candy-blue/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="font-bold text-gray-700 text-sm">精美插图</h3>
            <p className="text-xs text-gray-500">自动配插画</p>
          </div>
          <div className="card-kid p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-candy-green/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔊</span>
            </div>
            <h3 className="font-bold text-gray-700 text-sm">语音朗读</h3>
            <p className="text-xs text-gray-500">温柔讲故事</p>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onNewStory}
            className="btn-magic text-xl px-8 py-4 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-6 h-6" />
            开始创作我的故事
          </button>
          <button
            onClick={onOpenSettings}
            className="px-6 py-4 rounded-full border-3 border-candy-purple/50 text-candy-purple 
                     hover:bg-candy-purple/10 transition-all flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            配置API密钥
          </button>
        </div>
        
        {/* 提示 */}
        <div className="mt-8 p-4 bg-candy-yellow/20 rounded-2xl">
          <p className="text-sm text-gray-600">
            💡 <span className="font-bold">小提示：</span>
            首次使用请先点击"配置API密钥"，设置你的AI服务密钥
          </p>
        </div>
        

      </div>
    </div>
  )
}

export default WelcomeScreen
