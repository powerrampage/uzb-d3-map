import type { Side } from "../types";
import { MAP_W2, MAP_H2 } from "../constants";

export const deg2rad = (d: number) => (d * Math.PI) / 180;

export const unitFromAngle = (aDeg: number) => ({
  ux: Math.cos(deg2rad(aDeg)),
  uy: Math.sin(deg2rad(aDeg)),
});

export function rotateUnit(ux: number, uy: number, turnDeg: number) {
  const th = deg2rad(turnDeg);
  const rx = ux * Math.cos(th) - uy * Math.sin(th);
  const ry = ux * Math.sin(th) + uy * Math.cos(th);
  const len = Math.hypot(rx, ry) || 1;
  return { ux: rx / len, uy: ry / len };
}

export function unitFromSide(side: Side, tiltDeg = 0) {
  let base = { ux: 1, uy: 0 };
  if (side === "left") base = { ux: -1, uy: 0 };
  if (side === "top") base = { ux: 0, uy: -1 };
  if (side === "bottom") base = { ux: 0, uy: 1 };
  return rotateUnit(base.ux, base.uy, tiltDeg);
}

export function distanceToRectEdgeAlongDir(
  hw: number,
  hh: number,
  ux: number,
  uy: number
) {
  const tx = ux !== 0 ? hw / Math.abs(ux) : Infinity;
  const ty = uy !== 0 ? hh / Math.abs(uy) : Infinity;
  return Math.min(tx, ty);
}

export function clampToView(
  x: number,
  y: number,
  w: number,
  h: number,
  margin = 6
) {
  const hw = w / 2 + margin,
    hh = h / 2 + margin;
  return {
    x: Math.max(hw, Math.min(MAP_W2 - hw, x)),
    y: Math.max(hh, Math.min(MAP_H2 - hh, y)),
  };
}

export function borderPointForSide(
  center: { x: number; y: number },
  size: { w: number; h: number },
  side: Side
) {
  const hw = size.w / 2,
    hh = size.h / 2;
  if (side === "right") return { x: center.x - hw, y: center.y };
  if (side === "left") return { x: center.x + hw, y: center.y };
  if (side === "top") return { x: center.x, y: center.y + hh };
  return { x: center.x, y: center.y - hh };
}
