// backend/src/controllers/aiController.js

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize OpenAI/Groq client
const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

// Load extraction prompt
const getExtractionPrompt = () => {
  try {
    const promptPath = path.join(__dirname, '../../prompts/extraction.md');
    return fs.readFileSync(promptPath, 'utf-8');
  } catch (error) {
    // fallback prompt
    return `You are an expert at extracting structured information from messages. Extract contact details (name, email, phone), channel, language, intent, priority (low/medium/high), entities (dates, amounts, locations), and generate a reply suggestion in the detected language (2-5 sentences). Return ONLY valid JSON.`;
  }
};

// Rule-based priority detection
const detectPriorityRule = (messageText) => {
  const text = messageText.toLowerCase();

  if (/\b(urgent|asap|immediately|emergency|critical|urgente|عاجل|طارئ)\b/i.test(text)) {
    return 'high';
  }

  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const datePatterns = [
    /(today|tomorrow|الآن|اليوم|غدا)/i,
    /\b(\d{1,2})\/(\d{1,2})\b/,
    /\b(\d{1,2})-(\d{1,2})\b/,
  ];

  for (const pattern of datePatterns) {
    if (pattern.test(text)) {
      return 'medium';
    }
  }

  return 'low';
};

// Validate extracted JSON structure
const validateExtractedData = (data) => {
  const schema = {
    contact: { name: null, email: null, phone: null },
    channel: 'unknown',
    language: 'en',
    intent: '',
    priority: 'low',
    entities: [],
    reply_suggestion: ''
  };

  if (!data.contact) data.contact = schema.contact;
  if (!data.channel) data.channel = schema.channel;
  if (!data.language) data.language = schema.language;
  if (!data.intent) data.intent = '';
  if (!data.priority) data.priority = 'low';
  if (!Array.isArray(data.entities)) data.entities = [];
  if (!data.reply_suggestion) data.reply_suggestion = '';

  const validChannels = ['email', 'whatsapp', 'sms', 'chat', 'unknown'];
  if (!validChannels.includes(data.channel)) data.channel = 'unknown';

  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(data.priority)) data.priority = 'low';

  if (!data.contact.name) data.contact.name = null;
  if (!data.contact.email) data.contact.email = null;
  if (!data.contact.phone) data.contact.phone = null;

  if (data.contact.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contact.email)) data.contact.email = null;
  }

  return data;
};

// Main extraction controller
exports.extractTicket = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
    }

    const ruleBasedPriority = detectPriorityRule(message);
    const systemPrompt = getExtractionPrompt();
    const userPrompt = `Extract fields from this message:\n\n${message}`;

    const requestParams = {
      model: process.env.AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    };

    console.log(`Calling AI provider: Groq/OpenAI model=${process.env.AI_MODEL}`);
    const startTs = Date.now();

    const completion = await client.chat.completions.create(requestParams);
    const duration = Date.now() - startTs;
    console.log(`AI provider responded in ${duration}ms`);

    // Parse AI response
    let extractedData;
    try {
      const choice = completion?.choices?.[0];
      let aiResponse = choice?.message?.content || choice?.content || completion;

      if (typeof aiResponse === 'string') {
        extractedData = JSON.parse(aiResponse);
      } else {
        extractedData = aiResponse;
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI response', details: parseError.message });
    }

    extractedData = validateExtractedData(extractedData);

    // Flatten contact object for DB
    const flatData = {
      contact_name: extractedData.contact?.name || null,
      contact_email: extractedData.contact?.email || null,
      contact_phone: extractedData.contact?.phone || null,
      channel: extractedData.channel || 'unknown',
      language: extractedData.language || 'en',
      intent: extractedData.intent || '',
      priority: extractedData.priority || 'low',
      entities: Array.isArray(extractedData.entities) ? extractedData.entities : [],
      message_raw: message,
      reply_suggestion: extractedData.reply_suggestion || ''
    };

    // Apply rule-based priority override
    if (ruleBasedPriority === 'high' || (ruleBasedPriority === 'medium' && flatData.priority === 'low')) {
      flatData.priority = ruleBasedPriority;
    }

    console.log(`Priority: ${flatData.priority} (Rule-based: ${ruleBasedPriority}, AI: ${extractedData.priority})`);

    res.json({
      success: true,
      data: flatData,
      metadata: {
        priority_source: ruleBasedPriority === 'high' ? 'rule-based' : 'ai-based',
        rule_based_priority: ruleBasedPriority
      }
    });

  } catch (error) {
    console.error('Error in extractTicket:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
