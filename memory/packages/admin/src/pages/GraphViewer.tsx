import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ForceGraph2D from 'react-force-graph-2d';
import { entityApi, relationApi, graphApi, type Entity, type Relation } from '../api/client';

interface GraphNode {
  id: string;
  name: string;
  type: string;
  val: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
}

const TYPE_COLORS: Record<string, string> = {
  person: '#3b82f6',
  organization: '#10b981',
  location: '#f59e0b',
  concept: '#8b5cf6',
  event: '#ef4444',
  custom: '#6b7280',
};

export default function GraphViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [depth, setDepth] = useState(2);

  const { data: entities } = useQuery({
    queryKey: ['entities', 'list'],
    queryFn: () => entityApi.list(undefined, 200),
  });

  const { data: relations } = useQuery({
    queryKey: ['relations', 'list'],
    queryFn: () => relationApi.list(undefined, undefined, 500),
  });

  const { data: traversalData } = useQuery({
    queryKey: ['graph', 'traverse', selectedEntity, depth],
    queryFn: () => graphApi.traverse(selectedEntity!, depth),
    enabled: !!selectedEntity,
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graphData = useCallback(() => {
    if (selectedEntity && traversalData) {
      const nodes: GraphNode[] = traversalData.subGraph.entities.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        val: e.id === selectedEntity ? 15 : 10,
        color: TYPE_COLORS[e.type] ?? TYPE_COLORS.custom,
      }));

      const links: GraphLink[] = traversalData.subGraph.relations.map((r) => ({
        source: r.sourceId,
        target: r.targetId,
        type: r.type,
      }));

      return { nodes, links };
    }

    if (!entities || !relations) {
      return { nodes: [], links: [] };
    }

    const nodes: GraphNode[] = entities.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      val: 10,
      color: TYPE_COLORS[e.type] ?? TYPE_COLORS.custom,
    }));

    const entityIds = new Set(entities.map((e) => e.id));
    const links: GraphLink[] = relations
      .filter((r) => entityIds.has(r.sourceId) && entityIds.has(r.targetId))
      .map((r) => ({
        source: r.sourceId,
        target: r.targetId,
        type: r.type,
      }));

    return { nodes, links };
  }, [entities, relations, selectedEntity, traversalData]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedEntity(node.id === selectedEntity ? null : node.id);
  }, [selectedEntity]);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Knowledge Graph</h1>
        <div className="flex items-center gap-4">
          {selectedEntity && (
            <>
              <label className="text-sm text-gray-500">Depth:</label>
              <select
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="input w-auto"
              >
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSelectedEntity(null)}
                className="btn btn-secondary"
              >
                Show All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="card mb-4">
        <div className="flex gap-6 flex-wrap">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm capitalize">{type}</span>
            </div>
          ))}
        </div>
        {selectedEntity && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {depth}-hop neighborhood of selected entity. Click node to
            focus, or "Show All" to reset.
          </p>
        )}
      </div>

      {/* Graph Container */}
      <div ref={containerRef} className="card p-0 overflow-hidden h-[calc(100%-120px)]">
        {(!entities || entities.length === 0) ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No entities to display. Create some entities first.
          </div>
        ) : (
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData()}
            nodeLabel={(node: GraphNode) => `${node.name} (${node.type})`}
            nodeColor={(node: GraphNode) => node.color}
            nodeVal={(node: GraphNode) => node.val}
            linkLabel={(link: GraphLink) => link.type}
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.1}
            onNodeClick={handleNodeClick}
            nodeCanvasObject={(node: GraphNode, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              // Node circle
              ctx.beginPath();
              ctx.arc(node.x!, node.y!, node.val / 2, 0, 2 * Math.PI);
              ctx.fillStyle = node.color;
              ctx.fill();

              // Label
              ctx.fillStyle = '#333';
              ctx.fillText(label, node.x!, node.y! + node.val / 2 + fontSize);
            }}
          />
        )}
      </div>
    </div>
  );
}
