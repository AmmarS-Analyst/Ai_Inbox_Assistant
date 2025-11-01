const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize OpenAI client with Groq (or any OpenAI-compatible provider)
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
    // Fallback prompt if file not found
    return `You are an expert at extracting structured information from messages. Extract contact details (name, email, phone), channel, language, intent, priority (low/medium/high), entities (dates, amounts, locations), and generate a reply suggestion in the detected language (2-5 sentences). Return ONLY valid JSON.`;
  }
};

// Priority detection rule (applied before/after AI extraction)
const detectPriorityRule = (messageText) => {
  const text = messageText.toLowerCase();
  
  // High priority indicators
  if (/\b(urgent|asap|immediately|emergency|critical|urgente|عاجل|طارئ)\b/i.test(text)) {
    return 'high';
  }
  
  // Check for dates within next 48 hours
  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  
  // Simple date pattern matching (can be enhanced)
  const datePatterns = [
    /(today|tomorrow|الآن|اليوم|غدا)/i,
    /\b(\d{1,2})\/(\d{1,2})\b/, // MM/DD or DD/MM
    /\b(\d{1,2})-(\d{1,2})\b/,  // MM-DD or DD-MM
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

  // Ensure required fields exist
  if (!data.contact) data.contact = schema.contact;
  if (!data.channel) data.channel = schema.channel;
  if (!data.language) data.language = schema.language;
  if (!data.intent) data.intent = '';
  if (!data.priority) data.priority = 'low';
  if (!Array.isArray(data.entities)) data.entities = [];
  if (!data.reply_suggestion) data.reply_suggestion = '';

  // Validate channel
  const validChannels = ['email', 'whatsapp', 'sms', 'chat', 'unknown'];
  if (!validChannels.includes(data.channel)) {
    data.channel = 'unknown';
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(data.priority)) {
    data.priority = 'low';
  }

  // Ensure contact object has all fields
  if (!data.contact.name) data.contact.name = null;
  if (!data.contact.email) data.contact.email = null;
  if (!data.contact.phone) data.contact.phone = null;

  // Validate email format if present
  if (data.contact.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contact.email)) {
      data.contact.email = null;
    }
  }

  return data;
};

exports.extractTicket = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }

    // Apply rule-based priority detection first
    const ruleBasedPriority = detectPriorityRule(message);

    // Prepare AI prompt
    const systemPrompt = getExtractionPrompt();
    const userPrompt = `Extract fields from this message:\n\n${message}`;

    // Call AI API (works with both Groq and Ollama)
    const requestParams = {
      model: process.env.AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
    };

    // Ollama supports JSON mode, but some models need it specified differently
    if (process.env.AI_BASE_URL?.includes('localhost:11434')) {
      // For Ollama, ensure JSON format is requested in the prompt
      requestParams.response_format = { type: 'json_object' };
    } else {
      // For Groq/OpenAI, use standard JSON mode
      requestParams.response_format = { type: 'json_object' };
    }

    const completion = await client.chat.completions.create(requestParams);

    let extractedData;
    try {
      const aiResponse = completion.choices[0].message.content;
      extractedData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({
        error: 'Failed to parse AI response. Please try again.',
        details: parseError.message
      });
    }

    // Validate and normalize extracted data
    extractedData = validateExtractedData(extractedData);

    // Transform contact object to flat structure for database
    const flatData = {
      ...extractedData,
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

    // Apply priority rule: if rule-based is 'high', use it; otherwise use AI's priority if it's higher than rule-based
    if (ruleBasedPriority === 'high' || 
        (ruleBasedPriority === 'medium' && flatData.priority === 'low')) {
      flatData.priority = ruleBasedPriority;
    }

    // Remove nested contact object as we've flattened it
    delete flatData.contact;

    // Log which parts are rule-based vs AI-based
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
    
    if (error.response) {
      return res.status(500).json({
        error: 'AI API error',
        details: error.response.data || error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

