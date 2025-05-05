import { getGoogleCustomSearchApiKey, getGoogleCustomSearchCx } from './util.js';
import fetch from 'node-fetch';

export async function generateImage(query: string) {
  const apiKey = getGoogleCustomSearchApiKey();
  const cx = getGoogleCustomSearchCx();
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    query
  )}&searchType=image&num=1&key=${apiKey}&cx=${cx}`;

  try {
    console.log('Fetching image with URL:', url); // Debug log
    const res = await fetch(url);
    const data = await res.json();
    console.log('Google Custom Search API response:', data); // Debug log

    const imageUrl = data.items?.[0]?.link;
    console.log('Extracted image URL:', imageUrl); // Debug log
    return imageUrl || null; // Return null if no image is found
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}