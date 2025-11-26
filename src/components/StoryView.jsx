import React from 'react'
import { BookOpen, Play, Trash2, Calendar, FileText } from 'lucide-react'
import useStore from '../store/useStore'

function StoryView({ onRead }) {
  const { currentStory, deleteStory, clearCurrentStory } = useStore()
  
  if (!currentStory) return null
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const handleDelete = () => {
    if (confirm('确定要删除这个故事吗？删除后将无法恢复哦！')) {
      deleteStory(currentStory.id)
    }
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-6 bubble-bg">
      <div className="max-w-4xl mx-auto">
        {/* 封面区域 */}
        <div className="card-kid p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 封面图 */}
            <div className="md:w-1/3">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-candy-pink to-candy-purple shadow-lg">
                {currentStory.pages[0]?.image ? (
                  <img 
                    src={currentStory.pages[0].image}
                    alt={currentStory.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl">📚</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 故事信息 */}
            <div className="md:w-2/3 flex flex-col">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-candy-pink to-candy-purple mb-3">
                {currentStory.title}
              </h1>
              
              <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{currentStory.pages.length} 页</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(currentStory.createdAt)}</span>
                </div>
              </div>
              
              <div className="bg-candy-yellow/20 rounded-xl p-4 mb-4">
                <p className="text-gray-600 text-sm">
                  <span className="font-bold">故事主题：</span>
                  {currentStory.prompt}
                </p>
              </div>
              
              <div className="flex-1" />
              
              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={onRead}
                  className="btn-magic flex-1 flex items-center justify-center gap-2 text-lg"
                >
                  <Play className="w-5 h-5" />
                  开始阅读
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-full border-2 border-red-300 text-red-400 
                           hover:bg-red-50 hover:border-red-400 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 故事预览 */}
        <div className="card-kid p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-candy-blue" />
            故事预览
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentStory.pages.map((page, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-candy-yellow/10 to-candy-orange/10 
                         rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={onRead}
              >
                {/* 页面缩略图 */}
                <div className="aspect-square rounded-lg overflow-hidden bg-white mb-3 shadow-sm">
                  {page.image ? (
                    <img 
                      src={page.image}
                      alt={`第${index + 1}页`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-candy-pink/20 to-candy-blue/20">
                      <span className="text-4xl">🎨</span>
                    </div>
                  )}
                </div>
                
                {/* 页面文字预览 */}
                <div className="text-sm text-gray-600 line-clamp-3">
                  {page.text}
                </div>
                
                {/* 页码 */}
                <div className="mt-2 text-center">
                  <span className="inline-block px-3 py-1 bg-candy-pink/20 rounded-full text-xs text-candy-pink font-bold">
                    第 {index + 1} 页
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 返回按钮 */}
        <div className="mt-6 text-center">
          <button
            onClick={clearCurrentStory}
            className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
          >
            ← 返回故事列表
          </button>
        </div>
      </div>
    </div>
  )
}

export default StoryView
