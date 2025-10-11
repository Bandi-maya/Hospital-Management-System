import { useState, useCallback, useRef } from 'react';

export type SearchResultType = 'patient' | 'doctor' | 'appointment' | 'medicine' | 'other';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  name: string;
  title?: string;
  subtitle: string;
  badge?: string;
}

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Mock search function - replace with actual API calls
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Simulate API delay
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Mock data with proper typing
        const mockResults: SearchResult[] = [
          {
            id: '1',
            type: 'patient',
            name: 'John Smith',
            subtitle: 'Patient • Room 301',
            badge: 'Active'
          },
          {
            id: '2',
            type: 'doctor',
            name: 'Dr. Sarah Johnson',
            subtitle: 'Cardiologist • Department: Heart',
            badge: 'Available'
          },
          {
            id: '3',
            type: 'appointment',
            name: 'Appointment #A-123',
            subtitle: 'Today • 2:00 PM • Checkup',
            badge: 'Scheduled'
          },
          {
            id: '4',
            type: 'medicine',
            name: 'Amoxicillin',
            subtitle: 'Antibiotic • Stock: 45',
            badge: 'In Stock'
          },
          {
            id: '5',
            type: 'patient',
            name: 'Maria Garcia',
            subtitle: 'Patient • Room 205',
            badge: 'Discharged'
          }
        ].filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
        ) as SearchResult[]; // Type assertion to ensure proper typing

        setSearchResults(mockResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setIsSearching(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch
  };
};