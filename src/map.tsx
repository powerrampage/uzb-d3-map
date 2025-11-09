import * as d3 from "d3";
import React from "react";
import {
  DEFAULT_LEADER_COLOR,
  DEFAULT_ACTIVE_COLOR,
  DEFAULT_FILL_COLOR,
  DEFAULT_HOVER_COLOR,
  DEFAULT_STROKE_COLOR,
  VIEWBOX,
} from "./constants";
import { getRegionName } from "./locales";
import regionPaths from "./region-paths.json";
import type { ColorScheme, MapProps, RegionDatum, StrokeConfig } from "./types";
import { drawMap } from "./utils/draw-map";
import "./map.css";

/**
 * MapSvgD3 - A flexible, customizable SVG map component built with D3
 * 
 * @example
 * ```tsx
 * <MapSvgD3
 *   locale="en"
 *   style={{
 *     colors: {
 *       default: "#b3c3ee",
 *       hover: "#A0D57A",
 *       active: "#325ECD"
 *     },
 *     stroke: {
 *       color: "#FFFFFF",
 *       width: 2
 *     }
 *   }}
 *   labelRender={(data, node) => (
 *     <div>
 *       <strong>{data.name}</strong>
 *       {data.value && <div>{data.value}</div>}
 *     </div>
 *   )}
 *   onRegionClick={(key, data) => console.log(key, data)}
 * />
 * ```
 */
const MapSvgD3: React.FC<MapProps> = ({
  data: customData,
  width = "100%",
  height = "100%",
  viewBox = VIEWBOX,
  colors: customColors,
  stroke: customStroke,
  leaderColor = DEFAULT_LEADER_COLOR,
  locale = "uz-cyrl",
  onRegionClick,
  labelRender,
  labelConfig: customLabelConfig,
  showLabels = true,
  className,
  style,
  activeKey = null,
  svgProps,
  getPathStyle,
}) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const gRef = React.useRef<SVGGElement | null>(null);

  const colors: Required<ColorScheme> = React.useMemo(
    () => ({
      default: customColors?.default ?? DEFAULT_FILL_COLOR,
      hover: customColors?.hover ?? DEFAULT_HOVER_COLOR,
      active: customColors?.active ?? DEFAULT_ACTIVE_COLOR,
    }),
    [customColors]
  );

  const stroke: Required<StrokeConfig> = React.useMemo(
    () => ({
      color: customStroke?.color ?? DEFAULT_STROKE_COLOR,
      width: customStroke?.width ?? 2,
    }),
    [customStroke]
  );

  const data: RegionDatum[] = React.useMemo(() => {
    if (customData) {
      return customData.map((region) => ({
        ...region,
        name: region.name || getRegionName(region.key, locale),
      }));
    }

    return Object.entries(regionPaths).map(([key, d]) => {
      const translatedName = getRegionName(key, locale);
      return {
        key,
        d: String(d),
        name: translatedName,
      };
    });
  }, [customData, locale]);

  const handleClick = React.useCallback(
    (key: string) => {
      const regionData = data.find((d) => d.key === key);
      if (regionData) {
        onRegionClick?.(key, regionData);
      }
    },
    [data, onRegionClick]
  );

  const shouldShowLabels = showLabels;

  React.useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const cleanup = drawMap({
      d3,
      svg: svgRef.current,
      rootG: gRef.current,
      data,
      activeKey,
      leaderColor,
      colors,
      stroke,
      onClick: handleClick,
      labelConfig: customLabelConfig,
      labelRender,
      showLabels: shouldShowLabels,
      getPathStyle,
    });
    return cleanup;
  }, [
    data,
    activeKey,
    leaderColor,
    colors,
    stroke,
    handleClick,
    customLabelConfig,
    labelRender,
    shouldShowLabels,
    getPathStyle,
  ]);

  const finalContainerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: typeof height === "number" ? `${height}px` : height === "100%" ? "520px" : height,
    ...style,
  };

  return (
    <div className={`map-container ${className || ""}`} style={finalContainerStyle}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        preserveAspectRatio="xMidYMid meet"
        className="map-svg"
        {...svgProps}
      >
        <g ref={gRef} />
      </svg>
    </div>
  );
};

export default React.memo(MapSvgD3);

