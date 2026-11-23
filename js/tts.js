/**
 * LLM Playground — Text-to-Speech Engine
 * Built-in Web Speech API with visualizer, word tracking, and state controls
 */

const TTSController = (() => {
  const synth = window.speechSynthesis;
  let voices = [];
  let currentUtterance = null;
  let isSpeaking = false;
  let isPaused = false;
  let visualizerAnimId = null;

  // DOM Elements cache
  let dom = {};

  function init(elements) {
    dom = elements;

    if (!('speechSynthesis' in window)) {
      if (dom.statusPill) {
        dom.statusPill.textContent = 'TTS Unsupported';
        dom.statusPill.className = 'playback-state-pill stopped';
      }
      return false;
    }

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    bindEvents();
    initVisualizer();
    updateTextStats();

    return true;
  }

  function loadVoices() {
    voices = synth.getVoices().sort((a, b) => a.name.localeCompare(b.name));
    if (!dom.voiceSelect) return;

    dom.voiceSelect.innerHTML = '';

    if (voices.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = 'Default System Voice';
      opt.value = '';
      dom.voiceSelect.appendChild(opt);
      return;
    }

    // Populate voice dropdown with language badges
    voices.forEach((v, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = `${v.name} (${v.lang})${v.default ? ' — Default' : ''}`;
      // Auto-select English or Google/Apple preferred voice if available
      if (v.default || (/en[-_]us/i.test(v.lang) && /natural|premium|google/i.test(v.name))) {
        opt.selected = true;
      }
      dom.voiceSelect.appendChild(opt);
    });
  }

  function bindEvents() {
    // Input listener for word count and reading time
    dom.textarea.addEventListener('input', () => {
      updateTextStats();
      if (isSpeaking) {
        stop();
      }
    });

    // Speed slider & display
    dom.rateRange.addEventListener('input', (e) => {
      dom.rateValue.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
      updateTextStats();
    });

    // Pitch slider & display
    dom.pitchRange.addEventListener('input', (e) => {
      dom.pitchValue.textContent = parseFloat(e.target.value).toFixed(1);
    });

    // Buttons
    dom.playBtn.addEventListener('click', play);
    dom.pauseBtn.addEventListener('click', pause);
    dom.resumeBtn.addEventListener('click', resume);
    dom.stopBtn.addEventListener('click', stop);
  }

  function updateTextStats() {
    const text = dom.textarea.value.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const rate = parseFloat(dom.rateRange.value) || 1.0;

    // Standard human speaking rate: ~140 WPM adjusted by speech rate multiplier
    const effectiveWpm = Math.max(50, 140 * rate);
    const totalSecs = Math.round((words / effectiveWpm) * 60);

    let readingTimeFormatted = '0s';
    if (totalSecs >= 60) {
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      readingTimeFormatted = `${mins}m ${secs}s`;
    } else {
      readingTimeFormatted = `${totalSecs}s`;
    }

    if (dom.wordCount) dom.wordCount.textContent = words;
    if (dom.charCount) dom.charCount.textContent = chars;
    if (dom.readingTime) dom.readingTime.textContent = readingTimeFormatted;

    // Enable/disable play button based on content
    dom.playBtn.disabled = words === 0;
  }

  function play() {
    const text = dom.textarea.value.trim();
    if (!text) return;

    // Cancel any pending speech
    synth.cancel();

    currentUtterance = new SpeechSynthesisUtterance(text);

    // Apply voice
    const selectedIndex = dom.voiceSelect.value;
    if (selectedIndex !== '' && voices[selectedIndex]) {
      currentUtterance.voice = voices[selectedIndex];
    }

    currentUtterance.rate = parseFloat(dom.rateRange.value) || 1.0;
    currentUtterance.pitch = parseFloat(dom.pitchRange.value) || 1.0;

    // Setup Karaoke display
    setupKaraoke(text);

    // Speech events
    currentUtterance.onstart = () => {
      isSpeaking = true;
      isPaused = false;
      updatePlaybackUI('playing');
      startVisualizer();
    };

    currentUtterance.onpause = () => {
      isPaused = true;
      updatePlaybackUI('paused');
      stopVisualizer();
    };

    currentUtterance.onresume = () => {
      isPaused = false;
      updatePlaybackUI('playing');
      startVisualizer();
    };

    currentUtterance.onend = () => {
      isSpeaking = false;
      isPaused = false;
      updatePlaybackUI('finished');
      stopVisualizer();
      clearKaraokeHighlight();
    };

    currentUtterance.onerror = (e) => {
      // If cancelled by user action, ignore error
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      isSpeaking = false;
      isPaused = false;
      updatePlaybackUI('stopped');
      stopVisualizer();
      console.warn('TTS Speech error:', e);
    };

    // Boundary event for real-time word highlighting
    currentUtterance.onboundary = (e) => {
      if (e.name === 'word') {
        highlightWordAtIndex(e.charIndex, e.charLength || 5);
      }
    };

    synth.speak(currentUtterance);
  }

  function pause() {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      isPaused = true;
      updatePlaybackUI('paused');
      stopVisualizer();
    }
  }

  function resume() {
    if (synth.paused) {
      synth.resume();
      isPaused = false;
      updatePlaybackUI('playing');
      startVisualizer();
    }
  }

  function stop() {
    synth.cancel();
    isSpeaking = false;
    isPaused = false;
    updatePlaybackUI('stopped');
    stopVisualizer();
    clearKaraokeHighlight();
  }

  function updatePlaybackUI(state) {
    if (!dom.statusPill) return;

    if (state === 'playing') {
      dom.statusPill.textContent = 'Speaking...';
      dom.statusPill.className = 'playback-state-pill playing';
      dom.playBtn.disabled = true;
      dom.pauseBtn.disabled = false;
      dom.resumeBtn.disabled = true;
      dom.stopBtn.disabled = false;
    } else if (state === 'paused') {
      dom.statusPill.textContent = 'Paused';
      dom.statusPill.className = 'playback-state-pill paused';
      dom.playBtn.disabled = true;
      dom.pauseBtn.disabled = true;
      dom.resumeBtn.disabled = false;
      dom.stopBtn.disabled = false;
    } else if (state === 'finished') {
      dom.statusPill.textContent = 'Finished';
      dom.statusPill.className = 'playback-state-pill stopped';
      dom.playBtn.disabled = false;
      dom.pauseBtn.disabled = true;
      dom.resumeBtn.disabled = true;
      dom.stopBtn.disabled = true;
    } else {
      dom.statusPill.textContent = 'Ready';
      dom.statusPill.className = 'playback-state-pill stopped';
      dom.playBtn.disabled = dom.textarea.value.trim().length === 0;
      dom.pauseBtn.disabled = true;
      dom.resumeBtn.disabled = true;
      dom.stopBtn.disabled = true;
    }
  }

  // Karaoke Spoken Text Viewer
  function setupKaraoke(text) {
    if (!dom.karaokeBox) return;
    dom.karaokeBox.innerHTML = '';
    dom.karaokeBox.classList.remove('hidden');

    const span = document.createElement('span');
    span.id = 'karaoke-text-content';
    span.textContent = text;
    dom.karaokeBox.appendChild(span);
  }

  function highlightWordAtIndex(charIndex, charLength) {
    const el = document.getElementById('karaoke-text-content');
    if (!el) return;

    const fullText = dom.textarea.value;
    const before = fullText.substring(0, charIndex);
    const word = fullText.substring(charIndex, charIndex + (charLength || 6));
    const after = fullText.substring(charIndex + (charLength || 6));

    el.innerHTML = `${escapeHtml(before)}<mark class="spoken-word">${escapeHtml(word)}</mark>${escapeHtml(after)}`;

    // Auto-scroll inside karaoke box
    const mark = el.querySelector('mark');
    if (mark && dom.karaokeBox) {
      mark.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function clearKaraokeHighlight() {
    const el = document.getElementById('karaoke-text-content');
    if (el) {
      el.innerHTML = escapeHtml(dom.textarea.value);
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Audio Canvas Visualizer
  function initVisualizer() {
    if (!dom.visualizerCanvas) return;
    const canvas = dom.visualizerCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 300;
    canvas.height = 70;

    // Draw idle state
    drawIdleVisualizer(ctx, canvas.width, canvas.height);
  }

  function drawIdleVisualizer(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    const bars = 36;
    const barWidth = width / bars - 3;
    for (let i = 0; i < bars; i++) {
      const x = i * (barWidth + 3);
      const h = 4;
      const y = (height - h) / 2;
      ctx.fillStyle = '#1e1e35';
      ctx.fillRect(x, y, barWidth, h);
    }
  }

  function startVisualizer() {
    if (!dom.visualizerCanvas) return;
    const canvas = dom.visualizerCanvas;
    const ctx = canvas.getContext('2d');

    let phase = 0;
    function render() {
      canvas.width = canvas.parentElement.clientWidth || 300;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const bars = 36;
      const barWidth = width / bars - 3;
      phase += 0.12;

      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + 3);
        // Dynamic sine wave frequency modulation
        const wave1 = Math.sin(phase + i * 0.35);
        const wave2 = Math.cos(phase * 0.8 + i * 0.2);
        const intensity = Math.abs(wave1 * 0.6 + wave2 * 0.4);
        const barHeight = Math.max(4, intensity * (height * 0.85));
        const y = (height - barHeight) / 2;

        // Gradient for each bar (electric blue to purple)
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#00d4ff');
        grad.addColorStop(0.5, '#4f7cff');
        grad.addColorStop(1, '#9b5cff');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, barWidth, barHeight, 3) : ctx.rect(x, y, barWidth, barHeight);
        ctx.fill();
      }

      visualizerAnimId = requestAnimationFrame(render);
    }

    cancelAnimationFrame(visualizerAnimId);
    render();
  }

  function stopVisualizer() {
    cancelAnimationFrame(visualizerAnimId);
    if (dom.visualizerCanvas) {
      const canvas = dom.visualizerCanvas;
      const ctx = canvas.getContext('2d');
      drawIdleVisualizer(ctx, canvas.width, canvas.height);
    }
  }

  return {
    init,
    play,
    pause,
    resume,
    stop,
    updateTextStats
  };
})();

