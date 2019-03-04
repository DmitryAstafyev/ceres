export type TConnectingMethod = (response: XMLHttpRequest, message: any) => Promise<boolean>;
export type TTouchMethod = (request: XMLHttpRequest) => XMLHttpRequest;
export interface IMiddleware {
    connecting?: TConnectingMethod;
    touch?: TTouchMethod;
}
