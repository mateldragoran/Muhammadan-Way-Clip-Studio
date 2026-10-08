import { createRequire } from 'module';
import fs from 'fs';

// Use Node's createRequire to load CommonJS packages safely in ESM
const require = createRequire(import.meta.url);
const { createClient } = require('@deepgram/sdk');

/**
 * Sends an audio file to Deepgram and maps the response into our exact CaptionItem JSON array.
 */
export const generateCaptions = async (audioFilePath) => {
  console.log(`🤖 Sending audio to Deepgram AI for transcription...`);
  
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error("Missing DEEPGRAM_API_KEY in environment variables.");
  }

  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
  
  // Read the local MP3 file into a buffer
  const audioBuffer = fs.readFileSync(audioFilePath);

  // Call Deepgram's Nova-2 model
  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    audioBuffer,
    {
      model: 'nova-2',
      smart_format: true,
      punctuate: true,
    }
  );

  if (error) {
    throw new Error(`Deepgram Error: ${error.message}`);
  }

  // Deepgram returns a nested JSON response
  const wordsArray = result.results.channels[0].alternatives[0].words;

  if (!wordsArray || wordsArray.length === 0) {
    return [];
  }

  // Map Deepgram's format into our frontend's exact CaptionItem interface
  const captions = wordsArray.map((wordObj, index) => ({
    id: `cap_${index}_${Date.now()}`,
    text: wordObj.punctuated_word || wordObj.word,
    startTime: wordObj.start,
    endTime: wordObj.end,
  }));

  console.log(`✅ Generated ${captions.length} timestamped words!`);
  return captions;
};