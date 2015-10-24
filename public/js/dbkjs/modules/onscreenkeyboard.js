/*!
 *  Copyright (c) 2014 B3Partners (info@b3partners.nl)
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

/*
 * Show an on-screen keyboard without Windows keys for devices with only a
 * touchscreen.
 *
 * To enable only for certain cases add options to options_mobile.js, for example
 * to only enable on localhost URLs:
 *
 * dbkjs.options.onscreenkeyboard = {
 *     enableFunction: function() {
 *         return window.location.hostname === "localhost";
 *     }
 * }
 */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
/**
* @memberof dbkjs.modules
* @exports onscreenkeyboard
* @todo Write the documentation.
*/
dbkjs.modules.onscreenkeyboard = {
    id: "dbk.module.onscreenkeyboard",
    register: function(options) {

        var opt;
        if(dbkjs.options.onscreenkeyboard) {
            opt = dbkjs.options.onscreenkeyboard;

            if(opt.enableFunction) {
                if(!opt.enableFunction()) {
                    return;
                }
            }
        }
        $('<div/>', { id: 'jsKeyboard'}).appendTo('body');

        $('<link/>', { rel: 'stylesheet', href: 'js/libs/jskeyboard/jsKeyboard.css',
            type: 'text/css', media: 'screen'})
                .appendTo('head');

        $.getScript("js/libs/jskeyboard/jsKeyboard.js", function() {

            if(opt && opt.debug) {
                jsKeyboard.debug = true;
            }
            jsKeyboard.init("jsKeyboard");
        });
    }
};
