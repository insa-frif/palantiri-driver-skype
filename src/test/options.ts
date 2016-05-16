import * as readline from "readline";
import * as Bluebird from "bluebird";

export function getOptions(): Bluebird<any> {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });


  let username: string = null;
  let password: string = null;

  return Bluebird.fromCallback((cb) => {
      rl.question("Username: ", (res) => cb(null, res));
    })
    .then((email: string) => {
      username = email;
      return Bluebird.fromCallback((cb) => {
        rl.question("Password: ", (res) => cb(null, res));
      })
    })
    .then((password: string) => {
      password = password;
      return {credentials: {username: username, password: password}};
    });
}
