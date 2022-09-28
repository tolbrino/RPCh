const SEPERATOR = "|";

/**
 * Represents a segment of a message.
 * This is what we send over the HOPR network.
 */
export default class Segment {
  constructor(
    public readonly msgId: string,
    public readonly segmentNr: number,
    public readonly segmentsLength: number,
    public readonly body: string
  ) {}

  public toString() {
    return [this.msgId, this.segmentNr, this.segmentsLength, this.body].join(
      SEPERATOR
    );
  }

  public static fromString(str: string): Segment {
    const [msgId_, segmentNr_, segmentsLength_, ...body_] = str.split(
      SEPERATOR
    ) as string[];

    const msgId = msgId_;
    const segmentNr = Number(segmentNr_);
    const segmentsLength = Number(segmentsLength_);
    const body = body_.join(SEPERATOR);

    if (!msgId || isNaN(segmentNr) || isNaN(segmentsLength) || !body) {
      throw Error(`Failed to construct Segment from string: ${str}`);
    }

    return new Segment(msgId, segmentNr, segmentsLength, body);
  }
}

export const validateSegments = (segments: Segment[]): boolean => {
  if (segments.length === 0) return false;
  const { segmentsLength } = segments[0];
  return segmentsLength === segments.length;
};
