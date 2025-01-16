import { useState, useCallback } from "react";
import { ForceGraph2D } from "react-force-graph";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    val: number;
    color?: string;
    group?: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    value: number;
  }>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// Purple color palette for nodes
const nodeColors = {
  light: "#8b5cf6", // Purple-500
  dark: "#a78bfa",  // Purple-400 (brighter for dark mode)
};

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [
      { 
        id: "example", 
        name: "Search Example", 
        val: 1, 
        color: nodeColors.light, 
        group: 1 
      }
    ],
    links: []
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/search/${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Add colors to nodes
      data.nodes = data.nodes.map((node: any) => ({
        ...node,
        color: document.documentElement.classList.contains('dark') ? nodeColors.dark : nodeColors.light
      }));
      setGraphData(data);
      
      toast({
        title: "Success",
        description: "Search results updated",
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to search service. Please ensure the backend server is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = useCallback((node: any) => {
    toast({
      title: "Node Selected",
      description: `Selected: ${node.name}`,
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background p-6 dark:bg-gray-900 transition-colors duration-200">
      <Card className="max-w-6xl mx-auto p-6 space-y-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold dark:text-white">Semantic Graph Search</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Search and visualize semantic relationships between terms
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter your search query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </form>

        <div className="h-[600px] border rounded-lg overflow-hidden bg-black/5 dark:bg-gray-900/50 dark:border-gray-700">
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node) => (node as any).color || (document.documentElement.classList.contains('dark') ? nodeColors.dark : nodeColors.light)}
            nodeRelSize={6}
            linkWidth={2}
            linkColor={() => document.documentElement.classList.contains('dark') ? "#4c4f5a" : "#999"}
            backgroundColor="transparent"
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            d3VelocityDecay={0.1}
          />
        </div>

        <div className="text-sm text-muted-foreground dark:text-gray-400 text-center">
          Click on nodes to explore relationships. Drag to rearrange the graph.
        </div>
      </Card>
    </div>
  );
};

export default Index;