export interface IEvent {

}

export interface IRequest {

}

export interface IScheme {
    events: { [event: string]: IEvent },
    requests: { [request: string]: IRequest }
}