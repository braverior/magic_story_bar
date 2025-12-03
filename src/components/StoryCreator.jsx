import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Wand2, Sparkles, AlertCircle, RotateCcw } from 'lucide-react'
import useStore from '../store/useStore'
import { generatePictureBook } from '../services/api'

const ALL_STORY_IDEAS = [
  '🐰 一只勇敢的小兔子',
  '🦋 会飞的花朵',
  '🌈 彩虹桥上的冒险',
  '🐻 小熊找朋友',
  '🌟 星星的愿望',
  '🐠 海底的宝藏',
  '🦄 独角兽的秘密',
  '🍎 会说话的苹果树',
  '🚀 遨游太空的猫咪',
  '🦕 迷路的恐龙宝宝',
  '🏰 糖果城堡的派对',
  '🧜‍♀️ 人鱼公主的歌声',
  '🧚‍♂️ 森林里的精灵舞会',
  '🎪 动物园里的魔法师',
  '🚂 开往云端的火车',
  '🪁 风筝带我去旅行',
  '🤖 想要心跳的机器人',
  '🦊 聪明的狐狸侦探',
  '🦉 戴眼镜的猫头鹰博士',
  '🐼 功夫熊猫的学徒',
  '🦁 狮子王的温柔时刻',
  '🐘 大象的喷水节',
  '🦒 长颈鹿的围巾',
  '🐧 企鹅的滑冰比赛',
  '🐬 海豚的音乐会',
  '🐋 蓝鲸的深海故事',
  '🐙 章鱼八爪的厨艺大赛',
  '🐢 乌龟爷爷的慢时光',
  '🐿️ 松鼠的橡果银行',
  '🦔 刺猬的拥抱',
  '🦢 天鹅湖的芭蕾舞',
  '🦜 鹦鹉学舌闹笑话',
  '🦩 火烈鸟的单腿站立挑战',
  '🦓 斑马的条纹去哪了',
  '🦘 袋鼠妈妈的口袋',
  '🐊 鳄鱼医生的牙科诊所',
  '🦈 鲨鱼宝宝不想刷牙',
  '🐌 蜗牛的赛车梦',
  '🐛 毛毛虫的变身日记',
  '🐝 勤劳小蜜蜂的一天',
  '🐞 瓢虫的点点不见了',
  '🦗 蟋蟀的小提琴独奏',
  '🕷️ 蜘蛛侠的织网课',
  '🦂 蝎子的沙漠探险',
  '🦟 蚊子的飞行特训',
  '🦠 细菌王国的秘密',
  '🍄 蘑菇屋的小矮人',
  '🌵 仙人掌的拥抱',
  '🌴 椰子树下的午睡',
  '🌲 圣诞树的愿望',
  '🍁 一片落叶的旅行',
  '🌻 向日葵的微笑',
  '🌹 玫瑰花的刺',
  '🌷 郁金香的花园',
  '🌼 雏菊的小秘密',
  '🌙 月亮上的捣药兔',
  '☀️ 太阳公公的墨镜',
  '☁️ 云朵变成棉花糖',
  '⛈️ 雷公公的架子鼓',
  '❄️ 雪花的舞蹈',
  '💧 小水滴的大海之旅',
  '🔥 小火苗的冒险',
  '💨 风儿的恶作剧',
  '⛰️ 大山的沉默',
  '🌋 火山的脾气',
  '🌊 海浪的摇篮曲',
  '🏝️ 荒岛求生记',
  '🏙️ 城市里的流浪猫',
  '🏡 老房子的回忆',
  '🎠 旋转木马的梦',
  '🎡 摩天轮的最高点',
  '🎢 过山车的尖叫',
  '🧸 玩具熊的午夜派对',
  '🧩 拼图少了一块',
  '🎨 画笔的魔法',
  '🎹 钢琴键的争吵',
  '🥁 鼓手的节奏',
  '🎺 小号的起床号',
  '🎻 大提琴的忧伤',
  '🎸 吉他的摇滚梦',
  '🎤 麦克风的舞台',
  '🎧 耳机的悄悄话',
  '📚 书本里的世界',
  '✏️ 铅笔和橡皮擦',
  '🎒 书包里的秘密',
  '👟 跑鞋的马拉松',
  '👓 眼镜的模糊世界',
  '🕰️ 老钟表的嘀嗒声',
  '🕯️ 蜡烛的最后光芒',
  '💡 灯泡的灵感',
  '🎁 神秘的礼物盒',
  '🎈 气球飞向天空',
  '🎀 蝴蝶结的装饰',
  '🎊 节日的烟花',
  '🎉 派对的惊喜',
  '🧹 扫帚的飞行课',
  '🔮 水晶球的预言',
  '🧙‍♀️ 女巫的魔药锅',
  '🧛‍♂️ 吸血鬼的素食日记',
  '🧟‍♂️ 僵尸的舞蹈比赛',
]

function StoryCreator({ onClose, onOpenSettings }) {
  const { apiConfig, updateApiConfig, addStory, setIsGenerating, isGenerating } = useStore()
  const [prompt, setPrompt] = useState('')
  const [progress, setProgress] = useState({ message: '', percent: 0 })
  const [error, setError] = useState('')
  
  const [storyIdeas, setStoryIdeas] = useState([])
  const [isVisible, setIsVisible] = useState(true)
  const timerRef = useRef(null)

  const getRandomIdeas = () => {
    const shuffled = [...ALL_STORY_IDEAS].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 8)
  }

  const refreshIdeas = () => {
    setIsVisible(false)
    setTimeout(() => {
      setStoryIdeas(getRandomIdeas())
      setIsVisible(true)
    }, 500)
  }

  const handleManualRefresh = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    refreshIdeas()
    timerRef.current = setInterval(refreshIdeas, 10000)
  }

  useEffect(() => {
    // 初始化
    setStoryIdeas(getRandomIdeas())

    // 定时切换
    timerRef.current = setInterval(refreshIdeas, 10000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])
  
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

    // 阻止刷新
    window.onbeforeunload = (e) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }
    
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
      // 恢复刷新
      window.onbeforeunload = null
      setIsGenerating(false)
      setProgress({ message: '', percent: 0 })
    }
  }
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
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
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">💡 或者试试这些有趣的主题：</p>
              <button
                onClick={handleManualRefresh}
                className="flex items-center gap-1 text-xs text-candy-purple hover:text-candy-blue transition-colors"
                title="换一批"
              >
                <RotateCcw className="w-3 h-3" />
                <span>换一批</span>
              </button>
            </div>
            <div className={`flex flex-wrap gap-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
        

      </div>
    </div>
  )
}

export default StoryCreator
