var map = L.map("map").setView([20.5937, 82.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let heatLayer;
let heatData = [];
let locationMap = new Map();
let tsunamiEvents = [];

async function loadTsunamiData() {
  try {
    const response = await fetch("tsunami_data_india.csv");
    const data = await response.text();
    const rows = data.split("\n").slice(1);

    rows.forEach((row) => {
      const cols = row.trim().split(",");
      if (cols.length < 5) return;
      const loc = cols[0].trim();
      const lat = parseFloat(cols[1].trim());
      const lon = parseFloat(cols[2].trim());
      const year = cols[3].trim();
      const magnitude = parseFloat(cols[4].trim());

      if (isNaN(lat) || isNaN(lon) || isNaN(magnitude)) return;

      tsunamiEvents.push({ lat, lon, year, magnitude, loc });

      const key = `${lat},${lon}`;
      if (locationMap.has(key)) {
        locationMap.set(key, locationMap.get(key) + magnitude, loc);
      } else {
        locationMap.set(key, magnitude, loc);
      }
    });

    locationMap.forEach((intensity, key) => {
      const [lat, lon] = key.split(",").map(Number);
      heatData.push([lat, lon, intensity / 10]);
    });

    heatLayer = L.heatLayer(heatData, {
      radius: 20,
      blur: 15,
      maxZoom: 10,
      minOpacity: 0.4,
      gradient: {
        0.2: "#ADD8E6",
        0.4: "#87CEEB",
        0.6: "#4682B4",
        0.8: "#4169E1",
        1.0: "#00008B",
      },
    }).addTo(map);
  } catch (error) {
    console.error("Error loading tsunami data:", error);
  }
}
document.querySelector(".search-btn").addEventListener("click", function () {
  const year = document.getElementById("yearInput").value.trim();
  const resultsContainer = document.getElementById("search-results");
  resultsContainer.innerHTML = "";
  resultsContainer.style.display = "block";

  if (!year) {
    resultsContainer.innerHTML = "<strong>Please enter a year</strong>";
    hideResultsAfterDelay();
    alert("Enter Year");
    return;
  }

  const filteredEvents = tsunamiEvents.filter(
    (event) => event.year.toString() === year
  );
  if (filteredEvents.length == 0) {
    alert("No Data Found");
    document.getElementById("yearInput").value = "Enter Year";
    return;
  }
  if (filteredEvents.length === 0) {
    resultsContainer.innerHTML =
      "<strong>No tsunami events found for this year</strong>";
    hideResultsAfterDelay();
    return;
  }

  let result = `<strong>Tsunami Events in Year ${year}</strong><br><br>`;
  filteredEvents.forEach((event) => {
    result += `Location: ${event.loc} - Magnitude: ${event.magnitude}<br>`;
  });

  resultsContainer.innerHTML = result;
});
function hideResultsAfterDelay() {
  document.getElementById("search-results").style.display = "none";
}

map.on("click", function (e) {
  const { lat, lng } = e.latlng;
  let closestEvents = tsunamiEvents.filter(
    (event) =>
      Math.abs(event.lat - lat) < 0.5 && Math.abs(event.lon - lng) < 0.5
  );
  closestEvents.sort((a, b) => b.year - a.year);
  let popupContent = `<strong>Latitude:</strong> ${lat.toFixed(4)}<br>
                                <strong>Longitude:</strong> ${lng.toFixed(4)}`;
  if (closestEvents.length > 0) {
    popupContent += "<br><strong>Recorded Tsunamis:</strong><br>";
    closestEvents.forEach((event) => {
      popupContent += `Year: ${event.year}, Magnitude: ${event.magnitude}<br>`;
    });
  } else {
    popupContent += `<br><strong>No tsunami event recorded here.</strong>`;
  }
  hideResultsAfterDelay();

  document.getElementById("yearInput").value = "Enter Year";

  L.popup().setLatLng([lat, lng]).setContent(popupContent).openOn(map);
});

loadTsunamiData();
