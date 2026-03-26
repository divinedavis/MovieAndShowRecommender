import React from 'react';
import Link from 'next/link';

/**
 * Automatically wraps movie/person names with Links.
 * This is a simplified version; in production, you'd use a more robust
 * entity extractor or a predefined list of high-value keywords.
 */
export function LinkifyDescription(text: string, currentId: string) {
  if (!text) return null;

  // For now, we'll implement a logic that can be expanded with real entity lists.
  // To keep it safe and autonomous, we'll focus on common movie patterns
  // or use the 'cast' names if provided.
  
  return text; // Placeholder for logic
}

export function generateWatchOrderSchema(collection: any) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${collection.name} Chronological Watch Order`,
    "description": `The definitive guide to watching the ${collection.name} in chronological order.`,
    "itemListElement": collection.parts.map((m: any, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Movie",
        "name": m.title,
        "url": `https://movies.unittap.com/movie/${m.id}`
      }
    }))
  };
}
