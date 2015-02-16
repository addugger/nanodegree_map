/**
 * Main JavaScript file for the Nanodegree Map
 * Author: Aaron Dugger
 * Creation Date: 02/02/2015
 * Last Edit Date: 02/02/2015
 */

$(document).on("ready", function() {

	
	/**
	 * ViewModel for the map app.
	 */
	var ViewModel = function() {
		var self = this;
		
		/**
		 * This is the model for a location on the map.
		 */
		var Location = function(lat, long, name, vicinity, address, types, marker) {
			var locSelf = this;
			
			// Latitude of this location
			this.latitude = ko.observable(lat);
			
			// Longitude of this location
			this.longitude = ko.observable(long);
			
			// Name of this location
			this.name = ko.observable(name);
			
			// String representation of location
			this.vicinity = ko.observable(vicinity);
			
			// Formatted address string
			this.address = ko.observable(address);
			
			// Type of the location
			this.types = ko.observableArray(types);
			
			// Image url associated with this location
			this.img = ko.computed(function() {
				var url = "url('http://maps.googleapis.com/maps/api/streetview?size=500x350&location=";
				url += locSelf.latitude() + ", " + locSelf.longitude();
				url += "')";
				return url;
			}, locSelf);
			
			// Array of links associated with this location.
			this.links = ko.observableArray();
			
			// Whether or not this location is currently selected
			this.selected = ko.computed(function() {
				var rtn = false;
				if (self.currentLocation != null)
				{
					rtn = (locSelf == self.currentLocation());
				}
				return rtn;
			}, locSelf);
			
			// Associated Google map Marker
			this.marker = marker;
			
			// Detach the locations marker from the map
			this.unsetMarker = function() {
				locSelf.marker.setMap(null);
			}
		}
		
		// Replace contents of self.locations with places returned
		// from a searchBox search
		this.addSearchLocations = function(places) {
			self.infowindow.close();
			self.currentLocation("");
			self.emptyLocations();
			var place;
			var latLng;
			var location;
			var marker;
			// Address is not always returned
			var address = null;
			for (var i = 0; i < places.length; i++) {
				place = places[i];
				if (place.formatted_address != null) {
					address = place.formatted_address;
				}
				marker = self.createMarker(place);
				latLng = place.geometry.location;
				location = new Location(
						latLng.lat(),
						latLng.lng(),
						place.name,
						place.vicinity,
						place.formatted_address,
						place.types,
						marker
				);
				// Add "custom property" location to marker to make it possible
				// to find the location from the marker.
				marker.set("myLocation", location);
				self.locations.push(location);
				address = null;
			}
		}
		
		// Helper function to create Google Markers
		this.createMarker = function(place) {
			var marker = new google.maps.Marker({
				map: self.map,
				position: place.geometry.location
			});
			
			google.maps.event.addListener(marker, "click", function() {
				self.selectCurrentLocation(this.get("myLocation"));
			});
		
			return marker;
		}
		
		// Empties the locations array and unsets all the associated markers
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
				self.addSearchLocations(results);
			}
		}
		
		this.selectCurrentLocation = function(location) {
			self.currentLocation(location);
			self.infowindow.setContent($("#infoWindow").html());
			self.infowindow.open(self.map, location.marker);
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
		// The currently selected location, if any is selected
		this.currentLocation = ko.observable("");
		// The Google map
		this.map;
		// The bounds used for the map and searchBox
		this.bounds = self.initBounds();
	
		self.initMap();
		
		// Infowindow for the page (content has to be reset as infowindow html string
		// each time because setting to dom element and then closing the infowindow
		// certain ways causes the dom element to be lost and the infowindow content
		// stops being updated).
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