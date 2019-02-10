/* tslint:disable */
/*
* This file generated automaticaly (Sun Feb 10 2019 03:48:00 GMT+0100 (CET))
* Do not remove or change this code.
* Protocol version: 0.0.1
*/

export namespace Protocol {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: map of types
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export type TTypes = 
		Message.UnsubscribeAll.Request |
		Message.Unsubscribe.Response |
		Message.Registration.Response |
		Disconnect |
		Message.Event.Options |
		Message |
		Message.Reconnection |
		Message.Reconnection.Request |
		Message.Reconnection.Response |
		Message.Event |
		Message.Event.Request |
		Message.Event.Response |
		Message.Subscribe |
		Message.Subscribe.Request |
		Message.Subscribe.Response |
		Message.Unsubscribe |
		Message.Unsubscribe.Request |
		Message.UnsubscribeAll |
		Message.UnsubscribeAll.Response |
		Message.Registration |
		Message.Registration.Request |
		Message.Demand |
		Message.Demand.FromExpectant |
		Message.Demand.FromExpectant.Request |
		Message.Demand.FromExpectant.Response |
		Message.Demand.FromRespondent |
		Message.Demand.FromRespondent.Request |
		Message.Demand.FromRespondent.Response |
		Message.Demand.Options |
		Message.Respondent |
		Message.Respondent.Bind |
		Message.Respondent.Bind.Request |
		Message.Respondent.Bind.Response |
		Message.Respondent.Unbind |
		Message.Respondent.Unbind.Request |
		Message.Respondent.Unbind.Response |
		Message.ToConsumer |
		EventDefinition |
		DemandDefinition |
		Subscription |
		ConnectionError |
		KeyValue;

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: map of types
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export const KeysMapLeft: {[key: string]: any} = {
		"36550583": {
			clientId: "a",
			guid: "b",
			subscription: "c",
			token: "d",
		},
		"60658336": {
			clientId: "a",
			guid: "b",
			status: "c",
			error: "d",
		},
		"66972276": {
			clientId: "a",
			guid: "b",
			status: "c",
			error: "d",
		},
		"71280621": {
			reason: "a",
			message: "b",
		},
		"76052942": {
			scope: "a",
		},
		"70D1C8A2": {
			clientId: "a",
			guid: "b",
		},
		"411DF73D": {
			clientId: "a",
			guid: "b",
		},
		"7E8304BE": {
			clientId: "a",
			guid: "b",
			token: "c",
		},
		"550547F2": {
			clientId: "a",
			guid: "b",
			allowed: "c",
		},
		"7A8FB62E": {
			clientId: "a",
			guid: "b",
		},
		"15C342AF": {
			clientId: "a",
			guid: "b",
			event: "c",
			token: "d",
			aliases: "e",
			options: "f",
		},
		"282376D8": {
			protocol: "a",
			event: "b",
			bodyStr: "c",
			bodyBinary: "d",
		},
		"1DB68EE9": {
			key: "a",
			value: "b",
		},
		"5A3337DF": {
			clientId: "a",
			guid: "b",
			subscribers: "c",
		},
		"40BAC922": {
			clientId: "a",
			guid: "b",
		},
		"3FAECA1": {
			clientId: "a",
			guid: "b",
			subscription: "c",
			token: "d",
		},
		"2DEBB962": {
			protocol: "a",
			event: "b",
		},
		"783AF28F": {
			clientId: "a",
			guid: "b",
			status: "c",
			error: "d",
		},
		"C96909B": {
			clientId: "a",
			guid: "b",
		},
		"B782B1A": {
			clientId: "a",
			guid: "b",
			subscription: "c",
			token: "d",
		},
		"1A9B1BFC": {
			clientId: "a",
			guid: "b",
		},
		"6EDC0A13": {
			clientId: "a",
			guid: "b",
			status: "c",
			error: "d",
		},
		"C78C95B": {
			clientId: "a",
			guid: "b",
		},
		"34F5A3DA": {
			clientId: "a",
			guid: "b",
			aliases: "c",
			token: "d",
		},
		"2B39E6C9": {
			clientId: "a",
			guid: "b",
		},
		"9BE21CD": {
			clientId: "a",
			guid: "b",
		},
		"47D79F4E": {
			clientId: "a",
			guid: "b",
			demand: "c",
			token: "d",
			query: "e",
			options: "f",
		},
		"61578FC3": {
			id: "a",
			protocol: "b",
			demand: "c",
			bodyStr: "d",
			bodyBinary: "e",
			expected: "f",
			error: "g",
			pending: "h",
		},
		"479DF39": {
			scope: "a",
		},
		"49BC009E": {
			clientId: "a",
			guid: "b",
			id: "c",
			state: "d",
			error: "e",
		},
		"265B8137": {
			clientId: "a",
			guid: "b",
		},
		"40FBF4B8": {
			clientId: "a",
			guid: "b",
			id: "c",
			token: "d",
			error: "e",
			demand: "f",
		},
		"1E55A8C8": {
			clientId: "a",
			guid: "b",
			status: "c",
			error: "d",
		},
		"4C521D22": {
			clientId: "a",
			guid: "b",
		},
		"502499A9": {
			clientId: "a",
			guid: "b",
		},
		"2A67B2A": {
			clientId: "a",
			guid: "b",
			demand: "c",
			protocol: "d",
			token: "e",
			query: "f",
		},
		"55509F06": {
			clientId: "a",
			guid: "b",
			status: "c",
			error: "d",
		},
		"5EDF73E": {
			clientId: "a",
			guid: "b",
		},
		"699C3EBD": {
			clientId: "a",
			guid: "b",
			demand: "c",
			protocol: "d",
			token: "e",
		},
		"393C1C0D": {
			clientId: "a",
			guid: "b",
			status: "c",
		},
		"4F0C247D": {
			clientId: "a",
			guid: "b",
			event: "c",
			demand: "d",
			return: "e",
		},
		"583DFB65": {
			guid: "a",
			reason: "b",
			message: "c",
		},
	};
	export const KeysMapRight: {[key: string]: any} = {
		"36550583": {
			a: "clientId",
			b: "guid",
			c: "subscription",
			d: "token",
		},
		"60658336": {
			a: "clientId",
			b: "guid",
			c: "status",
			d: "error",
		},
		"66972276": {
			a: "clientId",
			b: "guid",
			c: "status",
			d: "error",
		},
		"71280621": {
			a: "reason",
			b: "message",
		},
		"76052942": {
			a: "scope",
		},
		"70D1C8A2": {
			a: "clientId",
			b: "guid",
		},
		"411DF73D": {
			a: "clientId",
			b: "guid",
		},
		"7E8304BE": {
			a: "clientId",
			b: "guid",
			c: "token",
		},
		"550547F2": {
			a: "clientId",
			b: "guid",
			c: "allowed",
		},
		"7A8FB62E": {
			a: "clientId",
			b: "guid",
		},
		"15C342AF": {
			a: "clientId",
			b: "guid",
			c: "event",
			d: "token",
			e: "aliases",
			f: "options",
		},
		"282376D8": {
			a: "protocol",
			b: "event",
			c: "bodyStr",
			d: "bodyBinary",
		},
		"1DB68EE9": {
			a: "key",
			b: "value",
		},
		"5A3337DF": {
			a: "clientId",
			b: "guid",
			c: "subscribers",
		},
		"40BAC922": {
			a: "clientId",
			b: "guid",
		},
		"3FAECA1": {
			a: "clientId",
			b: "guid",
			c: "subscription",
			d: "token",
		},
		"2DEBB962": {
			a: "protocol",
			b: "event",
		},
		"783AF28F": {
			a: "clientId",
			b: "guid",
			c: "status",
			d: "error",
		},
		"C96909B": {
			a: "clientId",
			b: "guid",
		},
		"B782B1A": {
			a: "clientId",
			b: "guid",
			c: "subscription",
			d: "token",
		},
		"1A9B1BFC": {
			a: "clientId",
			b: "guid",
		},
		"6EDC0A13": {
			a: "clientId",
			b: "guid",
			c: "status",
			d: "error",
		},
		"C78C95B": {
			a: "clientId",
			b: "guid",
		},
		"34F5A3DA": {
			a: "clientId",
			b: "guid",
			c: "aliases",
			d: "token",
		},
		"2B39E6C9": {
			a: "clientId",
			b: "guid",
		},
		"9BE21CD": {
			a: "clientId",
			b: "guid",
		},
		"47D79F4E": {
			a: "clientId",
			b: "guid",
			c: "demand",
			d: "token",
			e: "query",
			f: "options",
		},
		"61578FC3": {
			a: "id",
			b: "protocol",
			c: "demand",
			d: "bodyStr",
			e: "bodyBinary",
			f: "expected",
			g: "error",
			h: "pending",
		},
		"479DF39": {
			a: "scope",
		},
		"49BC009E": {
			a: "clientId",
			b: "guid",
			c: "id",
			d: "state",
			e: "error",
		},
		"265B8137": {
			a: "clientId",
			b: "guid",
		},
		"40FBF4B8": {
			a: "clientId",
			b: "guid",
			c: "id",
			d: "token",
			e: "error",
			f: "demand",
		},
		"1E55A8C8": {
			a: "clientId",
			b: "guid",
			c: "status",
			d: "error",
		},
		"4C521D22": {
			a: "clientId",
			b: "guid",
		},
		"502499A9": {
			a: "clientId",
			b: "guid",
		},
		"2A67B2A": {
			a: "clientId",
			b: "guid",
			c: "demand",
			d: "protocol",
			e: "token",
			f: "query",
		},
		"55509F06": {
			a: "clientId",
			b: "guid",
			c: "status",
			d: "error",
		},
		"5EDF73E": {
			a: "clientId",
			b: "guid",
		},
		"699C3EBD": {
			a: "clientId",
			b: "guid",
			c: "demand",
			d: "protocol",
			e: "token",
		},
		"393C1C0D": {
			a: "clientId",
			b: "guid",
			c: "status",
		},
		"4F0C247D": {
			a: "clientId",
			b: "guid",
			c: "event",
			d: "demand",
			e: "return",
		},
		"583DFB65": {
			a: "guid",
			b: "reason",
			c: "message",
		},
	};
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: typed map
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export const TypedEntitiesMap: {[key: string]: any} = {
		"36550583": {
			a: "string",
			b: "guid",
			c: {
				a: "string",
				b: "string",
			},
			d: "string",
		},
		"60658336": {
			a: "string",
			b: "guid",
			c: "boolean",
			d: "string",
		},
		"66972276": {
			a: "string",
			b: "guid",
			c: "boolean",
			d: "string",
		},
		"71280621": {
			a: "string",
			b: "string",
		},
		"76052942": {
			a: "string",
		},
		"70D1C8A2": {
			a: "string",
			b: "guid",
		},
		"411DF73D": {
			a: "string",
			b: "guid",
		},
		"7E8304BE": {
			a: "string",
			b: "guid",
			c: "string",
		},
		"550547F2": {
			a: "string",
			b: "guid",
			c: "boolean",
		},
		"7A8FB62E": {
			a: "string",
			b: "guid",
		},
		"15C342AF": {
			a: "string",
			b: "guid",
			c: {
				a: "string",
				b: "string",
				c: "string",
				d: ["uint8"],
			},
			d: "string",
			e: [{
				a: "string",
				b: "string",
			}],
			f: {
				a: "string",
			},
		},
		"5A3337DF": {
			a: "string",
			b: "guid",
			c: "integer",
		},
		"40BAC922": {
			a: "string",
			b: "guid",
		},
		"3FAECA1": {
			a: "string",
			b: "guid",
			c: {
				a: "string",
				b: "string",
			},
			d: "string",
		},
		"783AF28F": {
			a: "string",
			b: "guid",
			c: "boolean",
			d: "string",
		},
		"C96909B": {
			a: "string",
			b: "guid",
		},
		"B782B1A": {
			a: "string",
			b: "guid",
			c: {
				a: "string",
				b: "string",
			},
			d: "string",
		},
		"1A9B1BFC": {
			a: "string",
			b: "guid",
		},
		"6EDC0A13": {
			a: "string",
			b: "guid",
			c: "boolean",
			d: "string",
		},
		"C78C95B": {
			a: "string",
			b: "guid",
		},
		"34F5A3DA": {
			a: "string",
			b: "guid",
			c: [{
				a: "string",
				b: "string",
			}],
			d: "string",
		},
		"2B39E6C9": {
			a: "string",
			b: "guid",
		},
		"9BE21CD": {
			a: "string",
			b: "guid",
		},
		"47D79F4E": {
			a: "string",
			b: "guid",
			c: {
				a: "string",
				b: "string",
				c: "string",
				d: "string",
				e: ["uint8"],
				f: "string",
				g: "string",
				h: "boolean",
			},
			d: "string",
			e: [{
				a: "string",
				b: "string",
			}],
			f: {
				a: "string",
			},
		},
		"49BC009E": {
			a: "string",
			b: "guid",
			c: "string",
			d: "string",
			e: "string",
		},
		"265B8137": {
			a: "string",
			b: "guid",
		},
		"40FBF4B8": {
			a: "string",
			b: "guid",
			c: "string",
			d: "string",
			e: "string",
			f: {
				a: "string",
				b: "string",
				c: "string",
				d: "string",
				e: ["uint8"],
				f: "string",
				g: "string",
				h: "boolean",
			},
		},
		"1E55A8C8": {
			a: "string",
			b: "guid",
			c: "boolean",
			d: "string",
		},
		"479DF39": {
			a: "string",
		},
		"4C521D22": {
			a: "string",
			b: "guid",
		},
		"502499A9": {
			a: "string",
			b: "guid",
		},
		"2A67B2A": {
			a: "string",
			b: "guid",
			c: "string",
			d: "string",
			e: "string",
			f: [{
				a: "string",
				b: "string",
			}],
		},
		"55509F06": {
			a: "string",
			b: "guid",
			c: "boolean",
			d: "string",
		},
		"5EDF73E": {
			a: "string",
			b: "guid",
		},
		"699C3EBD": {
			a: "string",
			b: "guid",
			c: "string",
			d: "string",
			e: "string",
		},
		"393C1C0D": {
			a: "string",
			b: "guid",
			c: "boolean",
		},
		"4F0C247D": {
			a: "string",
			b: "guid",
			c: {
				a: "string",
				b: "string",
				c: "string",
				d: ["uint8"],
			},
			d: {
				a: "string",
				b: "string",
				c: "string",
				d: "string",
				e: ["uint8"],
				f: "string",
				g: "string",
				h: "boolean",
			},
			e: {
				a: "string",
				b: "string",
				c: "string",
				d: "string",
				e: ["uint8"],
				f: "string",
				g: "string",
				h: "boolean",
			},
		},
		"282376D8": {
			a: "string",
			b: "string",
			c: "string",
			d: ["uint8"],
		},
		"61578FC3": {
			a: "string",
			b: "string",
			c: "string",
			d: "string",
			e: ["uint8"],
			f: "string",
			g: "string",
			h: "boolean",
		},
		"2DEBB962": {
			a: "string",
			b: "string",
		},
		"583DFB65": {
			a: "guid",
			b: "string",
			c: "string",
		},
		"1DB68EE9": {
			a: "string",
			b: "string",
		},
	};

	export const AdvancedTypes: {[key: string]: any} = {};
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: injection.types.primitive.ts
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	export interface IPrimitiveType<T> {
	    tsType: string;
	    binaryType: string;
	    init: string;
	    parse: (value: string | number | T) => T;
	    serialize: (value: T) => string | number | boolean | T;
	    validate: (value: string | number | T) => boolean;
	    implementation?: () => {};
	}
	
	export const PrimitiveTypes:  { [key: string]: IPrimitiveType<any> } = {
	
	    uint8     : {
	        binaryType  : 'uint8',
	        init        : '0',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            if (value < 0) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    uint16     : {
	        binaryType  : 'uint16',
	        init        : '0',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            if (value < 0) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    uint32     : {
	        binaryType  : 'uint32',
	        init        : '0',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            if (value < 0) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    int8     : {
	        binaryType  : 'int8',
	        init        : '-1',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    int16     : {
	        binaryType  : 'int16',
	        init        : '-1',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    int32     : {
	        binaryType  : 'int32',
	        init        : '-1',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    float32     : {
	        binaryType  : 'float32',
	        init        : '-1',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    float64     : {
	        binaryType  : 'float64',
	        init        : '-1',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    string      : {
	        binaryType  : 'utf8String',
	        init        : '""',
	        parse       : (value: string) => value,
	        serialize   : (value: string) => value,
	        tsType      : 'string',
	        validate    : (value: string) => {
	            if (typeof value !== 'string') {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<string>,
	
	    integer     : {
	        binaryType  : 'int32',
	        init        : '-1',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    float     : {
	        binaryType  : 'float64',
	        init        : '-1',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    boolean     : {
	        binaryType  : 'boolean',
	        init        : 'false',
	        parse       : (value: boolean) => value,
	        serialize   : (value: boolean) => value,
	        tsType      : 'boolean',
	        validate    : (value: boolean) => {
	            if (typeof value !== 'boolean') {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<boolean>,
	
	    datetime    : {
	        binaryType  : 'float64',
	        init        : 'new Date()',
	        parse       : (value: number) => {
	            return new Date(value);
	        },
	        serialize   : (value: Date) => value.getTime(),
	        tsType      : 'Date',
	        validate    : (value: number | Date) => {
	            if (value instanceof Date) {
	                return true;
	            }
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            const date = new Date(value);
	            if (!(date instanceof Date)) {
	                return false;
	            }
	            if (date.toString().toLowerCase().indexOf('invalid date') !== -1) {
	                return false;
	            }
	            return !isNaN(date.getTime());
	        },
	    } as IPrimitiveType<Date>,
	
	    guid     : {
	        binaryType  : 'asciiString',
	        implementation  : function guid() {
	            const lengths = [4, 4, 4, 8];
	            let resultGuid = '';
	            for (let i = lengths.length - 1; i >= 0; i -= 1) {
	                resultGuid += (Math.round(Math.random() * Math.random() * Math.pow(10, lengths[i] * 2))
	                            .toString(16)
	                            .substr(0, lengths[i])
	                            .toUpperCase() + '-');
	            }
	            resultGuid += ((new Date()).getTime() * (Math.random() * 100))
	                        .toString(16)
	                        .substr(0, 12)
	                        .toUpperCase();
	            return resultGuid;
	        },
	        init            : 'guid()',
	        parse           : (value: string) => value,
	        serialize       : (value: string) => value,
	        tsType          : 'string',
	        validate        : (value: string) => {
	            return typeof value === 'string' ? (value.trim() !== '' ? true : false) : false;
	        },
	
	    } as IPrimitiveType<string>,
	
	};
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: injection.packager.ts
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// tslint:disable:no-namespace
	// tslint:disable:max-classes-per-file
	// tslint:disable:object-literal-sort-keys
	
	// declare var Json: any;
	
	export namespace Packager {
	
	    export function join(...items: any[]): string | Uint8Array | Error {
	        if (items instanceof Array && items.length === 1 && items[0] instanceof Array) {
	            items = items[0];
	        }
	        if (!(items instanceof Array) || items.length === 0) {
	            return new Error(`No arguments provided to join`);
	        }
	        const strs: any[] = [];
	        const bytes: number[] = [];
	        let isBinary: boolean | undefined;
	        try {
	            items.forEach((item: any, i: number) => {
	                if (item instanceof Uint8Array && (isBinary === undefined || isBinary === true)) {
	                    isBinary = true;
	                    if (i === 0) {
	                        // Set type as array
	                        bytes.push(Json.Scheme.Types.array);
	                    }
	                    // Set length of item
	                    bytes.push(...Json.Impls.Uint32.toUint8(item.length));
	                    // Put item
	                    bytes.push(...item);
	                } else if (typeof item === 'string' && (isBinary === undefined || isBinary === false)) {
	                    isBinary = false;
	                    strs.push(item);
	                } else {
	                    throw new Error(`Only strings or Uint8Array can be joined. Each array item should be same type.`);
	                }
	            });
	            if (isBinary) {
	                return new Uint8Array(bytes);
	            }
	        } catch (error) {
	            return error;
	        }
	        return JSON.stringify(strs);
	    }
	
	    export function split(source: string | Uint8Array): string[] | Uint8Array[] | Error {
	        if (!isPackage(source)) {
	            return new Error(`Source isn't a package of protocol data.`);
	        }
	        if (source instanceof Buffer) {
	            source = new Uint8Array(source);
	        }
	        if (source instanceof Uint8Array) {
	            let buffer = source.slice(1, source.length);
	            const items: Uint8Array[] = [];
	            do {
	                const itemLength = Json.Impls.Uint32.fromUint8(buffer.slice(0, 4));
	                items.push(buffer.slice(4, 4 + itemLength));
	                buffer = buffer.slice(4 + itemLength, buffer.length);
	            } while (buffer.length > 0);
	            return items;
	        } else {
	            return JSON.parse(source) as string[];
	        }
	    }
	
	    export function isPackage(source: any): boolean {
	        if (source instanceof Uint8Array) {
	            return source[0] === Json.Scheme.Types.array;
	        } else if (source instanceof Buffer) {
	            const uint8array: Uint8Array = new Uint8Array(source);
	            return uint8array.length > 0 ? (uint8array[0] === Json.Scheme.Types.array) : false;
	        } else if (typeof source === 'string') {
	            try {
	                return JSON.parse(source) instanceof Array;
	            } catch (error) {
	                return false;
	            }
	        } else {
	            return false;
	        }
	    }
	
	}
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: injection.root.ts
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// tslint:disable:max-classes-per-file
	
	// declare var ReferencesMap: {[key: string]: any};
	// declare var PrimitiveTypes: {[key: string]: any};
	// declare var AdvancedTypes: {[key: string]: any};
	// declare var KeysMapLeft: {[key: string]: any};
	// declare var KeysMapRight: {[key: string]: any};
	// declare var TypedEntitiesMap: {[key: string]: any};
	// declare var ConvertedTypedEntitiesMap: {[key: string]: any};
	// declare var ConvertedTypedEntitiesMinMap: {[key: string]: any};
	// declare var Json: any;
	
	// declare type TTypes = any;
	
	export type TIncomeData = string | object | ArrayBuffer | number[] | Uint8Array;
	
	export class ProtocolState {
	
	    private _debug: boolean = false;
	
	    public debug(value: boolean) {
	        this._debug = value;
	    }
	
	    public isDebugged(): boolean {
	        return this._debug;
	    }
	
	}
	
	export const state: ProtocolState = new ProtocolState();
	
	export enum EEntityType {
	    root = 'root',
	    class = 'class',
	    namespace = 'namespace',
	    complex = 'complex',
	    primitive = 'primitive',
	    repeated = 'repeated',
	    reference = 'reference',
	    enum = 'enum',
	}
	
	export interface IProperty {
	    name: string;
	    type: EEntityType;
	    optional: boolean;
	    value: any;
	}
	
	export const StandardTypes: string[] = [
	    'int8', 'int16', 'int32',
	    'uint8', 'uint16', 'uint32',
	    'float32', 'float64', 'boolean',
	    'asciiString', 'utf8String',
	];
	
	export function _getPropNameAlias(propName: string, signature: string): string | Error {
	    if (state.isDebugged() || propName === '__signature') {
	        return propName;
	    }
	    if (KeysMapLeft[signature] === void 0) {
	        return new Error(`Fail to find keys map for ${signature}`);
	    }
	    if (KeysMapLeft[signature][propName] === void 0) {
	        return new Error(`Fail to find keys map for ${signature}; property "${propName}".`);
	    }
	    return KeysMapLeft[signature][propName];
	}
	
	export function _getPropName(alias: string, signature: string): string | Error {
	    if (state.isDebugged() || alias === '__signature') {
	        return alias;
	    }
	    if (KeysMapRight[signature] === void 0) {
	        return new Error(`Fail to find keys map for ${signature}`);
	    }
	    if (KeysMapRight[signature][alias] === void 0) {
	        return new Error(`Fail to find keys map for ${signature}; property alias "${alias}".`);
	    }
	    return KeysMapRight[signature][alias];
	}
	
	export function _parse(source: TIncomeData, target?: any): TTypes | Error[] {
	    const types: {[key: string]: any} = getTypes();
	    const json: any = getJSONFromIncomeData(source);
	    if (json instanceof Error) {
	        return [json];
	    }
	    if (typeof json.__signature !== 'string' || json.__signature.trim() === '') {
	        return [new Error(`Cannot find signature of entity.`)];
	    }
	    if (ReferencesMap[json.__signature] === void 0) {
	        return [new Error(`Entity with signature "${json.__signature}" doesn't exist in this protocol implementation. Check protocol name or protocol version.`)];
	    }
	    const classRef: any = ReferencesMap[json.__signature];
	    if (target !== undefined) {
	        if (classRef.getSignature() !== target.getSignature()) {
	            return [new Error(`Target reference doesn't match with entity in json.`)];
	        }
	    }
	    // Get description of entity
	    const description: {[key: string]: IProperty} = classRef.getDescription();
	    // Parsing properties
	    const errors: Error[] = [];
	    Object.keys(json).forEach((alias: string) => {
	        const prop: string | Error = _getPropName(alias, json.__signature);
	        if (prop instanceof Error) {
	            errors.push(new Error(`Cannot get property name by alias "${alias}" due error: ${prop.message}.`));
	            return;
	        }
	        if (prop === alias) {
	            return;
	        }
	        json[prop] = json[alias];
	        delete json[alias];
	    });
	    if (errors.length > 0) {
	        return errors;
	    }
	    Object.keys(description).forEach((prop: string) => {
	        const desc = description[prop];
	        if (desc.optional && json[prop] === void 0) {
	            return;
	        }
	        switch (desc.type) {
	            case EEntityType.repeated:
	                if (!(json[prop] instanceof Array)) {
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated).`));
	                    break;
	                }
	                if (typeof desc.value === 'string') {
	                    json[prop] = json[prop].map((value: any) => {
	                        const nestedType = types[desc.value];
	                        if (!nestedType.validate(value)) {
	                            errors.push(new Error(`Property "${prop}" has wrong format.`));
	                            return undefined;
	                        }
	                        return nestedType.parse(value);
	                    });
	                } else if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    const parsed = json[prop].map((value: any) => {
	                        const nested = _parse(value, desc.value);
	                        if (nested instanceof Array) {
	                            errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e: Error) => e.message).join(';\n')}`));
	                            return null;
	                        }
	                        return nested;
	                    });
	                    if (errors.length > 0) {
	                        break;
	                    }
	                    json[prop] = parsed;
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
	                    json[prop].forEach((value: any) => {
	                        if (desc.value[value] === void 0) {
	                            errors.push(new Error(`Property "${prop}" has wrong value: "${value}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                        }
	                    });
	                }
	                break;
	            case EEntityType.primitive:
	                const type = types[desc.value];
	                if (!type.validate(json[prop])) {
	                    errors.push(new Error(`Property "${prop}" has wrong format.`));
	                }
	                json[prop] = type.parse(json[prop]);
	                break;
	            case EEntityType.reference:
	                if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    const nested = _parse(json[prop], desc.value);
	                    if (nested instanceof Array) {
	                        errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e: Error) => e.message).join(';\n')}`));
	                    } else {
	                        json[prop] = nested;
	                    }
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
	                    if (desc.value[json[prop]] === void 0) {
	                        errors.push(new Error(`Property "${prop}" has wrong value: "${json[prop]}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                    }
	                }
	                break;
	        }
	    });
	    if (errors.length > 0) {
	        return errors;
	    }
	    // Create instance
	    try {
	        return new classRef(json);
	    } catch (error) {
	        return [error];
	    }
	}
	
	export function _stringify(target: any, classRef: any): { [key: string]: any } | Error[] {
	    if (!(target instanceof classRef)) {
	        return [new Error(`Defined wrong reference to class.`)];
	    }
	    const types: {[key: string]: any} = getTypes();
	    const description: {[key: string]: IProperty} = classRef.getDescription();
	    const errors: Error[] = [];
	    const json: any = {
	        __signature: target.getSignature(),
	    };
	    Object.keys(description).forEach((prop: string) => {
	        const propNameAlias: string | Error = _getPropNameAlias(prop, target.getSignature());
	        if (propNameAlias instanceof Error) {
	            errors.push(new Error(`Cannot get property alias for property "${prop}" due error: ${propNameAlias.message}.`));
	            return;
	        }
	        const desc = description[prop];
	        if (desc.optional && target[prop] === void 0) {
	            return;
	        }
	        switch (desc.type) {
	            case EEntityType.repeated:
	                if (!(target[prop] instanceof Array)) {
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated).`));
	                    break;
	                }
	                if (typeof desc.value === 'string') {
	                    json[propNameAlias] = target[prop].map((value: any) => {
	                        const nestedType = types[desc.value];
	                        if (!nestedType.validate(value)) {
	                            errors.push(new Error(`Property "${prop}" has wrong format. Value: ${value}; type: ${typeof value}.`));
	                            return undefined;
	                        }
	                        return nestedType.serialize(value);
	                    });
	                } else if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    const parsed = target[prop].map((value: any) => {
	                        const nested = _stringify(value, desc.value);
	                        if (nested instanceof Array) {
	                            errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e: Error) => e.message).join(';\n')}`));
	                            return null;
	                        }
	                        return nested;
	                    });
	                    if (errors.length > 0) {
	                        break;
	                    }
	                    json[propNameAlias] = parsed;
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
	                    json[propNameAlias] = target[prop].map((value: any) => {
	                        if (desc.value[value] === void 0) {
	                            errors.push(new Error(`Property "${prop}" has wrong value: "${value}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                            return undefined;
	                        }
	                        return value;
	                    });
	                }
	                break;
	            case EEntityType.primitive:
	                const type = types[desc.value];
	                if (!type.validate(target[prop])) {
	                    errors.push(new Error(`Property "${prop}" has wrong format.`));
	                    break;
	                }
	                json[propNameAlias] = type.serialize(target[prop]);
	                break;
	            case EEntityType.reference:
	                if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    const nested = _stringify(target[prop], desc.value);
	                    if (nested instanceof Array) {
	                        errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e: Error) => e.message).join(';\n')}`));
	                        break;
	                    }
	                    json[propNameAlias] = nested;
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
	                    if (desc.value[target[prop]] === void 0) {
	                        errors.push(new Error(`Property "${prop}" has wrong value: "${target[prop]}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                        break;
	                    }
	                    json[propNameAlias] = target[prop];
	                }
	                break;
	        }
	    });
	    if (errors.length > 0) {
	        return errors;
	    }
	    return json;
	}
	
	export function _JSONToBinary(target: any, signature: string): Uint8Array | Error {
	    if (ConvertedTypedEntitiesMap[signature] === void 0) {
	        return new Error(`Cannot find typed map for "${signature}"`);
	    }
	    try {
	        return Json.Convertor.encode(target, ConvertedTypedEntitiesMap[signature]);
	    } catch (error) {
	        return error;
	    }
	}
	
	export function _JSONFromBinary(data: Uint8Array): {} | Error {
	    try {
	        return Json.Convertor.decode(data);
	    } catch (error) {
	        return error;
	    }
	}
	
	export function getTypes(): {[key: string]: any} {
	    const defTypes = Object.assign({}, PrimitiveTypes);
	    const adTypes = Object.assign({}, AdvancedTypes);
	    return Object.assign(defTypes, adTypes);
	}
	
	export function getJSONFromStr(str: string): {} | Error {
	    try {
	        return JSON.parse(str);
	    } catch (error) {
	        return error;
	    }
	}
	
	export function getJSONFromIncomeData(income: TIncomeData): {} | Error {
	    if (typeof income === 'string') {
	        return getJSONFromStr(income);
	    } else if (income instanceof Uint8Array) {
	        return _JSONFromBinary(income);
	    } else if (income instanceof ArrayBuffer) {
	        return _JSONFromBinary(new Uint8Array(income));
	    } else if (income instanceof Array) {
	        return _JSONFromBinary(new Uint8Array(income));
	    } else if (typeof income === 'object' && income !== null) {
	        return income;
	    } else {
	        return new Error(`Unsupported format of income data. Type: ${typeof income}`);
	    }
	}
	
	export function stringify(target: any, classRef: any): string | Uint8Array | Error {
	    const result = _stringify(target, classRef);
	    if (result instanceof Array) {
	        return new Error(`Cannot stringify due errors:\n ${result.map((error: Error) => error.message).join('\n')}`);
	    }
	    // Create binary
	    if (state.isDebugged()) {
	        return JSON.stringify(result);
	    }
	    return _JSONToBinary(result, classRef.getSignature());
	}
	
	export function parse(source: TIncomeData, target?: any): TTypes | Error {
	    const json: {} | Error = getJSONFromIncomeData(source);
	    if (json instanceof Error) {
	        return json;
	    }
	    const result = _parse(json, target);
	    if (result instanceof Array) {
	        (global as any).__json = json;
	        return new Error(`Cannot parse due errors:\n ${result.map((error: Error) => error.message).join('\n')}`);
	    }
	    return result;
	}
	
	export function parseFrom(source: TIncomeData, protocols: any | any[]): any {
	    const json: {} | Error = getJSONFromIncomeData(source);
	    if (json instanceof Error) {
	        return json;
	    }
	    protocols = protocols instanceof Array ? protocols : [protocols];
	    let result: any;
	    protocols.forEach((protocol: any, i: number) => {
	        if (result !== undefined) {
	            return;
	        }
	        if (protocol === undefined || protocol === null || typeof protocol.parse !== 'function') {
	            result = new Error(`Incorrect ref to protocol is provided`);
	        }
	        result = protocol.parse(json);
	        if (result instanceof Error && i !== protocols.length - 1) {
	            result = undefined;
	        }
	    });
	    return result;
	}
	
	export function typeOf(smth: any): string {
	    switch (typeof smth) {
	        case 'object':
	            if (smth === null) {
	                return 'null';
	            }
	            if (smth.constructor !== void 0) {
	                return smth.constructor.name;
	            }
	            return 'object';
	        default:
	            return typeof smth;
	    }
	}
	
	export function validateParams(params: any, classRef: any): Error[] {
	    const errors: Error[] = [];
	    const description: {[key: string]: any} = classRef.getDescription();
	    const types: {[key: string]: any} = getTypes();
	    const classRefName: string = classRef.name;
	    if (Object.keys(description).length === 0 && params === undefined) {
	        return errors;
	    }
	    if (typeof params !== 'object' || params === null) {
	        errors.push(new Error(`Expecting "params" will be an object on "${classRefName}".`));
	        return errors;
	    }
	    Object.keys(description).forEach((prop: string) => {
	        const desc: any = description[prop];
	        if (!desc.optional && params[prop] === void 0) {
	            errors.push(new Error(`Property "${prop}" isn't defined, but it's obligatory property for "${classRefName}".`));
	            return;
	        }
	        if (desc.optional && params[prop] === void 0) {
	            return;
	        }
	        switch (desc.type) {
	            case EEntityType.repeated:
	                if (!(params[prop] instanceof Array)) {
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated). Reference: "${classRefName}"`));
	                    break;
	                }
	                if (typeof desc.value === 'string') {
	                    params[prop] = params[prop].map((value: any) => {
	                        const nestedType = types[desc.value];
	                        if (typeOf(value) !== nestedType.tsType) {
	                            errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated) of "${nestedType.tsType}"`));
	                        }
	                    });
	                } else if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    params[prop].forEach((instance: any, index: number) => {
	                        if (!(instance instanceof desc.value)) {
	                            errors.push(new Error(`Expecting property "${prop}", index "${index}" should be instance of "${desc.value.name}".`));
	                        }
	                    });
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
	                    params[prop].forEach((value: any) => {
	                        if (desc.value[value] === void 0) {
	                            errors.push(new Error(`Property "${prop}" has wrong value: "${value}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                        }
	                    });
	                }
	                break;
	            case EEntityType.primitive:
	                const type = types[desc.value];
	                if (typeOf(params[prop]) !== type.tsType) {
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected: "${type.tsType}".`));
	                }
	                break;
	            case EEntityType.reference:
	                if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    if (!(params[prop] instanceof desc.value)) {
	                        errors.push(new Error(`Expecting property "${prop}" will be instance of "${desc.value.name}".`));
	                    }
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
	                    if (desc.value[params[prop]] === void 0) {
	                        errors.push(new Error(`Property "${prop}" has wrong value: "${params[prop]}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                    }
	                }
	                break;
	        }
	    });
	    return errors;
	}
	
	export function convertTypesToStandard(target: {[key: string]: any}): {[key: string]: any} {
	    function getTypeFromStr(type: string): string | Error {
	        let result: string | Error;
	        if (PrimitiveTypes[type] !== void 0) {
	            result = PrimitiveTypes[type].binaryType;
	        } else if (AdvancedTypes[type] !== void 0) {
	            if (typeof AdvancedTypes[type].binaryType === 'string') {
	                result = AdvancedTypes[type].binaryType;
	            } else {
	                result = new Error(`Type "${type}" is defined as advanced type, but property "binaryType" isn't defined.`);
	            }
	        } else {
	            const availableTypes = [...Object.keys(PrimitiveTypes), ...Object.keys(AdvancedTypes)];
	            result = new Error(`Found unexpected type: "${type}". This type isn't defined in protocol. Available types in this protocol: ${availableTypes.join(', ')}`);
	        }
	        if (result instanceof Error) {
	            return result;
	        }
	        if (StandardTypes.indexOf(result) === -1) {
	            result = new Error(`Type "${result}" isn't standard type. Available standard types: ${StandardTypes.join(', ')}`);
	        }
	        return result;
	    }
	    const converted: {[key: string]: any} = { __signature: 'asciiString' };
	    Object.keys(target).forEach((key: string) => {
	        const value = target[key];
	        if (typeof value === 'string') {
	            const type: string | Error = getTypeFromStr(value);
	            if (type instanceof Error) {
	                throw type;
	            }
	            converted[key] = type;
	        } else if (value instanceof Array && value.length === 1) {
	            const type: string | {} | Error = typeof value[0] === 'string' ? getTypeFromStr(value[0]) : convertTypesToStandard(value[0]);
	            if (type instanceof Error) {
	                throw type;
	            }
	            converted[key] = [type];
	        } else if (typeof value === 'object' && value !== null) {
	            converted[key] = convertTypesToStandard(value);
	        } else {
	            throw new Error(`Unexpected value of type: ${value}. Check key: ${key}`);
	        }
	    });
	    return converted;
	}
	
	export class Root {
	
	}
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: injection.convertor.ts
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// tslint:disable:no-namespace
	// tslint:disable:max-classes-per-file
	// tslint:disable:no-bitwise
	// tslint:disable:object-literal-sort-keys
	
	export namespace Json {
	
	    export namespace Impls {
	        export class Boolean {
	            public static toUint8(value: any): Uint8Array {
	                return new Uint8Array((new Uint8Array([value ? 1 : 0])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): boolean {
	                const int8 = new Uint8Array((new Uint8Array(bytes)).buffer);
	                return int8[0] === 1;
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'boolean') {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: boolean.`);
	                }
	                return undefined;
	            }
	        }
	        export class Float32 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Float32Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const float32 = new Float32Array((new Uint8Array(bytes)).buffer);
	                return float32[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                let generated: number = this.fromUint8(this.toUint8(value));
	                if (generated !== value) {
	                    const valueAsStr: string = value.toString();
	                    const decimalPos: number = valueAsStr.indexOf('.');
	                    if (decimalPos === -1) {
	                        generated = Math.round(generated);
	                    } else {
	                        const decimal: number = valueAsStr.substr(decimalPos + 1, valueAsStr.length).length;
	                        generated = parseFloat(generated.toFixed(decimal));
	                    }
	                }
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Float64 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Float64Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const float64 = new Float64Array((new Uint8Array(bytes)).buffer);
	                return float64[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                let generated: number = this.fromUint8(this.toUint8(value));
	                if (generated !== value) {
	                    const valueAsStr: string = value.toString();
	                    const decimalPos: number = valueAsStr.indexOf('.');
	                    if (decimalPos === -1) {
	                        generated = Math.round(generated);
	                    } else {
	                        const decimal: number = valueAsStr.substr(decimalPos + 1, valueAsStr.length).length;
	                        generated = parseFloat(generated.toFixed(decimal));
	                    }
	                }
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Int8 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Int8Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int8 = new Int8Array((new Uint8Array(bytes)).buffer);
	                return int8[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Int16 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Int16Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int16 = new Int16Array((new Uint8Array(bytes)).buffer);
	                return int16[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Int32 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Int32Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int32 = new Int32Array((new Uint8Array(bytes)).buffer);
	                return int32[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Uint8 {
	            public static fromAsciiStr(str: string): Uint8Array {
	                const result = new Uint8Array(str.length);
	                Array.prototype.forEach.call(str, (char: string, i: number) => {
	                    result[i] = char.charCodeAt(0);
	                });
	                return result;
	            }
	            public static toAsciiStr(data: Uint8Array): string {
	                let result = '';
	                data.map((code: number) => {
	                    result += String.fromCharCode(code);
	                    return code;
	                });
	                return result;
	            }
	            public static fromUtf8Str(str: string): Uint8Array {
	                // Source of method implementation: https://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
	                const utf8 = [];
	                for (let i = 0; i < str.length; i++) {
	                    let charcode = str.charCodeAt(i);
	                    if (charcode < 0x80)  {
	                        utf8.push(charcode);
	                    } else if (charcode < 0x800) {
	                        utf8.push(0xc0 | (charcode >> 6),
	                                0x80 | (charcode & 0x3f));
	                    } else if (charcode < 0xd800 || charcode >= 0xe000) {
	                        utf8.push(0xe0 | (charcode >> 12),
	                                0x80 | ((charcode >> 6) & 0x3f),
	                                0x80 | (charcode & 0x3f));
	                    } else {
	                        i++;
	                        // UTF-16 encodes 0x10000-0x10FFFF by
	                        // subtracting 0x10000 and splitting the
	                        // 20 bits of 0x0-0xFFFFF into two halves
	                        charcode = 0x10000 + (((charcode & 0x3ff) << 10)
	                                | (str.charCodeAt(i) & 0x3ff));
	                        utf8.push(0xf0 | (charcode >> 18),
	                                0x80 | ((charcode >> 12) & 0x3f),
	                                0x80 | ((charcode >> 6) & 0x3f),
	                                0x80 | (charcode & 0x3f));
	                    }
	                }
	                return new Uint8Array(utf8);
	            }
	            public static toUtf8Str(bytes: Uint8Array): string {
	                // Source of method implementation: https://stackoverflow.com/questions/17191945/conversion-between-utf-8-arraybuffer-and-string
	                let out = "";
	                let i = 0;
	                const len = bytes.length;
	                while (i < len) {
	                    let char2;
	                    let char3;
	                    const c = bytes[ i++ ];
	                    switch (c >> 4) {
	                        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
	                            // 0xxxxxxx
	                            out += String.fromCharCode(c);
	                            break;
	                        case 12: case 13:
	                            // 110x xxxx   10xx xxxx
	                            char2 = bytes[i++];
	                            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
	                            break;
	                        case 14:
	                            // 1110 xxxx  10xx xxxx  10xx xxxx
	                            char2 = bytes[i++];
	                            char3 = bytes[i++];
	                            out += String.fromCharCode(((c & 0x0F) << 12) |
	                                                        ((char2 & 0x3F) << 6) |
	                                                        ((char3 & 0x3F) << 0));
	                            break;
	                    }
	                }
	                return out;
	            }
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Uint8Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int8 = new Uint8Array((new Uint8Array(bytes)).buffer);
	                return int8[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Uint16 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Uint16Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int16 = new Uint16Array((new Uint8Array(bytes)).buffer);
	                return int16[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Uint32 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Uint32Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int32 = new Uint32Array((new Uint8Array(bytes)).buffer);
	                return int32[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	    }
	
	    export namespace Scheme {
	        export const Types = {
	            // Primitive types
	            int8: 0,
	            int16: 1,
	            int32: 2,
	            uint8: 3,
	            uint16: 4,
	            uint32: 5,
	            float32: 6,
	            float64: 7,
	            boolean: 8,
	            asciiString: 9,
	            utf8String: 10,
	            // Complex types
	            object: 100,
	            array: 101,
	        };
	        export const TypesNames = {
	            [Types.int8]: 'int8',
	            [Types.int16]: 'int16',
	            [Types.int32]: 'int32',
	            [Types.uint8]: 'uint8',
	            [Types.uint16]: 'uint16',
	            [Types.uint32]: 'uint32',
	            [Types.float32]: 'float32',
	            [Types.float64]: 'float64',
	            [Types.boolean]: 'boolean',
	            [Types.asciiString]: 'asciiString',
	            [Types.utf8String]: 'utf8String',
	            [Types.object]: 'object',
	        };
	        export const TypesSizes = {
	            [Types.int8]: 1,
	            [Types.int16]: 2,
	            [Types.int32]: 4,
	            [Types.uint8]: 1,
	            [Types.uint16]: 2,
	            [Types.uint32]: 4,
	            [Types.float32]: 4,
	            [Types.float64]: 8,
	            [Types.boolean]: 1,
	        };
	        export const TypesProviders = {
	            [Types.int8]: Impls.Int8,
	            [Types.int16]: Impls.Int16,
	            [Types.int32]: Impls.Int32,
	            [Types.uint8]: Impls.Uint8,
	            [Types.uint16]: Impls.Uint16,
	            [Types.uint32]: Impls.Uint32,
	            [Types.float32]: Impls.Float32,
	            [Types.float64]: Impls.Float64,
	            [Types.boolean]: Impls.Boolean,
	        };
	        export const LengthConvertor = {
	            object: Impls.Uint32.toUint8,
	            [Types.asciiString]: Impls.Uint32.toUint8,
	            [Types.utf8String]: Impls.Uint32.toUint8,
	        };
	        export const SizeDeclaration = {
	            [Types.asciiString]: true,
	            [Types.utf8String]: true,
	        };
	    }
	
	    const MAX_INTERACTIONS_COUNT = 1000;
	
	    export class Convertor {
	
	        public static encode(target: any, scheme: any, validation: boolean = true): Uint8Array {
	            const paket: number[] = [];
	            Object.keys(target).forEach((key: string) => {
	                const type = this._getPrimitiveType(scheme[key]);
	                const value = target[key];
	                const propName: Uint8Array = Impls.Uint8.fromAsciiStr(key);
	                if (type === null || type === undefined) {
	                    throw new Error(`Incorrect type provided in scheme: ${typeof type}; key: ${key}.`);
	                }
	                if (value === undefined) {
	                    return;
	                }
	                if (typeof type !== 'object' && !(type instanceof Array)) {
	                    // Primitives
	                    const propValue: number[] | Error = this._encodePrimitive(value, type, validation);
	                    if (propValue instanceof Error) {
	                        throw new Error(`Fail to encode property "${key}" due error: ${propValue.message}.`);
	                    }
	                    // Save data
	                    const data: number[] = [];
	                    data.push(propName.length);
	                    data.push(...propName);
	                    data.push(type);
	                    if (Scheme.SizeDeclaration[type]) {
	                        data.push(...Scheme.LengthConvertor[type](propValue.length));
	                    }
	                    data.push(...propValue);
	                    paket.push(...data);
	                } else if (type instanceof Array) {
	                    if (type.length !== 1) {
	                        throw new Error(`Array declaration should have one (only) type definition. Property: ${propName}.`);
	                    }
	                    if (!(value instanceof Array)) {
	                        throw new Error(`Type of value isn't an array. Property: ${propName}.`);
	                    }
	                    // We have an array
	                    const itemType = this._getPrimitiveType(type[0]);
	                    const items: number[] = [];
	                    const data: number[] = [];
	                    data.push(propName.length);
	                    data.push(...propName);
	                    data.push(Scheme.Types.array);
	                    if (this._isPrimitive(itemType)) {
	                        if ([Scheme.Types.asciiString, Scheme.Types.utf8String].indexOf(itemType) !== -1) {
	                            value.forEach((item: any, index: number) => {
	                                const propValue: number[] | Error = this._encodePrimitive(item, itemType, validation);
	                                if (propValue instanceof Error) {
	                                    throw new Error(`Fail to encode property "${key}" due error: ${propValue.message}. Index in array: ${index}; key: ${key}.`);
	                                }
	                                items.push(...Scheme.LengthConvertor[itemType](propValue.length));
	                                items.push(...propValue);
	                            });
	                        } else {
	                            value.forEach((item: any, index: number) => {
	                                const propValue: number[] | Error = this._encodePrimitive(item, itemType, validation);
	                                if (propValue instanceof Error) {
	                                    throw new Error(`Fail to encode property "${key}" due error: ${propValue.message}. Index in array: ${index}; key: ${key}.`);
	                                }
	                                items.push(...propValue);
	                            });
	                        }
	                        // Save data
	                        data.push(itemType);
	                    } else if (typeof itemType === 'object' && itemType !== null && !(itemType instanceof Array)) {
	                        value.forEach((item: any) => {
	                            const propValue: Uint8Array = this.encode(item, itemType, validation);
	                            items.push(...propValue);
	                        });
	                        data.push(Scheme.Types.object);
	                    } else {
	                        throw new Error(`Incorrect declaration of array type: ${typeof itemType} / ${itemType}; key: ${key}`);
	                    }
	                    data.push(...Impls.Uint32.toUint8(items.length));
	                    data.push(...items);
	                    paket.push(...data);
	                } else {
	                    // Nested
	                    const propValue: Uint8Array = this.encode(target[key], scheme[key], validation);
	                    paket.push(propName.length);
	                    paket.push(...propName);
	                    paket.push(...propValue);
	                }
	            });
	            // Set size
	            paket.unshift(...Impls.Uint32.toUint8(paket.length));
	            // Set type
	            paket.unshift(Scheme.Types.object);
	            // Return value
	            return new Uint8Array(paket);
	        }
	
	        public static decode(target: Uint8Array, maxInteractionsCount = MAX_INTERACTIONS_COUNT): any {
	            const paket: any = {};
	            const type = target[0];
	            if (type !== Scheme.Types.object) {
	                throw new Error(`Expecting type to be object (type = ${Scheme.Types.object}), but type is "${type}"`);
	            }
	            const length = Impls.Uint32.fromUint8(target.slice(1, 5));
	            let buffer = target.slice(5, 5 + length);
	            let counter = 0;
	            do {
	                // Get name of prop
	                const propNameLength: number = buffer[0];
	                const propName: string = Impls.Uint8.toAsciiStr(buffer.slice(1, propNameLength + 1));
	                const propType: number = Impls.Uint8.fromUint8(buffer.slice(propNameLength + 1, propNameLength + 2));
	                const offset: number = propNameLength + 1 + 1;
	                switch (propType) {
	                    case Scheme.Types.object:
	                        const objValueLength = Impls.Uint32.fromUint8(buffer.slice(offset, offset + 4));
	                        const objValueBytes = buffer.slice(offset - 1, offset + 4 + objValueLength);
	                        if (objValueLength > 0) {
	                            paket[propName] = this.decode(objValueBytes);
	                        } else {
	                            paket[propName] = {};
	                        }
	                        buffer = buffer.slice(offset + 4 + objValueLength, buffer.length);
	                        break;
	                    case Scheme.Types.array:
	                        const itemType = Impls.Uint8.fromUint8(buffer.slice(offset, offset + 1));
	                        const arrayLength = Impls.Uint32.fromUint8(buffer.slice(offset + 1, offset + 4 + 1));
	                        let arrayBytes = buffer.slice(offset + 4 + 1, offset + 4 + 1 + arrayLength);
	                        const items: any[] = [];
	                        if (arrayLength > 0) {
	                            if (this._isPrimitive(itemType)) {
	                                if ([Scheme.Types.asciiString, Scheme.Types.utf8String].indexOf(itemType) !== -1) {
	                                    let strLength;
	                                    let strValue;
	                                    do {
	                                        strLength = Impls.Uint32.fromUint8(arrayBytes.slice(0, 4));
	                                        strValue = arrayBytes.slice(4, 4 + strLength);
	                                        switch (itemType) {
	                                            case Scheme.Types.asciiString:
	                                                items.push(Impls.Uint8.toAsciiStr(strValue));
	                                                break;
	                                            case Scheme.Types.utf8String:
	                                                items.push(Impls.Uint8.toUtf8Str(strValue));
	                                                break;
	                                        }
	                                        arrayBytes = arrayBytes.slice(4 + strLength, arrayBytes.length);
	                                    } while (arrayBytes.length > 0);
	                                } else {
	                                    do {
	                                        items.push(Scheme.TypesProviders[itemType].fromUint8(arrayBytes.slice(0, Scheme.TypesSizes[itemType])));
	                                        arrayBytes = arrayBytes.slice(Scheme.TypesSizes[itemType], arrayBytes.length);
	                                    } while (arrayBytes.length > 0);
	                                }
	                            } else if (itemType === Scheme.Types.object) {
	                                let objType;
	                                let objLength;
	                                let objBody;
	                                do {
	                                    objType = Impls.Uint8.fromUint8(arrayBytes.slice(0, 1));
	                                    if (objType !== Scheme.Types.object) {
	                                        throw new Error(`Expecting to have as an item of array object, but found type = ${Scheme.TypesNames[objType]} / ${objType}`);
	                                    }
	                                    objLength = Impls.Uint32.fromUint8(arrayBytes.slice(1, 5));
	                                    objBody = arrayBytes.slice(0, objLength + 5);
	                                    items.push(this.decode(objBody));
	                                    arrayBytes = arrayBytes.slice(5 + objLength, arrayBytes.length);
	                                } while (arrayBytes.length > 0);
	                            }
	                        }
	                        paket[propName] = items;
	                        buffer = buffer.slice(offset + 4 + 1 + arrayLength, buffer.length);
	                        break;
	                    case Scheme.Types.uint8:
	                    case Scheme.Types.uint16:
	                    case Scheme.Types.uint32:
	                    case Scheme.Types.int8:
	                    case Scheme.Types.int16:
	                    case Scheme.Types.int32:
	                    case Scheme.Types.float32:
	                    case Scheme.Types.float64:
	                    case Scheme.Types.boolean:
	                        paket[propName] = Scheme.TypesProviders[propType].fromUint8(buffer.slice(offset, offset + Scheme.TypesSizes[propType]));
	                        buffer = buffer.slice(offset + Scheme.TypesSizes[propType], buffer.length);
	                        break;
	                    case Scheme.Types.asciiString:
	                        const asciiStringLength = Impls.Uint32.fromUint8(buffer.slice(offset, offset + 4));
	                        const asciiStringBytes = buffer.slice(offset + 4, offset + 4 + asciiStringLength);
	                        paket[propName] = Impls.Uint8.toAsciiStr(asciiStringBytes);
	                        buffer = buffer.slice(offset + 4 + asciiStringLength, buffer.length);
	                        break;
	                    case Scheme.Types.utf8String:
	                        const utf8StringLength = Impls.Uint32.fromUint8(buffer.slice(offset, offset + 4));
	                        const utf8StringBytes = buffer.slice(offset + 4, offset + 4 + utf8StringLength);
	                        paket[propName] = Impls.Uint8.toUtf8Str(utf8StringBytes);
	                        buffer = buffer.slice(offset + 4 + utf8StringLength, buffer.length);
	                        break;
	                    default:
	                        throw new Error(`Was detected unknown type of data or some errors during parsing. Found type of data: ${propType}.`);
	                }
	                counter += 1;
	                if (counter >= maxInteractionsCount) {
	                    throw new Error(`Max count of interactions was done. Probably parser works with error because data isn't right.`);
	                }
	            } while (buffer.length > 0);
	            return paket;
	        }
	
	        private static _encodePrimitive(value: any, type: number, validation: boolean): number[] | Error {
	            const encoded: number[] = [];
	            // Get value of property
	            switch (type) {
	                case Scheme.Types.uint8:
	                case Scheme.Types.uint16:
	                case Scheme.Types.uint32:
	                case Scheme.Types.int8:
	                case Scheme.Types.int16:
	                case Scheme.Types.int32:
	                case Scheme.Types.float32:
	                case Scheme.Types.float64:
	                case Scheme.Types.boolean:
	                    if (validation) {
	                        const validationError: Error | undefined = Scheme.TypesProviders[type].validate(value);
	                        if (validationError) {
	                            return new Error(`Invalid value = ${value}. Declared type is: ${Scheme.TypesNames[type]}. Checks finished with error: ${validationError.message}.`);
	                        }
	                    }
	                    encoded.push(...Scheme.TypesProviders[type].toUint8(value));
	                    break;
	                case Scheme.Types.asciiString:
	                    encoded.push(...Impls.Uint8.fromAsciiStr(value));
	                    break;
	                case Scheme.Types.utf8String:
	                    encoded.push(...Impls.Uint8.fromUtf8Str(value));
	                    break;
	            }
	            return encoded;
	        }
	
	        private static _isPrimitive(type: number): boolean {
	            switch (type) {
	                case Scheme.Types.uint8:
	                case Scheme.Types.uint16:
	                case Scheme.Types.uint32:
	                case Scheme.Types.int8:
	                case Scheme.Types.int16:
	                case Scheme.Types.int32:
	                case Scheme.Types.float32:
	                case Scheme.Types.float64:
	                case Scheme.Types.boolean:
	                case Scheme.Types.asciiString:
	                case Scheme.Types.utf8String:
	                    return true;
	                default:
	                    return false;
	            }
	        }
	
	        private static _getPrimitiveType(type: any): any {
	            if (typeof type === 'number') {
	                return type;
	            } else if (typeof type === 'string') {
	                return (Scheme.Types as any)[type];
	            } else {
	                return type;
	            }
	        }
	    }
	}
	

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: map of references
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export let ConvertedTypedEntitiesMap: {[key: string]: any} = {};
	export let ReferencesMap: {[key: string]: any} = {};
	export function init(){
		ReferencesMap["36550583"] = Message.UnsubscribeAll.Request;
		ReferencesMap["60658336"] = Message.Unsubscribe.Response;
		ReferencesMap["66972276"] = Message.Registration.Response;
		ReferencesMap["71280621"] = Disconnect;
		ReferencesMap["76052942"] = Message.Event.Options;
		ReferencesMap["70D1C8A2"] = Message;
		ReferencesMap["411DF73D"] = Message.Reconnection;
		ReferencesMap["7E8304BE"] = Message.Reconnection.Request;
		ReferencesMap["550547F2"] = Message.Reconnection.Response;
		ReferencesMap["7A8FB62E"] = Message.Event;
		ReferencesMap["15C342AF"] = Message.Event.Request;
		ReferencesMap["5A3337DF"] = Message.Event.Response;
		ReferencesMap["40BAC922"] = Message.Subscribe;
		ReferencesMap["3FAECA1"] = Message.Subscribe.Request;
		ReferencesMap["783AF28F"] = Message.Subscribe.Response;
		ReferencesMap["C96909B"] = Message.Unsubscribe;
		ReferencesMap["B782B1A"] = Message.Unsubscribe.Request;
		ReferencesMap["1A9B1BFC"] = Message.UnsubscribeAll;
		ReferencesMap["6EDC0A13"] = Message.UnsubscribeAll.Response;
		ReferencesMap["C78C95B"] = Message.Registration;
		ReferencesMap["34F5A3DA"] = Message.Registration.Request;
		ReferencesMap["2B39E6C9"] = Message.Demand;
		ReferencesMap["9BE21CD"] = Message.Demand.FromExpectant;
		ReferencesMap["47D79F4E"] = Message.Demand.FromExpectant.Request;
		ReferencesMap["49BC009E"] = Message.Demand.FromExpectant.Response;
		ReferencesMap["265B8137"] = Message.Demand.FromRespondent;
		ReferencesMap["40FBF4B8"] = Message.Demand.FromRespondent.Request;
		ReferencesMap["1E55A8C8"] = Message.Demand.FromRespondent.Response;
		ReferencesMap["479DF39"] = Message.Demand.Options;
		ReferencesMap["4C521D22"] = Message.Respondent;
		ReferencesMap["502499A9"] = Message.Respondent.Bind;
		ReferencesMap["2A67B2A"] = Message.Respondent.Bind.Request;
		ReferencesMap["55509F06"] = Message.Respondent.Bind.Response;
		ReferencesMap["5EDF73E"] = Message.Respondent.Unbind;
		ReferencesMap["699C3EBD"] = Message.Respondent.Unbind.Request;
		ReferencesMap["393C1C0D"] = Message.Respondent.Unbind.Response;
		ReferencesMap["4F0C247D"] = Message.ToConsumer;
		ReferencesMap["282376D8"] = EventDefinition;
		ReferencesMap["61578FC3"] = DemandDefinition;
		ReferencesMap["2DEBB962"] = Subscription;
		ReferencesMap["583DFB65"] = ConnectionError;
		ReferencesMap["1DB68EE9"] = KeyValue;
		ConvertedTypedEntitiesMap = convertTypesToStandard(TypedEntitiesMap);
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: protocol signature
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export function getSignature() {
		return "73C17AF5";
	}

}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Primitive type injections
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function guid() {
            var lengths = [4, 4, 4, 8];
            var resultGuid = '';
            for (var i = lengths.length - 1; i >= 0; i -= 1) {
                resultGuid += (Math.round(Math.random() * Math.random() * Math.pow(10, lengths[i] * 2))
                    .toString(16)
                    .substr(0, lengths[i])
                    .toUpperCase() + '-');
            }
            resultGuid += ((new Date()).getTime() * (Math.random() * 100))
                .toString(16)
                .substr(0, 12)
                .toUpperCase();
            return resultGuid;
        }

export class Message extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
		}
	}
	static __signature: string = "70D1C8A2";
	static getSignature(): string {
		return Message.__signature;
	}
	public __signature: string = Message.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Message);
	}
	public stringify(): string {
		return Protocol.stringify(this, Message) as string;
	}
	public clientId: string = "";
	public guid?: string = guid();

	constructor(args: { clientId: string, guid?: string }) {
		super();
		this.clientId = args.clientId;
		args.guid !== void 0 && (this.guid = args.guid);
		const errors: Error[] = Protocol.validateParams(args, Message);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "Message" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export namespace Message {
	export class Reconnection extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "411DF73D";
		static getSignature(): string {
			return Reconnection.__signature;
		}
		public __signature: string = Reconnection.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Reconnection);
		}
		public stringify(): string {
			return Protocol.stringify(this, Reconnection) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Reconnection);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Reconnection" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Reconnection {
		export class Request extends Reconnection {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "7E8304BE";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public token: string = "";

			constructor(args: { clientId: string, guid?: string, token: string }) {
				super(Object.assign(args, {}));
				this.token = args.token;
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export class Response extends Reconnection {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					allowed: { name: "allowed", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "550547F2";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public allowed: boolean = false;

			constructor(args: { clientId: string, guid?: string, allowed: boolean }) {
				super(Object.assign(args, {}));
				this.allowed = args.allowed;
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
	}
	export class Event extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "7A8FB62E";
		static getSignature(): string {
			return Event.__signature;
		}
		public __signature: string = Event.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Event);
		}
		public stringify(): string {
			return Protocol.stringify(this, Event) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Event);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Event" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Event {
		export class Request extends Event {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					event: { name: "event", value: EventDefinition, type: Protocol.EEntityType.reference, optional: false }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					aliases: { name: "aliases", value: KeyValue, type: Protocol.EEntityType.repeated, optional: true }, 
					options: { name: "options", value: Message.Event.Options, type: Protocol.EEntityType.reference, optional: true }, 
				}
			}
			static __signature: string = "15C342AF";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public event: EventDefinition;
			public token: string = "";
			public aliases?: Array<KeyValue> = [];
			public options?: Message.Event.Options;

			constructor(args: { clientId: string, guid?: string, event: EventDefinition, token: string, aliases?: Array<KeyValue>, options?: Message.Event.Options }) {
				super(Object.assign(args, {}));
				this.event = args.event;
				this.token = args.token;
				args.aliases !== void 0 && (this.aliases = args.aliases);
				args.options !== void 0 && (this.options = args.options);
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export class Response extends Event {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					subscribers: { name: "subscribers", value: "integer", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "5A3337DF";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public subscribers: number = -1;

			constructor(args: { clientId: string, guid?: string, subscribers: number }) {
				super(Object.assign(args, {}));
				this.subscribers = args.subscribers;
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		export class Options extends Protocol.Root {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					scope: { name: "scope", value: Message.Event.Options.Scope, type: Protocol.EEntityType.reference, optional: true }, 
				}
			}
			static __signature: string = "76052942";
			static getSignature(): string {
				return Options.__signature;
			}
			public __signature: string = Options.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Options);
			}
			public stringify(): string {
				return Protocol.stringify(this, Options) as string;
			}
			public scope?: Message.Event.Options.Scope;

			constructor(args: { scope?: Message.Event.Options.Scope }) {
				super();
				args.scope !== void 0 && (this.scope = args.scope);
				const errors: Error[] = Protocol.validateParams(args, Options);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Options" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace Options {
			export enum Scope {
				local = 'local',
				hosts = 'hosts',
				clients = 'clients',
				all = 'all'
			}
		}
		type TResponses = Response | ConnectionError;
	}
	export class Subscribe extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "40BAC922";
		static getSignature(): string {
			return Subscribe.__signature;
		}
		public __signature: string = Subscribe.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Subscribe);
		}
		public stringify(): string {
			return Protocol.stringify(this, Subscribe) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Subscribe);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Subscribe" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Subscribe {
		export class Request extends Subscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					subscription: { name: "subscription", value: Subscription, type: Protocol.EEntityType.reference, optional: false }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "3FAECA1";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public subscription: Subscription;
			public token: string = "";

			constructor(args: { clientId: string, guid?: string, subscription: Subscription, token: string }) {
				super(Object.assign(args, {}));
				this.subscription = args.subscription;
				this.token = args.token;
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export class Response extends Subscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
					error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "783AF28F";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public status: boolean = false;
			public error?: string = "";

			constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
				super(Object.assign(args, {}));
				this.status = args.status;
				args.error !== void 0 && (this.error = args.error);
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
	}
	export class Unsubscribe extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "C96909B";
		static getSignature(): string {
			return Unsubscribe.__signature;
		}
		public __signature: string = Unsubscribe.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Unsubscribe);
		}
		public stringify(): string {
			return Protocol.stringify(this, Unsubscribe) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Unsubscribe);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Unsubscribe" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Unsubscribe {
		export class Request extends Unsubscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					subscription: { name: "subscription", value: Subscription, type: Protocol.EEntityType.reference, optional: false }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "B782B1A";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public subscription: Subscription;
			public token: string = "";

			constructor(args: { clientId: string, guid?: string, subscription: Subscription, token: string }) {
				super(Object.assign(args, {}));
				this.subscription = args.subscription;
				this.token = args.token;
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export class Response extends Unsubscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
					error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "60658336";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public status: boolean = false;
			public error?: string = "";

			constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
				super(Object.assign(args, {}));
				this.status = args.status;
				args.error !== void 0 && (this.error = args.error);
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
	}
	export class UnsubscribeAll extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "1A9B1BFC";
		static getSignature(): string {
			return UnsubscribeAll.__signature;
		}
		public __signature: string = UnsubscribeAll.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, UnsubscribeAll);
		}
		public stringify(): string {
			return Protocol.stringify(this, UnsubscribeAll) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, UnsubscribeAll);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "UnsubscribeAll" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace UnsubscribeAll {
		export class Request extends UnsubscribeAll {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					subscription: { name: "subscription", value: Subscription, type: Protocol.EEntityType.reference, optional: false }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "36550583";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public subscription: Subscription;
			public token: string = "";

			constructor(args: { clientId: string, guid?: string, subscription: Subscription, token: string }) {
				super(Object.assign(args, {}));
				this.subscription = args.subscription;
				this.token = args.token;
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export class Response extends UnsubscribeAll {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
					error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "6EDC0A13";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public status: boolean = false;
			public error?: string = "";

			constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
				super(Object.assign(args, {}));
				this.status = args.status;
				args.error !== void 0 && (this.error = args.error);
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
	}
	export class Registration extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "C78C95B";
		static getSignature(): string {
			return Registration.__signature;
		}
		public __signature: string = Registration.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Registration);
		}
		public stringify(): string {
			return Protocol.stringify(this, Registration) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Registration);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Registration" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Registration {
		export class Request extends Registration {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					aliases: { name: "aliases", value: KeyValue, type: Protocol.EEntityType.repeated, optional: false }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "34F5A3DA";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public aliases: Array<KeyValue> = [];
			public token: string = "";

			constructor(args: { clientId: string, guid?: string, aliases: Array<KeyValue>, token: string }) {
				super(Object.assign(args, {}));
				this.aliases = args.aliases;
				this.token = args.token;
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export class Response extends Registration {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
					error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "66972276";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public status: boolean = false;
			public error?: string = "";

			constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
				super(Object.assign(args, {}));
				this.status = args.status;
				args.error !== void 0 && (this.error = args.error);
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
	}
	export class Demand extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "2B39E6C9";
		static getSignature(): string {
			return Demand.__signature;
		}
		public __signature: string = Demand.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Demand);
		}
		public stringify(): string {
			return Protocol.stringify(this, Demand) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Demand);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Demand" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Demand {
		export class FromExpectant extends Demand {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "9BE21CD";
			static getSignature(): string {
				return FromExpectant.__signature;
			}
			public __signature: string = FromExpectant.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, FromExpectant);
			}
			public stringify(): string {
				return Protocol.stringify(this, FromExpectant) as string;
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
				const errors: Error[] = Protocol.validateParams(args, FromExpectant);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "FromExpectant" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace FromExpectant {
			export class Request extends FromExpectant {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						demand: { name: "demand", value: DemandDefinition, type: Protocol.EEntityType.reference, optional: false }, 
						token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						query: { name: "query", value: KeyValue, type: Protocol.EEntityType.repeated, optional: false }, 
						options: { name: "options", value: Message.Demand.Options, type: Protocol.EEntityType.reference, optional: true }, 
					}
				}
				static __signature: string = "47D79F4E";
				static getSignature(): string {
					return Request.__signature;
				}
				public __signature: string = Request.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Request);
				}
				public stringify(): string {
					return Protocol.stringify(this, Request) as string;
				}
				public demand: DemandDefinition;
				public token: string = "";
				public query: Array<KeyValue> = [];
				public options?: Message.Demand.Options;

				constructor(args: { clientId: string, guid?: string, demand: DemandDefinition, token: string, query: Array<KeyValue>, options?: Message.Demand.Options }) {
					super(Object.assign(args, {}));
					this.demand = args.demand;
					this.token = args.token;
					this.query = args.query;
					args.options !== void 0 && (this.options = args.options);
					const errors: Error[] = Protocol.validateParams(args, Request);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export class Response extends FromExpectant {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						id: { name: "id", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						state: { name: "state", value: Message.Demand.State, type: Protocol.EEntityType.reference, optional: false }, 
						error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
					}
				}
				static __signature: string = "49BC009E";
				static getSignature(): string {
					return Response.__signature;
				}
				public __signature: string = Response.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Response);
				}
				public stringify(): string {
					return Protocol.stringify(this, Response) as string;
				}
				public id: string = "";
				public state: Message.Demand.State;
				public error?: string = "";

				constructor(args: { clientId: string, guid?: string, id: string, state: Message.Demand.State, error?: string }) {
					super(Object.assign(args, {}));
					this.id = args.id;
					this.state = args.state;
					args.error !== void 0 && (this.error = args.error);
					const errors: Error[] = Protocol.validateParams(args, Response);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export enum Responses {
				ConnectionError = 'ConnectionError'
			}
			type TResponses = Response | ConnectionError;
		}
		export class FromRespondent extends Demand {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "265B8137";
			static getSignature(): string {
				return FromRespondent.__signature;
			}
			public __signature: string = FromRespondent.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, FromRespondent);
			}
			public stringify(): string {
				return Protocol.stringify(this, FromRespondent) as string;
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
				const errors: Error[] = Protocol.validateParams(args, FromRespondent);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "FromRespondent" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace FromRespondent {
			export class Request extends FromRespondent {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						id: { name: "id", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
						demand: { name: "demand", value: DemandDefinition, type: Protocol.EEntityType.reference, optional: true }, 
					}
				}
				static __signature: string = "40FBF4B8";
				static getSignature(): string {
					return Request.__signature;
				}
				public __signature: string = Request.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Request);
				}
				public stringify(): string {
					return Protocol.stringify(this, Request) as string;
				}
				public id: string = "";
				public token: string = "";
				public error?: string = "";
				public demand?: DemandDefinition;

				constructor(args: { clientId: string, guid?: string, id: string, token: string, error?: string, demand?: DemandDefinition }) {
					super(Object.assign(args, {}));
					this.id = args.id;
					this.token = args.token;
					args.error !== void 0 && (this.error = args.error);
					args.demand !== void 0 && (this.demand = args.demand);
					const errors: Error[] = Protocol.validateParams(args, Request);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export class Response extends FromRespondent {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
						error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
					}
				}
				static __signature: string = "1E55A8C8";
				static getSignature(): string {
					return Response.__signature;
				}
				public __signature: string = Response.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Response);
				}
				public stringify(): string {
					return Protocol.stringify(this, Response) as string;
				}
				public status: boolean = false;
				public error?: string = "";

				constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
					super(Object.assign(args, {}));
					this.status = args.status;
					args.error !== void 0 && (this.error = args.error);
					const errors: Error[] = Protocol.validateParams(args, Response);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export enum Responses {
				ConnectionError = 'ConnectionError'
			}
			type TResponses = Response | ConnectionError;
		}
		export enum State {
			ERROR = 'ERROR',
			NO_RESPONDENTS = 'NO_RESPONDENTS',
			SUCCESS = 'SUCCESS',
			DEMAND_SENT = 'DEMAND_SENT',
			PENDING = 'PENDING'
		}
		export class Options extends Protocol.Root {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					scope: { name: "scope", value: Message.Demand.Options.Scope, type: Protocol.EEntityType.reference, optional: true }, 
				}
			}
			static __signature: string = "479DF39";
			static getSignature(): string {
				return Options.__signature;
			}
			public __signature: string = Options.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Options);
			}
			public stringify(): string {
				return Protocol.stringify(this, Options) as string;
			}
			public scope?: Message.Demand.Options.Scope;

			constructor(args: { scope?: Message.Demand.Options.Scope }) {
				super();
				args.scope !== void 0 && (this.scope = args.scope);
				const errors: Error[] = Protocol.validateParams(args, Options);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Options" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace Options {
			export enum Scope {
				local = 'local',
				hosts = 'hosts',
				clients = 'clients',
				all = 'all'
			}
		}
	}
	export class Respondent extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "4C521D22";
		static getSignature(): string {
			return Respondent.__signature;
		}
		public __signature: string = Respondent.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Respondent);
		}
		public stringify(): string {
			return Protocol.stringify(this, Respondent) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Respondent);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Respondent" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Respondent {
		export class Bind extends Respondent {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "502499A9";
			static getSignature(): string {
				return Bind.__signature;
			}
			public __signature: string = Bind.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Bind);
			}
			public stringify(): string {
				return Protocol.stringify(this, Bind) as string;
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
				const errors: Error[] = Protocol.validateParams(args, Bind);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Bind" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace Bind {
			export class Request extends Bind {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						demand: { name: "demand", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						protocol: { name: "protocol", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						query: { name: "query", value: KeyValue, type: Protocol.EEntityType.repeated, optional: false }, 
					}
				}
				static __signature: string = "2A67B2A";
				static getSignature(): string {
					return Request.__signature;
				}
				public __signature: string = Request.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Request);
				}
				public stringify(): string {
					return Protocol.stringify(this, Request) as string;
				}
				public demand: string = "";
				public protocol: string = "";
				public token: string = "";
				public query: Array<KeyValue> = [];

				constructor(args: { clientId: string, guid?: string, demand: string, protocol: string, token: string, query: Array<KeyValue> }) {
					super(Object.assign(args, {}));
					this.demand = args.demand;
					this.protocol = args.protocol;
					this.token = args.token;
					this.query = args.query;
					const errors: Error[] = Protocol.validateParams(args, Request);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export class Response extends Bind {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
						error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
					}
				}
				static __signature: string = "55509F06";
				static getSignature(): string {
					return Response.__signature;
				}
				public __signature: string = Response.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Response);
				}
				public stringify(): string {
					return Protocol.stringify(this, Response) as string;
				}
				public status: boolean = false;
				public error?: string = "";

				constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
					super(Object.assign(args, {}));
					this.status = args.status;
					args.error !== void 0 && (this.error = args.error);
					const errors: Error[] = Protocol.validateParams(args, Response);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export enum Responses {
				ConnectionError = 'ConnectionError'
			}
			type TResponses = Response | ConnectionError;
		}
		export class Unbind extends Respondent {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "5EDF73E";
			static getSignature(): string {
				return Unbind.__signature;
			}
			public __signature: string = Unbind.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Unbind);
			}
			public stringify(): string {
				return Protocol.stringify(this, Unbind) as string;
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
				const errors: Error[] = Protocol.validateParams(args, Unbind);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Unbind" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace Unbind {
			export class Request extends Unbind {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						demand: { name: "demand", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						protocol: { name: "protocol", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					}
				}
				static __signature: string = "699C3EBD";
				static getSignature(): string {
					return Request.__signature;
				}
				public __signature: string = Request.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Request);
				}
				public stringify(): string {
					return Protocol.stringify(this, Request) as string;
				}
				public demand: string = "";
				public protocol: string = "";
				public token: string = "";

				constructor(args: { clientId: string, guid?: string, demand: string, protocol: string, token: string }) {
					super(Object.assign(args, {}));
					this.demand = args.demand;
					this.protocol = args.protocol;
					this.token = args.token;
					const errors: Error[] = Protocol.validateParams(args, Request);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export class Response extends Unbind {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
					}
				}
				static __signature: string = "393C1C0D";
				static getSignature(): string {
					return Response.__signature;
				}
				public __signature: string = Response.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Response);
				}
				public stringify(): string {
					return Protocol.stringify(this, Response) as string;
				}
				public status: boolean = false;

				constructor(args: { clientId: string, guid?: string, status: boolean }) {
					super(Object.assign(args, {}));
					this.status = args.status;
					const errors: Error[] = Protocol.validateParams(args, Response);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export enum Responses {
				ConnectionError = 'ConnectionError'
			}
			type TResponses = Response | ConnectionError;
		}
	}
	export class ToConsumer extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				event: { name: "event", value: EventDefinition, type: Protocol.EEntityType.reference, optional: true }, 
				demand: { name: "demand", value: DemandDefinition, type: Protocol.EEntityType.reference, optional: true }, 
				return: { name: "return", value: DemandDefinition, type: Protocol.EEntityType.reference, optional: true }, 
			}
		}
		static __signature: string = "4F0C247D";
		static getSignature(): string {
			return ToConsumer.__signature;
		}
		public __signature: string = ToConsumer.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, ToConsumer);
		}
		public stringify(): string {
			return Protocol.stringify(this, ToConsumer) as string;
		}
		public event?: EventDefinition;
		public demand?: DemandDefinition;
		public return?: DemandDefinition;

		constructor(args: { clientId: string, guid?: string, event?: EventDefinition, demand?: DemandDefinition, return?: DemandDefinition }) {
			super(Object.assign(args, {}));
			args.event !== void 0 && (this.event = args.event);
			args.demand !== void 0 && (this.demand = args.demand);
			args.return !== void 0 && (this.return = args.return);
			const errors: Error[] = Protocol.validateParams(args, ToConsumer);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "ToConsumer" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
}
export class EventDefinition extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			protocol: { name: "protocol", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			event: { name: "event", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			bodyStr: { name: "bodyStr", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			bodyBinary: { name: "bodyBinary", value: "uint8", type: Protocol.EEntityType.repeated, optional: false }, 
		}
	}
	static __signature: string = "282376D8";
	static getSignature(): string {
		return EventDefinition.__signature;
	}
	public __signature: string = EventDefinition.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, EventDefinition);
	}
	public stringify(): string {
		return Protocol.stringify(this, EventDefinition) as string;
	}
	public protocol: string = "";
	public event: string = "";
	public bodyStr: string = "";
	public bodyBinary: Array<number> = [];

	constructor(args: { protocol: string, event: string, bodyStr: string, bodyBinary: Array<number> }) {
		super();
		this.protocol = args.protocol;
		this.event = args.event;
		this.bodyStr = args.bodyStr;
		this.bodyBinary = args.bodyBinary;
		const errors: Error[] = Protocol.validateParams(args, EventDefinition);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "EventDefinition" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export class DemandDefinition extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			id: { name: "id", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			protocol: { name: "protocol", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			demand: { name: "demand", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			bodyStr: { name: "bodyStr", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			bodyBinary: { name: "bodyBinary", value: "uint8", type: Protocol.EEntityType.repeated, optional: false }, 
			expected: { name: "expected", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
			pending: { name: "pending", value: "boolean", type: Protocol.EEntityType.primitive, optional: true }, 
		}
	}
	static __signature: string = "61578FC3";
	static getSignature(): string {
		return DemandDefinition.__signature;
	}
	public __signature: string = DemandDefinition.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, DemandDefinition);
	}
	public stringify(): string {
		return Protocol.stringify(this, DemandDefinition) as string;
	}
	public id: string = "";
	public protocol: string = "";
	public demand: string = "";
	public bodyStr: string = "";
	public bodyBinary: Array<number> = [];
	public expected: string = "";
	public error?: string = "";
	public pending?: boolean = false;

	constructor(args: { id: string, protocol: string, demand: string, bodyStr: string, bodyBinary: Array<number>, expected: string, error?: string, pending?: boolean }) {
		super();
		this.id = args.id;
		this.protocol = args.protocol;
		this.demand = args.demand;
		this.bodyStr = args.bodyStr;
		this.bodyBinary = args.bodyBinary;
		this.expected = args.expected;
		args.error !== void 0 && (this.error = args.error);
		args.pending !== void 0 && (this.pending = args.pending);
		const errors: Error[] = Protocol.validateParams(args, DemandDefinition);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "DemandDefinition" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export class Subscription extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			protocol: { name: "protocol", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			event: { name: "event", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
		}
	}
	static __signature: string = "2DEBB962";
	static getSignature(): string {
		return Subscription.__signature;
	}
	public __signature: string = Subscription.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Subscription);
	}
	public stringify(): string {
		return Protocol.stringify(this, Subscription) as string;
	}
	public protocol: string = "";
	public event?: string = "";

	constructor(args: { protocol: string, event?: string }) {
		super();
		this.protocol = args.protocol;
		args.event !== void 0 && (this.event = args.event);
		const errors: Error[] = Protocol.validateParams(args, Subscription);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "Subscription" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export class ConnectionError extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			reason: { name: "reason", value: ConnectionError.Reasons, type: Protocol.EEntityType.reference, optional: false }, 
			message: { name: "message", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
		}
	}
	static __signature: string = "583DFB65";
	static getSignature(): string {
		return ConnectionError.__signature;
	}
	public __signature: string = ConnectionError.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, ConnectionError);
	}
	public stringify(): string {
		return Protocol.stringify(this, ConnectionError) as string;
	}
	public guid?: string = guid();
	public reason: ConnectionError.Reasons;
	public message: string = "";

	constructor(args: { guid?: string, reason: ConnectionError.Reasons, message: string }) {
		super();
		args.guid !== void 0 && (this.guid = args.guid);
		this.reason = args.reason;
		this.message = args.message;
		const errors: Error[] = Protocol.validateParams(args, ConnectionError);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "ConnectionError" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export namespace ConnectionError {
	export enum Reasons {
		FAIL_AUTH = 'FAIL_AUTH',
		NO_TOKEN_FOUND = 'NO_TOKEN_FOUND',
		NO_CLIENT_ID_FOUND = 'NO_CLIENT_ID_FOUND',
		NO_TOKEN_PROVIDED = 'NO_TOKEN_PROVIDED',
		TOKEN_IS_WRONG = 'TOKEN_IS_WRONG',
		UNEXPECTED_REQUEST = 'UNEXPECTED_REQUEST',
		NO_DATA_PROVIDED = 'NO_DATA_PROVIDED'
	}
}
export class Disconnect extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			reason: { name: "reason", value: Disconnect.Reasons, type: Protocol.EEntityType.reference, optional: false }, 
			message: { name: "message", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
		}
	}
	static __signature: string = "71280621";
	static getSignature(): string {
		return Disconnect.__signature;
	}
	public __signature: string = Disconnect.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Disconnect);
	}
	public stringify(): string {
		return Protocol.stringify(this, Disconnect) as string;
	}
	public reason: Disconnect.Reasons;
	public message?: string = "";

	constructor(args: { reason: Disconnect.Reasons, message?: string }) {
		super();
		this.reason = args.reason;
		args.message !== void 0 && (this.message = args.message);
		const errors: Error[] = Protocol.validateParams(args, Disconnect);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "Disconnect" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export namespace Disconnect {
	export enum Reasons {
		SHUTDOWN = 'SHUTDOWN'
	}
}
export class KeyValue extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			key: { name: "key", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			value: { name: "value", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
		}
	}
	static __signature: string = "1DB68EE9";
	static getSignature(): string {
		return KeyValue.__signature;
	}
	public __signature: string = KeyValue.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, KeyValue);
	}
	public stringify(): string {
		return Protocol.stringify(this, KeyValue) as string;
	}
	public key: string = "";
	public value: string = "";

	constructor(args: { key: string, value: string }) {
		super();
		this.key = args.key;
		this.value = args.value;
		const errors: Error[] = Protocol.validateParams(args, KeyValue);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "KeyValue" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Injection: export from Protocol namespace
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export type TProtocolTypes = Protocol.TTypes;
export const parse = Protocol.parse;
export const parseFrom = Protocol.parseFrom;
export const stringify = Protocol.stringify;
export const join = Protocol.Packager.join;
export const split = Protocol.Packager.split;
export const isPackage = Protocol.Packager.isPackage;
export const getSignature = Protocol.getSignature;
export interface IClass { getSignature: () => string; parse: (str: string | object) => any; }
export interface IImplementation { getSignature: () => string; stringify: () => string | Uint8Array; }
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Injection: initialization
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
Protocol.init();
