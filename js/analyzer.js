/**
 * LLM Playground — Prompt Analyzer Engine
 * Comprehensive heuristic evaluation for LLM prompt engineering
 */

const PromptAnalyzer = (() => {
  // Common action verbs denoting a clear goal
  const ACTION_VERBS = [
    'create', 'write', 'generate', 'explain', 'summarize', 'analyze', 'evaluate',
    'build', 'develop', 'refactor', 'debug', 'review', 'compare', 'contrast',
    'extract', 'translate', 'classify', 'rank', 'design', 'synthesize', 'calculate',
    'simulate', 'draft', 'solve', 'recommend', 'audit', 'plan', 'list', 'identify'
  ];

  // Context indicators
  const CONTEXT_PATTERNS = [
    /context/i, /background/i, /scenario/i, /given/i, /assuming/i, /situation/i,
    /for example/i, /e\.g\./i, /i am a/i, /we are/i, /our company/i, /the target audience/i,
    /acting as/i, /role:/i, /you are an? (expert|specialist|engineer|consultant|assistant)/i,
    /project/i, /domain/i, /database/i, /codebase/i, /system/i, /dataset/i, /here is the/i
  ];

  // Constraints indicators
  const CONSTRAINT_PATTERNS = [
    /do not/i, /don't/i, /avoid/i, /never/i, /must not/i, /ensure/i, /restrict/i,
    /limit/i, /under \d+/i, /max(imum)?/i, /min(imum)?/i, /at most/i, /at least/i,
    /strictly/i, /only (use|return|output|include)/i, /without/i, /no (markdown|fluff|preamble|code)/i,
    /keep it (concise|brief|short)/i, /tone:/i, /in english/i, /rules?:/i, /constraints?:/i
  ];

  // Output format indicators
  const FORMAT_PATTERNS = [
    /json/i, /markdown/i, /table/i, /bullet points?/i, /numbered list/i, /csv/i,
    /yaml/i, /xml/i, /schema/i, /step-by-step/i, /code snippet/i, /plain text/i,
    /format:/i, /output format/i, /structure:/i, /template:/i, /headings?/i,
    /return as/i, /respond in/i, /columns?/i, /rows?/i
  ];

  /**
   * Calculate basic statistics of input text
   */
  function getStats(text) {
    const raw = text.trim();
    if (!raw) {
      return { words: 0, chars: 0, tokens: 0, readingTimeSec: 0 };
    }
    const words = raw.split(/\s+/).filter(Boolean).length;
    const chars = raw.length;
    // Approximating OpenAI / Claude tokens (~1.3 tokens per English word)
    const tokens = Math.round(words * 1.33);
    // Estimated reading time at ~200 WPM
    const readingTimeSec = Math.max(1, Math.round((words / 200) * 60));

    return { words, chars, tokens, readingTimeSec };
  }

  /**
   * Deep analysis of prompt pillars
   */
  function analyzePrompt(prompt) {
    const text = prompt.trim();
    const stats = getStats(text);

    if (stats.words === 0) {
      return {
        stats,
        score: 0,
        grade: 'Empty',
        gradeClass: 'poor',
        pillars: {
          goal: { status: 'cross', label: 'Missing Goal', desc: 'Specify an explicit task or action verb.' },
          context: { status: 'cross', label: 'Missing Context', desc: 'Provide background information or user scenario.' },
          constraints: { status: 'cross', label: 'Missing Constraints', desc: 'Set boundaries, length limits, or style rules.' },
          format: { status: 'cross', label: 'Missing Output Format', desc: 'Clarify desired structure (e.g. JSON, table, steps).' }
        },
        suggestions: ['Enter or paste your prompt to start real-time evaluation.'],
        improvedPrompt: ''
      };
    }

    // 1. Goal Check
    const lowerText = text.toLowerCase();
    const hasActionVerb = ACTION_VERBS.some(v => new RegExp(`\\b${v}\\b`, 'i').test(lowerText));
    const isQuestion = /\?$/.test(text) || /^(how|what|why|where|when|can you|could you)\b/i.test(text);
    let goalScore = 0;
    let goalStatus = 'cross';
    let goalLabel = 'Goal Missing';
    let goalDesc = 'Add a definitive action verb like "Build", "Explain", "Analyze", or "Extract".';

    if (hasActionVerb && (stats.words >= 8 || text.length > 40)) {
      goalScore = 100;
      goalStatus = 'check';
      goalLabel = 'Clear Objective';
      goalDesc = 'Clear action verb and target subject identified.';
    } else if (hasActionVerb || isQuestion) {
      goalScore = 60;
      goalStatus = 'warn';
      goalLabel = 'Basic Goal';
      goalDesc = 'Goal detected, but could be much more specific and definitive.';
    }

    // 2. Context Check
    const contextMatches = CONTEXT_PATTERNS.filter(p => p.test(text)).length;
    let contextScore = 0;
    let contextStatus = 'cross';
    let contextLabel = 'Context Missing';
    let contextDesc = 'Give the LLM background information, domain context, or target persona.';

    if (contextMatches >= 2 || (contextMatches >= 1 && stats.words >= 25)) {
      contextScore = 100;
      contextStatus = 'check';
      contextLabel = 'Rich Context';
      contextDesc = 'Good situational background and domain framing provided.';
    } else if (contextMatches === 1 || stats.words >= 35) {
      contextScore = 55;
      contextStatus = 'warn';
      contextLabel = 'Limited Context';
      contextDesc = 'Some background detected, but adding user persona or scenario will improve output.';
    }

    // 3. Constraints Check
    const constraintMatches = CONSTRAINT_PATTERNS.filter(p => p.test(text)).length;
    let constraintScore = 0;
    let constraintStatus = 'cross';
    let constraintLabel = 'Constraints Missing';
    let constraintDesc = 'Define boundaries, what to avoid, length bounds, or tone guidelines.';

    if (constraintMatches >= 2) {
      constraintScore = 100;
      constraintStatus = 'check';
      constraintLabel = 'Strong Guardrails';
      constraintDesc = 'Clear constraints and negative prompts provided.';
    } else if (constraintMatches === 1) {
      constraintScore = 60;
      constraintStatus = 'warn';
      constraintLabel = 'Moderate Constraints';
      constraintDesc = 'One constraint found; consider adding length limits or things to avoid.';
    }

    // 4. Output Format Check
    const formatMatches = FORMAT_PATTERNS.filter(p => p.test(text)).length;
    let formatScore = 0;
    let formatStatus = 'cross';
    let formatLabel = 'Format Unspecified';
    let formatDesc = 'Specify response structure: Markdown table, JSON, bullet points, or code.';

    if (formatMatches >= 2) {
      formatScore = 100;
      formatStatus = 'check';
      formatLabel = 'Explicit Format';
      formatDesc = 'Structural and output guidelines are clearly defined.';
    } else if (formatMatches === 1) {
      formatScore = 70;
      formatStatus = 'warn';
      formatLabel = 'Basic Format Hint';
      formatDesc = 'Format mentioned; consider specifying schema or exact headers.';
    }

    // Aggregate weighted score
    // Goal: 30%, Context: 25%, Constraints: 20%, Format: 25%
    let rawScore = Math.round(
      (goalScore * 0.30) +
      (contextScore * 0.25) +
      (constraintScore * 0.20) +
      (formatScore * 0.25)
    );

    // Vagueness penalty for very short prompts
    if (stats.words < 6) {
      rawScore = Math.min(rawScore, 30);
    } else if (stats.words < 12) {
      rawScore = Math.min(rawScore, 55);
    }

    const score = Math.max(10, Math.min(100, rawScore));

    // Determine grade & badge
    let grade = 'Poor';
    let gradeClass = 'poor';
    if (score >= 85) {
      grade = 'Excellent Prompt';
      gradeClass = 'excellent';
    } else if (score >= 65) {
      grade = 'Good Quality';
      gradeClass = 'good';
    } else if (score >= 40) {
      grade = 'Needs Refinement';
      gradeClass = 'moderate';
    } else {
      grade = 'Vague / Incomplete';
      gradeClass = 'poor';
    }

    // Generate specific actionable suggestions
    const suggestions = [];
    if (goalScore < 80) {
      suggestions.push('Anchor with a strong action verb (e.g. "Conduct a comprehensive review of...", "Extract and summarize...", "Generate a production-ready script...")');
    }
    if (contextScore < 70) {
      suggestions.push('Add persona and audience context (e.g. "Act as a principal system architect speaking to senior engineers").');
      suggestions.push('Include relevant scenario details or reference data so the model doesn\'t hallucinate assumptions.');
    }
    if (constraintScore < 70) {
      suggestions.push('Establish clear guardrails (e.g. "Do not assume external dependencies", "Keep the explanation under 250 words", "Avoid marketing jargon").');
    }
    if (formatScore < 70) {
      suggestions.push('Prescribe the exact response schema (e.g. "Return a Markdown table with columns [Component, Risk, Mitigation]" or "Output valid JSON conforming to { ... }").');
    }
    if (suggestions.length === 0) {
      suggestions.push('Your prompt is well-crafted with a balanced objective, context, boundaries, and schema specification!');
    }

    // Generate improved structured prompt
    const improvedPrompt = generateImprovedPrompt(text, {
      hasActionVerb,
      goalLabel,
      contextMatches,
      constraintMatches,
      formatMatches
    });

    return {
      stats,
      score,
      grade,
      gradeClass,
      pillars: {
        goal: { status: goalStatus, label: goalLabel, desc: goalDesc },
        context: { status: contextStatus, label: contextLabel, desc: contextDesc },
        constraints: { status: constraintStatus, label: constraintLabel, desc: constraintDesc },
        format: { status: formatStatus, label: formatLabel, desc: formatDesc }
      },
      suggestions,
      improvedPrompt
    };
  }

  /**
   * Intelligently transforms the user's raw prompt into a structured, production-grade prompt
   * preserving all original intent while injecting clear framework sections.
   */
  function generateImprovedPrompt(rawPrompt) {
    const text = rawPrompt.trim();
    if (!text) return '';

    // Infer potential role from content
    let role = 'Senior Specialist and Expert Advisor';
    if (/code|python|javascript|typescript|react|api|database|sql|bug|function/i.test(text)) {
      role = 'Principal Software Architect & Code Specialist';
    } else if (/copy|email|blog|article|headline|creative|story/i.test(text)) {
      role = 'World-Class Technical Copywriter & Editor';
    } else if (/data|metric|analytics|kpi|statistics|trend/i.test(text)) {
      role = 'Lead Data Scientist & Quantitative Analyst';
    } else if (/business|strategy|market|product|roadmap|pitch/i.test(text)) {
      role = 'Principal Product Strategist & Industry Analyst';
    }

    // Clean user's primary objective
    let objective = text.replace(/^(can you|could you|please|i want you to)\s+/i, '');
    objective = objective.charAt(0).toUpperCase() + objective.slice(1);

    // Assemble the structured prompt
    const sections = [];

    sections.push(`### Role & Persona\nAct as a ${role}. Provide an authoritative, precise, and highly actionable response.`);
    sections.push(`### Objective & Task\n${objective}`);
    sections.push(`### Context & Inputs\n- Target Audience: Professional stakeholders requiring clarity and depth.\n- Domain Scope: Adhere strictly to verified best practices and accurate domain facts.\n- Input Reference: Process all criteria specified in the objective above.`);
    sections.push(`### Constraints & Guidelines\n- Precision: Be clear, direct, and avoid unnecessary filler or generic platitudes.\n- Accuracy: If any required detail is ambiguous, state explicit assumptions before proceeding.\n- Tone: Professional, objective, and solution-oriented.`);
    sections.push(`### Desired Output Format\n1. Executive Summary / Direct Answer (2-3 sentences)\n2. Detailed Implementation / Key Points (structured with clear headers and bullet points)\n3. Actionable Next Steps or Verification Checklist`);

    return sections.join('\n\n');
  }

  return {
    getStats,
    analyzePrompt,
    generateImprovedPrompt
  };
})();

