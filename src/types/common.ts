export type Rectangle = {
  id: number;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FrameData = {
  timestamp: number; // milliseconds
  averageLuminance: number;
};

export type ResizeDirection =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "inside"
  | "outside";
