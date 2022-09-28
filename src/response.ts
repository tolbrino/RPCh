import Message from "./message";

const SEPERATOR = "|";

export default class Response {
  constructor(public readonly id: string, public readonly response: string) {}

  public static fromMessage(message: Message): Response {
    const [type, ...response] = message.body.split(SEPERATOR);
    if (type !== "response") throw Error("Message is not a Response");
    return new Response(message.id, response.join(SEPERATOR));
  }

  public toMessage(): Message {
    return new Message(this.id, ["response", this.response].join(SEPERATOR));
  }
}
