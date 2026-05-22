// gdrive.js

/**
 * Smart URL Processor
 * Extracts IDs from Google Drive links and optimizes for direct rendering.
 */
export function processImageUrl(url) {
    if (!url || typeof url !== 'string') return null;
    let finalUrl = url.trim();

    // 1. Handle Pinterest URLs
    if (finalUrl.includes('pinterest.com') || finalUrl.includes('pin.it')) {
        if (finalUrl.includes('i.pinimg.com')) {
            finalUrl = finalUrl.replace(/\/236x\//, '/originals/')
                             .replace(/\/564x\//, '/originals/')
                             .replace(/\/736x\//, '/originals/');
        }
    }

    // 2. Handle Google Drive URLs
    if (finalUrl.includes('drive.google.com')) {
        let fileId = null;
        
        const idMatch = finalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const queryMatch = finalUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        
        if (idMatch && idMatch[1]) {
            fileId = idMatch[1];
        } else if (queryMatch && queryMatch[1]) {
            fileId = queryMatch[1];
        }

        if (fileId) {
            // 🔥 THE FIX: Using Google's lh3 user content endpoint bypasses the CSS background blocks
            finalUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
        }
    }

    return finalUrl;
}