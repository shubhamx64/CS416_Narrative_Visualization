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
  d3.select("#visualization").html(""); // Clear existing scene
  scenes[sceneIndex](data);
}

function scene1(data) {
  drawChart(data, {
    title: "Scene 1 – Global Temperature Anomalies (1900–2020)",
    subtitle: "Overall warming trend over the 20th century and beyond",
    annotations: []
  });
}

function scene2(data) {
  const filtered = data.filter(d => d.Year >= 1980);
  drawChart(filtered, {
    title: "Scene 2 – Rapid Warming (1980–2020)",
    subtitle: "Zoomed in view shows recent temperature spikes",
    annotations: []
  });
}

function scene3(data) {
  const filtered = data.filter(d => d.Year >= 1980);

  drawChart(filtered, {
    title: "Scene 3 – Policy Milestones and Warming",
    subtitle: "Highlighting major climate events and agreements",
    annotations: [
      {
        note: { title: "1988", label: "Hansen Testimony to US Congress" },
        data: { Year: 1988, Mean: 0.4 },
        dx: 50, dy: -60
      },
      {
        note: { title: "1997", label: "Kyoto Protocol Signed" },
        data: { Year: 1997, Mean: 0.6 },
        dx: -60, dy: -40
      },
      {
        note: { title: "2015", label: "Paris Agreement Adopted" },
        data: { Year: 2015, Mean: 1.0 },
        dx: 60, dy: -70
      }
    ],
    withTooltip: true
  });
}

function drawChart(data, config) {
  const margin = { top: 60, right: 40, bottom: 40, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Mean)).nice()
    .range([height, 0]);

  const line = d3.line()
    .x(d => x(d.Year))
    .y(d => y(d.Mean));

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "tomato")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .text(config.title);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -5)
    .attr("class", "subtitle")
    .attr("text-anchor", "middle")
    .text(config.subtitle);

  // Tooltip
  if (config.withTooltip) {
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "6px")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("pointer-events", "none")
      .style("opacity", 0);

    svg.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => x(d.Year))
      .attr("cy", d => y(d.Mean))
      .attr("r", 3)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`Year: ${d.Year}<br>Temp Anomaly: ${d.Mean.toFixed(2)}°C`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  }

  // Annotations
  if (config.annotations?.length) {
    const annotations = config.annotations.map(d => ({
      note: d.note,
      x: x(d.data.Year),
      y: y(d.data.Mean),
      dx: d.dx,
      dy: d.dy,
      subject: { radius: 4, radiusPadding: 2 }
    }));

    const makeAnnotations = d3.annotation()
      .annotations(annotations);

    svg.append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations);
  }
}
