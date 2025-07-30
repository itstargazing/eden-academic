"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, FileText, ArrowRight, ExternalLink, Download, BookMarked, Filter, Save, Copy, Check, AlertCircle, Loader2 } from "lucide-react";
import { useUserStore, Citation } from "@/store/user-store";
import { CitationService, CitationMatch } from "@/lib/citation-service";

type SearchSources = {
  'Google Scholar': boolean;
  'JSTOR': boolean;
  'ArXiv': boolean;
  'PubMed': boolean;
  'Science Direct': boolean;
  'IEEE Xplore': boolean;
  'ACM Digital Library': boolean;
  'SpringerLink': boolean;
};

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
    'IEEE Xplore': true,
    'ACM Digital Library': true,
    'SpringerLink': true
  });
  const [activeCitation, setActiveCitation] = useState<CitationMatch | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'APA' | 'MLA' | 'Chicago' | 'IEEE' | 'Harvard'>('APA');
  const [isCopied, setIsCopied] = useState(false);
  const [citationText, setCitationText] = useState("");
  const [isGeneratingCitation, setIsGeneratingCitation] = useState(false);
  
  // Get user state from store
  const savedCitations = useUserStore(state => state.savedCitations);
  const saveCitation = useUserStore(state => state.saveCitation);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasResults(false);
    setResults([]);
    setActiveCitation(null);
    setCitationText("");
    
    try {
      // Get selected sources
      const selectedSources = (Object.keys(searchSources) as Array<keyof SearchSources>)
        .filter(source => searchSources[source]);
      
      const searchResults = await CitationService.searchCitations(searchQuery, selectedSources);
      
      setResults(searchResults);
      setHasResults(searchResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setHasResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const generateCitation = async (paper: CitationMatch) => {
    setActiveCitation(paper);
    setIsGeneratingCitation(true);
    
    try {
      // Simulate citation generation processing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const citation = CitationService.generateCitation(paper, selectedFormat);
      setCitationText(citation);
    } catch (error) {
      console.error('Citation generation error:', error);
      setCitationText("Error generating citation. Please try again.");
    } finally {
      setIsGeneratingCitation(false);
    }
  };
  
  // Update citation when format changes
  useEffect(() => {
    if (activeCitation && !isGeneratingCitation) {
      generateCitation(activeCitation);
    }
  }, [selectedFormat]);
  
  const handleViewSource = (result: CitationMatch) => {
    const url = CitationService.getSourceUrl(result);
    window.open(url, '_blank');
  };
  
  const isSourceAvailable = (result: CitationMatch) => {
    return CitationService.isSourceAccessible(result);
  };
  
  const handleSaveCitation = () => {
    if (!citationText || !activeCitation) return;
    
    const newCitation: Citation = {
      id: Date.now().toString(),
      text: citationText,
      format: selectedFormat,
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
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
      case 'journal':
        return <FileText size={16} className="text-blue-500" />;
      case 'book':
        return <BookOpen size={16} className="text-green-500" />;
      case 'conference':
        return <BookMarked size={16} className="text-purple-500" />;
      case 'thesis':
        return <FileText size={16} className="text-orange-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article':
      case 'journal':
        return 'text-blue-400';
      case 'book':
        return 'text-green-400';
      case 'conference':
        return 'text-purple-400';
      case 'thesis':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };
  
  return (
    <div className="space-y-8 feature-page">
      <section className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-background border border-white/20 rounded-lg">
            <Search size={32} className="text-red-500" />
          </div>
          <div>
            <h1 className="page-header">GhostCitations</h1>
            <p className="text-text-secondary">Find and format academic references from your memory</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Find Your Lost References</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="search-query" className="block text-white font-medium">
              Describe what you remember about the reference
            </label>
            <textarea
              id="search-query"
              rows={4}
              className="input"
              placeholder="e.g., 'A 2021 paper about AI ethics by Smith' or 'Machine learning in education research from 2022' or 'Quantum computing applications in cryptography'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSearch();
                }
              }}
            />
            <p className="text-xs text-text-secondary">
              Be as specific as possible. Include author names, years, topics, or journal names if you remember them.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Searching databases...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search Citations
                </>
              )}
            </button>
            
            <button 
              className="btn btn-secondary flex items-center gap-2"
              onClick={() => (document.getElementById('filters-dialog') as HTMLDialogElement)?.showModal()}
            >
              <Filter size={18} />
              Sources ({Object.values(searchSources).filter(Boolean).length})
            </button>
          </div>
        </div>
      </section>

      {/* Source filters dialog */}
      <dialog id="filters-dialog" className="bg-primary border border-white/10 rounded-lg p-6 shadow-xl text-white backdrop:bg-black/50">
        <h3 className="text-lg font-semibold mb-4">Select Search Sources</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(Object.keys(searchSources) as Array<keyof SearchSources>).map(source => (
            <button
              key={source}
              onClick={() => toggleSource(source)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                searchSources[source]
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-background hover:bg-white/5 text-white/70 border border-white/10'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button 
            className="btn btn-secondary"
            onClick={() => (document.getElementById('filters-dialog') as HTMLDialogElement)?.close()}
          >
            Done
          </button>
        </div>
      </dialog>

      {/* Search results */}
      {hasResults && (
        <section className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">Search Results</h2>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span>{results.length} citations found</span>
              <span>•</span>
              <span>Sorted by relevance</span>
            </div>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div 
                key={result.id} 
                className="p-6 bg-background border border-white/10 rounded-lg hover:border-white/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="icon-container">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full bg-white/5 ${getTypeColor(result.type)}`}>
                        {result.type}
                      </span>
                      {result.openAccess && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                          Open Access
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full">
                      {result.matchPercentage}% match
                    </span>
                    {result.citationCount && (
                      <span className="text-xs text-text-secondary">
                        {result.citationCount} citations
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="text-white font-medium mb-2 leading-tight">{result.title}</h3>
                <p className="text-text-secondary text-sm mb-3">
                  {result.authors} • {result.year} • {result.source}
                </p>
                <p className="text-white text-sm mb-4 leading-relaxed">{result.excerpt}</p>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    className="btn btn-secondary text-xs flex items-center gap-1 py-2 px-3"
                    onClick={() => generateCitation(result)}
                  >
                    <BookMarked size={14} />
                    Generate Citation
                  </button>
                  
                  <div className="relative group">
                    <button 
                      className={`btn text-xs flex items-center gap-1 py-2 px-3 ${
                        isSourceAvailable(result) 
                          ? 'btn-secondary' 
                          : 'btn-secondary opacity-75'
                      }`}
                      onClick={() => handleViewSource(result)}
                    >
                      <ExternalLink size={14} />
                      View Source
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

      {/* No results message */}
      {!isSearching && hasResults === false && searchQuery.trim() && (
        <section className="card">
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <h3 className="text-white font-medium mb-2">No citations found</h3>
            <p className="text-text-secondary mb-4">
              No matches found for "{searchQuery.slice(0, 50)}..."
            </p>
            <div className="text-sm text-text-secondary space-y-2">
              <p>Try:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Different keywords or phrases</li>
                <li>Author names if you remember them</li>
                <li>Publication year or journal name</li>
                <li>Broader topic terms</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Active citation view */}
      {activeCitation && (
        <section className="card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="section-title mb-2">Generated Citation</h2>
              <p className="text-text-secondary text-sm">
                {activeCitation.title} • {activeCitation.authors} • {activeCitation.year}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select 
                className="bg-background border border-white/10 text-white rounded-md px-3 py-2 text-sm"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as any)}
              >
                <option value="APA">APA Style</option>
                <option value="MLA">MLA Style</option>
                <option value="Chicago">Chicago Style</option>
                <option value="IEEE">IEEE Style</option>
                <option value="Harvard">Harvard Style</option>
              </select>
              
              <button 
                className="btn btn-secondary py-2 px-3 text-sm"
                onClick={closeCitation}
              >
                Close
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-background border border-white/10 rounded-lg">
            {isGeneratingCitation ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin mr-2" />
                <span className="text-text-secondary">Generating {selectedFormat} citation...</span>
              </div>
            ) : (
              <p className="text-white text-sm leading-relaxed font-mono">{citationText}</p>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={handleSaveCitation}
              disabled={!citationText || isGeneratingCitation}
            >
              <Save size={18} />
              Save Citation
            </button>
            
            <button 
              className="btn btn-secondary flex items-center gap-2"
              onClick={handleCopyCitation}
              disabled={!citationText || isGeneratingCitation}
            >
              {isCopied ? <Check size={18} /> : <Copy size={18} />}
              {isCopied ? 'Copied!' : 'Copy Citation'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
} 