/**
 * LLM Playground — Client-Side API Manager
 * Enables manual user-entered API keys for Google Gemini, OpenAI, Groq, and OpenRouter.
 * 
 * IMPORTANT: No API keys are ever hardcoded in this codebase.
 * Keys are entered manually by the user in the UI and stored exclusively in browser localStorage.
 */

const APIManager = (() => {
  const STORAGE_KEYS = {
    PROVIDER: 'llm_playground_provider',
    API_KEY: 'llm_playground_api_key',
    MODEL: 'llm_playground_model',
    ENGINE_MODE: 'llm_playground_engine_mode' // 'heuristic' or 'ai'
  };

  const PROVIDER_DEFAULTS = {
    gemini: {
      name: 'Google Gemini',
      defaultModel: 'gemini-1.5-flash',
      models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
      placeholder: 'AIzaSy...',
      docsUrl: 'https://aistudio.google.com/app/apikey'
    },
    openai: {
      name: 'OpenAI',
      defaultModel: 'gpt-4o-mini',
      models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
      placeholder: 'sk-proj-...',
      docsUrl: 'https://platform.openai.com/api-keys'
    },
    groq: {
      name: 'Groq (Ultra-Fast)',
      defaultModel: 'llama-3.3-70b-versatile',
      models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
      placeholder: 'gsk_...',
      docsUrl: 'https://console.groq.com/keys'
    },
    openrouter: {
      name: 'OpenRouter',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct',
      models: ['meta-llama/llama-3.3-70b-instruct', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini'],
      placeholder: 'sk-or-v1-...',
      docsUrl: 'https://openrouter.ai/keys'
    }
  };

  function getSettings() {
    return {
      provider: localStorage.getItem(STORAGE_KEYS.PROVIDER) || 'gemini',
      apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
      model: localStorage.getItem(STORAGE_KEYS.MODEL) || '',
      engineMode: localStorage.getItem(STORAGE_KEYS.ENGINE_MODE) || 'heuristic'
    };
  }

  function saveSettings(provider, apiKey, model, engineMode) {
    if (provider) localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
    if (apiKey !== undefined) localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey.trim());
    if (model) localStorage.setItem(STORAGE_KEYS.MODEL, model);
    if (engineMode) localStorage.setItem(STORAGE_KEYS.ENGINE_MODE, engineMode);
  }

  function clearApiKey() {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }

  function hasApiKey() {
    const key = localStorage.getItem(STORAGE_KEYS.API_KEY);
    return Boolean(key && key.trim().length > 0);
  }

  /**
   * Test connection with user-provided API key
   */
  async function testConnection(provider, apiKey, model) {
    if (!apiKey) throw new Error('Please enter an API key first.');

    const activeModel = model || PROVIDER_DEFAULTS[provider]?.defaultModel;

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with "Connection Successful".' }] }]
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Gemini API returned HTTP ${res.status}`);
      }
      return true;
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `OpenAI API returned HTTP ${res.status}`);
      }
      return true;
    }

    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Groq API returned HTTP ${res.status}`);
      }
      return true;
    }

    if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin || 'http://localhost',
          'X-Title': 'LLM Playground'
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `OpenRouter API returned HTTP ${res.status}`);
      }
      return true;
    }

    throw new Error('Unsupported provider.');
  }

  /**
   * Send completion request to user's selected LLM provider
   */
  async function callLLM(systemPrompt, userPrompt) {
    const settings = getSettings();
    const { provider, apiKey, model } = settings;

    if (!apiKey) {
      throw new Error('No API key found. Please click "API Key" in the top bar to enter your key manually.');
    }

    const activeModel = model || PROVIDER_DEFAULTS[provider]?.defaultModel;

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1500
          }
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini API error (${res.status})`);
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    // OpenAI, Groq, OpenRouter share OpenAI-compatible chat completions endpoint
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    if (provider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    } else if (provider === 'openrouter') {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      headers['HTTP-Referer'] = window.location.origin || 'http://localhost';
      headers['X-Title'] = 'LLM Playground';
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `${provider} API error (${res.status})`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * AI-powered prompt improvement
   */
  async function improvePromptWithAI(rawPrompt) {
    const systemPrompt = `You are an elite LLM Prompt Architect and Meta-Prompt Engineer.
Your task is to take the user's raw prompt and transform it into a world-class, production-grade prompt.

Guidelines:
1. Preserve 100% of the user's original intent.
2. Structure the prompt into clean, distinct markdown sections:
   - ### Role & Persona (Define the exact expert archetype)
   - ### Primary Objective (Crisp, definitive task statement)
   - ### Context & Assumptions (Target audience, scenario, inputs)
   - ### Constraints & Guardrails (Negative constraints, length, what to avoid)
   - ### Desired Output Format (Exact schema, columns, or structure)
3. Eliminate vagueness, ambiguity, and fluff.
4. Output ONLY the improved prompt without introductory greetings, conversational chit-chat, or meta explanations.`;

    const userPrompt = `Transform this prompt into an optimal, production-ready version:\n\n"""\n${rawPrompt}\n"""`;
    return await callLLM(systemPrompt, userPrompt);
  }

  /**
   * OpenAI Neural Speech Synthesis (optional premium TTS if user entered an OpenAI key)
   */
  async function synthesizeSpeechOpenAI(text, voice = 'alloy', speed = 1.0) {
    const settings = getSettings();
    if (!settings.apiKey) throw new Error('API key required for Neural TTS');

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        speed: speed
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `TTS API error (${res.status})`);
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  return {
    PROVIDER_DEFAULTS,
    getSettings,
    saveSettings,
    clearApiKey,
    hasApiKey,
    testConnection,
    callLLM,
    improvePromptWithAI,
    synthesizeSpeechOpenAI
  };
})();

