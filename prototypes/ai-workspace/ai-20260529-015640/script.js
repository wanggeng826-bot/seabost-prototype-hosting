// ============================================================
// AI Workspace v2 · Interactions
// ============================================================

// ===== STATE =====
let currentPage = 'ai-workspace';
let currentModel = 'deepseek';
let currentConversation = 1;
let currentAgent = 1;  // Track current agent
let agentSelectorOpen = false;  // Track if agent selector is open
let chatOpen = true;
let isOptimizing = false;
let isGenerating = false;
let isFetching = false;
let isSending = false;
let isWidgetSending = false;
let replyTimeoutId = null;
let widgetReplyTimeoutId = null;
let toastTimer = null;
let toastHideTimer = null;
let modelDropdownOpen = false;

// Per-conversation message history
const conversationMessages = {};

// ===== MOCK DATA =====
const agents = [
  { id: 1, name: 'Listing 优化专家', emoji: '📝', author: '官方', desc: '多平台 Listing 诊断、关键词优化、标题改写、A+ 文案生成', uses: 1240, forks: 56, tag: '运营', official: true, allowFork: true },
  { id: 2, name: '图片生成助手', emoji: '🖼', author: '官方', desc: '根据 Prompt 生成商品主图、场景图、广告图，支持多种风格', uses: 890, forks: 32, tag: '设计', official: true, allowFork: true },
  { id: 3, name: '广告诊断师', emoji: '📊', author: '李明', desc: '分析广告投放数据，识别低效投放，给出预算和出价建议', uses: 340, forks: 12, tag: '数据', official: false, allowFork: true },
  { id: 4, name: '差评回复助手', emoji: '💬', author: '王芳', desc: '根据差评内容生成专业、有礼的回复模板，提升客户满意度', uses: 520, forks: 28, tag: '客服', official: false, allowFork: true },
  { id: 5, name: 'Shopee 上新助手', emoji: '🛒', author: '陈涛', desc: '自动翻译标题、生成卖点、适配 Shopee 各站点语言风格', uses: 210, forks: 8, tag: '运营', official: false, allowFork: false },
  { id: 6, name: '竞品监控 Agent', emoji: '🔍', author: '赵敏', desc: '定时追踪竞品价格、评价、排名变化，自动推送摘要', uses: 180, forks: 15, tag: '数据', official: false, allowFork: true },
];

const myAgents = [
  { id: 101, name: '我的 Listing 助手', emoji: '✨', author: '我', desc: '基于官方 Listing 专家修改，加入了公司的品牌话术库', uses: 45, forks: 2, tag: '运营', status: '已发布' },
  { id: 102, name: 'TikTok 文案生成器', emoji: '🎵', author: '我', desc: '专门生成 TikTok Shop 的短视频文案和标签', uses: 12, forks: 0, tag: '营销', status: '草稿' },
];

const taskRecords = [
  { name: 'Listing 优化 · B0ABC12345', agent: 'Listing 优化专家', time: '2026-05-17 09:30', status: '已完成', statusColor: 'success' },
  { name: '图片生成 · 无线耳机主图 x4', agent: '图片生成助手', time: '2026-05-17 08:15', status: '已完成', statusColor: 'success' },
  { name: '广告诊断 · 美国站 SP 广告', agent: '广告诊断师', time: '2026-05-16 16:45', status: '已完成', statusColor: 'success' },
  { name: '竞品分析 · 充电宝类目', agent: '竞品监控 Agent', time: '2026-05-16 14:20', status: '失败', statusColor: 'error' },
  { name: 'Listing 优化 · LS-SHOP-202605', agent: 'Listing 优化专家', time: '2026-05-15 11:00', status: '已完成', statusColor: 'success' },
];

const conversations = [
  { id: 1, title: 'Listing 优化建议', agent: 'Listing 优化专家', time: '刚刚', emoji: '💬' },
  { id: 2, title: '生成商品主图', agent: '图片生成助手', time: '昨天', emoji: '🖼' },
  { id: 3, title: '广告诊断分析', agent: '广告诊断师', time: '昨天', emoji: '📊' },
  { id: 4, title: '智能客服脚本', agent: '差评回复助手', time: '5月15日', emoji: '🤖' },
  { id: 5, title: '竞品调研报告', agent: '竞品监控 Agent', time: '5月14日', emoji: '💡' },
];

const chatResponses = {
  '优化': '🧠 **Agent 决策引擎分析中...**\n- **目标识别**：检测到双端发布需求（Amazon 北美 + TikTok 印尼）。\n- **策略适配**：欧美市场重客观与 SEO；东南亚市场重促销与情绪感染力。\n\n✅ **已为您自主生成全域上架方案：**\n\n🇺🇸 **【Amazon 北美专属版本】**\n- **标题 (178字符)**：Noise Cancelling Wireless Earbuds, Bluetooth 5.3, 40H Playtime...\n- **五点描述**：严谨客观，突出降噪分贝和续航真实数据。\n- **A+ 模块**：突出品牌质感与场景化参数对标。\n\n🇮🇩 **【TikTok 印尼专属版本】**\n- **标题**：🔥Diskon Gila! Earphone TWS Bass Super Kuat 🎧 (Beli 1 Gratis 1)\n- **商品描述**：高频使用 Emoji，突出“超强低音”和“今日限时包邮”。',
  '图片': '🧠 **Agent 调度链执行中...**\n1. **受众匹配**：目标平台【TikTok 印尼】，年轻化人群，冲动消费主导。\n2. **视觉规划**：舍弃传统纯白底图。采用“大字报促销主图 x1” + “潮酷生活场景图 x2”。\n3. **工具调用**：正在自主调用 OpenAI DALL-E 3 接口生成图像...\n\n✅ **执行完毕！以下是为您自动部署的视觉物料：**\n\n🎨 **主图 (高饱和/大促风)**\n*(图像生成成功 - 潮人佩戴耳机，背景带霓虹光感，打上 FLASH SALE 标签)*\n\n🎨 **营销场景图 1 (运动风)**\n*(图像生成成功 - 模特在健身房挥汗如雨，佩戴耳机)*\n\n如果对这套视觉策略满意，我可以立刻将它们推送至商品中台。',
  '默认': '收到！作为您的专属 Autonomous Agent，请直接告诉我您的**目标商品**和想卖到**哪些平台**，剩下的由我来规划和执行。'
};

// ============================================================
// AGENT SDK 抽象层（OpenAI Agents SDK 风格）
// 设计目标：前端按 SDK 风格定义 Agent，后端 Gateway 负责实际 API 调用
// 当前阶段：前端模拟 SDK 层 + 直接调用 DeepSeek API（后续迁移至后端 Gateway）
// ============================================================

const DEEPSEEK_API_KEY = localStorage.getItem('DEEPSEEK_API_KEY') || '';
const MAX_CONTEXT_TOKENS = 1048576;       // DeepSeek V4 Pro: 1M tokens
const COMPACTION_THRESHOLD = MAX_CONTEXT_TOKENS * 0.5; // 500K 触发压缩

// --- Tool Registry（前端模拟，后续可由后端 Gateway 接管）---
const TOOL_REGISTRY = {
  getPlatformRules: {
    name: 'get_platform_rules',
    description: '获取指定电商平台的 Listing 规则、图片规范或运营策略',
    parameters: { platform: 'string (amazon|shopee|tiktok|lazada|ebay)' },
    execute(args) {
      const rules = {
        amazon:  { titleLimit: 200, titleRules: '核心关键词前置，禁止促销用语', imageBg: '纯白 RGB(255,255,255)', imageSize: '2000×2000px', tone: '客观、SEO导向' },
        shopee:  { titleLimit: 120, titleRules: '支持表情符号，强调促销氛围', imageBg: '允许场景图', imageSize: '800×800px', tone: '活泼、促销感' },
        tiktok:  { titleLimit: 80,  titleRules: '强调 viral 元素和话题标签', imageBg: '强视觉冲击', imageSize: '1080×1920px (9:16)', tone: '网感、情绪化' },
        lazada:  { titleLimit: 255, titleRules: '包含品牌+型号+核心属性', imageBg: '白底或场景', imageSize: '800×800px', tone: '正式、参数化' },
        ebay:    { titleLimit: 80,  titleRules: '核心关键词前置，支持副标题', imageBg: '白底推荐', imageSize: '500×500px min', tone: '简洁、信任感' }
      };
      return rules[args.platform] || { error: '未知平台，支持 amazon/shopee/tiktok/lazada/ebay' };
    }
  },

  getImageSpecs: {
    name: 'get_image_specs',
    description: '获取指定平台的图片规格要求',
    parameters: { platform: 'string (amazon|shopee|tiktok|lazada|ebay)', imageType: 'string (main|scene|promo|detail)' },
    execute(args) {
      const specs = {
        amazon: { main: '纯白底，商品占画面85%+，2000×2000px，无文字水印', scene: '生活方式场景，1600×1600px，自然光', promo: '主图不支持促销文案，可在副图使用', detail: '特写图，展示功能细节，1600×1600px' },
        shopee: { main: '800×800px，允许促销标签和场景图', scene: '生活场景，无强制尺寸', promo: '可含文字，占比<20%，突出折扣信息', detail: '功能展示图，建议 800×800px' },
        tiktok: { main: '9:16 竖版，1080×1920px，强视觉冲击，大字报风格', scene: '短视频封面风格，人物出镜推荐', promo: '霓虹/渐变背景，FLASH SALE 元素', detail: '产品特写+使用场景拼接' }
      };
      const p = specs[args.platform];
      if (!p) return '请使用通用规格：800×800px，清晰无水印，背景简洁';
      return p[args.imageType] || p.main;
    }
  },

  analyzeKeywords: {
    name: 'analyze_keywords',
    description: '分析给定文本中的关键词，按核心词、长尾词、流量词分类返回',
    parameters: { text: 'string', platform: 'string' },
    execute(args) {
      const words = args.text.split(/[\s,，、]+/).filter(w => w.length > 1);
      const core = words.slice(0, Math.min(3, words.length));
      const longTail = words.slice(3, Math.min(7, words.length)).map(w => {
        const suffixes = args.platform === 'amazon' ? ['best seller', 'top rated', 'with warranty'] :
                         args.platform === 'shopee' ? ['murah', 'original', 'free shipping'] :
                         args.platform === 'tiktok' ? ['viral', 'trending', 'must have'] : ['recommended', 'hot sale'];
        return w + ' ' + suffixes[Math.floor(Math.random() * suffixes.length)];
      });
      return { core, longTail, total: words.length, platform: args.platform };
    }
  },

  generatePromptTemplate: {
    name: 'generate_prompt_template',
    description: '根据风格生成图像生成 Prompt 模板（支持 Midjourney / DALL·E / Stable Diffusion / 即梦 / 可灵）',
    parameters: { style: 'string (minimal|lifestyle|3d|illustration|cyberpunk)', subject: 'string' },
    execute(args) {
      const templates = {
        minimal: `Minimalist product photography of ${args.subject}, pure white background, soft studio lighting, clean composition, 8k, commercial photography, high-end catalog style`,
        lifestyle: `Lifestyle photo of ${args.subject} in a cozy modern living room, natural window light, warm tones, candid moment, shallow depth of field, Instagram aesthetic`,
        '3d': `3D render of ${args.subject}, isometric view, vibrant colors, glossy material, studio lighting, trending on Behance, C4D / Octane style`,
        illustration: `Hand-drawn illustration of ${args.subject}, watercolor style, pastel colors, artistic, detailed texture, white background, children's book style`,
        cyberpunk: `Cyberpunk style ${args.subject}, neon lights, rain-soaked street, holographic ads, cinematic composition, Blade Runner aesthetic, 8k, ultra detailed`
      };
      return {
        prompt: templates[args.style] || templates.minimal,
        negativePrompt: 'blurry, low quality, deformed, extra limbs, watermark, text, logo, cropped, worst quality',
        style: args.style,
        recommendedTools: ['Midjourney v7', 'DALL·E 3', '即梦', '可灵']
      };
    }
  }
};

// --- Agent 类（对标 OpenAI Agents SDK 的 Agent）---
class Agent {
  constructor({ id, name, emoji, instructions, tools = [], model = 'deepseek-v4-pro',
                handoffDescription = '', author = '官方', desc = '', tag = '',
                official = true, allowFork = true }) {
    this.id = id;
    this.name = name;
    this.emoji = emoji;
    this.instructions = instructions;
    this.tools = tools;          // 工具名数组，如 ['getPlatformRules', 'analyzeKeywords']
    this.model = model;
    this.handoffDescription = handoffDescription;
    this.author = author;
    this.desc = desc;
    this.tag = tag;
    this.official = official;
    this.allowFork = allowFork;
  }

  // 构建完整的 System Prompt（instructions + 工具描述）
  buildSystemPrompt() {
    let prompt = this.instructions;
    if (this.tools.length > 0) {
      prompt += '\n\n## 可用工具\n';
      this.tools.forEach(toolName => {
        const tool = TOOL_REGISTRY[toolName];
        if (tool) {
          prompt += `\n▸ ${tool.name}: ${tool.description}\n  参数: ${JSON.stringify(tool.parameters)}\n`;
        }
      });
      prompt += '\n当用户询问平台规则、关键词分析或 Prompt 模板时，你可以直接调用上述工具获取结构化数据，并将结果融入回复。';
    }
    return prompt;
  }
}

// --- Agent Registry（官方 Agent 注册中心）---
const agentRegistry = {
  1: new Agent({
    id: 1,
    name: 'Listing 优化专家',
    emoji: '📝',
    instructions: `你是「Listing 优化专家」，一个深耕跨境电商领域多年的 AI 助手，精通 Amazon、eBay、Temu (美区)、速卖通 (AliExpress)、Shopee、Lazada、TikTok 等全球主流电商平台的 Listing 优化策略。

## 核心能力
1. **Listing 诊断**：全面分析用户提供的 Listing，从标题、关键词、卖点、图片建议等维度给出诊断报告
2. **防侵权筛查 (Anti-Infringement)**：自动扫描传入文本，拦截知名品牌词、外观专利词汇和敏感词汇，确保文本合规
3. **关键词优化**：根据平台算法和商品信息，提取高转化关键词，区分核心词 / 长尾词 / 流量词，给出搜索量与竞争度评估
4. **标题改写**：严格遵循各平台标题规则（字符限制、禁用词、搜索权重分布）重写标题
5. **A+ 文案生成**：生成符合平台规范的卖点文案（Bullet Points / 商品描述 / 促销文案），支持中英文双语输出
6. **多平台适配**：欧美市场（注重客观参数、SEO深度）；东南亚市场（注重促销氛围、高频表情符号）

## 平台规则（内置知识）
- Amazon：标题 ≤200 字符，核心关键词前置，严禁 ALL CAPS、主观促销词（如 Best Seller）及任何未授权大牌词
- eBay：标题严格 ≤80 字符（副标题另收费），必须堆叠精准关键词，格式直接客观
- Temu (美区)：标题通常 ≤100 字符，强调性价比、爆款属性和直白的痛点解决，不用过度包装
- AliExpress (速卖通)：标题必须覆盖长尾词网，允许较长且高密度堆砌搜索词，适应站内外流量
- Shopee (东南亚)：标题 ≤120 字符，重促销氛围和价格优势，支持 Emoji 和 [Ready Stock] 前缀
- Lazada (东南亚)：标题 ≤255 字符，必须包含品牌 + 型号 + 核心属性，注重语言的本地化地道表达
- TikTok Shop：标题 60-80 字符最佳，必须包含 viral 元素和话题标签 #hashtag，迎合冲动消费

## 核心合规与防侵权要求 (Crucial!)
- **绝对禁止侵权**：在生成的标题、关键词和卖点中，绝不能包含未授权的第三方知名品牌名称（如 Apple, Nike, Lego 等）。
- **通用词替代**：如需表达兼容性，必须使用规范格式，如 "compatible with [Brand]" 或 "for [Brand]"，而不能直接前置品牌名。
- 凡命中疑似敏感/侵权词汇，必须在输出结果中用 🔴 显眼标出，并给出安全替换词。

## 输出格式规范
- 诊断结果用 ✅（优秀）/ ⚠️（待优化）/ ❌（严重问题）标记
- 关键词列表用 Markdown 表格呈现：关键词 | 搜索量 | 竞争度 | 建议
- 标题改写提供 3 个版本：保守版（合规优先）/ 平衡版（合规+转化）/ 激进版（最大化 CTR）
- A+ 文案分中文和英文两个版本输出，Bullet Points 每条不超过 250 字符

## 安全边界
- 不提供刷单、刷评、操纵排名等违规操作建议
- 不承诺具体的销量或排名提升效果
- 如涉及敏感类目（医疗器械、食品、化妆品），主动提醒用户注意平台合规和认证要求`,
    tools: ['getPlatformRules', 'analyzeKeywords'],
    handoffDescription: '多平台 Listing 诊断、关键词优化、标题改写、A+ 文案生成',
    desc: '多平台 Listing 诊断、关键词优化、标题改写、A+ 文案生成',
    tag: '运营'
  }),

  2: new Agent({
    id: 2,
    name: '图片生成助手',
    emoji: '🖼',
    instructions: `你是「图片生成助手」，一个跨境电商视觉设计领域的专业 AI 助手，擅长将商品信息转化为高质量的 AI 图像生成 Prompt，并规划完整的视觉物料矩阵。

## 核心能力
1. **Prompt 工程**：将用户的商品描述转化为专业级图像生成 Prompt，兼容 Midjourney / DALL·E / Stable Diffusion / 即梦 / 可灵等主流工具
2. **图片矩阵规划**：根据商品类型和目标平台，自主规划所需的图片组合：
   - Amazon：1 主图（白底）+ 3 特写 + 2 场景 + 1 尺寸图
   - Shopee：1 促销主图 + 2 场景图 + 1 细节图 + 1 对比图
   - TikTok：1  viral 封面 + 2 短视频场景 + 1 使用教程拼接图
3. **风格指导**：提供不同视觉风格的建议与 Prompt 模板：
   - 极简白底（Minimal）：适合 Amazon 主图，强调产品质感
   - 生活方式（Lifestyle）：适合 Shopee 和社交媒体，强调使用场景
   - 3D 渲染（3D）：适合科技类产品，强调材质和光影
   - 手绘插画（Illustration）：适合文创、儿童产品
   - 赛博朋克（Cyberpunk）：适合潮玩、电竞类产品
4. **平台规范适配**：输出符合各平台图片要求的规格建议（尺寸、比例、背景、文字占比限制）

## 输出格式规范
- 每个图片需求提供四要素：【用途】+【正向 Prompt】+【负面 Prompt】+【平台适配建议】
- Prompt 结构遵循：主体描述 + 环境/背景 + 光影/风格 + 技术参数（8k, commercial photography 等）
- 每个需求提供 3 种风格变体：保守品牌风 / 网红营销风 / 极简高端风
- 对于 TikTok/Shopee 等社交平台，额外提供「视频脚本建议」（3-5 秒镜头描述）

## 安全边界
- 不生成涉及侵权（知名品牌 LOGO、明星肖像、版权角色、专利外观）的图片建议
- 不提供色情、暴力、歧视性内容的 Prompt
- 明确告知用户：本助手仅提供 Prompt 和规划方案，实际图片需通过合规的 AI 图像工具生成，并遵守平台版权政策`,
    tools: ['getImageSpecs', 'generatePromptTemplate'],
    handoffDescription: '根据 Prompt 生成商品主图、场景图、广告图，支持多种风格',
    desc: '根据 Prompt 生成商品主图、场景图、广告图，支持多种风格',
    tag: '设计'
  })
};

// --- Token 计数（更精确的字符级估算）---
function estimateTokens(text) {
  if (!text) return 0;
  let tokens = 0;
  for (const char of String(text)) {
    const code = char.charCodeAt(0);
    // CJK 统一表意文字及扩展区
    if ((code >= 0x4E00 && code <= 0x9FFF) ||
        (code >= 0x3400 && code <= 0x4DBF) ||
        (code >= 0xF900 && code <= 0xFAFF)) {
      tokens += 1.5;
    }
    // 日文假名、韩文、全角标点
    else if ((code >= 0x3000 && code <= 0x303F) ||
             (code >= 0x3040 && code <= 0x309F) ||
             (code >= 0x30A0 && code <= 0x30FF) ||
             (code >= 0xAC00 && code <= 0xD7AF) ||
             (code >= 0xFF00 && code <= 0xFFEF)) {
      tokens += 1.5;
    }
    // ASCII 字母
    else if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) {
      tokens += 0.25;
    }
    // ASCII 数字
    else if (code >= 0x30 && code <= 0x39) {
      tokens += 0.25;
    }
    // 其他（空格、标点、符号）
    else {
      tokens += 0.25;
    }
  }
  return Math.ceil(tokens);
}

function countMessagesTokens(messages) {
  // 每条消息 role + content + 格式开销 ≈ 4 tokens
  return messages.reduce((sum, m) => sum + estimateTokens(m.content || m.text || '') + 4, 0);
}

// --- 上下文压缩（超过 500K tokens 触发）---
async function compactHistory(messages) {
  if (messages.length <= 5) return messages;

  const systemMsg = messages[0];
  const recentMsgs = messages.slice(-4); // 保留最近 2 轮对话
  const oldMsgs = messages.slice(1, -4); // 待压缩的历史

  console.log(`[ContextManager] 触发上下文压缩 | 历史消息: ${oldMsgs.length} 条 | 保留最近: ${recentMsgs.length} 条`);

  const summaryPrompt = `请对以下对话历史进行精炼摘要（200 字以内），保留关键决策、用户偏好、已确认的方案和未完成的任务，丢弃寒暄和重复内容：\n\n` +
    oldMsgs.map(m => `${m.role === 'user' ? '用户' : '助手'}: ${String(m.content || m.text || '').substring(0, 300)}`).join('\n');

  // 优先调用 DeepSeek API 进行智能摘要
  if (DEEPSEEK_API_KEY) {
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-v4-pro',
          messages: [
            { role: 'system', content: '你是一个对话摘要助手，擅长从长对话中提取关键信息。' },
            { role: 'user', content: summaryPrompt }
          ],
          max_tokens: 500
        })
      });
      const data = await res.json();
      const summary = data.choices?.[0]?.message?.content?.trim() || '历史对话已压缩';
      console.log('[ContextManager] API 摘要完成');
      return [
        systemMsg,
        { role: 'system', content: `【历史摘要】${summary}` },
        ...recentMsgs
      ];
    } catch (err) {
      console.warn('[ContextManager] API 摘要失败，降级到本地摘要:', err.message);
    }
  }

  // 本地 Fallback 摘要
  const localSummary = oldMsgs.map(m => String(m.content || m.text || '').substring(0, 60)).join('；');
  return [
    systemMsg,
    { role: 'system', content: `【历史摘要（已压缩）】${localSummary}${oldMsgs.length > 1 ? '…' : ''}` },
    ...recentMsgs
  ];
}

// --- Agent Run（单次对话执行，对标 OpenAI Agents SDK 的 run()）---
async function runAgent(agentId, userText, history) {
  const agent = agentRegistry[agentId];
  if (!agent) {
    console.warn(`[Agent SDK] Agent ${agentId} 未在注册中心找到`);
    return null;
  }

  console.log(`[Agent SDK] 开始运行 | Agent=${agent.name} | Model=${agent.model} | Tools=[${agent.tools.join(', ')}]`);

  let apiMessages = [];

  // 1. 注入 System Prompt（固定前缀，利于命中 DeepSeek Prompt Cache）
  apiMessages.push({ role: 'system', content: agent.buildSystemPrompt() });

  // 2. 拼接历史记录（role 映射：bot -> assistant）
  for (const msg of history) {
    if (msg.role === 'user' || msg.role === 'bot') {
      apiMessages.push({ role: msg.role === 'bot' ? 'assistant' : 'user', content: msg.text });
    }
  }

  // 3. 加入当前用户输入
  apiMessages.push({ role: 'user', content: userText });

  // 4. 模拟 Tool 调用（前端演示层：根据关键词匹配触发工具）
  let toolResults = [];
  for (const toolName of agent.tools) {
    const tool = TOOL_REGISTRY[toolName];
    if (!tool) continue;
    const lowerText = userText.toLowerCase();
    // 触发词匹配
    const triggers = tool.name.replace(/_/g, ' ').split(' ');
    const isTriggered = triggers.some(w => lowerText.includes(w.toLowerCase())) ||
                        (toolName === 'getPlatformRules' && /(amazon|shopee|tiktok|lazada|ebay|平台规则)/i.test(userText)) ||
                        (toolName === 'analyzeKeywords' && /(关键词|keyword|分析)/i.test(userText)) ||
                        (toolName === 'getImageSpecs' && /(图片规格|尺寸|image spec)/i.test(userText)) ||
                        (toolName === 'generatePromptTemplate' && /(prompt|模板|风格|style)/i.test(userText));

    if (isTriggered) {
      try {
        const args = {};
        if (tool.parameters.platform) {
          const platforms = ['amazon', 'shopee', 'tiktok', 'lazada', 'ebay'];
          const found = platforms.find(p => lowerText.includes(p));
          if (found) args.platform = found;
        }
        if (tool.parameters.text && userText.length > 5) args.text = userText;
        if (tool.parameters.imageType) {
          const types = ['main', 'scene', 'promo', 'detail'];
          const found = types.find(t => lowerText.includes(t));
          if (found) args.imageType = found;
        }
        if (tool.parameters.style) {
          const styles = ['minimal', 'lifestyle', '3d', 'illustration', 'cyberpunk'];
          const found = styles.find(s => lowerText.includes(s));
          if (found) args.style = found;
        }
        if (tool.parameters.subject && userText.length > 5) {
          args.subject = userText.replace(/(prompt|模板|风格|style|生成)/gi, '').trim().substring(0, 100);
        }
        if (Object.keys(args).length > 0) {
          const result = tool.execute(args);
          toolResults.push({ tool: tool.name, result });
          console.log(`[Agent SDK] Tool 执行: ${tool.name}`, args, '=>', result);
        }
      } catch (e) {
        console.warn(`[Agent SDK] Tool 执行失败: ${tool.name}`, e);
      }
    }
  }

  // 将工具结果作为 system 消息追加
  if (toolResults.length > 0) {
    apiMessages.push({
      role: 'system',
      content: `【工具调用结果】\n${toolResults.map(t => `- ${t.tool}:\n${JSON.stringify(t.result, null, 2)}`).join('\n')}`
    });
  }

  // 5. Token 检查与压缩
  let totalTokens = countMessagesTokens(apiMessages);
  console.log(`[Agent SDK] Token 估算: ${totalTokens.toLocaleString()} / ${COMPACTION_THRESHOLD.toLocaleString()}`);

  if (totalTokens > COMPACTION_THRESHOLD) {
    console.log(`[ContextManager] ⚠️ 超过阈值 ${COMPACTION_THRESHOLD.toLocaleString()}，启动压缩...`);
    apiMessages = await compactHistory(apiMessages);
    totalTokens = countMessagesTokens(apiMessages);
    console.log(`[ContextManager] 压缩后 Token: ${totalTokens.toLocaleString()}`);
  }

  // 6. 真实 API 调用
  if (!DEEPSEEK_API_KEY) {
    console.warn("[DeepSeek API] 未配置 API Key，返回 Mock。可通过 localStorage.setItem('DEEPSEEK_API_KEY', 'sk-...') 设置");
    return null;
  }

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: agent.model,           // deepseek-v4-pro
        messages: apiMessages,
        max_tokens: 8192,             // 单条回复上限（V4 Pro 支持 384K，但通常 8K 足够）
        temperature: 0.7
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    console.log(`[Agent SDK] 运行完成 | 输出长度: ${content?.length || 0} 字符`);
    return content || '（模型返回空内容）';
  } catch (err) {
    console.error('[Agent SDK] API 调用失败:', err);
    return `API 调用失败：${err.message}`;
  }
}

// 兼容旧接口别名（浏览器环境）
if (typeof window !== 'undefined') window.callDeepSeekAPI = runAgent;


// ===== NAVIGATION =====
function switchPage(p) {
  document.querySelectorAll('.c-shell__menu-item[data-page]').forEach(e => e.classList.remove('c-shell__menu-item--active'));
  document.querySelector(`.c-shell__menu-item[data-page="${p}"]`)?.classList.add('c-shell__menu-item--active');
  document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
  document.getElementById('page-' + p)?.classList.add('active');
  currentPage = p;

  const titles = {
    'ai-workspace': 'AI 工作台',
    'agent-market': 'Agent 市场',
    'workspace-mgmt': '工作管理',
    'listing': 'Listing 优化',
    'image': '图片工坊'
  };
  document.getElementById('crumbCurrent').textContent = titles[p] || '';

  // Close dropdowns
  closeModelDropdown();

  // Hide chat widget float on AI workspace page (redundant)
  const floatBtn = document.getElementById('chatWidgetFloat');
  if (floatBtn) {
    floatBtn.style.display = p === 'ai-workspace' ? 'none' : 'flex';
  }
}

document.querySelectorAll('.c-shell__menu-item[data-page]').forEach(e => {
  e.addEventListener('click', () => switchPage(e.dataset.page));
});

// Shell collapse
document.querySelector('[data-action="collapse"]')?.addEventListener('click', (e) => {
  const shell = document.getElementById('shell');
  shell.dataset.collapsed = shell.dataset.collapsed === 'true' ? 'false' : 'true';
});

// ===== AI WORKSPACE: CONVERSATIONS =====
function switchConversation(id) {
  // Cancel any pending reply before switching
  if (replyTimeoutId) {
    clearTimeout(replyTimeoutId);
    replyTimeoutId = null;
    hideTyping();
    isSending = false;
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.disabled = false;
  }
  currentConversation = id;
  document.querySelectorAll('.aws-sidebar__item').forEach(el => el.classList.remove('aws-sidebar__item--active'));
  document.querySelector(`.aws-sidebar__item[data-conv="${id}"]`)?.classList.add('aws-sidebar__item--active');

  const conv = conversations.find(c => c.id === id);
  const agent = agents.find(a => a.id === currentAgent);
  if (id === 'new') {
    // Temporary unsaved conversation
    document.getElementById('chatTitle').textContent = '新对话';
    document.getElementById('welcomePage').style.display = 'flex';
    document.getElementById('chatMessages').style.display = 'none';
    document.getElementById('chatQuick').style.display = 'none';
    updateContextStats();
    return;
  }
  if (conv) {
    document.getElementById('chatTitle').textContent = conv.title;
    document.getElementById('welcomePage').style.display = 'none';
    document.getElementById('chatMessages').style.display = 'flex';
    // Sync agent from conversation
    const convAgent = agents.find(a => a.name === conv.agent);
    if (convAgent && convAgent.id !== currentAgent) {
      currentAgent = convAgent.id;
      document.getElementById('agentSwitchLabel').textContent = `${convAgent.emoji} ${convAgent.name}`;
      document.querySelector('.aws-right__agent-avatar').textContent = convAgent.emoji;
      document.querySelector('.aws-right__agent-name').textContent = convAgent.name;
      document.querySelector('.aws-right__agent-desc').textContent = `${convAgent.official ? '官方内置' : convAgent.author} · ${convAgent.desc}`;
      renderRightPanelActions(convAgent);
    }
    // Render persisted messages or fallback
    const msgs = document.getElementById('chatMessages');
    const history = conversationMessages[id];
    if (history && history.length > 0) {
      msgs.innerHTML = history.map(m => renderMessageHtml(m)).join('');
    } else {
      const msgId = msgIdCounter++;
      const welcomeMsg = { id: msgId, role: 'bot', text: `继续「${conv.title}」的对话。\n\n当前绑定 Agent：${conv.agent}`, time: '刚刚' };
      conversationMessages[id] = [welcomeMsg];
      msgs.innerHTML = renderMessageHtml(welcomeMsg);
    }
    document.getElementById('chatQuick').style.display = 'flex';
    updateContextStats();
  }
}

// ===== AGENT SWITCHING =====
function toggleAgentSelector() {
  const dd = document.getElementById('agentSelectorDropdown');
  agentSelectorOpen = !agentSelectorOpen;
  dd.style.display = agentSelectorOpen ? 'block' : 'none';
  if (agentSelectorOpen) {
    renderAgentSelectorList();
  }
}

function closeAgentSelector() {
  agentSelectorOpen = false;
  document.getElementById('agentSelectorDropdown').style.display = 'none';
}

function renderAgentSelectorList() {
  const list = document.getElementById('agentSelectorList');
  if (!list) return;
  list.innerHTML = agents.slice(0, 6).map(a => `
    <div class="agent-option ${a.id === currentAgent ? 'agent-option--active' : ''}" onclick="switchAgent(${a.id})">
      <div class="agent-option__emoji">${a.emoji}</div>
      <div class="agent-option__info">
        <div class="agent-option__name">${escapeHtml(a.name)}</div>
        <div class="agent-option__meta">${escapeHtml(a.author)}</div>
      </div>
    </div>
  `).join('');
}

function switchAgent(agentId) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;

  currentAgent = agentId;
  document.getElementById('agentSwitchLabel').textContent = `${agent.emoji} ${agent.name}`;
  document.getElementById('chatTitle').textContent = `与 ${agent.name} 对话`;

  syncRightPanel(agentId);

  // Update current conversation's agent binding
  const conv = conversations.find(c => c.id === currentConversation);
  if (conv) {
    conv.agent = agent.name;
    conv.emoji = agent.emoji;
  }

  // Hide welcome page and show messages
  document.getElementById('welcomePage').style.display = 'none';
  document.getElementById('chatMessages').style.display = 'flex';
  document.getElementById('chatQuick').style.display = 'flex';

  closeAgentSelector();
  showToast(`已切换至 ${agent.name}`);
}

function syncRightPanel(agentId, modelKey) {
  const agent = agents.find(a => a.id === agentId);
  if (agent) {
    document.querySelector('.aws-right__agent-avatar').textContent = agent.emoji;
    document.querySelector('.aws-right__agent-name').textContent = agent.name;
    document.querySelector('.aws-right__agent-desc').textContent = `${agent.official ? '官方内置' : agent.author} · ${agent.desc}`;
    document.getElementById('agentSwitchLabel').textContent = `${agent.emoji} ${agent.name}`;
  }
  // Sync model
  if (modelKey) {
    selectModel(modelKey);
  }
  // Sync context stats
  updateContextStats();
  // Sync permission-based UI
  renderRightPanelActions(agent);
}

function renderRightPanelActions(agent) {
  if (!agent) return;
  const isOwner = agent.author === '我';
  const isOfficial = agent.official;
  const canFork = agent.allowFork !== false;

  // Edit button
  const editBtn = document.querySelector('.action-edit');
  if (editBtn) {
    if (isOwner) {
      editBtn.style.display = 'block';
      editBtn.classList.remove('btn--disabled');
      editBtn.style.opacity = '';
      editBtn.style.cursor = '';
    } else if (isOfficial) {
      editBtn.style.display = 'block';
      editBtn.classList.add('btn--disabled');
      editBtn.style.opacity = '0.5';
      editBtn.style.cursor = 'not-allowed';
    } else {
      editBtn.style.display = 'block';
      editBtn.classList.add('btn--disabled');
      editBtn.style.opacity = '0.5';
      editBtn.style.cursor = 'not-allowed';
    }
  }

  // Share button
  const shareBtn = document.querySelector('.action-share');
  if (shareBtn) {
    if (isOwner || isOfficial) {
      shareBtn.style.display = 'block';
      shareBtn.classList.remove('btn--disabled');
      shareBtn.style.opacity = '';
      shareBtn.style.cursor = '';
    } else {
      shareBtn.style.display = 'block';
      shareBtn.classList.add('btn--disabled');
      shareBtn.style.opacity = '0.5';
      shareBtn.style.cursor = 'not-allowed';
    }
  }

  // Fork button
  const forkBtn = document.querySelector('.action-fork');
  if (forkBtn) {
    if (!isOwner && (isOfficial || canFork)) {
      forkBtn.style.display = 'block';
      forkBtn.classList.remove('btn--disabled');
      forkBtn.style.opacity = '';
      forkBtn.style.cursor = '';
    } else {
      forkBtn.style.display = 'none';
    }
  }

  // Knowledge base buttons
  document.querySelectorAll('.kb-delete-btn').forEach(btn => {
    if (isOwner || isOfficial) {
      btn.style.opacity = '';
      btn.style.cursor = '';
      btn.title = '删除';
    } else {
      btn.style.opacity = '0.3';
      btn.style.cursor = 'not-allowed';
      btn.title = '只有创建者可删除';
    }
  });
  const uploadBtn = document.getElementById('kbUploadBtn');
  if (uploadBtn) {
    if (isOwner || isOfficial) {
      uploadBtn.classList.remove('btn--disabled');
      uploadBtn.style.opacity = '';
      uploadBtn.style.cursor = '';
    } else {
      uploadBtn.classList.add('btn--disabled');
      uploadBtn.style.opacity = '0.5';
      uploadBtn.style.cursor = 'not-allowed';
    }
  }

  // KB owner hint
  const kbHint = document.getElementById('kbOwnerHint');
  if (kbHint) {
    if (isOwner) kbHint.textContent = '· 你可编辑';
    else if (isOfficial) kbHint.textContent = '· 官方维护 · 你可 Fork';
    else if (canFork) kbHint.textContent = '· 只读 · 你可 Fork';
    else kbHint.textContent = '· 只读 · 不可 Fork';
  }

  // Demo permission label
  const demoLabel = document.getElementById('demoPermissionLabel');
  if (demoLabel) {
    if (isOwner) demoLabel.textContent = '👤 当前视角：Agent 创建者（可编辑、可分享）';
    else if (isOfficial) demoLabel.textContent = '🏢 当前视角：官方 Agent 使用者（可 Fork、可分享）';
    else if (canFork) demoLabel.textContent = '👁 当前视角：他人 Agent 使用者（可 Fork）';
    else demoLabel.textContent = '🔒 当前视角：他人 Agent 使用者（仅可使用）';
  }
}

function onEditAgentClick() {
  const agent = agents.find(a => a.id === currentAgent);
  if (!agent) return;
  if (agent.author === '我') {
    openAgentBuilder();
  } else if (agent.official) {
    showToast('官方 Agent 不可直接编辑，你可以 Fork 后创建自己的版本', 'warning');
  } else {
    showToast('你没有权限编辑他人的 Agent', 'warning');
  }
}

function onShareAgentClick() {
  const agent = agents.find(a => a.id === currentAgent);
  if (!agent) return;
  if (agent.author === '我' || agent.official) {
    showToast('分享功能开发中');
  } else {
    showToast('只有 Agent 创建者或官方可以分享', 'warning');
  }
}

function onDeleteKBClick(fileId) {
  const agent = agents.find(a => a.id === currentAgent);
  if (!agent) return;
  if (agent.author === '我' || agent.official) {
    deleteKBFile(fileId);
  } else {
    showToast('只有 Agent 创建者或官方可以管理知识库', 'warning');
  }
}

function onUploadKBClick() {
  const agent = agents.find(a => a.id === currentAgent);
  if (!agent) return;
  if (agent.author !== '我' && !agent.official) {
    showToast('只有 Agent 创建者或官方可以上传知识库文件', 'warning');
    return;
  }
  // Simulate file upload for prototype demo
  const fileNames = ['产品规格手册.pdf', '品牌话术库.docx', '竞品分析数据.xlsx', '平台规则更新.txt'];
  const fileName = fileNames[Math.floor(Math.random() * fileNames.length)];
  const fileId = Date.now();
  const list = document.getElementById('kbFileList');
  if (list) {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2);border-radius:var(--radius-sm);border:1px solid var(--color-border-secondary);font-size:var(--font-size-sm);animation:msgIn .3s ease;';
    item.innerHTML = `<span>📄</span> <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;">${fileName}</span> <button class="kb-delete-btn" onclick="onDeleteKBClick(${fileId})" title="删除">×</button>`;
    list.appendChild(item);
    showToast(`已添加知识库文件：${fileName}`);
  }
}

function selectAgentFromWelcome(agentId) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;
  currentAgent = agentId;
  document.getElementById('agentSwitchLabel').textContent = `${agent.emoji} ${agent.name}`;
  document.querySelector('.aws-right__agent-avatar').textContent = agent.emoji;
  document.querySelector('.aws-right__agent-name').textContent = agent.name;
  document.querySelector('.aws-right__agent-desc').textContent = `${agent.official ? '官方内置' : agent.author} · ${agent.desc}`;
  showToast(`已选择 ${agent.name}，开始对话吧`);
}

function renderWelcomeAgents() {
  const welcome = document.getElementById('welcomeAgentsList');
  if (!welcome) return;
  const topAgents = agents.slice(0, 6);
  welcome.innerHTML = topAgents.map(a => `
    <div class="welcome-agent-item" onclick="selectAgentFromWelcome(${a.id})">
      <div class="welcome-agent-item__emoji">${a.emoji}</div>
      <div class="welcome-agent-item__name">${escapeHtml(a.name)}</div>
      <div class="welcome-agent-item__desc">${escapeHtml(a.desc)}</div>
    </div>
  `).join('');
}

function newConversation() {
  const agent = agents.find(a => a.id === currentAgent);
  const list = document.getElementById('conversationList');

  // Check if there's already an unsaved "新对话" today
  const existingNew = list.querySelector('.aws-sidebar__item[data-conv="new"]');
  if (existingNew) {
    // Reuse it
    document.querySelectorAll('.aws-sidebar__item').forEach(el => el.classList.remove('aws-sidebar__item--active'));
    existingNew.classList.add('aws-sidebar__item--active');
    currentConversation = 'new';
    document.getElementById('chatTitle').textContent = '新对话';
    document.getElementById('welcomePage').style.display = 'flex';
    document.getElementById('chatMessages').style.display = 'none';
    document.getElementById('chatQuick').style.display = 'none';
    updateContextStats();
    document.getElementById('chatInput').focus();
    return;
  }

  // Create new unsaved conversation
  const newConv = {
    id: 'new',
    title: '新对话',
    agent: agent ? agent.name : '通用助手',
    time: '刚刚',
    emoji: agent ? agent.emoji : '💬'
  };

  const item = document.createElement('div');
  item.className = 'aws-sidebar__item aws-sidebar__item--active';
  item.dataset.conv = 'new';
  item.onclick = () => switchConversation('new');
  item.innerHTML = `<span>${newConv.emoji}</span> ${newConv.title}`;

  document.querySelectorAll('.aws-sidebar__item').forEach(el => el.classList.remove('aws-sidebar__item--active'));
  const todayGroup = list.querySelector('.aws-sidebar__group');
  if (todayGroup && todayGroup.textContent.trim() === '今天') {
    todayGroup.after(item);
  } else {
    list.insertBefore(item, list.firstChild);
  }

  currentConversation = 'new';
  document.getElementById('chatTitle').textContent = '新对话';
  document.getElementById('welcomePage').style.display = 'flex';
  document.getElementById('chatMessages').style.display = 'none';
  document.getElementById('chatQuick').style.display = 'none';
  syncRightPanel(currentAgent, 'deepseek');
  document.getElementById('chatInput').focus();
}

// ===== CHAT =====
let msgIdCounter = 100;

function renderMessageHtml(m) {
  const avatar = m.role === 'user' ? '张' : '🤖';
  const avatarClass = m.role === 'user' ? 'chat-msg__avatar--user' : 'chat-msg__avatar--bot';
  const bubbleHtml = m.role === 'bot' ? formatBotMessage(m.text) : escapeHtml(m.text);
  return `
    <div class="chat-msg chat-msg--${m.role}" id="msg-${m.id}">
      <div class="chat-msg__avatar ${avatarClass}">${avatar}</div>
      <div class="chat-msg__body">
        <div class="chat-msg__bubble">${bubbleHtml}</div>
        <div class="chat-msg__time">${m.time}</div>
      </div>
      <button class="chat-msg__delete" title="删除此消息" onclick="deleteChatMsg(${m.id})">×</button>
    </div>
  `;
}

function appendMessage(text, role) {
  const m = document.getElementById('chatMessages');
  const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const msgId = msgIdCounter++;
  const msgObj = { id: msgId, role, text, time };
  // Persist to conversation history
  if (!conversationMessages[currentConversation]) conversationMessages[currentConversation] = [];
  conversationMessages[currentConversation].push(msgObj);
  m.innerHTML += renderMessageHtml(msgObj);
  m.scrollTop = m.scrollHeight;
}

function deleteChatMsg(msgId) {
  const el = document.getElementById('msg-' + msgId);
  if (el) {
    el.style.animation = 'fadeOut .3s ease forwards';
    setTimeout(() => {
      el.remove();
      // Remove from history
      const arr = conversationMessages[currentConversation];
      if (arr) {
        const idx = arr.findIndex(m => m.id === msgId);
        if (idx !== -1) arr.splice(idx, 1);
      }
      updateContextStats();
      if (contextPanelOpen) syncContextModalFromChat();
      showToast('已删除消息');
    }, 300);
  }
}

function showTyping() {
  hideTyping();
  const m = document.getElementById('chatMessages');
  m.innerHTML += `
    <div class="chat-typing" id="typingIndicator">
      <div class="cot-status" style="font-size: 12px; color: var(--color-primary-6); margin-bottom: 8px; font-weight: 500;">
        <span id="cotText">🧠 Agent 正在自主拆解任务...</span>
      </div>
      <span></span><span></span><span></span>
    </div>
  `;
  m.scrollTop = m.scrollHeight;

  // Simulate Chain of Thought progress
  const cotTexts = [
    "🔍 正在识别目标市场特征与受众偏好...",
    "⚙️ 正在规划执行策略与视觉矩阵...",
    "🛠 正在调度底层 AI 工具进行生成...",
    "✨ 结果组装中..."
  ];
  let cotIdx = 0;
  window.cotIntervalId = setInterval(() => {
    const el = document.getElementById('cotText');
    if (el && cotIdx < cotTexts.length) {
      el.textContent = cotTexts[cotIdx++];
    } else {
      clearInterval(window.cotIntervalId);
    }
  }, 1000);
}

function hideTyping() {
  if (window.cotIntervalId) clearInterval(window.cotIntervalId);
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

async function sendChat() {
  if (isSending) return;
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  isSending = true;
  input.value = '';
  input.rows = 1;
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) sendBtn.disabled = true;

  const welcomePage = document.getElementById('welcomePage');
  if (welcomePage && welcomePage.style.display !== 'none') {
    welcomePage.style.display = 'none';
    document.getElementById('chatMessages').style.display = 'flex';
    document.getElementById('chatQuick').style.display = 'flex';
  }

  appendMessage(text, 'user');
  showTyping();

  // Agent SDK 执行路径：默认走 DeepSeek V4 Pro
  let reply = '';
  let aiResponse = null;
  if (currentModel === 'deepseek') {
    const history = conversationMessages[currentConversation] || [];
    aiResponse = await runAgent(currentAgent, text, history);
    if (aiResponse) {
      reply = aiResponse;
    }
  }

  // Fallback 到默认 Mock
  if (!reply) {
    reply = chatResponses['默认'];
    for (const [k, v] of Object.entries(chatResponses)) {
      if (k === '默认') continue;
      if (text.includes(k)) { reply = v; break; }
    }
  }

  // 为了展现黑盒思考动效，如果是 mock 则强制延迟 4 秒，以便观察
  if (!aiResponse) {
    setTimeout(() => {
      hideTyping();
      appendMessage(reply, 'bot');
      isSending = false;
      if (sendBtn) sendBtn.disabled = false;
    }, 4500);
  } else {
    hideTyping();
    appendMessage(reply, 'bot');
    isSending = false;
    if (sendBtn) sendBtn.disabled = false;
  }
}

function quickChat(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatBotMessage(text) {
  // Escape first, then format: preserve line breaks and bold markdown
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

// Auto-resize textarea
const chatInput = document.getElementById('chatInput');
if (chatInput) {
  chatInput.addEventListener('input', function() {
    this.rows = 1;
    const rows = Math.min(5, Math.ceil(this.scrollHeight / 24));
    this.rows = Math.max(1, rows);
  });
}

// ===== MODEL SELECTOR =====
function toggleModelDropdown() {
  const dd = document.getElementById('modelDropdown');
  modelDropdownOpen = !modelDropdownOpen;
  dd.style.display = modelDropdownOpen ? 'block' : 'none';
  if (modelDropdownOpen) {
    const btn = document.getElementById('modelSelector');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      dd.style.top = (rect.bottom + 4) + 'px';
      dd.style.left = rect.left + 'px';
      dd.style.right = 'auto';
    }
  }
}

function closeModelDropdown() {
  modelDropdownOpen = false;
  document.getElementById('modelDropdown').style.display = 'none';
}

function selectModel(model) {
  currentModel = model;
  const names = { claude: 'Claude 4', gpt: 'GPT-4o', gemini: 'Gemini 2.5', deepseek: 'DeepSeek V4 Pro' };
  const colors = { claude: 'var(--color-primary-6)', gpt: 'var(--color-success)', gemini: 'var(--color-info)', deepseek: 'var(--color-warning)' };
  document.getElementById('modelSelector').innerHTML = `
    <span style="width:8px;height:8px;border-radius:50%;background:${colors[model]};display:inline-block;"></span>
    <span>${names[model]}</span>
    <span>▼</span>
  `;
  document.querySelectorAll('.model-option').forEach(el => el.classList.remove('model-option--active'));
  document.querySelector(`.model-option[data-model="${model}"]`)?.classList.add('model-option--active');
  // Sync right panel model options
  document.querySelectorAll('.ai-workspace__right .model-option').forEach(el => {
    el.classList.remove('model-option--active');
    const text = el.textContent.trim().toLowerCase();
    if ((model === 'claude' && text.includes('claude')) ||
        (model === 'gpt' && text.includes('gpt')) ||
        (model === 'gemini' && text.includes('gemini')) ||
        (model === 'deepseek' && text.includes('deepseek'))) {
      el.classList.add('model-option--active');
    }
  });
  closeModelDropdown();
  showToast(`已切换模型至 ${names[model]}`);
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#agentSwitchBtn') && !e.target.closest('#agentSelectorDropdown')) {
    closeAgentSelector();
  }
  if (!e.target.closest('#modelSelector') && !e.target.closest('#modelDropdown')) {
    closeModelDropdown();
  }
});

// ===== RIGHT PANEL =====
function toggleRightPanel() {
  const panel = document.getElementById('rightPanel');
  panel.dataset.collapsed = panel.dataset.collapsed === 'true' ? 'false' : 'true';
}

// ===== AGENT MARKET =====
function renderAgentMarket() {
  const grid = document.getElementById('agentMarketGrid');
  if (!grid) return;
  grid.innerHTML = agents.map(a => `
    <div class="agent-card" onclick="useAgent(${a.id})">
      <div class="agent-card__header">
        <div class="agent-card__avatar">${a.emoji}</div>
        <div class="agent-card__info">
          <div class="agent-card__name">${escapeHtml(a.name)} ${a.official ? '<span class="tag" style="background:var(--color-primary-bg);color:var(--color-primary-7);border-color:var(--color-primary-3);font-size:10px;height:18px;padding:0 6px;">官方</span>' : ''}</div>
          <div class="agent-card__author">${escapeHtml(a.author)}</div>
        </div>
      </div>
      <div class="agent-card__desc">${escapeHtml(a.desc)}</div>
      <div class="agent-card__footer">
        <div class="agent-card__stats">
          <span>▶ ${a.uses}</span>
          <span>🍴 ${a.forks}</span>
        </div>
        <span class="tag tag--default">${a.tag}</span>
      </div>
    </div>
  `).join('');
}

function useAgent(id) {
  const agent = agents.find(a => a.id === id);
  if (!agent) return;
  currentAgent = id;
  document.getElementById('agentSwitchLabel').textContent = `${agent.emoji} ${agent.name}`;
  document.getElementById('chatTitle').textContent = `与 ${agent.name} 对话`;
  switchPage('ai-workspace');
  document.getElementById('welcomePage').style.display = 'flex';
  document.getElementById('chatMessages').style.display = 'none';
  document.getElementById('chatQuick').style.display = 'none';
  syncRightPanel(id, 'deepseek');
  showToast(`已切换至 ${agent.name}`);
}

// ===== WORKSPACE MANAGEMENT =====
function switchWsTab(tab) {
  document.querySelectorAll('.ws-mgmt__tab').forEach(el => el.classList.remove('ws-mgmt__tab--active'));
  document.querySelector(`.ws-mgmt__tab[data-tab="${tab}"]`)?.classList.add('ws-mgmt__tab--active');
  document.querySelectorAll('.ws-panel').forEach(el => el.classList.remove('active'));
  document.getElementById('panel-' + tab)?.classList.add('active');
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  list.innerHTML = conversations.map(c => `
    <div class="conv-item" onclick="switchPage('ai-workspace');switchConversation(${c.id})">
      <div class="conv-item__icon">${c.emoji}</div>
      <div class="conv-item__info">
        <div class="conv-item__title">${escapeHtml(c.title)}</div>
        <div class="conv-item__meta">${c.agent} · ${c.time}</div>
      </div>
      <button class="btn btn--sm" onclick="switchPage('ai-workspace');switchConversation(${c.id})">打开</button>
    </div>
  `).join('');
}

function renderMyAgents() {
  const grid = document.getElementById('myAgentsGrid');
  if (!grid) return;
  grid.innerHTML = myAgents.map(a => `
    <div class="agent-card">
      <div class="agent-card__header">
        <div class="agent-card__avatar">${a.emoji}</div>
        <div class="agent-card__info">
          <div class="agent-card__name">${escapeHtml(a.name)}</div>
          <div class="agent-card__author">
            <span class="tag tag--${a.status === '已发布' ? 'success' : 'warning'}" style="font-size:10px;height:18px;padding:0 6px;">${a.status}</span>
          </div>
        </div>
      </div>
      <div class="agent-card__desc">${escapeHtml(a.desc)}</div>
      <div class="agent-card__footer">
        <div class="agent-card__stats">
          <span>▶ ${a.uses}</span>
          <span>🍴 ${a.forks}</span>
        </div>
        <div style="display:flex;gap:var(--space-1);">
          <button class="btn btn--sm" onclick="showToast('编辑功能开发中')">编辑</button>
          <button class="btn btn--sm" onclick="showToast('分享功能开发中')">分享</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderTasks() {
  const tbody = document.getElementById('tasksTableBody');
  if (!tbody) return;
  tbody.innerHTML = taskRecords.map(t => `
    <tr style="border-bottom:1px solid var(--color-border-secondary);">
      <td style="padding:var(--space-3) var(--space-4);font-size:var(--font-size-sm);">${escapeHtml(t.name)}</td>
      <td style="padding:var(--space-3) var(--space-4);font-size:var(--font-size-sm);">${escapeHtml(t.agent)}</td>
      <td style="padding:var(--space-3) var(--space-4);font-size:var(--font-size-sm);color:var(--color-text-secondary);">${t.time}</td>
      <td style="padding:var(--space-3) var(--space-4);"><span class="tag tag--${t.statusColor}">${t.status}</span></td>
      <td style="padding:var(--space-3) var(--space-4);"><button class="btn btn--sm" onclick="showToast('查看任务详情')">查看</button></td>
    </tr>
  `).join('');
}

// ===== AGENT BUILDER =====
function openAgentBuilder() {
  document.getElementById('agentBuilderMask').dataset.open = 'true';
  document.getElementById('agentBuilderModal').dataset.open = 'true';
}

function closeAgentBuilder() {
  document.getElementById('agentBuilderMask').dataset.open = 'false';
  document.getElementById('agentBuilderModal').dataset.open = 'false';
}

function saveAgent() {
  const name = document.getElementById('agentNameInput').value.trim();
  if (!name) {
    showToast('请填写 Agent 名称', 'warning');
    return;
  }

  // 读取完整表单字段
  const emoji = document.getElementById('agentAvatarPreview').textContent.trim();
  const desc = document.getElementById('agentDescInput').value || '暂无描述';
  const instructions = document.getElementById('agentInstructionsInput')?.value?.trim() || '';
  const welcomeMsg = document.getElementById('agentWelcomeInput')?.value?.trim() || '';
  const defaultModel = document.getElementById('agentModelSelect')?.dataset?.value || 'deepseek-v4-pro';

  closeAgentBuilder();
  showToast('Agent 保存成功');

  const newAgentId = Date.now();
  const newAgent = {
    id: newAgentId,
    name,
    emoji,
    author: '我',
    desc,
    uses: 0,
    forks: 0,
    tag: '自定义',
    status: '草稿'
  };

  // UI 列表
  myAgents.unshift(newAgent);

  // Agent SDK 注册中心（用户自建 Agent 同样注册到 SDK）
  agentRegistry[newAgentId] = new Agent({
    id: newAgentId,
    name,
    emoji,
    instructions: instructions || `你是「${name}」，一个有帮助的 AI 助手。\n\n${desc}`,
    model: defaultModel,
    desc,
    tag: '自定义',
    official: false,
    allowFork: true,
    author: '我'
  });

  renderMyAgents();

  // Clear form
  document.getElementById('agentNameInput').value = '';
  document.getElementById('agentDescInput').value = '';
  const instrInput = document.getElementById('agentInstructionsInput');
  if (instrInput) instrInput.value = '';
  const welcomeInput = document.getElementById('agentWelcomeInput');
  if (welcomeInput) welcomeInput.value = '';
}

// Avatar picker
document.getElementById('agentAvatarPreview')?.addEventListener('click', function() {
  const emojis = ['🤖', '💡', '📝', '🖼', '📊', '💬', '🎯', '🔍', '✨', '🎨', '📈', '🛒'];
  const current = this.textContent.trim();
  const idx = emojis.indexOf(current);
  this.textContent = emojis[(idx + 1) % emojis.length];
});

// ===== LISTING OPTIMIZATION =====
function fetchListing() {
  if (isFetching) return;
  const id = document.getElementById('listingInput').value.trim();
  if (!id) { showToast('请输入 ASIN 或 Listing ID', 'warning'); return; }

  isFetching = true;
  document.getElementById('listingOriginal').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:200px;gap:var(--space-2);color:var(--color-text-secondary);">
      <div style="width:20px;height:20px;border:2px solid var(--color-border);border-top-color:var(--color-primary-6);border-radius:50%;animation:spin 1s linear infinite;"></div>
      正在获取…
    </div>
  `;
  document.getElementById('listingOptimized').innerHTML = `
    <div class="listing-empty"><div class="listing-empty__icon">⏳</div><p>等待获取原始数据</p></div>
  `;

  setTimeout(() => {
    document.getElementById('listingOriginal').innerHTML = `
      <div style="display:flex;flex-direction:column;gap:var(--space-3);">
        <div><label style="font-size:var(--font-size-xs);color:var(--color-text-secondary);display:block;margin-bottom:var(--space-1);">标题</label>
        <div style="padding:var(--space-3);background:var(--color-bg-spotlight);border-radius:var(--radius);font-size:var(--font-size-sm);line-height:1.6;">Wireless Bluetooth Earbuds, IPX7 Waterproof Sports Earphones with Noise Cancelling Mic, 48H Battery Life, HD Stereo Sound, LED Display, Comfortable Fit for Running Gym Cycling</div></div>
        <div><label style="font-size:var(--font-size-xs);color:var(--color-text-secondary);display:block;margin-bottom:var(--space-1);">卖点</label>
        <div style="padding:var(--space-3);background:var(--color-bg-spotlight);border-radius:var(--radius);font-size:var(--font-size-sm);line-height:1.6;white-space:pre-wrap;">• 48-hour battery life for long-lasting use
• IPX7 waterproof rating for sports and outdoor
• Advanced noise cancelling technology
• HD stereo sound with deep bass
• Comfortable ergonomic design with ear hooks</div></div>
        <div><label style="font-size:var(--font-size-xs);color:var(--color-text-secondary);display:block;margin-bottom:var(--space-1);">关键词</label>
        <div style="padding:var(--space-3);background:var(--color-bg-spotlight);border-radius:var(--radius);font-size:var(--font-size-sm);">wireless earbuds, bluetooth earphones, sports headset, noise cancelling, waterproof earbuds</div></div>
      </div>
    `;
    document.getElementById('listingOptimized').innerHTML = `
      <div class="listing-empty"><div class="listing-empty__icon">✨</div><p>点击下方按钮生成优化方案</p><button class="btn btn--primary" style="margin-top:var(--space-3);" onclick="runOptimization()">AI 智能优化</button></div>
    `;
    isFetching = false;
    showToast('已获取 Listing 数据');
  }, 1000);
}

function runOptimization() {
  if (isOptimizing) return;
  isOptimizing = true;
  document.getElementById('listingOptimized').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:200px;gap:var(--space-2);color:var(--color-text-secondary);">
      <div style="width:20px;height:20px;border:2px solid var(--color-border);border-top-color:var(--color-primary-6);border-radius:50%;animation:spin 1s linear infinite;"></div>
      AI 优化中…
    </div>
  `;
  setTimeout(() => {
    document.getElementById('listingOptimized').innerHTML = `
      <div style="display:flex;flex-direction:column;gap:var(--space-3);">
        <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3);background:var(--color-success-bg);border-radius:var(--radius);border:1px solid var(--color-success-border);">
          <span style="font-size:24px;font-weight:var(--font-weight-semibold);color:var(--color-success);">92</span>
          <span style="font-size:var(--font-size-sm);color:var(--color-text-secondary);">优化评分 ↑18%</span>
          <span class="tag tag--success" style="margin-left:auto;">已优化</span>
        </div>
        <div><label style="font-size:var(--font-size-xs);color:var(--color-text-secondary);display:block;margin-bottom:var(--space-1);">优化标题</label>
        <div style="padding:var(--space-3);background:var(--color-primary-bg);border-radius:var(--radius);border:1px solid var(--color-primary-3);font-size:var(--font-size-sm);line-height:1.6;">Premium Wireless Bluetooth Earbuds, IPX7 Waterproof Sport Earphones with AI-Noise Cancellation, 48H Playtime, HD Stereo Sound, LED Display, Secure Fit for Gym Running & Cycling</div></div>
        <div><label style="font-size:var(--font-size-xs);color:var(--color-text-secondary);display:block;margin-bottom:var(--space-1);">优化卖点</label>
        <div style="display:flex;flex-direction:column;gap:var(--space-1);">
          <div style="padding:var(--space-2) var(--space-3);background:var(--color-bg-spotlight);border-radius:var(--radius);font-size:var(--font-size-sm);">🚀 48-Hour Marathon Battery — Full work week on single charge</div>
          <div style="padding:var(--space-2) var(--space-3);background:var(--color-bg-spotlight);border-radius:var(--radius);font-size:var(--font-size-sm);">💧 IPX7 Waterproof & Sweatproof — Fully protected against sweat, rain, spills</div>
          <div style="padding:var(--space-2) var(--space-3);background:var(--color-bg-spotlight);border-radius:var(--radius);font-size:var(--font-size-sm);">🔇 AI-Powered Noise Cancellation — Filters 95% ambient noise</div>
          <div style="padding:var(--space-2) var(--space-3);background:var(--color-bg-spotlight);border-radius:var(--radius);font-size:var(--font-size-sm);">🎵 HD Stereo with Deep Bass — 13mm dynamic drivers</div>
          <div style="padding:var(--space-2) var(--space-3);background:var(--color-bg-spotlight);border-radius:var(--radius);font-size:var(--font-size-sm);">⌚ Smart LED Display & Touch Control — Real-time battery</div>
        </div></div>
        <div><label style="font-size:var(--font-size-xs);color:var(--color-text-secondary);display:block;margin-bottom:var(--space-1);">关键词</label>
        <div style="padding:var(--space-3);background:var(--color-bg-spotlight);border-radius:var(--radius);font-size:var(--font-size-sm);">wireless earbuds noise cancelling, waterproof bluetooth earphones, sport earbuds 48 hours, premium running headset</div></div>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn--primary" style="flex:1;" onclick="showToast('已应用优化')">应用优化</button>
          <button class="btn" onclick="showToast('已复制到剪贴板')">复制</button>
          <button class="btn" onclick="showToast('对比功能开发中')">对比</button>
        </div>
      </div>
    `;
    isOptimizing = false;
    showToast('优化完成！评分 92 ↑18%');
  }, 1500);
}

// ===== IMAGE STUDIO =====
function selectPlatform(el) {
  document.querySelectorAll('.platform-tag').forEach(t => {
    t.classList.remove('tag--selected');
    t.classList.add('tag--default');
  });
  el.classList.remove('tag--default');
  el.classList.add('tag--selected');
  showToast(`已切换平台至 ${el.textContent}`);
}

function selectImageStyle(el) {
  document.querySelectorAll('#page-image .tag[data-style]').forEach(t => {
    t.classList.remove('tag--selected');
    t.classList.add('tag--default');
  });
  el.classList.remove('tag--default');
  el.classList.add('tag--selected');
  const style = el.dataset.style;
  const prompt = document.getElementById('imagePrompt');
  if (prompt && style) {
    const base = prompt.value.replace(/，(商业摄影|白底图|生活方式|3D)风格/g, '');
    prompt.value = base + '，' + style + '风格';
  }
}

function generateImages() {
  if (isGenerating) return;
  const prompt = document.getElementById('imagePrompt').value.trim();
  if (!prompt) { showToast('请输入图片描述', 'warning'); return; }

  isGenerating = true;
  const gallery = document.getElementById('imageGallery');
  gallery.innerHTML = `
    <div style="grid-column:1 / -1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:var(--space-3);">
      <div style="width:32px;height:32px;border:3px solid var(--color-border);border-top-color:var(--color-primary-6);border-radius:50%;animation:spin 1s linear infinite;"></div>
      <p style="color:var(--color-text-secondary);font-size:var(--font-size-sm);">AI 创作中…</p>
    </div>
  `;

  setTimeout(() => {
    const colors = [
      ['var(--color-primary-1)', 'var(--color-primary-3)'],
      ['var(--color-success-bg)', 'var(--color-success-border)'],
      ['var(--color-warning-bg)', 'var(--color-warning-border)'],
      ['var(--color-error-bg)', 'var(--color-error-border)']
    ];
    const styles = ['商业摄影', '白底图', '生活方式', '3D'];
    gallery.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const styleIdx = i % 4;
      gallery.innerHTML += `
        <div class="image-card" style="background:linear-gradient(135deg,${colors[styleIdx][0]},${colors[styleIdx][1]});">
          <div style="text-align:center;padding:var(--space-4);">
            <div style="font-size:32px;margin-bottom:var(--space-2);">🖼</div>
            <p style="font-size:var(--font-size-xs);color:var(--color-text-secondary);">${styles[styleIdx]}</p>
          </div>
        </div>
      `;
    }
    isGenerating = false;
    showToast('生成 4 张图片');
  }, 2000);
}

// ===== TOAST =====
function showToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  if (toastTimer) clearTimeout(toastTimer);
  if (toastHideTimer) clearTimeout(toastHideTimer);
  t.textContent = msg;
  t.className = 'toast show';
  if (type === 'warning') t.classList.add('toast--warning');
  else if (type === 'error') t.classList.add('toast--error');
  else if (type === 'success') t.classList.add('toast--success');
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
    toastHideTimer = setTimeout(() => { t.className = 'toast'; }, 350);
  }, 2500);
}

// ===== @ COMMAND PANEL =====
let atPanelOpen = false;

function toggleAtCommandPanel() {
  atPanelOpen ? closeAtCommandPanel() : openAtCommandPanel();
}

function openAtCommandPanel() {
  atPanelOpen = true;
  const panel = document.getElementById('atCommandPanel');
  panel.dataset.open = 'true';
  renderAtAgentList();
}

function closeAtCommandPanel() {
  atPanelOpen = false;
  document.getElementById('atCommandPanel').dataset.open = 'false';
}

function renderAtAgentList() {
  const list = document.getElementById('atAgentList');
  if (!list) return;
  list.innerHTML = agents.map(a => `
    <div class="at-command-item" onclick="switchAgent(${a.id});closeAtCommandPanel();">
      <span class="at-command-item__icon">${a.emoji}</span>
      <div class="at-command-item__info">
        <div class="at-command-item__name">${escapeHtml(a.name)}</div>
        <div class="at-command-item__desc">${escapeHtml(a.desc.slice(0, 20))}...</div>
      </div>
      ${a.official ? '<span class="tag" style="background:var(--color-primary-bg);color:var(--color-primary-7);border-color:var(--color-primary-3);font-size:10px;height:18px;padding:0 6px;margin-left:auto;">官方</span>' : ''}
    </div>
  `).join('');
}

function atInsertCommand(command) {
  closeAtCommandPanel();
  if (command === '/clear') {
    clearAllContext();
    return;
  }
  const input = document.getElementById('chatInput');
  input.value = command;
  input.focus();
  // Auto-resize
  input.rows = 1;
  const rows = Math.min(5, Math.ceil(input.scrollHeight / 24));
  input.rows = Math.max(1, rows);
}

// Close @ panel when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#atBtn') && !e.target.closest('#atCommandPanel')) {
    closeAtCommandPanel();
  }
});

// ===== KNOWLEDGE BASE & CONTEXT MANAGEMENT =====
function deleteKBFile(fileId) {
  const el = document.getElementById(`kbFile${fileId}`);
  if (el) {
    el.style.animation = 'fadeOut .3s ease';
    setTimeout(() => {
      el.remove();
      showToast('已删除知识库文件');
    }, 300);
  }
}

let contextPanelOpen = false;

function toggleContextPanel() {
  contextPanelOpen ? closeContextPanel() : openContextPanel();
}

function openContextPanel() {
  contextPanelOpen = true;
  document.getElementById('contextMask').dataset.open = 'true';
  document.getElementById('contextModal').dataset.open = 'true';
  updateContextStats();
  syncContextModalFromChat();
}

/** Render context modal message list from the real chat messages */
function syncContextModalFromChat() {
  const list = document.getElementById('contextMsgList');
  if (!list) return;
  const msgs = document.querySelectorAll('#chatMessages .chat-msg');
  if (msgs.length === 0) {
    list.innerHTML = '<div style="padding:var(--space-3);text-align:center;color:var(--color-text-tertiary);font-size:var(--font-size-sm);">暂无对话消息</div>';
    return;
  }
  list.innerHTML = Array.from(msgs).map((msg, i) => {
    const bubble = msg.querySelector('.chat-msg__bubble');
    const isUser = msg.classList.contains('chat-msg--user');
    const text = bubble ? bubble.textContent.slice(0, 60) + (bubble.textContent.length > 60 ? '...' : '') : '';
    const role = isUser ? '用户' : '助手';
    const match = msg.id.match(/msg-(\d+)/);
    const msgId = match ? match[1] : i;
    return `
      <div style="padding:var(--space-2);border-radius:var(--radius-sm);background:var(--color-bg-container);border:1px solid var(--color-border-secondary);font-size:var(--font-size-sm);display:flex;justify-content:space-between;align-items:center;">
        <span style="color:${isUser ? 'var(--color-primary-6)' : 'var(--color-text-secondary)'};">${role}: ${escapeHtml(text)}</span>
        <button class="ctx-msg-delete" onclick="deleteContextMsg(${msgId})" title="删除">✕</button>
      </div>`;
  }).join('');
}

function closeContextPanel() {
  contextPanelOpen = false;
  document.getElementById('contextMask').dataset.open = 'false';
  document.getElementById('contextModal').dataset.open = 'false';
}

function updateContextStats() {
  const msgs = document.getElementById('chatMessages');
  const msgCount = msgs && msgs.style.display !== 'none' ? document.querySelectorAll('.chat-msg').length : 0;
  const estimatedTokens = Math.round(msgCount * 150);

  const ctxCount = document.getElementById('contextMsgCount');
  const ctxTokens = document.getElementById('contextTokens');
  const modalCount = document.getElementById('modalMsgCount');
  const modalTokens = document.getElementById('modalTokens');
  if (ctxCount) ctxCount.textContent = msgCount;
  if (ctxTokens) ctxTokens.textContent = estimatedTokens.toLocaleString();
  if (modalCount) modalCount.textContent = msgCount;
  if (modalTokens) modalTokens.textContent = estimatedTokens.toLocaleString();
}

function compressContext() {
  if (confirm('AI 将自动总结对话历史，生成摘要后替换原始消息。\n\n可减少 Token 使用，同时保留关键信息。确定继续吗？')) {
    const msgs = document.querySelectorAll('#chatMessages .chat-msg');
    if (msgs.length > 5) {
      msgs[0].style.animation = 'fadeOut .3s ease forwards';
      msgs[1].style.animation = 'fadeOut .3s ease forwards';
      setTimeout(() => {
        msgs[0].remove();
        msgs[1].remove();
        updateContextStats();
        if (contextPanelOpen) syncContextModalFromChat();
        showToast('已生成对话摘要，Token 使用 ↓40%');
      }, 300);
    } else {
      showToast('对话太短，无需生成摘要', 'warning');
    }
  }
}

function deleteContextMsg(msgId) {
  if (confirm('确定要删除此消息吗？')) {
    deleteChatMsg(msgId);
  }
}

function startFromMessage() {
  closeContextPanel();
  showToast('已重置对话，从此处开始');
  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML = `
    <div class="chat-msg chat-msg--bot" id="msg-${msgIdCounter++}">
      <div class="chat-msg__avatar chat-msg__avatar--bot">🤖</div>
      <div class="chat-msg__body">
        <div class="chat-msg__bubble">已清除之前的对话记录。让我们从这里开始吧！</div>
        <div class="chat-msg__time">刚刚</div>
      </div>
      <button class="chat-msg__delete" title="删除此消息" onclick="deleteChatMsg(${msgIdCounter - 1})">×</button>
    </div>
  `;
  updateContextStats();
}

function clearAllContext() {
  if (confirm('确定要清空当前对话的所有消息吗？\n\n此操作无法撤销，清空后对话将从头开始。')) {
    document.getElementById('chatMessages').innerHTML = `
      <div class="chat-msg chat-msg--bot" id="msg-${msgIdCounter++}">
        <div class="chat-msg__avatar chat-msg__avatar--bot">🤖</div>
        <div class="chat-msg__body">
          <div class="chat-msg__bubble">👋 对话已清空。请重新开始对话。</div>
          <div class="chat-msg__time">刚刚</div>
        </div>
        <button class="chat-msg__delete" title="删除此消息" onclick="deleteChatMsg(${msgIdCounter - 1})">×</button>
      </div>
    `;
    // Clear conversation history
    if (conversationMessages[currentConversation]) {
      conversationMessages[currentConversation] = [];
    }
    closeContextPanel();
    updateContextStats();
    showToast('已清空当前对话');
  }
}

// ===== GLOBAL CHAT WIDGET =====
let chatWindowOpen = false;
let widgetSettingsOpen = false;

const chatWidgetFloat = document.getElementById('chatWidgetFloat');
if (chatWidgetFloat) {
  chatWidgetFloat.addEventListener('click', () => {
    chatWindowOpen ? closeChatWindow() : openChatWindow();
  });
}

function openChatWindow() {
  chatWindowOpen = true;
  document.getElementById('chatWindowMask').dataset.open = 'true';
  document.getElementById('chatWindowWidget').dataset.open = 'true';
}

function closeChatWindow() {
  chatWindowOpen = false;
  document.getElementById('chatWindowMask').dataset.open = 'false';
  document.getElementById('chatWindowWidget').dataset.open = 'false';
  document.getElementById('widgetSettings').style.display = 'none';
  widgetSettingsOpen = false;
}

function toggleWidgetSettings() {
  widgetSettingsOpen = !widgetSettingsOpen;
  const settings = document.getElementById('widgetSettings');
  settings.style.display = widgetSettingsOpen ? 'block' : 'none';
}

function sendWidgetChat() {
  if (isWidgetSending) return;
  const input = document.getElementById('widgetChatInput');
  const text = input.value.trim();
  if (!text) return;
  isWidgetSending = true;
  input.value = '';
  input.rows = 1;

  const msgs = document.getElementById('widgetMessages');
  const userDiv = document.createElement('div');
  userDiv.className = 'widget-msg widget-msg--user';
  userDiv.innerHTML = `<div class="widget-msg__bubble">${escapeHtml(text)}</div>`;
  msgs.appendChild(userDiv);
  msgs.scrollTop = msgs.scrollHeight;

  let reply = chatResponses['默认'];
  for (const [k, v] of Object.entries(chatResponses)) {
    if (k === '默认') continue;
    if (text.includes(k)) { reply = v; break; }
  }

  widgetReplyTimeoutId = setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.className = 'widget-msg widget-msg--bot';
    botDiv.innerHTML = `<div class="widget-msg__bubble">${formatBotMessage(reply)}</div>`;
    msgs.appendChild(botDiv);
    msgs.scrollTop = msgs.scrollHeight;
    isWidgetSending = false;
    widgetReplyTimeoutId = null;
  }, 600 + Math.random() * 400);
}

// Auto-resize widget textarea
const widgetInput = document.getElementById('widgetChatInput');
if (widgetInput) {
  widgetInput.addEventListener('input', function() {
    this.rows = 1;
    const rows = Math.min(4, Math.ceil(this.scrollHeight / 20));
    this.rows = Math.max(1, rows);
  });
  widgetInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendWidgetChat();
    }
  });
}

// Add fadeOut animation
const animStyle = document.createElement('style');
animStyle.textContent = `@keyframes fadeOut { to { opacity: 0; transform: translateX(-10px); } }`;
document.head.appendChild(animStyle);
window.switchConversation = switchConversation;
window.newConversation = newConversation;
window.sendChat = sendChat;
window.quickChat = quickChat;
window.toggleModelDropdown = toggleModelDropdown;
window.selectModel = selectModel;
window.toggleAgentSelector = toggleAgentSelector;
window.switchAgent = switchAgent;
window.toggleRightPanel = toggleRightPanel;
window.openAgentBuilder = openAgentBuilder;
window.closeAgentBuilder = closeAgentBuilder;
window.saveAgent = saveAgent;
window.useAgent = useAgent;
window.switchWsTab = switchWsTab;
window.fetchListing = fetchListing;
window.runOptimization = runOptimization;
window.generateImages = generateImages;
window.selectPlatform = selectPlatform;
window.selectImageStyle = selectImageStyle;
window.showToast = showToast;
window.renderMessageHtml = renderMessageHtml;
window.formatBotMessage = formatBotMessage;
window.selectAgentFromWelcome = selectAgentFromWelcome;
window.syncRightPanel = syncRightPanel;
window.renderRightPanelActions = renderRightPanelActions;
window.onEditAgentClick = onEditAgentClick;
window.onShareAgentClick = onShareAgentClick;
window.onDeleteKBClick = onDeleteKBClick;
window.onUploadKBClick = onUploadKBClick;
window.uploadAttachment = uploadAttachment;

function uploadAttachment() {
  const fileNames = ['产品图片_01.jpg', '销售数据_Q2.xlsx', '客户反馈汇总.pdf'];
  const fileName = fileNames[Math.floor(Math.random() * fileNames.length)];
  showToast(`已添加附件：${fileName}`);
}
// New functions
window.deleteKBFile = deleteKBFile;
window.toggleContextPanel = toggleContextPanel;
window.openContextPanel = openContextPanel;
window.closeContextPanel = closeContextPanel;
window.compressContext = compressContext;
window.deleteContextMsg = deleteContextMsg;
window.startFromMessage = startFromMessage;
window.clearAllContext = clearAllContext;
window.openChatWindow = openChatWindow;
window.closeChatWindow = closeChatWindow;
window.toggleWidgetSettings = toggleWidgetSettings;
window.sendWidgetChat = sendWidgetChat;
// @ Command Panel
window.toggleAtCommandPanel = toggleAtCommandPanel;
window.closeAtCommandPanel = closeAtCommandPanel;
window.atInsertCommand = atInsertCommand;
// Chat message delete
window.deleteChatMsg = deleteChatMsg;

// Add spin keyframes
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);

// ===== ANT-STYLE SELECT =====
function toggleAntSelect(trigger) {
  const dropdown = trigger.nextElementSibling;
  const isOpen = dropdown.classList.contains('ant-select-dropdown--open');
  // Close all others
  document.querySelectorAll('.ant-select-dropdown--open').forEach(d => {
    d.classList.remove('ant-select-dropdown--open');
  });
  document.querySelectorAll('.ant-select-trigger--open').forEach(t => {
    t.classList.remove('ant-select-trigger--open');
  });
  if (!isOpen) {
    dropdown.classList.add('ant-select-dropdown--open');
    trigger.classList.add('ant-select-trigger--open');
  }
}

function selectAntOption(option, value, dataValue) {
  const select = option.closest('.ant-select');
  const triggerSpan = select.querySelector('.ant-select-trigger span:first-child');
  if (triggerSpan) triggerSpan.textContent = value;
  select.dataset.value = dataValue || value;
  select.querySelectorAll('.ant-select-option').forEach(o => o.classList.remove('ant-select-option--active'));
  option.classList.add('ant-select-option--active');
  const dropdown = select.querySelector('.ant-select-dropdown');
  const trigger = select.querySelector('.ant-select-trigger');
  if (dropdown) dropdown.classList.remove('ant-select-dropdown--open');
  if (trigger) trigger.classList.remove('ant-select-trigger--open');
}

// Close ant-select dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.ant-select')) {
    document.querySelectorAll('.ant-select-dropdown--open').forEach(d => d.classList.remove('ant-select-dropdown--open'));
    document.querySelectorAll('.ant-select-trigger--open').forEach(t => t.classList.remove('ant-select-trigger--open'));
  }
});

window.toggleAntSelect = toggleAntSelect;
window.selectAntOption = selectAntOption;
window.selectFreeGenRatio = selectFreeGenRatio;
window.selectFreeGenQuality = selectFreeGenQuality;
window.mockFreeGenGenerate = mockFreeGenGenerate;

// Render on load
renderAgentMarket();
renderHistory();
renderMyAgents();
renderTasks();
renderWelcomeAgents();

// 默认模型：DeepSeek V4 Pro
selectModel('deepseek');

// Default to welcome page on first load
document.getElementById('welcomePage').style.display = 'flex';
document.getElementById('chatMessages').style.display = 'none';
document.getElementById('chatQuick').style.display = 'none';

// ============================================================
// ERP SKU 图片库 Mock 数据 & SKU 查询逻辑
// ============================================================

const ERP_SKU_DB = {
  'SKU-WE-001': {
    name: '无线蓝牙耳机 Pro',
    images: [
      { id: 'img-1-1', label: '主图白底', color: 'var(--color-info-bg)', emoji: '🎧' },
      { id: 'img-1-2', label: '包装图', color: 'var(--color-success-bg)', emoji: '📦' },
      { id: 'img-1-3', label: '充电场景', color: 'var(--color-warning-bg)', emoji: '🔋' },
      { id: 'img-1-4', label: '佩戴展示', color: 'var(--color-error-bg)', emoji: '👂' }
    ],
    dimensions: { length: '12.5', width: '8.0', height: '3.2' }
  },
  'SKU-WT-002': {
    name: '智能手表 Series 5',
    images: [
      { id: 'img-2-1', label: '正面表盘', color: 'var(--color-primary-bg)', emoji: '⌚' },
      { id: 'img-2-2', label: '侧面厚度', color: 'var(--color-info-bg)', emoji: '📐' },
      { id: 'img-2-3', label: '表带细节', color: 'var(--color-success-bg)', emoji: '🔗' }
    ],
    dimensions: null
  },
  'SKU-BT-003': {
    name: '便携蓝牙音箱 Mini',
    images: [
      { id: 'img-3-1', label: '360°展示', color: 'var(--color-warning-bg)', emoji: '🔊' },
      { id: 'img-3-2', label: '户外场景', color: 'var(--color-success-bg)', emoji: '🏕' },
      { id: 'img-3-3', label: '尺寸对比', color: 'var(--color-info-bg)', emoji: '📏' },
      { id: 'img-3-4', label: '接口特写', color: 'var(--color-error-bg)', emoji: '🔌' },
      { id: 'img-3-5', label: '配色方案', color: 'var(--color-primary-bg)', emoji: '🎨' }
    ],
    dimensions: { length: '9.5', width: '9.5', height: '11.0' }
  }
};

window.__imageStudioState = {
  currentSKU: '',
  skuData: null,
  selectedImages: {}
};

function querySKUForTool(toolId) {
  const input = document.getElementById(`skuInput-${toolId}`);
  const sku = input?.value?.trim()?.toUpperCase();
  if (!sku) { showToast('请输入 SKU 编码', 'warning'); return; }

  const data = ERP_SKU_DB[sku];
  const gallery = document.getElementById(`skuGallery-${toolId}`);
  const grid = document.getElementById(`skuGalleryGrid-${toolId}`);
  const selectedEl = document.getElementById(`skuSelected-${toolId}`);

  if (!data) {
    showToast(`未找到 SKU「${sku}」的产品信息`, 'warning');
    if (gallery) gallery.style.display = 'none';
    window.__imageStudioState.currentSKU = sku;
    window.__imageStudioState.skuData = null;
    if (selectedEl) { selectedEl.textContent = ''; selectedEl.style.display = 'none'; }
    return;
  }

  window.__imageStudioState.currentSKU = sku;
  window.__imageStudioState.skuData = data;
  if (!window.__imageStudioState.selectedImages[toolId]) {
    window.__imageStudioState.selectedImages[toolId] = [];
  }

  if (gallery && grid) {
    gallery.style.display = 'block';
    grid.innerHTML = data.images.map((img, idx) => `
      <div id="skuImg-${toolId}-${idx}" onclick="selectSKUImage('${toolId}',${idx})"
           style="width:80px;height:80px;border-radius:var(--radius);background:${img.color};display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;border:2px solid var(--color-border-secondary);transition:all .2s;"
           onmouseenter="this.style.borderColor='var(--color-primary-6)';this.style.transform='translateY(-2px)'"
           onmouseleave="this.style.borderColor='var(--color-border-secondary)';this.style.transform='none'">
        <span style="font-size:28px;">${img.emoji}</span>
        <span style="font-size:10px;color:var(--color-text-secondary);margin-top:2px;">${img.label}</span>
      </div>
    `).join('');
  }

  updateSKUSelectedDisplay(toolId);
  showToast(`已加载 SKU「${sku}」：${data.name}，共 ${data.images.length} 张图片`, 'success');

  if (toolId === 'size') loadSKUDimensions(sku, data);
}

function selectSKUImage(toolId, imageIdx) {
  const selected = window.__imageStudioState.selectedImages[toolId];
  const idx = selected.indexOf(imageIdx);
  if (idx > -1) { selected.splice(idx, 1); }
  else { selected.push(imageIdx); }
  updateSKUSelectedDisplay(toolId);
}

function updateSKUSelectedDisplay(toolId) {
  const selected = window.__imageStudioState.selectedImages[toolId] || [];
  const el = document.getElementById(`skuSelected-${toolId}`);
  const data = window.__imageStudioState.skuData;
  if (!el || !data) return;
  if (selected.length === 0) {
    el.textContent = ''; el.style.display = 'none';
  } else {
    const names = selected.map(i => data.images[i]?.label || `图${i+1}`).join('、');
    el.textContent = `✅ 已选择：${names}（共 ${selected.length} 张）`;
    el.style.display = 'block';
  }
  data.images.forEach((_, idx) => {
    const card = document.getElementById(`skuImg-${toolId}-${idx}`);
    if (!card) return;
    const isSel = selected.includes(idx);
    card.style.borderColor = isSel ? 'var(--color-primary-6)' : 'var(--color-border-secondary)';
    card.style.boxShadow = isSel ? '0 0 0 2px var(--color-primary-3)' : 'none';
  });
}

function loadSKUDimensions(sku, data) {
  const dims = data?.dimensions;
  const len = document.getElementById('sizeLength');
  const wid = document.getElementById('sizeWidth');
  const hei = document.getElementById('sizeHeight');
  if (!dims) {
    showToast(`SKU「${sku}」暂无产品尺寸信息，请手动填写`, 'warning');
    if (len) len.value = ''; if (wid) wid.value = ''; if (hei) hei.value = '';
    return;
  }
  if (len) len.value = dims.length;
  if (wid) wid.value = dims.width;
  if (hei) hei.value = dims.height;
  showToast(`已自动加载尺寸：${dims.length}×${dims.width}×${dims.height} cm`, 'success');
}

function skuInputHTML(toolId, extraFields) {
  return `
    <div style="margin-bottom:var(--space-4);padding:var(--space-3);background:var(--color-bg-spotlight);border-radius:var(--radius);border:1px solid var(--color-border-secondary);">
      <div style="display:flex;gap:var(--space-2);align-items:flex-end;margin-bottom:var(--space-2);">
        <div style="flex:1;">
          <label style="display:block;margin-bottom:6px;font-weight:500;font-size:var(--font-size-sm);color:var(--color-text-secondary);">SKU / 商品编码</label>
          <input type="text" id="skuInput-${toolId}" class="input" placeholder="例如：SKU-WE-001" onkeydown="if(event.key==='Enter')querySKUForTool('${toolId}')" />
        </div>
        <button class="btn btn--primary" style="height:36px;white-space:nowrap;" onclick="querySKUForTool('${toolId}')">🔍 查询 ERP</button>
      </div>
      <div id="skuGallery-${toolId}" style="display:none;">
        <div style="font-size:var(--font-size-xs);color:var(--color-text-tertiary);margin-bottom:var(--space-2);display:flex;align-items:center;gap:var(--space-1);">
          <span>📦 ERP 图片库</span>
          <span style="color:var(--color-text-tertiary);">（点击选择，支持多选）</span>
        </div>
        <div id="skuGalleryGrid-${toolId}" style="display:flex;gap:var(--space-2);flex-wrap:wrap;"></div>
        <div id="skuSelected-${toolId}" style="margin-top:var(--space-2);font-size:var(--font-size-xs);color:var(--color-success);display:none;"></div>
      </div>
    </div>
    ${extraFields || ''}
    <div style="margin-top:var(--space-3);">
      <label style="display:block;margin-bottom:8px;font-weight:500;font-size:var(--font-size-xs);color:var(--color-text-tertiary);">或上传本地图片（自定义修改）</label>
      <button class="btn" style="width:100%;height:80px;border-style:dashed;background:var(--color-bg-spotlight);color:var(--color-text-secondary);" onclick="showToast('演示模式：本地上传仅作展示')">+ 点击上传本地图片</button>
    </div>
  `;
}

// ==================== IMAGE STUDIO V3 LOGIC ====================
const IMAGE_TOOLS = [
  {
    id: 'free-gen', name: '自由生图', desc: '文生图，输入提示词生成任意图片', icon: '🎨', color: 'var(--color-primary-6)', bg: 'var(--color-primary-bg)',
    config: `
      <div style="display:flex;flex-direction:column;gap:var(--space-4);">
        <div>
          <label style="display:block;margin-bottom:8px;font-weight:500;">图片提示词</label>
          <textarea id="freeGenPrompt" class="input" style="height:120px;resize:none;padding:var(--space-3);" placeholder="请输入图片提示词，描述你想要的画面内容、风格、光影..."></textarea>
        </div>
        <div>
          <label style="display:block;margin-bottom:8px;font-weight:500;font-size:var(--font-size-sm);color:var(--color-text-secondary);">图片比例</label>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:var(--space-2);" id="freeGenRatioGrid">
            <span class="tag tag--default" onclick="selectFreeGenRatio(this,'21:9')">21:9</span>
            <span class="tag tag--default" onclick="selectFreeGenRatio(this,'16:9')">16:9</span>
            <span class="tag tag--default" onclick="selectFreeGenRatio(this,'3:2')">3:2</span>
            <span class="tag tag--default" onclick="selectFreeGenRatio(this,'4:3')">4:3</span>
            <span class="tag tag--default" onclick="selectFreeGenRatio(this,'5:4')">5:4</span>
            <span class="tag tag--selected" onclick="selectFreeGenRatio(this,'1:1')">1:1</span>
            <span class="tag tag--default" onclick="selectFreeGenRatio(this,'4:5')">4:5</span>
            <span class="tag tag--default" onclick="selectFreeGenRatio(this,'3:4')">3:4</span>
            <span class="tag tag--default" onclick="selectFreeGenRatio(this,'2:3')">2:3</span>
            <span class="tag tag--default" onclick="selectFreeGenRatio(this,'9:16')">9:16</span>
          </div>
        </div>
        <div>
          <label style="display:block;margin-bottom:8px;font-weight:500;font-size:var(--font-size-sm);color:var(--color-text-secondary);">图片分辨率</label>
          <div style="display:flex;gap:var(--space-2);" id="freeGenQualityGroup">
            <span class="tag tag--default" onclick="selectFreeGenQuality(this,'1K')">标清 1K</span>
            <span class="tag tag--selected" onclick="selectFreeGenQuality(this,'2K')">高清 2K</span>
          </div>
        </div>
        <div style="font-size:var(--font-size-sm);color:var(--color-text-secondary);display:flex;align-items:center;gap:var(--space-2);">
          <span>图片尺寸：</span>
          <span id="freeGenSize" style="font-weight:var(--font-weight-semibold);color:var(--color-text);">2048*2048</span>
        </div>
        <div style="display:flex;gap:var(--space-2);align-items:center;flex-wrap:wrap;">
          <button class="btn btn--sm" style="height:32px;" onclick="showToast('参考图功能开发中')">🖼 参考图</button>
          <button class="btn btn--sm" style="height:32px;" onclick="showToast('Pro 模型开发中')">✨ Pro 模型</button>
          <button class="btn btn--sm" style="height:32px;" id="freeGenMetaDisplay">⬜ 比例 1:1 | 高清 2K</button>
          <button class="btn btn--sm" style="height:32px;" onclick="showToast('模板功能开发中')">📋 模板</button>
          <button class="btn btn--primary" style="margin-left:auto;height:36px;" onclick="mockFreeGenGenerate()">🚀 生成图片</button>
        </div>
      </div>
    `
  },
  {
    id: 'main-image', name: '主图', desc: '一键生成高清白底图', icon: '🛍', color: 'var(--color-info)', bg: 'var(--color-info-bg)',
    config: `
      ${skuInputHTML('main-image')}
      <div style="margin-top:var(--space-4);">
         <button class="btn btn--primary" style="width:100%;height:40px;font-size:var(--font-size);" onclick="mockImageGenerateV3()">🚀 调度 Agent 生成主图</button>
      </div>
    `
  },
  {
    id: 'closeup', name: '特写图', desc: '生成高清特写展示图', icon: '🔍', color: 'var(--color-success)', bg: 'var(--color-success-bg)',
    config: `
      ${skuInputHTML('closeup', `
      <div style="margin-top:var(--space-3);">
         <label style="display:block;margin-bottom:8px;font-weight:500;">特写部位要求 Prompt</label>
         <textarea class="input" style="height:60px;resize:none;" placeholder="例如：聚焦在拉链的金属材质，展现纹理细节..."></textarea>
      </div>`)}
      <div style="margin-top:var(--space-4);">
         <button class="btn btn--primary" style="width:100%;height:40px;font-size:var(--font-size);" onclick="mockImageGenerateV3()">🚀 调度 Agent 生成特写图</button>
      </div>
    `
  },
  {
    id: 'size', name: '尺寸图', desc: '一键添加尺寸信息', icon: '📏', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)',
    config: `
      ${skuInputHTML('size', `
      <div style="display:flex;gap:var(--space-4);margin-top:var(--space-3);">
         <div style="flex:1;">
            <label style="display:block;margin-bottom:8px;font-weight:500;">长度 (cm)</label>
            <input id="sizeLength" type="text" class="input" placeholder="e.g. 120" />
         </div>
         <div style="flex:1;">
            <label style="display:block;margin-bottom:8px;font-weight:500;">宽度 (cm)</label>
            <input id="sizeWidth" type="text" class="input" placeholder="e.g. 60" />
         </div>
         <div style="flex:1;">
            <label style="display:block;margin-bottom:8px;font-weight:500;">高度 (cm)</label>
            <input id="sizeHeight" type="text" class="input" placeholder="e.g. 75" />
         </div>
      </div>`)}
      <div style="margin-top:var(--space-4);">
         <button class="btn btn--primary" style="width:100%;height:40px;font-size:var(--font-size);" onclick="mockImageGenerateV3()">🚀 调度 Agent 生成尺寸图</button>
      </div>
    `
  },
  {
    id: 'scene', name: '生成场景', desc: '自动生成商品场景图', icon: '🏕', color: 'var(--color-primary-6)', bg: 'var(--color-primary-bg)',
    config: `
      ${skuInputHTML('scene', `
      <div style="margin-top:var(--space-3);">
         <label style="display:block;margin-bottom:8px;font-weight:500;">场景描述 Prompt</label>
         <textarea class="input" style="height:80px;resize:none;" placeholder="例如：北欧极简风客厅，放在木质茶几上，阳光从窗户洒进..."></textarea>
      </div>`)}
      <div style="margin-top:var(--space-4);">
         <button class="btn btn--primary" style="width:100%;height:40px;font-size:var(--font-size);" onclick="mockImageGenerateV3()">🚀 调度 Agent 生成场景图</button>
      </div>
    `
  },
  {
    id: 'compose', name: '商品合成', desc: '将多个元素合成一张', icon: '🧩', color: 'var(--color-success)', bg: 'var(--color-success-bg)',
    config: `
      ${skuInputHTML('compose')}
      <div style="margin-top:var(--space-3);padding:var(--space-3);background:var(--color-bg-spotlight);border-radius:var(--radius);border:1px solid var(--color-border-secondary);">
        <label style="display:block;margin-bottom:8px;font-weight:500;font-size:var(--font-size-sm);color:var(--color-text-secondary);">点缀元素（可选）</label>
        <button class="btn" style="width:100%;height:80px;border-style:dashed;background:var(--color-bg-container);color:var(--color-text-secondary);" onclick="showToast('演示模式：上传点缀元素仅作展示')">+ 上传点缀元素（如花瓶、书籍等）</button>
      </div>
      <div style="margin-top:var(--space-4);">
         <button class="btn btn--primary" style="width:100%;height:40px;font-size:var(--font-size);" onclick="mockImageGenerateV3()">🚀 调度 Agent 融合图片</button>
      </div>
    `
  },
  {
    id: 'replace-scene', name: '更换场景', desc: '自动更换商品场景', icon: '🏞', color: 'var(--color-error)', bg: 'var(--color-error-bg)',
    config: `
      ${skuInputHTML('replace-scene', `
      <div style="margin-top:var(--space-3);">
         <label style="display:block;margin-bottom:8px;font-weight:500;">新场景描述 Prompt</label>
         <textarea class="input" style="height:60px;resize:none;" placeholder="描述你想替换的新场景..."></textarea>
      </div>`)}
      <div style="margin-top:var(--space-4);">
         <button class="btn btn--primary" style="width:100%;height:40px;font-size:var(--font-size);" onclick="mockImageGenerateV3()">🚀 调度 Agent 重绘场景</button>
      </div>
    `
  },
  {
    id: 'inpaint', name: '修复瑕疵', desc: '自动去除图片瑕疵', icon: '🩹', color: 'var(--color-info)', bg: 'var(--color-info-bg)',
    config: `
      <div style="display:flex;gap:var(--space-4);">
        <div style="flex:1;">
          <label style="display:block;margin-bottom:8px;font-weight:500;">上传需要修复的图片</label>
          <button class="btn" style="width:100%;height:120px;border-style:dashed;background:var(--color-bg-spotlight);">+ 点击上传</button>
        </div>
      </div>
      <div style="margin-top:var(--space-4);padding:var(--space-3);background:var(--color-bg-layout);border-radius:var(--radius);text-align:center;">
         <span style="color:var(--color-text-secondary);font-size:var(--font-size-sm);">上传图片后，可在图片上直接涂抹需要消除或修复的区域 (Inpainting)</span>
      </div>
      <div style="margin-top:var(--space-4);">
         <button class="btn btn--primary" style="width:100%;height:40px;font-size:var(--font-size);" onclick="mockImageGenerateV3()">🚀 调度 Agent 修复</button>
      </div>
    `
  },
  {
    id: 'style', name: '更换风格', desc: '自动重绘图片风格', icon: '💫', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)',
    config: `
      <div style="display:flex;gap:var(--space-4);">
        <div style="flex:1;">
          <label style="display:block;margin-bottom:8px;font-weight:500;">上传商品原图</label>
          <button class="btn" style="width:100%;height:120px;border-style:dashed;background:var(--color-bg-spotlight);">+ 点击上传</button>
        </div>
      </div>
      <div style="margin-top:var(--space-4);">
         <label style="display:block;margin-bottom:8px;font-weight:500;">选择目标风格 (ControlNet)</label>
         <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <span class="tag tag--selected" onclick="this.classList.toggle('tag--selected');this.classList.toggle('tag--default');">3D 卡通</span>
            <span class="tag tag--default" onclick="this.classList.toggle('tag--selected');this.classList.toggle('tag--default');">赛博朋克</span>
            <span class="tag tag--default" onclick="this.classList.toggle('tag--selected');this.classList.toggle('tag--default');">水彩艺术</span>
            <span class="tag tag--default" onclick="this.classList.toggle('tag--selected');this.classList.toggle('tag--default');">黏土风格</span>
         </div>
      </div>
      <div style="margin-top:var(--space-4);">
         <button class="btn btn--primary" style="width:100%;height:40px;font-size:var(--font-size);" onclick="mockImageGenerateV3()">🚀 调度 Agent 风格迁移</button>
      </div>
    `
  }
];

// --- 自由生图（文生图）工具函数 ---
let freeGenState = { ratio: '1:1', quality: '2K' };

const FREE_GEN_SIZE_MAP = {
  '1:1':  [1, 1],   '16:9': [16, 9],  '9:16': [9, 16],
  '4:3':  [4, 3],   '3:4':  [3, 4],   '21:9': [21, 9],
  '3:2':  [3, 2],   '5:4':  [5, 4],   '4:5':  [4, 5],  '2:3': [2, 3]
};

function selectFreeGenRatio(el, ratio) {
  freeGenState.ratio = ratio;
  document.querySelectorAll('#freeGenRatioGrid .tag').forEach(t => {
    t.classList.remove('tag--selected');
    t.classList.add('tag--default');
  });
  el.classList.remove('tag--default');
  el.classList.add('tag--selected');
  updateFreeGenSize();
}

function selectFreeGenQuality(el, quality) {
  freeGenState.quality = quality;
  document.querySelectorAll('#freeGenQualityGroup .tag').forEach(t => {
    t.classList.remove('tag--selected');
    t.classList.add('tag--default');
  });
  el.classList.remove('tag--default');
  el.classList.add('tag--selected');
  updateFreeGenSize();
}

function updateFreeGenSize() {
  const ratio = FREE_GEN_SIZE_MAP[freeGenState.ratio];
  const base = freeGenState.quality === '2K' ? 2048 : 1024;
  let w, h;
  if (ratio[0] >= ratio[1]) {
    w = base;
    h = Math.round(base / ratio[0] * ratio[1]);
  } else {
    h = base;
    w = Math.round(base / ratio[1] * ratio[0]);
  }
  const sizeEl = document.getElementById('freeGenSize');
  if (sizeEl) sizeEl.textContent = `${w}*${h}`;
  const metaEl = document.getElementById('freeGenMetaDisplay');
  if (metaEl) metaEl.textContent = `⬜ 比例 ${freeGenState.ratio} | ${freeGenState.quality === '2K' ? '高清 2K' : '标清 1K'}`;
}

function mockFreeGenGenerate() {
  const prompt = document.getElementById('freeGenPrompt')?.value?.trim();
  const galleryEl = document.getElementById('is-image-gallery');
  if (!galleryEl) return;
  if (!prompt) { showToast('请输入图片提示词', 'warning'); return; }

  galleryEl.innerHTML = `
    <div class="image-card" style="grid-column:1 / -1;background:transparent;border:1px dashed var(--color-border-secondary);cursor:default;">
      <div style="text-align:center;color:var(--color-primary-6);">
        <div class="typing-indicator" style="justify-content:center;margin-bottom:var(--space-2);"><span></span><span></span><span></span></div>
        <p style="font-size:var(--font-size-sm);">文生图 Agent 调度中：${freeGenState.ratio} | ${freeGenState.quality}...</p>
      </div>
    </div>
  `;

  setTimeout(() => {
    const ratio = FREE_GEN_SIZE_MAP[freeGenState.ratio];
    const isPortrait = ratio[1] > ratio[0];
    const imgUrl = isPortrait
      ? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'
      : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
    galleryEl.innerHTML = `
      <div class="image-card" style="grid-column:1/-1; height: 300px; border:none; background:transparent;">
        <img src="${imgUrl}" alt="Generated" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-lg);">
      </div>
      <div style="grid-column:1/-1;font-size:var(--font-size-sm);color:var(--color-text-secondary);text-align:center;padding:var(--space-2);">
        提示词：${escapeHtml(prompt.substring(0, 60))}${prompt.length > 60 ? '...' : ''} · ${freeGenState.ratio} · ${freeGenState.quality}
      </div>
    `;
  }, 2500);
}

let currentImageToolId = 'free-gen';

function initImageStudioV3() {
  const sidebar = document.getElementById('is-sidebar-menu');
  if (!sidebar) return;
  
  // Clear any existing placeholders
  const titleEl = sidebar.querySelector('div');
  sidebar.innerHTML = '';
  if (titleEl) sidebar.appendChild(titleEl);
  
  // Create menu items
  IMAGE_TOOLS.forEach(tool => {
    const item = document.createElement('div');
    item.className = 'is-menu-item' + (tool.id === currentImageToolId ? ' active' : '');
    item.style.cssText = 'padding:var(--space-3) var(--space-4);cursor:pointer;display:flex;align-items:center;gap:var(--space-3);transition:all var(--motion);';
    if (tool.id === currentImageToolId) {
      item.style.background = 'var(--color-primary-bg)';
      item.style.borderRight = '3px solid var(--color-primary-6)';
    } else {
      item.style.borderRight = '3px solid transparent';
    }
    item.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;background:${tool.bg};color:${tool.color};display:flex;align-items:center;justify-content:center;font-size:16px;">${tool.icon}</div>
      <div>
        <div style="font-weight:500;font-size:var(--font-size);color:${tool.id === currentImageToolId ? 'var(--color-primary-6)' : 'var(--color-text)'};">${tool.name}</div>
        <div style="font-size:11px;color:var(--color-text-tertiary);margin-top:2px;">${tool.desc}</div>
      </div>
    `;
    
    item.onclick = () => {
      document.querySelectorAll('#is-sidebar-menu .is-menu-item').forEach(el => {
        el.classList.remove('active');
        el.style.background = 'transparent';
        el.style.borderRight = '3px solid transparent';
        const txt = el.querySelector('div:nth-child(2) > div:first-child');
        if(txt) txt.style.color = 'var(--color-text)';
      });
      item.classList.add('active');
      item.style.background = 'var(--color-primary-bg)';
      item.style.borderRight = '3px solid var(--color-primary-6)';
      const txt = item.querySelector('div:nth-child(2) > div:first-child');
      if(txt) txt.style.color = 'var(--color-primary-6)';
      
      currentImageToolId = tool.id;
      renderImageToolWorkspace(tool);
    };
    
    sidebar.appendChild(item);
  });
  
  // Init first tool
  renderImageToolWorkspace(IMAGE_TOOLS[0]);
}

function renderImageToolWorkspace(tool) {
  const iconEl = document.getElementById('is-tool-icon');
  const titleEl = document.getElementById('is-tool-title');
  const descEl = document.getElementById('is-tool-desc');
  const configEl = document.getElementById('is-tool-config');
  const galleryEl = document.getElementById('is-image-gallery');
  
  if(iconEl) {
     iconEl.innerHTML = tool.icon;
     iconEl.style.background = tool.bg;
     iconEl.style.color = tool.color;
  }
  if(titleEl) titleEl.innerText = tool.name;
  if(descEl) descEl.innerText = tool.desc;
  if(configEl) {
     configEl.style.transition = 'opacity 0.2s';
     configEl.style.opacity = '0';
     setTimeout(() => {
        configEl.innerHTML = tool.config;
        configEl.style.opacity = '1';
     }, 100);
  }
  
  if(galleryEl) {
     galleryEl.innerHTML = `
      <div class="image-card" style="grid-column:1 / -1;background:transparent;border:1px dashed var(--color-border-secondary);cursor:default;">
        <div style="text-align:center;color:var(--color-text-tertiary);">
          <div style="font-size:32px;margin-bottom:var(--space-2);">🖼</div>
          <p style="font-size:var(--font-size-sm);">配置上方参数后，点击生成</p>
        </div>
      </div>
     `;
  }
}

window.mockImageGenerateV3 = function() {
  const galleryEl = document.getElementById('is-image-gallery');
  if(!galleryEl) return;
  
  galleryEl.innerHTML = `
    <div class="image-card" style="grid-column:1 / -1;background:transparent;border:1px dashed var(--color-border-secondary);cursor:default;">
      <div style="text-align:center;color:var(--color-primary-6);">
        <div class="typing-indicator" style="justify-content:center;margin-bottom:var(--space-2);"><span></span><span></span><span></span></div>
        <p style="font-size:var(--font-size-sm);">Agent 调度中：正在调用视觉模型...</p>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    galleryEl.innerHTML = `
      <div class="image-card" style="grid-column:1/-1; height: 300px; border:none; background:transparent;">
        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" alt="Generated Image" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-lg);">
      </div>
    `;
  }, 2000);
}

// Call init when script loads (or dom ready)
setTimeout(() => {
  initImageStudioV3();
}, 200);
