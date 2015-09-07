/*
 * The MIT License (MIT)
 * 
 * Copyright © 2015 Sam Deering, http://samdeering.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included
 *   in all copies or substantial portions of the Software. 
 *  
 * Modified: 2015 Eddy Scheper, ARIS B.V.
 * 
 * jsKeyboard - v1.0
 * 
 * Usage:
 *      jsKeyboard.init(id);     // id is the id of the div element.
 *      
 * Features: 
 * - Sets keyboard position relative to the input element. When this is 
 *   positioned in the upper part of the page the keyboard is aligned to the
 *   bottom, when positioned in the lower part of the page the keyboard is
 *   aligned to the top of the page.
 * - When a key is pressed a keyup event is fired.
 * - Show debug messages with: jsKeyboard.debug = true;
 * - Allows keyboard toggle if input/button with id "jsKeyboardToggle" exists.
 * 
 */
var jsKeyboard = {
    keyboard: [], // different keyboards can be set to this variable in order to switch between keyboards easily.
    keyboardId: "", // it shows the html element where keyboard is generated.
    currentKeyboard: "default", // it shows which keyboard is used. If it's not set default keyboard is used.
    currentElement: null,
    debug: false,
    settings: {
        buttonClass: "button", // default button class.
        onclick: "jsKeyboard.write();", // default onclick event for button.
        keyClass: "key", // default key class used to define style of text of the button.
        toggleButtonId: "jsKeyboardToggle" // default id of toggle button.
    },
    init: function(id, keyboard) {
        var me = this;
        
        me.keyboard["default"] = me.defaultKeyboard;
        me.keyboardId = id;

        // Generate keyboard.
        if (keyboard !== null && keyboard !== undefined)
            me.generateKeyboard(keyboard);
        else
            me.generateKeyboard("default");

        // Install global mousedown handler.
        $(document).mousedown($.proxy(me.onDocumentMousedown,me));

        // Install onclick handler on the whole keyboard. Catches also the clicks on the keys.
        $("#"+me.keyboardId).click($.proxy(me.onKeyboardClick,me));
        
        // Install onclick handler on toggle button (if exists).
        $("#"+me.settings.toggleButtonId).click($.proxy(me.onToggleButtonClick,me));
    },
    dbMsg: function(msg) {
        if (this.debug)
            console.log(msg);
    },
    changeToSmallLetter: function() {
        $("#keyboardCapitalLetter,#keyboardNumber,#keyboardSymbols").css("display", "none");
        $("#keyboardSmallLetter").css("display", "block");
    },
    changeToCapitalLetter: function() {
        $("#keyboardCapitalLetter").css("display", "block");
        $("#keyboardSmallLetter,#keyboardNumber,#keyboardSymbols").css("display", "none");
    },
    changeToNumber: function() {
        $("#keyboardNumber").css("display", "block");
        $("#keyboardSymbols,#keyboardCapitalLetter,#keyboardSmallLetter").css("display", "none");
    },
    changeToSymbols: function() {
        $("#keyboardCapitalLetter,#keyboardNumber,#keyboardSmallLetter").css("display", "none");
        $("#keyboardSymbols").css("display", "block");
    },
    isInputElement: function($elem) {
        var type;
        if ($elem.is("textarea"))
            return true; 
       if (!$elem.is("input"))
            return false;
        if (!$elem.prop("type"))
            return false;
        type = $elem.prop("type").toUpperCase();
        // Some elements give input problems, they allow dropdown input, so no
        // keyboard input is required.
        if ((type==="TEXT") || 
            (type==="SEARCH") ||
            (type==="EMAIL") ||
            (type==="URL") ||
            (type==="PASSWORD") ||
            (type==="NUMBER") ||
            (type==="TEL") )
            return true;
        else 
            return false;
    },
    fireKeyUpEvent: function($elem,key) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("keyup", false, true);
        evt.keyCode = key;
        $elem[0].dispatchEvent(evt);
    },
    focus: function(t) {
        this.currentElement = $(t);
        this.show();
    },
    generateKeyboard: function(keyboard) {
        var me = this;
        var bClass = "";
        var kClass = "";
        var onclick = "";
        var text = "";
        var s = "";
        s += "<div id=\"keyboard\">";
        s += "<div id=\"keyboardHeader\">";
        s += "</div>";

        /*small letter */
        s += "<div id=\"keyboardSmallLetter\">";
        $.each(this.keyboard[keyboard].smallLetter, function(i, key) {
            generate(key);
        });
        s += "</div>";

        /*capital letter*/
        s += "<div id=\"keyboardCapitalLetter\">";
        $.each(this.keyboard[keyboard].capitalLetter, function(i, key) {
            generate(key);
        });
        s += "</div>";

        /*number*/
        s += "<div id=\"keyboardNumber\">";
        $.each(this.keyboard[keyboard].number, function(i, key) {
            generate(key);
        });
        s += "</div>";

        /*symbols*/
        s += "<div id=\"keyboardSymbols\">";
        $.each(this.keyboard[keyboard].symbols, function(i, key) {
            generate(key);
        });
        s += "</div>";

        function generate(key) {
            bClass = key.buttonClass === undefined ? me.settings.buttonClass : key.buttonClass;
            kClass = key.keyClass === undefined ? me.settings.keyClass : key.keyClass;
            onclick = key.onclick === undefined ? me.settings.onclick.replace("()", "(" + key.value + ")") : key.onclick;
            text = (key.isChar !== undefined || key.isChar === false) ? key.value : String.fromCharCode(key.value);
            s += "<div class=\"" + bClass + "\" onclick=\"" + onclick + "\"><div class=\"" + kClass + "\">" + text + "</div></div>";
            bClass = ""; kClass = ""; onclick = ""; text = "";
        }

        $("#" + this.keyboardId).html(s);
    },
    getElementType: function($elem) {
        var type = "<empty>";
        if ($elem.length===0) {
            return type;
        } else {
            type = $elem[0].tagName.toLowerCase();
            if (type==="input") {
                type = type + "/" + $elem.prop("type").toLowerCase();
            }
        }
        return type;
    },
    hide: function() {
        $("#"+this.keyboardId).hide();
    },
    isClickInKeyboard: function(evt) {
        var x,y;
        var x1,y1,x2,y2;
        var $elem = $("#"+ this.keyboardId);
        x = evt.pageX;
        y = evt.pageY;
        x1 = $elem.offset().left;
        y1 = $elem.offset().top;
        x2 = x1 + $elem.width();
        y2 = y1 + $elem.height();
        if ((x>=x1) && (y>=y1) && (x<=x2) && (y<=y2))
            return true;
        else
            return false;
    },
    isVisible: function() {
        if ($("#"+this.keyboardId).is(':visible'))
            return true;
        else
            return false;
    },
    onDocumentMousedown: function(evt) {
        var me = this;
        var $elem;
        this.dbMsg("document.mousedown");
        this.dbMsg(this.getElementType($(evt.target)));
        // Keyboard visible?
        if (this.isVisible()) {
            // Get current element.
            $elem = $(evt.target);
            if (this.isInputElement($elem)) {
                this.dbMsg("--isInputType");
                // Is it a Textbox etc.?
                this.currentElement = $elem;
                this.show();  // set position of keyboard.
                // The selection has not been made.
                // Finish mousedown event and set cursor position. The cursor
                // isn't on the right place jet.
                setTimeout(function(){
                    me.currentElementCursorPosition = $elem.getCursorPosition();
                }, 100);                
                
            } else if ($elem.attr("id")===this.settings.toggleButtonId) {
                this.dbMsg("--toggle");
                // Is it the Toggle button? Ignore, action will be handled by the button handler.
            } else {
                this.dbMsg("--else");
                // No click in keyboard?
                if (!this.isClickInKeyboard(evt)) {
                    // Hide the keyboard.
                    this.hide();
                }
            }
        } else {
            // Hidden. Get current element.
            $elem = $(evt.target);
            if (this.isInputElement($elem)) {
                this.dbMsg("--isInputType");
                this.currentElement = $elem;
                // Show keyboard.
                this.show();
                // The selection has not been made.
                setTimeout(function(){
                    me.currentElementCursorPosition = $elem.getCursorPosition();
                    me.dbMsg("pos: "+me.currentElementCursorPosition);
                }, 100);                
            }
        }
    },
    onKeyboardClick: function() {
        // Set back focus to the current element.
        if (this.currentElement) {
            this.currentElement.focus();
        }
    },
    onToggleButtonClick: function() {
        this.toggle();
    },
    setKeyboardPosition: function(position) {
        if (position==="top")
            $("#"+this.keyboardId).removeClass("keyboard_bottom").addClass("keyboard_top");
        else
            $("#"+this.keyboardId).removeClass("keyboard_top").addClass("keyboard_bottom");
    },
    show: function() {
        var position = "bottom";
        if (this.currentElement) {
            // Reposition keyboard relative to input element.
            var y = this.currentElement.offset().top;
            var h = $(document).height();
            if (y < (h/2))
                position = "bottom";
            else
                position = "top";
        };
        this.setKeyboardPosition(position);
        $("#"+this.keyboardId).show();
    },
    toggle: function() {
        var $elem;
        $elem = $("#"+this.keyboardId);
        if ($elem.is(':visible')) {
            $elem.hide();
        } else {
            $elem.show();
        }
    },
    updateCursor: function() {
        // Input cursor focus and position during typing.
        this.currentElement.setCursorPosition(this.currentElementCursorPosition);
    },
    write: function(m) {
        var a,b,pos,output;
        if (!this.currentElement)
            return;
        a = this.currentElement.val();
        b = String.fromCharCode(m);
        pos = this.currentElementCursorPosition;
        output = [a.slice(0, pos), b, a.slice(pos)].join('');
        this.currentElement.val(output);
        this.currentElementCursorPosition++; //+1 cursor
        this.updateCursor();
        // Fire keyup event.
        this.fireKeyUpEvent(this.currentElement,m);
    },
    write_Del: function() {
        var a,pos,output;
        if (!this.currentElement)
            return;
        a = this.currentElement.val();
        pos = this.currentElementCursorPosition;
        if (pos<=0) {
            this.currentElement.val(a);
        } else {
            output = [a.slice(0, pos-1), a.slice(pos)].join('');
            this.currentElement.val(output);
            this.currentElementCursorPosition--; //-1 cursor
        }
        this.updateCursor();
        // Fire keyup event.
        this.fireKeyUpEvent(this.currentElement,8);
    },
    write_Enter: function() {
        var a,pos,output;
        if (!this.currentElement)
            return;
        if (this.currentElement.is("textarea")) {
            a = this.currentElement.val();
            pos = this.currentElementCursorPosition;
            output = [a.slice(0, pos), "\n", a.slice(pos)].join('');
            this.currentElement.val(output);
            this.currentElementCursorPosition++; //+1 cursor
            this.updateCursor();
        }
        // Fire keyup event.
        this.fireKeyUpEvent(this.currentElement,13);
    },
    write_Space: function() {
        var a,b,pos,output;
        if (!this.currentElement)
            return;
        a = this.currentElement.val();
        b = " ";
        pos = this.currentElementCursorPosition;
        output = [a.slice(0, pos), b, a.slice(pos)].join('');
        this.currentElement.val(output);
        this.currentElementCursorPosition++; //+1 cursor
        this.updateCursor();
        // Fire keyup event.
        this.fireKeyUpEvent(this.currentElement,32);
    },
    writeSpecial: function(m) {
        var a,pos,output;
        if (!this.currentElement)
            return;
        a = this.currentElement.val();
        pos = this.currentElementCursorPosition;
        output = [a.slice(0, pos), m, a.slice(pos)].join('');
        this.currentElement.val(output);
        this.currentElementCursorPosition++; //+1 cursor
        this.updateCursor();
        // Fire keyup event.
        this.fireKeyUpEvent(this.currentElement,m);
    },
    defaultKeyboard: {
        capitalLetter:
            [
        // 1st row
               { value: 81 },{ value: 87 },{ value: 69 },{ value: 82 },{ value: 84 },{ value: 89 },
               { value: 85 },{ value: 73 },{ value: 79 },{ value: 80 },
               { value: "backspace", isChar: "false", onclick: "jsKeyboard.write_Del()", buttonClass: "button button_del", keyClass: "key key_del" },
        // 2nd row
               { value: 65, buttonClass: "button button_a" },{ value: 83 },{ value: 68 },{ value: 70 },
               { value: 71 },{ value: 72 },{ value: 74 },{ value: 75 },{ value: 76 },
               { value: "enter", isChar: "false", buttonClass: "button button_enter", onclick: "jsKeyboard.write_Enter();", keyClass: "key key_enter" },
        // 3rd row
               { value: "caps", isChar: "false", buttonClass: "button button_smallletter", onclick: "jsKeyboard.changeToSmallLetter();", keyClass: "key key_smallletter" },
               { value: 90 },{ value: 88 },{ value: 67 },{ value: 86 },{ value: 66 },{ value: 78 },
               { value: 77 },{ value: 44 },{ value: 46 },{ value: 64 },
        // 4th row
               { value: "123", isChar: "false", buttonClass: "button button_numberleft", onclick: "jsKeyboard.changeToNumber();", keyClass: "key key_number" },
               { value: "", isChar: "false", buttonClass: "button button_space", onclick: "jsKeyboard.write_Space();", keyClass: "key key_space" },
               { value: "#%+", isChar: "false", buttonClass: "button button_symbolsright", onclick: "jsKeyboard.changeToSymbols();", keyClass: "key key_symbols" },
               { value: "", isChar: "false", buttonClass: "button button_close", onclick: "jsKeyboard.hide();", keyClass: "key key_close" }
            ],
        smallLetter: [
        // 1st row
                { value: 113 },{ value: 119 },{ value: 101 },{ value: 114 },{ value: 116 },
                { value: 121 },{ value: 117 },{ value: 105 },{ value: 111 },{ value: 112 },
                { value: "backspace", isChar: "false", onclick: "jsKeyboard.write_Del()", buttonClass: "button button_del", keyClass: "key key_del" },
        // 2nd row
                { value: 97, buttonClass: "button button_a" },{ value: 115 },{ value: 100 },{ value: 102 },
                { value: 103 },{ value: 104 },{ value: 106 },{ value: 107 },{ value: 108 },
                { value: "enter", isChar: "false", buttonClass: "button button_enter", onclick: "jsKeyboard.write_Enter();", keyClass: "key key_enter" },
        // 3rd row
                { value: "caps", isChar: "false", buttonClass: "button button_capitalletterleft", onclick: "jsKeyboard.changeToCapitalLetter();", keyClass: "key key_capitalletterleft" },
                { value: 122 },{ value: 120 },{ value: 99 },{ value: 118 },{ value: 98 },
                { value: 110 },{ value: 109 },{ value: 44 },{ value: 46 },{ value: 64 },
        // 4th row
                { value: "123", isChar: "false", buttonClass: "button button_numberleft", onclick: "jsKeyboard.changeToNumber();", keyClass: "key key_number" },
                { value: "", isChar: "false", buttonClass: "button button_space", onclick: "jsKeyboard.write_Space();", keyClass: "key key_space" },
                { value: "#%+", isChar: "false", buttonClass: "button button_symbolsright", onclick: "jsKeyboard.changeToSymbols();", keyClass: "key key_symbols" },
                { value: "", isChar: "false", buttonClass: "button button_close", onclick: "jsKeyboard.hide();", keyClass: "key key_close" }
            ],
        number: [
        // 1st row
                { value: 49 },{ value: 50 },{ value: 51 },{ value: 52 },{ value: 53 },{ value: 54 },
                { value: 55 },{ value: 56 },{ value: 57 },{ value: 48 },
                { value: "backspace", isChar: "false", onclick: "jsKeyboard.write_Del()", buttonClass: "button button_del", keyClass: "key key_del" },
        // 2nd row
                { value: 45, buttonClass: "button button_dash" },{ value: 47 },{ value: 58 },{ value: 59 },
                { value: 40 },{ value: 41 },{ value: 36 },{ value: 38 },{ value: 64 },
                { value: "enter", isChar: "false", buttonClass: "button button_enter", onclick: "jsKeyboard.write_Enter();", keyClass: "key key_enter" },
        //3rd row
                { value: "", isChar: "false", buttonClass: "button button_capitalletterleft", onclick: "", keyClass: "key" },
                { value: 63 },{ value: 33 },{ value: 34 },{ value: 124 },{ value: 92 },{ value: 42 },{ value: 61 },{ value: 43 },
                { value: "", isChar: "false", buttonClass: "button", onclick: "", keyClass: "key" },
                { value: "", isChar: "false", buttonClass: "button", onclick: "", keyClass: "key" },
        // 4th row
                { value: "abc", isChar: "false", buttonClass: "button button_numberleft", onclick: "jsKeyboard.changeToSmallLetter();", keyClass: "key key_smallletter" },
                { value: "", isChar: "false", buttonClass: "button button_space", onclick: "jsKeyboard.write_Space();", keyClass: "key key_space" },
                { value: "#%+", isChar: "false", buttonClass: "button button_symbolsright", onclick: "jsKeyboard.changeToSymbols();", keyClass: "key key_symbols" },
                { value: "", isChar: "false", buttonClass: "button button_close", onclick: "jsKeyboard.hide();", keyClass: "key key_close" }
            ],
        symbols: [
        // 1st row
            { value: 91 },{ value: 93 },{ value: 123 },{ value: 125 },{ value: 35 },{ value: 37 },
            { value: 94 },{ value: 42 },{ value: 43 },{ value: 61 },
            { value: "backspace", isChar: "false", onclick: "jsKeyboard.write_Del()", buttonClass: "button button_del", keyClass: "key key_del" },
        // 2nd row
            { value: 95, buttonClass: "button button_underscore" },{ value: 92 },{ value: 124 },{ value: 126 },
            { value: 60 },{ value: 62 },
            { value: "&euro;", isChar: "false", onclick: "jsKeyboard.writeSpecial('&euro;');" },
            { value: 163 },{ value: 165 },
            { value: "enter", isChar: "false", buttonClass: "button button_enter", onclick: "jsKeyboard.write_Enter();", keyClass: "key key_enter" },
        // 3rd row
            { value: "", isChar: "false", buttonClass: "button button_capitalletterleft", onclick: "", keyClass: "key" },
            { value: 46 },{ value: 44 },{ value: 63 },{ value: 33 },{ value: 39 },{ value: 34 },{ value: 59 },{ value: 92 },
            { value: "", isChar: "false", buttonClass: "button", onclick: "", keyClass: "key" },
            { value: "", isChar: "false", buttonClass: "button", onclick: "", keyClass: "key" },
        // 4th row
            { value: "123", isChar: "false", buttonClass: "button button_numberleft", onclick: "jsKeyboard.changeToNumber();", keyClass: "key key_number" },
            { value: "", isChar: "false", buttonClass: "button button_space", onclick: "jsKeyboard.write_Space();", keyClass: "key key_space" },
            { value: "abc", isChar: "false", buttonClass: "button button_symbolsright", onclick: "jsKeyboard.changeToSmallLetter();", keyClass: "key key_smallletter" },
            { value: "", isChar: "false", buttonClass: "button button_close", onclick: "jsKeyboard.hide();", keyClass: "key key_close" }
         ]
    }
};

// GET CURSOR POSITION
jQuery.fn.getCursorPosition = function(){
    if (this.lengh === 0) return -1;
    return $(this).getSelectionStart();
};

// SET SELECTION START
jQuery.fn.getSelectionStart = function(){
    if (this.lengh === 0) return -1;
    var input = this[0];
    var pos = input.value.length;
    try {
        // selectionStart doesn't work with email/number inputs in Chrome.
        if ("selectionStart" in input) {
            pos = input.selectionStart;
        }
    } catch(e) {
    }
    return pos;
};

//SET CURSOR POSITION
jQuery.fn.setCursorPosition = function(pos) {
    this.each(function(index, elem) {
        if (elem.setSelectionRange) {
            try {
                // selectionStart doesn't work with email/number inputs in Chrome.
                elem.setSelectionRange(pos, pos);
            } catch(e) {
            }
        } else if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    });
    return this;
};
