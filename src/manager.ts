import type { ServerResponse } from "http";
import { Message } from "./message";
import { Segment } from "./segment";
import { createLogger, isExpired } from "./utils";

const { log, logError } = createLogger("manager");

/**
 * Stores pending requests and partial segments.
 */
export class Manager {
  // messages we are sending out, keyed by message.id
  private messages = new Map<
    string,
    {
      message: Message;
      destination: string;
    }
  >();

  // requests we have made to another relay, keyed by message.id
  private requests = new Map<
    string,
    {
      createdAt: Date;
      responseObj: ServerResponse;
    }
  >();

  // partial segments received, keyed by segment.msgId
  private segments = new Map<
    string,
    {
      segments: Segment[];
      receivedAt: Date;
    }
  >();

  constructor(
    private timeout: number,
    private myPeerId: string,
    private sendSegmentToExitRelay: (
      segment: Segment,
      destination: string
    ) => Promise<void>,
    private sendRpcToProvider: (
      message: Message,
      provider: string
    ) => Promise<string>
  ) {}

  private async sendMessage(
    message: Message,
    destination: string
  ): Promise<void> {
    this.messages.set(message.id, {
      message,
      destination,
    });
    for (const segment of message.toSegments()) {
      await this.sendSegmentToExitRelay(segment, destination);
    }
  }

  public async createRequest(
    message: Message,
    responseObj: ServerResponse,
    destination: string
  ): Promise<void> {
    this.requests.set(message.id, {
      createdAt: new Date(),
      responseObj,
    });
    await this.sendMessage(message, destination);
  }

  public handleReceivedResponseMessage(responseMessage: Message): void {
    const request = this.requests.get(responseMessage.id);
    if (!request) {
      logError("matching request not found", responseMessage.id);
      return;
    }
    const requestMessage = this.messages.get(responseMessage.id)?.message;
    if (!requestMessage) {
      this.requests.delete(responseMessage.id);
      logError("matching request message not found", responseMessage.id);
      return;
    }

    request.responseObj.write(responseMessage.body);
    request.responseObj.statusCode = 200;
    request.responseObj.end();
    this.requests.delete(responseMessage.id);
    this.messages.delete(responseMessage.id);
    log("responded to %s with %s", requestMessage.body, responseMessage.body);
  }

  public async handleReceivedRequestMessage(message: Message): Promise<void> {
    const response = await this.sendRpcToProvider(message, message.provider);
    await this.sendMessage(
      message.createResponseMessage(this.myPeerId, response),
      message.origin
    );
  }

  public onReceivedSegment(segment: Segment): void {
    // get segment entry with matching msgId, or create a new one
    const segmentEntry = this.segments.get(segment.msgId) || {
      segments: [] as Segment[],
      receivedAt: new Date(),
    };

    if (
      segmentEntry.segments.find((s) => s.segment_nr === segment.segment_nr)
    ) {
      log(
        "dropping segment, already exists",
        segment.msgId,
        segment.segment_nr
      );
      return;
    }

    segmentEntry.segments = [...segmentEntry.segments, segment];
    this.segments.set(segment.msgId, segmentEntry);

    if (Segment.areSegmentsComplete(segmentEntry.segments)) {
      const message = Message.fromSegments(segmentEntry.segments);
      const isResponse = message.getMessageType(this.myPeerId) === "res";

      // this is a response to a message we have sent
      if (isResponse) this.handleReceivedResponseMessage(message);
      // this is a new request we need to fulfill
      else this.handleReceivedRequestMessage(message);
    }
  }

  public removeExpired(): void {
    const now = new Date();

    for (const [id, entry] of this.requests.entries()) {
      if (isExpired(this.timeout, now, entry.createdAt)) {
        const message = this.messages.get(id);

        if (!message) {
          log("did not find message in expired request, dropping");
          this.requests.delete(id);
        } else {
          log("dropping expired request");
          this.requests.delete(id);
          this.messages.delete(id);

          entry.responseObj.statusCode = 400;
          entry.responseObj.end();
        }
      }
    }

    for (const [id, entry] of this.segments.entries()) {
      if (isExpired(this.timeout, now, entry.receivedAt)) {
        log("dropping expired partial segments");
        this.segments.delete(id);
      }
    }
  }
}
