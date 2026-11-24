/**
 * LLM Playground — Main Application Controller
 * Handles views, API key configuration, AI integrations, preset templates, and tool switching.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation tabs
  const tabAnalyzer = document.getElementById('tab-analyzer');
  const tabTTS = document.getElementById('tab-tts');
  const viewAnalyzer = document.getElementById('view-analyzer');
  const viewTTS = document.getElementById('view-tts');

  // Analyzer DOM elements
  const promptInput = document.getElementById('prompt-input');
  const promptWordCount = document.getElementById('prompt-word-count');
  const promptCharCount = document.getElementById('prompt-char-count');
  const promptTokenCount = document.getElementById('prompt-token-count');
  const scoreNumber = document.getElementById('score-number');
  const scoreGauge = document.getElementById('score-gauge-circle');
  const scoreBadge = document.getElementById('score-badge');
  const suggestionsList = document.getElementById('suggestions-list');
  const btnImprove = document.getElementById('btn-improve');
  const btnClearPrompt = document.getElementById('btn-clear-prompt');
  const improvedCard = document.getElementById('improved-card');
  const improvedOutput = document.getElementById('improved-output');
  const btnCopyImproved = document.getElementById('btn-copy-improved');
  const btnApplyImproved = document.getElementById('btn-apply-improved');
  const engineBtnHeuristic = document.getElementById('engine-btn-heuristic');
  const engineBtnAi = document.getElementById('engine-btn-ai');
  const improveEngineHint = document.getElementById('improve-engine-hint');

  // Pillar DOM elements
  const pillarGoal = document.getElementById('pillar-goal');
  const pillarContext = document.getElementById('pillar-context');
  const pillarConstraints = document.getElementById('pillar-constraints');
  const pillarFormat = document.getElementById('pillar-format');

  // API Modal DOM elements
  const btnOpenApiModal = document.getElementById('btn-open-api-modal');
  const modalApi = document.getElementById('modal-api');
  const btnCloseApiModal = document.getElementById('btn-close-api-modal');
  const apiProviderSelect = document.getElementById('api-provider-select');
  const apiKeyInput = document.getElementById('api-key-input');
  const apiModelSelect = document.getElementById('api-model-select');
  const apiDocsLink = document.getElementById('api-docs-link');
  const btnToggleKeyVisibility = document.getElementById('btn-toggle-key-visibility');
  const eyeIcon = document.getElementById('eye-icon');
  const btnTestConnection = document.getElementById('btn-test-connection');
  const btnSaveKey = document.getElementById('btn-save-key');
  const btnClearKey = document.getElementById('btn-clear-key');
  const testConnectionStatus = document.getElementById('test-connection-status');
  const headerApiLabel = document.getElementById('header-api-label');
  const headerApiDot = document.getElementById('header-api-dot');

  // TTS DOM elements
  const ttsInput = document.getElementById('tts-input');
  const ttsVoiceSelect = document.getElementById('tts-voice-select');
  const ttsRateRange = document.getElementById('tts-rate-range');
  const ttsRateValue = document.getElementById('tts-rate-value');
  const ttsPitchRange = document.getElementById('tts-pitch-range');
  const ttsPitchValue = document.getElementById('tts-pitch-value');
  const btnTtsPlay = document.getElementById('btn-tts-play');
  const btnTtsPause = document.getElementById('btn-tts-pause');
  const btnTtsResume = document.getElementById('btn-tts-resume');
  const btnTtsStop = document.getElementById('btn-tts-stop');
  const ttsStatusPill = document.getElementById('tts-status-pill');
  const ttsWordCount = document.getElementById('tts-word-count');
  const ttsCharCount = document.getElementById('tts-char-count');
  const ttsReadingTime = document.getElementById('tts-reading-time');
  const ttsCanvas = document.getElementById('tts-visualizer-canvas');
  const karaokeBox = document.getElementById('tts-karaoke-box');
  const btnClearTts = document.getElementById('btn-clear-tts');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // Active engine mode ('heuristic' or 'ai')
  let activeEngineMode = APIManager.getSettings().engineMode || 'heuristic';

  // ── 1. PRESET TEMPLATES ──────────────────────────────────────
  const PROMPT_PRESETS = {
    vague: "write me a python script to parse logs and send alerts",
    codeReview: "Act as a Senior DevOps Architect. Review this Kubernetes ingress configuration for security risks, certificate management, and traffic throttling. Strict constraints: do not recommend proprietary vendors, keep recommendations cloud-agnostic. Output a structured markdown report with high, medium, and low severity findings and a remediation code snippet.",
    supportEmail: "You are a customer success specialist for an enterprise cloud platform. Draft an email reply to a customer whose database backup failed during a scheduled maintenance window. Tone must be empathetic, reassuring, yet technically transparent. Avoid jargon that confuses non-technical managers. Include next steps in bullet points.",
    dataAnalysis: "Analyze the provided quarterly sales dataset. Identify revenue trends, top-performing product categories, and sudden customer churn anomalies. Return the findings in a Markdown table with columns: Category, Q3 Growth, Churn Rate %, and Key Driver, followed by 3 actionable growth recommendations."
  };

  const TTS_PRESETS = {
    overview: "Welcome to the LLM Playground. This unified workspace gives engineers and prompt designers real-time heuristic intelligence to craft high-clarity instructions, paired with instant client-side speech synthesis.",
    agentPrompt: "System Directive: You are an autonomous code verification agent. Always examine error boundaries, validate edge cases, and execute unit tests before committing changes. Maintain zero regression tolerance.",
    releaseNotes: "LLM Playground 2.0 is live. Features include real-time clarity evaluation, objective and constraint verification, instant prompt restructuring, and Web Speech audio playback with animated frequency waveforms."
  };

  // ── 2. VIEW SWITCHING ────────────────────────────────────────
  function switchView(viewName) {
    if (viewName === 'tts') {
      tabAnalyzer.classList.remove('active');
      tabAnalyzer.setAttribute('aria-selected', 'false');
      tabTTS.classList.add('active');
      tabTTS.setAttribute('aria-selected', 'true');

      viewAnalyzer.classList.add('hidden');
      viewTTS.classList.remove('hidden');
      TTSController.updateTextStats();
    } else {
      tabTTS.classList.remove('active');
      tabTTS.setAttribute('aria-selected', 'false');
      tabAnalyzer.classList.add('active');
      tabAnalyzer.setAttribute('aria-selected', 'true');

      viewTTS.classList.add('hidden');
      viewAnalyzer.classList.remove('hidden');
      runPromptAnalysis();
    }
  }

  tabAnalyzer.addEventListener('click', () => switchView('analyzer'));
  tabTTS.addEventListener('click', () => switchView('tts'));

  // ── 3. API CONFIGURATION MODAL & KEY MANAGEMENT ─────────────
  function updateHeaderApiStatus() {
    const settings = APIManager.getSettings();
    const hasKey = APIManager.hasApiKey();

    if (hasKey) {
      const providerMeta = APIManager.PROVIDER_DEFAULTS[settings.provider] || { name: settings.provider };
      headerApiLabel.textContent = `API: ${providerMeta.name}`;
      headerApiDot.className = 'status-dot-mini active';
      headerApiDot.title = 'API Key Connected';
    } else {
      headerApiLabel.textContent = 'API Key: Local';
      headerApiDot.className = 'status-dot-mini inactive';
      headerApiDot.title = 'No API Key — Local Heuristic Mode';
    }
  }

  function populateModelOptions(provider, selectedModel) {
    const config = APIManager.PROVIDER_DEFAULTS[provider];
    if (!config) return;

    apiModelSelect.innerHTML = '';
    config.models.forEach(modelName => {
      const opt = document.createElement('option');
      opt.value = modelName;
      opt.textContent = modelName;
      if (modelName === selectedModel || (!selectedModel && modelName === config.defaultModel)) {
        opt.selected = true;
      }
      apiModelSelect.appendChild(opt);
    });

    apiKeyInput.placeholder = config.placeholder || 'Enter API Key...';
    apiDocsLink.href = config.docsUrl || '#';
  }

  function openApiModal() {
    const settings = APIManager.getSettings();
    apiProviderSelect.value = settings.provider || 'gemini';
    apiKeyInput.value = settings.apiKey || '';
    populateModelOptions(settings.provider, settings.model);
    testConnectionStatus.style.display = 'none';

    modalApi.classList.add('open');
    apiKeyInput.focus();
  }

  function closeApiModal() {
    modalApi.classList.remove('open');
  }

  btnOpenApiModal.addEventListener('click', openApiModal);
  btnCloseApiModal.addEventListener('click', closeApiModal);

  // Close modal on click outside
  modalApi.addEventListener('click', (e) => {
    if (e.target === modalApi) closeApiModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalApi.classList.contains('open')) {
      closeApiModal();
    }
  });

  // Provider changed in modal
  apiProviderSelect.addEventListener('change', () => {
    populateModelOptions(apiProviderSelect.value, '');
  });

  // Toggle key visibility
  btnToggleKeyVisibility.addEventListener('click', () => {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    eyeIcon.innerHTML = isPassword
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
  });

  // Test Connection
  btnTestConnection.addEventListener('click', async () => {
    const provider = apiProviderSelect.value;
    const key = apiKeyInput.value.trim();
    const model = apiModelSelect.value;

    if (!key) {
      testConnectionStatus.style.display = 'flex';
      testConnectionStatus.style.background = 'rgba(255, 68, 102, 0.15)';
      testConnectionStatus.style.color = 'var(--clr-crimson)';
      testConnectionStatus.textContent = 'Please enter an API key first.';
      return;
    }

    testConnectionStatus.style.display = 'flex';
    testConnectionStatus.style.background = 'rgba(79, 124, 255, 0.15)';
    testConnectionStatus.style.color = 'var(--clr-cyan)';
    testConnectionStatus.innerHTML = `<span class="spinner-icon">⚙</span> Testing connection with ${provider}...`;

    btnTestConnection.disabled = true;

    try {
      await APIManager.testConnection(provider, key, model);
      testConnectionStatus.style.background = 'rgba(0, 230, 153, 0.15)';
      testConnectionStatus.style.color = 'var(--clr-emerald)';
      testConnectionStatus.textContent = `✓ Connection verified successfully with ${model}!`;
    } catch (err) {
      testConnectionStatus.style.background = 'rgba(255, 68, 102, 0.15)';
      testConnectionStatus.style.color = 'var(--clr-crimson)';
      testConnectionStatus.textContent = `✗ ${err.message}`;
    } finally {
      btnTestConnection.disabled = false;
    }
  });

  // Save Settings
  btnSaveKey.addEventListener('click', () => {
    const provider = apiProviderSelect.value;
    const key = apiKeyInput.value.trim();
    const model = apiModelSelect.value;

    APIManager.saveSettings(provider, key, model, activeEngineMode);
    updateHeaderApiStatus();
    closeApiModal();

    if (key) {
      showToast(`Saved API settings for ${APIManager.PROVIDER_DEFAULTS[provider]?.name || provider}`);
      setEngineMode('ai');
    } else {
      showToast('Settings saved (No API key stored)');
    }
  });

  // Clear Key
  btnClearKey.addEventListener('click', () => {
    APIManager.clearApiKey();
    apiKeyInput.value = '';
    updateHeaderApiStatus();
    testConnectionStatus.style.display = 'none';
    setEngineMode('heuristic');
    showToast('API key removed from local browser storage');
  });

  // Engine Mode Switcher
  function setEngineMode(mode) {
    activeEngineMode = mode;
    APIManager.saveSettings(null, undefined, null, mode);

    if (mode === 'ai') {
      engineBtnAi.classList.add('active');
      engineBtnHeuristic.classList.remove('active');
      const settings = APIManager.getSettings();
      const provName = APIManager.PROVIDER_DEFAULTS[settings.provider]?.name || 'LLM';
      improveEngineHint.textContent = `Live AI Model restructuring enabled (${provName}).`;
    } else {
      engineBtnHeuristic.classList.add('active');
      engineBtnAi.classList.remove('active');
      improveEngineHint.textContent = `Instant heuristic structuring (no API key required).`;
    }
  }

  engineBtnHeuristic.addEventListener('click', () => setEngineMode('heuristic'));
  engineBtnAi.addEventListener('click', () => {
    if (!APIManager.hasApiKey()) {
      showToast('Enter your API key manually in Settings to enable Live AI generation');
      openApiModal();
      return;
    }
    setEngineMode('ai');
  });

  // ── 4. PROMPT ANALYZER LOGIC ─────────────────────────────────
  let lastAnalysis = null;

  function runPromptAnalysis() {
    const text = promptInput.value;
    const analysis = PromptAnalyzer.analyzePrompt(text);
    lastAnalysis = analysis;

    // Update stats ribbon
    promptWordCount.textContent = analysis.stats.words;
    promptCharCount.textContent = analysis.stats.chars;
    promptTokenCount.textContent = analysis.stats.tokens;

    // Update circular SVG gauge
    const circumference = 213.6;
    const offset = circumference - (analysis.score / 100) * circumference;
    scoreGauge.style.strokeDashoffset = offset;
    scoreNumber.textContent = analysis.score;

    // Gauge stroke color mapping
    if (analysis.score >= 85) {
      scoreGauge.style.stroke = '#00e699'; // Emerald
    } else if (analysis.score >= 65) {
      scoreGauge.style.stroke = '#00d4ff'; // Cyan
    } else if (analysis.score >= 40) {
      scoreGauge.style.stroke = '#ffb300'; // Amber
    } else {
      scoreGauge.style.stroke = '#ff4466'; // Crimson
    }

    // Score badge pill
    scoreBadge.textContent = analysis.grade;
    scoreBadge.className = `score-badge-pill ${analysis.gradeClass}`;

    // Update 4 Pillars
    updatePillarUI(pillarGoal, analysis.pillars.goal);
    updatePillarUI(pillarContext, analysis.pillars.context);
    updatePillarUI(pillarConstraints, analysis.pillars.constraints);
    updatePillarUI(pillarFormat, analysis.pillars.format);

    // Update Suggestions
    suggestionsList.innerHTML = '';
    analysis.suggestions.forEach(s => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.innerHTML = `<span class="suggestion-bullet">✦</span> <span>${escapeHtml(s)}</span>`;
      suggestionsList.appendChild(li);
    });

    // Toggle button state
    btnImprove.disabled = analysis.stats.words === 0;
  }

  function updatePillarUI(element, pillarData) {
    if (!element) return;
    const iconContainer = element.querySelector('.pillar-status-icon');
    const stateLabel = element.querySelector('.pillar-state-label');
    const desc = element.querySelector('.pillar-desc');

    iconContainer.className = `pillar-status-icon ${pillarData.status}`;

    if (pillarData.status === 'check') {
      iconContainer.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>`;
      stateLabel.style.color = '#00e699';
    } else if (pillarData.status === 'warn') {
      iconContainer.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8.22 1.754a.75.75 0 00-1.44 0L1.68 13.5A.75.75 0 002.399 14.5h11.202a.75.75 0 00.719-1.001L9.12 1.754zm-.22 4.496a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zm0 6a.875.875 0 100-1.75.875.875 0 000 1.75z"/></svg>`;
      stateLabel.style.color = '#ffb300';
    } else {
      iconContainer.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg>`;
      stateLabel.style.color = '#ff4466';
    }

    stateLabel.textContent = pillarData.label;
    desc.textContent = pillarData.desc;
  }

  // Real-time listener
  promptInput.addEventListener('input', runPromptAnalysis);

  // Improve Prompt Click (Dual Mode: Live AI Model or Instant Heuristic)
  btnImprove.addEventListener('click', async () => {
    const raw = promptInput.value.trim();
    if (!raw) return;

    if (activeEngineMode === 'ai' && APIManager.hasApiKey()) {
      // AI Mode via user's API Key
      const originalHTML = btnImprove.innerHTML;
      btnImprove.disabled = true;
      btnImprove.innerHTML = `
        <svg class="spinner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
        </svg>
        Generating with AI...
      `;

      try {
        const aiImproved = await APIManager.improvePromptWithAI(raw);
        improvedOutput.textContent = aiImproved;
        improvedCard.classList.remove('hidden');
        improvedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        showToast('Prompt restructured with AI!');
      } catch (err) {
        showToast(`AI generation error: ${err.message}`);
        // Fallback to heuristic
        if (lastAnalysis && lastAnalysis.improvedPrompt) {
          improvedOutput.textContent = lastAnalysis.improvedPrompt;
          improvedCard.classList.remove('hidden');
          showToast('Loaded heuristic framework as fallback');
        }
      } finally {
        btnImprove.disabled = false;
        btnImprove.innerHTML = originalHTML;
      }
    } else {
      // Local Heuristic Mode (Instant & Offline)
      if (activeEngineMode === 'ai' && !APIManager.hasApiKey()) {
        showToast('No API key entered. Enter your key or use Instant Local mode.');
        openApiModal();
        return;
      }

      if (!lastAnalysis || !lastAnalysis.improvedPrompt) return;
      improvedOutput.textContent = lastAnalysis.improvedPrompt;
      improvedCard.classList.remove('hidden');
      improvedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showToast('Prompt improved and structured!');
    }
  });

  // Copy Improved Prompt
  btnCopyImproved.addEventListener('click', async () => {
    const text = improvedOutput.textContent;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied improved prompt to clipboard!');
    } catch {
      fallbackCopy(text);
    }
  });

  // Apply Improved Prompt directly back to editor
  btnApplyImproved.addEventListener('click', () => {
    const text = improvedOutput.textContent;
    if (!text) return;
    promptInput.value = text;
    runPromptAnalysis();
    showToast('Applied improved version to editor');
  });

  // Clear Prompt
  btnClearPrompt.addEventListener('click', () => {
    promptInput.value = '';
    improvedCard.classList.add('hidden');
    runPromptAnalysis();
  });

  // Prompt Preset buttons
  document.querySelectorAll('[data-prompt-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-prompt-preset');
      if (PROMPT_PRESETS[key]) {
        promptInput.value = PROMPT_PRESETS[key];
        runPromptAnalysis();
        showToast(`Loaded ${btn.textContent.trim()} preset`);
      }
    });
  });

  // ── 5. TEXT TO SPEECH INITIALIZATION ─────────────────────────
  TTSController.init({
    textarea: ttsInput,
    voiceSelect: ttsVoiceSelect,
    rateRange: ttsRateRange,
    rateValue: ttsRateValue,
    pitchRange: ttsPitchRange,
    pitchValue: ttsPitchValue,
    playBtn: btnTtsPlay,
    pauseBtn: btnTtsPause,
    resumeBtn: btnTtsResume,
    stopBtn: btnTtsStop,
    statusPill: ttsStatusPill,
    wordCount: ttsWordCount,
    charCount: ttsCharCount,
    readingTime: ttsReadingTime,
    visualizerCanvas: ttsCanvas,
    karaokeBox: karaokeBox
  });

  // TTS Preset buttons
  document.querySelectorAll('[data-tts-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-tts-preset');
      if (TTS_PRESETS[key]) {
        ttsInput.value = TTS_PRESETS[key];
        TTSController.updateTextStats();
        showToast(`Loaded sample text`);
      }
    });
  });

  // Clear TTS
  btnClearTts.addEventListener('click', () => {
    TTSController.stop();
    ttsInput.value = '';
    TTSController.updateTextStats();
  });

  // Speed Quick Presets
  document.querySelectorAll('[data-speed-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = btn.getAttribute('data-speed-preset');
      ttsRateRange.value = speed;
      ttsRateValue.textContent = `${parseFloat(speed).toFixed(1)}x`;
      TTSController.updateTextStats();
    });
  });

  // ── 6. TOAST NOTIFICATIONS HELPER ────────────────────────────
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="#00d4ff">
        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
      </svg>
      <span>${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  function fallbackCopy(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
    showToast('Copied to clipboard!');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ── 7. INITIAL STARTUP ───────────────────────────────────────
  updateHeaderApiStatus();
  setEngineMode(activeEngineMode);
  runPromptAnalysis();
});
