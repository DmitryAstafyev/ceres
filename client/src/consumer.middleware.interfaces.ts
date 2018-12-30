import {
    TMiddlewareAuthRequestBuilderFunction,
    TMiddlewareAuthResponseParserFunction,
} from './consumer.middleware.types';

export interface IMiddleware {
    getAuthRequest?: TMiddlewareAuthRequestBuilderFunction;
    processAuthRequest?: TMiddlewareAuthResponseParserFunction;
}
