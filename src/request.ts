import Message from "./message";
import Response from "./response";
import { generateRandomId } from "./utils";

const SEPERATOR = "|";

export default class Request {
  constructor(
    public readonly id: string,
    public readonly origin: string,
    public readonly provider: string,
    public readonly request: string
  ) {}

  public static fromData(
    origin: string,
    provider: string,
    request: string
  ): Request {
    return new Request(generateRandomId(), origin, provider, request);
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
