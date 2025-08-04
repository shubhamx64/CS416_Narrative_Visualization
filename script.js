let sceneIndex = 0;
const scenes = [scene1, scene2, scene3];

d3.csv("data/global_temp.csv", d3.autoType).then(data => {
  const filtered = data.filter(d => d.Source === "GISTEMP");

  renderScene(filtered);
  d3.select("#next").on("click", () => {
    sceneIndex = Math.min(scenes.length - 1, sceneIndex + 1);
    renderScene(filtered);
  });
  d3.select("#prev").on("click", () => {
    sceneIndex = Math.max(0, sceneIndex - 1);
    renderScene(filtered);
  });
});

function renderScene(data) {
  d3.select("#visualization").html("");  // Clear SVG or DOM elements
  scenes[sceneIndex](data);
}

function scene1(data) {
  // Scene 1: Global overview line chart
  const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", 800)
    .attr("height", 500);

  const margin = {top: 20, right: 40, bottom: 40, left: 60};
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Mean)).nice()
    .range([height, 0]);

  const line = d3.line()
    .x(d => x(d.Year))
    .y(d => y(d.Mean));

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "tomato")
    .attr("stroke-width", 2)
    .attr("d", line);

  g.append("g").call(d3.axisLeft(y));
  g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));

  g.append("text")
    .attr("x", width / 2)
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .text("Global Temperature Anomaly (°C)");
}

function scene2(data) {
  // Scene 2: Zoomed-in chart (1980+)
  const filtered = data.filter(d => d.Year >= 1980);
  scene1(filtered); // Reuse logic
}

function scene3(data) {
  // Scene 3: Add annotations
  scene2(data);

  // Overlay annotations manually or using d3-annotation (to add next)
}
