import { expect, describe } from "@jest/globals";
import { getNearestRectangleId } from "../../src/lib/rectangle";

describe("getNearestRectangleId: 矩形が1つの場合", () => {
  const rectangle1 = { id: 1, name: "test", color: "red", x: 5, y: 5, width: 10, height: 10 };

  const params = [
    {
      description: "マウスが矩形の左上にある場合",
      mouseX: 4,
      mouseY: 4,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
    },
    {
      description: "マウスが矩形の左側にある場合",
      mouseX: 4,
      mouseY: 5,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
    },
    {
      description: "マウスが矩形の左下にある場合",
      mouseX: 4,
      mouseY: 15,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
    },
    {
      description: "マウスが矩形の下側にある場合",
      mouseX: 5,
      mouseY: 15,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
    },
    {
      description: "マウスが矩形の右下にある場合",
      mouseX: 15,
      mouseY: 15,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
    },
    {
      description: "マウスが矩形の右側にある場合",
      mouseX: 15,
      mouseY: 14,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
    },
    {
      description: "マウスが矩形の右上にある場合",
      mouseX: 15,
      mouseY: 4,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
    },
    {
      description: "マウスが矩形の上側にある場合",
      mouseX: 14,
      mouseY: 4,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
    },
    {
      description: "マウスが矩形の内側にある場合",
      mouseX: 14,
      mouseY: 5,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
    },
  ];
  it.each(params)("$description", ({ description, mouseX, mouseY, rectangles, expectedRectangleId }) => {
    expect(getNearestRectangleId(mouseX, mouseY, rectangles)).toBe(expectedRectangleId);
  });
});

describe("getNearestRectangleId: 矩形が複数の場合", () => {
  const rectangle1 = { id: 1, name: "test1", color: "red", x: 5, y: 5, width: 5, height: 5 };
  const rectangle2 = { id: 2, name: "test2", color: "blue", x: 7, y: 7, width: 5, height: 5 };
  const params = [
    {
      description: "矩形1に近い場合: マウスが矩形外部",
      mouseX: 3,
      mouseY: 4,
      rectangles: [rectangle1, rectangle2],
      expectedRectangleId: 1,
    },
    {
      description: "矩形1に近い場合: マウスが矩形内部",
      mouseX: 6,
      mouseY: 5,
      rectangles: [rectangle1, rectangle2],
      expectedRectangleId: 1,
    },
    {
      description: "矩形2に近い場合: マウスが矩形外部",
      mouseX: 13,
      mouseY: 9,
      rectangles: [rectangle1, rectangle2],
      expectedRectangleId: 2,
    },
    {
      description: "矩形2に近い場合: マウスが矩形内部",
      mouseX: 11,
      mouseY: 11,
      rectangles: [rectangle1, rectangle2],
      expectedRectangleId: 2,
    },
    {
      description: "矩形1,2と等距離(index順)",
      mouseX: 8,
      mouseY: 8,
      rectangles: [rectangle1, rectangle2],
      expectedRectangleId: 1,
    },
  ];
  it.each(params)("$description", ({ description, mouseX, mouseY, rectangles, expectedRectangleId }) => {
    expect(getNearestRectangleId(mouseX, mouseY, rectangles)).toBe(expectedRectangleId);
  });
});
