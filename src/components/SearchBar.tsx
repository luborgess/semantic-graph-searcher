import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export const SearchBar = ({ searchQuery, setSearchQuery, handleSearch, isLoading }: SearchBarProps) => {
  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        type="text"
        placeholder="Digite sua pesquisa..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 dark:bg-[#2A2A2A] dark:border-gray-600 dark:text-white"
      />
      <Button 
        type="submit" 
        disabled={isLoading}
        className="dark:bg-purple-600 dark:hover:bg-purple-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Pesquisando...
          </>
        ) : (
          'Pesquisar'
        )}
      </Button>
    </form>
  );
};