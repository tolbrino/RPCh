import { utils } from "ethers";
import { APP_ID, MAX_BYTES, type Message } from "./utils";

/**
 * Construct a HOPR RPC Relay message.
 * @param appId this app's ID
 * @param msgType whether this is a request or response
 * @param segment_nr segment number
 * @param nr_of_segments number of segments
 * @param body body of the segment
 * @returns constructed message
 */
export const constructMessage = (
  appId: Message["appId"],
  msgType: Message["msgType"],
  segment_nr: Message["segment_nr"],
  nr_of_segments: Message["nr_of_segments"],
  body: Message["body"]
): string => {
  return [appId, msgType, segment_nr, nr_of_segments, body].join(":");
};

/**
 * Given a message, deconstruct it to Message type.
 * @param message
 * @returns deconstructed message
 */
export const deconstructMessage = (message: string): Message => {
  const [appId, msgType, segment_nr, nr_of_segments, ...body] = message.split(
    ":"
  ) as any;

  return {
    appId,
    msgType,
    segment_nr,
    nr_of_segments,
    body: body.join(":"),
  };
};

export const toSegments = (body: string, maxBytes: number): string[] => {
  let arr = utils.toUtf8Bytes(body);
  const res: string[] = [];

  while (arr.length > 0) {
    const index = arr.length > maxBytes ? maxBytes : arr.length;
    res.push(utils.toUtf8String(arr.slice(0, index)));
    arr = arr.slice(index, arr.length);
  }

  return res;
};

export const recreateBodyFromMessages = (messages: string[]): string => {
  return messages.reduce((result, message) => {
    const { body } = deconstructMessage(message);
    return result + body;
  }, "");
};

export const createMessages = (
  msgType: "req" | "res",
  body: string
): string[] => {
  const segments = toSegments(body, MAX_BYTES);
  if (!segments) return [];

  return segments.map((segment, segment_nr) =>
    constructMessage(APP_ID, msgType, segment_nr, segments.length, segment)
  );
};
