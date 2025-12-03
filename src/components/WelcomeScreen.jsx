import React from 'react'
import { Sparkles, Settings, BookOpen, Wand2, Palette, Music, Star, Cloud, Heart } from 'lucide-react'

function WelcomeScreen({ onNewStory, onOpenSettings }) {
  return (
    <div className="flex-1 overflow-y-auto relative">
      <div className="min-h-full flex items-center justify-center p-8">
        {/* 漂浮的装饰元素 */}
        <div className="absolute top-20 left-20 text-purple-300 animate-float">
        <Star className="w-8 h-8 fill-current opacity-60" />
      </div>
      <div className="absolute bottom-20 right-20 text-candy-blue animate-float-delay-1">
        <Cloud className="w-10 h-10 fill-current opacity-60" />
      </div>
      <div className="absolute top-32 right-32 text-candy-purple animate-float-delay-2">
        <Heart className="w-6 h-6 fill-current opacity-60" />
      </div>
      <div className="absolute bottom-32 left-32 text-candy-yellow animate-float">
        <Sparkles className="w-8 h-8 fill-current opacity-60" />
      </div>

      <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8 items-center z-10">
        {/* 左侧：魔法书封面展示 */}
        <div className="flex-1 w-full">
          <div className="magic-book-cover aspect-[3/4] p-8 flex flex-col items-center justify-center text-white text-center cursor-pointer group">
            <div className="magic-book-spine"></div>
            <div className="mb-6 bg-white/20 p-6 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
              <BookOpen className="w-16 h-16" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-shadow-sm font-comic">
              魔法绘本屋
            </h1>
            <p className="text-lg opacity-90 font-round">
              在这里，每一个故事<br/>都是独一无二的魔法 ✨
            </p>
            <div className="mt-8 flex gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>

        {/* 右侧：功能与操作 */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* 欢迎标语 */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 font-comic">
              准备好开始冒险了吗？
            </h2>
            <p className="text-gray-500">
              选择一个神奇的功能，开启你的创作之旅
            </p>
          </div>

          {/* 特性卡片 */}
          <div className="grid grid-cols-1 gap-4">
            <div className="card-kid p-4 flex items-center gap-4 hover:bg-purple-50 cursor-default">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <Wand2 className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-700">AI 魔法创作</h3>
                <p className="text-sm text-gray-500">只需一句话，智能生成完整故事</p>
              </div>
            </div>

            <div className="card-kid p-4 flex items-center gap-4 hover:bg-candy-blue/5 cursor-default">
              <div className="w-12 h-12 bg-candy-blue/20 rounded-full flex items-center justify-center shrink-0">
                <Palette className="w-6 h-6 text-candy-blue" />
              </div>
              <div>
                <h3 className="font-bold text-gray-700">自动绘图</h3>
                <p className="text-sm text-gray-500">为每个场景绘制精美插图</p>
              </div>
            </div>

            <div className="card-kid p-4 flex items-center gap-4 hover:bg-candy-green/5 cursor-default">
              <div className="w-12 h-12 bg-candy-green/20 rounded-full flex items-center justify-center shrink-0">
                <Music className="w-6 h-6 text-candy-green" />
              </div>
              <div>
                <h3 className="font-bold text-gray-700">语音朗读</h3>
                <p className="text-sm text-gray-500">温柔的声音为你讲述故事</p>
              </div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={onNewStory}
              className="btn-magic text-lg w-full py-4 flex items-center justify-center gap-3 group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              开始创作我的故事
            </button>
            <button
              onClick={onOpenSettings}
              className="w-full py-3 rounded-xl border-2 border-dashed border-candy-purple/30 text-candy-purple/70 
                       hover:bg-candy-purple/5 hover:border-candy-purple hover:text-candy-purple 
                       transition-all flex items-center justify-center gap-2 font-bold"
            >
              <Settings className="w-4 h-4" />
              配置 API 密钥
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default WelcomeScreen
