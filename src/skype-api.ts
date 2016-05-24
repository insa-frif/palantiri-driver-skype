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
    id: "8:" + contact.id, // temporary hack to get the prefixed id (8: means "human")
    name: String((contact.name && contact.name.nickname) || contact.id),
    avatarUrl: contact.avatar_url,
    driverData: contact
  }
}

function mapDiscussion (discussion: skypeHttp.Conversation): Pltr.Discussion {
  return {
    id: discussion.id,
    driverName: DRIVER_NAME,
    creationDate: null, // TODO
    name: (discussion.threadProperties && discussion.threadProperties.topic) || null,
    description: null,
    isPrivate: true,
    participants: [],
    owner: null,
    authorizations: {
      write: true,
      talk: true,
      video: true,
      invite: true,
      kick: false,
      ban: false
    },
    driverData: discussion
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
    let discussionPromise: Bluebird<Pltr.Discussion>;

    if ((!Array.isArray(members)) || members.length === 0) {
      discussionPromise = Bluebird.reject(new Incident("no-members", "Unable to create discussion, no members provided"));
    } else if (members.length === 1) {
      discussionPromise = Bluebird.try(() => {
        return this.getAccount (members[0])
          .then((account: Pltr.Account) => {
            let pltrDiscu: Pltr.Discussion;
            pltrDiscu = {
              id: account.id,
              driverName: DRIVER_NAME,
              creationDate: null, // TODO
              name: account.name,
              description: null,
              isPrivate: true,
              participants: [account],
              owner: null,
              authorizations: {
                write: true,
                talk: true,
                video: true,
                invite: true,
                kick: false,
                ban: false
              },
              driverData: {}
            };
            return pltrDiscu;
          });
      });
    } else {
      discussionPromise = Bluebird.reject(new Incident("todo", "createDiscussion does not support group discussions yet"));
    }
    return discussionPromise;
  }

  getAccount(account: Pltr.AccountReference | Pltr.AccountGlobalId): Bluebird<Pltr.Account> {
    return Bluebird.try(() => {
      let ref = Pltr.Id.asReference(account, DRIVER_NAME);
      let pltrMember: Pltr.Account = {
        driverName: DRIVER_NAME,
        id: ref.id,
        name: ref.id,
        avatarUrl: null,
        driverData: {id: ref.id}
      };
      return pltrMember;
    });
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

  getDiscussions (options?: Pltr.Api.GetDiscussionsOptions): Bluebird<Pltr.Discussion[]> {
    return Bluebird
      .try(() => {
        return this.nativeApi.getConversations()
      })
      .map((discussion: skypeHttp.Conversation) => {
        let pltrDiscu = mapDiscussion(discussion);
        let members: Bluebird<string[]>;

        if (discussion.members) {
          members = Bluebird.resolve(discussion.members);
        } else {
          members = Bluebird
            .try(() => {
              return this.nativeApi.getConversation(discussion.id);
            })
            .then((conversation: skypeHttp.Conversation) => {
              return conversation.members || [];
            });
        }

        return members
          .map((memberId: string) => {
            return this.getAccount({driverName: DRIVER_NAME, id: memberId});
          })
          .then((members: Pltr.Account[]) => {
            pltrDiscu.participants = members;
            return pltrDiscu;
          })
      });
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
