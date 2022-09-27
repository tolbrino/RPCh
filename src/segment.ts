/**
 * Represents a segment of a message.
 * This is what we send over HOPR network.
 */
export class Segment {
  constructor(
    public readonly msgId: string,
    public readonly segment_nr: number,
    public readonly nr_of_segments: number,
    public readonly origin: string,
    public readonly provider: string,
    public readonly body: string
  ) {}

  public static fromString(str: string): Segment {
    const [msgId, segment_nr, nr_of_segments, origin, provider, ...body] =
      str.split("|") as any;

    return new Segment(
      msgId,
      Number(segment_nr),
      Number(nr_of_segments),
      origin,
      provider,
      body.join("|")
    );
  }

  public static isValidSegmentStr(str: string): boolean {
    const segment = Segment.fromString(str);
    return Object.values(segment).every((val) => typeof val !== "undefined");
  }

  public static areSegmentsComplete(segments: Segment[]): boolean {
    if (segments.length === 0) return false;
    const { nr_of_segments } = segments[0];
    return nr_of_segments === segments.length;
  }

  public toString() {
    return [
      this.msgId,
      this.segment_nr,
      this.nr_of_segments,
      this.origin,
      this.provider,
      this.body,
    ].join("|");
  }
}
