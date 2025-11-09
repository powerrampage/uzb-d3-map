import React from "react";

export type Side = "right" | "left" | "top" | "bottom";

/**
 * Supported locale codes for region names
 */
export type Locale = "uz-cyrl" | "uz-latn" | "ru" | "en";

/**
 * Region data structure
 */
export interface RegionDatum {
  /** Unique identifier for the region */
  key: string;
  /** SVG path data for the region */
  d: string;
  /** Region name (will be translated based on locale) */
  name?: string;
  /** Additional custom properties */
  [key: string]: any;
}

export interface LabelNode {
  key: string;
  lines: string[];
  w: number;
  h: number;
  x: number;
  y: number;
  elbow: { x: number; y: number };
  dot: { x: number; y: number };
}

export interface LabelCfg {
  side?: Side;
  tiltDeg?: number;
  angleDeg?: number;
  turnDeg?: number;
  h?: number;
  v?: number;
  dotDx?: number;
  dotDy?: number;
}

/**
 * Color scheme configuration for map regions
 */
export interface ColorScheme {
  /** Default fill color for regions */
  default?: string;
  /** Fill color when region is hovered */
  hover?: string;
  /** Fill color when region is active/selected */
  active?: string;
}

/**
 * Stroke configuration for region borders
 */
export interface StrokeConfig {
  /** Stroke/border color for regions */
  color?: string;
  /** Stroke width for regions */
  width?: number;
}

/**
 * Region styling configuration
 */
export interface RegionStyle {
  /** Color scheme for region fills */
  colors?: ColorScheme;
  /** Stroke configuration for region borders */
  stroke?: StrokeConfig;
}

/**
 * Event handler for region interactions
 */
export type RegionEventHandler = (regionKey: string, regionData: RegionDatum) => void;

/**
 * Comprehensive props for the Map component
 */
export interface MapProps {
  /** Array of region data. If not provided, uses default data */
  data?: RegionDatum[];
  /** Width of the map container (default: "100%") */
  width?: number | string;
  /** Height of the map container (default: "100%") */
  height?: number | string;
  /** SVG viewBox string (default: from constants) */
  viewBox?: string;
  /** Color scheme for region fills */
  colors?: ColorScheme;
  /** Stroke configuration for region borders */
  stroke?: StrokeConfig;
  /** Leader line color (default: from constants) */
  leaderColor?: string;
  /** Locale for region names (default: "uz-latn") */
  locale?: Locale;
  /** Click handler for regions */
  onRegionClick?: RegionEventHandler;
  /** Custom render function for labels. Receives region data and label node info */
  labelRender?: (data: RegionDatum, node: LabelNode) => React.ReactNode;
  /** Per-region label positioning configuration */
  labelConfig?: Partial<Record<string, LabelCfg>>;
  /** Whether to show labels (default: true) */
  showLabels?: boolean;
  /** Container className */
  className?: string;
  /** Container inline styles */
  style?: React.CSSProperties;
  /** Accessibility label for the map */
  ariaLabel?: string;
  /** Active key */
  activeKey?: string | null;
  /** SVG props */
  svgProps?: React.SVGProps<SVGSVGElement>;
  /** Function to dynamically style each region path. Receives region data and returns SVG path attributes. */
  getPathStyle?: (data: RegionDatum) => Partial<React.SVGProps<SVGPathElement>>;
}

export interface DrawMapArgs {
  d3: typeof import("d3");
  svg: SVGSVGElement;
  rootG: SVGGElement;
  data: RegionDatum[];
  activeKey: string | null;
  leaderColor: string;
  colors: Required<ColorScheme>;
  stroke: Required<StrokeConfig>;
  onClick: (k: string) => void;
  labelConfig?: Partial<Record<string, LabelCfg>>;
  labelRender?: (data: RegionDatum, node: LabelNode) => React.ReactNode;
  showLabels?: boolean;
  getPathStyle?: (data: RegionDatum) => Partial<React.SVGProps<SVGPathElement>>;
}
