import { ObjectValue, getObjectValue } from './core';
let __id = 1;
const getId = () => {
  return __id++;
}

function getObjectEntries(obj: any, count = 5) {
  let entries = [];
  for (let key in obj) {
    if (entries.length >= count) {
      break;
    }
    if (obj.hasOwnProperty(key)) {
      entries.push([key, obj[key]]);
    }
  };
  return entries;
}


/** 渲染引擎 */
const renderEngine = {
  key(key: string) {
    return <span className="pjv-key">{key}</span>
  },
  keyAttr(key: string) {
    return <span className="pjv-key--attr">{key}</span>
  },
  size(size: string) {
    return <span className="pjv-size">{size}</span>
  },

  /** 直接渲染value值 */
  value(origin: any) {
    const objectValue = getObjectValue(origin);
    return (
      <span className={`pjv-value pjv-value--${objectValue.type}`}>{objectValue.toString()}</span>
    )
  },
  /** 渲染分号 */
  colon() {
    return <span className="pjv-colon">:</span>
  },
  /** 渲染逗号 */
  comma() {
    return (
      <span className="pjv-comma">,</span>
    )
  },
  /** 渲染省略号 */
  ellipsis() {
    return (
      <span className="pjv-ellipsis">…</span>
    )
  },
  /** 渲染括号 */
  brackets(type: string) {
    return <span className="pjv-brackets">{type}</span>
  },
  /** 渲染引号 */
  quotes(value: string) {
    return <span className="pjv-quotes">{value}</span>
  },
}


const renderObjectView = (origin: any, objectValue: ObjectValue) => {
  // 获取对象的前5个键值对
  const entries = getObjectEntries(origin, 6);
  let children = entries.slice(0, 5).flatMap(([key, value]) => {
    return [
      renderEngine.keyAttr(key),
      renderEngine.colon(),
      renderEngine.value(value),
      renderEngine.comma(),
    ]
  })
  
  if (entries.length > 5) {
    children.push(renderEngine.ellipsis());
  } else {
    children = children.slice(0, children.length - 1);
  }
  return [renderEngine.brackets('{')].concat(children).concat([renderEngine.brackets('}')]);
}

const renderArrayView = (origin: any, objectValue: ObjectValue) => {
  let children = origin.slice(0, 100).flatMap((value: any) => {
    return [
      renderEngine.value(value),
      renderEngine.comma()
    ];
  });
  if (origin.length > 100) {
    children.push(renderEngine.ellipsis());
  } else {
    children = children.slice(0, children.length - 1);
  }
  return [
    renderEngine.size('(' + origin.length + ') '),
    renderEngine.brackets('[')
  ].concat(children).concat([renderEngine.brackets(']')]);
}

const renderView = (node: TreeNode) => {
  const objectValue = node.objectValue;
  const objectValueType = node.objectValue.type;
  const origin = node.origin;

  let valueViews = [];

  if (objectValueType === 'array') {
    valueViews = renderArrayView(origin, objectValue);
  } else if (objectValueType === 'object') {
    valueViews = renderObjectView(origin, objectValue);
  } else {
    // 未来扩展map
    // Map(10000) {0 => 8, 1 => 8, 2 => 8, 3 => 8, 4 => 8, …}
    valueViews = [renderEngine.value(origin)];
  }
  if (node.parentKey !== undefined) {
    return [
      renderEngine.key(node.parentKey),
      renderEngine.colon(),
    ].concat(valueViews)
  }
  return valueViews;
}



function hasAnyKeySimple(obj: any) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return true
    }
  };
  return false;
}

export class TreeNode {
  key!: number;
  children?: TreeNode[];
  expanded = false;
  depth: number;
  origin: any;
  objectValue: ObjectValue;
  leaf!: boolean;
  view!: any;
  parentKey?: string;
  constructor(origin: any, options?: any) {
    this.key = getId();
    this.origin = origin;
    this.depth = options?.depth || 0;
    this.parentKey = options?.parentKey;
    this.objectValue = getObjectValue(origin);
    if (this.objectValue.type === 'array') {
      this.leaf = !origin.length;
    } else if (this.objectValue.type === 'object') {
      this.leaf = !hasAnyKeySimple(origin);
    } else {
      this.leaf = true;
    }
    this.view = renderView(this);
  }

  

  
  getNodes(): TreeNode[] {
    const nodes: TreeNode[] = [this];
    if (!this.expanded) {
      return nodes
    }
    return nodes.concat((this.children || []).flatMap(child => child.getNodes()));
  }

  createChildren() {
    const objectValueType = this.objectValue.type;
    const origin = this.origin;
    const nextDepth = this.depth + 1;
    if (objectValueType === 'object') {
      const children = [];
      for (let key in origin) {
        if (origin.hasOwnProperty(key)) {
          children.push(new TreeNode(origin[key], { depth: nextDepth, parentKey: key }));
        }
      }
      return children;
    }
    if (objectValueType === 'array') {
      return origin.map((value: any, index: number) => {
        return new TreeNode(value, { depth: nextDepth, parentKey: index });
      });
    }
  }

  /** 展开 或 收起 */
  expand(newExpanded: boolean) {
    this.expanded = newExpanded;
    // 如果展开，但是子节点 未进行初始化，需要对所有的子节点进行初始化
    if(newExpanded && !this.children && !this.leaf) {
      this.children = this.createChildren();
    }
  }
}