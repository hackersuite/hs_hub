var mapObj = null;
$(document).ready(function () {
  markers = getAllMarkers(drawMap);
});

function drawMap(markers) {
  mapObj = $("#hackermap").vectorMap({
    map: "world_mill",
    scaleColors: ["#C8EEFF", "#0071A4"],
    normalizeFunction: "polynomial",
    hoverOpacity: 0.7,
    hoverColor: false,
    regionStyle: {
      initial: {
        fill: "#696969",
        "fill-opacity": 0.9,
        stroke: "none",
        "stroke-width": 0,
        "stroke-opacity": 0
      },
      hover: {
        "fill-opacity": 0.8,
        cursor: "pointer"
      },
      selected: {
        fill: "yellow"
      },
      selectedHover: {}
    },
    markerStyle: {
      initial: {
        fill: "#F8E23B",
        stroke: "#383f47"
      }
    },
    backgroundColor: "white",
    markers: markers
  });
}

function getAllMarkers(drawMapFunc) {
  $.get({
    url: "/map/get"
  }).done(function (data) {
    var formattedData = data.map((ele) => {
      const lat = ele["latLng"].split(" ")[0].slice(6, -1);
      const lng = ele["latLng"].split(" ")[1].slice(0, -1);
      return {
        latLng: [lat, lng],
        name: ele.placeName
      };
    });
    drawMapFunc(formattedData);
  });
}
