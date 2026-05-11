export type ValueType = 'null' | 'undefined' | 'string' | 'number' | 'boolean' | 'nan' | 'object' | 'array' | 'function' | 'symbol' | 'bigint' | 'date' | 'regexp';



const createNormalString = (origin: any) => {
  return () => String(origin);
}

const createNumberString = (origin: any) => {
  return () => String(origin);
}

const createBigIntString = (origin: any) => {
  return () => {
    return String(origin) + 'n';
  };
}



export const createTextString = (origin: any) => {
  return () => {
    let str = String(origin);
    if (str.length > 100) {
      str = str.slice(0, 50) + '…' + str.slice(-49);
    }
    return JSON.stringify(str)
  };
}

const createObjectString = (origin: any) => {
  return () => '{…}';
}

const createArrayString = (origin: any) => {
  const count = origin.length;
  return () => `Array(${count})`;
}


const objectValueMap = {
  null: () => {
    return {
      type: 'null',
      toString: createNormalString(null),
    }
  },
  undefined: () => {
    return {
      type: 'undefined',
      toString: createNormalString(undefined),
    }
  },
  object: (value: any) => {
    return {
      type: 'object',
      toString: createObjectString(value),
    }
  },
  array: (value: any) => {
    return {
      type: 'array',
      toString: createArrayString(value),
    }
  },
  number: (value: any) => {
    return {
      type: 'number',
      toString: createNumberString(value),
    }
  },
  bigint: (value: any) => {
    return {
      type: 'bigint',
      toString: createBigIntString(value),
    }
  },
  boolean: (value: any) => {
    return {
      type: 'boolean',
      toString: createNormalString(value),
    }
  },
  date: (value: any) => {
    return {
      type: 'date',
      toString: createNormalString(value),
    }
  },
  regexp: (value: any) => {
    return {
      type: 'regexp',
      toString: createNormalString(value),
    }
  },
  string: (value: any) => {
    return {
      type: 'string',
      toString: createTextString(value),
    }
  },
  default: (value: any) => {
    return {
      type: 'default',
      toString: createNormalString(value),
    }
  },
}

const getObjectValueType = (value: any) => {
  if (value === null) {
    return 'null'
  };
  if (value === undefined) {
    return 'undefined'
  };
  if (value instanceof Array) {
    return 'array'
  };
  const type = typeof value;
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return 'date';
    };
    if (value instanceof RegExp) {
      return 'regexp'
    };
    if (value instanceof String) {
      return 'string'
    };
    if (value instanceof Number) {
      return 'number'
    };
    if (value instanceof Boolean) {
      return 'boolean'
    };
    return 'object'
  };
  // if (type === 'number' || type === 'bigint') {
  //   // if (Number.isInteger(value)) return 'int';
  //   // if (Number.isNaN(value)) return 'nan';
  //   // return 'float';
  //   return 'number'
  // }
  return type;
}

export type ObjectValue = {
  type: ValueType;
  toString: () => string;
}

export const getObjectValue = (value: any): ObjectValue => {
  const type = getObjectValueType(value);
  // @ts-ignore
  const fn = objectValueMap[type] || objectValueMap.default;
  return fn(value);
}


/**
// 1. 基本类型的包装对象
String      // new String('hello')
Number      // new Number(123)
Boolean     // new Boolean(true)
BigInt      // new BigInt(123n)  // 注意：BigInt() 不能使用 new
Symbol      // Symbol('sym')     // 不能使用 new
// 2. 日期和时间
Date        // new Date()

// 3. 正则表达式
RegExp      // new RegExp('pattern', 'flags')

// 4. 错误类型
Error       // new Error('message')
TypeError   // new TypeError()
RangeError  // new RangeError()
SyntaxError // new SyntaxError()
ReferenceError // new ReferenceError()

// 5. 原始值包装（不可变）
Object      // new Object() - 通用包装
// 6. 键值集合
Map         // new Map()
WeakMap     // new WeakMap()
Set         // new Set()
WeakSet     // new WeakSet()

// 7. 数组缓冲
Array       // new Array()
ArrayBuffer // new ArrayBuffer(10)
SharedArrayBuffer // new SharedArrayBuffer(10)

// 8. 类型化数组
Int8Array
Uint8Array
Uint8ClampedArray
Int16Array
Uint16Array
Int32Array
Uint32Array
Float32Array
Float64Array
BigInt64Array
BigUint64Array

// 9. 数据视图
DataView    // new DataView(buffer)
// 10. 函数相关
Function    // new Function('a', 'b', 'return a + b')
AsyncFunction // async function 的构造函数
GeneratorFunction // function* 的构造函数

// 11. 代理
Proxy       // new Proxy(target, handler)  // 特殊，不是构造函数式用法
// 12. 数学和工具
Math        // 静态对象，不能 new
JSON        // 静态对象，不能 new
Atomics     // 静态对象，不能 new
Reflect     // 静态对象，不能 new

// 13. 国际化
Intl
Intl.DateTimeFormat
Intl.NumberFormat
Intl.Collator

// 14. 结构化数据
ArrayBuffer
SharedArrayBuffer
Atomics
DataView

// 15. 控制抽象
Promise
AsyncFunction
Generator
GeneratorFunction

// 16. 反射
Reflect
Proxy
 */