# nanodegree_map
Code base for Udacity fontend web dev neighborhood map project.

To start the application, place the files in a web server and navigate to index.html
in your web browser of choice.

The page opens initially as a google map of the northern part of Springfield, OH, 
where my home is located.  The initial search that populates the page is a google area
("near by") search centered on the initial map with wide open parameters, meaning it
returns the top 20 things that come up in the search, no matter what they are.

Clicking on an item in the list will highlight that item, center the map on the associated
location, and bring up a window with an image (if available) and information (if available)
for the chosen location.  Clicking on the "Marker" for a location results in the exact
same behavior, including highlighting the item in the list.

The search bar uses Google's "Places" autocomplete functionality for autocompleting.  When
you enter your search term(s) and hit enter, a google keyword search is run, centered on
wherever the map is currently centered, returning the top 20 results and repopulating the
list and the markers on the map.

All other behavior is the default behavior for a Google map, and was completely designed/
implemented by developers at Google.
