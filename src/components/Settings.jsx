import React, { useState } from 'react'
import { X, Key, Mic, Image, MessageSquare, Save, Eye, EyeOff, Type, Download, Upload, FileJson, Trash2 } from 'lucide-react'
import useStore from '../store/useStore'

function Settings({ onClose }) {
  const { apiConfig, updateApiConfig } = useStore()
  const [config, setConfig] = useState(apiConfig)
  const [showKeys, setShowKeys] = useState({
    textApiKey: false,
    imageApiKey: false,
    ttsAccessKey: false
  })
  const [saved, setSaved] = useState(false)
  
  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }
  
  const handleSave = () => {
    updateApiConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  
  const toggleShowKey = (field) => {
    setShowKeys(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'magic-story-config.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedConfig = JSON.parse(event.target.result)
        // 简单的验证
        if (typeof importedConfig === 'object') {
          setConfig(prev => ({
            ...prev,
            ...importedConfig
          }))
          alert('配置导入成功！请点击保存按钮以应用更改。')
        } else {
          throw new Error('无效的配置文件')
        }
      } catch (err) {
        alert('导入失败：文件格式不正确')
      }
    }
    reader.readAsText(file)
  }

  const handleClearConfig = () => {
    if (window.confirm('确定要清空所有配置吗？此操作不可恢复！')) {
      const emptyConfig = {
        // 文本生成配置
        textApiKey: '',
        textApiUrl: 'https://api.newapi.pro/v1',
        textModel: 'gpt-4o-mini',
        
        // 图片生成配置
        imageApiKey: '',
        imageApiUrl: 'https://api.newapi.pro/v1',
        imageModel: 'dall-e-3',
        
        // 语音合成配置
        ttsAppId: '',
        ttsAccessKey: '',
        ttsResourceId: '',
        ttsVoice: 'zh_female_xueayi_saturn_bigtts',
        
        // 外观配置
        fontFamily: 'default'
      }
      setConfig(emptyConfig)
      updateApiConfig(emptyConfig)
      alert('配置已清空')
    }
  }

  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-candy-pink to-candy-purple p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">魔法设置</h2>
              <p className="text-white/80 text-xs">配置你的AI魔法钥匙</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* 外观配置 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-5 h-5 text-candy-purple" />
              <h3 className="font-bold text-gray-700">🎨 外观设置</h3>
            </div>
            <div className="bg-candy-purple/10 rounded-2xl p-4">
              <label className="text-sm text-gray-600 mb-2 block">阅读字体</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[ 
                  { id: 'default', name: '默认', class: 'font-default' },
                  { id: 'serif', name: '书本', class: 'font-serif' },
                  { id: 'comic', name: '卡通', class: 'font-comic' },
                  { id: 'round', name: '圆润', class: 'font-round' }
                ].map(font => (
                  <button
                    key={font.id}
                    onClick={() => {
                      handleChange('fontFamily', font.id)
                      updateApiConfig({ ...config, fontFamily: font.id })
                    }}
                    className={`
                      px-3 py-2 rounded-xl text-sm transition-all border-2
                      ${config.fontFamily === font.id 
                        ? 'border-candy-purple bg-white text-candy-purple shadow-md' 
                        : 'border-transparent hover:bg-white/50 text-gray-600'}
                      ${font.class}
                    `}
                  >
                    {font.name}
                    <div className="text-xs opacity-60">Abc</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 文本生成配置 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-candy-blue" />
              <h3 className="font-bold text-gray-700">📝 故事生成配置</h3>
            </div>
            <div className="bg-candy-blue/10 rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">API Key</label>
                <div className="relative">
                  <input
                    type={showKeys.textApiKey ? 'text' : 'password'}
                    value={config.textApiKey}
                    onChange={(e) => handleChange('textApiKey', e.target.value)}
                    placeholder="输入你的API Key"
                    className="input-kid w-full pr-10"
                  />
                  <button
                    onClick={() => toggleShowKey('textApiKey')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys.textApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">API 地址</label>
                  <input
                    type="text"
                    value={config.textApiUrl}
                    onChange={(e) => handleChange('textApiUrl', e.target.value)}
                    placeholder="https://api.newapi.pro/v1"
                    className="input-kid w-full text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">模型名称</label>
                  <input
                    type="text"
                    value={config.textModel}
                    onChange={(e) => handleChange('textModel', e.target.value)}
                    placeholder="gpt-4o-mini"
                    className="input-kid w-full text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">常用模型：gpt-4o-mini, gpt-4o, gpt-3.5-turbo, claude-3-sonnet 等</p>
            </div>
          </div>
          
          {/* 图片生成配置 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-5 h-5 text-candy-green" />
              <h3 className="font-bold text-gray-700">🎨 插图生成配置</h3>
            </div>
            <div className="bg-candy-green/10 rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">API Key</label>
                <div className="relative">
                  <input
                    type={showKeys.imageApiKey ? 'text' : 'password'}
                    value={config.imageApiKey}
                    onChange={(e) => handleChange('imageApiKey', e.target.value)}
                    placeholder="输入你的API Key（可与文本API共用）"
                    className="input-kid w-full pr-10"
                  />
                  <button
                    onClick={() => toggleShowKey('imageApiKey')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys.imageApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">API 地址</label>
                  <input
                    type="text"
                    value={config.imageApiUrl}
                    onChange={(e) => handleChange('imageApiUrl', e.target.value)}
                    placeholder="https://api.newapi.pro/v1"
                    className="input-kid w-full text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">模型名称</label>
                  <input
                    type="text"
                    value={config.imageModel}
                    onChange={(e) => handleChange('imageModel', e.target.value)}
                    placeholder="dall-e-3"
                    className="input-kid w-full text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">常用模型：dall-e-3, dall-e-2, stable-diffusion-xl 等</p>
            </div>
          </div>
          
          {/* 语音合成配置 - 火山引擎TTS */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-5 h-5 text-candy-purple" />
              <h3 className="font-bold text-gray-700">🎤 语音朗读配置（火山引擎TTS）</h3>
            </div>
            <div className="bg-candy-purple/10 rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">App ID</label>
                <input
                  type="text"
                  value={config.ttsAppId}
                  onChange={(e) => handleChange('ttsAppId', e.target.value)}
                  placeholder="输入火山引擎App ID"
                  className="input-kid w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Access Key</label>
                <div className="relative">
                  <input
                    type={showKeys.ttsAccessKey ? 'text' : 'password'}
                    value={config.ttsAccessKey}
                    onChange={(e) => handleChange('ttsAccessKey', e.target.value)}
                    placeholder="输入火山引擎Access Key"
                    className="input-kid w-full pr-10"
                  />
                  <button
                    onClick={() => toggleShowKey('ttsAccessKey')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys.ttsAccessKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Resource ID（资源ID）</label>
                <input
                  type="text"
                  value={config.ttsResourceId}
                  onChange={(e) => handleChange('ttsResourceId', e.target.value)}
                  placeholder="输入火山引擎Resource ID"
                  className="input-kid w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">音色ID（speaker）</label>
                <input
                  type="text"
                  value={config.ttsVoice}
                  onChange={(e) => handleChange('ttsVoice', e.target.value)}
                  placeholder="zh_female_xueayi_saturn_bigtts"
                  className="input-kid w-full text-sm"
                />
              </div>
              <p className="text-xs text-gray-400">
                推荐音色：zh_female_xueayi_saturn_bigtts（故事）、zh_female_wanwanxiaohe_moon_bigtts（小荷）、zh_male_chunhou_mars_bigtts（淳厚）
              </p>
            </div>
          </div>
          
          {/* 配置管理 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileJson className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-700">⚙️ 配置管理</h3>
            </div>
            <div className="bg-gray-100 rounded-2xl p-4 flex gap-4">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 hover:border-candy-blue hover:text-candy-blue text-gray-600 py-2 rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                导出配置
              </button>
              <label className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 hover:border-candy-green hover:text-candy-green text-gray-600 py-2 rounded-xl transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                导入配置
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImport} 
                  className="hidden" 
                />
              </label>
              <button
                onClick={handleClearConfig}
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 hover:border-red-500 hover:text-red-500 text-gray-600 py-2 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
                清空配置
              </button>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="bg-candy-yellow/30 rounded-2xl p-4 text-sm text-gray-600">
            <p className="font-bold mb-2">💡 小提示：</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>API接口兼容 OpenAI 格式，支持 NewAPI、OneAPI 等中转服务</li>
              <li>图片生成API Key可以和文本API Key相同（如果服务商支持）</li>
              <li>语音朗读使用火山引擎大模型语音合成，音质清晰自然</li>
              <li>配置会自动保存在浏览器中，下次打开自动加载</li>
            </ul>
          </div>
        </div>
        
        {/* 底部 */}
        <div className="border-t-2 border-candy-pink/30 p-4 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-full border-2 border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="btn-magic flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saved ? '已保存 ✓' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
