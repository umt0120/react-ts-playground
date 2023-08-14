export type Rectangle = {
  id: number;
  name: string;
  color: string;
  borderThickness: number;
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

export const MousePosition = {
  TopLeft: "TopLeft",
  OnTopLeftCorner: "OnTopLeftCorner",
  Left: "Left",
  OnLeftLine: "OnLeftLine",
  BottomLeft: "BottomLeft",
  OnBottomLeftCorner: "OnBottomLeftCorner",
  Bottom: "Bottom",
  OnBottomLine: "OnBottomLine",
  BottomRight: "BottomRight",
  OnBottomRightCorner: "OnBottomRightCorner",
  Right: "Right",
  OnRightLine: "OnRightLine",
  TopRight: "TopRight",
  OnTopRightCorner: "OnTopRightCorner",
  Top: "Top",
  OnTopLine: "OnTopLine",
  Inside: "Inside",
} as const;

export type MousePosition = (typeof MousePosition)[keyof typeof MousePosition];
