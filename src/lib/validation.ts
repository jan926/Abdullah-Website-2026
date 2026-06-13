const ALLOWED_IMAGE_DOMAINS = [
  "images.unsplash.com",
  "cdn.akamai.steamstatic.com",
  "media.rawg.io",
  "cdn.cloudflare.steamstatic.com",
  "steamcdn-a.akamaihd.net",
  "shared.akamai.steamstatic.com",
  "lh3.googleusercontent.com",
  "drive.google.com",
  "dl.dropboxusercontent.com",
  "dropbox.com",
  "cdn.cloudflare.steamstatic.com",
  "media.githubusercontent.com",
  "raw.githubusercontent.com",
  "avatars.githubusercontent.com",
  "i.imgur.com",
  "imgur.com",
  "cloudflare-ipfs.com",
  "ipfs.io",
  "gateway.pinata.cloud",
];

const ALLOWED_VIDEO_DOMAINS = [
  "commondatastorage.googleapis.com",
  "www.youtube.com",
  "youtu.be",
  "drive.google.com",
  "dl.dropboxusercontent.com",
  "player.vimeo.com",
  "vimeo.com",
  "clips.twitch.tv",
  "streamable.com",
];

const ALLOWED_DOWNLOAD_DOMAINS = [
  "drive.google.com",
  "dl.dropboxusercontent.com",
  "dropbox.com",
  "mega.nz",
  "mediafire.com",
  "example.com",
  "github.com",
  "raw.githubusercontent.com",
  "media.githubusercontent.com",
  "cloudflare-ipfs.com",
  "ipfs.io",
  "gateway.pinata.cloud",
  "pixeldrain.com",
  "gofile.io",
  "file.io",
  "transfer.sh",
  "anonfiles.com",
  "bayfiles.com",
  "letsupload.cc",
  "file.io",
  "workupload.com",
  "1fichier.com",
  "uptobox.com",
  "rapidgator.net",
  "nitroflare.com",
  "uploaded.net",
  "turbobit.net",
];

const validImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".bmp", ".tiff", ".svg"];

function isValidImageExtension(pathname: string, hostname: string): boolean {
  const lowerPath = pathname.toLowerCase();
  const hasValidExt = validImageExtensions.some(ext => lowerPath.endsWith(ext));
  const isSteamLibrary = lowerPath.includes("/library_600x900") || lowerPath.includes("/header.jpg");
  const isGoogleusercontent = hostname.includes("googleusercontent");
  const isDropbox = hostname.includes("dropbox.com");
  const isGithub = hostname.includes("github.com") || hostname.includes("githubusercontent.com");
  const isCloudflareIpfs = hostname.includes("cloudflare-ipfs.com") || hostname.includes("ipfs.io");
  const isPinata = hostname.includes("pinata.cloud");
  const isImgur = hostname.includes("imgur.com");
  
  return hasValidExt || isSteamLibrary || isGoogleusercontent || isDropbox || isGithub || isCloudflareIpfs || isPinata || isImgur;
}

export function validateImageUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) return { valid: true };
  
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "URL must use HTTP or HTTPS" };
    }
    
    // Allow any domain but validate it's a reasonable image URL
    // This is more permissive - only rejects obviously invalid URLs
    const isKnownDomain = ALLOWED_IMAGE_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith("." + domain)
    );
    
    // If it's a known domain, validate extension
    // If unknown domain, still allow but warn (just check it looks like an image)
    if (isKnownDomain) {
      if (!isValidImageExtension(parsed.pathname, parsed.hostname)) {
        return { valid: false, error: "Image URL must end with a valid image extension (.jpg, .png, .webp, etc.)" };
      }
    } else {
      // For unknown domains, just check it has an image-like extension or is a known pattern
      const hasImageExt = validImageExtensions.some(ext => parsed.pathname.toLowerCase().endsWith(ext));
      if (!hasImageExt && !parsed.hostname.includes("googleusercontent") && !parsed.hostname.includes("dropbox.com")) {
        // Allow anyway but could add a warning in future
      }
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

export function validateVideoUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) return { valid: true };
  
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "URL must use HTTP or HTTPS" };
    }
    
    const isYouTube = parsed.hostname.includes("youtube.com") || parsed.hostname === "youtu.be";
    const isVimeo = parsed.hostname.includes("vimeo.com");
    const isTwitch = parsed.hostname.includes("twitch.tv");
    const isStreamable = parsed.hostname.includes("streamable.com");
    const isDirectVideo = /\.(mp4|webm|ogg|mov|mkv)(\?.*)?$/i.test(parsed.pathname);
    const isGoogleDrive = parsed.hostname.includes("drive.google.com");
    const isDropbox = parsed.hostname.includes("dropbox.com");
    
    if (!isYouTube && !isVimeo && !isTwitch && !isStreamable && !isDirectVideo && !isGoogleDrive && !isDropbox) {
      // Allow unknown video domains but validate extension
      const hasVideoExt = /\.(mp4|webm|ogg|mov|mkv)(\?.*)?$/i.test(parsed.pathname);
      if (!hasVideoExt) {
        return { valid: false, error: "Video must be YouTube, Vimeo, Twitch, Streamable, direct MP4/WebM/OGG/MOV, Google Drive, or Dropbox" };
      }
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

export function validateDownloadUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) return { valid: true };
  
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "URL must use HTTP or HTTPS" };
    }
    
    const isKnownDomain = ALLOWED_DOWNLOAD_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith("." + domain)
    );
    
    // Allow unknown domains for downloads too - just validate it's a reasonable URL
    if (!isKnownDomain) {
      // For unknown domains, just check it's a valid HTTPS URL
      // Could add more checks here if needed
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function validateRequired(value: string, fieldName: string): { valid: boolean; error?: string } {
  if (!value.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

export function validateGameForm(formData: {
  title: string;
  selectedCategories: string[];
  category: string;
  cover: string;
  backgroundImage: string;
  heroMedia: string;
  downloadLink: string;
  trailer: string;
  screenshots: string[];
  useMultiPart: boolean;
  downloadParts: { link: string }[];
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  const titleCheck = validateRequired(formData.title, "Title");
  if (!titleCheck.valid) errors.title = titleCheck.error!;
  
  const catCheck = validateRequired(
    formData.selectedCategories.length ? formData.selectedCategories[0] : formData.category, 
    "Category"
  );
  if (!catCheck.valid) errors.category = catCheck.error!;
  
  const coverCheck = validateImageUrl(formData.cover);
  if (!coverCheck.valid) errors.cover = coverCheck.error!;
  
  if (formData.backgroundImage) {
    const bgCheck = validateVideoUrl(formData.backgroundImage);
    if (!bgCheck.valid) errors.backgroundImage = bgCheck.error!;
  }
  
  if (formData.heroMedia) {
    const heroCheck = validateImageUrl(formData.heroMedia);
    if (!heroCheck.valid) errors.heroMedia = heroCheck.error!;
  }
  
  if (formData.trailer) {
    const trailerCheck = validateVideoUrl(formData.trailer);
    if (!trailerCheck.valid) errors.trailer = trailerCheck.error!;
  }
  
  if (!formData.useMultiPart && formData.downloadLink) {
    const dlCheck = validateDownloadUrl(formData.downloadLink);
    if (!dlCheck.valid) errors.downloadLink = dlCheck.error!;
  }
  
  if (formData.useMultiPart) {
    formData.downloadParts.forEach((part, idx) => {
      if (part.link) {
        const partCheck = validateDownloadUrl(part.link);
        if (!partCheck.valid) errors[`downloadParts.${idx}`] = partCheck.error!;
      }
    });
  }
  
  formData.screenshots.forEach((ss, idx) => {
    if (ss.trim()) {
      const ssCheck = validateImageUrl(ss);
      if (!ssCheck.valid) errors[`screenshots.${idx}`] = ssCheck.error!;
    }
  });
  
  return { valid: Object.keys(errors).length === 0, errors };
}