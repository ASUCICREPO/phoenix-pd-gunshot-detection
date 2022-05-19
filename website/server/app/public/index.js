const subBtn = document.getElementById("subscribe-button");
const unsubBtn = document.getElementById("unsubscribe-button");
const subToast = document.getElementById("gunshot-sub");
const unsubToast = document.getElementById("gunshot-unsub");
const unsubToast1 = document.getElementById("gunshot-unsub1");
const toggleSwitch = document.getElementById('toggle-switch');

toggleSwitch.addEventListener("change", (event) => {
    if (event.target.checked) {
        getRawLocations()
    } else {
        getLocations()
    }
})

subBtn.addEventListener("click", (event) => {
    subscribe();
});

unsubBtn.addEventListener("click", (event) => {
    unsubscribe();
});

function subscribe() {
    console.log("CLICKED");
    let el = document.getElementById("subscribe-field");
    const number = el.value;

    let data = {
        number: number,
    };

    fetch("https://asucic-gunshotdetection.com/api/sns/subscribe", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        })
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            let subAlert = new bootstrap.Toast(subToast); //inizialize it
            subAlert.show();
        });

    el.value = "";
}

function unsubscribe() {
    let el = document.getElementById("subscribe-field");
    const number = el.value;

    let data = {
        number: number,
    };

    fetch("https://asucic-gunshotdetection.com/api/sns/unsubscribe", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        })
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            if (json.success) {
                let unsubAlert = new bootstrap.Toast(unsubToast); //inizialize it
                unsubAlert.show();
            } else {
                let unsubAlert1 = new bootstrap.Toast(unsubToast1); //inizialize it
                unsubAlert1.show();
            }
        });

    el.value = "";
}

let markers = [];
let locations = [];
let raw_locations = [];
let device_latlongs = {};


function getLocations() {
    fetch("https://asucic-gunshotdetection.com/api/incidents/locations", {
            method: "GET",
        })
        .then((response) => response.json())
        .then((json) => {
            locations = json.locations;
            console.log('locations')
            console.log(locations)
            initMap();
        });
}

function getRawLocations() {
    fetch("https://asucic-gunshotdetection.com/api/incidents/rawlocations", {
            method: "GET",
        })
        .then((response) => response.json())
        .then((json) => {
            device_locs = json.locations;
            for (i = 0; i < device_locs.length; i++) {
                device_latlongs[device_locs[i]['device_id']] = {
                    'lat': device_locs[i]['lat'],
                    'long': device_locs[i]['lon']
                }
            }
            fetch("https://asucic-gunshotdetection.com/api/incidents/rawlocations", {
                    method: "GET",
                })
                .then((response) => response.json())
                .then((json) => {
                    raw_locations = json.locations;
                    for (i = 0; i < raw_locations.length; i++) {
                        latlongs = device_latlongs[raw_locations[i]['device_id']]
                        raw_locations[i]['long'] = latlongs['long']
                        raw_locations[i]['lat'] = latlongs['lat']
                    }
                    console.log('raw_locations')
                    console.log(raw_locations)
                    initMap();
                });
        })
}

function initMap() {
    // if checked
    if (toggleSwitch.checked) {
        data = raw_locations
    } else {
        data = locations
    }

    averageLat = data.reduce(
        (total, next) => total + next.lat, 0
    ) / data.length

    averageLong = data.reduce(
        (total, next) => total + next.long, 0
    ) / data.length

    const center = { lat: averageLat, lng: averageLong };
    const mapOptions = {
        center: center,
        // TODO: adjust zoom
        zoom: 15,
        panTo: center,
    };
    const googlemap = new google.maps.Map(
        document.getElementById("map"),
        mapOptions
    );

    const infowindow = new google.maps.InfoWindow();

    setMarker(data, googlemap, infowindow);

    const dateRange = flatpickr("#date-range", {
        mode: "range",
        onChange: function(dates) {
            if (dates.length == 2) {
                var start = new Date(dates[0]);
                var end = new Date(dates[1]);

                let newArray = data.filter((item) => {
                    let date = new Date(parseInt(item.timestamp));
                    return date >= start && date <= end;
                });

                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }

                setMarker(newArray, googlemap, infowindow);
            }
        },
    });
}

// TODO: add info on markers
function setMarker(locations, googlemap, infowindow) {
    for (i = 0; i < locations.length; i++) {
        let marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i].lat, locations[i].long),
            map: googlemap,
        });

        markers.push(marker);

        google.maps.event.addListener(
            marker,
            "click",
            (function(marker, i) {
                return function() {
                    let info = new Date(parseInt(locations[i].timestamp)).toString();
                    infowindow.setContent(info);
                    infowindow.open(map, marker);
                };
            })(marker, i)
        );
    }
}

setInterval(() => {
    if (toggleSwitch.checked) {
        getRawLocations()
    } else {
        getLocations()
    }
}, 60 * 1000);