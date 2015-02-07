/**
 * Main JavaScript file for the Nanodegree Map
 * Author: Aaron Dugger
 * Creation Date: 02/02/2015
 * Last Edit Date: 02/02/2015
 */

$(document).on("ready", function() {

	/**
	 * This is the model for a location on the map.
	 */
	var Location = function(lat, long, name, vicinity, type, marker) {
		var self = this;
		
		// Latitude of this location
		this.latitude = ko.observable(lat);
		
		// Longitude of this location
		this.longitude = ko.observable(long);
		
		// Name of this location
		this.name = ko.observable(name);
		
		// String representation of location
		this.vicinity = ko.observable(vicinity);
		
		// Type of the location
		this.type = ko.observable(type);
		
		// Image url associated with this location
		//TODO change this to a computed observable that attempts
		//to set to the streetview image, but sets to noImage if
		//fails
		this.img = ko.observable("/img/noImage.png");
		
		// Array of links associated with this location.
		this.links = ko.observableArray();
		
		// Whether or not this location is currently selected
		this.selected = ko.observable(false);
		
		// Associated Google map Marker
		this.marker = marker;
		
		// Detach the locations marker from the map
		this.unsetMarker = function() {
			self.marker.setMap(null);
		}
	}
	
	/**
	 * ViewModel for the map app.
	 */
	var ViewModel = function() {
		var self = this;
		
		// Replace contents of self.locations with places returned
		// from a searchBox search
		this.addSearchLocations = function(places) {
			self.emptyLocations();
			var place;
			var latLng;
			var location;
			var marker;
			for (var i = 0; i < places.length; i++) {
				place = places[i];
				marker = self.createMarker(place);
				latLng = place.geometry.location;
				location = new Location(
						latLng.lat(),
						latLng.lng(),
						place.name,
						place.vicinity,
						place.type,
						marker
				);
				self.locations.push(location);
			}
		}
		
		// Helper function to create Google Markers
		this.createMarker = function(place) {
			var marker = new google.maps.Marker({
				map: self.map,
				position: place.geometry.location
			});
			
			google.maps.event.addListener(marker, "click", function() {
				self.infowindow.setContent(place.name);
				self.infowindow.open(self.map, this);
			});
		
			return marker;
		}
		
		this.emptyLocations = function() {
			for (var i = 0; i < self.locations().length; i++) {
				self.locations()[i].unsetMarker();
			}
			self.locations.removeAll();
		}
		
		// Setup the initial locations
		this.initLocations = function() {
			var request = {
				location: new google.maps.LatLng(39.94997, -83.805418),
				radius: 500
			};
			self.places.nearbySearch(request, self.placesCallback);
		}
		
		// Callback for places search
		this.placesCallback = function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				var place;
				var latLng;
				var location;
				var marker;
				for (var i = 0; i < results.length; i++) {
					place = results[i];
					marker = self.createMarker(place);
					latLng = place.geometry.location;
					location = new Location(
							latLng.lat(),
							latLng.lng(),
							place.name,
							place.vicinity,
							place.type,
							marker
					);
					self.locations.push(location);
				}
			}
		}
		
		this.initBounds = function() {
			return new google.maps.LatLngBounds(
				new google.maps.LatLng(39.93981721161983, -83.83596749496462),
	    		new google.maps.LatLng(39.96514861499254, -83.77584309768679)
		    );
			
		}
		
		// Initialize the Google map
		this.initMap = function() {
			// Bind map to the html
			self.map = new google.maps.Map($("#map-canvas")[0]);
			// Set initial bounds of the map
	        self.map.fitBounds(self.bounds);
	        
	        // When the map pans or zooms, reset the bounds for the searchBox
	        // and autoComplete
	        google.maps.event.addListener(self.map, "idle", function() {
	        	var bounds = self.map.getBounds();
	        	self.searchBox.setBounds(bounds);
	        	self.searchAutoComp.setBounds(bounds);
	        });
		}
		
		// Initiailze the Google Place Search Box
		this.initSearchBar = function() {
			var searchInput = $("#search-box")[0];
	        self.map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInput);
	        self.searchBox = new google.maps.places.SearchBox(searchInput);
	        self.searchBox.setBounds(self.bounds);
	        //add autocomplete to search-box
	        self.searchAutoComp = new google.maps.places.Autocomplete(searchInput);
	        self.searchAutoComp.setBounds(self.bounds);
	        
	        google.maps.event.addListener(self.searchBox, 'places_changed', function() {
	            self.addSearchLocations(self.searchBox.getPlaces());
	        });
		}
		
		//list of locations currently available
		this.locations = ko.observableArray();
		// The Google map
		this.map;
		// The bounds used for the map and searchBox
		this.bounds = self.initBounds();
	
		self.initMap();
		
		// Infowindow for the page
		this.infowindow = new google.maps.InfoWindow();
		// The places service
		this.places = new google.maps.places.PlacesService(self.map);
		// The google maps search box
		this.searchBox;
		// The autocomplete on the search box
		this.searchAutoComp;
		
		this.initSearchBar();
		this.initLocations();
	}
	ko.applyBindings(new ViewModel());
});