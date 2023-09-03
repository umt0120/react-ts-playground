import type { PointStyle, Color } from "chart.js";

export class Rectangle {
  id: number;
  name: string;
  color: string;
  borderThickness: number;
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(
    id: number,
    name: string,
    color: string,
    borderThickness: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.borderThickness = borderThickness;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

export class FrameData {
  timestamp: number; // milliseconds
  averageLuminance: number;
  constructor(timestamp: number, averageLuminance: number) {
    this.timestamp = timestamp;
    this.averageLuminance = averageLuminance;
  }
}

/**
 * グラフ上の計測点を表すクラス.
 *
 * NOTE:
 * グラフ上のスタイルに関するプロパティは、Chart.jsのものから必要なものを抜粋しています.
 * よりリッチにしたい場合は、然るべきインタフェースを実装するなどを検討してください.
 *
 *
 */
export class MeasuringPoint {
  id: number;
  name: string;
  borderColor: Color;
  pointStyle: PointStyle;
  x: number;
  y: number;
  constructor(id: number, name: string, borderColor: Color, pointStyle: PointStyle, x: number, y: number) {
    this.id = id;
    this.name = name;
    this.borderColor = borderColor;
    this.pointStyle = pointStyle;
    this.x = x;
    this.y = y;
  }
}

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
