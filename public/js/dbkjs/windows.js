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

/**
 * Modal window which takes up the entire screen. Automatically closed when
 * another modal window is shown, or a modal popup is shown (dbkjs event
 * modal_popup_show, see utils.js).
 *
 * Events:
 * show
 * hide
 * elements_created after createElements() completed
 * dbkjs modal_popup_show
 * @param {string} name
 * @returns {ModalDialog}
 */
function ModalWindow(name) {

    this.name = name;
    this.visible = false;
    this.popup = null;
}

/**
 * Create DOM elements, call after constructor.
 * @param {string} title not html encoded, use dbkjs.utils.htmlEncode() for user
 *   supplied data yourself. To change, use getTitleElement().
 * @returns {undefined}
 */
ModalWindow.prototype.createElements = function(title) {
    var me = this;
    this.popup = $('<div></div>')
        .addClass('modal-popup')
        .appendTo('body');
    $('<a></a>')
        .attr({
            'class': 'modal-popup-close',
            'href': '#'
        })
        .html('<i class="fa fa-arrow-left"></i> Terug')
        .on('click', function (e) {
            me.hide();
        })
        .appendTo(this.popup);

    this.titleElement = $('<div></div>')
        .addClass('modal-popup-title')
        .html(title || '')
        .appendTo(this.popup);

    this.view = $('<div></div>')
        .addClass('modal-popup-view')
        .appendTo(this.popup);

    $(dbkjs).on('modal_popup_show', function() {
        me.modalPopupShowEvent.apply(me, arguments);
    });

    $(this).triggerHandler('elements_created');
};

ModalWindow.prototype.modalPopupShowEvent = function(event, params) {
    // Hide ourselves when another popup is shown
    if(me.name !== params.popupName) {
        me.hide();
    }
};

ModalWindow.prototype.getName = function() {
    return this.name;
};

ModalWindow.prototype.getView = function() {
    return this.view;
};

ModalWindow.prototype.isVisible = function() {
    return this.visible;
};

ModalWindow.prototype.show = function() {
    // Event should cause other modal popups to hide
    $(dbkjs).trigger('modal_popup_show', {popupName: this.name});

    this.popup.css('width', '100%');
    this.visible = true;
    $(this).triggerHandler('show');
};

ModalWindow.prototype.hide = function() {
    if(this.isVisible()) {
        this.popup.css('width', '0%');
        this.visible = false;
        $(this).triggerHandler('hide');
    }
};

ModalWindow.prototype.toggle = function() {
    if(this.isVisible()) {
        this.hide();
    } else {
        this.show();
    }
}

ModalWindow.prototype.getTitleElement = function() {
    return this.titleElement;
};

/**
 * Split screen version of modal window. Split screen functionality can be
 * switched on/off on the fly.
 *
 * Events:
 * SplitScreenChange when split screen is changed (whether visible or not).
 *   Arguments are results of isSplitScreen() and isVisible().
 * @param {string} name
 * @returns {SplitScreenWindow}
 */
function SplitScreenWindow(name) {
    ModalWindow.call(this, name);
    this.splitScreen = dbkjs.options.splitScreenChecked;

    // XXX always, also fixes cannot click map next to buttons
    $(".main-button-group").css({paddingRight: "10px", width: "auto", float: "right", right: "0%"});

    // Listen to global event for user split screen setting
    var me = this;
    $(dbkjs).on('setting_changed_splitscreen', function(event, splitScreenEnabled) {
        me.setSplitScreen(splitScreenEnabled);
    });
};

SplitScreenWindow.prototype = Object.create(ModalWindow.prototype);
SplitScreenWindow.prototype.constructor = SplitScreenWindow;

SplitScreenWindow.prototype.createElements = function(title) {
    ModalWindow.prototype.createElements.call(this, title);
    $(this.popup).find("a.modal-popup-close").html('<i class="fa fa-arrow-left"/> Kaart');
};

SplitScreenWindow.prototype.isSplitScreen = function() {
    return this.isSplitScreen;
};

SplitScreenWindow.prototype.setSplitScreen = function(splitScreen) {
    if(splitScreen === this.splitScreen) {
        return;
    }
    var wasVisible = this.isVisible();
    if(wasVisible) {
        this.hide();
    }
    this.splitScreen = splitScreen;
    if(wasVisible) {
        this.show();
    }
    $(this.popup).find("a.modal-popup-close").html('<i class="fa fa-arrow-left"/> ' + (splitScreen ? 'Kaart' : 'Terug'));

    $(this).triggerHandler('splitScreenChange', splitScreen, this.visible);
};

SplitScreenWindow.prototype.modalPopupShowEvent = function(event, params) {
    if(params.popupName !== this.popupName) {
        this.hide(params.isSplitScreen);
    }
};

SplitScreenWindow.prototype.hide = function(noMapAdjust) {
    if(!this.isVisible()) {
        return;
    }
    if(!this.splitScreen) {
        ModalWindow.prototype.hide.call(this);
    } else {
        this.popup.css({width: "0%"});
        if(!noMapAdjust) {
            // XXX move to dbkjs event 'split_screen_hide'
            $(".main-button-group").css({right: "0%"});
            $("#vectorclickpanel").css({"width": "100%"});

            $("#mapc1map1").css({width: "100%"});
            // Needs OpenLayers 2.13.1 patch:
            // https://github.com/openlayers/openlayers/pull/1304
            dbkjs.map.updateSize();
        }

        this.visible = false;
        $(this).triggerHandler('hide');
    }
};

SplitScreenWindow.prototype.show = function() {
    if(this.isVisible()) {
        return;
    }
    if(!this.splitScreen) {
        ModalWindow.prototype.show.call(this);
    } else {
        // Event should cause other modal popups to hide
        // isSplitScreen means split screen dialog is shown, if other split
        // screen window is open do not adjust map width
        $(dbkjs).trigger('modal_popup_show', { popupName: this.name, isSplitScreen:  true});

        // XXX move to dbkjs event 'split_screen_show';
        $(".main-button-group").css({right: "45%"});
        $("#vectorclickpanel").css({"width": "55%"});

        $("#mapc1map1").css({width: "55%"});
        this.popup.css({width: "45%"});
        // Needs OpenLayers 2.13.1 patch:
        // https://github.com/openlayers/openlayers/issues/669
        dbkjs.map.updateSize();

        this.visible = true;
        $(this).triggerHandler('show');
    }
};
