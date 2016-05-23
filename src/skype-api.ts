import * as Bluebird from "bluebird";
import {EventEmitter} from "events";
import {Incident} from "incident";
import * as _ from "lodash";
import * as Pltr from "palantiri-interfaces";
import * as skypeHttp from "skype-http";

import {SkypeConnection} from "./skype-connection";

const DRIVER_NAME: string = "skype";

function mapContactToAccount (contact: skypeHttp.Contact): Pltr.Account  {
  return {
    driverName: DRIVER_NAME,
    id: contact.id,
    name: String((contact.name && contact.name.nickname) || contact.id),
    avatarUrl: contact.avatar_url,
    driverData: contact
  }
}

export class SkypeApi extends EventEmitter implements Pltr.Api {
  nativeApi: skypeHttp.Api;
  connection: SkypeConnection = null;
  user: Pltr.UserAccount = null;

  // TODO: get more infos about the current user
  constructor (nativeApi: skypeHttp.Api, username: string, connection: SkypeConnection) {
    super();
    this.nativeApi = nativeApi;
    this.connection = connection;

    this.user = {
      driverName: DRIVER_NAME,
      id: username,
      avatarUrl: null,
      name: username,
      driverData: {username: username}
    };

    this.nativeApi.on("Text", this.handleMessageEvent.bind(this));
    this.nativeApi.on("RichText", this.handleMessageEvent.bind(this));
  }

  protected handleMessageEvent (nativeEvent: any) {
    let event: Pltr.Api.events.MessageEvent;

    event = {
      type: Pltr.Api.events.MESSAGE,
      message: {
        id: String(nativeEvent.id), // How to deal with with the clientMessageId ?
        driverName: DRIVER_NAME,
        author: null, // TODO
        body: nativeEvent.content,
        content: nativeEvent.content,
        flags: 0,
        creationDate: nativeEvent.composeTime,
        lastUpdated: null,
        driverData: nativeEvent
      },
      discussionGlobalId: Pltr.Id.stringifyReference({driverName: DRIVER_NAME, id: String(nativeEvent.conversation)})
    };

    this.emit(Pltr.Api.events.MESSAGE, event);
  }

  addMembersToDiscussion(members: Array<Pltr.AccountReference | Pltr.AccountGlobalId>, discussion: Pltr.DiscussionReference | Pltr.DiscussionGlobalId, options?: any): Bluebird<this> {
    return Bluebird.reject(new Incident("todo", "addMembersToDiscussion is not implemented yet"));
  }

  createDiscussion(members: Array<Pltr.AccountReference | Pltr.AccountGlobalId>, options?: Pltr.Api.CreateDiscussionOptions): Bluebird<Pltr.Discussion> {
    return Bluebird.reject(new Incident("todo", "createDiscussion is not implemented yet"));
  }

  getAccount(account: Pltr.AccountReference | Pltr.AccountGlobalId): Bluebird<Pltr.Account> {
    return Bluebird.reject(new Incident("todo", "getAccount is not implemented yet"));
  }

  getContacts(options?: any): Bluebird<Pltr.Account[]> {
    return Bluebird
      .try(() => {
        return this.nativeApi.getContacts()
      })
      .map(mapContactToAccount);
  }

  getCurrentUser(): Bluebird<Pltr.UserAccount> {
    return Bluebird.resolve(this.user);
  }

  /**
   * PROTECTED
   * Returns the information associated to a thread from a threadID
   * @param threadID
   */
  protected getDiscussion(threadID: string): Bluebird<Pltr.Discussion> {
    return Bluebird.reject(new Incident("todo", "getDiscussion is not implemented yet"));
  }

  getDiscussions(options?: Pltr.Api.GetDiscussionsOptions): Bluebird<Pltr.Discussion[]> {
    return Bluebird.reject(new Incident("todo", "getDiscussions is not implemented yet"));
  }

  getMessagesFromDiscussion(discussion: Pltr.DiscussionReference | Pltr.DiscussionGlobalId, options?: Pltr.Api.GetMessagesFromDiscussionOptions): Bluebird<Pltr.Message[]> {
    return Bluebird.reject(new Incident("todo", "getMessagesFromDiscussion is not implemented yet"));
  }

  leaveDiscussion(discussion: Pltr.DiscussionReference | Pltr.DiscussionGlobalId, options?: any): Bluebird<this> {
    return Bluebird.reject(new Incident("todo", "leaveDiscussion is not implemented yet"));
  }

  removeMembersFromDiscussion(members: Array<Pltr.AccountReference | Pltr.AccountGlobalId>, discussion: Pltr.DiscussionReference | Pltr.DiscussionGlobalId, options?: any): Bluebird<this> {
    return Bluebird.reject(new Incident("todo", "removeMembersFromDiscussion is not implemented yet"));
  }

  sendMessage(message: Pltr.Api.NewMessage, discussion: Pltr.DiscussionReference | Pltr.DiscussionGlobalId, options?: any): Bluebird<Pltr.Message> {
    return Bluebird
      .try(() => {
        let discussionRef = Pltr.Id.asReference(discussion, DRIVER_NAME);
        let skypeMessage: skypeHttp.Api.NewMessage = {
          textContent: message.body
        };
        return this.nativeApi.sendMessage(skypeMessage, discussionRef.id);
      })
      .thenReturn(null);
  }
}
