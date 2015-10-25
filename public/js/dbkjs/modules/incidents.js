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

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.incidents = {
    id: "dbk.module.incidents",
    service: null,
    controller: null,
    options: null,
    register: function() {
        this.options = dbkjs.options.incidents;

        this.service = new AGSIncidentService(this.options.ags.incidentsUrl);

        if(this.options.voertuigMode) {
            this.controller = new VoertuigInzetController(this);
        } else {
            //this.controller = new IncidentMonitorController(this);
        }

        this.service.initialize(this.options.ags.tokenUrl, this.options.ags.user, this.options.ags.password);
    }
};

