const bubbleChartWidth = 600;
const bubbleChartHeight = 400;

const bubbleSvg = d3.select('#bubble-chart-employment')
    .append('svg')
    .attr('width', bubbleChartWidth)
    .attr('height', bubbleChartHeight);

const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
d3.csv("data.csv").then(data => {
    console.log(data); 

    data.forEach(d => {
        d['Employment 2023'] = +d['Employment 2023'].replace(/,/g, '');
        d['Employment Change'] = +d['Employment Change'];
        d['Employment Percent Change'] = +d['Employment Percent Change'];
        d['Occupational Openings'] = +d['Occupational Openings'];
        
        if (d['Median Annual Wage']) {
            d['Median Annual Wage'] = +d['Median Annual Wage'].toString().replace(/,/g, '');
        } else {
            console.warn(`Missing Median Annual Wage for: ${d['Occupation Title']}`);
            d['Median Annual Wage'] = 0;
        }
        console.log(`Parsed Median Annual Wage for ${d['Occupation Title']}: ${d['Median Annual Wage']}`);
    });

    const bubbleXScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d['Employment 2023'])])
        .range([50, bubbleChartWidth - 50]);

    const bubbleYScale = d3.scaleLinear()
        .domain([d3.min(data, d => d['Employment Percent Change']), d3.max(data, d => d['Employment Percent Change'])])
        .range([bubbleChartHeight - 50, 50]);

    const bubbleSizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d['Occupational Openings'])])
        .range([0, 50]); 

    const colorScale = d3.scaleSequential(d3.interpolateCool)
        .domain([0, d3.max(data, d => d['Median Annual Wage'])]);

    bubbleSvg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => bubbleXScale(d['Employment 2023']))
        .attr('cy', d => bubbleYScale(d['Employment Percent Change']))
        .attr('r', d => bubbleSizeScale(d['Occupational Openings']))
        .attr('class', 'bubble')
        .attr('fill', d => colorScale(d['Median Annual Wage']))
        .on('mouseover', function(event, d) {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`<strong>${d['Occupation Title']}</strong><br>
                          Employment: ${d['Employment 2023']}<br>
                          Growth: ${d['Employment Percent Change']}%<br>
                          Openings: ${d['Occupational Openings']}<br>
                          Median Wage: $${d['Median Annual Wage'].toLocaleString()}`)
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function(d) {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

}).catch(error => {
    console.error('Error loading the CSV file:', error);
});
