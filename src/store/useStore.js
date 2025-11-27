import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // 故事列表
      stories: [],
      
      // 当前选中的故事
      currentStory: null,
      
      // 当前页码（阅读模式）
      currentPage: 0,
      
      // 是否正在生成
      isGenerating: false,
      
      // 是否正在朗读
      isReading: false,
      
      // 设置面板是否打开
      isSettingsOpen: false,
      
      // API配置
      apiConfig: {
        textApiKey: '',
        textApiUrl: 'https://api.newapi.pro/v1',
        textModel: 'gpt-4o-mini',
        imageApiKey: '',
        imageApiUrl: 'https://api.newapi.pro/v1',
        imageModel: 'dall-e-3',
        imgbbApiKey: '', // 免费图床API Key
        // 火山引擎TTS配置
        ttsAppId: '',
        ttsAccessKey: '',
        ttsResourceId: '',
        ttsVoice: 'zh_female_cancan_mars_bigtts',
      },
      
      // 添加故事
      addStory: (story) => set((state) => ({
        stories: [story, ...state.stories],
        currentStory: story,
        currentPage: 0
      })),
      
      // 删除故事
      deleteStory: (storyId) => set((state) => ({
        stories: state.stories.filter(s => s.id !== storyId),
        currentStory: state.currentStory?.id === storyId ? null : state.currentStory
      })),
      
      // 选择故事
      selectStory: (story) => set({ currentStory: story, currentPage: 0 }),
      
      // 清除当前故事
      clearCurrentStory: () => set({ currentStory: null, currentPage: 0 }),
      
      // 设置当前页码
      setCurrentPage: (page) => set({ currentPage: page }),
      
      // 下一页
      nextPage: () => set((state) => {
        if (state.currentStory && state.currentPage < state.currentStory.pages.length - 1) {
          return { currentPage: state.currentPage + 1 }
        }
        return state
      }),
      
      // 上一页
      prevPage: () => set((state) => {
        if (state.currentPage > 0) {
          return { currentPage: state.currentPage - 1 }
        }
        return state
      }),
      
      // 设置生成状态
      setIsGenerating: (value) => set({ isGenerating: value }),
      
      // 设置朗读状态
      setIsReading: (value) => set({ isReading: value }),
      
      // 打开/关闭设置面板
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      
      // 更新API配置
      updateApiConfig: (config) => set((state) => ({
        apiConfig: { ...state.apiConfig, ...config }
      })),
      
      // 更新故事（用于更新图片等）
      updateStory: (storyId, updates) => set((state) => ({
        stories: state.stories.map(s => 
          s.id === storyId ? { ...s, ...updates } : s
        ),
        currentStory: state.currentStory?.id === storyId 
          ? { ...state.currentStory, ...updates } 
          : state.currentStory
      })),
    }),
    {
      name: 'picture-book-storage',
      partialize: (state) => ({
        stories: state.stories,
        apiConfig: state.apiConfig,
      }),
    }
  )
)

export default useStore
