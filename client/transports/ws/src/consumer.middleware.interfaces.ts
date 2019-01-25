export type TConnectingMethod = (response: XMLHttpRequest, message: any) => Promise<boolean>;
export interface IMiddleware {
    connecting?: TConnectingMethod;
}
