
import { useState, useMemo, useEffect } from 'react';
import { getPromptScoreSync } from '@/utils/promptScore';

interface UsePromptFilteringProps {
  prompts: any[];
}

export const usePromptFiltering = ({ prompts }: UsePromptFilteringProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Load view preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('promptViewMode');
    if (savedViewMode === 'table' || savedViewMode === 'kanban') {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewModeChange = (mode: 'kanban' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('promptViewMode', mode);
  };

  const filteredAndSortedPrompts = useMemo(() => {
    if (!prompts) return [];

    let filtered = prompts.filter((prompt) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || prompt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_at_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'updated_at_desc':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'score_desc': {
          const scoreA = getPromptScoreSync(a.content).score;
          const scoreB = getPromptScoreSync(b.content).score;
          return scoreB - scoreA;
        }
        case 'score_asc': {
          const scoreA = getPromptScoreSync(a.content).score;
          const scoreB = getPromptScoreSync(b.content).score;
          return scoreA - scoreB;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [prompts, searchQuery, statusFilter, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== 'all') count++;
    if (sortBy !== 'created_at_desc') count++;
    return count;
  }, [searchQuery, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('created_at_desc');
  };

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode: handleViewModeChange,
    filteredAndSortedPrompts,
    activeFiltersCount,
    clearFilters
  };
};
