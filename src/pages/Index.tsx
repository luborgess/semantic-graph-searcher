import { useState, useCallback } from "react";
import { ForceGraph2D } from "react-force-graph";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Moon, Sun } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

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

// Use environment variable with fallback for development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://your-deployed-backend-url.com";

// Obsidian-like color palette
const nodeColors = {
  light: {
    node: "#9b87f5",
    link: "rgba(155, 135, 245, 0.2)",
    background: "rgba(255, 255, 255, 0.9)"
  },
  dark: {
    node: "#a78bfa",
    link: "rgba(167, 139, 250, 0.2)",
    background: "rgba(22, 22, 22, 0.9)"
  }
};

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains("dark")
  );
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [
      { 
        id: "example", 
        name: "Search Example", 
        val: 1, 
        color: isDarkMode ? nodeColors.dark.node : nodeColors.light.node,
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
    
    // Update node colors when theme changes
    setGraphData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({
        ...node,
        color: newDarkMode ? nodeColors.dark.node : nodeColors.light.node
      }))
    }));
  };

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
      console.log("Fetching from:", `${BACKEND_URL}/api/search/${encodeURIComponent(searchQuery)}`);
      
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
        color: isDarkMode ? nodeColors.dark.node : nodeColors.light.node
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
        description: "Failed to connect to search service. Please try again later.",
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
    <div className="min-h-screen bg-background p-6 dark:bg-[#1A1F2C] transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <Toggle
          pressed={isDarkMode}
          onPressedChange={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="p-2 hover:bg-accent"
        >
          {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Toggle>
      </div>

      <Card className="max-w-6xl mx-auto p-6 space-y-6 dark:bg-[#221F26] dark:border-gray-700 bg-opacity-90">
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
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </form>

        <div className="h-[600px] border rounded-lg overflow-hidden bg-black/5 dark:bg-[#1A1F2C]/50 dark:border-gray-700">
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node) => (node as any).color}
            nodeRelSize={6}
            linkWidth={1.5}
            linkColor={() => isDarkMode ? nodeColors.dark.link : nodeColors.light.link}
            backgroundColor={isDarkMode ? nodeColors.dark.background : nodeColors.light.background}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            d3VelocityDecay={0.1}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = (node as any).name;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

              ctx.fillStyle = isDarkMode ? 'rgba(22, 22, 22, 0.8)' : 'rgba(255, 255, 255, 0.8)';
              ctx.fillRect(
                (node as any).x - bckgDimensions[0] / 2,
                (node as any).y - bckgDimensions[1] / 2,
                bckgDimensions[0],
                bckgDimensions[1]
              );

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = isDarkMode ? nodeColors.dark.node : nodeColors.light.node;
              ctx.fillText(label, (node as any).x, (node as any).y);
            }}
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