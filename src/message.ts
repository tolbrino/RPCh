import { Segment } from "./segment";
import { generateRandomId, splitStrByBytes, MAX_BYTES } from "./utils";

/**
 * Represents a message.
 * Body is a valid RPC content.
 */
export class Message {
  constructor(
    public readonly id: string,
    public readonly origin: string,
    public readonly provider: string,
    public readonly body: string
  ) {}

  public static fromSegments(segments: Segment[]): Message {
    if (segments.length === 0) {
      throw Error("Cannot create Message from no segments");
    }

    const { msgId, origin, provider, nr_of_segments } = segments[0];
    if (nr_of_segments !== segments.length) {
      throw Error("Cannot crete Message, missing segments");
    }
    if (
      !segments.every(
        (s) =>
          s.msgId === msgId && s.origin === origin && s.provider === provider
      )
    ) {
      throw Error("Cannot crete Message from incompatible segments");
    }

    const body = segments
      .sort((a, b) => {
        return a.segment_nr - b.segment_nr;
      })
      .reduce((result, segment) => {
        return result + segment.body;
      }, "");

    return new Message(msgId, origin, provider, body);
  }

  public static fromBody(
    origin: string,
    provider: string,
    body: string
  ): Message {
    return new Message(generateRandomId(), origin, provider, body);
  }

  public createResponseMessage(myPeerId: string, body: string): Message {
    return new Message(this.id, this.origin, this.provider, body);
  }

  public toSegments(): Segment[] {
    const bodies = splitStrByBytes(this.body, MAX_BYTES);
    if (!bodies) return [];

    return bodies.map(
      (body, index) =>
        new Segment(
          this.id,
          index,
          bodies.length,
          this.origin,
          this.provider,
          body
        )
    );
  }
}
