export interface IHTTP {
    address: string;
    port: number;
}

export interface IHTTPS {
    address: string;
    port: number;
}

export interface IPostMessaging {

}

export interface IWebSocket {
    address: string; 
    port: number;   
    protocol: string;
}

export type TConnection = IHTTP | IHTTPS | IPostMessaging | IWebSocket;