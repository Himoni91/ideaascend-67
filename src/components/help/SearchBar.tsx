
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useHelpCenter } from '@/hooks/use-help-center';
import { useDebounce } from '@/hooks/use-debounce';
import { useNavigate } from 'react-router-dom';

export function SearchBar() {
  const { searchArticles, searchResults, setSearchQuery } = useHelpCenter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleSearch = async () => {
      if (debouncedQuery.trim().length > 1) {
        setIsSearching(true);
        await searchArticles(debouncedQuery);
        setIsSearching(false);
        setIsResultsOpen(true);
      } else {
        setIsResultsOpen(false);
      }
    };

    handleSearch();
  }, [debouncedQuery, searchArticles]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsResultsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClear = () => {
    setQuery('');
    setIsResultsOpen(false);
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleResultClick = (slug: string) => {
    navigate(`/help/article/${slug}`);
    setIsResultsOpen(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search for answers..."
          className="pl-10 pr-10 py-6 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) {
              setIsResultsOpen(true);
            }
          }}
        />
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </motion.div>
          )}
          {!isSearching && query && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isResultsOpen && searchResults.length > 0 && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-96 overflow-auto"
          >
            <div className="p-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
                {searchResults.length} results found
              </h3>
              <div className="space-y-1">
                {searchResults.map(({ article }) => (
                  <button
                    key={article.id}
                    className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors flex items-start"
                    onClick={() => handleResultClick(article.slug)}
                  >
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {article.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                      </p>
                      {article.category && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                          {article.category.name}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
