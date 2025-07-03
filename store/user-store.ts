import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StudySession = {
  id: string
  topic: string
  duration: number
  focusLevel: number
  date: Date
}

export type Citation = {
  id: string
  text: string
  format: 'APA' | 'MLA' | 'Chicago' | 'Harvard'
  source: string
  date: Date
}

export type CourseTimeline = {
  id: string
  title: string
  date: string
  description: string
  isCompleted: boolean
  isDue: boolean
}

// BrainMerge types
export type Researcher = {
  id: string
  name: string
  university: string
  field: string
  keywords: string[]
  bio: string
  matchableText: string
  publications: number
  profileURL: string
  email?: string
  verified?: boolean
  github?: string
  linkedin?: string
  department?: string
  dateAdded: Date
}

export type ResearcherMatch = {
  researcher: Researcher
  matchScore: number
  matchingKeywords: string[]
}

export type ConnectionRequest = {
  id: string
  fromResearcherId: string
  toResearcherId: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  date: Date
}

export type UserResearchProfile = {
  name: string
  email: string
  university: string
  field: string
  keywords: string[]
  bio: string
  isPublic: boolean
}

interface UserState {
  // User data
  username: string | null
  email: string | null
  isLoggedIn: boolean
  
  // StudyTime Synch data
  studySessions: StudySession[]
  totalStudyHours: number
  
  // Ghost Citations data
  savedCitations: Citation[]
  recentSearches: string[]
  
  // Syllabus Whisperer data
  courses: {
    id: string
    title: string
    timeline: CourseTimeline[]
  }[]
  
  // BrainMerge data
  researchers: Researcher[]
  userResearchProfile: UserResearchProfile | null
  connectionRequests: ConnectionRequest[]
  sentConnections: ConnectionRequest[]
  
  // Actions
  login: (username: string, email: string) => void
  logout: () => void
  addStudySession: (session: StudySession) => void
  saveCitation: (citation: Citation) => void
  addCourse: (course: { id: string, title: string, timeline: CourseTimeline[] }) => void
  updateCourseItem: (courseId: string, itemId: string, completed: boolean) => void
  
  // BrainMerge actions
  addResearcher: (researcher: Omit<Researcher, 'id' | 'dateAdded'>) => void
  updateUserResearchProfile: (profile: UserResearchProfile) => void
  sendConnectionRequest: (toResearcherId: string, message: string) => void
  respondToConnection: (requestId: string, status: 'accepted' | 'rejected') => void
  searchResearchers: (query: string) => ResearcherMatch[]
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      username: null,
      email: null,
      isLoggedIn: false,
      studySessions: [],
      totalStudyHours: 0,
      savedCitations: [],
      recentSearches: [],
      courses: [],
      researchers: [],
      userResearchProfile: null,
      connectionRequests: [],
      sentConnections: [],
      
      // Actions
      login: (username, email) => set({ username, email, isLoggedIn: true }),
      logout: () => set({ username: null, email: null, isLoggedIn: false }),
      
      addStudySession: (session) => set((state) => {
        const newTotalHours = state.totalStudyHours + (session.duration / 3600);
        return {
          studySessions: [...state.studySessions, session],
          totalStudyHours: newTotalHours
        };
      }),
      
      saveCitation: (citation) => set((state) => ({
        savedCitations: [...state.savedCitations, citation]
      })),
      
      addCourse: (course) => set((state) => ({
        courses: [...state.courses, course]
      })),
      
      updateCourseItem: (courseId, itemId, completed) => set((state) => ({
        courses: state.courses.map(course => 
          course.id === courseId 
            ? {
                ...course,
                timeline: course.timeline.map(item => 
                  item.id === itemId 
                    ? { ...item, isCompleted: completed }
                    : item
                )
              }
            : course
        )
      })),
      
      // BrainMerge actions
      addResearcher: (researcherData) => set((state) => {
        const newResearcher: Researcher = {
          ...researcherData,
          id: `researcher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          dateAdded: new Date()
        };
        return {
          researchers: [...state.researchers, newResearcher]
        };
      }),
      
      updateUserResearchProfile: (profile) => set({ userResearchProfile: profile }),
      
      sendConnectionRequest: (toResearcherId, message) => set((state) => {
        if (!state.userResearchProfile) return state;
        
        const newRequest: ConnectionRequest = {
          id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fromResearcherId: 'current-user', // In real app, this would be the current user's researcher ID
          toResearcherId,
          message,
          status: 'pending',
          date: new Date()
        };
        
        return {
          sentConnections: [...state.sentConnections, newRequest]
        };
      }),
      
      respondToConnection: (requestId, status) => set((state) => ({
        connectionRequests: state.connectionRequests.map(req =>
          req.id === requestId ? { ...req, status } : req
        )
      })),
      
      searchResearchers: (query: string): ResearcherMatch[] => {
        const state = get();
        const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        
        if (queryWords.length === 0) return [];
        
        const matches: ResearcherMatch[] = [];
        
        state.researchers.forEach(researcher => {
          const searchableText = researcher.matchableText.toLowerCase();
          const researcherKeywords = researcher.keywords.map(k => k.toLowerCase());
          
          // Calculate token-based similarity
          let matchingTokens = 0;
          let matchingKeywords: string[] = [];
          
          queryWords.forEach(queryWord => {
            // Check if query word appears in searchable text
            if (searchableText.includes(queryWord)) {
              matchingTokens++;
            }
            
            // Check for exact keyword matches
            researcherKeywords.forEach(keyword => {
              if (keyword.includes(queryWord) || queryWord.includes(keyword)) {
                if (!matchingKeywords.includes(keyword)) {
                  matchingKeywords.push(keyword);
                  matchingTokens += 2; // Keyword matches get higher weight
                }
              }
            });
          });
          
          // Calculate match score (0-100)
          const maxPossibleScore = queryWords.length * 3; // Max if all words match with keyword bonus
          const matchScore = Math.min(100, Math.round((matchingTokens / maxPossibleScore) * 100));
          
          // Only include matches above threshold
          if (matchScore >= 30) {
            matches.push({
              researcher,
              matchScore,
              matchingKeywords: matchingKeywords.slice(0, 3) // Limit to top 3 matching keywords
            });
          }
        });
        
        // Sort by match score descending
        return matches.sort((a, b) => b.matchScore - a.matchScore);
      }
    }),
    {
      name: 'eden-user-storage'
    }
  )
) 