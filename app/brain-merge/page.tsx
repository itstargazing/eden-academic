"use client";

import { useState, useRef, useEffect } from "react";
import { Brain, Users, Search, Share, Mail, Github, Linkedin, Star, Upload, FileText, X, Check, Send, AlertCircle, UserPlus, MessageSquare } from "lucide-react";
import { useUserStore, ResearcherMatch, UserResearchProfile } from "@/store/user-store";
import { initialResearchers } from "@/lib/researchers-db";

interface ConnectionModalData {
  researcher: ResearcherMatch['researcher'];
  isOpen: boolean;
}

export default function BrainMergePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ResearcherMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [connectionModal, setConnectionModal] = useState<ConnectionModalData>({ researcher: null as any, isOpen: false });
  const [connectionMessage, setConnectionMessage] = useState("");
  const [isSendingConnection, setIsSendingConnection] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  
  // Share research form state
  const [shareForm, setShareForm] = useState({
    name: "",
    email: "",
    university: "",
    field: "",
    keywords: "",
    bio: "",
    isPublic: true
  });
  
  // Store functions
  const { 
    researchers, 
    userResearchProfile, 
    searchResearchers, 
    addResearcher, 
    updateUserResearchProfile,
    sendConnectionRequest,
    isLoggedIn,
    username,
    email
  } = useUserStore();

  // Initialize database on first load
  useEffect(() => {
    if (researchers.length === 0) {
      // Seed the database with initial researchers
      initialResearchers.forEach(researcher => {
        addResearcher(researcher);
      });
    }
  }, []);

  // Populate form with user data if logged in
  useEffect(() => {
    if (isLoggedIn && username && email) {
      setShareForm(prev => ({
        ...prev,
        name: userResearchProfile?.name || username,
        email: userResearchProfile?.email || email
      }));
    }
  }, [isLoggedIn, username, email, userResearchProfile]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    
    setIsSearching(true);
    setHasSearched(false);
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const results = searchResearchers(searchQuery);
    setSearchResults(results);
    setHasSearched(true);
    setIsSearching(false);
  };

  const handleConnect = (researcher: ResearcherMatch['researcher']) => {
    setConnectionModal({ researcher, isOpen: true });
    setConnectionMessage(`Hi ${researcher.name.split(' ')[1]},\n\nI found your research on ${researcher.field} very interesting, particularly your work on ${researcher.keywords.slice(0, 2).join(' and ')}. I'd love to discuss potential collaboration opportunities.\n\nBest regards,\n${username || 'Anonymous'}`);
  };

  const sendConnection = async () => {
    if (!connectionMessage.trim() || !connectionModal.researcher) return;
    
    setIsSendingConnection(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    sendConnectionRequest(connectionModal.researcher.id, connectionMessage);
    
    setIsSendingConnection(false);
    setConnectionSuccess(true);
    
    // Close modal after success message
    setTimeout(() => {
      setConnectionModal({ researcher: null as any, isOpen: false });
      setConnectionSuccess(false);
      setConnectionMessage("");
    }, 2000);
  };

  const handleShareResearch = async () => {
    const { name, email, university, field, keywords, bio, isPublic } = shareForm;
    
    if (!name || !email || !university || !field || !bio) {
      alert('Please fill in all required fields');
      return;
    }

    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    const matchableText = `${field} ${bio} ${keywordArray.join(' ')} ${university}`.toLowerCase();

    // Create user research profile
    const profile: UserResearchProfile = {
      name,
      email,
      university,
      field,
      keywords: keywordArray,
      bio,
      isPublic
    };

    // Add user as a researcher if public
    if (isPublic) {
      addResearcher({
        name,
        university,
        field,
        keywords: keywordArray,
        bio,
        matchableText,
        publications: 0, // New user starts with 0
        profileURL: `/profile/${name.toLowerCase().replace(/\s+/g, '-')}`,
        email,
        verified: false,
        department: field
      });
    }

    updateUserResearchProfile(profile);
    setShowShareModal(false);
    
    // Reset form
    setShareForm({
      name: "",
      email: "",
      university: "",
      field: "",
      keywords: "",
      bio: "",
      isPublic: true
    });
  };

  const getFeaturedResearchers = () => {
    return researchers.slice(0, 3).map(researcher => ({
      researcher,
      matchScore: 85, // Default high score for featured
      matchingKeywords: researcher.keywords.slice(0, 2)
    }));
  };

  return (
    <div className="space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-background border border-white/20 rounded-lg">
            <Brain size={32} className="text-blue-500" />
          </div>
          <div>
            <h1 className="page-header">BrainMerge</h1>
            <p className="text-text-secondary">Find research collaborators with similar interests</p>
          </div>
        </div>
      </section>

      {/* Research Interest Matching */}
      <section className="card">
        <h2 className="section-title">Research Interest Matching</h2>
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-secondary" />
            </div>
            <input
              type="text"
              className="input w-full pl-10"
              placeholder="Enter your research topic or keywords (e.g., machine learning, biology, quantum physics)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Find Similar Research
                </>
              )}
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="btn btn-secondary flex items-center justify-center gap-2"
            >
              <Share size={20} />
              Share My Research
            </button>
          </div>
        </div>
      </section>

      {/* User Research Profile Display */}
      {userResearchProfile && (
        <section className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Your Research Profile</h2>
            <button 
              onClick={() => setShowShareModal(true)}
              className="btn btn-secondary text-sm"
            >
              Edit Profile
            </button>
          </div>
          <div className="p-4 bg-background border border-white/10 rounded-lg">
            <h3 className="text-white font-medium">{userResearchProfile.name}</h3>
            <p className="text-text-secondary text-sm">{userResearchProfile.university} • {userResearchProfile.field}</p>
            <p className="text-white text-sm mt-2">{userResearchProfile.bio}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {userResearchProfile.keywords.map((keyword, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                  {keyword}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                userResearchProfile.isPublic 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {userResearchProfile.isPublic ? 'Public Profile' : 'Private Profile'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Search Results / Featured Researchers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title mb-0">
            {hasSearched ? `Search Results (${searchResults.length} found)` : 'Featured Researchers'}
          </h2>
          {hasSearched && (
            <button 
              onClick={() => {
                setHasSearched(false);
                setSearchResults([]);
                setSearchQuery("");
              }}
              className="text-sm text-text-secondary hover:text-white"
            >
              Show Featured
            </button>
          )}
        </div>
        
        {hasSearched && searchResults.length === 0 ? (
          <div className="card text-center py-12">
            <AlertCircle size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <h3 className="text-white font-medium mb-2">No researchers found</h3>
            <p className="text-text-secondary mb-4">No strong matches found for "{searchQuery}"</p>
            <p className="text-text-secondary text-sm mb-6">Try different keywords or submit your own research profile to be discovered by others!</p>
            <button 
              onClick={() => setShowShareModal(true)}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <UserPlus size={18} />
              Share Your Research
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {(hasSearched ? searchResults : getFeaturedResearchers()).map((match, index) => (
              <div key={match.researcher.id} className="card">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-background border border-white/10">
                    <Users size={20} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-white flex items-center gap-2">
                          {match.researcher.name}
                          {match.researcher.verified && <Star size={16} className="text-yellow-500" />}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {match.researcher.university} • {match.researcher.department || match.researcher.field}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {match.researcher.github && (
                          <a 
                            href={match.researcher.github} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-text-secondary hover:text-white transition-colors"
                          >
                            <Github size={18} />
                          </a>
                        )}
                        {match.researcher.linkedin && (
                          <a 
                            href={match.researcher.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-text-secondary hover:text-white transition-colors"
                          >
                            <Linkedin size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-white text-sm mb-3">{match.researcher.bio}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {match.researcher.keywords.map((keyword, idx) => (
                        <span 
                          key={idx} 
                          className={`text-xs px-2 py-1 rounded-full border ${
                            hasSearched && match.matchingKeywords.includes(keyword)
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                              : 'bg-background border-white/10 text-white'
                          }`}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {hasSearched && (
                        <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400">
                          {match.matchScore}% Match
                        </span>
                      )}
                      <button 
                        onClick={() => handleConnect(match.researcher)}
                        className="inline-block px-3 py-1 text-sm rounded-full bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        Connect
                      </button>
                      <span className="inline-block px-3 py-1 text-sm rounded-full bg-background border border-white/10 text-text-secondary">
                        {match.researcher.publications} publications
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Share Research Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary rounded-lg w-full max-w-2xl p-6 border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Share Your Research Profile</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-full hover:bg-background text-text-secondary"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={shareForm.name}
                    onChange={(e) => setShareForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Dr. Jane Smith"
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={shareForm.email}
                    onChange={(e) => setShareForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="jane.smith@university.edu"
                    className="input w-full"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    University <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={shareForm.university}
                    onChange={(e) => setShareForm(prev => ({ ...prev, university: e.target.value }))}
                    placeholder="Stanford University"
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Field <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={shareForm.field}
                    onChange={(e) => setShareForm(prev => ({ ...prev, field: e.target.value }))}
                    placeholder="Computer Science"
                    className="input w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Research Keywords
                </label>
                <input
                  type="text"
                  value={shareForm.keywords}
                  onChange={(e) => setShareForm(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="machine learning, neural networks, AI, deep learning"
                  className="input w-full"
                />
                <p className="text-xs text-text-secondary mt-1">Separate keywords with commas</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Research Bio <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={shareForm.bio}
                  onChange={(e) => setShareForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Brief description of your research interests and current work..."
                  rows={4}
                  className="input w-full"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={shareForm.isPublic}
                  onChange={(e) => setShareForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4"
                />
                <label htmlFor="isPublic" className="text-sm text-white">
                  Make my profile public (others can find and connect with me)
                </label>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleShareResearch}
                  className="flex-1 btn btn-primary"
                >
                  Save Research Profile
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Modal */}
      {connectionModal.isOpen && connectionModal.researcher && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary rounded-lg w-full max-w-md p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Connect with Researcher</h3>
              <button 
                onClick={() => setConnectionModal({ researcher: null as any, isOpen: false })}
                className="p-1 rounded-full hover:bg-background text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-white/10">
                <Users size={20} className="text-blue-500" />
                <div>
                  <p className="text-white font-medium">{connectionModal.researcher.name}</p>
                  <p className="text-text-secondary text-sm">{connectionModal.researcher.university}</p>
                </div>
              </div>
            </div>
            
            {connectionSuccess ? (
              <div className="text-center py-6">
                <Check size={48} className="mx-auto mb-4 text-green-400" />
                <p className="text-green-400 font-medium">Connection request sent!</p>
                <p className="text-text-secondary text-sm mt-1">
                  They will receive your message and can respond directly.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    Message
                  </label>
                  <textarea
                    value={connectionMessage}
                    onChange={(e) => setConnectionMessage(e.target.value)}
                    placeholder="Introduce yourself and explain why you'd like to connect..."
                    rows={6}
                    className="input w-full"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={sendConnection}
                    disabled={isSendingConnection || !connectionMessage.trim()}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  >
                    {isSendingConnection ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Request
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setConnectionModal({ researcher: null as any, isOpen: false })}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 