document.addEventListener('DOMContentLoaded', function() {


    const aliases = {
        "Geisteswissenschaften": "Geistesw.",
        "Sport": "Sport",
        "Rechts-, Wirtschafts- und Sozialwissenschaften": "Recht/Wirt/Soz.",
        "Mathematik, Naturwissenschaften": "Mathe/Naturw.",
        "Humanmedizin/Gesundheitswissenschaften": "Med/Gesundh.",
        "Agrar-, Forst- u.Ernährungswiss., Veterinärmedizin": "Agrar/Ern/Vet.",
        "Ingenieurwissenschaften": "Ingenieurw.",
        "Kunst, Kunstwissenschaft": "Kunstw."
    };



    d3.json("data/map/first_level_data.json").then(function(data) {
        const width = 700;
        const height = width;
        const innerRadius = 180;
        const outerRadius = Math.min(width, height) / 2;

        const svg = d3.select(".chart-container")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);


        const series = d3.stack().keys(d3.union(data.map(d => d.Geschlecht)))
        .value(([, D], key) => D.get(key).Anzahl)
            (d3.index(data, d => aliases[d.Fächergruppe], d => d.Geschlecht));


        const x = d3.scaleBand()
            .domain(data.map(d => aliases[d.Fächergruppe]))
            .range([0, 2 * Math.PI])
            .align(0);
            
        const y = d3.scaleRadial()
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
            .range([innerRadius, outerRadius-30]);


        const z = d3.scaleOrdinal()
            .domain(["männlich", "weiblich"])
            .range([" #b03a2e", " #1e8449"]);


        const arc = d3.arc()
            .innerRadius(d => y(d[0]))
            .outerRadius(d => y(d[1]))
            .startAngle(d => x(d.data[0]))
            .endAngle(d => x(d.data[0]) + x.bandwidth())
            .padAngle(1.5 / innerRadius)
            .padRadius(innerRadius);

        // Format the value in the tooltip
        const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("de-DE")

        // A group for each series, and a bar for each element in the series
        svg.append("g")
            .selectAll()
            .data(series)
            .join("g")
            .attr("fill", d => z(d.key))
            .selectAll("path")
            .data(D => D.map(d => (d.key = D.key, d)))
            .join("path")
            .attr("d", arc).on("click", function(event, d) {
                console.log(d.data[0]);
                const newWindow = window.open("http://localhost:8000/VisualizationForDH/second_level.html", '_blanc'); // Open link in a new tab
                const interactWithNewPage = () => {
                    if (newWindow.document && newWindow.document.readyState === 'complete') {
                    // Clear the interval once the document is fully loaded
                    clearInterval(checkReadyState);
                    var inputElement;
                        
                    // Select the correct element to click
                    switch(d.data[0]){
                        case "Geistesw.":
                            inputElement = newWindow.document.querySelector('.legend-geist-prof');
                            break;
                        case "Recht/Wirt/Soz.": 
                            inputElement = newWindow.document.querySelector('.legend-rws-prof');
                            break;
                        case "Mathe/Naturw.": 
                            inputElement = newWindow.document.querySelector('.legend-math-prof');
                            break;
                        case "Med/Gesundh.": 
                            inputElement = newWindow.document.querySelector('.legend-hum-prof');
                            break;
                        case "Agrar/Ern/Vet.": 
                            inputElement = newWindow.document.querySelector('.legend-afe-prof');
                            break;
                        case "Ingenieurw.": 
                            inputElement = newWindow.document.querySelector('.legend-ing-prof');
                            break;
                        case "Kunstw.": 
                            inputElement = newWindow.document.querySelector('.legend-kunst-prof');
                            break;
                    }
                    if (inputElement) {
                        inputElement.click();
                    } else {
                        console.error('Input element not found');
                    }
                    }
                };
                        // set an interval to check the ready state of the new window's document
                    const checkReadyState = setInterval(interactWithNewPage, 100);
            }).on("mouseover", function() {
                d3.select(this).classed("clickable", true);
            }).on("mouseout", function() {
                d3.select(this).classed("clickable", false);
            })
            .append("title")
            .text(d => `${d.data[0]} ${d.key}\n${formatValue(d.data[1].get(d.key).Anzahl)}`);

        // x axis
        svg.append("g")
            .attr("text-anchor", "middle")
            .selectAll()
            .data(x.domain())
            .join("g")
            .attr("transform", d => `
                rotate(${((x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
                translate(${innerRadius},0)
            `)
            .call(g => g.append("line")
                .attr("x2", -5)
                .attr("stroke", "#000"))
            .call(g => g.append("text")
                .attr("transform", d => (x(d) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                    ? "rotate(90)translate(0,16)"
                    : "rotate(-90)translate(0,-9)")
                .text(d => d));


        //y-axis
        var yAxis = svg.append("g")
            .attr("text-anchor", "middle")
            .call(g => g.append("text")
                .attr("y", d => -y(y.ticks(5).pop()))
                .attr("dy", "-1em")
                .text("Anzahl"))
            .call(g => g.selectAll("g")
                .data(y.ticks(5).slice(1))
                .join("g")
                .attr("fill", "none")
                .call(g => g.append("circle")
                    .attr("stroke", "#000")
                    .attr("stroke-opacity", 0.5)
                    .attr("r", y))
                .call(g => g.append("text")
                    .attr("y", d => -y(d))
                    .attr("dy", "0.35em")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 3)
                    .text(y.tickFormat(5, "s"))
                .clone(true)
                    .attr("fill", "#000")
                    .attr("stroke", "none")));

        // color legend
        svg.append("g")
            .selectAll()
            .data(z.domain())
            .join("g")
            .attr("transform", (d, i, nodes) => `translate(-40,${(nodes.length / 2 - i - 1) * 20})`)
            .call(g => g.append("rect")
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", z))
            .call(g => g.append("text")
                .attr("x", 24)
                .attr("y", 9)
                .attr("dy", "0.35em")
                .text(d => d));

        //button that switchen between absolute and percent values
        let isAnzahl = true;
        d3.select('.chart-container').append('button')
            .text('Anzahl/Prozent')
            .on('click', function() {
            isAnzahl = !isAnzahl;

            const newData = d3.stack().keys(d3.union(data.map(d => d.Geschlecht)))
                .value(([, D], key) => isAnzahl ? D.get(key).Anzahl : D.get(key).Prozent)
            (d3.index(data, d => aliases[d.Fächergruppe], d => d.Geschlecht));
            

            // Update y-scale domain based on the selected value
            y.domain([0, d3.max(newData, d => d3.max(d, d => d[1]))]);

            // Flatten newData so that stack items can be accessed directly 
            const flattenedData = newData.reduce((acc, stack) => acc.concat(stack.map(d => {
                return { ...d, key: stack.key };
            })), []);

            // Bind new data to paths and transition
            svg.selectAll("path")
                .data(flattenedData)
                .transition()
                .duration(750)
                .attrTween('d', function(a) {
                    const i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return t => arc(i(t));
                }).select("title")
                .text(d => `${d.data[0]} ${d.key}\n${formatValue(isAnzahl ? d.data[1].get(d.key).Anzahl : d.data[1].get(d.key).Prozent)}`);

        
            //clear scale
            yAxis.selectAll("text").remove();
            yAxis.selectAll("circle").remove();

            //append adjusted scale
            yAxis = svg.append("g")
            .attr("text-anchor", "middle")
            .call(g => g.append("text")
                .attr("y", d => -y(y.ticks(5).pop()))
                .attr("dy", "-1em")
                .text(isAnzahl ? "Anzahl" : "Prozent"))
            .call(g => g.selectAll("g")
                .data(y.ticks(5).slice(1))
                .join("g")
                .attr("fill", "none")
                .call(g => g.append("circle")
                    .attr("stroke", "#000")
                    .attr("stroke-opacity", 0.5)
                    .attr("r", y))
                .call(g => g.append("text")
                    .attr("y", d => -y(d))
                    .attr("dy", "0.35em")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 3)
                    .text(y.tickFormat(5, "s"))
                .clone(true)
                    .attr("fill", "#000")
                    .attr("stroke", "none")));
            });

        // Store the initial state for each path element
        svg.selectAll("g > path").each(function(d) { this._current = d; });})
});
