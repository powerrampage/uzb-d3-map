import React from "react";
import type { RegionDatum, LabelNode } from "../types";
import { measureElementDimensions } from "../utils/label-dimensions";
import "../map.css";

export interface LabelRendererProps {
  regionData: RegionDatum;
  labelNode: LabelNode;
  customRender?: (regionData: RegionDatum, labelNode: LabelNode) => React.ReactNode;
  onDimensionsChange?: (width: number, height: number) => void;
}

/**
 * Default label renderer - renders only the region name
 * Value is not shown by default as it comes dynamically from API
 */
function DefaultLabel({ regionData }: { regionData: RegionDatum }) {
  const name = regionData.name || "";

  return (
    <div className="map-label">
      {name && <div className="map-label-name">{name}</div>}
    </div>
  );
}

/**
 * LabelRenderer component that handles React element rendering inside foreignObject
 * with dynamic dimension calculation. This component is rendered inside a foreignObject
 * that's already created by D3, so it just renders the content.
 */
export const LabelRenderer: React.FC<LabelRendererProps> = ({
  regionData,
  labelNode,
  customRender,
  onDimensionsChange,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const labelContent = React.useMemo(() => {
    if (customRender) {
      return customRender(regionData, labelNode);
    }
    return <DefaultLabel regionData={regionData} />;
  }, [customRender, regionData, labelNode]);

  React.useEffect(() => {
    if (!labelContent || !containerRef.current) return;

    const measureContent = () => {
      const container = containerRef.current;
      if (!container) return;

      const originalWidth = container.style.width;
      const originalHeight = container.style.height;
      container.style.width = "max-content";
      container.style.height = "auto";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!container) return;

          const rect = container.getBoundingClientRect();
          const scrollWidth = container.scrollWidth;
          const scrollHeight = container.scrollHeight;

          const padX = 10;
          const padY = 8;
          const newWidth = Math.ceil(Math.max(rect.width, scrollWidth)) + padX * 2;
          const newHeight = Math.ceil(Math.max(rect.height, scrollHeight)) + padY * 2;

          container.style.width = originalWidth;
          container.style.height = originalHeight;

          if (onDimensionsChange && (newWidth > 0 && newHeight > 0)) {
            onDimensionsChange(newWidth, newHeight);
          }
        });
      });
    };

    const timeoutId = setTimeout(measureContent, 0);
    const delayedTimeoutId = setTimeout(measureContent, 100);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(delayedTimeoutId);
    };
  }, [labelContent, onDimensionsChange]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "max-content",
        height: "auto",
        display: "inline-block"
      }}
    >
      {labelContent}
    </div>
  );
};

