import { createRequire } from 'module';

// Use Node's createRequire to load CommonJS packages safely in ESM if needed
const require = createRequire(import.meta.url);

/**
 * The AI Prompt Engine
 * Handles Viral Copywriting, Highlight Detection, and B-Roll Prompt Generation.
 * Configured for Groq (openai/gpt-oss-120b) or OpenAI.
 */

// Helper to make the LLM request cleanly
const callLLM = async (systemPrompt, userContent, temperature = 0.3) => {
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  const isGroq = !!process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("No GROQ_API_KEY or OPENAI_API_KEY found.");
  }

  const endpoint = isGroq 
    ? "https://api.groq.com/openai/v1/chat/completions" 
    : "https://api.openai.com/v1/chat/completions";

  // Use the requested model
  const model = isGroq ? "openai/gpt-oss-120b" : "gpt-4o-mini";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      response_format: { type: "json_object" }, // Forces strict JSON output
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: temperature,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`AI API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const resultContent = data.choices[0].message.content;
  
  return JSON.parse(resultContent);
};

// =========================================
// 1. VIRAL COPYWRITER (On-Demand)
// =========================================
export const generateViralCopy = async (transcriptText, language = "English") => {
  console.log(`🤖 Generating AI Social Media Copy in ${language}...`);

  if (!transcriptText || transcriptText.trim().length < 10) {
    return { socialCaption: null };
  }

  try {
    const systemPrompt = `
      You are an expert Islamic social media copywriter for the "Muhammadan Way" channel.
      Analyze the following video transcript and create an engaging, viral, and spiritually uplifting caption.
      
      TARGET LANGUAGE: ${language}
      
      RULES:
      1. Write a captivating 2-3 sentence hook/summary about the clip in the target language.
      2. Use appropriate, respectful emojis (e.g., ✨, 🤲, 🕌, 🕊️).
      3. Translate the following Call-To-Action into the target language, but STRICTLY KEEP the @ handles and formatting exactly as written:
         "- Talk by Shaykh Nurjan MirAhmadi (Q). Follow the official page of Shaykh Nurjan, @muhammadanway on youtube, @themuhammadanway on tiktok, shaykhnurjanmirahmadi on facebook, and shaykhnurjanmirahmadi on instagram for more InshaAllah🥀"
      4. Below the translated Call-To-Action, you must include EXACTLY 6 dots on separate lines, followed by the exact English hashtags provided below (do not translate the hashtags).
      
      EXACT REQUIRED FORMAT:
      [Your Translated 2-3 Sentence Hook]
      [Your Translated Call-To-Action]
      .
      .
      .
      .
      .
      .
      #sufism #sufi #spirituality #spiritual #spiritualhealing #enlightenment #consciousness #higherconsciousness #meditation #spiritualgrowth #islam #islamicquotes #islamicreminders #tariqa #mystic #prophetmuhammad #imamali #fatimazahra #imamhasan #imamhussain #ahlulbayt #awliya #awliyaallah #shaykhnurjanmirahmadi #shaykhnazim #shaykhhishamkabbani #shaykhadnankabbani #shaykhmehmeteffendi
      
      OUTPUT FORMAT:
      You must respond strictly in JSON format returning a valid JSON object matching this structure:
      {
        "socialCaption": "The complete formatted caption string including the hook, CTA, dots, and hashtags."
      }
    `;

    const result = await callLLM(systemPrompt, `Transcript:\n\n"${transcriptText}"`, 0.7);
    console.log(`✅ AI Copy generated successfully in ${language}!`);
    
    return {
      socialCaption: result.socialCaption || "",
    };
  } catch (error) {
    console.error("❌ AI Copywriter Error:", error);
    return { socialCaption: null };
  }
};

// =========================================
// 2. HIGHLIGHT FINDER (1-Click Moments)
// =========================================
export const findVideoHighlights = async (captions, category) => {
  console.log(`✨ Analyzing transcript to find viral highlights with Groq...`);

  if (!captions || captions.length === 0) return [];

  try {
    const isLecture = category !== 'music';

    const segmentInstructions = isLecture
      ? "Analyze this segment. ONLY extract a highlight if it is exceptionally viral, profound, or contains a powerful emotional realization. If this segment is boring, just conversational filler, or lacks impact, you MUST return an empty array []. It is better to return 0 highlights than a weak one. If there is a great moment, extract exactly 1. Length must be between 45 seconds and 90 seconds."
      : "Analyze this segment. ONLY extract a highlight if it is an exceptionally high-energy chorus or emotional climax. If this segment is boring or flat, you MUST return an empty array []. It is better to return 0 highlights than a weak one. If there is a great moment, extract exactly 1. Length must be between 15 seconds and 45 seconds.";

    const systemPrompt = `
      You are an expert content curator for Muhammadan Way.
      Analyze the following timestamped transcript.
      ${segmentInstructions}
      
      RULES:
      1. Ensure the start and end times match the natural flow of the sentence.
      2. Provide a short, catchy title for the clip.
      3. Provide a 'hook', which is a 1-sentence summary of why this clip will go viral.
      
      OUTPUT FORMAT:
      You must respond strictly in JSON format returning a valid JSON object matching this structure:
      {
        "highlights": [
          {
            "title": "Short Catchy Title",
            "startTime": 12.5,
            "endTime": 55.0,
            "hook": "A viral hook explaining why this is impactful."
          }
        ]
      }
    `;

    // SMART CHUNKING: Split into 3-minute max segments to avoid TPM limits
    const CHUNK_DURATION = 180; // 3 minutes
    const chunks = [];
    let currentChunk = [];
    let chunkStartTime = captions[0].startTime;

    for (const caption of captions) {
      if (caption.endTime - chunkStartTime > CHUNK_DURATION && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [caption];
        chunkStartTime = caption.startTime;
      } else {
        currentChunk.push(caption);
      }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk);

    let allHighlights = [];
    
    console.log(`📦 Received batch of ${chunks.length} manageable chunks. Processing sequentially...`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const transcriptWithTimes = chunk
        .map(c => `[${c.startTime}s - ${c.endTime}s]: ${c.text}`)
        .join('\n');

      try {
        console.log(`⏳ Processing chunk ${i + 1}/${chunks.length}...`);
        const result = await callLLM(systemPrompt, transcriptWithTimes, 0.2);
        if (result.highlights && result.highlights.length > 0) {
          allHighlights = allHighlights.concat(result.highlights);
        }
      } catch (chunkError) {
        console.error(`⚠️ Error processing chunk ${i + 1}:`, chunkError.message);
        // Continue to the next chunk even if one fails
      }
    }

    console.log(`✅ AI found ${allHighlights.length} highlights in this batch!`);
    
    return allHighlights;
  } catch (error) {
    console.error("❌ Highlight Finder Error:", error);
    return [];
  }
};

// =========================================
// 3. AI B-ROLL PROMPT GENERATOR
// =========================================
export const generateBRollPrompts = async (captions, promptType = 'image') => {
  console.log(`💡 Generating AI B-Roll Prompts (${promptType}) with Groq...`);

  if (!captions || captions.length === 0) return [];

  try {
    const transcriptWithTimes = captions
      .map(c => `[${c.startTime}s - ${c.endTime}s]: ${c.text}`)
      .join('\n');

    const typeInstructions = promptType === 'video' 
      ? `generate 2 to 3 visual metaphor prompts for AI Text-to-Video models (like Runway Gen-3 or Sora) that perfectly match the spiritual context. Focus on camera movements (e.g., "slow pan right", "drone shot"), dynamic elements, and cinematic lighting.`
      : `generate 2 to 3 visual metaphor prompts for Midjourney (AI image generation) that perfectly match the spiritual context. Keep the prompt highly detailed, cinematic, and photorealistic. Append "--ar 9:16" to the end of every prompt.`;

    const systemPrompt = `
      You are an expert Islamic Art Director and visual curator for the "Muhammadan Way" channel.
      Analyze the following timestamped transcript of a video clip and ${typeInstructions}
      
      RULES:
      1. Generate exactly 2-3 prompts.
      2. Identify a specific timecode range (e.g., startTime: 15.0, endTime: 22.0) where this media should be overlaid. Ensure the duration is between 3 to 7 seconds.
      3. RULE: If the visual requires a person, they MUST be depicted as a Sufi Shaykh wearing a dark green turban and robes, unless you purposefully need a western/modern person for contextual contrast.
      4. Briefly explain the reason why this visual metaphor fits the spiritual context.
      
      OUTPUT FORMAT:
      You must respond strictly in JSON format returning a valid JSON object matching this structure:
      {
        "bRollPrompts": [
          {
            "id": "ai_1",
            "startTime": 15.0,
            "endTime": 22.0,
            "type": "${promptType}",
            "prompt": "A realistic glowing golden lantern in a vast desert at night...",
            "reason": "The lantern represents the light of faith in the darkness of the dunya."
          }
        ]
      }
    `;

    // Temperature 0.4 allows some creative freedom for the prompt generation, while retaining strict structure
    const result = await callLLM(systemPrompt, transcriptWithTimes, 0.4);
    console.log(`✅ AI generated ${result.bRollPrompts?.length || 0} B-Roll prompts!`);
    
    return result.bRollPrompts || [];
  } catch (error) {
    console.error("❌ B-Roll Generator Error:", error);
    return [];
  }
};