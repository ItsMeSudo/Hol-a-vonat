const map = L.map('map').setView([47.3, 19.1], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);
L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

let markers = [];

function delayColor(level) {
  if (level >= 3) return 'red';
  if (level == 2) return 'orange';
  if (level == 1) return 'yellow';
  return 'lime';
}

function delayLevel(min) {
  if (min >= 60) return 3;
  if (min >= 15) return 2;
  if (min >= 5) return 1;
  return 0;
}

function createMarkerIcon(level, heading) {
  const container = document.createElement("div");
  container.className = "marker-container";

  const triangleWrapper = document.createElement("div");
  triangleWrapper.className = "triangle-wrapper";
  triangleWrapper.style.transform = `rotate(${heading}deg)`;

  const triangle = document.createElement("div");
  triangle.className = "triangle";

  const circle = document.createElement("div");
  circle.className = "circle";
  circle.style.setProperty('--color', delayColor(level));

  let iconSize = [30, 30];

  if (window.location.search.includes('lazarjanosszomoru')) {
    circle.style.setProperty('background-image', `url(img/lazar_${level}.jpg)`);
    circle.style.setProperty('background-size', 'cover');
    circle.style.setProperty('background-blend-mode', 'multiply');
    circle.style.setProperty('width', '45px');
    circle.style.setProperty('height', '45px');
    triangleWrapper.style.setProperty('width', '53px');
    triangleWrapper.style.setProperty('height', '53px');
    triangle.style.setProperty('top', '-15px');
    triangle.style.setProperty('left', '14px');

    iconSize = [60, 60];
  }

  triangleWrapper.appendChild(triangle);
  container.appendChild(triangleWrapper);
  container.appendChild(circle);

  return L.divIcon({ html: container, className: '', iconSize: iconSize });
}


function formatTime(sec) {
  if (sec == null) return '-';
  const h = (String(Math.floor(sec / 3600)).padStart(2, '0')) % 24;
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  return `${h}:${m}`;
}

function getCurrentDelay(stops, now) {
  for (const stop of stops) {
    const arrivalTime = stop.ra;
    if (arrivalTime > now) {
      return stop.a || stop.d || 0;
    }
  }
  const lastStop = stops[stops.length - 1];
  return lastStop ? (lastStop.a || lastStop.d || 0) : 0;
}


function loadData(retryCache) {
  fetch("train_data.json", retryCache ? { cache: "reload" } : {})
    .then(res => res.json())
    .then(data => {
      markers.forEach(m => m.remove());
      markers = [];

      const now = new Date();
      const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      const updated = new Date(data.lastUpdated * 1000);

      var secondsSinceUpdate = (now.getTime() - updated.getTime()) / 1000;
      var minutesSinceUpdate = Math.round(secondsSinceUpdate / 60);

      document.getElementById("timestamp").textContent =
        `Utolsó frissítés: ${updated.toLocaleTimeString('hu-HU')}, ${minutesSinceUpdate} perce`;

      if (secondsSinceUpdate > 5 * 10 && !retryCache) {
        return loadData(true);
      }

      if (secondsSinceUpdate > 60 * 10) {
        alert("Figyelem! Az adatok utolsó frissítése " + updated.toLocaleTimeString('hu-HU') + "-kor volt!")
      }

      data.vehicles.forEach(v => {
        const delay = Math.round(getCurrentDelay(v.stops, nowSec) / 60);
        const delayText = delay >= 1 ? `${delay} perc késés` : 'nincs késés';
        const level = delayLevel(delay);
        const heading = v.hd || 0;
        const speed = Math.round((v.sp || 0) * 3.6);

        const marker = L.marker([v.lat, v.lon], {
          icon: createMarkerIcon(level, heading)
        }).addTo(map);

        marker.bindTooltip(`${v.name} (${speed} km/h) - ${delayText}`, {
          direction: "top"
        });

        let table = '<div class="popup-table-container"><table><tr><th>Állomás</th><th>Érk.</th><th>Ind.</th><th>Vágány</th></tr>';
        v.stops.forEach(s => {
          const arr = formatTime(s.sa);
          const rta = formatTime(s.ra);
          const dep = formatTime(s.sd);
          const rtd = formatTime(s.rd);
          let track = s.v
          if (track == null) {
            track = "-";
          }
          const arrDelay = (s.a || 0) / 60;
          const depDelay = (s.d || 0) / 60;
          const delayedClass = (arrDelay > 0 || depDelay > 0) ? 'delayed' : '';
          const isPassed = (s.rd || 0) < nowSec;

          table += `<tr class="${isPassed ? 'passed' : ''}">
            <td>${s.name}</td>
            <td>${arr}<br><span class="${delayedClass}">${rta}</span></td>
            <td>${dep}<br><span class="${delayedClass}">${rtd}</span></td>
            <td>${track}</td>
          </tr>`;
        });
        table += '</table></div>';

        marker.bindPopup(`
          <b>${v.name}</b><br>
          ${v.headsgn}<br>
          Sebesség: ${speed} km/h<br>
          Késés: ${delayText}<br>
          ${table}
        `);
        markers.push(marker);
      });
    });
}

loadData(false);
setInterval(loadData, 60000);

const legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML += "<b>Színek jelentése</b><br>";
  div.innerHTML += '<i style="background: lime"></i>0-4 perc késés<br>';
  div.innerHTML += '<i style="background: yellow"></i>5-14 perc késés<br>';
  div.innerHTML += '<i style="background: orange"></i>15-59 perc késés<br>';
  div.innerHTML += '<i style="background: red"></i>60+ perc késés<br>';
  return div;
};

legend.addTo(map);