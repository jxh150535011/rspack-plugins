
export interface MonitorMessageType {
  type: 'console' | 'network' | 'default' | string;
  data: MonitorConsoleDataType | MonitorNetworkDataType | MonitorDefaultDataType;
}
export interface MonitorConsoleDataType {
  type: string;
  timestamp: number;
  id: string;
  /** 全部进行序列化后存储 */
  message: string[];
}


export interface MonitorNetworkDataType {
  type: string;
  url: string;
  method: string;
  time: number;
  status: any;
  timestamp: number;
  id: string;

  request?: {
    headers: string;
    params: string;
    body?: {
      type: string;
      content: string;
    }
  };
  response?: {
    headers: string;
    body: {
      type: string;
      content: string;
    };
    error?: any;
  };

  // statusText: response.statusText;

  size?: number;
}

export interface MonitorDefaultDataType {
  label: string;
  value: string;
}

export interface MonitorStorageDataType {
  key: string;
  value: string;
}