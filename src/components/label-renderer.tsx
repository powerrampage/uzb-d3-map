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

    const timeoutId = setTimeout(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const padX = 10;
        const padY = 8;
        const newWidth = Math.ceil(rect.width) + padX * 2;
        const newHeight = Math.ceil(rect.height) + padY * 2;

        if (onDimensionsChange) {
          onDimensionsChange(newWidth, newHeight);
        }
      } else {
        measureElementDimensions(labelContent as React.ReactElement)
          .then((dims) => {
            const padX = 10;
            const padY = 8;
            const newWidth = dims.width + padX * 2;
            const newHeight = dims.height + padY * 2;

            if (onDimensionsChange) {
              onDimensionsChange(newWidth, newHeight);
            }
          })
          .catch((error) => {
            console.warn("Failed to measure label dimensions:", error);
          });
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [labelContent, onDimensionsChange]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {labelContent}
    </div>
  );
};

