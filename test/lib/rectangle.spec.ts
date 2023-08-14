import { expect, describe } from "@jest/globals";
import { getNearestRectangleId } from "../../src/lib/rectangle";
import { MousePosition } from "../../src/types/common";

describe("getNearestRectangleId: 矩形が1つの場合", () => {
  const rectangle1 = { id: 1, name: "test", color: "red", borderThickness: 2, x: 5, y: 5, width: 10, height: 10 };

  const params = [
    {
      description: "マウスが矩形の左上にある場合",
      mouseX: 4,
      mouseY: 4,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.TopLeft,
    },
    {
      description: "マウスが矩形の左側にある場合",
      mouseX: 4,
      mouseY: 8,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Left,
    },
    {
      description: "マウスが矩形の左下にある場合",
      mouseX: 4,
      mouseY: 16,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.BottomLeft,
    },
    {
      description: "マウスが矩形の下側にある場合",
      mouseX: 8,
      mouseY: 16,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Bottom,
    },
    {
      description: "マウスが矩形の右下にある場合",
      mouseX: 16,
      mouseY: 16,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.BottomRight,
    },
    {
      description: "マウスが矩形の右側にある場合",
      mouseX: 16,
      mouseY: 11,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Right,
    },
    {
      description: "マウスが矩形の右上にある場合",
      mouseX: 16,
      mouseY: 4,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.TopRight,
    },
    {
      description: "マウスが矩形の上側にある場合",
      mouseX: 12,
      mouseY: 4,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Top,
    },
    {
      description: "マウスが矩形の内側にある場合",
      mouseX: 8,
      mouseY: 8,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Inside,
    },
  ];
  it.each(params)(
    "$description",
    ({ description, mouseX, mouseY, rectangles, expectedRectangleId, expectedMousePosition }) => {
      const actual = getNearestRectangleId(mouseX, mouseY, rectangles);
      expect(actual.rectangle.id).toBe(expectedRectangleId);
      expect(actual.mousePosition).toBe(expectedMousePosition);
    },
  );
});

describe("getNearestRectangleId: 矩形が複数の場合", () => {
  const rectangle1 = { id: 1, name: "test1", color: "red", borderThickness: 0, x: 5, y: 5, width: 5, height: 5 };
  const rectangle2 = { id: 2, name: "test2", color: "blue", borderThickness: 0, x: 7, y: 7, width: 5, height: 5 };
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
    expect(getNearestRectangleId(mouseX, mouseY, rectangles).rectangle.id).toBe(expectedRectangleId);
  });
});
