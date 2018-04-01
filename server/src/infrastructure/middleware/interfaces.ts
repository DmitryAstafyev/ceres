import { 
    TMiddlewareAfterFunction, 
    TMiddlewareBeforeFunction, 
    TMiddlewareAuthFunction 
} from './types';

export interface IMiddleware {
    auth?    : TMiddlewareAuthFunction,
    before?  : TMiddlewareBeforeFunction,
    after?   : TMiddlewareAfterFunction
}