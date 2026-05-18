// gdrive.js

/**
 * Extracts the unique file ID from a Google Drive share link and 
 * generates a clean, direct download/rendering stream URL.
 * @param {string} url - The raw user-pasted Google Drive address.
 * @returns {string|null} - Clean direct URL or null if link is invalid.
 */
export function convertToDirectDriveLink(url) {
    if (!url || typeof url !== 'string') return null;
    
    let fileId = null;
    
    // Match pattern: /file/d/FILE_ID/
    if (url.includes('/file/d/')) {
        fileId = url.split('/file/d/')[1].split('/')[0];
    } 
    // Match pattern: id=FILE_ID
    else if (url.includes('id=')) {
        fileId = url.split('id=')[1].split('&')[0];
    }
    // Match pattern: drive.google.com/open?id=FILE_ID
    else if (url.includes('open?id=')) {
        fileId = url.split('open?id=')[1].split('&')[0];
    }

    if (fileId) {
        // Return direct link format optimized for browsers background rendering
        return `https://docs.google.com/uc?export=view&id=${fileId}`;
    }
    
    return null; // Return null if it's not a valid Drive link format
}