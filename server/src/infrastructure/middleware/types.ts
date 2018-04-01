import * as HTTP from 'http';

/**
 * Returns of middleware functions
 */
export type TMiddlewareAuthReturn       = Promise<void>;

export type TMiddlewareBeforeReturn     = Promise<{ request: HTTP.IncomingMessage, response: HTTP.ServerResponse}>;

export type TMiddlewareAfterReturn      = Promise<void>;

/**
 * Types of middleware functions
 */
export type TMiddlewareAuthFunction     = (GUID: symbol, request: HTTP.IncomingMessage)                                 => TMiddlewareAuthReturn;

export type TMiddlewareBeforeFunction   = (GUID: symbol, request: HTTP.IncomingMessage, response: HTTP.ServerResponse)  => TMiddlewareBeforeReturn

export type TMiddlewareAfterFunction    = (GUID: symbol)                                                                => TMiddlewareAfterReturn;

