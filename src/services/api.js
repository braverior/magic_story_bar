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
  const { textApiKey, textApiUrl, textModel, storyLanguage } = apiConfig
  
  if (!textApiKey) {
    throw new Error('请先配置文本生成API Key')
  }
  
  const isEnglish = storyLanguage === 'en'

  const systemPrompt = isEnglish 
    ? `You are a professional children's picture book author, specializing in creating warm stories suitable for children aged 3-8.
Please create a picture book story based on the user's theme, with the following requirements:
1. The story must have a clear beginning, development, and a happy ending
2. The language should be simple and easy to understand, suitable for children
3. The content should be positive and uplifting
4. The story should be divided into 5-8 pages, with about 40-80 words per page
5. Each page's content should be visualizable for illustration purposes
6. Do not include newline characters \\n in the text, use complete sentences

Please return in JSON format as follows:
{
  "title": "Story Title",
  "pages": [
    {
      "text": "Content of the first page",
      "imagePrompt": "English description for generating the illustration. Requirements: children's picture book style, cute and warm, bright colors"
    }
  ]
}`
    : `你是一个专业的儿童绘本作家，擅长创作适合3-8岁儿童的温馨故事。
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
        { 
          role: 'user', 
          content: isEnglish 
            ? `Please create a children's picture book story about "${prompt}". Please ensure the story is written in English.` 
            : `请创作一个关于"${prompt}"的儿童绘本故事` 
        }
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

// 文字转语音（火山引擎TTS V3单向流式）
export async function textToSpeech(text, apiConfig) {
  const { ttsAppId, ttsAccessKey, ttsResourceId, ttsVoice, storyLanguage } = apiConfig
  
  if (!ttsAppId || !ttsAccessKey) {
    throw new Error('请先配置火山引擎TTS的App ID和Access Key')
  }
  
  // 使用代理访问火山引擎TTS API V3 (单向流式)
  const apiEndpoint = '/volc-tts/unidirectional'
  console.log('语音合成API:', apiEndpoint, '音色:', ttsVoice)
  
  // 构建请求体（根据火山引擎V3 Python Demo）
  const requestBody = {
    user: {
      uid: 'magic_story_' + Date.now()
    },
    req_params: {
      text: text,
      speaker: ttsVoice || 'zh_female_xueayi_saturn_bigtts',
      audio_params: {
        format: 'mp3',
        sample_rate: 24000,
        enable_timestamp: false
      },
      additions: JSON.stringify({
        explicit_language: storyLanguage === 'en' ? 'en' : 'zh',
        disable_markdown_filter: true
      })
    }
  }
  
  console.log('TTS请求体:', JSON.stringify(requestBody, null, 2))
  
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-App-Id': ttsAppId,
      'X-Api-Access-Key': ttsAccessKey,
      'X-Api-Resource-Id': ttsResourceId || 'volc.service_type.10029',
      'Connection': 'keep-alive'
    },
    body: JSON.stringify(requestBody),
    signal: signal  // 支持取消请求
  })
  
  console.log('TTS响应状态:', response.status, response.headers.get('content-type'))
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('TTS错误响应:', errorText)
    throw new Error(`语音合成失败: ${response.status} - ${errorText}`)
  }
  
  // V3单向流式API返回的是多行JSON流，每行包含一个chunk
  // 需要逐行读取并解码base64音频数据
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const audioChunks = []
  let buffer = ''
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      
      // 按行分割处理
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个不完整的行
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        try {
          const data = JSON.parse(line)
          console.log('TTS chunk code:', data.code)
          
          // code=0且有data表示音频数据
          if (data.code === 0 && data.data) {
            const chunkAudio = base64ToUint8Array(data.data)
            audioChunks.push(chunkAudio)
            continue
          }
          
          // code=20000000表示传输完成
          if (data.code === 20000000) {
            console.log('TTS传输完成')
            break
          }
          
          // 其他非零code表示错误
          if (data.code && data.code !== 0 && data.code !== 20000000) {
            console.error('TTS错误:', data)
            throw new Error(data.message || `TTS错误码: ${data.code}`)
          }
        } catch (parseError) {
          if (parseError.message.includes('TTS错误码')) {
            throw parseError
          }
          console.warn('JSON解析警告:', parseError.message, line)
        }
      }
    }
    
    // 处理buffer中剩余的数据
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer)
        if (data.code === 0 && data.data) {
          const chunkAudio = base64ToUint8Array(data.data)
          audioChunks.push(chunkAudio)
        }
      } catch (e) {
        console.warn('最后一行解析失败:', e.message)
      }
    }
    
  } finally {
    reader.releaseLock()
  }
  
  if (audioChunks.length === 0) {
    throw new Error('语音合成未返回音频数据')
  }
  
  // 合并所有音频chunk
  const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const audioData = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of audioChunks) {
    audioData.set(chunk, offset)
    offset += chunk.length
  }
  
  console.log('TTS音频总大小:', (totalLength / 1024).toFixed(2), 'KB')
  
  const audioBlob = new Blob([audioData], { type: 'audio/mp3' })
  return URL.createObjectURL(audioBlob)
}

// Base64转Uint8Array
function base64ToUint8Array(base64) {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

// Base64转Blob
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
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

// 流式文字转语音（边接收边播放）
export async function textToSpeechStream(text, apiConfig, onAudioChunk, signal) {
  const { ttsAppId, ttsAccessKey, ttsResourceId, ttsVoice, storyLanguage } = apiConfig
  
  if (!ttsAppId || !ttsAccessKey) {
    throw new Error('请先配置火山引擎TTS的App ID和Access Key')
  }
  
  const apiEndpoint = '/volc-tts/unidirectional'
  console.log('流式语音合成API:', apiEndpoint, '音色:', ttsVoice)
  
  const requestBody = {
    user: {
      uid: 'magic_story_stream_' + Date.now()
    },
    req_params: {
      text: text,
      speaker: ttsVoice || 'zh_female_xueayi_saturn_bigtts',
      audio_params: {
        format: 'mp3',
        sample_rate: 24000,
        enable_timestamp: false
      },
      additions: JSON.stringify({
        explicit_language: 'zh',
        disable_markdown_filter: true
      })
    }
  }
  
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-App-Id': ttsAppId,
      'X-Api-Access-Key': ttsAccessKey,
      'X-Api-Resource-Id': ttsResourceId || 'volc.service_type.10029',
      'Connection': 'keep-alive'
    },
    body: JSON.stringify(requestBody)
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('TTS流式错误响应:', errorText)
    throw new Error(`语音合成失败: ${response.status} - ${errorText}`)
  }
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let isCompleted = false
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        try {
          const data = JSON.parse(line)
          
          if (data.code === 0 && data.data) {
            const chunkAudio = base64ToUint8Array(data.data)
            // 实时回调音频数据
            await onAudioChunk?.(chunkAudio)
            continue
          }
          
          if (data.code === 20000000) {
            console.log('TTS流式传输完成')
            isCompleted = true
            break
          }
          
          if (data.code && data.code !== 0 && data.code !== 20000000) {
            console.error('TTS流式错误:', data)
            throw new Error(data.message || `TTS错误码: ${data.code}`)
          }
        } catch (parseError) {
          if (parseError.message.includes('TTS错误码')) {
            throw parseError
          }
          console.warn('JSON解析警告:', parseError.message)
        }
      }
      
      if (isCompleted) break
    }
    
    // 处理buffer中剩余的数据
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer)
        if (data.code === 0 && data.data) {
          const chunkAudio = base64ToUint8Array(data.data)
          await onAudioChunk?.(chunkAudio)
        }
      } catch (e) {
        console.warn('最后一行解析失败:', e.message)
      }
    }
    
  } finally {
    reader.releaseLock()
  }
  
  return isCompleted
}
