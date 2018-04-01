export interface IConsumer {
    /**
     * Bind handler with event
     */
    bindEvent: Function;
    
    /**
     * Unbind handler with event
     */
    unbindEvent: Function;

    /**
     * Unbind handler with event
     */
    triggerEvent: Function;

    /**
     * Bind handler with event
     */
    bindRequest: Function;
    
    /**
     * Unbind handler with event
     */
    unbindRequest: Function;

    /**
     * Send request
     */
    sendRequest: Function;
}