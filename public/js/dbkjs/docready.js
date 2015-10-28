/*!
 *  Copyright (c) 2015 Eddy Scheper (eddy.scheper@aris.nl)
 *
 *  This file is part of opendispatcher. safetymapDBK as a derived product
 *  complies to the same license.
 *
 *  opendispatcher is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  opendispatcher is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with your copy of this software. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global dbkjs */
/** @namespace document */
/**
 * The application is started when the document/page
 * has finished loading (including all assets)
 * to prevent unwanted behaviour. Depends on jQuery
 * @memberof document
 * @method ready
 */
$(document).ready(function () {
    dbkjs.documentReady();
});
