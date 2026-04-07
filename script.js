/* ════════════════════════════
     CHARTS 1 & 2 — D3 + SCROLLAMA
  ════════════════════════════ */

  const popData = [
    { year:1970, pop:20  }, { year:1975, pop:22  }, { year:1980, pop:25  },
    { year:1985, pop:30  }, { year:1990, pop:32  }, { year:1995, pop:40  },
    { year:2000, pop:67  }, { year:2005, pop:87  }, { year:2010, pop:120 },
    { year:2015, pop:160 }, { year:2020, pop:200 }, { year:2023, pop:230 }
  ];

  const mortData = [
    { county:"Collier",    deaths:104 },
    { county:"Hendry",     deaths:58  },
    { county:"Lee",        deaths:42  },
    { county:"Miami-Dade", deaths:21  },
    { county:"Broward",    deaths:14  },
    { county:"Glades",     deaths:11  },
    { county:"Charlotte",  deaths:8   }
  ];

  const tip = d3.select("#tooltip");
  function showTip(html, e) {
    tip.html(html).style("opacity", 1)
       .style("left", (e.clientX + 16) + "px")
       .style("top",  (e.clientY - 32) + "px");
  }
  function moveTip(e) {
    tip.style("left", (e.clientX + 16) + "px")
       .style("top",  (e.clientY - 32) + "px");
  }
  function hideTip() { tip.style("opacity", 0); }

  function getDims() {
    const box = document.getElementById("vizContainer");
    const w   = box.clientWidth || 460;
    return {
      m: { top:28, right:24, bottom:44, left:50 },
      w: w,
      h: Math.min(280, Math.max(200, w * 0.55))
    };
  }

  function drawLineChart() {
    d3.select("#vizContainer").selectAll("*").remove();
    const { m, w, h } = getDims();
    const iw = w - m.left - m.right;
    const ih = h - m.top  - m.bottom;

    const svg = d3.select("#vizContainer").append("svg")
      .attr("width", w).attr("height", h)
      .append("g").attr("transform", `translate(${m.left},${m.top})`);

    const x = d3.scaleLinear().domain([1970, 2023]).range([0, iw]);
    const y = d3.scaleLinear().domain([0, 260]).nice().range([ih, 0]);

    svg.append("g").attr("class","grid")
      .call(d3.axisLeft(y).tickSize(-iw).tickFormat(""));

    svg.append("g").attr("class","axis")
      .attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(6));

    svg.append("g").attr("class","axis")
      .call(d3.axisLeft(y).ticks(5));

    svg.append("path").datum(popData)
      .attr("class","area-fill")
      .attr("d", d3.area()
        .x(d => x(d.year)).y0(ih).y1(d => y(d.pop))
        .curve(d3.curveMonotoneX));

    svg.append("path").datum(popData)
      .attr("class","panther-line")
      .attr("d", d3.line()
        .x(d => x(d.year)).y(d => y(d.pop))
        .curve(d3.curveMonotoneX));

    svg.selectAll(".dot").data(popData).enter().append("circle")
      .attr("class","dot").attr("r", 4)
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.pop))
      .on("mouseover", (e, d) => showTip(`<strong>${d.year}</strong><br>~${d.pop} panthers`, e))
      .on("mousemove", moveTip)
      .on("mouseout",  hideTip);

    const rx = x(1995), ry = y(40);
    svg.append("line")
      .attr("x1",rx).attr("x2",rx)
      .attr("y1",ry-6).attr("y2",ry-28)
      .attr("stroke","#e67e22").attr("stroke-width",1.5)
      .attr("stroke-dasharray","3,2");
    svg.append("text")
      .attr("x", rx + 4).attr("y", ry - 30)
      .style("font-size","9px").style("fill","#e67e22")
      .style("font-family","Arial,sans-serif")
      .text("1995: Genetic rescue");

    svg.append("text").attr("x", iw/2).attr("y", ih + 38)
      .attr("text-anchor","middle")
      .style("font-size","10px").style("fill","#888")
      .style("font-family","Arial,sans-serif").text("Year");

    svg.append("text").attr("transform","rotate(-90)")
      .attr("x", -ih/2).attr("y", -38)
      .attr("text-anchor","middle")
      .style("font-size","10px").style("fill","#888")
      .style("font-family","Arial,sans-serif").text("Estimated Population");
  }

  function drawBarChart() {
    d3.select("#vizContainer").selectAll("*").remove();
    const { m, w, h } = getDims();
    const iw = w - m.left - m.right;
    const ih = h - m.top  - m.bottom;

    const svg = d3.select("#vizContainer").append("svg")
      .attr("width", w).attr("height", h)
      .append("g").attr("transform", `translate(${m.left},${m.top})`);

    const x = d3.scaleBand()
      .domain(mortData.map(d => d.county))
      .range([0, iw]).padding(0.28);

    const y = d3.scaleLinear()
      .domain([0, 120]).nice().range([ih, 0]);

    svg.append("g").attr("class","grid")
      .call(d3.axisLeft(y).tickSize(-iw).tickFormat(""));

    svg.append("g").attr("class","axis")
      .attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", iw < 380 ? "8px" : "10px");

    svg.append("g").attr("class","axis")
      .call(d3.axisLeft(y).ticks(5));

    svg.selectAll(".bar-rect").data(mortData).enter().append("rect")
      .attr("class","bar-rect")
      .attr("x", d => x(d.county))
      .attr("width", x.bandwidth())
      .attr("y", ih).attr("height", 0)
      .attr("rx", 3).attr("fill","#c0392b")
      .on("mouseover", (e,d) => showTip(`<strong>${d.county} County</strong><br>${d.deaths} confirmed deaths`, e))
      .on("mousemove", moveTip)
      .on("mouseout",  hideTip)
      .transition().duration(600).delay((_,i) => i * 60)
      .attr("y", d => y(d.deaths))
      .attr("height", d => ih - y(d.deaths));

    svg.selectAll(".bar-label").data(mortData).enter().append("text")
      .attr("x", d => x(d.county) + x.bandwidth() / 2)
      .attr("y", d => y(d.deaths) - 5)
      .attr("text-anchor","middle")
      .style("font-size","10px").style("fill","#333")
      .style("font-family","Arial,sans-serif")
      .text(d => d.deaths);

    svg.append("text").attr("x", iw/2).attr("y", ih + 38)
      .attr("text-anchor","middle")
      .style("font-size","10px").style("fill","#888")
      .style("font-family","Arial,sans-serif").text("County");

    svg.append("text").attr("transform","rotate(-90)")
      .attr("x", -ih/2).attr("y", -38)
      .attr("text-anchor","middle")
      .style("font-size","10px").style("fill","#888")
      .style("font-family","Arial,sans-serif").text("Confirmed Road Deaths");
  }

  const chartMeta = {
    line: {
      label: "Chart 1 — Population",
      title: "Florida Panther Population, 1970–2023",
      sub:   "Source: FWC & U.S. Fish & Wildlife Service",
      draw:  drawLineChart
    },
    bar: {
      label: "Chart 2 — Road Mortality",
      title: "Confirmed Road Deaths by County, 2000–2023",
      sub:   "Source: FWC Road Mortality Reports",
      draw:  drawBarChart
    }
  };

  let currentChart = "line";

  function switchChart(type) {
    if (currentChart === type) return;
    currentChart = type;
    const meta = chartMeta[type];
    document.getElementById("chartLabel").textContent     = meta.label;
    document.getElementById("chartTitleText").textContent = meta.title;
    document.getElementById("chartSub").textContent       = meta.sub;
    meta.draw();
  }

  drawLineChart();

  const scroller = scrollama();
  scroller
    .setup({ step: ".step", offset: 0.5, debug: false })
    .onStepEnter(({ element, index }) => {
      document.querySelectorAll(".step").forEach(s => s.classList.remove("is-active"));
      element.classList.add("is-active");
      switchChart(index <= 2 ? "line" : "bar");
    });

  window.addEventListener("resize", () => {
    scroller.resize();
    chartMeta[currentChart].draw();
  });


  /* ════════════════════════════
     CHART 3 — BREEDING ICONS
  ════════════════════════════ */

  (function () {
    const TOTAL_ICONS     = 10;
    const HIGHLIGHT_COUNT = 7;

    const IMG_SRC = "panther-cub.png"

    const container = document.getElementById("breedIcons");
    if (!container) return;

    for (let i = 1; i <= TOTAL_ICONS; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "breed-icon";
      wrapper.dataset.index = i;
      wrapper.setAttribute("aria-label",
        `Litter ${i} — ${i <= HIGHLIGHT_COUNT ? "2 or 3 kittens" : "1 or 4 kittens"}`
      );
      wrapper.innerHTML = `<img src="${IMG_SRC}" class="breed-icon__img" alt="panther cub"><span class="breed-icon__label">${i}</span>`;
      container.appendChild(wrapper);
    }

    const icons = container.querySelectorAll(".breed-icon");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target.classList.contains("fade-in")) return;

          const idx   = parseInt(entry.target.dataset.index, 10);
          const delay = (idx - 1) * 90;

          setTimeout(() => {
            entry.target.classList.add("fade-in");
            if (idx <= HIGHLIGHT_COUNT) {
              setTimeout(() => {
                entry.target.classList.add("highlighted");
              }, 320);
            }
          }, delay);

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -60px 0px" }
    );

    icons.forEach((icon) => observer.observe(icon));
  })();
