import { 
    TMiddlewareAuthRequestBuilderFunction, 
    TMiddlewareAuthResponseParserFunction
} from './types';

export interface IMiddleware {
    getAuthRequest?     : TMiddlewareAuthRequestBuilderFunction,
    processAuthRequest? : TMiddlewareAuthResponseParserFunction
}