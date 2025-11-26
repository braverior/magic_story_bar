import React from 'react'
import { Book, Trash2, Plus, Sparkles } from 'lucide-react'
import useStore from '../store/useStore'

function Sidebar({ onNewStory }) {
  const { stories, currentStory, selectStory, deleteStory } = useStore()
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <div className="w-72 h-full bg-white/80 backdrop-blur-sm border-r-4 border-candy-pink flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b-2 border-candy-pink/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-candy-pink to-candy-purple flex items-center justify-center animate-bounce-gentle">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
              魔法绘本屋
            </h1>
            <p className="text-xs text-gray-500">创造属于你的故事 ✨</p>
          </div>
        </div>
        
        <button 
          onClick={onNewStory}
          className="w-full btn-magic flex items-center justify-center gap-2 text-lg"
        >
          <Plus className="w-5 h-5" />
          创作新故事
        </button>
      </div>
      
      {/* 故事列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-sm text-gray-500 px-2 py-2 flex items-center gap-2">
          <Book className="w-4 h-4" />
          我的故事书 ({stories.length})
        </div>
        
        {stories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-sm">还没有故事呢</p>
            <p className="text-xs">点击上方按钮开始创作吧！</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className={`story-item p-3 rounded-xl cursor-pointer group ${
                  currentStory?.id === story.id ? 'active' : ''
                }`}
                onClick={() => selectStory(story)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  {/* 封面缩略图 */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-candy-yellow to-candy-orange flex-shrink-0">
                    {story.pages[0]?.image ? (
                      <img 
                        src={story.pages[0].image} 
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        📖
                      </div>
                    )}
                  </div>
                  
                  {/* 故事信息 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-700 truncate text-sm">
                      {story.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {story.prompt}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-candy-purple">
                        {story.pages.length} 页
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(story.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('确定要删除这个故事吗？')) {
                        deleteStory(story.id)
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 底部装饰 */}
      <div className="p-4 border-t-2 border-candy-pink/30">
        <div className="flex justify-center gap-2 text-2xl">
          <span className="animate-bounce" style={{ animationDelay: '0s' }}>🌈</span>
          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>⭐</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🦋</span>
          <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🌸</span>
          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🎨</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
