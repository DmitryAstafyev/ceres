
export interface IConnectionParameters {
    port?: number;
    maxSize?: number;
    tokenLife?: number;
    CORS?: boolean;
    wsPackageMaxSize?: number;
    wsProtocol?: string;
}
