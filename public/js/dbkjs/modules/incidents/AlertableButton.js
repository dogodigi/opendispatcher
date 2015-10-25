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

function AlertableButton(id, title, icon) {
    var me = this;
    me.id = id;
    me.icon = icon;

    me.i = $('<i class="fa fa-' + icon + '" style="width: 27.5px"></i>');
    me.a = $('<a></a>')
    .attr({
        'id': id,
        'class': 'btn btn-default navbar-btn',
        'href': '#',
        'title': title
    })
    .append(me.i)
    .click(function(e) {
        e.preventDefault();

        $(me).triggerHandler('click', id);
    })
    .prependTo('.layertoggle-btn-group');
}

AlertableButton.prototype.setAlerted = function(alert) {
    var me = this;
    if(alert) {
        $(me.a).css({color: 'red'});
        var $i = $(me.i);
        $i.removeClass("fa-" + me.icon).addClass("fa-exclamation");
        this.exclamationFlashInterval = window.setInterval(function() {
            if($i.hasClass("fa-" + me.icon)) {
                $i.removeClass("fa-" + me.icon).addClass("fa-exclamation");
            } else {
                $i.removeClass("fa-exclamation").addClass("fa-" + me.icon);
            }
        }, 1500);
    } else {
        $(me.a).css({color: 'black'});
        $(me.i).removeClass("fa-exclamation").addClass("fa-" + me.icon);
        if(me.exclamationFlashInterval) {
            window.clearInterval(me.exclamationFlashInterval);
            me.exclamationFlashInterval = null;
        }
    }
    me.alerted = alert;
};

AlertableButton.prototype.setIcon = function(icon) {
    var i = $(this.a).find("i");
    if(!i.hasClass("fa-exclamation")) {
        $(this.a).find("i").removeClass("fa-" + this.icon).addClass("fa-" + icon);
    }
    this.icon = icon;
};

