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

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [
      { id: "example", name: "Search Example", val: 1, color: "#ff6b6b", group: 1 }
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
      // TODO: Replace with actual API call to Python backend
      // Mock data simulating search results and relationships
      const mockGraphData: GraphData = {
        nodes: [
          { id: "1", name: searchQuery, val: 2, color: "#ff6b6b", group: 1 },
          { id: "2", name: "Related Term 1", val: 1, color: "#4ecdc4", group: 2 },
          { id: "3", name: "Related Term 2", val: 1, color: "#45b7d1", group: 2 },
          { id: "4", name: "Keyword 1", val: 1, color: "#96ceb4", group: 3 },
          { id: "5", name: "Keyword 2", val: 1, color: "#96ceb4", group: 3 },
        ],
        links: [
          { source: "1", target: "2", value: 1 },
          { source: "1", target: "3", value: 1 },
          { source: "2", target: "4", value: 1 },
          { source: "3", target: "5", value: 1 },
        ]
      };
      
      setGraphData(mockGraphData);
      toast({
        title: "Success",
        description: "Search results updated",
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to perform search",
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
    <div className="min-h-screen bg-background p-6">
      <Card className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Semantic Graph Search</h1>
          <p className="text-muted-foreground">
            Search and visualize semantic relationships between terms
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter your search query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
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

        <div className="h-[600px] border rounded-lg overflow-hidden bg-black/5">
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node) => (node as any).color || "#ff6b6b"}
            nodeRelSize={6}
            linkWidth={2}
            linkColor={() => "#999"}
            backgroundColor="transparent"
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            d3VelocityDecay={0.1}
          />
        </div>

        <div className="text-sm text-muted-foreground text-center">
          Click on nodes to explore relationships. Drag to rearrange the graph.
        </div>
      </Card>
    </div>
  );
};

export default Index;