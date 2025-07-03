"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, FileText, ArrowRight, ExternalLink, Download, BookMarked, Filter, Save, Copy, Check, AlertCircle } from "lucide-react";
import { useUserStore, Citation } from "@/store/user-store";
import { CitationMatch } from '@/types';

type SearchSources = {
  'Google Scholar': boolean;
  'JSTOR': boolean;
  'ArXiv': boolean;
  'PubMed': boolean;
  'Science Direct': boolean;
  'Books': boolean;
  'PDFs': boolean;
  'Web': boolean;
};

type SourceType = 'article' | 'book' | 'journal';

const sourceTypeMap: Record<SourceType, Array<keyof SearchSources>> = {
  'article': ['Google Scholar', 'ArXiv', 'PubMed', 'Science Direct'],
  'book': ['Books'],
  'journal': ['JSTOR', 'Science Direct']
};

const potentialMatches: CitationMatch[] = [
  {
    id: '1',
    type: 'article',
    title: 'The Impact of AI on Academic Research',
    authors: 'Smith, John, Johnson, Mary',
    year: '2023',
    source: 'Journal of AI Studies',
    excerpt: 'This study examines the transformative effects of artificial intelligence on academic research methodologies...',
    doi: '10.1234/jas.2023.001',
    volume: '45',
    issue: '2',
    pages: '123-145',
    matchPercentage: 95
  },
  {
    id: '2',
    type: 'book',
    title: 'Digital Learning Revolution',
    authors: 'Brown, Robert',
    year: '2022',
    source: 'Academic Press',
    excerpt: 'An exploration of how digital technologies are reshaping education...',
    publisher: 'Academic Press',
    isbn: '978-0-12-345678-9',
    matchPercentage: 85
  }
];

export default function GhostCitationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [results, setResults] = useState<CitationMatch[]>([]);
  const [searchSources, setSearchSources] = useState<SearchSources>({
    'Google Scholar': true,
    'JSTOR': true,
    'ArXiv': true,
    'PubMed': true,
    'Science Direct': true,
    'Books': true,
    'PDFs': true,
    'Web': true
  });
  const [activeCitation, setActiveCitation] = useState<CitationMatch | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('APA');
  const [isCopied, setIsCopied] = useState(false);
  
  // Get user state from store
  const savedCitations = useUserStore(state => state.savedCitations);
  const recentSearches = useUserStore(state => state.recentSearches);
  const saveCitation = useUserStore(state => state.saveCitation);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasResults(false);
    setResults([]);
    
    // Get selected sources
    const selectedSources = (Object.keys(searchSources) as Array<keyof SearchSources>)
      .filter(source => searchSources[source]);
    
    // Simulate search delay - different times for different sources
    setTimeout(() => {
      // More flexible content matching algorithm
      const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      
      const matches = potentialMatches.filter(match => {
        // Check if match type is in selected sources
        const matchTypes = sourceTypeMap[match.type as SourceType] || ['Web', 'PDFs'];
        const isSourceSelected = matchTypes.some(type => selectedSources.includes(type));
        if (!isSourceSelected) return false;
        
        // Check content match - more flexible matching
        const matchContent = match.title.toLowerCase() + ' ' + 
                           match.excerpt.toLowerCase() + ' ' + 
                           match.authors.toLowerCase();
        
        // Count how many query words are found
        let matchCount = 0;
        queryWords.forEach(word => {
          if (matchContent.includes(word)) {
            matchCount++;
          }
        });
        
        // Match if at least 30% of query words are found (or at least 1 word for short queries)
        const matchThreshold = Math.max(1, Math.floor(queryWords.length * 0.3));
        return matchCount >= matchThreshold;
      });
      
      // Sort by match percentage
      matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
      
      // Recalculate match percentages based on query terms
      const enhancedMatches = matches.map(match => {
        const queryTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 3);
        const matchText = (match.title + " " + match.excerpt + " " + match.authors).toLowerCase();
        
        // Count term occurrences
        let termMatches = 0;
        queryTerms.forEach(term => {
          if (matchText.includes(term)) termMatches++;
        });
        
        // Adjust match percentage based on term matches
        const adjustedPercentage = queryTerms.length > 0 
          ? Math.round((termMatches / queryTerms.length) * 100)
          : match.matchPercentage;
          
        return {
          ...match,
          matchPercentage: Math.max(adjustedPercentage, 45) // Minimum 45% to avoid too low percentages
        };
      });
      
      setIsSearching(false);
      setResults(enhancedMatches);
      setHasResults(enhancedMatches.length > 0);
    }, 1500);
  };

  // Generate citation for a selected match
  const [citationLoading, setCitationLoading] = useState(false);
  const [citationText, setCitationText] = useState("");
  
  const formatAuthors = (authorString: string, format: string) => {
    const authors = authorString.split(', ');
    
    if (format === 'APA') {
      return authors.map(author => {
        const names = author.split(' ');
        if (names.length > 1) {
          const lastName = names[names.length - 1];
          const firstNames = names.slice(0, -1).map(n => n[0]).join('. ');
          return `${lastName}, ${firstNames}.`;
        }
        return author;
      }).join(', ');
    } else if (format === 'MLA') {
      return authors.map((author, index) => {
        const names = author.split(' ');
        if (names.length > 1) {
          const lastName = names[names.length - 1];
          const firstNames = names.slice(0, -1).join(' ');
          return index === 0 ? `${lastName}, ${firstNames}` : `${firstNames} ${lastName}`;
        }
        return author;
      }).join(authors.length > 1 ? ', and ' : '');
    } else if (format === 'Chicago') {
      return authors.map(author => {
        const names = author.split(' ');
        if (names.length > 1) {
          const lastName = names[names.length - 1];
          const firstNames = names.slice(0, -1).join(' ');
          return `${lastName}, ${firstNames}`;
        }
        return author;
      }).join(', and ');
    } else if (format === 'IEEE') {
      return authors.map(author => {
        const names = author.split(' ');
        if (names.length > 1) {
          const lastName = names[names.length - 1];
          const firstNames = names.slice(0, -1).map(n => n[0]).join('. ');
          return `${firstNames}. ${lastName}`;
        }
        return author;
      }).join(', ');
    }
    
    return authorString;
  };
  
  const generateCitation = (match: CitationMatch) => {
    setCitationLoading(true);
    setActiveCitation(match);
    
    setTimeout(() => {
      let citation = "";
      const authors = formatAuthors(match.authors, selectedFormat);
      const doi = match.doi ? `https://doi.org/${match.doi}` : '';
      const url = match.url || doi;
      
      if (selectedFormat === 'APA') {
        if (match.type === 'article' || match.type === 'journal') {
          const volume = match.volume || '';
          const issue = match.issue || '';
          const pages = match.pages || '1-15';
          citation = `${authors} (${match.year}). ${match.title}. *${match.source}*${volume ? `, ${volume}` : ''}${issue ? `(${issue})` : ''}, ${pages}.${url ? ` ${url}` : ''}`;
        } else if (match.type === 'book') {
          citation = `${authors} (${match.year}). *${match.title}*. ${match.publisher || match.source}.${url ? ` ${url}` : ''}`;
        }
      } else if (selectedFormat === 'MLA') {
        if (match.type === 'article' || match.type === 'journal') {
          const pages = match.pages || '1-15';
          citation = `${authors}. "${match.title}." *${match.source}*, ${match.year}, pp. ${pages}.${url ? ` Web. ${url}` : ''}`;
        } else if (match.type === 'book') {
          citation = `${authors}. *${match.title}*. ${match.publisher || match.source}, ${match.year}.${url ? ` Web. ${url}` : ''}`;
        }
      } else if (selectedFormat === 'Chicago') {
        if (match.type === 'article' || match.type === 'journal') {
          const pages = match.pages || '1-15';
          citation = `${authors}. "${match.title}." *${match.source}* (${match.year}): ${pages}.${url ? ` ${url}` : ''}`;
        } else if (match.type === 'book') {
          citation = `${authors}. *${match.title}*. ${match.publisher || match.source}, ${match.year}.${url ? ` ${url}` : ''}`;
        }
      } else if (selectedFormat === 'IEEE') {
        if (match.type === 'article' || match.type === 'journal') {
          const volume = match.volume || '';
          const issue = match.issue || '';
          const pages = match.pages || '1-15';
          citation = `${authors}, "${match.title}," *${match.source}*${volume ? `, vol. ${volume}` : ''}${issue ? `, no. ${issue}` : ''}, pp. ${pages}, ${match.year}.${url ? ` [Online]. Available: ${url}` : ''}`;
        } else if (match.type === 'book') {
          citation = `${authors}, *${match.title}*. ${match.publisher || match.source}, ${match.year}.${url ? ` [Online]. Available: ${url}` : ''}`;
        }
      }
      
      setCitationText(citation);
      setCitationLoading(false);
    }, 800);
  };
  
  const handleViewSource = (result: CitationMatch) => {
    // Check if there's a direct URL or DOI
    if (result.url) {
      window.open(result.url, '_blank');
      return;
    }
    
    if (result.doi) {
      window.open(`https://doi.org/${result.doi}`, '_blank');
      return;
    }
    
    // Fallback to Google Scholar search
    const searchQuery = encodeURIComponent(`"${result.title}" ${result.authors} ${result.year}`);
    window.open(`https://scholar.google.com/scholar?q=${searchQuery}`, '_blank');
  };
  
  const isSourceAvailable = (result: CitationMatch) => {
    return !!(result.url || result.doi);
  };
  
  const handleSaveCitation = () => {
    if (!citationText || !activeCitation) return;
    
    const newCitation: Citation = {
      id: Date.now().toString(),
      text: citationText,
      format: selectedFormat as any,
      source: activeCitation.source,
      date: new Date(),
    };
    
    saveCitation(newCitation);
  };
  
  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const closeCitation = () => {
    setActiveCitation(null);
    setCitationText("");
  };
  
  const toggleSource = (source: keyof SearchSources) => {
    setSearchSources((prev: SearchSources) => ({
      ...prev,
      [source]: !prev[source]
    }));
  };
  
  return (
    <div className="space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-background border border-white/20 rounded-lg">
            <Search size={32} className="text-red-500" />
          </div>
          <div>
            <h1 className="page-header">GhostCitations</h1>
            <p className="text-text-secondary">Hunt down lost, hidden, or obscure references</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Find Your Lost References</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="search-query" className="block text-white">Describe what you remember about the reference</label>
            <textarea
              id="search-query"
              rows={4}
              className="input"
              placeholder="e.g., 'Something about AI not being able to mimic Bruegel's intention' or 'A 2019 paper that discussed quantum computing applications in medicine...'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSearch();
                }
              }}
            />
            <p className="text-xs text-text-secondary mt-1">Press Ctrl+Enter to search</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={handleSearch}
              disabled={isSearching}
            >
              <Search size={18} />
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
            
            <button 
              className="btn btn-secondary flex items-center gap-2"
              onClick={() => (document.getElementById('filters-dialog') as HTMLDialogElement)?.showModal()}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </section>

      {/* Source filters dialog */}
      <dialog id="filters-dialog" className="bg-primary border border-white/10 rounded-lg p-6 shadow-xl text-white">
        <h3 className="text-lg font-semibold mb-4">Select Search Sources</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(searchSources) as Array<keyof SearchSources>).map(source => (
            <button
              key={source}
              onClick={() => toggleSource(source)}
              className={`px-3 py-1 rounded-full text-sm ${
                searchSources[source]
                  ? 'bg-white/20 text-white'
                  : 'bg-background hover:bg-white/10 text-white/70'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button 
            className="btn btn-secondary"
            onClick={() => (document.getElementById('filters-dialog') as HTMLDialogElement)?.close()}
          >
            Close
          </button>
        </div>
      </dialog>

      {/* Search results */}
      {hasResults && (
        <section className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Search Results</h2>
            <span className="text-sm text-text-secondary">{results.length} matches found</span>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div 
                key={index} 
                className="p-4 bg-background border border-white/10 rounded-lg"
              >
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="icon-container">
                      {result.type === 'article' && <FileText size={16} className="text-blue-500" />}
                      {result.type === 'book' && <BookOpen size={16} className="text-green-500" />}
                      {result.type === 'journal' && <BookMarked size={16} className="text-purple-500" />}
                    </div>
                    <span className="text-xs text-text-secondary">{result.type}</span>
                  </div>
                  <span className="text-xs text-white bg-background border border-white/10 px-2 py-1 rounded-full">
                    {result.matchPercentage}% match
                  </span>
                </div>
                
                <h3 className="text-white font-medium mt-2">{result.title}</h3>
                <p className="text-text-secondary text-sm mt-1">{result.authors} • {result.year} • {result.source}</p>
                <p className="text-white text-sm mt-2">{result.excerpt}</p>
                
                <div className="flex gap-2 mt-3">
                  <button 
                    className="btn btn-secondary text-xs flex items-center gap-1 py-1.5"
                    onClick={() => generateCitation(result)}
                  >
                    <BookMarked size={14} />
                    <span>Cite</span>
                  </button>
                  
                  <div className="relative group">
                    <button 
                      className={`btn text-xs flex items-center gap-1 py-1.5 ${
                        isSourceAvailable(result) 
                          ? 'btn-secondary' 
                          : 'btn-secondary opacity-50'
                      }`}
                      onClick={() => handleViewSource(result)}
                    >
                      <ExternalLink size={14} />
                      <span>View Source</span>
                    </button>
                    
                    {!isSourceAvailable(result) && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={12} />
                          Will search on Google Scholar
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active citation view */}
      {activeCitation && (
        <section className="card">
          <div className="flex justify-between mb-4">
            <h2 className="section-title mb-0">Generated Citation</h2>
            <div className="flex gap-2">
              <select 
                className="bg-background border border-white/10 text-white rounded-md px-2 py-1 text-sm"
                value={selectedFormat}
                onChange={(e) => {
                  setSelectedFormat(e.target.value);
                  if (activeCitation) {
                    generateCitation(activeCitation);
                  }
                }}
              >
                <option value="APA">APA</option>
                <option value="MLA">MLA</option>
                <option value="Chicago">Chicago</option>
                <option value="IEEE">IEEE</option>
              </select>
              
              <button 
                className="btn btn-secondary py-1 px-2 text-sm"
                onClick={closeCitation}
              >
                Close
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-background border border-white/10 rounded-lg">
            {citationLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <p className="text-white text-sm leading-relaxed">{citationText}</p>
            )}
          </div>
          
          <div className="flex gap-3 mt-4">
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={handleSaveCitation}
              disabled={!citationText}
            >
              <Save size={18} />
              <span>Save Citation</span>
            </button>
            
            <button 
              className="btn btn-secondary flex items-center gap-2"
              onClick={handleCopyCitation}
              disabled={!citationText}
            >
              {isCopied ? <Check size={18} /> : <Copy size={18} />}
              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
} 