import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearch, type SearchResult } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search } from 'lucide-react';

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';
  const { searchResults, isSearching, performSearch } = useSearch();

  React.useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  const getItemIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient': return '👤';
      case 'doctor': return '👨‍⚕️';
      case 'appointment': return '📅';
      case 'medicine': return '💊';
      default: return '📄';
    }
  };

  const handleItemClick = (item: SearchResult) => {
    switch (item.type) {
      case 'patient':
        navigate(`/patients/${item.id}`);
        break;
      case 'doctor':
        navigate(`/doctors/${item.id}`);
        break;
      case 'appointment':
        navigate(`/appointments/${item.id}`);
        break;
      case 'medicine':
        navigate(`/medicines/${item.id}`);
        break;
      default:
        // Handle other types
        break;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Search Results</h1>
      </div>

      <div className="mb-6">
        <p className="text-gray-600">
          {isSearching ? 'Searching...' : `Found ${searchResults.length} results for "${query}"`}
        </p>
      </div>

      <div className="space-y-4">
        {searchResults.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => handleItemClick(item)}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
          >
            <span className="text-2xl">{getItemIcon(item.type)}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{item.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <Badge variant="outline" className="capitalize">
                  {item.badge}
                </Badge>
              )}
              <Badge variant="secondary" className="capitalize">
                {item.type}
              </Badge>
            </div>
          </div>
        ))}

        {!isSearching && searchResults.length === 0 && query && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              No matches found for "{query}". Try adjusting your search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;