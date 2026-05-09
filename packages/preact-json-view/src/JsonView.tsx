import { useState, useEffect } from 'preact/hooks';
import { vscodeTheme } from './theme';
import './style/index.less';

interface JsonViewProps {
  data: unknown;
  theme?: any;
  initialExpanded?: boolean;
  expandDepth?: number;
  maxItems?: number;
}

interface TreeNode {
  key: string | null;
  value: unknown;
  type: string;
  expanded: boolean;
  children?: TreeNode[];
}

const MAX_ITEMS = 100;

// function getType(value: any) {
//   if (value === null) return 'null';
//   if (value === undefined) return 'undefined';
//   if (Array.isArray(value)) return 'array';
//   if (typeof value === 'object') return 'object';
//   if (typeof value === 'number') {
//     if (Number.isInteger(value)) return 'int';
//     if (Number.isNaN(value)) return 'nan';
//     return 'float';
//   }
//   if (typeof value === 'bigint') return 'bigint';
//   return typeof value;
// }

// function buildTree(value: any, key: string | null, depth: number, maxDepth: number) {
//   const type = getType(value);
//   let children;

//   if ((type === 'array' || type === 'object') && depth < maxDepth) {
//     const items = type === 'array' ? value : Object.entries(value);
//     children = items.map((item: any[] | string, index: number) => {
//       const itemKey = type === 'array' ? String(index) : item[0];
//       const itemValue = type === 'array' ? item : item[1];
//       return buildTree(itemValue, itemKey, depth + 1, maxDepth);
//     });
//   }

//   return {
//     key,
//     value,
//     type,
//     expanded: depth === 0,
//     children,
//   };
// }

// function renderValue(value: any, type: string) {
//   switch (type) {
//     case 'string': {
//       const strValue = String(value);
//       if (strValue.length > 100) {
//         return (
//           <span className=\"rjv-value rjv-value--string\">
//             <span className=\"rjv-quotes\">\"</span>
//             {strValue.slice(0, 100)}...
//             <span className=\"rjv-quotes\">\"</span>
//           </span>
//         );
//       }
//       return (
//         <span className=\"rjv-value rjv-value--string\">
//           <span className=\"rjv-quotes\">\"</span>
//           {strValue}
//           <span className=\"rjv-quotes\">\"</span>
//         </span>
//       );
//     }
//     case 'int':
//     case 'float':
//     case 'bigint':
//       return <span className=\"rjv-value rjv-value--number\">{String(value)}</span>;
//     case 'boolean':
//       return <span className=\"rjv-value rjv-value--boolean\">{String(value)}</span>;
//     case 'null':
//       return <span className=\"rjv-value rjv-value--null\">null</span>;
//     case 'undefined':
//       return <span className=\"rjv-value rjv-value--undefined\">undefined</span>;
//     case 'nan':
//       return <span className=\"rjv-value rjv-value--nan\">NaN</span>;
//     case 'array':
//       return <span className=\"rjv-brackets\">[{(value || []).length}]</span>;
//     case 'object':
//       return <span className=\"rjv-braces\">{{Object.keys(value).length}}</span>;
//     default:
//       return <span>{String(value)}</span>;
//   }
// }

// function TreeItem({ node, depth, maxDepth, maxItems, onToggle }) {
//   const [displayCount, setDisplayCount] = useState(Math.min(node.children?.length || 0, maxItems));
//   const hasMore = (node.children?.length || 0) > displayCount;

//   const handleLineClick = () => {
//     if (node.children && depth < maxDepth) {
//       onToggle(node);
//     }
//   };

//   const handleExpandMore = () => {
//     setDisplayCount(node.children?.length || 0);
//   };

//   return (
//     <li className=\"rjv-node\">
//       <div className=\"rjv-node__line\" onClick={handleLineClick}>
//         {node.children && depth < maxDepth && (
//           <span className={`rjv-arrow ${node.expanded ? 'rjv-arrow--expanded' : ''}`}>
//             <svg viewBox=\"0 0 24 24\">
//               <path d=\"M7 10l5 5 5-5H7z\" />
//             </svg>
//           </span>
//         )}
//         {node.key !== null && (
//           <>
//             <span className=\"rjv-key\">\"{node.key}\"</span>
//             <span className=\"rjv-colon\">:</span>
//           </>
//         )}
//         {!node.children || depth >= maxDepth ? (
//           renderValue(node.value, node.type)
//         ) : (
//           <>
//             {node.type === 'array' ? (
//               <span className=\"rjv-brackets\">[</span>
//             ) : (
//               <span className=\"rjv-braces\">{`{`}</span>
//             )}
//             <span className=\"rjv-info\">
//               {node.type === 'array' ? 'Array' : 'Object'} ({node.children.length})
//             </span>
//             {node.type === 'array' ? (
//               <span className=\"rjv-brackets\">]</span>
//             ) : (
//               <span className=\"rjv-braces\">{`}`}</span>
//             )}
//           </>
//         )}
//       </div>
//       {node.expanded && node.children && depth < maxDepth && (
//         <ul className=\"rjv-children\">
//           {node.children.slice(0, displayCount).map((child, index) => (
//             <TreeItem
//               key={`${node.key || 'root'}-${index}`}
//               node={child}
//               depth={depth + 1}
//               maxDepth={maxDepth}
//               maxItems={maxItems}
//               onToggle={onToggle}
//             />
//           ))}
//           {hasMore && (
//             <li className=\"rjv-expand-more\" onClick={handleExpandMore}>
//               ... ({(node.children.length - displayCount)} more items)
//             </li>
//           )}
//         </ul>
//       )}
//     </li>
//   );
// }

export function JsonView(props: JsonViewProps) {
  const { data, theme = {}, initialExpanded = true, expandDepth = Infinity, maxItems = MAX_ITEMS } = props;
  const [tree, setTree] = useState(null);

  // useEffect(() => {
  //   const mergedTheme = { ...vscodeTheme, ...theme };
  //   const root = document.documentElement;
  //   Object.entries(mergedTheme).forEach(([key, value]) => {
  //     root.style.setProperty(key, value);
  //   });
  //   return () => {
  //     Object.keys(mergedTheme).forEach((key) => {
  //       root.style.removeProperty(key);
  //     });
  //   };
  // }, [theme]);

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
    <div className="pjv-container">
      Hello World
      {tree ? (
        <ul className="pjv-tree">
          {/* <TreeItem
            node={tree}
            depth={0}
            maxDepth={expandDepth}
            maxItems={maxItems}
            onToggle={handleToggle}
          /> */}
        </ul>
      ) : (
        <span className="pjv-value pjv-value--null">null</span>
      )}
    </div>
  );
}