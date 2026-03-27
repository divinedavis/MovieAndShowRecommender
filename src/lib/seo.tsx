import React from 'react';
import Link from 'next/link';

interface Entity {
  id: number | string;
  name: string;
  type: 'movie' | 'person' | 'show';
}

/**
 * Automatically wraps entity names with Links within a text string.
 */
export function LinkifyDescription(text: string, entities: Entity[], currentId: string) {
  if (!text) return null;

  // Sort entities by name length descending to avoid partial matches 
  // (e.g., "Tom Cruise" vs "Tom")
  const sortedEntities = [...entities]
    .filter(e => e.id.toString() !== currentId.toString())
    .sort((a, b) => b.name.length - a.name.length);

  if (sortedEntities.length === 0) return text;

  // Create a regex pattern from all entity names
  const pattern = sortedEntities
    .map(e => e.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => {
    const entity = sortedEntities.find(e => e.name.toLowerCase() === part.toLowerCase());
    if (entity) {
      const href = entity.type === 'person' ? `/person/${entity.id}` : `/${entity.type}/${entity.id}`;
      return (
        <Link 
          key={i} 
          href={href} 
          className="text-blue-600 hover:underline font-bold decoration-2 underline-offset-4"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
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
