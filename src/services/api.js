// API服务层 - 处理文本生成、图片生成、语音合成

// 将外部API URL转换为代理路径
function getProxyUrl(apiUrl, endpoint) {
  // 火山引擎API
  if (apiUrl.includes('volces.com') || apiUrl.includes('ark.cn-beijing')) {
    return `/volc-api${endpoint}`
  }
  // NewAPI
  if (apiUrl.includes('newapi.pro')) {
    return `/newapi${endpoint}`
  }
  // 其他API直接使用原始URL
  return `${apiUrl}${endpoint}`
}

// 生成故事文本
export async function generateStoryText(prompt, apiConfig) {
  const { textApiKey, textApiUrl, textModel } = apiConfig
  
  if (!textApiKey) {
    throw new Error('请先配置文本生成API Key')
  }
  
  const systemPrompt = `你是一个专业的儿童绘本作家，擅长创作适合3-8岁儿童的温馨故事。
请根据用户的主题创作一个绘本故事，要求：
1. 故事要有明确的开始、发展和美好的结局
2. 语言简单易懂，适合儿童阅读
3. 内容积极向上，传递正能量
4. 故事分为5-8页，每页80-150字左右
5. 每页内容要有画面感，便于配插图
6. 文本中不要包含换行符\\n，使用完整句子

请以JSON格式返回，格式如下：
{
  "title": "故事标题",
  "pages": [
    {
      "text": "第一页的故事内容",
      "imagePrompt": "用于生成插图的英文描述，要求：儿童绘本风格，可爱温馨，色彩明亮"
    }
  ]
}`

  const apiEndpoint = getProxyUrl(textApiUrl, '/chat/completions')
  console.log('文本生成API:', apiEndpoint)
  
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${textApiKey}`
    },
    body: JSON.stringify({
      model: textModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请创作一个关于"${prompt}"的儿童绘本故事` }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    })
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || '生成故事失败，请检查API配置')
  }
  
  const data = await response.json()
  const content = data.choices[0]?.message?.content
  
  try {
    const parsed = JSON.parse(content)
    if (parsed.pages) {
      parsed.pages = parsed.pages.map(page => ({
        ...page,
        text: page.text.replace(/\\n/g, '').replace(/\n/g, ' ').trim()
      }))
    }
    return parsed
  } catch (e) {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.pages) {
        parsed.pages = parsed.pages.map(page => ({
          ...page,
          text: page.text.replace(/\\n/g, '').replace(/\n/g, ' ').trim()
        }))
      }
      return parsed
    }
    throw new Error('故事格式解析失败')
  }
}

// 使用本地存储缓存图片URL
function saveImageToLocalStorage(storyId, pageIndex, imageUrl) {
  const key = `story_image_${storyId}_${pageIndex}`
  try {
    localStorage.setItem(key, imageUrl)
  } catch (e) {
    console.warn('localStorage存储失败:', e)
  }
}

function getImageFromLocalStorage(storyId, pageIndex) {
  const key = `story_image_${storyId}_${pageIndex}`
  return localStorage.getItem(key)
}

// 生成插图
export async function generateImage(prompt, apiConfig, storyId = null, pageIndex = null) {
  const { imageApiKey, imageApiUrl, imageModel } = apiConfig
  
  if (!imageApiKey) {
    throw new Error('请先配置图片生成API Key')
  }
  
  // 检查本地缓存
  if (storyId !== null && pageIndex !== null) {
    const cachedUrl = getImageFromLocalStorage(storyId, pageIndex)
    if (cachedUrl) {
      console.log('使用缓存图片:', cachedUrl.substring(0, 50))
      return cachedUrl
    }
  }
  
  const enhancedPrompt = `Children's picture book illustration style, cute and warm, bright colors, simple shapes, suitable for young children: ${prompt}`
  
  const apiEndpoint = getProxyUrl(imageApiUrl, '/images/generations')
  console.log('图片生成API:', apiEndpoint)
  
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${imageApiKey}`
    },
    body: JSON.stringify({
      model: imageModel,
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    })
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || '生成图片失败')
  }
  
  const data = await response.json()
  const imageUrl = data.data[0]?.url || data.data[0]?.b64_json
  
  // 保存到本地缓存
  if (storyId !== null && pageIndex !== null && imageUrl) {
    saveImageToLocalStorage(storyId, pageIndex, imageUrl)
  }
  
  return imageUrl
}

// 文字转语音
export async function textToSpeech(text, apiConfig) {
  const { ttsApiKey, ttsApiUrl, ttsModel, ttsVoice } = apiConfig
  
  if (!ttsApiKey) {
    throw new Error('请先配置语音合成API Key')
  }
  
  const apiEndpoint = getProxyUrl(ttsApiUrl, '/audio/speech')
  console.log('语音合成API:', apiEndpoint)
  
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ttsApiKey}`
    },
    body: JSON.stringify({
      model: ttsModel,
      input: text,
      voice: ttsVoice,
      response_format: 'mp3',
      speed: 0.9
    })
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || '语音合成失败')
  }
  
  const audioBlob = await response.blob()
  return URL.createObjectURL(audioBlob)
}

// 生成完整绘本（故事+图片）
export async function generatePictureBook(prompt, apiConfig, onProgress) {
  const storyId = Date.now().toString()
  
  onProgress?.('正在创作故事...', 0)
  const story = await generateStoryText(prompt, apiConfig)
  
  const pagesWithImages = []
  for (let i = 0; i < story.pages.length; i++) {
    const page = story.pages[i]
    onProgress?.(`正在绘制第 ${i + 1}/${story.pages.length} 页插图...`, ((i + 1) / (story.pages.length + 1)) * 100)
    
    try {
      const imageUrl = await generateImage(page.imagePrompt, apiConfig, storyId, i)
      pagesWithImages.push({
        ...page,
        image: imageUrl
      })
    } catch (error) {
      console.error(`第${i + 1}页图片生成失败:`, error)
      pagesWithImages.push({
        ...page,
        image: null,
        imageError: error.message
      })
    }
  }
  
  onProgress?.('绘本创作完成！', 100)
  
  return {
    id: storyId,
    title: story.title,
    prompt: prompt,
    pages: pagesWithImages,
    createdAt: new Date().toISOString()
  }
}

// 朗读故事页面
export async function readPageAloud(text, apiConfig) {
  const audioUrl = await textToSpeech(text, apiConfig)
  return audioUrl
}
