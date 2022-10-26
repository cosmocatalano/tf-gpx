//serves a string as a file for download
function downloadString(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

//checks for problems, alerts user
function errCheck(pageString) {
	let noTF = "It looks like you're not on a Trailforks.com page.";
	let noTrailRoute = "It looks like you're on Trailforks.com, but not looking at a route or trail page.";
	let noMap = "Can't find a map on this Trailforks page. Press OK to go to the page where we think the map lives.\n\nYou'll need to click the bookmarklet again after that page loads to export."
	if (window.location.hostname.indexOf('trailforks') === -1) {
		window.alert(noTF)
		return false;
	} else if ( window.location.pathname.indexOf('trails') === -1 && window.location.pathname.indexOf('route') === -1) {
		window.alert(noTrailRoute);
		return false;
	} else if (pageString.indexOf("encodedpath") === -1) {
		if(confirm(noMap)) {
			window.location.href = 'https://' + document.location.hostname + document.location.pathname + 'map/'
			return false;
		} 
	} else {
		return true;
	}
}

//get page source
let pageString = document.getElementsByTagName('html')[0].innerHTML;

//loose check to make sure user's in the right spot
if ( errCheck(pageString) ) {

	//get page title
	let pageTitle = document.title;

	//get short title
	let shortTitle = pageTitle.split("|")[0].trim();

	//get page Url
	let pageUrl = 'https://' + window.location.hostname + window.location.pathname;

	//get filename
	let gpxFilename = window.location.pathname.split("/")[2];

	//find polyline
	//polyline value lives in an HTML <script> and has escaped backslashes that skew the results of the Mapbox decoder
	//replacing with the encoded 'HCX' to avoid JS backslash drama altogether
	//not sure how/why this works but it's how their own encoder handles backslashes https://developers.google.com/maps/documentation/utilities/polylineutility
	let trailPolyline = pageString.match(/encodedpath:\s?'(.*?)'/)[1].replaceAll('\\\\', 'HCX');

	//get waypoints
	let waypointArray = polyline.decode(trailPolyline);
	
	//empty string for trackpoints
	let gpxTrackpoints = '';

	//turn the waypoints into trackpoints
	for (let coord of waypointArray) {
		gpxTrackpoints += '\n\t\t\t<trkpt lat="' + coord[0] + '" lon="' + coord[1] + '"/>';
	}

	//start the GPX file string
	let gpxHead = '<?xml version="1.0" encoding="UTF-8"?>\n<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" creator="https://github.com/cosmocatalano/tf-gpx">';
	//add some metadata
	let gpxMeta ='\n\t<metadata>\n\t\t<link href="' + pageUrl + '">\n\t\t\t<text>' + pageTitle + '</text>\n\t\t</link>\n\t</metadata>\n\t<trk>\n\t\t<name>' + shortTitle + '</name>\n\t\t<trkseg>';
	//close tags
	let gpxFoot = '\n\t\t</trkseg>\n\t</trk>\n</gpx>';
	//put the final GPX string together
	let outputGpx = gpxHead + gpxMeta + gpxTrackpoints + gpxFoot;

	//output GPX string as file
	let text = outputGpx;
	let filename = gpxFilename + ".gpx";

	downloadString(filename, text);
}
