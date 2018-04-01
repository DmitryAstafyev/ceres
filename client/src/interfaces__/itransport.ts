
export interface ITransport {

    /**
     * Register consumer
     */
    addConsumer: Function;

    /**
     * Unregister consumer
     */
    removeConsumer: Function;

    /**
     * Checks is provider connected or not
     */
    isConnected: Function;

}