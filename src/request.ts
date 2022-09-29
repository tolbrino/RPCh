import Message from "./message";
import Response from "./response";
import { generateRandomNumber } from "./utils";

const SEPERATOR = "|";

/**
 * Represents a request made by the hopr-rpc-relay.
 * To be send over the HOPR network via Request.toMessage().
 */
export default class Request {
  constructor(
    public readonly id: number,
    public readonly origin: string,
    public readonly provider: string,
    public readonly request: string
  ) {}

  public static fromData(
    origin: string,
    provider: string,
    request: string
  ): Request {
    return new Request(generateRandomNumber(), origin, provider, request);
  }

  public static fromMessage(message: Message): Request {
    const [type, origin, provider, ...request] = message.body.split(SEPERATOR);
    if (type !== "request") throw Error("Message is not a Request");
    return new Request(message.id, origin, provider, request.join(SEPERATOR));
  }

  public toMessage(): Message {
    return new Message(
      this.id,
      ["request", this.origin, this.provider, this.request].join(SEPERATOR)
    );
  }

  public createResponse(response: string): Response {
    return new Response(this.id, response);
  }
}
