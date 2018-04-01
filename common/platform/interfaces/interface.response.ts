export type TResponseBody = {[key: string]: any};

export interface IResponse {
    clientGUID: string,
    response: TResponseBody
}