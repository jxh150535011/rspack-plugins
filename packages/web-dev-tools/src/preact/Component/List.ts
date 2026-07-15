import { useState, useRef, useEffect, useMemo} from 'preact/hooks';
import { html } from 'htm/preact';


const ListItem = (props: any) => {
  const { item, id, visible } = props;
  // __vm_list_item 最小高度为20px
  // 增加可视监听， 当前元素可见， 才进行渲染内部节点

  const children = visible ? (
    [
      item.label ? html`<div className="__vm_list_item_label">${item.label}</div>` : null,
      html`<div className="__vm_list_item_value">${item.value}</div>`
    ]
  ) : null

  return html`
    <div 
      className="__vm_list_item ${item.className || ''}"
      data-id="${id}"
    >
      ${children}
    </div>
  `
}


const hasIntersectionObserver = 'IntersectionObserver' in window;

const useIntersectionObserver = (targetRef: any, callback: any, depsKeys: any[]) => {
  useEffect(() => {
    const $target: HTMLElement = targetRef.current;
    if (!$target || !hasIntersectionObserver) {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // @ts-ignore
        if (entry.target && entry.isIntersecting) {
          callback(entry.target.getAttribute('data-id'));
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    $target.querySelectorAll('.__vm_list_item').forEach(item => {
      observer.observe(item);
    });
    return () => {
      observer.disconnect();
    };
  }, [targetRef.current].concat(depsKeys));
}


export interface ListProps {
  options: any[];
  className?: string;
}


export const List = (props: ListProps) => {
  const { options = [], className } = props;
  const targetRef = useRef<any>(null);
  const visibleKeysSetRef = useRef(new Set<string>());
  const [refreshKey, setRefreshKey] = useState(0);

  useIntersectionObserver(targetRef, (key: string) => {
    visibleKeysSetRef.current.add(key);
    setRefreshKey((prevState) => {
      return prevState + 1;
    });
  }, [options, options.length]);


  const list = useMemo(() => {
    const visibleSet = visibleKeysSetRef.current;
    return options.map((item: any, index: number) => {
      const id = String(item.id || index);
      return {
        origin: item,
        id,
        visible: hasIntersectionObserver ? visibleSet.has(id) : true,
      }
    });
  }, [refreshKey, options]);

  return html`
    <div className="__vm_list ${className}" ref="${targetRef}">
      ${list.map((item, index) => html`
        <${ListItem} item="${item.origin}" key="${item.id}" visible="${item.visible}" id="${item.id}" />
      `)}
    </div>
  `;
}