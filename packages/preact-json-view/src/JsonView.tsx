import { useState, useEffect, useRef, useMemo } from 'preact/hooks';
import { vscodeTheme } from './theme';
import VirtualList from 'preact-virtual-list';
import './style/index.less';
import { TreeNode } from './utils';

interface JsonViewProps {
  value: any;
}

export interface TreeNodeViewProps {
  node: TreeNode;
  onClick: (node: TreeNode) => void;
}

export const TreeNodeView = (props: TreeNodeViewProps) => {
  const { node, onClick } = props;

  const className = [
    'pjv-node',
    node.leaf ? 'leaf' : '',
    node.expanded ? 'expanded' : '',
    node.depth ? '' : 'root',
  ].join(' ');

  const handleClick = () => {
    onClick?.(node);
  }

  return (
    <div className={className} style={{'--var-depth': node.depth}} onClick={handleClick}>
      <div className="pjv-node__line">
        {node.view}
      </div>
    </div>
  )
}


export interface TreeViewProps {
  root: TreeNode;
  refreshKey: number;
  onNodeClick: (node: TreeNode) => void;
}

export const TreeView = (props: TreeViewProps) => {
  const { root, refreshKey, onNodeClick } = props;
  const handleNodeClick = (node: TreeNode) => {
    onNodeClick(node);
  }

  const nodeViews = useMemo(() => {
    const nodes = root.getNodes();
    return nodes.map(node => {
      return <TreeNodeView key={node.key} node={node} onClick={handleNodeClick} />
    })
  }, [root, refreshKey])

  return (
    <div className="pjv-tree">
      {nodeViews}
    </div>
  )
}



export function JsonView(props: JsonViewProps) {
  const { value } = props;
  const [refreshKey, setRefreshKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const root = useRef<TreeNode>(new TreeNode(value));
  useEffect(() => {
    const $container = containerRef.current;
    if (!$container) {
      return;
    }
    Object.entries(vscodeTheme).forEach(([key, value]) => {
      $container.style.setProperty(key, value);
    });
  }, []);


  const handleNodeClick  = (node: TreeNode) => {
    node.expand(!node.expanded)
    setRefreshKey(refreshKey + 1);
  }


  // useEffect(() => {

  // }, [data, expandDepth]);

  // useEffect(() => {
  //   setTree(buildTree(data, null, 0, expandDepth));
  // }, [data, expandDepth]);

  // const handleToggle = (node) => {
  //   setTree((prev) => {
  //     if (!prev) return null;
  //     const updateNode = (n) => {
  //       if (n === node) {
  //         return { ...n, expanded: !n.expanded };
  //       }
  //       if (n.children) {
  //         return { ...n, children: n.children.map(updateNode) };
  //       }
  //       return n;
  //     };
  //     return updateNode(prev);
  //   });
  // };

  return (
    <div className="pjv-container" ref={containerRef}>
      <TreeView
        root={root.current}
        refreshKey={refreshKey}
        onNodeClick={handleNodeClick}
      />
      {/* <VirtualList
        sync={true}
        data={value}
        rowHeight={16}
        renderRow={({ item }) => (
          <div className="pjv-item" key={item}>
            {item}
          </div>
        )}
      /> */}
    </div>
  );
}