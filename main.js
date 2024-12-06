// Set up dimensions
const width = 800;
const height = 500;

// Create SVG container
const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");

// Define projection and path
const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(1000);
const path = d3.geoPath().projection(projection);

// Define color scale
const colorScale = d3
  .scaleSequential()
  .domain([0, 10000]) // Adjust domain based on your data
  .interpolator(d3.interpolateBlues);

// Load the CSV file and the US map data
Promise.all([
  d3.csv("data/chloropleth.csv"), // Replace with your data file
  d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
]).then(([jobData, us]) => {
  // Preprocess job data
  jobData.forEach((d) => {
    d.total_jobs = +d.total_jobs || 0; // Ensure total_jobs is numeric
    d.normalized_salary = d.normalized_salary || "N/A"; // Handle missing salaries
  });

  const states = topojson.feature(us, us.objects.states).features;

  // Map data to states
  states.forEach((state) => {
    const jobInfo = jobData.find((d) => d.full_state_name === state.properties.name);
    state.properties.total_jobs = jobInfo ? jobInfo.total_jobs : 0;
    state.properties.top_job = jobInfo ? jobInfo.top_job : "N/A";
    state.properties.normalized_salary = jobInfo ? jobInfo.normalized_salary : "N/A";
  });

  // Draw states
  svg
    .selectAll("path")
    .data(states)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => colorScale(d.properties.total_jobs || 0))
    .attr("stroke", "#333")
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`)
        .html(`
          <strong>State:</strong> ${d.properties.name}<br>
          <strong>Total Jobs:</strong> ${d.properties.total_jobs}<br>
          <strong>Top Job:</strong> ${d.properties.top_job}<br>
          <strong>Salary:</strong> $${d.properties.normalized_salary}
        `);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY + 10}px`);
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });
});

// Bubble Chart Code
const bubbleWidth = 600; // Reduced width
const bubbleHeight = 400; // Reduced height
const margin = { top: 20, right: 20, bottom: 40, left: 50 };

// Create SVG container for bubble chart
const bubbleSvg = d3
  .select("#bubble-chart-placeholder")
  .append("svg")
  .attr("width", bubbleWidth)
  .attr("height", bubbleHeight)
  .style("display", "block") // Center horizontally
  .style("margin", "0 auto");

// Define a tooltip for the bubble chart
const bubbleTooltip = d3
  .select("#bubble-chart-placeholder")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background-color", "white")
  .style("border", "1px solid #ccc")
  .style("padding", "10px")
  .style("border-radius", "5px")
  .style("display", "none");

// Load data from CSV
d3.csv("data/bubble.csv").then((data) => {
  // Preprocess data
  data.forEach((d) => {
    d["Employment Percent Change"] = +d["Employment Percent Change"];
    d["Median Annual Wage"] = +d["Median Annual Wage"];
    d["Employment Change"] = +d["Employment Change"];
  });

  // Scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d["Employment Percent Change"]))
    .range([margin.left, bubbleWidth - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d["Median Annual Wage"]))
    .range([bubbleHeight - margin.bottom, margin.top]);

  const sizeScale = d3
    .scaleSqrt()
    .domain([0, d3.max(data, (d) => d["Employment Change"])])
    .range([5, 30]); // Reduced bubble size

  // Color scale based on employment percent change
  const colorScale = d3
    .scaleSequential()
    .domain(d3.extent(data, (d) => d["Employment Percent Change"]))
    .interpolator(d3.interpolateBlues);

  // Axes
  const xAxis = d3.axisBottom(xScale).tickFormat((d) => `${d}%`);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => `$${d / 1000}k`);

  bubbleSvg
    .append("g")
    .attr("transform", `translate(0, ${bubbleHeight - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("x", bubbleWidth / 2)
    .attr("y", 35)
    .text("Employment Percent Change (%)")
    .style("fill", "white");

  bubbleSvg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis)
    .append("text")
    .attr("x", -bubbleHeight / 3)
    .attr("y", -42)
    .attr("transform", "rotate(-90)")
    .text("Median Annual Wage ($)")
    .style("fill", "white");

  // Draw bubbles
  bubbleSvg
  .selectAll("circle")
  .data(data)
  .join("circle")
  .attr("cx", (d) => xScale(d["Employment Percent Change"]))
  .attr("cy", (d) => yScale(d["Median Annual Wage"]))
  .attr("r", (d) => Math.max(0, sizeScale(d["Employment Change"])))
  .attr("fill", (d) => colorScale(d["Employment Percent Change"]))
  .attr("stroke", "#333")
  .attr("opacity", 0.8)
  .on("mouseover", function (event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("r", Math.max(0, sizeScale(d["Employment Change"]) * 1.5)); // Increase bubble size
    bubbleTooltip
      .style("display", "block")
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY + 10}px`)
      .html(`
        <strong>Occupation:</strong> ${d["Occupation Title"]}<br>
        <strong>Percent Change:</strong> ${d["Employment Percent Change"]}%<br>
        <strong>Median Wage:</strong> $${d["Median Annual Wage"]}<br>
        <strong>Employment Change:</strong> ${d["Employment Change"]}
      `);
  })
  .on("mousemove", (event) => {
    bubbleTooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY + 10}px`);
  })
  .on("mouseout", function (event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("r", Math.max(0, sizeScale(d["Employment Change"]))); // Reset bubble size
    bubbleTooltip.style("display", "none");
  });

});

// Dimensions for both charts
const lineWidth = 800;
const lineHeight = 400;
// const margin = { top: 50, right: 30, bottom: 50, left: 60 };

// Function to parse and preprocess data
function preprocessLineData(data) {
  return data.map((d) => ({
    year: d.Year,
    values: Object.entries(d)
      .filter(([key]) => key !== "Year")
      .map(([month, value]) => ({
        month: month,
        value: +value,
      })),
  }));
}


// Multi-Line Chart: Monthly Job Opening Rate (2014–2024)
d3.csv("data/line.csv").then((data) => {
  const parsedData = preprocessLineData(data);

  // Set up scales
  const xScale = d3
    .scalePoint()
    .domain([
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ])
    .range([margin.left, lineWidth - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(parsedData, (d) => d3.max(d.values, (v) => v.value))])
    .range([lineHeight - margin.bottom, margin.top]);

  // Create SVG container
  const svg = d3
    .select("#multi-line-chart")
    .append("svg")
    .attr("width", lineWidth)
    .attr("height", lineHeight);

  // Add axes
  svg
    .append("g")
    .attr("transform", `translate(0, ${lineHeight - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("fill", "white"); // Change X-axis tick label color

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("fill", "white"); // Change Y-axis tick label color

  // Add axis labels
  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", lineWidth / 2)
    .attr("y", lineHeight - 5) // Adjusted for lower position
    .text("Months")
    .style("fill", "white"); // Change X-axis label color

  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`)
    .attr("x", -lineHeight / 2)
    .attr("y", 15)
    .text("Job Opening Rate")
    .style("fill", "white"); // Change Y-axis label color

  // Add a tooltip
  const tooltip = d3
    .select("#multi-line-chart")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("display", "none");

  // Color scale for lines
  const colorScale = d3
    .scaleOrdinal()
    .domain(parsedData.map((d) => d.year))
    .range(d3.schemeCategory10);

  // Container for lines
  const lineGroup = svg.append("g").attr("class", "line-group");

  // Add lines
  parsedData.forEach((yearData) => {
    const line = lineGroup
      .append("path")
      .datum(yearData.values)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", colorScale(yearData.year))
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x((d) => xScale(d.month))
          .y((d) => yScale(d.value))
      )
      .on("mouseover", function (event) {
        d3.selectAll(".line").attr("opacity", 0.3); // Dim other lines
        d3.select(this).attr("opacity", 1).attr("stroke-width", 4); // Highlight hovered line

        // Show tooltip
        tooltip
          .style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .html(`<strong>Year:</strong> ${yearData.year}`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", function () {
        d3.selectAll(".line").attr("opacity", 1); // Reset all lines
        d3.select(this).attr("stroke-width", 2); // Reset hovered line

        tooltip.style("display", "none"); // Hide tooltip
      })
      .on("click", function (event) {
        // Show only clicked line
        d3.selectAll(".line").attr("opacity", 0.1); // Dim all lines
        d3.select(this).attr("opacity", 1).attr("stroke-width", 4); // Highlight clicked line

        // Update tooltip with full data
        tooltip
          .style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .html(`
            <strong>Year:</strong> ${yearData.year}<br>
            <strong>Data:</strong> ${yearData.values
              .map((v) => `${v.month}: ${v.value}`)
              .join(", ")}
          `);
      });
  });

  // Hide tooltip when clicking outside
  svg.on("click", () => {
    d3.selectAll(".line").attr("opacity", 1).attr("stroke-width", 2); // Reset all lines
    tooltip.style("display", "none"); // Hide tooltip
  });
});


// Line Plot 2: Job Opening Rate with Dropdown and Adjusted Y-Scale
d3.csv("data/line.csv").then((data) => {
    const parsedData = preprocessLineData(data);
  
    // Initial year (default selection in dropdown)
    const initialYear = "2024";
  
    // Create scales (adjust yScale dynamically for better trend visibility)
    const xScale = d3
      .scalePoint()
      .domain([
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ])
      .range([margin.left, lineWidth - margin.right]);
  
    // Create SVG container for Line Plot 2
    const svg2 = d3
      .select("#single-line-chart")
      .append("svg")
      .attr("width", lineWidth)
      .attr("height", lineHeight);
  
    // Add axes placeholders
    const xAxis = svg2
      .append("g")
      .attr("transform", `translate(0, ${lineHeight - margin.bottom})`);
  
    const yAxis = svg2.append("g").attr("transform", `translate(${margin.left}, 0)`);

      // Add axis labels
    svg2
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", lineWidth / 2)
    .attr("y", lineHeight - 5) // Adjusted for lower position
    .text("Months")
    .style("fill", "white"); // X-axis label color

    svg2
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", - lineHeight / 2)
    .attr("y", 10) // Adjusted for padding from axis
    .text("Job Opening Rate")
    .style("fill", "white"); // Y-axis label color

  
    // Add dropdown
    const dropdown = d3
      .select("#single-line-chart")
      .insert("select", "svg")
      .attr("id", "year-dropdown");
  
    dropdown
      .selectAll("option")
      .data(parsedData)
      .enter()
      .append("option")
      .attr("value", (d) => d.year)
      .text((d) => d.year);
  
    // Update function for the line chart
    function updateChart(selectedYear) {
      const selectedData = parsedData.find((d) => d.year === selectedYear);
  
      // Adjust yScale dynamically for the selected year
      const yScale = d3
        .scaleLinear()
        .domain([
          d3.min(selectedData.values, (d) => d.value) * 0.9, // Slight padding below the minimum value
          d3.max(selectedData.values, (d) => d.value) * 1.1, // Slight padding above the maximum value
        ])
        .range([lineHeight - margin.bottom, margin.top]);
  
      // Update axes
      xAxis.call(d3.axisBottom(xScale));
      yAxis.call(d3.axisLeft(yScale));
  
      // Remove existing line
      svg2.selectAll("path").remove();
  
      // Add updated line
      svg2
        .append("path")
        .datum(selectedData.values)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr(
          "d",
          d3
            .line()
            .x((d) => xScale(d.month))
            .y((d) => yScale(d.value))
        );
    }
    
  
    // Initial render
    updateChart(initialYear);
  
    // Add event listener for dropdown
    dropdown.on("change", function () {
      const selectedYear = d3.select(this).property("value");
      updateChart(selectedYear);
    });
});

//   Bar chart

const barChartWidth = 800;
const barChartHeight = 400;
const barChartMargin = { top: 50, right: 40, bottom: 50, left: 100 };

// Bar Chart: Top Job Roles by State
d3.csv("data/bar.csv").then((data) => {
  // Parse the data to group by state
  const groupedData = d3.group(data, (d) => d.state);

  // Initial state (default selection in dropdown)
  const initialState = "CA";

  // Set up scales
  const xScale = d3
    .scaleLinear()
    .range([barChartMargin.left, barChartWidth - barChartMargin.right]);

  const yScale = d3
    .scaleBand()
    .range([barChartMargin.top, barChartHeight - barChartMargin.bottom])
    .padding(0.2);

  // Create SVG container
  const svgBar = d3
    .select("#bar-chart")
    .append("svg")
    .attr("width", barChartWidth)
    .attr("height", barChartHeight);

  // Add axes placeholders
  const xAxis = svgBar
    .append("g")
    .attr("transform", `translate(0, ${barChartHeight - barChartMargin.bottom})`);

  const yAxis = svgBar.append("g").attr("transform", `translate(${barChartMargin.left}, 0)`);

  // Dropdown for selecting state
  const dropdown = d3
    .select("#bar-chart")
    .insert("select", "svg")
    .attr("id", "state-dropdown");

  dropdown
    .selectAll("option")
    .data(Array.from(groupedData.keys()))
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d);

  // Function to update the bar chart
  function updateBarChart(selectedState) {
    const stateData = groupedData.get(selectedState);

    // Update scales
    xScale.domain([0, d3.max(stateData, (d) => +d.count)]);
    yScale.domain(stateData.map((d) => d.top_job));

    // Update axes
    xAxis
      .transition()
      .duration(800)
      .call(d3.axisBottom(xScale).ticks(5));
    yAxis
      .transition()
      .duration(800)
      .call(d3.axisLeft(yScale));

    // Bind data to bars
    const bars = svgBar.selectAll(".bar").data(stateData, (d) => d.top_job);

    // Enter new bars
    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", xScale(0))
      .attr("y", (d) => yScale(d.top_job))
      .attr("width", 0) // Start with width 0 for animation
      .attr("height", yScale.bandwidth())
      .attr("fill", "red")
      .transition()
      .duration(800)
      .attr("width", (d) => xScale(+d.count) - xScale(0));

    // Update existing bars
    bars
      .transition()
      .duration(800)
      .attr("y", (d) => yScale(d.top_job))
      .attr("width", (d) => xScale(+d.count) - xScale(0));

    // Remove old bars
    bars.exit().transition().duration(800).attr("width", 0).remove();

    // Add labels for count values
    const labels = svgBar.selectAll(".label").data(stateData, (d) => d.top_job);

    labels
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => xScale(+d.count) + 5)
      .attr("y", (d) => yScale(d.top_job) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("fill", "#fff")
      .style("font-size", "12px")
      .text((d) => d.count)
      .transition()
      .duration(800);

    labels
      .transition()
      .duration(800)
      .attr("x", (d) => xScale(+d.count) + 5)
      .attr("y", (d) => yScale(d.top_job) + yScale.bandwidth() / 2)
      .text((d) => d.count);

    labels.exit().remove();
  }

  // Initial render
  updateBarChart(initialState);

  // Add event listener for dropdown
  dropdown.on("change", function () {
    const selectedState = d3.select(this).property("value");
    updateBarChart(selectedState);
  });
});
