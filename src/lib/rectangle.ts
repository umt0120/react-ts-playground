import { Rectangle, MousePosition } from "../types/common";

/**
 * 矩形の配列からマウスの座標に最も近い矩形のIDを取得する.
 * 矩形の中心からの距離ではなく、最も近い辺または頂点からの距離を計算する.
 *
 * @param mouseX マウスのX座標
 * @param mouseY マウスのY座標
 * @param rectangles 矩形の配列
 * @returns マウスの座標に最も近い矩形のID
 */
export const getNearestRectangleId = (
  mouseX: number,
  mouseY: number,
  rectangles: Rectangle[],
): { rectangle: Rectangle; mousePosition: MousePosition } => {
  const rectWithDistances = calculateDistanceFromEachRectangle(mouseX, mouseY, rectangles);
  const nearestRectangleWithDistances = rectWithDistances.sort((a, b) => {
    if (a.distanceToEdge !== b.distanceToEdge) {
      return a.distanceToEdge - b.distanceToEdge;
    }
    // distanceToEdgeが同じ場合は、distanceToCenterの昇順で比較
    return a.distanceToCenter - b.distanceToCenter;
  })[0];
  const mousePosition = getMousePositionRelativeToRectangle(mouseX, mouseY, nearestRectangleWithDistances.rectangle);
  return { rectangle: nearestRectangleWithDistances.rectangle, mousePosition: mousePosition };
};

const getMousePositionRelativeToRectangle = (mouseX: number, mouseY: number, rectangle: Rectangle): MousePosition => {
  const { x, y, width, height, borderThickness } = rectangle;

  // define the corners and edges of the rectangle
  const topLeft = { x, y };
  const topRight = { x: x + width, y };
  const bottomLeft = { x, y: y + height };
  const bottomRight = { x: x + width, y: y + height };

  // Check the position of the mouse relative to the rectangle
  if (mouseX < topLeft.x) {
    if (mouseY < topLeft.y) return MousePosition.TopLeft;
    if (mouseY > bottomLeft.y) return MousePosition.BottomLeft;
    if (mouseY >= topLeft.y && mouseY <= topLeft.y + borderThickness) return MousePosition.OnTopLeftCorner;
    if (mouseY <= bottomLeft.y && mouseY >= bottomLeft.y - borderThickness) return MousePosition.OnBottomLeftCorner;
    return MousePosition.Left;
  }

  if (mouseX > topRight.x) {
    if (mouseY < topRight.y) return MousePosition.TopRight;
    if (mouseY > bottomRight.y) return MousePosition.BottomRight;
    if (mouseY >= topRight.y && mouseY <= topRight.y + borderThickness) return MousePosition.OnTopRightCorner;
    if (mouseY <= bottomRight.y && mouseY >= bottomRight.y - borderThickness) return MousePosition.OnBottomRightCorner;
    return MousePosition.Right;
  }

  if (mouseY < topLeft.y) {
    if (mouseX >= topLeft.x && mouseX <= topLeft.x + borderThickness) return MousePosition.OnTopLeftCorner;
    if (mouseX <= topRight.x && mouseX >= topRight.x - borderThickness) return MousePosition.OnTopRightCorner;
    return MousePosition.Top;
  }

  if (mouseY > bottomLeft.y) {
    if (mouseX >= bottomLeft.x && mouseX <= bottomLeft.x + borderThickness) return MousePosition.OnBottomLeftCorner;
    if (mouseX <= bottomRight.x && mouseX >= bottomRight.x - borderThickness) return MousePosition.OnBottomRightCorner;
    return MousePosition.Bottom;
  }

  if (
    mouseX >= topLeft.x + borderThickness &&
    mouseX <= topRight.x - borderThickness &&
    mouseY >= topLeft.y + borderThickness &&
    mouseY <= bottomLeft.y - borderThickness
  ) {
    return MousePosition.Inside;
  }

  // Default to inside if none of the above conditions are met
  return MousePosition.Inside;
};

/**
 * 矩形の配列からマウスの座標に最も近い矩形の辺または頂点までの距離の配列を取得する.
 *
 * @param mouseX マウスのX座標
 * @param mouseY マウスのY座標
 * @param rectangles 矩形の配列
 * @returns マウスの座標から矩形の辺または頂点までの距離の配列
 */
const calculateDistanceFromEachRectangle = (
  mouseX: number,
  mouseY: number,
  rectangles: Rectangle[],
): { rectangle: Rectangle; distanceToEdge: number; distanceToCenter: number }[] => {
  return rectangles.map((rectangle) => {
    // 0はマウスの座標が矩形の内側にあることを表す
    const point = { x: mouseX, y: mouseY };
    const rect = {
      minX: rectangle.x,
      minY: rectangle.y,
      maxX: rectangle.x + rectangle.width,
      maxY: rectangle.y + rectangle.height,
    };

    const distanceToEdge = calculateDistanceBetweenPointAndRectangleEdge(point, rect);
    const distanceToCenter = calculateDistanceBetweenPointAndRectangleCenter(point, rect);
    return { rectangle: rectangle, distanceToEdge: distanceToEdge, distanceToCenter: distanceToCenter };
  });
};

/**
 * 点と矩形の辺または頂点までの距離を計算する.
 * 点が矩形の内側にある場合は0を返す.
 * @param point 点の座標
 * @param rect 矩形の座標
 * @returns 点と矩形の辺または頂点までの距離
 */
const calculateDistanceBetweenPointAndRectangleEdge = (
  point: { x: number; y: number },
  rect: { minX: number; minY: number; maxX: number; maxY: number },
): number => {
  const distanceX = Math.max(rect.minX - point.x, 0, point.x - rect.maxX);
  const distanceY = Math.max(rect.minY - point.y, 0, point.y - rect.maxY);
  return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
};

/**
 * 点と矩形の中心までの距離を計算する.
 *
 * @param point 点の座標
 * @param rect 矩形の座標
 * @returns 点と矩形の中心までの距離
 */
const calculateDistanceBetweenPointAndRectangleCenter = (
  point: { x: number; y: number },
  rect: { minX: number; minY: number; maxX: number; maxY: number },
): number => {
  const centerX = (rect.maxX - rect.minX) / 2;
  const centerY = (rect.maxY - rect.minY) / 2;
  const distanceX = point.x - centerX;
  const distanceY = point.y - centerY;
  return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
};
