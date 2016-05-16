import * as readline from "readline";
import * as Bluebird from "bluebird";

export function getOptions(): Bluebird<any> {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let credentials: any = {};

  return Bluebird.fromCallback((cb) => {
      rl.question("Username: ", (res) => cb(null, res));
    })
    .then((email: string) => {
      credentials.email = email;
      return Bluebird.fromCallback((cb) => {
        rl.question("Password: ", (res) => cb(null, res));
      })
    })
    .then((password: string) => {
      credentials.password = password;
      console.log(credentials);
      return {credentials: credentials};
    });
}
