import Message from "./message";

const SEPERATOR = "|";

/**
 * Represents a response made by a hopr-rpc-relay.
 * To be send over the HOPR network via Response.toMessage().
 */
export default class Response {
  constructor(public readonly id: number, public readonly response: string) {}

  public static fromMessage(message: Message): Response {
    const [type, ...response] = message.body.split(SEPERATOR);
    if (type !== "response") throw Error("Message is not a Response");
    return new Response(message.id, response.join(SEPERATOR));
  }

  public toMessage(): Message {
    return new Message(this.id, ["response", this.response].join(SEPERATOR));
  }
}
