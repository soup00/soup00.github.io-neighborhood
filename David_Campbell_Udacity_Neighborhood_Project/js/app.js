//global vars
var map;
var clientID;
var clientSecret;

//google fail message
googleError = function googleError() {
  alert(
    'Whoopsie daisy something with wrong with Google Maps!'
  );
};

//view model
function ViewModel() {
  var self = this;

  this.searchItem = ko.observable("");
  this.markers = [];

  //this function populates the infowindow when the marker is clicked. We'll only allow
  //one infowindow which will open at the marker that is clicked, and populate based
  //on that markers position.
  this.populateInfoWindow = function(marker, infowindow) {
    if (infowindow.marker != marker) {
      infowindow.setContent('');
      infowindow.marker = marker;
      //foursquare API client
      clientID = "2G4BOAVMDDTBVKZOU0WI0IBXSQOCMDTIOWZCKXS4XO1RAC0R";
      clientSecret = "3UZMRJ1XEB1WDHZROFUCCIGDJCFMWPVRG5J4FFDWVDNHEV4K";
      //URL for foursquare API
      var apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
        marker.lat + ',' + marker.lng + '&client_id=' + clientID +
        '&client_secret=' + clientSecret + '&query=' + marker.title +
        '&v=20170708' + '&m=foursquare';
      //foursquare API
      $.getJSON(apiUrl).done(function(marker) {
        var response = marker.response.venues[0];
        self.street = response.location.formattedAddress[0];
        self.city = response.location.formattedAddress[1];
        self.zip = response.location.formattedAddress[3];
        self.category = response.categories[0].shortName;

        self.htmlContentFoursquare =
          '<h5 class="info_subtitle">(' + self.category +
          ')</h5>' + '<div>' +
          '<h6 class="info_address_title"> Address: </h6>' +
          '<p class="info_address">' + self.street + '</p>' +
          '<p class="info_address">' + self.city + '</p>' +
          '</p>' + '</div>' + '</div>';

        infowindow.setContent(self.htmlContent + self.htmlContentFoursquare);
      }).fail(function() {
        alert(
          "Sorry! Something went wrong with foursquare."
        );
      });

      this.htmlContent = '<div>' + '<h4 class="info_title">' + marker.title +
        '</h4>';

      infowindow.open(map, marker);

      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
  };

  this.populateAndBounceMarker = function() {
    self.populateInfoWindow(this, self.largeInfoWindow);
    this.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout((function() {
      this.setAnimation(null);
    }).bind(this), 1400);
  };

  //google maps
  this.initMap = function() {
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
      center: new google.maps.LatLng(39.7168661, -104.9527576),
      zoom: 11,
      styles: styles
    };
    map = new google.maps.Map(mapCanvas, mapOptions);

    //set InfoWindow and adds Google Maps marker
    this.largeInfoWindow = new google.maps.InfoWindow();
    for (var i = 0; i < locations.length; i++) {
      this.titleMarker = locations[i].title;
      this.latMarker = locations[i].lat;
      this.lngMarker = locations[i].lng;
      this.marker = new google.maps.Marker({
        map: map,
        position: {
          lat: this.latMarker,
          lng: this.lngMarker
        },
        title: this.titleMarker,
        lat: this.latMarker,
        lng: this.lngMarker,
        id: i,
        animation: google.maps.Animation.DROP
      });
      this.marker.setMap(map);
      this.markers.push(this.marker);
      this.marker.addListener('click', self.populateAndBounceMarker);
    }
  };

  this.initMap();

  //populates loction list using data-bind, also search filter
  this.myLocationsFilter = ko.computed(function() {
    var result = [];
    for (var i = 0; i < this.markers.length; i++) {
      var markerLocation = this.markers[i];
      if (markerLocation.title.toLowerCase().includes(this.searchItem()
          .toLowerCase())) {
        result.push(markerLocation);
        this.markers[i].setVisible(true);
      } else {
        this.markers[i].setVisible(false);
      }
    }
    return result;
  }, this);
}


function startApp() {
  ko.applyBindings(new ViewModel());
}