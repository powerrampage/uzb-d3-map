import type * as d3 from "d3";

export function measureLines(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  lines: string[],
  fontSize = 12,
  fontWeight = 700
) {
  const tmp = svg
    .append("text")
    .attr("x", -9999)
    .attr("y", -9999)
    .attr("font-size", fontSize)
    .attr("font-weight", fontWeight)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle");
  lines.forEach((ln, i) =>
    tmp
      .append("tspan")
      .text(ln)
      .attr("x", -9999)
      .attr("dy", i === 0 ? 0 : 16)
  );
  const b = (tmp.node() as SVGTextElement).getBBox();
  tmp.remove();
  return { w: b.width, h: b.height };
}
