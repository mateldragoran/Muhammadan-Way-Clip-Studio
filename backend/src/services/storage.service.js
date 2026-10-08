import fs from 'fs';
import { pipeline } from 'stream/promises';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Downloads a file from a Public URL OR writes a Base64 Data URL directly to disk.
 */
export const downloadFileFromUrl = async (publicUrl, destinationPath) => {
  console.log(`📥 Downloading asset to ${destinationPath}...`);

  if (publicUrl.startsWith('data:')) {
    const base64Data = publicUrl.split(';base64,').pop();
    await fs.promises.writeFile(destinationPath, base64Data, { encoding: 'base64' });
    return destinationPath;
  }

  const response = await fetch(publicUrl);
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

  const fileStream = fs.createWriteStream(destinationPath);
  await pipeline(response.body, fileStream);
  
  return destinationPath;
};

/**
 * Uploads the final compiled .mp4 video back to Supabase Storage using the official SDK.
 */
export const uploadRenderedClip = async (localFilePath, userId) => {
  console.log(`📤 Uploading final render to Supabase...`);

  const fileExtension = localFilePath.split('.').pop();
  const fileName = `${userId}/${Date.now()}_render.${fileExtension}`;

  const fileBuffer = await fs.promises.readFile(localFilePath);

  const { data, error } = await supabaseAdmin.storage
    .from('rendered-clips')
    .upload(fileName, fileBuffer, {
      contentType: 'video/mp4',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Upload Error: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('rendered-clips')
    .getPublicUrl(fileName);

  console.log(`✅ Upload complete: ${urlData.publicUrl}`);
  return urlData.publicUrl;
};