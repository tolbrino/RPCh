const APP_ID = "rpcrelay";

export const constructMessage = (
  appId: string,
  msgType: "req" | "res",
  segment_nr: number,
  nr_of_segments: number,
  body: string
): string => {
  return [appId, msgType, segment_nr, nr_of_segments, body].join(":");
};

export const createMessages = (
  msgType: "req" | "res",
  body: string
): string[] => {
  const segments = body.match(/.{1,400}/g);
  if (!segments) return [];

  return segments.map((segment, segment_nr) =>
    constructMessage(APP_ID, msgType, segment_nr, segments.length, segment)
  );
};
