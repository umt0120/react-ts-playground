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

/**
 * マウスと矩形の位置関係を判定する.
 *
 * @param mouseX マウスのX座標
 * @param mouseY マウスのY座標
 * @param rectangle 矩形
 * @returns マウスと矩形の位置関係
 */
const getMousePositionRelativeToRectangle = (mouseX: number, mouseY: number, rectangle: Rectangle): MousePosition => {
  const { x, y, width, height, borderThickness } = rectangle;

  const isWithin = (value: number, start: number, end: number) => value >= start && value <= end;

  // 左の枠線上 or 外側
  if (isWithin(mouseX, x, x + borderThickness)) {
    if (isWithin(mouseY, y, y + borderThickness)) return MousePosition.OnTopLeftCorner;
    if (isWithin(mouseY, y + borderThickness, y + height - borderThickness)) return MousePosition.OnLeftLine;
    if (isWithin(mouseY, y + height - borderThickness, y + height)) return MousePosition.OnBottomLeftCorner;
    if (mouseY < y) return MousePosition.Top;
    if (mouseY > y + height) return MousePosition.Bottom;
  }

  // 右の枠線上 or 外側
  if (isWithin(mouseX, x + width - borderThickness, x + width)) {
    if (isWithin(mouseY, y, y + borderThickness)) return MousePosition.OnTopRightCorner;
    if (isWithin(mouseY, y + borderThickness, y + height - borderThickness)) return MousePosition.OnRightLine;
    if (isWithin(mouseY, y + height - borderThickness, y + height)) return MousePosition.OnBottomRightCorner;
    if (mouseY < y) return MousePosition.Top;
    if (mouseY > y + height) return MousePosition.Bottom;
  }

  // 左右の境界線上 or 内側
  if (isWithin(mouseX, x + borderThickness, x + width - borderThickness)) {
    if (isWithin(mouseY, y, y + borderThickness)) return MousePosition.OnTopLine;
    if (isWithin(mouseY, y + borderThickness, y + height - borderThickness)) return MousePosition.Inside;
    if (isWithin(mouseY, y + height - borderThickness, y + height)) return MousePosition.OnBottomLine;
    if (mouseY < y) return MousePosition.Top;
    if (mouseY > y + height) return MousePosition.Bottom;
  }

  // 左外
  if (mouseX < x) {
    if (mouseY < y) return MousePosition.TopLeft;
    if (mouseY > y + height) return MousePosition.BottomLeft;
    return MousePosition.Left;
  }

  // 右外
  if (mouseX > x + width) {
    if (mouseY < y) return MousePosition.TopRight;
    if (mouseY > y + height) return MousePosition.BottomRight;
    return MousePosition.Right;
  }

  return MousePosition.OutSide;
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
  const centerX = (rect.maxX + rect.minX) / 2;
  const centerY = (rect.maxY + rect.minY) / 2;
  const distanceX = point.x - centerX;
  const distanceY = point.y - centerY;
  return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
};
