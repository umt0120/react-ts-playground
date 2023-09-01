export class Rectangle {
  id: number;
  name: string;
  color: string;
  borderThickness: number;
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(id: number, name: string, color: string, borderThickness: number, x: number, y: number, width: number, height: number) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.borderThickness = borderThickness;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
};

export class FrameData  {
  timestamp: number; // milliseconds
  averageLuminance: number;
  constructor(timestamp: number, averageLuminance: number) {
    this.timestamp = timestamp;
    this.averageLuminance = averageLuminance;
  }
};

export class MeasuringPoint {
  id: number;
  name: string;
  x: number;
  y: number;
  constructor(id: number, name: string, x: number, y: number) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
  }
};

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
  OutSide: "Outside",
} as const;

export type MousePosition = (typeof MousePosition)[keyof typeof MousePosition];
