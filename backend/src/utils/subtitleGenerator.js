import fs from 'fs/promises';

/**
 * Converts seconds (e.g., 3.14) to ASS time format (H:MM:SS.cs)
 */
const formatAssTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
};

/**
 * Generates an Advanced SubStation Alpha (.ass) subtitle file dynamically based on Custom Styles.
 * @param {Array} captions - Array of { text, startTime, endTime }
 * @param {Object} styles - { uppercaseOnly, fontSize, captionBg, highlightColor }
 * @param {Number} trimStart - Clip start offset in seconds
 * @param {String} outputPath - Local file path destination
 */
export const generateAssSubtitleFile = async (captions, styles, trimStart, outputPath) => {
  console.log(`📝 Generating custom styled ASS subtitles to ${outputPath}...`);

  if (!captions || captions.length === 0) {
    await fs.writeFile(outputPath, '', 'utf-8');
    return outputPath;
  }

  const { uppercaseOnly, fontSize, captionBg, highlightColor, karaokeEnabled = true } = styles;

  // =========================================
  // 1. UNICODE SCRIPT DETECTION & FONT MAPPING
  // =========================================
  const textSample = captions.map(c => c.text).join(' ');

  const hasArabicScript = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(textSample);
  const hasHindiScript = /[\u0900-\u097F\uA8E0-\uA8FF]/.test(textSample);

  let assFontName = 'Arial'; // Safe default
  
  if (hasArabicScript) {
    assFontName = 'Arial'; // Universal font with native FriBidi RTL support
  } else if (hasHindiScript) {
    assFontName = 'Nirmala UI'; // Safe unicode font for Devanagari
  } else {
    assFontName = 'Oswald';
  }
  
  const letterSpacing = 0;

  // =========================================
  // 2. FONT SIZE MAPPING
  // =========================================
  // Matched to the frontend `cqw` calculations for PlayResX: 384
  let assFontSize = 21;
  if (fontSize === 'sm') assFontSize = 17;
  if (fontSize === 'md') assFontSize = 21;
  if (fontSize === 'lg') assFontSize = 27;

  // Bump up size slightly for Arabic/Hindi for legibility
  if (hasArabicScript || hasHindiScript) {
    assFontSize += 4; 
  }

  // =========================================
  // 3. BACKGROUND BOX & SHADOW MAPPING
  let borderStyle = 1;
  let outline = 1;
  let shadow = 0;
  let backColour = "&H00000000"; // Transparent
  let marginV = 46; // Base bottom margin (approx 12cqw)

  switch (captionBg) {
    case 'box':
      borderStyle = 3; // 3 = Opaque Box
      outline = 2;
      shadow = 0;
      backColour = "&H3F000000"; // 75% opaque black box
      break;
    case 'shadow':
      borderStyle = 1; // 1 = Outline/Shadow
      outline = 0;
      shadow = 2.5;
      backColour = "&H80000000"; // Dark shadow
      break;
    case 'gradient':
      borderStyle = 1;
      outline = 0;
      shadow = 2.5; // Slight shadow on text for legibility
      backColour = "&H80000000"; 
      marginV = 23; // Lower margin (approx 6cqw) since gradient covers the bottom
      break;
    case 'none':
    default:
      borderStyle = 1;
      outline = 0.5; // Tiny outline just for safety
      shadow = 0;
      backColour = "&H00000000";
      break;
  }

  // =========================================
  // 4. HIGHLIGHT COLOR MAPPING (BGR Hex Format)
  // =========================================
  const colors = {
    gold: "&H005AA7C7&",    // #C7A75A
    emerald: "&H005F7A0D&", // #0D7A5F
    white: "&H00FFFFFF&",   // #FFFFFF
    blue: "&H00F6823B&"     // #3B82F6
  };
  const activeColorCode = colors[highlightColor] || colors.gold;
  const highlightTag = `{\\c${activeColorCode}}`;
  const resetTag = "{\\c&H00FFFFFF&}"; // Explicitly reset to White to prevent color bleeding

  // =========================================
  // 5. ASSEMBLE FILE
  // =========================================
  const styleDefinition = `Style: Default,${assFontName},${assFontSize},&H00FFFFFF,&H000000FF,${backColour},${backColour},1,0,0,0,100,100,${letterSpacing},0,${borderStyle},${outline},${shadow},2,20,20,${marginV},1`;

  const assHeader = `[Script Info]
ScriptType: v4.00+
PlayResX: 384
PlayResY: 682
WrapStyle: 1

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${styleDefinition}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const assEvents = [];

  captions.forEach((caption) => {
    const adjustedStart = Math.max(0, caption.startTime - trimStart);
    const adjustedEnd = Math.max(0, caption.endTime - trimStart);
    
    if (adjustedEnd <= 0) return;
    
    // Apply bold font family uppercase transformation
    const renderText = uppercaseOnly ? caption.text.toUpperCase() : caption.text;
    const words = renderText.split(" ");
    const duration = adjustedEnd - adjustedStart;
    
    if (!karaokeEnabled || words.length === 1) {
      const textToRender = karaokeEnabled 
        ? `${highlightTag}${renderText}${resetTag}` 
        : renderText;

      assEvents.push(
        `Dialogue: 0,${formatAssTime(adjustedStart)},${formatAssTime(adjustedEnd)},Default,,0,0,0,,${textToRender}`
      );
    } else {
      // Sentence caption. Mimic frontend Simulated Karaoke!
      const slice = duration / words.length;
      
      words.forEach((activeWord, activeIndex) => {
        const sliceStart = adjustedStart + (activeIndex * slice);
        const sliceEnd = adjustedStart + ((activeIndex + 1) * slice);
        
        const lineText = words
          .map((w, idx) => {
            if (idx === activeIndex) {
              return `${highlightTag}${w}${resetTag}`;
            }
            return w;
          })
          .join(" ");
          
        assEvents.push(
          `Dialogue: 0,${formatAssTime(sliceStart)},${formatAssTime(sliceEnd)},Default,,0,0,0,,${lineText}`
        );
      });
    }
  });

  // UTF-8 BOM Injection (\uFEFF)
  const fileContent = '\uFEFF' + assHeader + assEvents.join("\n");

  await fs.writeFile(outputPath, fileContent, "utf-8");
  return outputPath;
};