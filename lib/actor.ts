/**
 * **EXPERIMENTAL** actors model implementation.
 *
 * Actor model conventions:
 * - actors can't observe each other state.
 * - ui components can observe actors state.
 * - actor state can be modified only via message handlers.
 */
import {scheduleActorExecution} from "./scheduler";

/**
 * This function doesn't do anything, it just returns the same `groupName` value.
 *
 * It is used so that when building application in production mode, we can replace all occurences of
 * `getMessageGroupName` function and minify all group names.
 */
export function getMessageGroupName(groupName: string): string {
  return groupName;
}

/**
 * This function doesn't do anything, it just returns the same `messageName` value.
 *
 * It is used so that when building application in production mode, we can replace all occurences of
 * `getMessageName` function and minify all message names.
 */
export function getMessageName(messageName: string): string {
  return messageName;
}

/**
 * Message flags.
 */
export const enum MessageFlags {
  // Enable message tracing.
  Trace         = 1,
  // Message were created from an action initiated by user.
  UserInitiated = 1 << 1,
}

/**
 * Global counter that generates unique ids for actors.
 */
let _nextActorId = 0;

/**
 * Highest bit used for a message flag.
 *
 * It is used for assigning user flags at runtime.
 */
let _nextMessageFlag = 1 << 1;

/**
 * Message group registry that is used in DEBUG mode to check that all message names are unique.
 */
export const MessageGroupRegistry = ("<@KIVI_DEBUG@>" !== "DEBUG_DISABLED") ?
  new Map<string, Set<string>>() :
  undefined;

/**
 * Actor registry that is used in DEBUG mode.
 */
export const ActorRegistry = ("<@KIVI_DEBUG@>" !== "DEBUG_DISABLED") ?
  new Map<number, Actor<any>>() :
  undefined;

/**
 * Acquire a new message flag at runtime.
 */
export function acquireMessageFlag(): number {
  if ("<@KIVI_DEBUG@>" !== "DEBUG_DISABLED") {
    if (_nextMessageFlag === 1 << 31) {
      throw Error("Failed to acquire new message flag: no free message flags left.");
    }
  }
  _nextMessageFlag <<= 1;
  return _nextMessageFlag;
}

/**
 * Actor flags.
 */
export const enum ActorFlags {
  // Actor is registered in the scheduler actor task queue.
  Active          = 1,
  // Actor is disposed.
  Disposed        = 1 << 1,
}

/**
 * Message group.
 *
 * Example:
 *
 *     const RouterMessages = new MessageGroup("app.router");
 *     const ChangeRoute = RouterMessages.create<string>("changeRoute");
 *     const msg = ChangeRoute.create("/home");
 *
 *     actor.send(msg);
 */
export class MessageGroup {
  /**
   * Metadata.
   */
  _meta: Map<Symbol, any>;
  /**
   * Flags that will be marked on message descriptor instances. See `MessageDescriptorFlags` for details.
   */
  _markDescriptorFlags: number;
  /**
   * Flags that will be marked on message instances. See `MessageFlags` for details.
   */
  _markMessageFlags: number;
  /**
   * Id counter that is used to generate unique ids for message descriptors.
   */
  _nextId: number;
  /**
   * Group name.
   */
  readonly name: string;

  constructor(name: string) {
    this._meta = new Map<Symbol, any>();
    this._markDescriptorFlags = 0;
    this._markMessageFlags = 0;
    this._nextId = 0;
    this.name = name;

    if ("<@KIVI_DEBUG@>" !== "DEBUG_DISABLED") {
      if (MessageGroupRegistry!.has(name)) {
        throw Error(`Failed to create a new message group: group with name "${name}" already exist.`);
      } else {
        MessageGroupRegistry!.set(name, new Set<string>());
      }
    }
  }

  /**
   * Maximum id that was used to create message descriptors.
   */
  maxId(): number {
    return this._nextId;
  }

  /**
   * Acquire a new id.
   */
  acquireId(): number {
    return this._nextId++;
  }

  /**
   * Enable tracing for all messages in this group.
   */
  enableTracing(): MessageGroup {
    this._markMessageFlags |= MessageFlags.Trace;
    return this;
  }

  /**
   * Set metadata.
   */
  setMeta<M>(key: Symbol, value: M): MessageGroup {
    this._meta.set(key, value);
    return this;
  }

  /**
   * Create a new message descriptor.
   */
  create<P>(name: string): MessageDescriptor<P> {
    return new MessageDescriptor<P>(this, this.acquireId(), name, this._markDescriptorFlags, this._markMessageFlags);
  }
}

/**
 * Message descriptor.
 */
export class MessageDescriptor<P> {
  /**
   * Flags, see `MessageDescriptorFlags` for details.
   */
  _flags: number;
  /**
   * Flags that will be marked on message instances. See `MessageFlags` for details.
   */
  _markFlags: number;
  /**
   * Unique id among message in the same group.
   */
  readonly id: number;
  /**
   * Message group.
   */
  readonly group: MessageGroup;
  /**
   * Message name.
   */
  readonly name: string;
  /**
   * Metadata.
   */
  _meta: Map<Symbol, any>;

  constructor(group: MessageGroup, id: number, name: string, flags: number, messageFlags: number) {
    this._flags = flags;
    this._markFlags = messageFlags;
    this.id = id;
    this.group = group;
    this.name = name;
    this._meta = new Map<Symbol, any>();

    if ("<@KIVI_DEBUG@>" !== "DEBUG_DISABLED") {
      const messageNames = MessageGroupRegistry!.get(group.name);
      if (messageNames!.has(name)) {
        throw Error(`Failed to create a new message descriptor: descriptor with name "${name}" in message group ` +
                    `"${group.name}" already exist.`);
      } else {
        messageNames!.add(name);
      }
    }
  }

  /**
   * Enable tracing.
   */
  enableTracing(): MessageDescriptor<P> {
    this._markFlags |= MessageFlags.Trace;
    return this;
  }

  /**
   * Add metadata.
   */
  setMeta<M>(key: Symbol, value: M): MessageDescriptor<P> {
    this._meta.set(key, value);
    return this;
  }

  /**
   * Create a new message.
   */
  create(payload?: P): Message<P> {
    return new Message<P>(this, payload === undefined ? null : payload, this._markFlags);
  }
}

/**
 * Messages are used for communications between actors.
 */
export class Message<P> {
  /**
   * Flags, see `MessageFlags` for details.
   */
  _flags: number;
  /**
   * Message descriptor.
   */
  readonly descriptor: MessageDescriptor<P>;
  /**
   * Message payload.
   */
  readonly payload: P | null;
  /**
   * Metadata.
   */
  _meta: Map<Symbol, any> | null;

  constructor(descriptor: MessageDescriptor<P>, payload: P | null, flags: number) {
    this._flags = flags;
    this.descriptor = descriptor;
    this.payload = payload;
    this._meta = null;
  }

  /**
   * Add metadata.
   */
  setMeta<M>(key: Symbol, value: M): Message<P> {
    if (this._meta === null) {
      this._meta = new Map<Symbol, any>();
    }
    this._meta.set(key, value);
    return this;
  }

  /**
   * Get metadata.
   */
  getMeta<M>(key: Symbol): M | undefined {
    let value = this.descriptor.group._meta.get(key);
    if (value === undefined) {
      value = this.descriptor._meta.get(key);
    }
    if (value === undefined && this._meta !== null) {
      value = this._meta.get(key);
    }
    return value;
  }
}

/**
 * System messages group.
 */
export const SystemMessageGroup = new MessageGroup(getMessageGroupName("system"));

/**
 * System message: actor disposed.
 */
export const ActorDisposedMessage = SystemMessageGroup.create<Actor<any>>(getMessageName("actorDisposed"));

/**
 * Link actor `a` to another actor `b`.
 */
export class ActorLink {
  readonly a: Actor<any>;
  readonly b: Actor<any>;
  _prev: ActorLink | null;
  _next: ActorLink | null;

  private _isCanceled: boolean;

  constructor(a: Actor<any>, b: Actor<any>) {
    this.a = a;
    this.b = b;

    const firstALink = a._links;

    if (firstALink !== null) {
      firstALink._prev = this;
      this._next = firstALink;
    }

    a._links = this;

    if ("<@KIVI_DEBUG@>" !== "DEBUG_DISABLED") {
      this._isCanceled = false;
    }
  }

  /**
   * Cancel link.
   */
  cancel(): void {
    if ("<@KIVI_DEBUG@>" !== "DEBUG_DISABLED") {
      if (this._isCanceled) {
        throw new Error("Failed to cancel actor link: actor link is already canceled.");
      }
      this._isCanceled = true;
    }

    if (this._prev === null) {
      this.a._links = this._next;
    } else {
      this._prev._next = this._next;
    }
    if (this._next !== null) {
      this._next._prev = this._prev;
    }
  }
}

/**
 * Actor actions.
 */
export const enum ActorAction {
  Init        = 0,
  RecvMessage = 1,
}

/**
 * Actor.
 */
export class Actor<S> {
  /**
   * Unique Id.
   */
  readonly id: number;
  /**
   * Flags, see `ActorFlags` for details.
   */
  _flags: number;
  /**
   * Action, see `ActionAction` for detail.
   */
  _action: ActorAction;
  /**
   * Main function.
   */
  _iter: IterableIterator<ActorAction> | null;
  /**
   * State.
   */
  state: S | null;
  /**
   * Message inbox.
   */
  _inbox: Message<any>[];
  /**
   * Links.
   */
  _links: ActorLink | null;

  constructor() {
    this.id = _nextActorId++;
    this._flags = 0;
    this._action = ActorAction.Init;
    this._iter = null;
    this.state = null;
    this._inbox = [];
    this._links = null;

    if ("<@KIVI_DEBUG@>" !== "DEBUG_DISABLED") {
      ActorRegistry!.set(this.id, this);
    }
  }

  /**
   * Send a message to an actor.
   */
  send(message: Message<any>): void {
    sendMessage(this, message);
  }

  /**
   * Recieve a message.
   */
  recv(): ActorAction {
    return ActorAction.RecvMessage;
  }

  /**
   * Link with another actor.
   */
  link(actor: Actor<any>): ActorLink {
    if ("<@KIVI_DEBUG@>" !== "DEBUG_DISABLED") {
      let link = this._links;
      while (link !== null) {
        if (link.b === actor) {
          throw new Error("Failed to link an actor: actor is already linked to this actor.");
        }
        link = link._next;
      }
    }

    return new ActorLink(this, actor);
  }
}

/**
 * Dispose an actor.
 */
function disposeActor(actor: Actor<any>): void {
  if ("<@KIVI_DEBUG@>" !== "DEBUG_DISABLED") {
    ActorRegistry!.delete(actor.id);

    if ((actor._flags & ActorFlags.Disposed) !== 0) {
      throw new Error("Failed to dispose an actor: actor is already disposed.");
    }
  }

  actor._flags |= ActorFlags.Disposed;
  let link = actor._links;
  if (link !== null) {
    const msg = ActorDisposedMessage.create(actor);
    do {
      link.b.send(msg);
      link = link._next;
    } while (link !== null);
  }
}

/**
 * Send message to an actor.
 */
export function sendMessage(actor: Actor<any>, message: Message<any>): void {
  if ((actor._flags & ActorFlags.Disposed) === 0) {
    if ((actor._flags & ActorFlags.Active) === 0) {
      scheduleActorExecution(actor);
      actor._flags |= ActorFlags.Active;
    }
    actor._inbox.push(message);
  }
}

/**
 * Spawn new actor.
 */
export function spawn<P>(main: (actor: Actor<any>, props?: P) => IterableIterator<ActorAction>, props?: P): Actor<any> {
  const actor = new Actor();
  actor._iter = main(actor, props);
  scheduleActorExecution(actor);
  actor._flags |= ActorFlags.Active;
  return actor;
}

/**
 * Execute an actor.
 */
export function execActor(actor: Actor<any>): void {
  let next: IteratorResult<ActorAction> | undefined;

  do {
    if (actor._action === ActorAction.RecvMessage) {
      if (actor._inbox.length > 0) {
        // TODO: optimize message consuming
        next = actor._iter!.next(actor._inbox.shift());
      }
    } else {
      next = actor._iter!.next();
    }
    if (next !== undefined) {
      if (!next.done) {
        actor._action = next.value;
        continue;
      }
      disposeActor(actor);
    }
  } while (false);

  actor._flags &= ~ActorFlags.Active;
}

/**
 * Helper function for TypeScript developers to extract payload from messages.
 */
export function getMessagePayload<P>(descriptor: MessageDescriptor<P>, message: Message<P>): P {
  return message.payload!;
}
