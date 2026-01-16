const axios = require('axios');

class LLMService {
  static async summarize(content, provider = null) {
    const llmProvider = provider || process.env.LLM_PROVIDER;

    if (llmProvider === 'openai') {
      return this.summarizeWithOpenAI(content);
    } else if (llmProvider === 'gemini') {
      return this.summarizeWithGemini(content);
    } else {
      return this.mockSummary(content);
    }
  }

  static async summarizeWithOpenAI(content) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return this.mockSummary(content);
      }

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a concise summarization assistant. Provide a 2-3 sentence summary of the given text.'
          },
          {
            role: 'user',
            content: `Please summarize this article:\n\n${content}`
          }
        ],
        max_tokens: 150
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI summarization error:', error.message);
      return this.mockSummary(content);
    }
  }

  static async summarizeWithGemini(content) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return this.mockSummary(content);
      }

      // Build model and endpoint (allow override via GEMINI_MODEL)
      const model = process.env.GEMINI_MODEL || 'gemini-pro';
      const url = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const body = {
        prompt: {
          text: `Please provide a concise 2-3 sentence summary of this article:\n\n${content}`
        },
        temperature: 0.2,
        maxOutputTokens: 256
      };

      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Robust parsing: support a few possible response shapes
      const data = response.data || {};
      const candidates = data.candidates || data.candidate || [];

      if (candidates.length > 0) {
        // Try common fields
        const first = candidates[0];
        return first.output || first.content || first.text || (first?.message?.content) || JSON.stringify(first);
      }

      // Fallback: try nested paths used by other versions
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      // If nothing matched, return mock summary
      console.warn('Gemini response shape unexpected:', Object.keys(data));
      return this.mockSummary(content);
    } catch (error) {
      // Log full response when available to aid debugging
      if (error.response) {
        console.error('Gemini summarization error:', error.response.status, error.response.data);
      } else {
        console.error('Gemini summarization error:', error.message);
      }
      return this.mockSummary(content);
    }
  }

  static mockSummary(content) {
    // Simple mock summarization for testing without API keys
    const sentences = content.split('.').filter(s => s.trim());
    const summary = sentences
      .slice(0, 2)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .join('. ');
    
    return `${summary}${summary ? '.' : ''}`;
  }
}

module.exports = LLMService;
