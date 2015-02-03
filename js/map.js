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
	}
	
	/**
	 * ViewModel for the map app.
	 */
	var ViewModel = function() {
		var self = this;
		
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
				}
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
		
		// Initialize the Google map
		this.initMap = function() {
			// Bind map to the html
			self.map = new google.maps.Map($("#map-canvas")[0]);
			// Set initial bounds of the map
	        self.map.fitBounds(
	        	new google.maps.LatLngBounds(
		    		new google.maps.LatLng(39.95753373131433, -83.8219341773987),
		    		new google.maps.LatLng(39.94743406787109, -83.7898764152527)
		    	)
	        );
	        // This gets around an issue where the bounds weren't known in time
	        // to initialize the search box.
	        google.maps.event.addListenerOnce(self.map, "idle", function(){
		    	var bounds = self.map.getBounds();
		    	self.searchAutoComp.setBounds(bounds);
		    	self.searchBox.setBounds(bounds);
	        });
		}
		
		this.initSearchBar = function() {
			var searchInput = $("#search-box")[0];
	        self.map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInput);
	        self.searchBox = new google.maps.places.SearchBox(searchInput);
	        
	        //add autocomplete to search-box
	        self.searchAutoComp = new google.maps.places.Autocomplete(searchInput);
		}
		
		//list of locations currently available
		this.locations = ko.observableArray();
		// The Google map
		this.map;
		
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