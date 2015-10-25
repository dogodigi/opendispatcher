/*
 *  Copyright (c) 2015 B3Partners (info@b3partners.nl)
 *
 *  This file is part of safetymapDBK
 *
 *  safetymapDBK is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  safetymapDBK is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with safetymapDBK. If not, see <http://www.gnu.org/licenses/>.
 *
 */

function IncidentMarkerLayer() {
    this.layer = new OpenLayers.Layer.Markers("Incident markers", {
        rendererOptions: { zIndexing: true }
    });
    dbkjs.map.addLayer(this.layer);

    this.size = new OpenLayers.Size(24,26);
    this.offset = new OpenLayers.Pixel(-(this.size.w/2), -this.size.h);
}

IncidentMarkerLayer.prototype.addIncident = function(incident, red) {
    var me = this;
    if(incident.T_X_COORD_LOC && incident.T_Y_COORD_LOC) {
        var pos = new OpenLayers.LonLat(incident.T_X_COORD_LOC, incident.T_Y_COORD_LOC);

        var marker = new OpenLayers.Marker(
            pos,
            new OpenLayers.Icon(red ? "images/bell.png" : "images/marker-grey.png", this.size, this.offset)
        );
        marker.id = incident.INCIDENT_ID;
        marker.events.register("click", marker, function() { me.markerClick(marker, incident); });
        this.layer.addMarker(marker);
        return marker;
    }
};

IncidentMarkerLayer.prototype.setZIndexFix = function() {
    this.layer.setZIndex(100000);
};

IncidentMarkerLayer.prototype.removeMarker = function(marker) {
    this.layer.removeMarker(marker);
};

IncidentMarkerLayer.prototype.clear = function() {
    this.layer.clearMarkers();
};

IncidentMarkerLayer.prototype.markerClick = function(marker, incident) {
    $(this).triggerHandler('click', incident, marker);
};
