import { 
    TMiddlewareAfterFunction,
    TMiddlewareValidFunction, 
    TMiddlewareBeforeFunction, 
    TMiddlewareAuthFunction 
} from './types';

export interface IMiddleware {
    auth?    : TMiddlewareAuthFunction,
    valid?   : TMiddlewareValidFunction,
    before?  : TMiddlewareBeforeFunction,
    after?   : TMiddlewareAfterFunction
}