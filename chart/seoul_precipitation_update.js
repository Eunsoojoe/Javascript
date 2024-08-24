// load D3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// set file path
const csvPath = '../data/rain_seoul_20150831_20240821.csv'

// svg setting 
const svg = d3.select("#chart");
const margin = {top: 20, right: 20, bottom: 30, left: 50 };
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.sttr("height") - margin.bottom - margin.top;
const g = svg.append("g").attr("transform", `trasnlate(${margin.left}, ${margin.top})`);

const parseTime = d3.timeParse("%Y-%m-%d");
const x = d3.scaleTime().range([0,width]);
const y = d3.scaleLinear().range([height, 0]);
const area = d3.area()
    .x(d=> x(d.date))
    .y0(height)
    .y1(d=>y(d.precipitation));


// load csv & create chart
d3.csv(csvPath, function(d){
    return {
        date : new Date(d.date),
        precipitation : d.precipitation === null || d.precipitation === '' ? 0 : +d.precipitation
    };
}).then(data => {
    data.forEach(d=>{
        d.date = parseTime(d.date);
        d.precipitation = +d.precipitation;
    });

    function updateChart(timeframe){
        let nestedData;
        if (timeframe === "day"){
            nestedData = d3.group(data, d=>d.date)
        } else if (timeframe === "month"){
            nestedData = d3.group(data, d=>d.date.getFullYear(), d=> d.date.getMonth())
        } else if (timeframe === "year"){
            nestedData = d3.group(data, d=>d.date.getFullYear());
        }

        // 배열화
        const processData = Array.from(nestedData, ([key, values]) => {
            if (timeframe === "day"){
                return { date: key, precipitation: d3.sum(values, d=>d.precipitation) };
            } else {
                const nestedValues = timeframe === "month" ? Array.from(values.values()).flat():Array.from(values.values());

                const dateKey = timeframe === "month" ? new Date(key[0], key[1]) : new Date(key); 

                return { date: dateKey, precipitation: d3.sum(nestedValues, d=>d.precipitation) };
            }
        });

        // 생성한 date 배열 시간순으로 정렬
        precoessData.sort((a,b) => a.date - b.date);

        x.domain(d3.extent(processData, d => d.date));
        y.domain([0, d3.max(processData, d => d.precipitation)]);

        g.selectAll("*").remove();

        g.append("path")
            .datum(processData)
            .attr("fill", "steelblue")
            .attr("d", area);

        g.append("g")
            .attr("class", "axis axis-x")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis-y")
            .call(d3.axisLEft(y));
    }

    updateChart("day")

    // setting event
    d3.select("#day").on("click", () => updateChart("day"));
    d3.select("#month").on("click", () => updateChart("month"));
    d3.select("#year").on("click", () => updateChart("year"));
});

