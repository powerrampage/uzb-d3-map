import React from "react";
import ReactDOMClient from "react-dom/client";

/**
 * Measures the dimensions of a React element by rendering it in a hidden container
 * Uses React 18+ createRoot API
 * @param element - The React element to measure
 * @returns Promise resolving to width and height of the element
 */
export function measureElementDimensions(
  element: React.ReactElement
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    // Create a temporary container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.visibility = "hidden";
    container.style.pointerEvents = "none";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.width = "auto";
    container.style.height = "auto";
    container.style.overflow = "visible";
    container.style.whiteSpace = "nowrap";
    document.body.appendChild(container);

    // Create a root and render the element
    const root = ReactDOMClient.createRoot(container);
    root.render(element);

    // Use requestAnimationFrame to ensure rendering is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const width = Math.ceil(rect.width || container.offsetWidth || 0);
        const height = Math.ceil(rect.height || container.offsetHeight || 0);

        // Cleanup
        root.unmount();
        document.body.removeChild(container);

        resolve({ width, height });
      });
    });
  });
}

/**
 * Hook to measure React element dimensions dynamically
 * @param element - The React element to measure
 * @returns Object with width, height, and loading state
 */
export function useElementDimensions(element: React.ReactElement | null) {
  const [dimensions, setDimensions] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isMeasuring, setIsMeasuring] = React.useState(false);

  React.useEffect(() => {
    if (!element) {
      setDimensions(null);
      return;
    }

    setIsMeasuring(true);
    measureElementDimensions(element)
      .then((dims) => {
        setDimensions(dims);
        setIsMeasuring(false);
      })
      .catch(() => {
        setIsMeasuring(false);
      });
  }, [element]);

  return { dimensions, isMeasuring };
}

/**
 * Synchronously measures dimensions using a ref (for use in React components)
 * @param ref - React ref to the DOM element
 * @returns Width and height of the element, or null if not available
 */
export function measureRefDimensions(
  ref: React.RefObject<HTMLElement>
): { width: number; height: number } | null {
  if (!ref.current) return null;

  const rect = ref.current.getBoundingClientRect();
  return {
    width: Math.ceil(rect.width || ref.current.offsetWidth || 0),
    height: Math.ceil(rect.height || ref.current.offsetHeight || 0),
  };
}

