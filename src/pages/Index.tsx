import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Moon, Sun } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { SearchBar } from "@/components/SearchBar";
import { GraphVisualization } from "@/components/GraphVisualization";

// Use environment variable with fallback for development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains("dark")
  );
  const [graphData, setGraphData] = useState({
    nodes: [
      { 
        id: "example", 
        name: "Iniciar Pesquisa", 
        val: 1, 
        color: isDarkMode ? '#a78bfa' : '#9b87f5',
        group: 1 
      }
    ],
    links: []
  });

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    setGraphData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({
        ...node,
        color: newDarkMode ? '#a78bfa' : '#9b87f5'
      }))
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite um termo para pesquisar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Conectando ao backend em:", BACKEND_URL);
      
      const response = await fetch(`${BACKEND_URL}/api/search/${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta do backend:", errorText);
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }
      
      const data = await response.json();
      data.nodes = data.nodes.map((node: any) => ({
        ...node,
        color: isDarkMode ? '#a78bfa' : '#9b87f5'
      }));
      setGraphData(data);
      
      toast({
        title: "Sucesso",
        description: "Resultados da pesquisa atualizados",
      });
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      toast({
        title: "Erro",
        description: "Falha ao conectar ao serviço de pesquisa. Verifique se o servidor backend está rodando e acessível.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = useCallback((node: any) => {
    toast({
      title: "Nó Selecionado",
      description: `Selecionado: ${node.name}`,
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background p-6 dark:bg-[#1A1F2C] transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <Toggle
          pressed={isDarkMode}
          onPressedChange={toggleDarkMode}
          aria-label="Alternar modo escuro"
          className="p-2 hover:bg-accent"
        >
          {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Toggle>
      </div>

      <Card className="max-w-6xl mx-auto p-6 space-y-6 dark:bg-[#221F26] dark:border-gray-700 bg-opacity-90">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold dark:text-white">Pesquisa Semântica em Grafos</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Pesquise e visualize relações semânticas entre termos
          </p>
        </div>
        
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isLoading={isLoading}
        />

        <GraphVisualization
          graphData={graphData}
          isDarkMode={isDarkMode}
          handleNodeClick={handleNodeClick}
        />

        <div className="text-sm text-muted-foreground dark:text-gray-400 text-center">
          Clique nos nós para explorar relações. Arraste para reorganizar o grafo.
        </div>
      </Card>
    </div>
  );
};

export default Index;