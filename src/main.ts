import {SkypeConnection, SkypeConnectionOptions} from "./skype-connection";
import {SkypeApi} from "./skype-api";

export let Api = SkypeApi;
export type ConnectionOptions = SkypeConnectionOptions;
export let Connection = SkypeConnection;
export default Connection;
