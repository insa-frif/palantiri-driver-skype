import {SkypeConnection, SkypeConnectionOptions} from "./skype-connection";
import {SkypeApi} from "./skype-api";

export type Api = SkypeApi;
export let Api = SkypeApi;
export type ConnectionOptions = SkypeConnectionOptions;
export type Connection = SkypeConnection;
export let Connection: ConnectionInterface.Constructor<ConnectionOptions, SkypeConnection> = SkypeConnection;
export default Connection;
