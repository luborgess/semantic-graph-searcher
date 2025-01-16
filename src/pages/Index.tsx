import { useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    val: number;
    color?: string;
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
      { id: "example", name: "Example Node", val: 1, color: "#ff6b6b" }
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
      // TODO: Replace with actual API call
      // Mock data for now
      const mockGraphData: GraphData = {
        nodes: [
          { id: "1", name: searchQuery, val: 2, color: "#ff6b6b" },
          { id: "2", name: "Related Term 1", val: 1, color: "#4ecdc4" },
          { id: "3", name: "Related Term 2", val: 1, color: "#45b7d1" },
        ],
        links: [
          { source: "1", target: "2", value: 1 },
          { source: "1", target: "3", value: 1 },
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

  return (
    <div className="min-h-screen bg-background p-6">
      <Card className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center">Graph Search</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter your search query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
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
          />
        </div>
      </Card>
    </div>
  );
};

export default Index;