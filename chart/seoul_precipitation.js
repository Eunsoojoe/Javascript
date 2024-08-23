// load D3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// 서울시 강수량 데이터로 Area Chart 그려보기
const csvPath = '../data/rain_seoul_20150831_20240821.csv'

// load data
const data = d3.csv(csvPath, function(d){
    return {
        date : new Date(d.date),
        // null값 처리
        precipitation : d.precipitation === null || d.precipitation === '' ? 0 : +d.precipitation
    };
}).then(function(data){
    createChart(data)
});

// create Func.
function createChart(data)  {
    // 차트 크기 설정
    const width = 1200;
    const height = 500;
    const margin = {top: 20, right: 30, bottom: 20, left: 40};

    // Declare x-scale
    const x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date))              // scale(min~max)
        .range([margin.left, width - margin.right]);
        // .domain(data.extent(d=>d.date))
        // .range([margin.left, width-margin.right]);

    // Declare y-scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.precipitation)])  // scale(0~max)
        .range([height - margin.bottom, margin.top]);    // 아래에서 위로 y축 범위 설정
        // .domain(data.map(d=>d.precipitation))
        // .range([height-margin.bottom, margin.top]);

    // Create svg container
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x))

    // Add y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))

    // Declare area
    const area = d3.area()
                    .x(d=>x(d.date))
                    .y0(y(0))                   // 아래쪽 y좌표
                    .y1(d=>y(d.precipitation)); // 위쪽 y좌표

    // Add area path
    svg.append("path")
        .datum(data)
        .attr("fill", "steelblue")
        .attr("d", area);
}

