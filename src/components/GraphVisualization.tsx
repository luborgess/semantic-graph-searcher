import React from 'react';
import { ForceGraph2D } from 'react-force-graph';

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

interface GraphVisualizationProps {
  graphData: GraphData;
  isDarkMode: boolean;
  handleNodeClick: (node: any) => void;
}

const nodeColors = {
  light: {
    node: '#9b87f5',
    link: 'rgba(155, 135, 245, 0.2)',
    background: 'rgba(255, 255, 255, 0.9)'
  },
  dark: {
    node: '#a78bfa',
    link: 'rgba(167, 139, 250, 0.2)',
    background: 'rgba(22, 22, 22, 0.9)'
  }
};

export const GraphVisualization = ({ graphData, isDarkMode, handleNodeClick }: GraphVisualizationProps) => {
  return (
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
  );
};