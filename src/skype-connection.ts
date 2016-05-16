import * as skypeHttp from "skype-http";
import * as Bluebird from "bluebird";
import {EventEmitter} from "events";
import Incident from "incident";
import * as palantiri from "palantiri-interfaces";

import {SkypeApi} from "./skype-api";

const DRIVER_NAME: string = "skype";

export interface SkypeConnectionOptions {
  credentials: {
    username: string;
    password: string;
  };
}

enum ConnectionState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}

export class SkypeConnection extends EventEmitter implements palantiri.Connection {
  static driver: string = DRIVER_NAME;
  driver: string = DRIVER_NAME;
  options: SkypeConnectionOptions = null;
  api: SkypeApi = null;

  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;

  constructor (options?: SkypeConnectionOptions) {
    super();
    this.options = options;
  }

  getInfo(): any {
    return {driver: this.driver};
  }

  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED;
  }

  getApi(): SkypeApi {
    if (!this.isConnected()) {
      throw new Error("Not connected");
    }
    if (this.api === null) {
      throw new Error("Api is not ready");
    }
    return this.api;
  }

  connect(): Bluebird<SkypeApi> {
    if (this.connectionState === ConnectionState.DISCONNECTED) {
      this.connectionState = ConnectionState.CONNECTING;
    } else {
      return Bluebird.try(() => this.getApi());
    }

    return Bluebird.resolve(skypeHttp.connect({credentials: this.options.credentials}))
      .then((nativeApi) => {
        this.connectionState = ConnectionState.CONNECTED;
        this.api = new SkypeApi(nativeApi, this.options.credentials.username, this);
        this.emit(palantiri.Connection.events.CONNECTED, this);
        return this.api;
      });
  }

  disconnect(): Bluebird<this> {
    if (this.connectionState === ConnectionState.DISCONNECTED) {
      return Bluebird.resolve(this);
    }

    return Bluebird.reject(new Incident("todo", "Disconnection is not supported yet"));
  }
}

export default SkypeConnection;
