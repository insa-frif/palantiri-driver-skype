import * as Bluebird from "bluebird";
import {getOptions} from "./options";
import {Connection} from "../main";
import {echoBot} from "palantiri-test";
import {Connection as ConnectionInterface} from "palantiri-interfaces";

getOptions()
  .then((options) => {
    let connection = new Connection(options);
    return echoBot(<any> connection);
  });
