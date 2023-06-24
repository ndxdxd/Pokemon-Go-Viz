function graphs(){
    let filePath="pokemon.csv";
    load(filePath);
};


let load=function(filePath){
    //preprocess data
    
    d3.csv(filePath).then(function(data){
        data.forEach(d => {
            d['number'] = +d['number'];
            d['attack'] = +d['attack'];
            d['defense'] = +d['defense'];
            d['stamina'] = +d['stamina'];
           
            //getting the weaknesses
            const weakness = d['weakness'];
            let parsedData;
            if (weakness === "N/A") {
            parsedData = null;
            } else {
            const jsonString = weakness.replace(/'/g, '"');
            parsedData = JSON.parse(jsonString);
            }

            const dictionaries = [];
            if (parsedData !== null) {
            for (const key in parsedData) {
                const dictionary = {};
                dictionary[key] = parsedData[key];
                dictionaries.push(dictionary);
            }
            }

            d['weakness'] = dictionaries;
        });
        barGraph(data);
        networkGraph(data);
        mapGraph();//uses the geoData
    });
};

let barGraph = function(data){
   const svgwidth = 1700;
   const svgheight = 1000;
   const padding = 80; 
   const margin = { top: 20, right: 10, bottom: 40, left: 40 };

   const width = svgwidth - margin.left - margin.right;
   const height = svgheight - margin.top - margin.bottom;
   const svg = d3.select("#bar-container").append('svg')
                .attr("width", width + margin.left + margin.right )
                .attr("height", height + margin.top + margin.bottom)
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //we will only be doing pokemon from the kanto region 

    //x axis will be the pokemons, y axis will be the points, the groups would be attack, defense, stamina
    data = data.filter(d => d.region == 'Kanto')

    //sorting the data
    var sortedData = data.sort((a, b) => b.attack - a.attack);
    //getting the pokemons
   
    var pokemonNames = sortedData.map(d => d.pokemon_name)

    var max = d3.max(sortedData, (d) => d.attack)

    var barHeightScale = (height - 2*padding) / max;
    var barWidth = (width - 2*padding) / data.length;
    var barPadding = 0.1*barWidth;
    
    //scales 
    var xScale = d3.scaleBand()
    .domain(pokemonNames)
    .range([padding,width - padding])
    .paddingInner(0.2)
    .paddingOuter(0.1);
    var yScale = d3.scaleLinear().domain([0, max]).range([height - padding, padding])

    //x axis
    var xAxis = d3.axisBottom().scale(xScale).tickSizeOuter(0);
        svg.append('g')
        .attr('class', 'x-axis')
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(-45)')
        .style('font-size', '7px');

    //y axis
    var yAxis = d3.axisLeft().scale(yScale);
    svg.append('g')
    .attr('class','y-axis')
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);

    //chart
    const bars = svg.selectAll('.bar').data(sortedData).enter()
    .append('rect')
    .attr("class", "bar")
    .attr("y", (d) => yScale(d['attack']))
    .attr("x", (d) => xScale(d['pokemon_name']) + barPadding)
    .attr("height", (d) => d['attack'] * barHeightScale)
    .attr("width", xScale.bandwidth())
    .attr("fill", "skyblue")
    .attr("stroke", 'black')
    .on('mouseover', function() {
        // Add the 'highlighted' class to the hovered bar
        d3.select(this).classed('highlighted', true);
        // Add the 'fade' class to the non-hovered bars
        svg.selectAll('.bar:not(.highlighted)').classed('fade', true);
      })
      .on('mouseout', function() {
        // Remove the 'highlighted' class from the bar
        d3.select(this).classed('highlighted', false);
        // Remove the 'fade' class from all bars
        svg.selectAll('.bar').classed('fade', false);
      });

    svg.append('text')
      .attr('x', svgwidth/2)
      .attr('y', padding/2)
      .attr('text-anchor', 'middle')
      
      .style('font-size', 20)
      .text('Pokemon Stats Bar Chart');

    // x label
    svg.append('text').attr('class', 'x-label')
            .attr('x', svgwidth/2)
            .attr('y', height)
            .attr('text-anchor', 'middle')
            .style('font-size', 20)
            .text('Pokemon Name');

    //y label
    svg.append('text')
    .attr('class', 'y-label')
    .attr("transform", "rotate(-90)")
    .attr("x", -svgheight / 2) 
    .attr("y", padding - 50)
    .attr('text-anchor', 'middle')
    .style('font-size', 20)
    .text('Attack');
    //attack
    document.getElementById('Attack').addEventListener('click', () => {
        // Filter the data for the Kanto region
        const filteredData = data.filter((d) => d.region === 'Kanto');
    
        // Sort the data based on stamina
        const sortedData = filteredData.sort((a, b) => b.attack - a.attack);
    
        // Update the xScale domain and range based on the sortedData
        xScale.domain(sortedData.map((d) => d.pokemon_name));

        svg.select('.y-label')
        .transition()
        .text('Attack');
        svg
            .select('.x-axis')
            .transition()
            .duration(500)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-45)')
            .style('font-size', '7px');

        const maxAttack = d3.max(sortedData, (d) => d.attack);
        yScale.domain([0, maxAttack]);

        // Update the y-axis
        svg.select('.y-axis').transition().duration(500).call(yAxis);
    
        // Update the bars with new data
        bars
          .data(sortedData, (d) => d.pokemon_name)
          .transition()
          .duration(500)
          .attr('x', (d) => xScale(d.pokemon_name))
          .attr('y', (d) => yScale(d.attack))
          .attr('height', (d) => height - padding - yScale(d.attack));
    
      });
    //defense
    document.getElementById('Defense').addEventListener('click', () => {
        // Filter the data for the Kanto region
        const filteredData = data.filter((d) => d.region === 'Kanto');
    
        // Sort the data based on stamina
        const sortedData = filteredData.sort((a, b) => b.defense - a.defense);
    
        // Update the xScale domain and range based on the sortedData
        xScale.domain(sortedData.map((d) => d.pokemon_name));

        svg.select('.y-label')
        .transition()
        .text('Defense');
    
        svg
            .select('.x-axis')
            .transition()
            .duration(500)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-45)')
            .style('font-size', '7px');
        
        const maxDefense = d3.max(sortedData, (d) => d.defense);
        yScale.domain([0, maxDefense]);

        // Update the y-axis
        svg.select('.y-axis').transition().duration(500).call(yAxis);
    
        // Update the bars with new data
        bars
          .data(sortedData, (d) => d.pokemon_name)
          .transition()
          .duration(500)
          .attr('x', (d) => xScale(d.pokemon_name))
          .attr('y', (d) => yScale(d.defense))
          .attr('height', (d) => height - padding - yScale(d.defense));
    
      });

    //stamina
    document.getElementById('Stamina').addEventListener('click', () => {
        // Filter the data for the Kanto region
        const filteredData = data.filter((d) => d.region === 'Kanto');
    
        // Sort the data based on stamina
        const sortedData = filteredData.sort((a, b) => b.stamina - a.stamina);
    
        // Update the xScale domain and range based on the sortedData
        xScale.domain(sortedData.map((d) => d.pokemon_name));

        svg.select('.y-label')
        .transition()
        .text('Stamina');
    
        svg
            .select('.x-axis')
            .transition()
            .duration(500)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-45)')
            .style('font-size', '7px');
        
        const maxStamina = d3.max(sortedData, (d) => d.stamina);
        yScale.domain([0, maxStamina]);

        // Update the y-axis
        svg.select('.y-axis').transition().duration(500).call(yAxis);
    
        // Update the bars with new data
        bars
          .data(sortedData, (d) => d.pokemon_name)
          .transition()
          .duration(500)
          .attr('x', (d) => xScale(d.pokemon_name))
          .attr('y', (d) => yScale(d.stamina))
          .attr('height', (d) => height - padding - yScale(d.stamina));

      });
};
//graph 2 
let networkGraph = function(data){
    
    const svgwidth = 1700;
    const svgheight = 1000;
    
    const margin = { top: 20, right: 10, bottom: 40, left: 40 };
 
    const width = svgwidth - margin.left - margin.right;
    const height = svgheight - margin.top - margin.bottom;
    const svg = d3.select("#network-container").append('svg')
                 .attr("width", width + margin.left + margin.right )
                 .attr("height", height + margin.top + margin.bottom)
                 .append('g')
                 .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    data = data.filter(d => d.region == 'Kanto') 
    const nodes = data;
    const uniqueMainTypes = [...new Set(data.map(d => d.main_type))];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 50 ; 
    const radialForce = d3.forceRadial(radius, centerX, centerY);

    const linkStrength = d => (d.source.main_type === d.target.main_type ? 0.2 : 0.05);
    const mainTypePositions = {};
    uniqueMainTypes.forEach((mainType, index) => {
        const xPos = (index + 1) * (width / (uniqueMainTypes.length + 1));
        mainTypePositions[mainType] = xPos;
    });
    const simulation = d3.forceSimulation(nodes)
                        .force('link', d3.forceLink().id(d => d.main_type).strength(linkStrength))
                        .force('charge', d3.forceManyBody().strength(-30))
                        .force('x', d3.forceX(d => mainTypePositions[d.main_type]))
                        .force("y",d3.forceY(height/2))
                        .force('center', d3.forceCenter((width / 2), height / 2))
                        .force('radial', radialForce);

    const colors = {
        'Grass': 'green',
        'Fire': 'red',
        'Water': 'blue',
        'Bug': 'Chartreuse',
        'Normal': 'grey',
        'Poison': 'purple',
        'Electric': 'yellow',
        'Ground': 'brown',
        'Rock': 'GoldenRod',
        'Fairy': 'pink',
        'Fighting': 'DarkSeaGreen',
        'Psychic': 'CadetBlue',
        'Ghost': 'white',
        'Ice': 'cyan',
        'Dragon': 'DarkOrange'
        };
    
    const links = [];
    data.forEach((pokemon, index) => {
        for (let i = index + 1; i < data.length; i++) {
            const mainType = data[i].main_type;
            const weaknesses = pokemon.weakness;
            
            weaknesses.forEach(weakness => {
                const [[weaknessKey, weaknessValue]] = Object.entries(weakness);
                const weaknessPercentage = parseFloat(weaknessKey) / 100;
                if (weaknessValue.includes(mainType)) {  
                    links.push({ source: pokemon, target: data[i], weakness: weaknessPercentage });
                }
            });
        }
      });
      let tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style('opacity', 0);

      const thicknessScale = d3.scaleLinear()
        .domain([1.6, 2.56]) 
        .range([0.05,.35 ]); 
      
      const link = svg
        .selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke", "gray")
        .attr("stroke-width", d => thicknessScale(d.weakness));
      
      const node = svg
        .selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", 10)
        .attr("fill", d => colors[d.main_type])
        .attr("stroke", "black")
        .on("mouseover", function(event, d) {
            // Show tooltip on mouseover\
           const data = d3.select(this).datum().weakness
            tooltip.html("Weaknesses: " + `${JSON.stringify(data)}`);
            tooltip.transition().style("opacity", 1)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 20) + "px");
          }).on("mousemove", function(event) {
            tooltip.style("left", (event.pageX) + "px")
             .style("top", (event.pageY - 20) + "px");
          })
          .on("mouseout", function() {
            tooltip.transition().style("opacity", 0);
          });
          
    const label = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("class", "label")
        .text(d => d.pokemon_name);
    
      simulation.on("tick", () => {
        link.attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
      
        node.attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y);

        label.attr("x", function (d) {
            return d.x+12;
        })
            .attr("y", function (d) {
                return d.y+12;
            })
            .style("font-size", "8px");
      });
      
      //title
      svg.append('text')
        .attr('x', width/2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-family', 'SF Pixelate')
        .style('font-size', 20)
        .text('Pokemon Weakness Network Graph');
      svg.append("circle").attr("cx",1500).attr("cy",680).attr("r", 6).style("fill", "Green").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",700).attr("r", 6).style("fill", "Red").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",720).attr("r", 6).style("fill", "Blue").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",740).attr("r", 6).style("fill", "Chartreuse").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",760).attr("r", 6).style("fill", "grey").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",780).attr("r", 6).style("fill", "purple").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",800).attr("r", 6).style("fill", "yellow").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",820).attr("r", 6).style("fill", "brown").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",840).attr("r", 6).style("fill", "GoldenRod").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",860).attr("r", 6).style("fill", "pink").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",880).attr("r", 6).style("fill", "DarkSeaGreen").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",900).attr("r", 6).style("fill", "CadetBlue").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",920).attr("r", 6).style("fill", "white").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",940).attr("r", 6).style("fill", "cyan").attr('stroke', 'black')
      svg.append("circle").attr("cx",1500).attr("cy",960).attr("r", 6).style("fill", "DarkOrange").attr('stroke', 'black')
  
      svg.append("text").attr("x", 1550).attr("y", 680).text("Grass").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 700).text("Fire").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 720).text("Water").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 740).text("Bug").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 760).text("Normal").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 780).text("Poison").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 800).text("Electric").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 820).text("Ground").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 840).text("Rock").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 860).text("Fairy").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 880).text("Fighting").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 900).text("Psychic").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 920).text("Ghost").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 940).text("Ice").style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("text").attr("x", 1550).attr("y", 960).text("Dragon").style("font-size", "15px").attr("alignment-baseline","middle")
};
//graph 3
let mapGraph = function(){
    const filePath = "geoData.csv"
    d3.csv(filePath).then(function(data){
        data.forEach(d => {
            d['pokemonId'] = +d['pokemonId']
            d['latitude'] = +d['latitude']
            d['longitude'] = +d['longitude']
            d['main_type'] = d['main_type'].toString();
        });

        data = data.filter(d => d.pokemonId <= 151) //retrieiving kanto pokemons
        const svgwidth = 1700;
        const svgheight = 1000;
        const margin = { top: 20, right: 10, bottom: 40, left: 40 };
 
        const width = svgwidth - margin.left - margin.right;
        const height = svgheight - margin.top - margin.bottom;
        const svg = d3.select("#map-container").append('svg')
                 .attr("width", width + margin.left + margin.right )
                 .attr("height", height + margin.top + margin.bottom)
                 .append('g')
                 .attr("transform", `translate(${margin.left}, ${margin.top})`);
        //title
        svg.append('text')
        .attr('x', width/2)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'SF Pixelate')
        .style('font-size', 20)
        .text('Pokemon Locations');

        //legend 
        const legend = svg.append("g").attr("class", "legend");
    legend.append("circle").attr("cx",1500).attr("cy",680).attr("r", 6).style("fill", "Green").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",700).attr("r", 6).style("fill", "Red").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",720).attr("r", 6).style("fill", "Blue").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",740).attr("r", 6).style("fill", "Chartreuse").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",760).attr("r", 6).style("fill", "grey").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",780).attr("r", 6).style("fill", "purple").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",800).attr("r", 6).style("fill", "yellow").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",820).attr("r", 6).style("fill", "brown").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",840).attr("r", 6).style("fill", "GoldenRod").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",860).attr("r", 6).style("fill", "pink").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",880).attr("r", 6).style("fill", "DarkSeaGreen").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",900).attr("r", 6).style("fill", "CadetBlue").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",920).attr("r", 6).style("fill", "white").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",940).attr("r", 6).style("fill", "cyan").attr('stroke', 'black')
    legend.append("circle").attr("cx",1500).attr("cy",960).attr("r", 6).style("fill", "DarkOrange").attr('stroke', 'black')

    legend.append("text").attr("x", 1550).attr("y", 680).text("Grass").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 700).text("Fire").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 720).text("Water").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 740).text("Bug").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 760).text("Normal").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 780).text("Poison").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 800).text("Electric").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 820).text("Ground").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 840).text("Rock").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 860).text("Fairy").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 880).text("Fighting").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 900).text("Psychic").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 920).text("Ghost").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 940).text("Ice").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 1550).attr("y", 960).text("Dragon").style("font-size", "15px").attr("alignment-baseline","middle")


    const projection  = d3.geoNaturalEarth1()
        .scale(250)
        .translate([width/2, height/2])
    const pathgeo = d3.geoPath().projection(projection);
    const uniqueMainTypes = [...new Set(data.map(d => d.main_type))];
    const colors = {
        'Grass': 'green',
        'Fire': 'red',
        'Water': 'blue',
        'Bug': 'Chartreuse',
        'Normal': 'grey',
        'Poison': 'purple',
        'Electric': 'yellow',
        'Ground': 'brown',
        'Rock': 'GoldenRod',
        'Fairy': 'pink',
        'Fighting': 'DarkSeaGreen',
        'Psychic': 'CadetBlue',
        'Ghost': 'white',
        'Ice': 'cyan',
        'Dragon': 'DarkOrange'
        };
    const colorScheme = ["grey","Chartreuse","DarkSeaGreen", "Brown", "Pink","blue", 'GoldenRod',
                        'purple','red','DarkOrange','Green','CadetBlue','']
    const colorScale = d3.scaleOrdinal()
        .domain(uniqueMainTypes) 
        .range(colorScheme);
    d3.json("world.json").then(map =>{
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        svg.append('path')
            .attr('class', 'sphere')
            .attr('d', pathgeo({ type: 'Sphere' }))
            .attr("fill", "skyblue");

        svg.selectAll('.worldpath')
            .data(map.features)
            .enter().append("path")
            .attr('class', 'worldpath')
            .attr('d', pathgeo)
            .attr("fill", "white")
            .attr("stroke", 'black')
            .attr('stroke-width', 2);
        const pointsGroup = svg.append("g").attr("class", "points-group");
        data.forEach(d => {
            const [x, y] = projection([d.longitude, d.latitude]);
            var type = d.main_type
            pointsGroup.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 3) 
                .attr('fill', colors[type])
                .attr('stroke', 'black')
                .attr('stroke-width', 1); 
            });

        let zoom = d3.zoom()
        .scaleExtent([.7, 3])
        .on('zoom', function(event) {
            svg.attr('transform', event.transform);
        });

        svg.call(zoom);
    });
    });
};
