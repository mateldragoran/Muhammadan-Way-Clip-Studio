export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const uploadBRollDirect = async (file: File, fileName: string): Promise<string> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase configuration.");
  }

  const endpoint = `${supabaseUrl}/storage/v1/object/b-roll-assets/${fileName}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "x-upsert": "true",
      "cache-control": "3600",
      "content-type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || `Upload failed with status ${response.status}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/b-roll-assets/${fileName}`;
};

export const processMediaUpload = async (file: File): Promise<{ url: string; type: "image" | "video" }> => {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    throw new Error("Please upload an image (PNG/JPG) or video (MP4/MOV).");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `broll_${Date.now()}.${fileExt}`;
  
  let mediaUrl: string;

  try {
    mediaUrl = await uploadBRollDirect(file, fileName);
  } catch (uploadErr) {
    if (isImage) {
      mediaUrl = await fileToDataUrl(file);
    } else {
      throw new Error("Video upload failed.");
    }
  }

  return { url: mediaUrl, type: isVideo ? "video" : "image" };
};
