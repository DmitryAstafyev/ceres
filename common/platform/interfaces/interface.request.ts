export type TRequestBody = {[key: string]: any};

export interface IRequest {
    clientGUID: string,
    request: {[key: string]: any}
}