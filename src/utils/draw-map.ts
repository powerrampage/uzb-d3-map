import React from "react";
import { createRoot, Root } from "react-dom/client";
import { LabelRenderer } from "../components/label-renderer";
import {
  DEFAULT_ANGLE,
  DEFAULT_H,
  DEFAULT_TURN,
  DEFAULT_V
} from "../constants";
import { labelConfig as defaultLabelConfig } from "../data";
import type { DrawMapArgs, LabelCfg, LabelNode, RegionDatum } from "../types";
import {
  borderPointForSide,
  clampToView,
  distanceToRectEdgeAlongDir,
  rotateUnit,
  unitFromAngle,
  unitFromSide,
} from "./geometry";
import { measureLines } from "./text";

type D3Selection<GElement extends Element = Element, Datum = unknown, PElement extends Element | null = null, PDatum = unknown> =
  import("d3").Selection<GElement, Datum, PElement, PDatum>;
type PathStyle = Partial<React.SVGProps<SVGPathElement>>;
type GetPathStyleFn = (data: RegionDatum) => PathStyle;

interface StyleConfig {
  colors: Required<import("../types").ColorScheme>;
  stroke: Required<import("../types").StrokeConfig>;
  activeKey: string | null;
  getPathStyle?: GetPathStyleFn;
}

interface Centroid {
  key: string;
  cx: number;
  cy: number;
  name: string;
  value?: number;
}

const TRANSITION_DURATION = 100;
const STANDARD_ATTRS = new Set(["fill", "stroke", "strokeWidth"]);

/**
 * Creates a style resolver function that merges custom styles with defaults
 */
const createStyleResolver = (config: StyleConfig) => {
  const { colors, stroke, activeKey, getPathStyle } = config;

  return (data: RegionDatum): PathStyle => {
    const isActive = data.key === activeKey;
    const defaultFill = isActive ? colors.active : colors.default;
    const customStyle = getPathStyle?.(data);

    const fill = customStyle?.fill ?? defaultFill;

    return {
      ...customStyle,
      fill,
      stroke: customStyle?.stroke ?? stroke.color,
      strokeWidth: customStyle?.strokeWidth ?? stroke.width,
    };
  };
};

/**
 * Applies style attributes to a D3 selection
 */
const applyStyleToSelection = <T extends Element, D>(
  selection: D3Selection<T, D>,
  style: PathStyle,
  useTransition = false
): void => {
  const fillValue = style.fill;
  if (fillValue == null) return;

  if (useTransition) {
    const trans = selection.transition().duration(TRANSITION_DURATION) as any;
    trans.attr("fill", fillValue);
    if (style.stroke != null) trans.attr("stroke", style.stroke);
    if (style.strokeWidth != null) trans.attr("stroke-width", style.strokeWidth);

    for (const [key, value] of Object.entries(style)) {
      if (!STANDARD_ATTRS.has(key) && value != null) {
        trans.attr(key, value as any);
      }
    }
  } else {
    selection.attr("fill", fillValue);
    if (style.stroke != null) selection.attr("stroke", style.stroke);
    if (style.strokeWidth != null) selection.attr("stroke-width", style.strokeWidth);

    for (const [key, value] of Object.entries(style)) {
      if (!STANDARD_ATTRS.has(key) && value != null) {
        selection.attr(key, value as any);
      }
    }
  }
};

/**
 * Renders region paths with appropriate styling and event handlers
 */
function renderRegions(
  d3: typeof import("d3"),
  regionLayer: D3Selection<SVGGElement>,
  data: RegionDatum[],
  config: StyleConfig,
  onClick: (key: string) => void,
): D3Selection<SVGPathElement, RegionDatum> {
  const resolveStyle = createStyleResolver(config);
  const { activeKey } = config;

  const regionSel = regionLayer
    .selectAll<SVGPathElement, RegionDatum>("path.region")
    .data(data, (d) => d.key)
    .join("path")
    .attr("class", (d: RegionDatum) =>
      d.key === activeKey ? "map-region region map-region-active" : "map-region region"
    )
    .attr("d", (d) => d.d)
    .attr("cursor", "pointer")
    .each(function (this: SVGPathElement, d: RegionDatum) {
      applyStyleToSelection(d3.select(this), resolveStyle(d));
    })
    .on("click", (_e: MouseEvent, d: RegionDatum) => onClick(d.key));

  return regionSel as any;
}

/**
 * Calculates label position based on configuration
 */
function calculateLabelPosition(
  cfg: LabelCfg,
  elbow: { x: number; y: number },
  ux2: number,
  uy2: number,
  hw: number,
  hh: number,
  vLen: number
): { x: number; y: number } {
  const gap = 12;
  const posX = elbow.x + vLen * ux2;
  const posY = elbow.y + vLen * uy2;

  if (cfg.side) {
    switch (cfg.side) {
      case "right":
        return { x: posX + (hw + gap), y: posY };
      case "left":
        return { x: posX - (hw + gap), y: posY };
      case "top":
        return { x: posX, y: posY - (hh + gap) };
      case "bottom":
        return { x: posX, y: posY + (hh + gap) };
    }
  }

  const edgeDist = distanceToRectEdgeAlongDir(hw, hh, ux2, uy2);
  return {
    x: elbow.x + (vLen + edgeDist + gap) * ux2,
    y: elbow.y + (vLen + edgeDist + gap) * uy2,
  };
}

/**
 * Calculates label nodes positions based on region centroids and configuration
 */
function calculateLabelNodes(
  svgSel: D3Selection<SVGSVGElement>,
  regionSel: D3Selection<SVGPathElement, RegionDatum>,
  labelConfigMap: Partial<Record<string, LabelCfg>>
): LabelNode[] {
  const centroids: Centroid[] = [];

  regionSel.each(function (this: SVGPathElement, d: RegionDatum) {
    const bbox = this.getBBox();
    centroids.push({
      key: d.key,
      cx: bbox.x + bbox.width * 0.5,
      cy: bbox.y + bbox.height * 0.5,
      name: d.name || d.key,
      value: d.value,
    });
  });

  const nodes: LabelNode[] = new Array(centroids.length);
  const padX = 10;
  const padY = 8;

  for (let i = 0; i < centroids.length; i++) {
    const centroid = centroids[i];
    const cfg: LabelCfg = labelConfigMap[centroid.key] || {};
    const hLen = cfg.h ?? DEFAULT_H;
    const vLen = cfg.v ?? DEFAULT_V;
    const angle = cfg.angleDeg ?? DEFAULT_ANGLE;
    const { ux: ux1, uy: uy1 } = unitFromAngle(angle);

    const { ux: ux2, uy: uy2 } = cfg.side
      ? unitFromSide(cfg.side, cfg.tiltDeg ?? 0)
      : rotateUnit(ux1, uy1, cfg.turnDeg ?? DEFAULT_TURN);

    const lines = centroid.value != null
      ? [String(centroid.value), centroid.name]
      : [centroid.name];

    const size = measureLines(svgSel as any, lines, 12, 700);
    const w = size.w + padX * 2;
    const h = size.h + padY * 2;
    const hw = w * 0.5;
    const hh = h * 0.5;

    const dot = {
      x: centroid.cx + (cfg.dotDx ?? 0),
      y: centroid.cy + (cfg.dotDy ?? 0),
    };
    const elbow = {
      x: dot.x + hLen * ux1,
      y: dot.y + hLen * uy1,
    };

    const { x: cx, y: cy } = calculateLabelPosition(cfg, elbow, ux2, uy2, hw, hh, vLen);
    const clamped = clampToView(cx, cy, w + 20, h + 16);

    nodes[i] = {
      key: centroid.key,
      lines,
      w,
      h,
      x: clamped.x,
      y: clamped.y,
      elbow,
      dot,
    };
  }

  return nodes;
}

/**
 * Renders annotation elements (dots and leader lines)
 */
function renderAnnotations(
  d3: typeof import("d3"),
  annLayer: D3Selection<SVGGElement>,
  nodes: LabelNode[],
  leaderColor: string,
  labelConfigMap: Partial<Record<string, LabelCfg>>
): D3Selection<SVGGElement, LabelNode> {
  const ann = annLayer
    .selectAll<SVGGElement, LabelNode>("g.ann")
    .data(nodes, (d: LabelNode) => d.key)
    .join("g")
    .attr("class", "ann");

  ann
    .selectAll<SVGPathElement, LabelNode>("path.leader")
    .data((d) => [d])
    .join("path")
    .attr("class", "leader")
    .attr("fill", "none")
    .attr("stroke", leaderColor)
    .attr("style", `stroke:${leaderColor}`)
    .attr("stroke-dasharray", "6 6")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 1.5)
    .attr("d", function (this: SVGPathElement, d: LabelNode) {
      const vx = d.x - d.elbow.x;
      const vy = d.y - d.elbow.y;
      const len = Math.hypot(vx, vy) || 1;
      const ux = vx / len;
      const uy = vy / len;

      const cfg: LabelCfg = labelConfigMap[d.key] || {};
      let borderPoint: { x: number; y: number };

      if (cfg.side) {
        borderPoint = borderPointForSide({ x: d.x, y: d.y }, { w: d.w, h: d.h }, cfg.side);
      } else {
        const hw = d.w * 0.5;
        const hh = d.h * 0.5;
        const tEdge = distanceToRectEdgeAlongDir(hw, hh, ux, uy);
        borderPoint = { x: d.x - ux * tEdge, y: d.y - uy * tEdge };
      }

      return `M${d.dot.x},${d.dot.y} L${d.elbow.x},${d.elbow.y} L${borderPoint.x},${borderPoint.y}`;
    });

  ann
    .selectAll<SVGCircleElement, LabelNode>("circle")
    .data((d) => [d])
    .join("circle")
    .attr("cx", (d) => d.dot.x)
    .attr("cy", (d) => d.dot.y)
    .attr("r", 3)
    .attr("fill", "#D85050")
    .attr("stroke", "#FFF")
    .attr("stroke-width", 1.5)
    .raise();

  return ann as any;
}

/**
 * Renders labels using React components
 */
function renderLabels(
  d3: typeof import("d3"),
  ann: D3Selection<SVGGElement, LabelNode>,
  data: RegionDatum[],
  regionSel: D3Selection<SVGPathElement, RegionDatum>,
  config: StyleConfig,
  onClick: (key: string) => void,
  labelRender?: (regionData: RegionDatum, labelNode: LabelNode) => React.ReactNode
): {
  cleanup: () => void;
  labelGroupMap: Map<string, D3Selection<SVGGElement, LabelNode>>;
} {
  const dataMap = new Map<string, RegionDatum>();
  const rootMap = new Map<string, Root>();
  const regionPathMap = new Map<string, D3Selection<SVGPathElement, RegionDatum>>();
  const labelGroupMap = new Map<string, D3Selection<SVGGElement, LabelNode>>();
  const { activeKey } = config;

  for (const region of data) {
    dataMap.set(region.key, region);
  }

  regionSel.each(function (this: SVGPathElement, d: RegionDatum) {
    regionPathMap.set(d.key, d3.select(this) as any);
  });

  const lab = ann
    .selectAll<SVGGElement, LabelNode>("g.label")
    .data((d) => [d])
    .join("g")
    .attr("class", (d: LabelNode) => d.key === activeKey ? "label map-label-active" : "label")
    .on("click", (_e: MouseEvent, d: LabelNode) => onClick(d.key))

  lab.each(function (this: SVGGElement, d: LabelNode) {
    const g = d3.select(this);
    labelGroupMap.set(d.key, g as any);

    const regionData = dataMap.get(d.key);
    if (!regionData) return;

    let foreignObj = g.select<SVGForeignObjectElement>("foreignObject");
    if (foreignObj.empty()) {
      foreignObj = g
        .append("foreignObject")
        .attr("x", d.x - 5)
        .attr("y", d.y - d.h * 0.5)
        .attr("width", d.w)
        .attr("height", d.h);
    }

    const container = foreignObj.node();
    if (!container) return;

    let root = rootMap.get(d.key);
    if (!root) {
      const div = document.createElement("div");
      div.style.width = "100%";
      div.style.height = "100%";
      container.appendChild(div);
      root = createRoot(div);
      rootMap.set(d.key, root);
    }

    root.render(
      React.createElement(LabelRenderer, {
        regionData,
        labelNode: d,
        customRender: labelRender,
        onDimensionsChange: (width, height) => {
          foreignObj.attr("width", width).attr("height", height);
        },
      })
    );
  });

  return {
    cleanup: () => {
      rootMap.forEach((root) => root.unmount());
      rootMap.clear();
    },
    labelGroupMap,
  };
}

export function drawMap({
  d3,
  svg,
  rootG,
  data,
  activeKey,
  leaderColor,
  colors,
  stroke,
  onClick,
  labelConfig: customLabelConfig,
  labelRender,
  showLabels = true,
  getPathStyle,
}: DrawMapArgs): () => void {
  const root = d3.select<SVGGElement, unknown>(rootG);
  const svgSel = d3.select<SVGSVGElement, unknown>(svg);

  const regionLayer = root.append("g").attr("class", "regions");
  const annLayer = root.append("g").attr("class", "annotations");
  const labelConfigMap = { ...defaultLabelConfig, ...customLabelConfig };

  const styleConfig: StyleConfig = {
    colors,
    stroke,
    activeKey,
    getPathStyle,
  };


  const regionSel = renderRegions(d3, regionLayer, data, styleConfig, onClick,);

  let labelCleanup: (() => void) | undefined;

  if (showLabels) {
    const nodes = calculateLabelNodes(svgSel, regionSel, labelConfigMap);
    const ann = renderAnnotations(d3, annLayer, nodes, leaderColor, labelConfigMap);
    const labelResult = renderLabels(d3, ann, data, regionSel, styleConfig, onClick, labelRender);
    labelCleanup = labelResult.cleanup;
  }

  return () => {
    regionLayer.remove();
    annLayer.remove();
    labelCleanup?.();
  };
}
