import { TRequestBody, TResponseBody } from '../../platform/interfaces/index';
/**
 * Returns of middleware functions
 */

/**
 * Function should prepare authorization request to server
 * @returns Promise{TRequestBody}
 */
export type TMiddlewareAuthRequestBuilderReturn = Promise<TRequestBody>;

/**
 * Function should process authorization response from server and return true (success) or false (fail)
 * @returns Promise{boolean}
 */
export type TMiddlewareAuthResponseParserReturn = Promise<boolean>;

/**
 * Types of middleware functions
 */
export type TMiddlewareAuthRequestBuilderFunction = (GUID: symbol) => TMiddlewareAuthRequestBuilderReturn;

export type TMiddlewareAuthResponseParserFunction = (GUID: symbol, response: TResponseBody)  => TMiddlewareAuthResponseParserReturn;
