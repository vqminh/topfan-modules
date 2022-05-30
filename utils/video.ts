export function getSupportedMimeType() {
  const possibleTypes = [
    "video/mp4;codecs=h264,aac",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=h264,opus",
  ];
  return possibleTypes.find((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType)
  );
}
