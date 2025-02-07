var map = L.map("map").setView([20.5937, 82.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let heatLayer;
let heatData = [];
let locationMap = new Map();
let earthquakeEvents = [];

async function loadearthquakeData() {
    try {
        const response = await fetch("updated_merged_data.csv");
        const data = await response.text();
        const rows = data.split("\n").slice(1);
        rows.forEach((row) => {
        const cols = row.trim().split(",");
        if (cols.length < 5) return;
        const lat = parseFloat(cols[1].trim());
        const lon = parseFloat(cols[2].trim());
        const year = cols[3].trim();
        const magnitude = parseFloat(cols[4].trim());

        if (isNaN(lat) || isNaN(lon) || isNaN(magnitude)) return;

        earthquakeEvents.push({ lat, lon, year, magnitude });

        const key = `${lat},${lon}`;
        if (locationMap.has(key)) {
            locationMap.set(key, locationMap.get(key) + magnitude);
        } else {
            locationMap.set(key, magnitude);
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
            0.2: "#FFD700",
            0.4: "#FFA500",
            0.6: "#FF8C00",
            0.8: "#D84315",
            1.0: "#B71C1C",
            },
        }).addTo(map);
  } catch (error) {
    console.error("Error loading earthquake data:", error);
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

  const filteredEvents = earthquakeEvents.filter(
    (event) => event.year.toString() === year
  );
  console.log(filteredEvents);
  if (filteredEvents.length == 0) {
    alert("No Data Found");
    document.getElementById("yearInput").value = "Enter Year";
    return;
  }
  if (filteredEvents.length === 0) {
    resultsContainer.innerHTML =
      "<strong>No earthquake events found for this year</strong>";
    hideResultsAfterDelay();
    return;
  }

  let result = `<strong>earthquake Events in Year ${year}</strong><br><br>`;
  filteredEvents.forEach((event) => {
    result += `Location: (${event.lat}, ${event.lon}) - Magnitude: ${event.magnitude}<br>`;
  });

  resultsContainer.innerHTML = result;
});
function hideResultsAfterDelay() {
  document.getElementById("search-results").style.display = "none";
}

map.on("click", function (e) {
  const { lat, lng } = e.latlng;
  let closestEvents = earthquakeEvents.filter(
    (event) =>
      Math.abs(event.lat - lat) < 0.5 && Math.abs(event.lon - lng) < 0.5
  );
  closestEvents.sort((a, b) => b.year - a.year);
  let popupContent = `<strong>Latitude:</strong> ${lat.toFixed(4)}<br>
                                <strong>Longitude:</strong> ${lng.toFixed(4)}`;
  if (closestEvents.length > 0) {
    popupContent += "<br><strong>Recorded earthquakes:</strong><br>";
    closestEvents.forEach((event) => {
      popupContent += `Year: ${event.year}, Magnitude: ${event.magnitude}<br>`;
    });
  } else {
    popupContent += `<br><strong>No earthquake event recorded here.</strong>`;
  }
  hideResultsAfterDelay();

  document.getElementById("yearInput").value = "Enter Year";

  L.popup().setLatLng([lat, lng]).setContent(popupContent).openOn(map);
});

loadearthquakeData();
