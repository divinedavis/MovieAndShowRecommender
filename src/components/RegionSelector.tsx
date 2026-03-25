'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CountryConfig } from '@/lib/countries';
import { Translations } from '@/lib/translations';

interface Props {
  currentCountry: CountryConfig;
  topCountries: CountryConfig[];
  otherCountries: CountryConfig[];
  t: Translations;
}

export default function RegionSelector({ currentCountry, topCountries, otherCountries, t }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = otherCountries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex items-center gap-2 border-r-2 border-gray-200 pr-4">
      <span className="text-gray-400 italic">{t.region}:</span>
      {topCountries.map(c => (
        <Link 
          key={c.code}
          href={c.code === 'US' ? '/' : `/${c.lang.split('-')[0]}`} 
          className={`hover:text-blue-600 ${currentCountry.code === c.code ? 'text-blue-600 underline font-black' : ''}`}
        >
          {c.code}
        </Link>
      ))}
      
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="hover:text-blue-600 flex items-center gap-1 font-black"
        >
          {t.more} ▾
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[60] bg-black/20" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 w-72 z-[70] max-h-[80vh] flex flex-col">
              <h3 className="font-black uppercase tracking-tighter text-lg mb-3">{t.allRegions}</h3>
              <input 
                type="text"
                placeholder={t.searchRegion}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-2 border-black p-2 mb-4 font-bold text-sm focus:bg-yellow-100 outline-none"
                autoFocus
              />
              <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-2">
                {filtered.map(c => (
                  <Link 
                    key={c.code}
                    href={c.code === 'US' ? '/' : `/${c.lang.split('-')[0]}`} 
                    onClick={() => setIsOpen(false)}
                    className={`p-2 text-center border-2 border-black text-[10px] font-black hover:bg-yellow-400 transition-colors ${currentCountry.code === c.code ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}
                    title={c.name}
                  >
                    {c.code}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
