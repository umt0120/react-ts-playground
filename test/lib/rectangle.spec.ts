import { expect, describe } from "@jest/globals";
import { getNearestRectangleId } from "../../src/lib/rectangle";
import { MousePosition } from "../../src/types/common";

describe("getNearestRectangleId: 矩形が1つの場合", () => {
  const rectangle1 = { id: 1, name: "test", color: "red", borderThickness: 2, x: 5, y: 5, width: 10, height: 10 };

  const params = [
    {
      description: "左上",
      mouseX: 4,
      mouseY: 4,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.TopLeft,
    },
    {
      description: "左側",
      mouseX: 4,
      mouseY: 10,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Left,
    },
    {
      description: "左下",
      mouseX: 4,
      mouseY: 16,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.BottomLeft,
    },
    {
      description: "上（枠線上）",
      mouseX: 5,
      mouseY: 4,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Top,
    },
    {
      description: "左上角",
      mouseX: 5,
      mouseY: 5,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.OnTopLeftCorner,
    },
    {
      description: "左線分上",
      mouseX: 5,
      mouseY: 10,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.OnLeftLine,
    },
    {
      description: "左下角",
      mouseX: 5,
      mouseY: 15,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.OnBottomLeftCorner,
    },
    {
      description: "左下（枠線上）",
      mouseX: 5,
      mouseY: 16,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Bottom,
    },
    {
      description: "上（内部）",
      mouseX: 8,
      mouseY: 4,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Top,
    },
    {
      description: "上（上線分上）",
      mouseX: 8,
      mouseY: 5,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.OnTopLine,
    },
    {
      description: "内部",
      mouseX: 8,
      mouseY: 8,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Inside,
    },
    {
      description: "下（下線分上）",
      mouseX: 8,
      mouseY: 15,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.OnBottomLine,
    },
    {
      description: "上（枠線上）",
      mouseX: 14,
      mouseY: 4,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Top,
    },
    {
      description: "右上角",
      mouseX: 14,
      mouseY: 5,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.OnTopRightCorner,
    },
    {
      description: "右線分上",
      mouseX: 14,
      mouseY: 8,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.OnRightLine,
    },
    {
      description: "右下角",
      mouseX: 14,
      mouseY: 14,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.OnBottomRightCorner,
    },
    {
      description: "下（枠線上）",
      mouseX: 14,
      mouseY: 16,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Bottom,
    },
    {
      description: "右上",
      mouseX: 16,
      mouseY: 4,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.TopRight,
    },
    {
      description: "右側",
      mouseX: 16,
      mouseY: 10,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.Right,
    },
    {
      description: "右下",
      mouseX: 16,
      mouseY: 16,
      rectangles: [rectangle1],
      expectedRectangleId: 1,
      expectedMousePosition: MousePosition.BottomRight,
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
  const rectangle1 = { id: 1, name: "test1", color: "red", borderThickness: 2, x: 5, y: 5, width: 10, height: 10 };
  const rectangle2 = { id: 2, name: "test2", color: "blue", borderThickness: 2, x: 10, y: 10, width: 10, height: 10 };
  const params = [
    {
      description: "矩形1に近い場合: マウスが矩形外部",
      mouseX: 3,
      mouseY: 4,
      rectangles: [rectangle1, rectangle2],
      expectedRectangleId: 1,
    },
    // {
    //   description: "矩形1に近い場合: マウスが矩形内部",
    //   mouseX: 6,
    //   mouseY: 5,
    //   rectangles: [rectangle1, rectangle2],
    //   expectedRectangleId: 1,
    // },
    // {
    //   description: "矩形2に近い場合: マウスが矩形外部",
    //   mouseX: 13,
    //   mouseY: 9,
    //   rectangles: [rectangle1, rectangle2],
    //   expectedRectangleId: 2,
    // },
    // {
    //   description: "矩形2に近い場合: マウスが矩形内部",
    //   mouseX: 11,
    //   mouseY: 11,
    //   rectangles: [rectangle1, rectangle2],
    //   expectedRectangleId: 2,
    // },
    // {
    //   description: "矩形1,2と等距離(index順)",
    //   mouseX: 8,
    //   mouseY: 8,
    //   rectangles: [rectangle1, rectangle2],
    //   expectedRectangleId: 1,
    // },
  ];
  it.each(params)("$description", ({ description, mouseX, mouseY, rectangles, expectedRectangleId }) => {
    expect(getNearestRectangleId(mouseX, mouseY, rectangles).rectangle.id).toBe(expectedRectangleId);
  });
});
