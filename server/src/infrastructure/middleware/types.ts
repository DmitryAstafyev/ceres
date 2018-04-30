import * as HTTP from 'http';

export type TKey = string;
/**
 * Returns of middleware functions
 */
export type TMiddlewareAuthReturn       = Promise<TKey>;

export type TMiddlewareValidReturn      = Promise<boolean>;

export type TMiddlewareBeforeReturn     = Promise<void>;

export type TMiddlewareAfterReturn      = Promise<void>;

/**
 * Types of middleware functions
 */
export type TMiddlewareAuthFunction     = (GUID: symbol, request: HTTP.IncomingMessage)                                 => TMiddlewareAuthReturn;

export type TMiddlewareValidFunction    = (GUID: symbol, request: HTTP.IncomingMessage)                                 => TMiddlewareValidReturn;

export type TMiddlewareBeforeFunction   = (GUID: symbol, request: HTTP.IncomingMessage, response: HTTP.ServerResponse)  => TMiddlewareBeforeReturn

export type TMiddlewareAfterFunction    = (GUID: symbol)                                                                => TMiddlewareAfterReturn;

