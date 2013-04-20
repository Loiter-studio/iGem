
(function() {
var __main_module_name__ = "main";
var __resources__ = {};
function __imageResource(data) { var img = new Image(); img.src = data; return img; };
var FLIP_Y_AXIS = false;
var ENABLE_WEB_GL = false;
var SHOW_REDRAW_REGIONS = false;

__resources__["/__builtin__/event.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*global module exports require*/
/*jslint white: true, undef: true, nomen: true, bitwise: true, regexp: true, newcap: true*/


/**
 * @namespace
 * Support for listening for and triggering events
 */
var event = {};

/**
 * @private
 * @ignore
 * Returns the event listener property of an object, creating it if it doesn't
 * already exist.
 *
 * @returns {Object}
 */
function getListeners(obj, eventName) {
    if (!obj.js_listeners_) {
        obj.js_listeners_ = {};
    }
    if (!eventName) {
        return obj.js_listeners_;
    }
    if (!obj.js_listeners_[eventName]) {
        obj.js_listeners_[eventName] = {};
    }
    return obj.js_listeners_[eventName];
}

/**
 * @private
 * @ignore
 * Keep track of the next ID for each new EventListener
 */
var eventID = 0;

/**
 * @class
 * Represents an event being listened to. You should not create instances of
 * this directly, it is instead returned by event.addListener
 *
 * @extends Object
 * 
 * @param {Object} source Object to listen to for an event
 * @param {String} eventName Name of the event to listen for
 * @param {Function} handler Callback to fire when the event triggers
 */
event.EventListener = function (source, eventName, handler) {
    /**
     * Object to listen to for an event
     * @type Object 
     */
    this.source = source;
    
    /**
     * Name of the event to listen for
     * @type String
     */
    this.eventName = eventName;

    /**
     * Callback to fire when the event triggers
     * @type Function
     */
    this.handler = handler;

    /**
     * Unique ID number for this instance
     * @type Integer 
     */
    this.id = ++eventID;

    getListeners(source, eventName)[this.id] = this;
};

/**
 * Register an event listener
 *
 * @param {Object} source Object to listen to for an event
 * @param {String} eventName Name of the event to listen for
 * @param {Function} handler Callback to fire when the event triggers
 *
 * @returns {event.EventListener} The event listener. Pass to removeListener to destroy it.
 */
event.addListener = function (source, eventName, handler) {
    return new event.EventListener(source, eventName, handler);
};

/**
 * Trigger an event. All listeners will be notified.
 *
 * @param {Object} source Object to trigger the event on
 * @param {String} eventName Name of the event to trigger
 */
event.trigger = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        args = Array.prototype.slice.call(arguments, 2),
        eventID,
        l;

    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            l = listeners[eventID];
            if (l) {
                l.handler.apply(undefined, args);
            }
        }
    }
};

/**
 * Remove a previously registered event listener
 *
 * @param {event.EventListener} listener EventListener to remove, as returned by event.addListener
 */
event.removeListener = function (listener) {
    delete getListeners(listener.source, listener.eventName)[listener.eventID];
};

/**
 * Remove a all event listeners for a given event
 *
 * @param {Object} source Object to remove listeners from
 * @param {String} eventName Name of event to remove listeners from
 */
event.clearListeners = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        eventID;


    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            var l = listeners[eventID];
            if (l) {
                event.removeListener(l);
            }
        }
    }
};

/**
 * Remove all event listeners on an object
 *
 * @param {Object} source Object to remove listeners from
 */
event.clearInstanceListeners = function (source, eventName) {
    var listeners = getListeners(source),
        eventID;

    for (eventName in listeners) {
        if (listeners.hasOwnProperty(eventName)) {
            var el = listeners[eventName];
            for (eventID in el) {
                if (el.hasOwnProperty(eventID)) {
                    var l = el[eventID];
                    if (l) {
                        event.removeListener(l);
                    }
                }
            }
        }
    }
};

module.exports = event;

}};
__resources__["/__builtin__/global.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event');


/**
 * @ignore
 */
function getAccessors(obj) {
    if (!obj.js_accessors_) {
        obj.js_accessors_ = {};
    }
    return obj.js_accessors_;
}

/**
 * @ignore
 */
function getBindings(obj) {
    if (!obj.js_bindings_) {
        obj.js_bindings_ = {};
    }
    return obj.js_bindings_;
}

/**
 * @ignore
 */
function addAccessor(obj, key, target, targetKey, noNotify) {
    getAccessors(obj)[key] = {
        key: targetKey,
        target: target
    };

    if (!noNotify) {
        obj.triggerChanged(key);
    }
}


/**
 * @ignore
 */
var objectID = 0;

/**
 * @class
 * A bindable object. Allows observing and binding to its properties.
 */
var BObject = function () {};
BObject.prototype = util.extend(BObject.prototype, /** @lends BObject# */{
    /**
     * Unique ID
     * @type Integer
     */
    _id: 0,
    

    /**
     * The constructor for subclasses. Overwrite this for any initalisation you
     * need to do.
     * @ignore
     */
    init: function () {},

    /**
     * Get a property from the object. Always use this instead of trying to
     * access the property directly. This will ensure all bindings, setters and
     * getters work correctly.
     * 
     * @param {String} key Name of property to get
     * @returns {*} Value of the property
     */
    get: function (key) {
        var accessor = getAccessors(this)[key];
        if (accessor) {
            return accessor.target.get(accessor.key);
        } else {
            // Call getting function
            if (this['get_' + key]) {
                return this['get_' + key]();
            }

            return this[key];
        }
    },


    /**
     * Set a property on the object. Always use this instead of trying to
     * access the property directly. This will ensure all bindings, setters and
     * getters work correctly.
     * 
     * @param {String} key Name of property to get
     * @param {*} value New value for the property
     */
    set: function (key, value) {
        var accessor = getAccessors(this)[key],
            oldVal = this.get(key);
        if (accessor) {
            accessor.target.set(accessor.key, value);
        } else {
            if (this['set_' + key]) {
                this['set_' + key](value);
            } else {
                this[key] = value;
            }
        }
        this.triggerChanged(key, oldVal);
    },

    /**
     * Set multiple propertys in one go
     *
     * @param {Object} kvp An Object where the key is a property name and the value is the value to assign to the property
     *
     * @example
     * var props = {
     *   monkey: 'ook',
     *   cat: 'meow',
     *   dog: 'woof'
     * };
     * foo.setValues(props);
     * console.log(foo.get('cat')); // Logs 'meow'
     */
    setValues: function (kvp) {
        for (var x in kvp) {
            if (kvp.hasOwnProperty(x)) {
                this.set(x, kvp[x]);
            }
        }
    },

    changed: function (key) {
    },

    /**
     * @private
     */
    notify: function (key, oldVal) {
        var accessor = getAccessors(this)[key];
        if (accessor) {
            accessor.target.notify(accessor.key, oldVal);
        }
    },

    /**
     * @private
     */
    triggerChanged: function(key, oldVal) {
        evt.trigger(this, key.toLowerCase() + '_changed', oldVal);
    },

    /**
     * Bind the value of a property on this object to that of another object so
     * they always have the same value. Setting the value on either object will update
     * the other too.
     *
     * @param {String} key Name of the property on this object that should be bound
     * @param {BOject} target Object to bind to
     * @param {String} [targetKey=key] Key on the target object to bind to
     * @param {Boolean} [noNotify=false] Set to true to prevent this object's property triggering a 'changed' event when adding the binding
     */
    bindTo: function (key, target, targetKey, noNotify) {
        targetKey = targetKey || key;
        var self = this;
        this.unbind(key);

        var oldVal = this.get(key);

        // When bound property changes, trigger a 'changed' event on this one too
        getBindings(this)[key] = evt.addListener(target, targetKey.toLowerCase() + '_changed', function (oldVal) {
            self.triggerChanged(key, oldVal);
        });

        addAccessor(this, key, target, targetKey, noNotify);
    },

    /**
     * Remove binding from a property which set setup using BObject#bindTo.
     *
     * @param {String} key Name of the property on this object to unbind
     */
    unbind: function (key) {
        var binding = getBindings(this)[key];
        if (!binding) {
            return;
        }

        delete getBindings(this)[key];
        evt.removeListener(binding);
        // Grab current value from bound property
        var val = this.get(key);
        delete getAccessors(this)[key];
        // Set bound value
        this[key] = val;
    },

    /**
     * Remove all bindings on this object
     */
    unbindAll: function () {
        var keys = [],
            bindings = getBindings(this);
        for (var k in bindings) {
            if (bindings.hasOwnProperty(k)) {
                this.unbind(k);
            }
        }
    },

    /**
     * Unique ID for this object
     * @getter id
     * @type Integer
     */
    get_id: function() {
        if (!this._id) {
            this._id = ++objectID;
        }

        return this._id;
    }
});


/**
 * Create a new instance of this object
 * @returns {BObject} New instance of this object
 */
BObject.create = function() {
    var ret = new this();
    ret.init.apply(ret, arguments);
    return ret;
};

/**
 * Create a new subclass by extending this one
 * @returns {Object} A new subclass of this object
 */
BObject.extend = function() {
    var newObj = function() {},
        args = [],
        i,
        x;

    // Copy 'class' methods
    for (x in this) {
        if (this.hasOwnProperty(x)) {
            newObj[x] = this[x];
        }
    }


    // Add given properties to the prototype
    newObj.prototype = util.beget(this.prototype);
    args.push(newObj.prototype);
    for (i = 0; i<arguments.length; i++) {
        args.push(arguments[i]);
    }
    util.extend.apply(null, args);

    newObj.superclass = this.prototype;
    // Create new instance
    return newObj;
};

/**
 * Get a property from the class. Always use this instead of trying to
 * access the property directly. This will ensure all bindings, setters and
 * getters work correctly.
 * 
 * @function
 * @param {String} key Name of property to get
 * @returns {*} Value of the property
 */
BObject.get = BObject.prototype.get;

/**
 * Set a property on the class. Always use this instead of trying to
 * access the property directly. This will ensure all bindings, setters and
 * getters work correctly.
 * 
 * @function
 * @param {String} key Name of property to get
 * @param {*} value New value for the property
 */
BObject.set = BObject.prototype.set;

var BArray = BObject.extend(/** @lends BArray# */{

    /**
     * @constructs 
     * A bindable array. Allows observing for changes made to its contents
     *
     * @extends BObject
     * @param {Array} [array=[]] A normal JS array to use for data
     */
    init: function (array) {
        this.array = array || [];
        this.set('length', this.array.length);
    },

    /**
     * Get an item
     *
     * @param {Integer} i Index to get item from
     * @returns {*} Value stored in the array at index 'i'
     */
    getAt: function (i) {
        return this.array[i];
    },

    /**
     * Set an item -- Overwrites any existing item at index
     *
     * @param {Integer} i Index to set item to
     * @param {*} value Value to assign to index
     */
    setAt: function (i, value) {
        var oldVal = this.array[i];
        this.array[i] = value;

        evt.trigger(this, 'set_at', i, oldVal);
    },

    /**
     * Insert a new item into the array without overwriting anything
     *
     * @param {Integer} i Index to insert item at
     * @param {*} value Value to insert
     */
    insertAt: function (i, value) {
        this.array.splice(i, 0, value);
        this.set('length', this.array.length);
        evt.trigger(this, 'insert_at', i);
    },

    /**
     * Remove item from the array and return it
     *
     * @param {Integer} i Index to remove
     * @returns {*} Value that was removed
     */
    removeAt: function (i) {
        var oldVal = this.array[i];
        this.array.splice(i, 1);
        this.set('length', this.array.length);
        evt.trigger(this, 'remove_at', i, oldVal);

        return oldVal;
    },

    /**
     * Get the internal Javascript Array instance
     *
     * @returns {Array} Internal Javascript Array
     */
    getArray: function () {
        return this.array;
    },

    /**
     * Append a value to the end of the array and return its new length
     *
     * @param {*} value Value to append to the array
     * @returns {Integer} New length of the array
     */
    push: function (value) {
        this.insertAt(this.array.length, value);
        return this.array.length;
    },

    /**
     * Remove value from the end of the array and return it
     *
     * @returns {*} Value that was removed
     */
    pop: function () {
        return this.removeAt(this.array.length - 1);
    }
});

exports.BObject = BObject;
exports.BArray = BArray;

}};
__resources__["/__builtin__/libs/JXGUtil.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @fileoverview Utilities for uncompressing and base64 decoding
 */

/** @namespace */
var JXG = {};

/**
  * @class Util class
  * Class for gunzipping, unzipping and base64 decoding of files.
  * It is used for reading GEONExT, Geogebra and Intergeo files.
  *
  * Only Huffman codes are decoded in gunzip.
  * The code is based on the source code for gunzip.c by Pasi Ojala 
  * @see <a href="http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c">http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c</a>
  * @see <a href="http://www.cs.tut.fi/~albert">http://www.cs.tut.fi/~albert</a>
  */
JXG.Util = {};
                                 
/**
 * Unzip zip files
 */
JXG.Util.Unzip = function (barray){
    var outputArr = [],
        output = "",
        debug = false,
        gpflags,
        files = 0,
        unzipped = [],
        crc,
        buf32k = new Array(32768),
        bIdx = 0,
        modeZIP=false,

        CRC, SIZE,
    
        bitReverse = [
        0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0,
        0x10, 0x90, 0x50, 0xd0, 0x30, 0xb0, 0x70, 0xf0,
        0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8,
        0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8,
        0x04, 0x84, 0x44, 0xc4, 0x24, 0xa4, 0x64, 0xe4,
        0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
        0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec,
        0x1c, 0x9c, 0x5c, 0xdc, 0x3c, 0xbc, 0x7c, 0xfc,
        0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2,
        0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2,
        0x0a, 0x8a, 0x4a, 0xca, 0x2a, 0xaa, 0x6a, 0xea,
        0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
        0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6,
        0x16, 0x96, 0x56, 0xd6, 0x36, 0xb6, 0x76, 0xf6,
        0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee,
        0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe,
        0x01, 0x81, 0x41, 0xc1, 0x21, 0xa1, 0x61, 0xe1,
        0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1,
        0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9,
        0x19, 0x99, 0x59, 0xd9, 0x39, 0xb9, 0x79, 0xf9,
        0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5,
        0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5,
        0x0d, 0x8d, 0x4d, 0xcd, 0x2d, 0xad, 0x6d, 0xed,
        0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd,
        0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3,
        0x13, 0x93, 0x53, 0xd3, 0x33, 0xb3, 0x73, 0xf3,
        0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb,
        0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb,
        0x07, 0x87, 0x47, 0xc7, 0x27, 0xa7, 0x67, 0xe7,
        0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7,
        0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef,
        0x1f, 0x9f, 0x5f, 0xdf, 0x3f, 0xbf, 0x7f, 0xff
    ],
    
    cplens = [
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
        35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
    ],

    cplext = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
        3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99
    ], /* 99==invalid */

    cpdist = [
        0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d,
        0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1,
        0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01,
        0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001
    ],

    cpdext = [
        0,  0,  0,  0,  1,  1,  2,  2,
        3,  3,  4,  4,  5,  5,  6,  6,
        7,  7,  8,  8,  9,  9, 10, 10,
        11, 11, 12, 12, 13, 13
    ],
    
    border = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
    
    bA = barray,

    bytepos=0,
    bitpos=0,
    bb = 1,
    bits=0,
    
    NAMEMAX = 256,
    
    nameBuf = [],
    
    fileout;
    
    function readByte(){
        bits+=8;
        if (bytepos<bA.length){
            //if (debug)
            //    document.write(bytepos+": "+bA[bytepos]+"<br>");
            return bA[bytepos++];
        } else
            return -1;
    };

    function byteAlign(){
        bb = 1;
    };
    
    function readBit(){
        var carry;
        bits++;
        carry = (bb & 1);
        bb >>= 1;
        if (bb==0){
            bb = readByte();
            carry = (bb & 1);
            bb = (bb>>1) | 0x80;
        }
        return carry;
    };

    function readBits(a) {
        var res = 0,
            i = a;
    
        while(i--) {
            res = (res<<1) | readBit();
        }
        if(a) {
            res = bitReverse[res]>>(8-a);
        }
        return res;
    };
        
    function flushBuffer(){
        //document.write('FLUSHBUFFER:'+buf32k);
        bIdx = 0;
    };
    function addBuffer(a){
        SIZE++;
        //CRC=updcrc(a,crc);
        buf32k[bIdx++] = a;
        outputArr.push(String.fromCharCode(a));
        //output+=String.fromCharCode(a);
        if(bIdx==0x8000){
            //document.write('ADDBUFFER:'+buf32k);
            bIdx=0;
        }
    };
    
    function HufNode() {
        this.b0=0;
        this.b1=0;
        this.jump = null;
        this.jumppos = -1;
    };

    var LITERALS = 288;
    
    var literalTree = new Array(LITERALS);
    var distanceTree = new Array(32);
    var treepos=0;
    var Places = null;
    var Places2 = null;
    
    var impDistanceTree = new Array(64);
    var impLengthTree = new Array(64);
    
    var len = 0;
    var fpos = new Array(17);
    fpos[0]=0;
    var flens;
    var fmax;
    
    function IsPat() {
        while (1) {
            if (fpos[len] >= fmax)
                return -1;
            if (flens[fpos[len]] == len)
                return fpos[len]++;
            fpos[len]++;
        }
    };

    function Rec() {
        var curplace = Places[treepos];
        var tmp;
        if (debug)
    		document.write("<br>len:"+len+" treepos:"+treepos);
        if(len==17) { //war 17
            return -1;
        }
        treepos++;
        len++;
    	
        tmp = IsPat();
        if (debug)
        	document.write("<br>IsPat "+tmp);
        if(tmp >= 0) {
            curplace.b0 = tmp;    /* leaf cell for 0-bit */
            if (debug)
            	document.write("<br>b0 "+curplace.b0);
        } else {
        /* Not a Leaf cell */
        curplace.b0 = 0x8000;
        if (debug)
        	document.write("<br>b0 "+curplace.b0);
        if(Rec())
            return -1;
        }
        tmp = IsPat();
        if(tmp >= 0) {
            curplace.b1 = tmp;    /* leaf cell for 1-bit */
            if (debug)
            	document.write("<br>b1 "+curplace.b1);
            curplace.jump = null;    /* Just for the display routine */
        } else {
            /* Not a Leaf cell */
            curplace.b1 = 0x8000;
            if (debug)
            	document.write("<br>b1 "+curplace.b1);
            curplace.jump = Places[treepos];
            curplace.jumppos = treepos;
            if(Rec())
                return -1;
        }
        len--;
        return 0;
    };

    function CreateTree(currentTree, numval, lengths, show) {
        var i;
        /* Create the Huffman decode tree/table */
        //document.write("<br>createtree<br>");
        if (debug)
        	document.write("currentTree "+currentTree+" numval "+numval+" lengths "+lengths+" show "+show);
        Places = currentTree;
        treepos=0;
        flens = lengths;
        fmax  = numval;
        for (i=0;i<17;i++)
            fpos[i] = 0;
        len = 0;
        if(Rec()) {
            //fprintf(stderr, "invalid huffman tree\n");
            if (debug)
            	alert("invalid huffman tree\n");
            return -1;
        }
        if (debug){
        	document.write('<br>Tree: '+Places.length);
        	for (var a=0;a<32;a++){
            	document.write("Places["+a+"].b0="+Places[a].b0+"<br>");
            	document.write("Places["+a+"].b1="+Places[a].b1+"<br>");
        	}
        }

        return 0;
    };
    
    function DecodeValue(currentTree) {
        var len, i,
            xtreepos=0,
            X = currentTree[xtreepos],
            b;

        /* decode one symbol of the data */
        while(1) {
            b=readBit();
            if (debug)
            	document.write("b="+b);
            if(b) {
                if(!(X.b1 & 0x8000)){
                	if (debug)
                    	document.write("ret1");
                    return X.b1;    /* If leaf node, return data */
                }
                X = X.jump;
                len = currentTree.length;
                for (i=0;i<len;i++){
                    if (currentTree[i]===X){
                        xtreepos=i;
                        break;
                    }
                }
                //xtreepos++;
            } else {
                if(!(X.b0 & 0x8000)){
                	if (debug)
                    	document.write("ret2");
                    return X.b0;    /* If leaf node, return data */
                }
                //X++; //??????????????????
                xtreepos++;
                X = currentTree[xtreepos];
            }
        }
        if (debug)
        	document.write("ret3");
        return -1;
    };
    
    function DeflateLoop() {
    var last, c, type, i, len;

    do {
        /*if((last = readBit())){
            fprintf(errfp, "Last Block: ");
        } else {
            fprintf(errfp, "Not Last Block: ");
        }*/
        last = readBit();
        type = readBits(2);
        switch(type) {
            case 0:
            	if (debug)
                	alert("Stored\n");
                break;
            case 1:
            	if (debug)
                	alert("Fixed Huffman codes\n");
                break;
            case 2:
            	if (debug)
                	alert("Dynamic Huffman codes\n");
                break;
            case 3:
            	if (debug)
                	alert("Reserved block type!!\n");
                break;
            default:
            	if (debug)
                	alert("Unexpected value %d!\n", type);
                break;
        }

        if(type==0) {
            var blockLen, cSum;

            // Stored 
            byteAlign();
            blockLen = readByte();
            blockLen |= (readByte()<<8);

            cSum = readByte();
            cSum |= (readByte()<<8);

            if(((blockLen ^ ~cSum) & 0xffff)) {
                document.write("BlockLen checksum mismatch\n");
            }
            while(blockLen--) {
                c = readByte();
                addBuffer(c);
            }
        } else if(type==1) {
            var j;

            /* Fixed Huffman tables -- fixed decode routine */
            while(1) {
            /*
                256    0000000        0
                :   :     :
                279    0010111        23
                0   00110000    48
                :    :      :
                143    10111111    191
                280 11000000    192
                :    :      :
                287 11000111    199
                144    110010000    400
                :    :       :
                255    111111111    511
    
                Note the bit order!
                */

            j = (bitReverse[readBits(7)]>>1);
            if(j > 23) {
                j = (j<<1) | readBit();    /* 48..255 */

                if(j > 199) {    /* 200..255 */
                    j -= 128;    /*  72..127 */
                    j = (j<<1) | readBit();        /* 144..255 << */
                } else {        /*  48..199 */
                    j -= 48;    /*   0..151 */
                    if(j > 143) {
                        j = j+136;    /* 280..287 << */
                        /*   0..143 << */
                    }
                }
            } else {    /*   0..23 */
                j += 256;    /* 256..279 << */
            }
            if(j < 256) {
                addBuffer(j);
                //document.write("out:"+String.fromCharCode(j));
                /*fprintf(errfp, "@%d %02x\n", SIZE, j);*/
            } else if(j == 256) {
                /* EOF */
                break;
            } else {
                var len, dist;

                j -= 256 + 1;    /* bytes + EOF */
                len = readBits(cplext[j]) + cplens[j];

                j = bitReverse[readBits(5)]>>3;
                if(cpdext[j] > 8) {
                    dist = readBits(8);
                    dist |= (readBits(cpdext[j]-8)<<8);
                } else {
                    dist = readBits(cpdext[j]);
                }
                dist += cpdist[j];

                /*fprintf(errfp, "@%d (l%02x,d%04x)\n", SIZE, len, dist);*/
                for(j=0;j<len;j++) {
                    var c = buf32k[(bIdx - dist) & 0x7fff];
                    addBuffer(c);
                }
            }
            } // while
        } else if(type==2) {
            var j, n, literalCodes, distCodes, lenCodes;
            var ll = new Array(288+32);    // "static" just to preserve stack
    
            // Dynamic Huffman tables 
    
            literalCodes = 257 + readBits(5);
            distCodes = 1 + readBits(5);
            lenCodes = 4 + readBits(4);
            //document.write("<br>param: "+literalCodes+" "+distCodes+" "+lenCodes+"<br>");
            for(j=0; j<19; j++) {
                ll[j] = 0;
            }
    
            // Get the decode tree code lengths
    
            //document.write("<br>");
            for(j=0; j<lenCodes; j++) {
                ll[border[j]] = readBits(3);
                //document.write(ll[border[j]]+" ");
            }
            //fprintf(errfp, "\n");
            //document.write('<br>ll:'+ll);
            len = distanceTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            if(CreateTree(distanceTree, 19, ll, 0)) {
                flushBuffer();
                return 1;
            }
            if (debug){
            	document.write("<br>distanceTree");
            	for(var a=0;a<distanceTree.length;a++){
                	document.write("<br>"+distanceTree[a].b0+" "+distanceTree[a].b1+" "+distanceTree[a].jump+" "+distanceTree[a].jumppos);
                	/*if (distanceTree[a].jumppos!=-1)
                    	document.write(" "+distanceTree[a].jump.b0+" "+distanceTree[a].jump.b1);
                	*/
            	}
            }
            //document.write('<BR>tree created');
    
            //read in literal and distance code lengths
            n = literalCodes + distCodes;
            i = 0;
            var z=-1;
            if (debug)
            	document.write("<br>n="+n+" bits: "+bits+"<br>");
            while(i < n) {
                z++;
                j = DecodeValue(distanceTree);
                if (debug)
                	document.write("<br>"+z+" i:"+i+" decode: "+j+"    bits "+bits+"<br>");
                if(j<16) {    // length of code in bits (0..15)
                       ll[i++] = j;
                } else if(j==16) {    // repeat last length 3 to 6 times 
                       var l;
                    j = 3 + readBits(2);
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    l = i ? ll[i-1] : 0;
                    while(j--) {
                        ll[i++] = l;
                    }
                } else {
                    if(j==17) {        // 3 to 10 zero length codes
                        j = 3 + readBits(3);
                    } else {        // j == 18: 11 to 138 zero length codes 
                        j = 11 + readBits(7);
                    }
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    while(j--) {
                        ll[i++] = 0;
                    }
                }
            }
            /*for(j=0; j<literalCodes+distCodes; j++) {
                //fprintf(errfp, "%d ", ll[j]);
                if ((j&7)==7)
                    fprintf(errfp, "\n");
            }
            fprintf(errfp, "\n");*/
            // Can overwrite tree decode tree as it is not used anymore
            len = literalTree.length;
            for (i=0; i<len; i++)
                literalTree[i]=new HufNode();
            if(CreateTree(literalTree, literalCodes, ll, 0)) {
                flushBuffer();
                return 1;
            }
            len = literalTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            var ll2 = new Array();
            for (i=literalCodes; i <ll.length; i++){
                ll2[i-literalCodes]=ll[i];
            }    
            if(CreateTree(distanceTree, distCodes, ll2, 0)) {
                flushBuffer();
                return 1;
            }
            if (debug)
           		document.write("<br>literalTree");
            while(1) {
                j = DecodeValue(literalTree);
                if(j >= 256) {        // In C64: if carry set
                    var len, dist;
                    j -= 256;
                    if(j == 0) {
                        // EOF
                        break;
                    }
                    j--;
                    len = readBits(cplext[j]) + cplens[j];
    
                    j = DecodeValue(distanceTree);
                    if(cpdext[j] > 8) {
                        dist = readBits(8);
                        dist |= (readBits(cpdext[j]-8)<<8);
                    } else {
                        dist = readBits(cpdext[j]);
                    }
                    dist += cpdist[j];
                    while(len--) {
                        var c = buf32k[(bIdx - dist) & 0x7fff];
                        addBuffer(c);
                    }
                } else {
                    addBuffer(j);
                }
            }
        }
    } while(!last);
    flushBuffer();

    byteAlign();
    return 0;
};

JXG.Util.Unzip.prototype.unzipFile = function(name) {
    var i;
	this.unzip();
	//alert(unzipped[0][1]);
	for (i=0;i<unzipped.length;i++){
		if(unzipped[i][1]==name) {
			return unzipped[i][0];
		}
	}
	
  };
    
    
JXG.Util.Unzip.prototype.unzip = function() {
	//convertToByteArray(input);
	if (debug)
		alert(bA);
	/*for (i=0;i<bA.length*8;i++){
		document.write(readBit());
		if ((i+1)%8==0)
			document.write(" ");
	}*/
	/*for (i=0;i<bA.length;i++){
		document.write(readByte()+" ");
		if ((i+1)%8==0)
			document.write(" ");
	}
	for (i=0;i<bA.length;i++){
		document.write(bA[i]+" ");
		if ((i+1)%16==0)
			document.write("<br>");
	}	
	*/
	//alert(bA);
	nextFile();
	return unzipped;
  };
    
 function nextFile(){
 	if (debug)
 		alert("NEXTFILE");
 	outputArr = [];
 	var tmp = [];
 	modeZIP = false;
	tmp[0] = readByte();
	tmp[1] = readByte();
	if (debug)
		alert("type: "+tmp[0]+" "+tmp[1]);
	if (tmp[0] == parseInt("78",16) && tmp[1] == parseInt("da",16)){ //GZIP
		if (debug)
			alert("GEONExT-GZIP");
		DeflateLoop();
		if (debug)
			alert(outputArr.join(''));
		unzipped[files] = new Array(2);
    	unzipped[files][0] = outputArr.join('');
    	unzipped[files][1] = "geonext.gxt";
    	files++;
	}
	if (tmp[0] == parseInt("1f",16) && tmp[1] == parseInt("8b",16)){ //GZIP
		if (debug)
			alert("GZIP");
		//DeflateLoop();
		skipdir();
		if (debug)
			alert(outputArr.join(''));
		unzipped[files] = new Array(2);
    	unzipped[files][0] = outputArr.join('');
    	unzipped[files][1] = "file";
    	files++;
	}
	if (tmp[0] == parseInt("50",16) && tmp[1] == parseInt("4b",16)){ //ZIP
		modeZIP = true;
		tmp[2] = readByte();
		tmp[3] = readByte();
		if (tmp[2] == parseInt("3",16) && tmp[3] == parseInt("4",16)){
			//MODE_ZIP
			tmp[0] = readByte();
			tmp[1] = readByte();
			if (debug)
				alert("ZIP-Version: "+tmp[1]+" "+tmp[0]/10+"."+tmp[0]%10);
			
			gpflags = readByte();
			gpflags |= (readByte()<<8);
			if (debug)
				alert("gpflags: "+gpflags);
			
			var method = readByte();
			method |= (readByte()<<8);
			if (debug)
				alert("method: "+method);
			
			readByte();
			readByte();
			readByte();
			readByte();
			
			var crc = readByte();
			crc |= (readByte()<<8);
			crc |= (readByte()<<16);
			crc |= (readByte()<<24);
			
			var compSize = readByte();
			compSize |= (readByte()<<8);
			compSize |= (readByte()<<16);
			compSize |= (readByte()<<24);
			
			var size = readByte();
			size |= (readByte()<<8);
			size |= (readByte()<<16);
			size |= (readByte()<<24);
			
			if (debug)
				alert("local CRC: "+crc+"\nlocal Size: "+size+"\nlocal CompSize: "+compSize);
			
			var filelen = readByte();
			filelen |= (readByte()<<8);
			
			var extralen = readByte();
			extralen |= (readByte()<<8);
			
			if (debug)
				alert("filelen "+filelen);
			i = 0;
			nameBuf = [];
			while (filelen--){ 
				var c = readByte();
				if (c == "/" | c ==":"){
					i = 0;
				} else if (i < NAMEMAX-1)
					nameBuf[i++] = String.fromCharCode(c);
			}
			if (debug)
				alert("nameBuf: "+nameBuf);
			
			//nameBuf[i] = "\0";
			if (!fileout)
				fileout = nameBuf;
			
			var i = 0;
			while (i < extralen){
				c = readByte();
				i++;
			}
				
			CRC = 0xffffffff;
			SIZE = 0;
			
			if (size = 0 && fileOut.charAt(fileout.length-1)=="/"){
				//skipdir
				if (debug)
					alert("skipdir");
			}
			if (method == 8){
				DeflateLoop();
				if (debug)
					alert(outputArr.join(''));
				unzipped[files] = new Array(2);
				unzipped[files][0] = outputArr.join('');
    			unzipped[files][1] = nameBuf.join('');
    			files++;
				//return outputArr.join('');
			}
			skipdir();
		}
	}
 };
	
function skipdir(){
    var crc, 
        tmp = [],
        compSize, size, os, i, c;
    
	if ((gpflags & 8)) {
		tmp[0] = readByte();
		tmp[1] = readByte();
		tmp[2] = readByte();
		tmp[3] = readByte();
		
		if (tmp[0] == parseInt("50",16) && 
            tmp[1] == parseInt("4b",16) && 
            tmp[2] == parseInt("07",16) && 
            tmp[3] == parseInt("08",16))
        {
            crc = readByte();
            crc |= (readByte()<<8);
            crc |= (readByte()<<16);
            crc |= (readByte()<<24);
		} else {
			crc = tmp[0] | (tmp[1]<<8) | (tmp[2]<<16) | (tmp[3]<<24);
		}
		
		compSize = readByte();
		compSize |= (readByte()<<8);
		compSize |= (readByte()<<16);
		compSize |= (readByte()<<24);
		
		size = readByte();
		size |= (readByte()<<8);
		size |= (readByte()<<16);
		size |= (readByte()<<24);
		
		if (debug)
			alert("CRC:");
	}

	if (modeZIP)
		nextFile();
	
	tmp[0] = readByte();
	if (tmp[0] != 8) {
		if (debug)
			alert("Unknown compression method!");
        return 0;	
	}
	
	gpflags = readByte();
	if (debug){
		if ((gpflags & ~(parseInt("1f",16))))
			alert("Unknown flags set!");
	}
	
	readByte();
	readByte();
	readByte();
	readByte();
	
	readByte();
	os = readByte();
	
	if ((gpflags & 4)){
		tmp[0] = readByte();
		tmp[2] = readByte();
		len = tmp[0] + 256*tmp[1];
		if (debug)
			alert("Extra field size: "+len);
		for (i=0;i<len;i++)
			readByte();
	}
	
	if ((gpflags & 8)){
		i=0;
		nameBuf=[];
		while (c=readByte()){
			if(c == "7" || c == ":")
				i=0;
			if (i<NAMEMAX-1)
				nameBuf[i++] = c;
		}
		//nameBuf[i] = "\0";
		if (debug)
			alert("original file name: "+nameBuf);
	}
		
	if ((gpflags & 16)){
		while (c=readByte()){
			//FILE COMMENT
		}
	}
	
	if ((gpflags & 2)){
		readByte();
		readByte();
	}
	
	DeflateLoop();
	
	crc = readByte();
	crc |= (readByte()<<8);
	crc |= (readByte()<<16);
	crc |= (readByte()<<24);
	
	size = readByte();
	size |= (readByte()<<8);
	size |= (readByte()<<16);
	size |= (readByte()<<24);
	
	if (modeZIP)
		nextFile();
	
};

};

/**
*  Base64 encoding / decoding
*  @see <a href="http://www.webtoolkit.info/">http://www.webtoolkit.info/</A>
*/
JXG.Util.Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = [],
            chr1, chr2, chr3, enc1, enc2, enc3, enc4,
            i = 0;

        input = JXG.Util.Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output.push([this._keyStr.charAt(enc1),
                         this._keyStr.charAt(enc2),
                         this._keyStr.charAt(enc3),
                         this._keyStr.charAt(enc4)].join(''));
        }

        return output.join('');
    },

    // public method for decoding
    decode : function (input, utf8) {
        var output = [],
            chr1, chr2, chr3,
            enc1, enc2, enc3, enc4,
            i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output.push(String.fromCharCode(chr1));

            if (enc3 != 64) {
                output.push(String.fromCharCode(chr2));
            }
            if (enc4 != 64) {
                output.push(String.fromCharCode(chr3));
            }
        }
        
        output = output.join(''); 
        
        if (utf8) {
            output = JXG.Util.Base64._utf8_decode(output);
        }
        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = [],
            i = 0,
            c = 0, c2 = 0, c3 = 0;

        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string.push(String.fromCharCode(c));
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
                i += 3;
            }
        }
        return string.join('');
    },
    
    _destrip: function (stripped, wrap){
        var lines = [], lineno, i,
            destripped = [];
        
        if (wrap==null) 
            wrap = 76;
            
        stripped.replace(/ /g, "");
        lineno = stripped.length / wrap;
        for (i = 0; i < lineno; i++)
            lines[i]=stripped.substr(i * wrap, wrap);
        if (lineno != stripped.length / wrap)
            lines[lines.length]=stripped.substr(lineno * wrap, stripped.length-(lineno * wrap));
            
        for (i = 0; i < lines.length; i++)
            destripped.push(lines[i]);
        return destripped.join('\n');
    },
    
    decodeAsArray: function (input){
        var dec = this.decode(input),
            ar = [], i;
        for (i=0;i<dec.length;i++){
            ar[i]=dec.charCodeAt(i);
        }
        return ar;
    },
    
    decodeGEONExT : function (input) {
        return decodeAsArray(destrip(input),false);
    }
};

/**
 * @private
 */
JXG.Util.asciiCharCodeAt = function(str,i){
	var c = str.charCodeAt(i);
	if (c>255){
    	switch (c) {
			case 8364: c=128;
	    	break;
	    	case 8218: c=130;
	    	break;
	    	case 402: c=131;
	    	break;
	    	case 8222: c=132;
	    	break;
	    	case 8230: c=133;
	    	break;
	    	case 8224: c=134;
	    	break;
	    	case 8225: c=135;
	    	break;
	    	case 710: c=136;
	    	break;
	    	case 8240: c=137;
	    	break;
	    	case 352: c=138;
	    	break;
	    	case 8249: c=139;
	    	break;
	    	case 338: c=140;
	    	break;
	    	case 381: c=142;
	    	break;
	    	case 8216: c=145;
	    	break;
	    	case 8217: c=146;
	    	break;
	    	case 8220: c=147;
	    	break;
	    	case 8221: c=148;
	    	break;
	    	case 8226: c=149;
	    	break;
	    	case 8211: c=150;
	    	break;
	    	case 8212: c=151;
	    	break;
	    	case 732: c=152;
	    	break;
	    	case 8482: c=153;
	    	break;
	    	case 353: c=154;
	    	break;
	    	case 8250: c=155;
	    	break;
	    	case 339: c=156;
	    	break;
	    	case 382: c=158;
	    	break;
	    	case 376: c=159;
	    	break;
	    	default:
	    	break;
	    }
	}
	return c;
};

/**
 * Decoding string into utf-8
 * @param {String} string to decode
 * @return {String} utf8 decoded string
 */
JXG.Util.utf8Decode = function(utftext) {
  var string = [];
  var i = 0;
  var c = 0, c1 = 0, c2 = 0;

  while ( i < utftext.length ) {
    c = utftext.charCodeAt(i);

    if (c < 128) {
      string.push(String.fromCharCode(c));
      i++;
    } else if((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i+1);
      string.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i+1);
      c3 = utftext.charCodeAt(i+2);
      string.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
      i += 3;
    }
  };
  return string.join('');
};

// Added to exports for Cocos2d
module.exports = JXG;

}};
__resources__["/__builtin__/libs/Plist.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * XML Node types
 */
var ELEMENT_NODE                = 1,
    ATTRIBUTE_NODE              = 2,
    TEXT_NODE                   = 3,
    CDATA_SECTION_NODE          = 4,
    ENTITY_REFERENCE_NODE       = 5,
    ENTITY_NODE                 = 6,
    PROCESSING_INSTRUCTION_NODE = 7,
    COMMENT_NODE                = 8,
    DOCUMENT_NODE               = 9,
    DOCUMENT_TYPE_NODE          = 10,
    DOCUMENT_FRAGMENT_NODE      = 11,
    NOTATION_NODE               = 12;


var Plist = BObject.extend (/** @lends Plist# */{
    /**
     * The unserialized data inside the Plist file
     * @type Object
     */
    data: null,

    /**
     * An object representation of an XML Property List file
     *
     * @constructs
     * @extends BObject
     * @param {Options} opts Options
     * @config {String} [file] The path to a .plist file
     * @config {String} [data] The contents of a .plist file
     */
    init: function(opts) {
        var file = opts['file'],
            data = opts['data'];

        if (file && !data) {
            data = resource(file);
        }


        var parser = new DOMParser(),
            doc = parser.parseFromString(data, 'text/xml'),
            plist = doc.documentElement;

        if (plist.tagName != 'plist') {
            throw "Not a plist file";
        }


        // Get first real node
        var node = null;
        for (var i = 0, len = plist.childNodes.length; i < len; i++) {
            node = plist.childNodes[i];
            if (node.nodeType == ELEMENT_NODE) {
                break;
            }
        }

        this.set('data', this.parseNode_(node));
    },


    /**
     * @private
     * Parses an XML node inside the Plist file
     * @returns {Object/Array/String/Integer/Float} A JS representation of the node value
     */
    parseNode_: function(node) {
        var data = null;
        switch(node.tagName) {
        case 'dict':
            data = this.parseDict_(node); 
            break;
        case 'array':
            data = this.parseArray_(node); 
            break;
        case 'string':
            // FIXME - This needs to handle Firefox's 4KB nodeValue limit
            data = node.firstChild.nodeValue;
            break
        case 'false':
            data = false;
            break
        case 'true':
            data = true;
            break
        case 'real':
            data = parseFloat(node.firstChild.nodeValue);
            break
        case 'integer':
            data = parseInt(node.firstChild.nodeValue, 10);
            break
        }

        return data;
    },

    /**
     * @private
     * Parses a <dict> node in a plist file
     *
     * @param {XMLElement}
     * @returns {Object} A simple key/value JS Object representing the <dict>
     */
    parseDict_: function(node) {
        var data = {};

        var key = null;
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != ELEMENT_NODE) {
                continue;
            }

            // Grab the key, next noe should be the value
            if (child.tagName == 'key') {
                key = child.firstChild.nodeValue;
            } else {
                // Parse the value node
                data[key] = this.parseNode_(child);
            }
        }


        return data;
    },

    /**
     * @private
     * Parses an <array> node in a plist file
     *
     * @param {XMLElement}
     * @returns {Array} A simple JS Array representing the <array>
     */
    parseArray_: function(node) {
        var data = [];

        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != ELEMENT_NODE) {
                continue;
            }

            data.push(this.parseNode_(child));
        }

        return data;
    }
});


exports.Plist = Plist;

}};
__resources__["/__builtin__/libs/base64.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * Thin wrapper around JXG's Base64 utils
 */

/** @ignore */
var JXG = require('JXGUtil');

/** @namespace */
var base64 = {
    /**
     * Decode a base64 encoded string into a binary string
     *
     * @param {String} input Base64 encoded data
     * @returns {String} Binary string
     */
    decode: function(input) {
        return JXG.Util.Base64.decode(input);
    },

    /**
     * Decode a base64 encoded string into a byte array
     *
     * @param {String} input Base64 encoded data
     * @returns {Integer[]} Array of bytes
     */
    decodeAsArray: function(input, bytes) {
        bytes = bytes || 1;

        var dec = JXG.Util.Base64.decode(input),
            ar = [], i, j, len;

        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    },

    /**
     * Encode a binary string into base64
     *
     * @param {String} input Binary string
     * @returns {String} Base64 encoded data
     */
    encode: function(input) {
        return JXG.Util.Base64.encode(input);
    }
};

module.exports = base64;

}};
__resources__["/__builtin__/libs/box2d.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
function extend(a, b) {
  for(var c in b) {
    a[c] = b[c]
  }
}
function isInstanceOf(obj, _constructor) {
  while(typeof obj === "object") {
    if(obj.constructor === _constructor) {
      return true
    }
    obj = obj._super
  }
  return false
}
;var b2BoundValues = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BoundValues.prototype.__constructor = function() {
  this.lowerValues = new Array;
  this.lowerValues[0] = 0;
  this.lowerValues[1] = 0;
  this.upperValues = new Array;
  this.upperValues[0] = 0;
  this.upperValues[1] = 0
};
b2BoundValues.prototype.__varz = function() {
};
b2BoundValues.prototype.lowerValues = null;
b2BoundValues.prototype.upperValues = null;var b2PairManager = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2PairManager.prototype.__constructor = function() {
  this.m_pairs = new Array;
  this.m_pairBuffer = new Array;
  this.m_pairCount = 0;
  this.m_pairBufferCount = 0;
  this.m_freePair = null
};
b2PairManager.prototype.__varz = function() {
};
b2PairManager.prototype.AddPair = function(proxy1, proxy2) {
  var pair = proxy1.pairs[proxy2];
  if(pair != null) {
    return pair
  }
  if(this.m_freePair == null) {
    this.m_freePair = new b2Pair;
    this.m_pairs.push(this.m_freePair)
  }
  pair = this.m_freePair;
  this.m_freePair = pair.next;
  pair.proxy1 = proxy1;
  pair.proxy2 = proxy2;
  pair.status = 0;
  pair.userData = null;
  pair.next = null;
  proxy1.pairs[proxy2] = pair;
  proxy2.pairs[proxy1] = pair;
  ++this.m_pairCount;
  return pair
};
b2PairManager.prototype.RemovePair = function(proxy1, proxy2) {
  var pair = proxy1.pairs[proxy2];
  if(pair == null) {
    return null
  }
  var userData = pair.userData;
  delete proxy1.pairs[proxy2];
  delete proxy2.pairs[proxy1];
  pair.next = this.m_freePair;
  pair.proxy1 = null;
  pair.proxy2 = null;
  pair.userData = null;
  pair.status = 0;
  this.m_freePair = pair;
  --this.m_pairCount;
  return userData
};
b2PairManager.prototype.Find = function(proxy1, proxy2) {
  return proxy1.pairs[proxy2]
};
b2PairManager.prototype.ValidateBuffer = function() {
};
b2PairManager.prototype.ValidateTable = function() {
};
b2PairManager.prototype.Initialize = function(broadPhase) {
  this.m_broadPhase = broadPhase
};
b2PairManager.prototype.AddBufferedPair = function(proxy1, proxy2) {
  var pair = this.AddPair(proxy1, proxy2);
  if(pair.IsBuffered() == false) {
    pair.SetBuffered();
    this.m_pairBuffer[this.m_pairBufferCount] = pair;
    ++this.m_pairBufferCount
  }
  pair.ClearRemoved();
  if(b2BroadPhase.s_validate) {
    this.ValidateBuffer()
  }
};
b2PairManager.prototype.RemoveBufferedPair = function(proxy1, proxy2) {
  var pair = this.Find(proxy1, proxy2);
  if(pair == null) {
    return
  }
  if(pair.IsBuffered() == false) {
    pair.SetBuffered();
    this.m_pairBuffer[this.m_pairBufferCount] = pair;
    ++this.m_pairBufferCount
  }
  pair.SetRemoved();
  if(b2BroadPhase.s_validate) {
    this.ValidateBuffer()
  }
};
b2PairManager.prototype.Commit = function(callback) {
  var i = 0;
  var removeCount = 0;
  for(i = 0;i < this.m_pairBufferCount;++i) {
    var pair = this.m_pairBuffer[i];
    pair.ClearBuffered();
    var proxy1 = pair.proxy1;
    var proxy2 = pair.proxy2;
    if(pair.IsRemoved()) {
    }else {
      if(pair.IsFinal() == false) {
        callback(proxy1.userData, proxy2.userData)
      }
    }
  }
  this.m_pairBufferCount = 0;
  if(b2BroadPhase.s_validate) {
    this.ValidateTable()
  }
};
b2PairManager.prototype.m_broadPhase = null;
b2PairManager.prototype.m_pairs = null;
b2PairManager.prototype.m_freePair = null;
b2PairManager.prototype.m_pairCount = 0;
b2PairManager.prototype.m_pairBuffer = null;
b2PairManager.prototype.m_pairBufferCount = 0;var b2TimeStep = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TimeStep.prototype.__constructor = function() {
};
b2TimeStep.prototype.__varz = function() {
};
b2TimeStep.prototype.Set = function(step) {
  this.dt = step.dt;
  this.inv_dt = step.inv_dt;
  this.positionIterations = step.positionIterations;
  this.velocityIterations = step.velocityIterations;
  this.warmStarting = step.warmStarting
};
b2TimeStep.prototype.dt = null;
b2TimeStep.prototype.inv_dt = null;
b2TimeStep.prototype.dtRatio = null;
b2TimeStep.prototype.velocityIterations = 0;
b2TimeStep.prototype.positionIterations = 0;
b2TimeStep.prototype.warmStarting = null;var b2Controller = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Controller.prototype.__constructor = function() {
};
b2Controller.prototype.__varz = function() {
};
b2Controller.prototype.Step = function(step) {
};
b2Controller.prototype.Draw = function(debugDraw) {
};
b2Controller.prototype.AddBody = function(body) {
  var edge = new b2ControllerEdge;
  edge.controller = this;
  edge.body = body;
  edge.nextBody = m_bodyList;
  edge.prevBody = null;
  m_bodyList = edge;
  if(edge.nextBody) {
    edge.nextBody.prevBody = edge
  }
  m_bodyCount++;
  edge.nextController = body.m_controllerList;
  edge.prevController = null;
  body.m_controllerList = edge;
  if(edge.nextController) {
    edge.nextController.prevController = edge
  }
  body.m_controllerCount++
};
b2Controller.prototype.RemoveBody = function(body) {
  var edge = body.m_controllerList;
  while(edge && edge.controller != this) {
    edge = edge.nextController
  }
  if(edge.prevBody) {
    edge.prevBody.nextBody = edge.nextBody
  }
  if(edge.nextBody) {
    edge.nextBody.prevBody = edge.prevBody
  }
  if(edge.nextController) {
    edge.nextController.prevController = edge.prevController
  }
  if(edge.prevController) {
    edge.prevController.nextController = edge.nextController
  }
  if(m_bodyList == edge) {
    m_bodyList = edge.nextBody
  }
  if(body.m_controllerList == edge) {
    body.m_controllerList = edge.nextController
  }
  body.m_controllerCount--;
  m_bodyCount--
};
b2Controller.prototype.Clear = function() {
  while(m_bodyList) {
    this.RemoveBody(m_bodyList.body)
  }
};
b2Controller.prototype.GetNext = function() {
  return this.m_next
};
b2Controller.prototype.GetWorld = function() {
  return this.m_world
};
b2Controller.prototype.GetBodyList = function() {
  return m_bodyList
};
b2Controller.prototype.m_next = null;
b2Controller.prototype.m_prev = null;
b2Controller.prototype.m_world = null;var b2GravityController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GravityController.prototype, b2Controller.prototype);
b2GravityController.prototype._super = b2Controller.prototype;
b2GravityController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2GravityController.prototype.__varz = function() {
};
b2GravityController.prototype.Step = function(step) {
  var i = null;
  var body1 = null;
  var p1 = null;
  var mass1 = 0;
  var j = null;
  var body2 = null;
  var p2 = null;
  var dx = 0;
  var dy = 0;
  var r2 = 0;
  var f = null;
  if(this.invSqr) {
    for(i = m_bodyList;i;i = i.nextBody) {
      body1 = i.body;
      p1 = body1.GetWorldCenter();
      mass1 = body1.GetMass();
      for(j = m_bodyList;j != i;j = j.nextBody) {
        body2 = j.body;
        p2 = body2.GetWorldCenter();
        dx = p2.x - p1.x;
        dy = p2.y - p1.y;
        r2 = dx * dx + dy * dy;
        if(r2 < Number.MIN_VALUE) {
          continue
        }
        f = new b2Vec2(dx, dy);
        f.Multiply(this.G / r2 / Math.sqrt(r2) * mass1 * body2.GetMass());
        if(body1.IsAwake()) {
          body1.ApplyForce(f, p1)
        }
        f.Multiply(-1);
        if(body2.IsAwake()) {
          body2.ApplyForce(f, p2)
        }
      }
    }
  }else {
    for(i = m_bodyList;i;i = i.nextBody) {
      body1 = i.body;
      p1 = body1.GetWorldCenter();
      mass1 = body1.GetMass();
      for(j = m_bodyList;j != i;j = j.nextBody) {
        body2 = j.body;
        p2 = body2.GetWorldCenter();
        dx = p2.x - p1.x;
        dy = p2.y - p1.y;
        r2 = dx * dx + dy * dy;
        if(r2 < Number.MIN_VALUE) {
          continue
        }
        f = new b2Vec2(dx, dy);
        f.Multiply(this.G / r2 * mass1 * body2.GetMass());
        if(body1.IsAwake()) {
          body1.ApplyForce(f, p1)
        }
        f.Multiply(-1);
        if(body2.IsAwake()) {
          body2.ApplyForce(f, p2)
        }
      }
    }
  }
};
b2GravityController.prototype.G = 1;
b2GravityController.prototype.invSqr = true;var b2DestructionListener = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DestructionListener.prototype.__constructor = function() {
};
b2DestructionListener.prototype.__varz = function() {
};
b2DestructionListener.prototype.SayGoodbyeJoint = function(joint) {
};
b2DestructionListener.prototype.SayGoodbyeFixture = function(fixture) {
};var b2ContactEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactEdge.prototype.__constructor = function() {
};
b2ContactEdge.prototype.__varz = function() {
};
b2ContactEdge.prototype.other = null;
b2ContactEdge.prototype.contact = null;
b2ContactEdge.prototype.prev = null;
b2ContactEdge.prototype.next = null;var b2EdgeChainDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2EdgeChainDef.prototype.__constructor = function() {
  this.vertexCount = 0;
  this.isALoop = true;
  this.vertices = []
};
b2EdgeChainDef.prototype.__varz = function() {
};
b2EdgeChainDef.prototype.vertices = null;
b2EdgeChainDef.prototype.vertexCount = null;
b2EdgeChainDef.prototype.isALoop = null;var b2Vec2 = function(x_, y_) {
  if(arguments.length == 2) {
    this.x = x_;
    this.y = y_
  }
};
b2Vec2.Make = function(x_, y_) {
  return new b2Vec2(x_, y_)
};
b2Vec2.prototype.SetZero = function() {
  this.x = 0;
  this.y = 0
};
b2Vec2.prototype.Set = function(x_, y_) {
  this.x = x_;
  this.y = y_
};
b2Vec2.prototype.SetV = function(v) {
  this.x = v.x;
  this.y = v.y
};
b2Vec2.prototype.GetNegative = function() {
  return new b2Vec2(-this.x, -this.y)
};
b2Vec2.prototype.NegativeSelf = function() {
  this.x = -this.x;
  this.y = -this.y
};
b2Vec2.prototype.Copy = function() {
  return new b2Vec2(this.x, this.y)
};
b2Vec2.prototype.Add = function(v) {
  this.x += v.x;
  this.y += v.y
};
b2Vec2.prototype.Subtract = function(v) {
  this.x -= v.x;
  this.y -= v.y
};
b2Vec2.prototype.Multiply = function(a) {
  this.x *= a;
  this.y *= a
};
b2Vec2.prototype.MulM = function(A) {
  var tX = this.x;
  this.x = A.col1.x * tX + A.col2.x * this.y;
  this.y = A.col1.y * tX + A.col2.y * this.y
};
b2Vec2.prototype.MulTM = function(A) {
  var tX = b2Math.Dot(this, A.col1);
  this.y = b2Math.Dot(this, A.col2);
  this.x = tX
};
b2Vec2.prototype.CrossVF = function(s) {
  var tX = this.x;
  this.x = s * this.y;
  this.y = -s * tX
};
b2Vec2.prototype.CrossFV = function(s) {
  var tX = this.x;
  this.x = -s * this.y;
  this.y = s * tX
};
b2Vec2.prototype.MinV = function(b) {
  this.x = this.x < b.x ? this.x : b.x;
  this.y = this.y < b.y ? this.y : b.y
};
b2Vec2.prototype.MaxV = function(b) {
  this.x = this.x > b.x ? this.x : b.x;
  this.y = this.y > b.y ? this.y : b.y
};
b2Vec2.prototype.Abs = function() {
  if(this.x < 0) {
    this.x = -this.x
  }
  if(this.y < 0) {
    this.y = -this.y
  }
};
b2Vec2.prototype.Length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y)
};
b2Vec2.prototype.LengthSquared = function() {
  return this.x * this.x + this.y * this.y
};
b2Vec2.prototype.Normalize = function() {
  var length = Math.sqrt(this.x * this.x + this.y * this.y);
  if(length < Number.MIN_VALUE) {
    return 0
  }
  var invLength = 1 / length;
  this.x *= invLength;
  this.y *= invLength;
  return length
};
b2Vec2.prototype.IsValid = function() {
  return b2Math.IsValid(this.x) && b2Math.IsValid(this.y)
};
b2Vec2.prototype.x = 0;
b2Vec2.prototype.y = 0;var b2Vec3 = function(x, y, z) {
  if(arguments.length == 3) {
    this.x = x;
    this.y = y;
    this.z = z
  }
};
b2Vec3.prototype.SetZero = function() {
  this.x = this.y = this.z = 0
};
b2Vec3.prototype.Set = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z
};
b2Vec3.prototype.SetV = function(v) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z
};
b2Vec3.prototype.GetNegative = function() {
  return new b2Vec3(-this.x, -this.y, -this.z)
};
b2Vec3.prototype.NegativeSelf = function() {
  this.x = -this.x;
  this.y = -this.y;
  this.z = -this.z
};
b2Vec3.prototype.Copy = function() {
  return new b2Vec3(this.x, this.y, this.z)
};
b2Vec3.prototype.Add = function(v) {
  this.x += v.x;
  this.y += v.y;
  this.z += v.z
};
b2Vec3.prototype.Subtract = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  this.z -= v.z
};
b2Vec3.prototype.Multiply = function(a) {
  this.x *= a;
  this.y *= a;
  this.z *= a
};
b2Vec3.prototype.x = 0;
b2Vec3.prototype.y = 0;
b2Vec3.prototype.z = 0;var b2DistanceProxy = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceProxy.prototype.__constructor = function() {
};
b2DistanceProxy.prototype.__varz = function() {
};
b2DistanceProxy.prototype.Set = function(shape) {
  switch(shape.GetType()) {
    case b2Shape.e_circleShape:
      var circle = shape;
      this.m_vertices = new Array(1);
      this.m_vertices[0] = circle.m_p;
      this.m_count = 1;
      this.m_radius = circle.m_radius;
      break;
    case b2Shape.e_polygonShape:
      var polygon = shape;
      this.m_vertices = polygon.m_vertices;
      this.m_count = polygon.m_vertexCount;
      this.m_radius = polygon.m_radius;
      break;
    default:
      b2Settings.b2Assert(false)
  }
};
b2DistanceProxy.prototype.GetSupport = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_count;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return bestIndex
};
b2DistanceProxy.prototype.GetSupportVertex = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_count;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return this.m_vertices[bestIndex]
};
b2DistanceProxy.prototype.GetVertexCount = function() {
  return this.m_count
};
b2DistanceProxy.prototype.GetVertex = function(index) {
  b2Settings.b2Assert(0 <= index && index < this.m_count);
  return this.m_vertices[index]
};
b2DistanceProxy.prototype.m_vertices = null;
b2DistanceProxy.prototype.m_count = 0;
b2DistanceProxy.prototype.m_radius = null;var b2ContactFactory = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactFactory.prototype.__constructor = function() {
};
b2ContactFactory.prototype.__varz = function() {
  this.InitializeRegisters()
};
b2ContactFactory.prototype.AddType = function(createFcn, destroyFcn, type1, type2) {
  this.m_registers[type1][type2].createFcn = createFcn;
  this.m_registers[type1][type2].destroyFcn = destroyFcn;
  this.m_registers[type1][type2].primary = true;
  if(type1 != type2) {
    this.m_registers[type2][type1].createFcn = createFcn;
    this.m_registers[type2][type1].destroyFcn = destroyFcn;
    this.m_registers[type2][type1].primary = false
  }
};
b2ContactFactory.prototype.InitializeRegisters = function() {
  this.m_registers = new Array(b2Shape.e_shapeTypeCount);
  for(var i = 0;i < b2Shape.e_shapeTypeCount;i++) {
    this.m_registers[i] = new Array(b2Shape.e_shapeTypeCount);
    for(var j = 0;j < b2Shape.e_shapeTypeCount;j++) {
      this.m_registers[i][j] = new b2ContactRegister
    }
  }
  this.AddType(b2CircleContact.Create, b2CircleContact.Destroy, b2Shape.e_circleShape, b2Shape.e_circleShape);
  this.AddType(b2PolyAndCircleContact.Create, b2PolyAndCircleContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_circleShape);
  this.AddType(b2PolygonContact.Create, b2PolygonContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_polygonShape);
  this.AddType(b2EdgeAndCircleContact.Create, b2EdgeAndCircleContact.Destroy, b2Shape.e_edgeShape, b2Shape.e_circleShape);
  this.AddType(b2PolyAndEdgeContact.Create, b2PolyAndEdgeContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_edgeShape)
};
b2ContactFactory.prototype.Create = function(fixtureA, fixtureB) {
  var type1 = fixtureA.GetType();
  var type2 = fixtureB.GetType();
  var reg = this.m_registers[type1][type2];
  var c;
  if(reg.pool) {
    c = reg.pool;
    reg.pool = c.m_next;
    reg.poolCount--;
    c.Reset(fixtureA, fixtureB);
    return c
  }
  var createFcn = reg.createFcn;
  if(createFcn != null) {
    if(reg.primary) {
      c = createFcn(this.m_allocator);
      c.Reset(fixtureA, fixtureB);
      return c
    }else {
      c = createFcn(this.m_allocator);
      c.Reset(fixtureB, fixtureA);
      return c
    }
  }else {
    return null
  }
};
b2ContactFactory.prototype.Destroy = function(contact) {
  if(contact.m_manifold.m_pointCount > 0) {
    contact.m_fixtureA.m_body.SetAwake(true);
    contact.m_fixtureB.m_body.SetAwake(true)
  }
  var type1 = contact.m_fixtureA.GetType();
  var type2 = contact.m_fixtureB.GetType();
  var reg = this.m_registers[type1][type2];
  if(true) {
    reg.poolCount++;
    contact.m_next = reg.pool;
    reg.pool = contact
  }
  var destroyFcn = reg.destroyFcn;
  destroyFcn(contact, this.m_allocator)
};
b2ContactFactory.prototype.m_registers = null;
b2ContactFactory.prototype.m_allocator = null;var b2ConstantAccelController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2ConstantAccelController.prototype, b2Controller.prototype);
b2ConstantAccelController.prototype._super = b2Controller.prototype;
b2ConstantAccelController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2ConstantAccelController.prototype.__varz = function() {
  this.A = new b2Vec2(0, 0)
};
b2ConstantAccelController.prototype.Step = function(step) {
  var smallA = new b2Vec2(this.A.x * step.dt, this.A.y * step.dt);
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    body.SetLinearVelocity(new b2Vec2(body.GetLinearVelocity().x + smallA.x, body.GetLinearVelocity().y + smallA.y))
  }
};
b2ConstantAccelController.prototype.A = new b2Vec2(0, 0);var b2SeparationFunction = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SeparationFunction.prototype.__constructor = function() {
};
b2SeparationFunction.prototype.__varz = function() {
  this.m_localPoint = new b2Vec2;
  this.m_axis = new b2Vec2
};
b2SeparationFunction.e_points = 1;
b2SeparationFunction.e_faceA = 2;
b2SeparationFunction.e_faceB = 4;
b2SeparationFunction.prototype.Initialize = function(cache, proxyA, transformA, proxyB, transformB) {
  this.m_proxyA = proxyA;
  this.m_proxyB = proxyB;
  var count = cache.count;
  b2Settings.b2Assert(0 < count && count < 3);
  var localPointA;
  var localPointA1;
  var localPointA2;
  var localPointB;
  var localPointB1;
  var localPointB2;
  var pointAX;
  var pointAY;
  var pointBX;
  var pointBY;
  var normalX;
  var normalY;
  var tMat;
  var tVec;
  var s;
  var sgn;
  if(count == 1) {
    this.m_type = b2SeparationFunction.e_points;
    localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
    localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
    tVec = localPointA;
    tMat = transformA.R;
    pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    tVec = localPointB;
    tMat = transformB.R;
    pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    this.m_axis.x = pointBX - pointAX;
    this.m_axis.y = pointBY - pointAY;
    this.m_axis.Normalize()
  }else {
    if(cache.indexB[0] == cache.indexB[1]) {
      this.m_type = b2SeparationFunction.e_faceA;
      localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
      localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
      localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
      this.m_localPoint.x = 0.5 * (localPointA1.x + localPointA2.x);
      this.m_localPoint.y = 0.5 * (localPointA1.y + localPointA2.y);
      this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointA2, localPointA1), 1);
      this.m_axis.Normalize();
      tVec = this.m_axis;
      tMat = transformA.R;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tVec = this.m_localPoint;
      tMat = transformA.R;
      pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tVec = localPointB;
      tMat = transformB.R;
      pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      s = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
      if(s < 0) {
        this.m_axis.NegativeSelf()
      }
    }else {
      if(cache.indexA[0] == cache.indexA[0]) {
        this.m_type = b2SeparationFunction.e_faceB;
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
        this.m_localPoint.x = 0.5 * (localPointB1.x + localPointB2.x);
        this.m_localPoint.y = 0.5 * (localPointB1.y + localPointB2.y);
        this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointB2, localPointB1), 1);
        this.m_axis.Normalize();
        tVec = this.m_axis;
        tMat = transformB.R;
        normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tVec = this.m_localPoint;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointA;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        s = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
        if(s < 0) {
          this.m_axis.NegativeSelf()
        }
      }else {
        localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        var pA = b2Math.MulX(transformA, localPointA);
        var dA = b2Math.MulMV(transformA.R, b2Math.SubtractVV(localPointA2, localPointA1));
        var pB = b2Math.MulX(transformB, localPointB);
        var dB = b2Math.MulMV(transformB.R, b2Math.SubtractVV(localPointB2, localPointB1));
        var a = dA.x * dA.x + dA.y * dA.y;
        var e = dB.x * dB.x + dB.y * dB.y;
        var r = b2Math.SubtractVV(dB, dA);
        var c = dA.x * r.x + dA.y * r.y;
        var f = dB.x * r.x + dB.y * r.y;
        var b = dA.x * dB.x + dA.y * dB.y;
        var denom = a * e - b * b;
        s = 0;
        if(denom != 0) {
          s = b2Math.Clamp((b * f - c * e) / denom, 0, 1)
        }
        var t = (b * s + f) / e;
        if(t < 0) {
          t = 0;
          s = b2Math.Clamp((b - c) / a, 0, 1)
        }
        localPointA = new b2Vec2;
        localPointA.x = localPointA1.x + s * (localPointA2.x - localPointA1.x);
        localPointA.y = localPointA1.y + s * (localPointA2.y - localPointA1.y);
        localPointB = new b2Vec2;
        localPointB.x = localPointB1.x + s * (localPointB2.x - localPointB1.x);
        localPointB.y = localPointB1.y + s * (localPointB2.y - localPointB1.y);
        if(s == 0 || s == 1) {
          this.m_type = b2SeparationFunction.e_faceB;
          this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointB2, localPointB1), 1);
          this.m_axis.Normalize();
          this.m_localPoint = localPointB;
          tVec = this.m_axis;
          tMat = transformB.R;
          normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
          normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
          tVec = this.m_localPoint;
          tMat = transformB.R;
          pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          tVec = localPointA;
          tMat = transformA.R;
          pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          sgn = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
          if(s < 0) {
            this.m_axis.NegativeSelf()
          }
        }else {
          this.m_type = b2SeparationFunction.e_faceA;
          this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointA2, localPointA1), 1);
          this.m_localPoint = localPointA;
          tVec = this.m_axis;
          tMat = transformA.R;
          normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
          normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
          tVec = this.m_localPoint;
          tMat = transformA.R;
          pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          tVec = localPointB;
          tMat = transformB.R;
          pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          sgn = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
          if(s < 0) {
            this.m_axis.NegativeSelf()
          }
        }
      }
    }
  }
};
b2SeparationFunction.prototype.Evaluate = function(transformA, transformB) {
  var axisA;
  var axisB;
  var localPointA;
  var localPointB;
  var pointA;
  var pointB;
  var seperation;
  var normal;
  switch(this.m_type) {
    case b2SeparationFunction.e_points:
      axisA = b2Math.MulTMV(transformA.R, this.m_axis);
      axisB = b2Math.MulTMV(transformB.R, this.m_axis.GetNegative());
      localPointA = this.m_proxyA.GetSupportVertex(axisA);
      localPointB = this.m_proxyB.GetSupportVertex(axisB);
      pointA = b2Math.MulX(transformA, localPointA);
      pointB = b2Math.MulX(transformB, localPointB);
      seperation = (pointB.x - pointA.x) * this.m_axis.x + (pointB.y - pointA.y) * this.m_axis.y;
      return seperation;
    case b2SeparationFunction.e_faceA:
      normal = b2Math.MulMV(transformA.R, this.m_axis);
      pointA = b2Math.MulX(transformA, this.m_localPoint);
      axisB = b2Math.MulTMV(transformB.R, normal.GetNegative());
      localPointB = this.m_proxyB.GetSupportVertex(axisB);
      pointB = b2Math.MulX(transformB, localPointB);
      seperation = (pointB.x - pointA.x) * normal.x + (pointB.y - pointA.y) * normal.y;
      return seperation;
    case b2SeparationFunction.e_faceB:
      normal = b2Math.MulMV(transformB.R, this.m_axis);
      pointB = b2Math.MulX(transformB, this.m_localPoint);
      axisA = b2Math.MulTMV(transformA.R, normal.GetNegative());
      localPointA = this.m_proxyA.GetSupportVertex(axisA);
      pointA = b2Math.MulX(transformA, localPointA);
      seperation = (pointA.x - pointB.x) * normal.x + (pointA.y - pointB.y) * normal.y;
      return seperation;
    default:
      b2Settings.b2Assert(false);
      return 0
  }
};
b2SeparationFunction.prototype.m_proxyA = null;
b2SeparationFunction.prototype.m_proxyB = null;
b2SeparationFunction.prototype.m_type = 0;
b2SeparationFunction.prototype.m_localPoint = new b2Vec2;
b2SeparationFunction.prototype.m_axis = new b2Vec2;var b2DynamicTreePair = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreePair.prototype.__constructor = function() {
};
b2DynamicTreePair.prototype.__varz = function() {
};
b2DynamicTreePair.prototype.proxyA = null;
b2DynamicTreePair.prototype.proxyB = null;var b2ContactConstraintPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactConstraintPoint.prototype.__constructor = function() {
};
b2ContactConstraintPoint.prototype.__varz = function() {
  this.localPoint = new b2Vec2;
  this.rA = new b2Vec2;
  this.rB = new b2Vec2
};
b2ContactConstraintPoint.prototype.localPoint = new b2Vec2;
b2ContactConstraintPoint.prototype.rA = new b2Vec2;
b2ContactConstraintPoint.prototype.rB = new b2Vec2;
b2ContactConstraintPoint.prototype.normalImpulse = null;
b2ContactConstraintPoint.prototype.tangentImpulse = null;
b2ContactConstraintPoint.prototype.normalMass = null;
b2ContactConstraintPoint.prototype.tangentMass = null;
b2ContactConstraintPoint.prototype.equalizedMass = null;
b2ContactConstraintPoint.prototype.velocityBias = null;var b2ControllerEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ControllerEdge.prototype.__constructor = function() {
};
b2ControllerEdge.prototype.__varz = function() {
};
b2ControllerEdge.prototype.controller = null;
b2ControllerEdge.prototype.body = null;
b2ControllerEdge.prototype.prevBody = null;
b2ControllerEdge.prototype.nextBody = null;
b2ControllerEdge.prototype.prevController = null;
b2ControllerEdge.prototype.nextController = null;var b2DistanceInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceInput.prototype.__constructor = function() {
};
b2DistanceInput.prototype.__varz = function() {
};
b2DistanceInput.prototype.proxyA = null;
b2DistanceInput.prototype.proxyB = null;
b2DistanceInput.prototype.transformA = null;
b2DistanceInput.prototype.transformB = null;
b2DistanceInput.prototype.useRadii = null;var b2Settings = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Settings.prototype.__constructor = function() {
};
b2Settings.prototype.__varz = function() {
};
b2Settings.b2MixFriction = function(friction1, friction2) {
  return Math.sqrt(friction1 * friction2)
};
b2Settings.b2MixRestitution = function(restitution1, restitution2) {
  return restitution1 > restitution2 ? restitution1 : restitution2
};
b2Settings.b2Assert = function(a) {
  if(!a) {
    throw"Assertion Failed";
  }
};
b2Settings.VERSION = "2.1alpha";
b2Settings.USHRT_MAX = 65535;
b2Settings.b2_pi = Math.PI;
b2Settings.b2_maxManifoldPoints = 2;
b2Settings.b2_aabbExtension = 0.1;
b2Settings.b2_aabbMultiplier = 2;
b2Settings.b2_polygonRadius = 2 * b2Settings.b2_linearSlop;
b2Settings.b2_linearSlop = 0.0050;
b2Settings.b2_angularSlop = 2 / 180 * b2Settings.b2_pi;
b2Settings.b2_toiSlop = 8 * b2Settings.b2_linearSlop;
b2Settings.b2_maxTOIContactsPerIsland = 32;
b2Settings.b2_maxTOIJointsPerIsland = 32;
b2Settings.b2_velocityThreshold = 1;
b2Settings.b2_maxLinearCorrection = 0.2;
b2Settings.b2_maxAngularCorrection = 8 / 180 * b2Settings.b2_pi;
b2Settings.b2_maxTranslation = 2;
b2Settings.b2_maxTranslationSquared = b2Settings.b2_maxTranslation * b2Settings.b2_maxTranslation;
b2Settings.b2_maxRotation = 0.5 * b2Settings.b2_pi;
b2Settings.b2_maxRotationSquared = b2Settings.b2_maxRotation * b2Settings.b2_maxRotation;
b2Settings.b2_contactBaumgarte = 0.2;
b2Settings.b2_timeToSleep = 0.5;
b2Settings.b2_linearSleepTolerance = 0.01;
b2Settings.b2_angularSleepTolerance = 2 / 180 * b2Settings.b2_pi;var b2Proxy = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Proxy.prototype.__constructor = function() {
};
b2Proxy.prototype.__varz = function() {
  this.lowerBounds = new Array(2);
  this.upperBounds = new Array(2);
  this.pairs = new Object
};
b2Proxy.prototype.IsValid = function() {
  return this.overlapCount != b2BroadPhase.b2_invalid
};
b2Proxy.prototype.lowerBounds = new Array(2);
b2Proxy.prototype.upperBounds = new Array(2);
b2Proxy.prototype.overlapCount = 0;
b2Proxy.prototype.timeStamp = 0;
b2Proxy.prototype.pairs = new Object;
b2Proxy.prototype.next = null;
b2Proxy.prototype.userData = null;var b2Point = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Point.prototype.__constructor = function() {
};
b2Point.prototype.__varz = function() {
  this.p = new b2Vec2
};
b2Point.prototype.Support = function(xf, vX, vY) {
  return this.p
};
b2Point.prototype.GetFirstVertex = function(xf) {
  return this.p
};
b2Point.prototype.p = new b2Vec2;var b2WorldManifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2WorldManifold.prototype.__constructor = function() {
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2Vec2
  }
};
b2WorldManifold.prototype.__varz = function() {
  this.m_normal = new b2Vec2
};
b2WorldManifold.prototype.Initialize = function(manifold, xfA, radiusA, xfB, radiusB) {
  if(manifold.m_pointCount == 0) {
    return
  }
  var i = 0;
  var tVec;
  var tMat;
  var normalX;
  var normalY;
  var planePointX;
  var planePointY;
  var clipPointX;
  var clipPointY;
  switch(manifold.m_type) {
    case b2Manifold.e_circles:
      tMat = xfA.R;
      tVec = manifold.m_localPoint;
      var pointAX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      var pointAY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfB.R;
      tVec = manifold.m_points[0].m_localPoint;
      var pointBX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      var pointBY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      var dX = pointBX - pointAX;
      var dY = pointBY - pointAY;
      var d2 = dX * dX + dY * dY;
      if(d2 > Number.MIN_VALUE * Number.MIN_VALUE) {
        var d = Math.sqrt(d2);
        this.m_normal.x = dX / d;
        this.m_normal.y = dY / d
      }else {
        this.m_normal.x = 1;
        this.m_normal.y = 0
      }
      var cAX = pointAX + radiusA * this.m_normal.x;
      var cAY = pointAY + radiusA * this.m_normal.y;
      var cBX = pointBX - radiusB * this.m_normal.x;
      var cBY = pointBY - radiusB * this.m_normal.y;
      this.m_points[0].x = 0.5 * (cAX + cBX);
      this.m_points[0].y = 0.5 * (cAY + cBY);
      break;
    case b2Manifold.e_faceA:
      tMat = xfA.R;
      tVec = manifold.m_localPlaneNormal;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfA.R;
      tVec = manifold.m_localPoint;
      planePointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      planePointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      this.m_normal.x = normalX;
      this.m_normal.y = normalY;
      for(i = 0;i < manifold.m_pointCount;i++) {
        tMat = xfB.R;
        tVec = manifold.m_points[i].m_localPoint;
        clipPointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        clipPointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        this.m_points[i].x = clipPointX + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalX;
        this.m_points[i].y = clipPointY + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalY
      }
      break;
    case b2Manifold.e_faceB:
      tMat = xfB.R;
      tVec = manifold.m_localPlaneNormal;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfB.R;
      tVec = manifold.m_localPoint;
      planePointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      planePointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      this.m_normal.x = -normalX;
      this.m_normal.y = -normalY;
      for(i = 0;i < manifold.m_pointCount;i++) {
        tMat = xfA.R;
        tVec = manifold.m_points[i].m_localPoint;
        clipPointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        clipPointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        this.m_points[i].x = clipPointX + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalX;
        this.m_points[i].y = clipPointY + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalY
      }
      break
  }
};
b2WorldManifold.prototype.m_normal = new b2Vec2;
b2WorldManifold.prototype.m_points = null;var b2RayCastOutput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2RayCastOutput.prototype.__constructor = function() {
};
b2RayCastOutput.prototype.__varz = function() {
  this.normal = new b2Vec2
};
b2RayCastOutput.prototype.normal = new b2Vec2;
b2RayCastOutput.prototype.fraction = null;var b2ConstantForceController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2ConstantForceController.prototype, b2Controller.prototype);
b2ConstantForceController.prototype._super = b2Controller.prototype;
b2ConstantForceController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2ConstantForceController.prototype.__varz = function() {
  this.F = new b2Vec2(0, 0)
};
b2ConstantForceController.prototype.Step = function(step) {
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    body.ApplyForce(this.F, body.GetWorldCenter())
  }
};
b2ConstantForceController.prototype.F = new b2Vec2(0, 0);var b2MassData = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2MassData.prototype.__constructor = function() {
};
b2MassData.prototype.__varz = function() {
  this.center = new b2Vec2(0, 0)
};
b2MassData.prototype.mass = 0;
b2MassData.prototype.center = new b2Vec2(0, 0);
b2MassData.prototype.I = 0;var b2DynamicTree = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTree.prototype.__constructor = function() {
  this.m_root = null;
  this.m_freeList = null;
  this.m_path = 0;
  this.m_insertionCount = 0
};
b2DynamicTree.prototype.__varz = function() {
};
b2DynamicTree.prototype.AllocateNode = function() {
  if(this.m_freeList) {
    var node = this.m_freeList;
    this.m_freeList = node.parent;
    node.parent = null;
    node.child1 = null;
    node.child2 = null;
    return node
  }
  return new b2DynamicTreeNode
};
b2DynamicTree.prototype.FreeNode = function(node) {
  node.parent = this.m_freeList;
  this.m_freeList = node
};
b2DynamicTree.prototype.InsertLeaf = function(leaf) {
  ++this.m_insertionCount;
  if(this.m_root == null) {
    this.m_root = leaf;
    this.m_root.parent = null;
    return
  }
  var center = leaf.aabb.GetCenter();
  var sibling = this.m_root;
  if(sibling.IsLeaf() == false) {
    do {
      var child1 = sibling.child1;
      var child2 = sibling.child2;
      var norm1 = Math.abs((child1.aabb.lowerBound.x + child1.aabb.upperBound.x) / 2 - center.x) + Math.abs((child1.aabb.lowerBound.y + child1.aabb.upperBound.y) / 2 - center.y);
      var norm2 = Math.abs((child2.aabb.lowerBound.x + child2.aabb.upperBound.x) / 2 - center.x) + Math.abs((child2.aabb.lowerBound.y + child2.aabb.upperBound.y) / 2 - center.y);
      if(norm1 < norm2) {
        sibling = child1
      }else {
        sibling = child2
      }
    }while(sibling.IsLeaf() == false)
  }
  var node1 = sibling.parent;
  var node2 = this.AllocateNode();
  node2.parent = node1;
  node2.userData = null;
  node2.aabb.Combine(leaf.aabb, sibling.aabb);
  if(node1) {
    if(sibling.parent.child1 == sibling) {
      node1.child1 = node2
    }else {
      node1.child2 = node2
    }
    node2.child1 = sibling;
    node2.child2 = leaf;
    sibling.parent = node2;
    leaf.parent = node2;
    do {
      if(node1.aabb.Contains(node2.aabb)) {
        break
      }
      node1.aabb.Combine(node1.child1.aabb, node1.child2.aabb);
      node2 = node1;
      node1 = node1.parent
    }while(node1)
  }else {
    node2.child1 = sibling;
    node2.child2 = leaf;
    sibling.parent = node2;
    leaf.parent = node2;
    this.m_root = node2
  }
};
b2DynamicTree.prototype.RemoveLeaf = function(leaf) {
  if(leaf == this.m_root) {
    this.m_root = null;
    return
  }
  var node2 = leaf.parent;
  var node1 = node2.parent;
  var sibling;
  if(node2.child1 == leaf) {
    sibling = node2.child2
  }else {
    sibling = node2.child1
  }
  if(node1) {
    if(node1.child1 == node2) {
      node1.child1 = sibling
    }else {
      node1.child2 = sibling
    }
    sibling.parent = node1;
    this.FreeNode(node2);
    while(node1) {
      var oldAABB = node1.aabb;
      node1.aabb = b2AABB.Combine(node1.child1.aabb, node1.child2.aabb);
      if(oldAABB.Contains(node1.aabb)) {
        break
      }
      node1 = node1.parent
    }
  }else {
    this.m_root = sibling;
    sibling.parent = null;
    this.FreeNode(node2)
  }
};
b2DynamicTree.prototype.CreateProxy = function(aabb, userData) {
  var node = this.AllocateNode();
  var extendX = b2Settings.b2_aabbExtension;
  var extendY = b2Settings.b2_aabbExtension;
  node.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
  node.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
  node.aabb.upperBound.x = aabb.upperBound.x + extendX;
  node.aabb.upperBound.y = aabb.upperBound.y + extendY;
  node.userData = userData;
  this.InsertLeaf(node);
  return node
};
b2DynamicTree.prototype.DestroyProxy = function(proxy) {
  this.RemoveLeaf(proxy);
  this.FreeNode(proxy)
};
b2DynamicTree.prototype.MoveProxy = function(proxy, aabb, displacement) {
  b2Settings.b2Assert(proxy.IsLeaf());
  if(proxy.aabb.Contains(aabb)) {
    return false
  }
  this.RemoveLeaf(proxy);
  var extendX = b2Settings.b2_aabbExtension + b2Settings.b2_aabbMultiplier * (displacement.x > 0 ? displacement.x : -displacement.x);
  var extendY = b2Settings.b2_aabbExtension + b2Settings.b2_aabbMultiplier * (displacement.y > 0 ? displacement.y : -displacement.y);
  proxy.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
  proxy.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
  proxy.aabb.upperBound.x = aabb.upperBound.x + extendX;
  proxy.aabb.upperBound.y = aabb.upperBound.y + extendY;
  this.InsertLeaf(proxy);
  return true
};
b2DynamicTree.prototype.Rebalance = function(iterations) {
  if(this.m_root == null) {
    return
  }
  for(var i = 0;i < iterations;i++) {
    var node = this.m_root;
    var bit = 0;
    while(node.IsLeaf() == false) {
      node = this.m_path >> bit & 1 ? node.child2 : node.child1;
      bit = bit + 1 & 31
    }
    ++this.m_path;
    this.RemoveLeaf(node);
    this.InsertLeaf(node)
  }
};
b2DynamicTree.prototype.GetFatAABB = function(proxy) {
  return proxy.aabb
};
b2DynamicTree.prototype.GetUserData = function(proxy) {
  return proxy.userData
};
b2DynamicTree.prototype.Query = function(callback, aabb) {
  if(this.m_root == null) {
    return
  }
  var stack = new Array;
  var count = 0;
  stack[count++] = this.m_root;
  while(count > 0) {
    var node = stack[--count];
    if(node.aabb.TestOverlap(aabb)) {
      if(node.IsLeaf()) {
        var proceed = callback(node);
        if(!proceed) {
          return
        }
      }else {
        stack[count++] = node.child1;
        stack[count++] = node.child2
      }
    }
  }
};
b2DynamicTree.prototype.RayCast = function(callback, input) {
  if(this.m_root == null) {
    return
  }
  var p1 = input.p1;
  var p2 = input.p2;
  var r = b2Math.SubtractVV(p1, p2);
  r.Normalize();
  var v = b2Math.CrossFV(1, r);
  var abs_v = b2Math.AbsV(v);
  var maxFraction = input.maxFraction;
  var segmentAABB = new b2AABB;
  var tX;
  var tY;
  tX = p1.x + maxFraction * (p2.x - p1.x);
  tY = p1.y + maxFraction * (p2.y - p1.y);
  segmentAABB.lowerBound.x = Math.min(p1.x, tX);
  segmentAABB.lowerBound.y = Math.min(p1.y, tY);
  segmentAABB.upperBound.x = Math.max(p1.x, tX);
  segmentAABB.upperBound.y = Math.max(p1.y, tY);
  var stack = new Array;
  var count = 0;
  stack[count++] = this.m_root;
  while(count > 0) {
    var node = stack[--count];
    if(node.aabb.TestOverlap(segmentAABB) == false) {
      continue
    }
    var c = node.aabb.GetCenter();
    var h = node.aabb.GetExtents();
    var separation = Math.abs(v.x * (p1.x - c.x) + v.y * (p1.y - c.y)) - abs_v.x * h.x - abs_v.y * h.y;
    if(separation > 0) {
      continue
    }
    if(node.IsLeaf()) {
      var subInput = new b2RayCastInput;
      subInput.p1 = input.p1;
      subInput.p2 = input.p2;
      subInput.maxFraction = input.maxFraction;
      maxFraction = callback(subInput, node);
      if(maxFraction == 0) {
        return
      }
      tX = p1.x + maxFraction * (p2.x - p1.x);
      tY = p1.y + maxFraction * (p2.y - p1.y);
      segmentAABB.lowerBound.x = Math.min(p1.x, tX);
      segmentAABB.lowerBound.y = Math.min(p1.y, tY);
      segmentAABB.upperBound.x = Math.max(p1.x, tX);
      segmentAABB.upperBound.y = Math.max(p1.y, tY)
    }else {
      stack[count++] = node.child1;
      stack[count++] = node.child2
    }
  }
};
b2DynamicTree.prototype.m_root = null;
b2DynamicTree.prototype.m_freeList = null;
b2DynamicTree.prototype.m_path = 0;
b2DynamicTree.prototype.m_insertionCount = 0;var b2JointEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2JointEdge.prototype.__constructor = function() {
};
b2JointEdge.prototype.__varz = function() {
};
b2JointEdge.prototype.other = null;
b2JointEdge.prototype.joint = null;
b2JointEdge.prototype.prev = null;
b2JointEdge.prototype.next = null;var b2RayCastInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2RayCastInput.prototype.__constructor = function() {
};
b2RayCastInput.prototype.__varz = function() {
  this.p1 = new b2Vec2;
  this.p2 = new b2Vec2
};
b2RayCastInput.prototype.p1 = new b2Vec2;
b2RayCastInput.prototype.p2 = new b2Vec2;
b2RayCastInput.prototype.maxFraction = null;var Features = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
Features.prototype.__constructor = function() {
};
Features.prototype.__varz = function() {
};
Features.prototype.__defineGetter__("referenceEdge", function() {
  return this._referenceEdge
});
Features.prototype.__defineSetter__("referenceEdge", function(value) {
  this._referenceEdge = value;
  this._m_id._key = this._m_id._key & 4294967040 | this._referenceEdge & 255
});
Features.prototype.__defineGetter__("incidentEdge", function() {
  return this._incidentEdge
});
Features.prototype.__defineSetter__("incidentEdge", function(value) {
  this._incidentEdge = value;
  this._m_id._key = this._m_id._key & 4294902015 | this._incidentEdge << 8 & 65280
});
Features.prototype.__defineGetter__("incidentVertex", function() {
  return this._incidentVertex
});
Features.prototype.__defineSetter__("incidentVertex", function(value) {
  this._incidentVertex = value;
  this._m_id._key = this._m_id._key & 4278255615 | this._incidentVertex << 16 & 16711680
});
Features.prototype.__defineGetter__("flip", function() {
  return this._flip
});
Features.prototype.__defineSetter__("flip", function(value) {
  this._flip = value;
  this._m_id._key = this._m_id._key & 16777215 | this._flip << 24 & 4278190080
});
Features.prototype._referenceEdge = 0;
Features.prototype._incidentEdge = 0;
Features.prototype._incidentVertex = 0;
Features.prototype._flip = 0;
Features.prototype._m_id = null;var b2FilterData = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2FilterData.prototype.__constructor = function() {
};
b2FilterData.prototype.__varz = function() {
  this.categoryBits = 1;
  this.maskBits = 65535
};
b2FilterData.prototype.Copy = function() {
  var copy = new b2FilterData;
  copy.categoryBits = this.categoryBits;
  copy.maskBits = this.maskBits;
  copy.groupIndex = this.groupIndex;
  return copy
};
b2FilterData.prototype.categoryBits = 1;
b2FilterData.prototype.maskBits = 65535;
b2FilterData.prototype.groupIndex = 0;var b2AABB = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2AABB.prototype.__constructor = function() {
};
b2AABB.prototype.__varz = function() {
  this.lowerBound = new b2Vec2;
  this.upperBound = new b2Vec2
};
b2AABB.Combine = function(aabb1, aabb2) {
  var aabb = new b2AABB;
  aabb.Combine(aabb1, aabb2);
  return aabb
};
b2AABB.prototype.IsValid = function() {
  var dX = this.upperBound.x - this.lowerBound.x;
  var dY = this.upperBound.y - this.lowerBound.y;
  var valid = dX >= 0 && dY >= 0;
  valid = valid && this.lowerBound.IsValid() && this.upperBound.IsValid();
  return valid
};
b2AABB.prototype.GetCenter = function() {
  return new b2Vec2((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2)
};
b2AABB.prototype.GetExtents = function() {
  return new b2Vec2((this.upperBound.x - this.lowerBound.x) / 2, (this.upperBound.y - this.lowerBound.y) / 2)
};
b2AABB.prototype.Contains = function(aabb) {
  var result = true && this.lowerBound.x <= aabb.lowerBound.x && this.lowerBound.y <= aabb.lowerBound.y && aabb.upperBound.x <= this.upperBound.x && aabb.upperBound.y <= this.upperBound.y;
  return result
};
b2AABB.prototype.RayCast = function(output, input) {
  var tmin = -Number.MAX_VALUE;
  var tmax = Number.MAX_VALUE;
  var pX = input.p1.x;
  var pY = input.p1.y;
  var dX = input.p2.x - input.p1.x;
  var dY = input.p2.y - input.p1.y;
  var absDX = Math.abs(dX);
  var absDY = Math.abs(dY);
  var normal = output.normal;
  var inv_d;
  var t1;
  var t2;
  var t3;
  var s;
  if(absDX < Number.MIN_VALUE) {
    if(pX < this.lowerBound.x || this.upperBound.x < pX) {
      return false
    }
  }else {
    inv_d = 1 / dX;
    t1 = (this.lowerBound.x - pX) * inv_d;
    t2 = (this.upperBound.x - pX) * inv_d;
    s = -1;
    if(t1 > t2) {
      t3 = t1;
      t1 = t2;
      t2 = t3;
      s = 1
    }
    if(t1 > tmin) {
      normal.x = s;
      normal.y = 0;
      tmin = t1
    }
    tmax = Math.min(tmax, t2);
    if(tmin > tmax) {
      return false
    }
  }
  if(absDY < Number.MIN_VALUE) {
    if(pY < this.lowerBound.y || this.upperBound.y < pY) {
      return false
    }
  }else {
    inv_d = 1 / dY;
    t1 = (this.lowerBound.y - pY) * inv_d;
    t2 = (this.upperBound.y - pY) * inv_d;
    s = -1;
    if(t1 > t2) {
      t3 = t1;
      t1 = t2;
      t2 = t3;
      s = 1
    }
    if(t1 > tmin) {
      normal.y = s;
      normal.x = 0;
      tmin = t1
    }
    tmax = Math.min(tmax, t2);
    if(tmin > tmax) {
      return false
    }
  }
  output.fraction = tmin;
  return true
};
b2AABB.prototype.TestOverlap = function(other) {
  var d1X = other.lowerBound.x - this.upperBound.x;
  var d1Y = other.lowerBound.y - this.upperBound.y;
  var d2X = this.lowerBound.x - other.upperBound.x;
  var d2Y = this.lowerBound.y - other.upperBound.y;
  if(d1X > 0 || d1Y > 0) {
    return false
  }
  if(d2X > 0 || d2Y > 0) {
    return false
  }
  return true
};
b2AABB.prototype.Combine = function(aabb1, aabb2) {
  this.lowerBound.x = Math.min(aabb1.lowerBound.x, aabb2.lowerBound.x);
  this.lowerBound.y = Math.min(aabb1.lowerBound.y, aabb2.lowerBound.y);
  this.upperBound.x = Math.max(aabb1.upperBound.x, aabb2.upperBound.x);
  this.upperBound.y = Math.max(aabb1.upperBound.y, aabb2.upperBound.y)
};
b2AABB.prototype.lowerBound = new b2Vec2;
b2AABB.prototype.upperBound = new b2Vec2;var b2Jacobian = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Jacobian.prototype.__constructor = function() {
};
b2Jacobian.prototype.__varz = function() {
  this.linearA = new b2Vec2;
  this.linearB = new b2Vec2
};
b2Jacobian.prototype.SetZero = function() {
  this.linearA.SetZero();
  this.angularA = 0;
  this.linearB.SetZero();
  this.angularB = 0
};
b2Jacobian.prototype.Set = function(x1, a1, x2, a2) {
  this.linearA.SetV(x1);
  this.angularA = a1;
  this.linearB.SetV(x2);
  this.angularB = a2
};
b2Jacobian.prototype.Compute = function(x1, a1, x2, a2) {
  return this.linearA.x * x1.x + this.linearA.y * x1.y + this.angularA * a1 + (this.linearB.x * x2.x + this.linearB.y * x2.y) + this.angularB * a2
};
b2Jacobian.prototype.linearA = new b2Vec2;
b2Jacobian.prototype.angularA = null;
b2Jacobian.prototype.linearB = new b2Vec2;
b2Jacobian.prototype.angularB = null;var b2Bound = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Bound.prototype.__constructor = function() {
};
b2Bound.prototype.__varz = function() {
};
b2Bound.prototype.IsLower = function() {
  return(this.value & 1) == 0
};
b2Bound.prototype.IsUpper = function() {
  return(this.value & 1) == 1
};
b2Bound.prototype.Swap = function(b) {
  var tempValue = this.value;
  var tempProxy = this.proxy;
  var tempStabbingCount = this.stabbingCount;
  this.value = b.value;
  this.proxy = b.proxy;
  this.stabbingCount = b.stabbingCount;
  b.value = tempValue;
  b.proxy = tempProxy;
  b.stabbingCount = tempStabbingCount
};
b2Bound.prototype.value = 0;
b2Bound.prototype.proxy = null;
b2Bound.prototype.stabbingCount = 0;var b2SimplexVertex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SimplexVertex.prototype.__constructor = function() {
};
b2SimplexVertex.prototype.__varz = function() {
};
b2SimplexVertex.prototype.Set = function(other) {
  this.wA.SetV(other.wA);
  this.wB.SetV(other.wB);
  this.w.SetV(other.w);
  this.a = other.a;
  this.indexA = other.indexA;
  this.indexB = other.indexB
};
b2SimplexVertex.prototype.wA = null;
b2SimplexVertex.prototype.wB = null;
b2SimplexVertex.prototype.w = null;
b2SimplexVertex.prototype.a = null;
b2SimplexVertex.prototype.indexA = 0;
b2SimplexVertex.prototype.indexB = 0;var b2Mat22 = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Mat22.prototype.__constructor = function() {
  this.col1.x = this.col2.y = 1
};
b2Mat22.prototype.__varz = function() {
  this.col1 = new b2Vec2;
  this.col2 = new b2Vec2
};
b2Mat22.FromAngle = function(angle) {
  var mat = new b2Mat22;
  mat.Set(angle);
  return mat
};
b2Mat22.FromVV = function(c1, c2) {
  var mat = new b2Mat22;
  mat.SetVV(c1, c2);
  return mat
};
b2Mat22.prototype.Set = function(angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  this.col1.x = c;
  this.col2.x = -s;
  this.col1.y = s;
  this.col2.y = c
};
b2Mat22.prototype.SetVV = function(c1, c2) {
  this.col1.SetV(c1);
  this.col2.SetV(c2)
};
b2Mat22.prototype.Copy = function() {
  var mat = new b2Mat22;
  mat.SetM(this);
  return mat
};
b2Mat22.prototype.SetM = function(m) {
  this.col1.SetV(m.col1);
  this.col2.SetV(m.col2)
};
b2Mat22.prototype.AddM = function(m) {
  this.col1.x += m.col1.x;
  this.col1.y += m.col1.y;
  this.col2.x += m.col2.x;
  this.col2.y += m.col2.y
};
b2Mat22.prototype.SetIdentity = function() {
  this.col1.x = 1;
  this.col2.x = 0;
  this.col1.y = 0;
  this.col2.y = 1
};
b2Mat22.prototype.SetZero = function() {
  this.col1.x = 0;
  this.col2.x = 0;
  this.col1.y = 0;
  this.col2.y = 0
};
b2Mat22.prototype.GetAngle = function() {
  return Math.atan2(this.col1.y, this.col1.x)
};
b2Mat22.prototype.GetInverse = function(out) {
  var a = this.col1.x;
  var b = this.col2.x;
  var c = this.col1.y;
  var d = this.col2.y;
  var det = a * d - b * c;
  if(det != 0) {
    det = 1 / det
  }
  out.col1.x = det * d;
  out.col2.x = -det * b;
  out.col1.y = -det * c;
  out.col2.y = det * a;
  return out
};
b2Mat22.prototype.Solve = function(out, bX, bY) {
  var a11 = this.col1.x;
  var a12 = this.col2.x;
  var a21 = this.col1.y;
  var a22 = this.col2.y;
  var det = a11 * a22 - a12 * a21;
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (a22 * bX - a12 * bY);
  out.y = det * (a11 * bY - a21 * bX);
  return out
};
b2Mat22.prototype.Abs = function() {
  this.col1.Abs();
  this.col2.Abs()
};
b2Mat22.prototype.col1 = new b2Vec2;
b2Mat22.prototype.col2 = new b2Vec2;var b2SimplexCache = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SimplexCache.prototype.__constructor = function() {
};
b2SimplexCache.prototype.__varz = function() {
  this.indexA = new Array(3);
  this.indexB = new Array(3)
};
b2SimplexCache.prototype.metric = null;
b2SimplexCache.prototype.count = 0;
b2SimplexCache.prototype.indexA = new Array(3);
b2SimplexCache.prototype.indexB = new Array(3);var b2Shape = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Shape.prototype.__constructor = function() {
  this.m_type = b2Shape.e_unknownShape;
  this.m_radius = b2Settings.b2_linearSlop
};
b2Shape.prototype.__varz = function() {
};
b2Shape.TestOverlap = function(shape1, transform1, shape2, transform2) {
  var input = new b2DistanceInput;
  input.proxyA = new b2DistanceProxy;
  input.proxyA.Set(shape1);
  input.proxyB = new b2DistanceProxy;
  input.proxyB.Set(shape2);
  input.transformA = transform1;
  input.transformB = transform2;
  input.useRadii = true;
  var simplexCache = new b2SimplexCache;
  simplexCache.count = 0;
  var output = new b2DistanceOutput;
  b2Distance.Distance(output, simplexCache, input);
  return output.distance < 10 * Number.MIN_VALUE
};
b2Shape.e_hitCollide = 1;
b2Shape.e_missCollide = 0;
b2Shape.e_startsInsideCollide = -1;
b2Shape.e_unknownShape = -1;
b2Shape.e_circleShape = 0;
b2Shape.e_polygonShape = 1;
b2Shape.e_edgeShape = 2;
b2Shape.e_shapeTypeCount = 3;
b2Shape.prototype.Copy = function() {
  return null
};
b2Shape.prototype.Set = function(other) {
  this.m_radius = other.m_radius
};
b2Shape.prototype.GetType = function() {
  return this.m_type
};
b2Shape.prototype.TestPoint = function(xf, p) {
  return false
};
b2Shape.prototype.RayCast = function(output, input, transform) {
  return false
};
b2Shape.prototype.ComputeAABB = function(aabb, xf) {
};
b2Shape.prototype.ComputeMass = function(massData, density) {
};
b2Shape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  return 0
};
b2Shape.prototype.m_type = 0;
b2Shape.prototype.m_radius = null;var b2Segment = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Segment.prototype.__constructor = function() {
};
b2Segment.prototype.__varz = function() {
  this.p1 = new b2Vec2;
  this.p2 = new b2Vec2
};
b2Segment.prototype.TestSegment = function(lambda, normal, segment, maxLambda) {
  var s = segment.p1;
  var rX = segment.p2.x - s.x;
  var rY = segment.p2.y - s.y;
  var dX = this.p2.x - this.p1.x;
  var dY = this.p2.y - this.p1.y;
  var nX = dY;
  var nY = -dX;
  var k_slop = 100 * Number.MIN_VALUE;
  var denom = -(rX * nX + rY * nY);
  if(denom > k_slop) {
    var bX = s.x - this.p1.x;
    var bY = s.y - this.p1.y;
    var a = bX * nX + bY * nY;
    if(0 <= a && a <= maxLambda * denom) {
      var mu2 = -rX * bY + rY * bX;
      if(-k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)) {
        a /= denom;
        var nLen = Math.sqrt(nX * nX + nY * nY);
        nX /= nLen;
        nY /= nLen;
        lambda[0] = a;
        normal.Set(nX, nY);
        return true
      }
    }
  }
  return false
};
b2Segment.prototype.Extend = function(aabb) {
  this.ExtendForward(aabb);
  this.ExtendBackward(aabb)
};
b2Segment.prototype.ExtendForward = function(aabb) {
  var dX = this.p2.x - this.p1.x;
  var dY = this.p2.y - this.p1.y;
  var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p1.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p1.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p1.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p1.y) / dY : Number.POSITIVE_INFINITY);
  this.p2.x = this.p1.x + dX * lambda;
  this.p2.y = this.p1.y + dY * lambda
};
b2Segment.prototype.ExtendBackward = function(aabb) {
  var dX = -this.p2.x + this.p1.x;
  var dY = -this.p2.y + this.p1.y;
  var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p2.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p2.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p2.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p2.y) / dY : Number.POSITIVE_INFINITY);
  this.p1.x = this.p2.x + dX * lambda;
  this.p1.y = this.p2.y + dY * lambda
};
b2Segment.prototype.p1 = new b2Vec2;
b2Segment.prototype.p2 = new b2Vec2;var b2ContactRegister = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactRegister.prototype.__constructor = function() {
};
b2ContactRegister.prototype.__varz = function() {
};
b2ContactRegister.prototype.createFcn = null;
b2ContactRegister.prototype.destroyFcn = null;
b2ContactRegister.prototype.primary = null;
b2ContactRegister.prototype.pool = null;
b2ContactRegister.prototype.poolCount = 0;var b2DebugDraw = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DebugDraw.prototype.__constructor = function() {
  this.m_drawFlags = 0
};
b2DebugDraw.prototype.__varz = function() {
};
b2DebugDraw.e_shapeBit = 1;
b2DebugDraw.e_jointBit = 2;
b2DebugDraw.e_aabbBit = 4;
b2DebugDraw.e_pairBit = 8;
b2DebugDraw.e_centerOfMassBit = 16;
b2DebugDraw.e_controllerBit = 32;
b2DebugDraw.prototype.SetFlags = function(flags) {
  this.m_drawFlags = flags
};
b2DebugDraw.prototype.GetFlags = function() {
  return this.m_drawFlags
};
b2DebugDraw.prototype.AppendFlags = function(flags) {
  this.m_drawFlags |= flags
};
b2DebugDraw.prototype.ClearFlags = function(flags) {
  this.m_drawFlags &= ~flags
};
b2DebugDraw.prototype.SetSprite = function(sprite) {
  this.m_sprite = sprite
};
b2DebugDraw.prototype.GetSprite = function() {
  return this.m_sprite
};
b2DebugDraw.prototype.SetDrawScale = function(drawScale) {
  this.m_drawScale = drawScale
};
b2DebugDraw.prototype.GetDrawScale = function() {
  return this.m_drawScale
};
b2DebugDraw.prototype.SetLineThickness = function(lineThickness) {
  this.m_lineThickness = lineThickness
};
b2DebugDraw.prototype.GetLineThickness = function() {
  return this.m_lineThickness
};
b2DebugDraw.prototype.SetAlpha = function(alpha) {
  this.m_alpha = alpha
};
b2DebugDraw.prototype.GetAlpha = function() {
  return this.m_alpha
};
b2DebugDraw.prototype.SetFillAlpha = function(alpha) {
  this.m_fillAlpha = alpha
};
b2DebugDraw.prototype.GetFillAlpha = function() {
  return this.m_fillAlpha
};
b2DebugDraw.prototype.SetXFormScale = function(xformScale) {
  this.m_xformScale = xformScale
};
b2DebugDraw.prototype.GetXFormScale = function() {
  return this.m_xformScale
};
b2DebugDraw.prototype.Clear = function() {
  this.m_sprite.clearRect(0, 0, this.m_sprite.canvas.width, this.m_sprite.canvas.height)
};
b2DebugDraw.prototype.Y = function(y) {
  return this.m_sprite.canvas.height - y
};
b2DebugDraw.prototype.ToWorldPoint = function(localPoint) {
  return new b2Vec2(localPoint.x / this.m_drawScale, this.Y(localPoint.y) / this.m_drawScale)
};
b2DebugDraw.prototype.ColorStyle = function(color, alpha) {
  return"rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + alpha + ")"
};
b2DebugDraw.prototype.DrawPolygon = function(vertices, vertexCount, color) {
  this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
  this.m_sprite.graphics.moveTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale);
  for(var i = 1;i < vertexCount;i++) {
    this.m_sprite.graphics.lineTo(vertices[i].x * this.m_drawScale, vertices[i].y * this.m_drawScale)
  }
  this.m_sprite.graphics.lineTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale)
};
b2DebugDraw.prototype.DrawSolidPolygon = function(vertices, vertexCount, color) {
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));
  for(var i = 1;i < vertexCount;i++) {
    this.m_sprite.lineTo(vertices[i].x * this.m_drawScale, this.Y(vertices[i].y * this.m_drawScale))
  }
  this.m_sprite.lineTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));
  this.m_sprite.fill();
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawCircle = function(center, radius, color) {
  this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
  this.m_sprite.graphics.drawCircle(center.x * this.m_drawScale, center.y * this.m_drawScale, radius * this.m_drawScale)
};
b2DebugDraw.prototype.DrawSolidCircle = function(center, radius, axis, color) {
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
  this.m_sprite.beginPath();
  this.m_sprite.arc(center.x * this.m_drawScale, this.Y(center.y * this.m_drawScale), radius * this.m_drawScale, 0, Math.PI * 2, true);
  this.m_sprite.fill();
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawSegment = function(p1, p2, color) {
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(p1.x * this.m_drawScale, this.Y(p1.y * this.m_drawScale));
  this.m_sprite.lineTo(p2.x * this.m_drawScale, this.Y(p2.y * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawTransform = function(xf) {
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.strokeSyle = this.ColorStyle(new b2Color(255, 0, 0), this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
  this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col1.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col1.y) * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath();
  this.m_sprite.strokeSyle = this.ColorStyle(new b2Color(0, 255, 0), this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
  this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col2.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col2.y) * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.m_drawFlags = 0;
b2DebugDraw.prototype.m_sprite = null;
b2DebugDraw.prototype.m_drawScale = 1;
b2DebugDraw.prototype.m_lineThickness = 1;
b2DebugDraw.prototype.m_alpha = 1;
b2DebugDraw.prototype.m_fillAlpha = 1;
b2DebugDraw.prototype.m_xformScale = 1;var b2Sweep = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Sweep.prototype.__constructor = function() {
};
b2Sweep.prototype.__varz = function() {
  this.localCenter = new b2Vec2;
  this.c0 = new b2Vec2;
  this.c = new b2Vec2
};
b2Sweep.prototype.Set = function(other) {
  this.localCenter.SetV(other.localCenter);
  this.c0.SetV(other.c0);
  this.c.SetV(other.c);
  this.a0 = other.a0;
  this.a = other.a;
  this.t0 = other.t0
};
b2Sweep.prototype.Copy = function() {
  var copy = new b2Sweep;
  copy.localCenter.SetV(this.localCenter);
  copy.c0.SetV(this.c0);
  copy.c.SetV(this.c);
  copy.a0 = this.a0;
  copy.a = this.a;
  copy.t0 = this.t0;
  return copy
};
b2Sweep.prototype.GetTransform = function(xf, alpha) {
  xf.position.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
  xf.position.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
  var angle = (1 - alpha) * this.a0 + alpha * this.a;
  xf.R.Set(angle);
  var tMat = xf.R;
  xf.position.x -= tMat.col1.x * this.localCenter.x + tMat.col2.x * this.localCenter.y;
  xf.position.y -= tMat.col1.y * this.localCenter.x + tMat.col2.y * this.localCenter.y
};
b2Sweep.prototype.Advance = function(t) {
  if(this.t0 < t && 1 - this.t0 > Number.MIN_VALUE) {
    var alpha = (t - this.t0) / (1 - this.t0);
    this.c0.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
    this.c0.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
    this.a0 = (1 - alpha) * this.a0 + alpha * this.a;
    this.t0 = t
  }
};
b2Sweep.prototype.localCenter = new b2Vec2;
b2Sweep.prototype.c0 = new b2Vec2;
b2Sweep.prototype.c = new b2Vec2;
b2Sweep.prototype.a0 = null;
b2Sweep.prototype.a = null;
b2Sweep.prototype.t0 = null;var b2DistanceOutput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceOutput.prototype.__constructor = function() {
};
b2DistanceOutput.prototype.__varz = function() {
  this.pointA = new b2Vec2;
  this.pointB = new b2Vec2
};
b2DistanceOutput.prototype.pointA = new b2Vec2;
b2DistanceOutput.prototype.pointB = new b2Vec2;
b2DistanceOutput.prototype.distance = null;
b2DistanceOutput.prototype.iterations = 0;var b2Mat33 = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Mat33.prototype.__constructor = function(c1, c2, c3) {
  if(!c1 && !c2 && !c3) {
    this.col1.SetZero();
    this.col2.SetZero();
    this.col3.SetZero()
  }else {
    this.col1.SetV(c1);
    this.col2.SetV(c2);
    this.col3.SetV(c3)
  }
};
b2Mat33.prototype.__varz = function() {
  this.col1 = new b2Vec3;
  this.col2 = new b2Vec3;
  this.col3 = new b2Vec3
};
b2Mat33.prototype.SetVVV = function(c1, c2, c3) {
  this.col1.SetV(c1);
  this.col2.SetV(c2);
  this.col3.SetV(c3)
};
b2Mat33.prototype.Copy = function() {
  return new b2Mat33(this.col1, this.col2, this.col3)
};
b2Mat33.prototype.SetM = function(m) {
  this.col1.SetV(m.col1);
  this.col2.SetV(m.col2);
  this.col3.SetV(m.col3)
};
b2Mat33.prototype.AddM = function(m) {
  this.col1.x += m.col1.x;
  this.col1.y += m.col1.y;
  this.col1.z += m.col1.z;
  this.col2.x += m.col2.x;
  this.col2.y += m.col2.y;
  this.col2.z += m.col2.z;
  this.col3.x += m.col3.x;
  this.col3.y += m.col3.y;
  this.col3.z += m.col3.z
};
b2Mat33.prototype.SetIdentity = function() {
  this.col1.x = 1;
  this.col2.x = 0;
  this.col3.x = 0;
  this.col1.y = 0;
  this.col2.y = 1;
  this.col3.y = 0;
  this.col1.z = 0;
  this.col2.z = 0;
  this.col3.z = 1
};
b2Mat33.prototype.SetZero = function() {
  this.col1.x = 0;
  this.col2.x = 0;
  this.col3.x = 0;
  this.col1.y = 0;
  this.col2.y = 0;
  this.col3.y = 0;
  this.col1.z = 0;
  this.col2.z = 0;
  this.col3.z = 0
};
b2Mat33.prototype.Solve22 = function(out, bX, bY) {
  var a11 = this.col1.x;
  var a12 = this.col2.x;
  var a21 = this.col1.y;
  var a22 = this.col2.y;
  var det = a11 * a22 - a12 * a21;
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (a22 * bX - a12 * bY);
  out.y = det * (a11 * bY - a21 * bX);
  return out
};
b2Mat33.prototype.Solve33 = function(out, bX, bY, bZ) {
  var a11 = this.col1.x;
  var a21 = this.col1.y;
  var a31 = this.col1.z;
  var a12 = this.col2.x;
  var a22 = this.col2.y;
  var a32 = this.col2.z;
  var a13 = this.col3.x;
  var a23 = this.col3.y;
  var a33 = this.col3.z;
  var det = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (bX * (a22 * a33 - a32 * a23) + bY * (a32 * a13 - a12 * a33) + bZ * (a12 * a23 - a22 * a13));
  out.y = det * (a11 * (bY * a33 - bZ * a23) + a21 * (bZ * a13 - bX * a33) + a31 * (bX * a23 - bY * a13));
  out.z = det * (a11 * (a22 * bZ - a32 * bY) + a21 * (a32 * bX - a12 * bZ) + a31 * (a12 * bY - a22 * bX));
  return out
};
b2Mat33.prototype.col1 = new b2Vec3;
b2Mat33.prototype.col2 = new b2Vec3;
b2Mat33.prototype.col3 = new b2Vec3;var b2PositionSolverManifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2PositionSolverManifold.prototype.__constructor = function() {
  this.m_normal = new b2Vec2;
  this.m_separations = new Array(b2Settings.b2_maxManifoldPoints);
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2Vec2
  }
};
b2PositionSolverManifold.prototype.__varz = function() {
};
b2PositionSolverManifold.circlePointA = new b2Vec2;
b2PositionSolverManifold.circlePointB = new b2Vec2;
b2PositionSolverManifold.prototype.Initialize = function(cc) {
  b2Settings.b2Assert(cc.pointCount > 0);
  var i = 0;
  var clipPointX;
  var clipPointY;
  var tMat;
  var tVec;
  var planePointX;
  var planePointY;
  switch(cc.type) {
    case b2Manifold.e_circles:
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPoint;
      var pointAX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      var pointAY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.points[0].localPoint;
      var pointBX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      var pointBY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      var dX = pointBX - pointAX;
      var dY = pointBY - pointAY;
      var d2 = dX * dX + dY * dY;
      if(d2 > Number.MIN_VALUE * Number.MIN_VALUE) {
        var d = Math.sqrt(d2);
        this.m_normal.x = dX / d;
        this.m_normal.y = dY / d
      }else {
        this.m_normal.x = 1;
        this.m_normal.y = 0
      }
      this.m_points[0].x = 0.5 * (pointAX + pointBX);
      this.m_points[0].y = 0.5 * (pointAY + pointBY);
      this.m_separations[0] = dX * this.m_normal.x + dY * this.m_normal.y - cc.radius;
      break;
    case b2Manifold.e_faceA:
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPlaneNormal;
      this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPoint;
      planePointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      planePointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyB.m_xf.R;
      for(i = 0;i < cc.pointCount;++i) {
        tVec = cc.points[i].localPoint;
        clipPointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        clipPointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].x = clipPointX;
        this.m_points[i].y = clipPointY
      }
      break;
    case b2Manifold.e_faceB:
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.localPlaneNormal;
      this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.localPoint;
      planePointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      planePointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyA.m_xf.R;
      for(i = 0;i < cc.pointCount;++i) {
        tVec = cc.points[i].localPoint;
        clipPointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        clipPointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].Set(clipPointX, clipPointY)
      }
      this.m_normal.x *= -1;
      this.m_normal.y *= -1;
      break
  }
};
b2PositionSolverManifold.prototype.m_normal = null;
b2PositionSolverManifold.prototype.m_points = null;
b2PositionSolverManifold.prototype.m_separations = null;var b2OBB = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2OBB.prototype.__constructor = function() {
};
b2OBB.prototype.__varz = function() {
  this.R = new b2Mat22;
  this.center = new b2Vec2;
  this.extents = new b2Vec2
};
b2OBB.prototype.R = new b2Mat22;
b2OBB.prototype.center = new b2Vec2;
b2OBB.prototype.extents = new b2Vec2;var b2Pair = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Pair.prototype.__constructor = function() {
};
b2Pair.prototype.__varz = function() {
};
b2Pair.b2_nullProxy = b2Settings.USHRT_MAX;
b2Pair.e_pairBuffered = 1;
b2Pair.e_pairRemoved = 2;
b2Pair.e_pairFinal = 4;
b2Pair.prototype.SetBuffered = function() {
  this.status |= b2Pair.e_pairBuffered
};
b2Pair.prototype.ClearBuffered = function() {
  this.status &= ~b2Pair.e_pairBuffered
};
b2Pair.prototype.IsBuffered = function() {
  return(this.status & b2Pair.e_pairBuffered) == b2Pair.e_pairBuffered
};
b2Pair.prototype.SetRemoved = function() {
  this.status |= b2Pair.e_pairRemoved
};
b2Pair.prototype.ClearRemoved = function() {
  this.status &= ~b2Pair.e_pairRemoved
};
b2Pair.prototype.IsRemoved = function() {
  return(this.status & b2Pair.e_pairRemoved) == b2Pair.e_pairRemoved
};
b2Pair.prototype.SetFinal = function() {
  this.status |= b2Pair.e_pairFinal
};
b2Pair.prototype.IsFinal = function() {
  return(this.status & b2Pair.e_pairFinal) == b2Pair.e_pairFinal
};
b2Pair.prototype.userData = null;
b2Pair.prototype.proxy1 = null;
b2Pair.prototype.proxy2 = null;
b2Pair.prototype.next = null;
b2Pair.prototype.status = 0;var b2FixtureDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2FixtureDef.prototype.__constructor = function() {
  this.shape = null;
  this.userData = null;
  this.friction = 0.2;
  this.restitution = 0;
  this.density = 0;
  this.filter.categoryBits = 1;
  this.filter.maskBits = 65535;
  this.filter.groupIndex = 0;
  this.isSensor = false
};
b2FixtureDef.prototype.__varz = function() {
  this.filter = new b2FilterData
};
b2FixtureDef.prototype.shape = null;
b2FixtureDef.prototype.userData = null;
b2FixtureDef.prototype.friction = null;
b2FixtureDef.prototype.restitution = null;
b2FixtureDef.prototype.density = null;
b2FixtureDef.prototype.isSensor = null;
b2FixtureDef.prototype.filter = new b2FilterData;var b2ContactID = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactID.prototype.__constructor = function() {
  this.features._m_id = this
};
b2ContactID.prototype.__varz = function() {
  this.features = new Features
};
b2ContactID.prototype.Set = function(id) {
  key = id._key
};
b2ContactID.prototype.Copy = function() {
  var id = new b2ContactID;
  id.key = key;
  return id
};
b2ContactID.prototype.__defineSetter__("key", function() {
  return this._key
});
b2ContactID.prototype.__defineSetter__("key", function(value) {
  this._key = value;
  this.features._referenceEdge = this._key & 255;
  this.features._incidentEdge = (this._key & 65280) >> 8 & 255;
  this.features._incidentVertex = (this._key & 16711680) >> 16 & 255;
  this.features._flip = (this._key & 4278190080) >> 24 & 255
});
b2ContactID.prototype._key = 0;
b2ContactID.prototype.features = new Features;var b2Transform = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Transform.prototype.__constructor = function(pos, r) {
  if(pos) {
    this.position.SetV(pos);
    this.R.SetM(r)
  }
};
b2Transform.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.R = new b2Mat22
};
b2Transform.prototype.Initialize = function(pos, r) {
  this.position.SetV(pos);
  this.R.SetM(r)
};
b2Transform.prototype.SetIdentity = function() {
  this.position.SetZero();
  this.R.SetIdentity()
};
b2Transform.prototype.Set = function(x) {
  this.position.SetV(x.position);
  this.R.SetM(x.R)
};
b2Transform.prototype.GetAngle = function() {
  return Math.atan2(this.R.col1.y, this.R.col1.x)
};
b2Transform.prototype.position = new b2Vec2;
b2Transform.prototype.R = new b2Mat22;var b2EdgeShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2EdgeShape.prototype, b2Shape.prototype);
b2EdgeShape.prototype._super = b2Shape.prototype;
b2EdgeShape.prototype.__constructor = function(v1, v2) {
  this._super.__constructor.apply(this, []);
  this.m_type = b2Shape.e_edgeShape;
  this.m_prevEdge = null;
  this.m_nextEdge = null;
  this.m_v1 = v1;
  this.m_v2 = v2;
  this.m_direction.Set(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y);
  this.m_length = this.m_direction.Normalize();
  this.m_normal.Set(this.m_direction.y, -this.m_direction.x);
  this.m_coreV1.Set(-b2Settings.b2_toiSlop * (this.m_normal.x - this.m_direction.x) + this.m_v1.x, -b2Settings.b2_toiSlop * (this.m_normal.y - this.m_direction.y) + this.m_v1.y);
  this.m_coreV2.Set(-b2Settings.b2_toiSlop * (this.m_normal.x + this.m_direction.x) + this.m_v2.x, -b2Settings.b2_toiSlop * (this.m_normal.y + this.m_direction.y) + this.m_v2.y);
  this.m_cornerDir1 = this.m_normal;
  this.m_cornerDir2.Set(-this.m_normal.x, -this.m_normal.y)
};
b2EdgeShape.prototype.__varz = function() {
  this.s_supportVec = new b2Vec2;
  this.m_v1 = new b2Vec2;
  this.m_v2 = new b2Vec2;
  this.m_coreV1 = new b2Vec2;
  this.m_coreV2 = new b2Vec2;
  this.m_normal = new b2Vec2;
  this.m_direction = new b2Vec2;
  this.m_cornerDir1 = new b2Vec2;
  this.m_cornerDir2 = new b2Vec2
};
b2EdgeShape.prototype.SetPrevEdge = function(edge, core, cornerDir, convex) {
  this.m_prevEdge = edge;
  this.m_coreV1 = core;
  this.m_cornerDir1 = cornerDir;
  this.m_cornerConvex1 = convex
};
b2EdgeShape.prototype.SetNextEdge = function(edge, core, cornerDir, convex) {
  this.m_nextEdge = edge;
  this.m_coreV2 = core;
  this.m_cornerDir2 = cornerDir;
  this.m_cornerConvex2 = convex
};
b2EdgeShape.prototype.TestPoint = function(transform, p) {
  return false
};
b2EdgeShape.prototype.RayCast = function(output, input, transform) {
  var tMat;
  var rX = input.p2.x - input.p1.x;
  var rY = input.p2.y - input.p1.y;
  tMat = transform.R;
  var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
  var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
  var nX = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y) - v1Y;
  var nY = -(transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y) - v1X);
  var k_slop = 100 * Number.MIN_VALUE;
  var denom = -(rX * nX + rY * nY);
  if(denom > k_slop) {
    var bX = input.p1.x - v1X;
    var bY = input.p1.y - v1Y;
    var a = bX * nX + bY * nY;
    if(0 <= a && a <= input.maxFraction * denom) {
      var mu2 = -rX * bY + rY * bX;
      if(-k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)) {
        a /= denom;
        output.fraction = a;
        var nLen = Math.sqrt(nX * nX + nY * nY);
        output.normal.x = nX / nLen;
        output.normal.y = nY / nLen;
        return true
      }
    }
  }
  return false
};
b2EdgeShape.prototype.ComputeAABB = function(aabb, transform) {
  var tMat = transform.R;
  var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
  var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
  var v2X = transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y);
  var v2Y = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y);
  if(v1X < v2X) {
    aabb.lowerBound.x = v1X;
    aabb.upperBound.x = v2X
  }else {
    aabb.lowerBound.x = v2X;
    aabb.upperBound.x = v1X
  }
  if(v1Y < v2Y) {
    aabb.lowerBound.y = v1Y;
    aabb.upperBound.y = v2Y
  }else {
    aabb.lowerBound.y = v2Y;
    aabb.upperBound.y = v1Y
  }
};
b2EdgeShape.prototype.ComputeMass = function(massData, density) {
  massData.mass = 0;
  massData.center.SetV(this.m_v1);
  massData.I = 0
};
b2EdgeShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var v0 = new b2Vec2(normal.x * offset, normal.y * offset);
  var v1 = b2Math.MulX(xf, this.m_v1);
  var v2 = b2Math.MulX(xf, this.m_v2);
  var d1 = b2Math.Dot(normal, v1) - offset;
  var d2 = b2Math.Dot(normal, v2) - offset;
  if(d1 > 0) {
    if(d2 > 0) {
      return 0
    }else {
      v1.x = -d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
      v1.y = -d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y
    }
  }else {
    if(d2 > 0) {
      v2.x = -d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
      v2.y = -d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y
    }else {
    }
  }
  c.x = (v0.x + v1.x + v2.x) / 3;
  c.y = (v0.y + v1.y + v2.y) / 3;
  return 0.5 * ((v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x))
};
b2EdgeShape.prototype.GetLength = function() {
  return this.m_length
};
b2EdgeShape.prototype.GetVertex1 = function() {
  return this.m_v1
};
b2EdgeShape.prototype.GetVertex2 = function() {
  return this.m_v2
};
b2EdgeShape.prototype.GetCoreVertex1 = function() {
  return this.m_coreV1
};
b2EdgeShape.prototype.GetCoreVertex2 = function() {
  return this.m_coreV2
};
b2EdgeShape.prototype.GetNormalVector = function() {
  return this.m_normal
};
b2EdgeShape.prototype.GetDirectionVector = function() {
  return this.m_direction
};
b2EdgeShape.prototype.GetCorner1Vector = function() {
  return this.m_cornerDir1
};
b2EdgeShape.prototype.GetCorner2Vector = function() {
  return this.m_cornerDir2
};
b2EdgeShape.prototype.Corner1IsConvex = function() {
  return this.m_cornerConvex1
};
b2EdgeShape.prototype.Corner2IsConvex = function() {
  return this.m_cornerConvex2
};
b2EdgeShape.prototype.GetFirstVertex = function(xf) {
  var tMat = xf.R;
  return new b2Vec2(xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y), xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y))
};
b2EdgeShape.prototype.GetNextEdge = function() {
  return this.m_nextEdge
};
b2EdgeShape.prototype.GetPrevEdge = function() {
  return this.m_prevEdge
};
b2EdgeShape.prototype.Support = function(xf, dX, dY) {
  var tMat = xf.R;
  var v1X = xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y);
  var v1Y = xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y);
  var v2X = xf.position.x + (tMat.col1.x * this.m_coreV2.x + tMat.col2.x * this.m_coreV2.y);
  var v2Y = xf.position.y + (tMat.col1.y * this.m_coreV2.x + tMat.col2.y * this.m_coreV2.y);
  if(v1X * dX + v1Y * dY > v2X * dX + v2Y * dY) {
    this.s_supportVec.x = v1X;
    this.s_supportVec.y = v1Y
  }else {
    this.s_supportVec.x = v2X;
    this.s_supportVec.y = v2Y
  }
  return this.s_supportVec
};
b2EdgeShape.prototype.s_supportVec = new b2Vec2;
b2EdgeShape.prototype.m_v1 = new b2Vec2;
b2EdgeShape.prototype.m_v2 = new b2Vec2;
b2EdgeShape.prototype.m_coreV1 = new b2Vec2;
b2EdgeShape.prototype.m_coreV2 = new b2Vec2;
b2EdgeShape.prototype.m_length = null;
b2EdgeShape.prototype.m_normal = new b2Vec2;
b2EdgeShape.prototype.m_direction = new b2Vec2;
b2EdgeShape.prototype.m_cornerDir1 = new b2Vec2;
b2EdgeShape.prototype.m_cornerDir2 = new b2Vec2;
b2EdgeShape.prototype.m_cornerConvex1 = null;
b2EdgeShape.prototype.m_cornerConvex2 = null;
b2EdgeShape.prototype.m_nextEdge = null;
b2EdgeShape.prototype.m_prevEdge = null;var b2BuoyancyController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2BuoyancyController.prototype, b2Controller.prototype);
b2BuoyancyController.prototype._super = b2Controller.prototype;
b2BuoyancyController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2BuoyancyController.prototype.__varz = function() {
  this.normal = new b2Vec2(0, -1);
  this.velocity = new b2Vec2(0, 0)
};
b2BuoyancyController.prototype.Step = function(step) {
  if(!m_bodyList) {
    return
  }
  if(this.useWorldGravity) {
    this.gravity = this.GetWorld().GetGravity().Copy()
  }
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(body.IsAwake() == false) {
      continue
    }
    var areac = new b2Vec2;
    var massc = new b2Vec2;
    var area = 0;
    var mass = 0;
    for(var fixture = body.GetFixtureList();fixture;fixture = fixture.GetNext()) {
      var sc = new b2Vec2;
      var sarea = fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, body.GetTransform(), sc);
      area += sarea;
      areac.x += sarea * sc.x;
      areac.y += sarea * sc.y;
      var shapeDensity;
      if(this.useDensity) {
        shapeDensity = 1
      }else {
        shapeDensity = 1
      }
      mass += sarea * shapeDensity;
      massc.x += sarea * sc.x * shapeDensity;
      massc.y += sarea * sc.y * shapeDensity
    }
    areac.x /= area;
    areac.y /= area;
    massc.x /= mass;
    massc.y /= mass;
    if(area < Number.MIN_VALUE) {
      continue
    }
    var buoyancyForce = this.gravity.GetNegative();
    buoyancyForce.Multiply(this.density * area);
    body.ApplyForce(buoyancyForce, massc);
    var dragForce = body.GetLinearVelocityFromWorldPoint(areac);
    dragForce.Subtract(this.velocity);
    dragForce.Multiply(-this.linearDrag * area);
    body.ApplyForce(dragForce, areac);
    body.ApplyTorque(-body.GetInertia() / body.GetMass() * area * body.GetAngularVelocity() * this.angularDrag)
  }
};
b2BuoyancyController.prototype.Draw = function(debugDraw) {
  var r = 1E3;
  var p1 = new b2Vec2;
  var p2 = new b2Vec2;
  p1.x = this.normal.x * this.offset + this.normal.y * r;
  p1.y = this.normal.y * this.offset - this.normal.x * r;
  p2.x = this.normal.x * this.offset - this.normal.y * r;
  p2.y = this.normal.y * this.offset + this.normal.x * r;
  var color = new b2Color(0, 0, 1);
  debugDraw.DrawSegment(p1, p2, color)
};
b2BuoyancyController.prototype.normal = new b2Vec2(0, -1);
b2BuoyancyController.prototype.offset = 0;
b2BuoyancyController.prototype.density = 0;
b2BuoyancyController.prototype.velocity = new b2Vec2(0, 0);
b2BuoyancyController.prototype.linearDrag = 2;
b2BuoyancyController.prototype.angularDrag = 1;
b2BuoyancyController.prototype.useDensity = false;
b2BuoyancyController.prototype.useWorldGravity = true;
b2BuoyancyController.prototype.gravity = null;var b2Body = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Body.prototype.__constructor = function(bd, world) {
  this.m_flags = 0;
  if(bd.bullet) {
    this.m_flags |= b2Body.e_bulletFlag
  }
  if(bd.fixedRotation) {
    this.m_flags |= b2Body.e_fixedRotationFlag
  }
  if(bd.allowSleep) {
    this.m_flags |= b2Body.e_allowSleepFlag
  }
  if(bd.awake) {
    this.m_flags |= b2Body.e_awakeFlag
  }
  if(bd.active) {
    this.m_flags |= b2Body.e_activeFlag
  }
  this.m_world = world;
  this.m_xf.position.SetV(bd.position);
  this.m_xf.R.Set(bd.angle);
  this.m_sweep.localCenter.SetZero();
  this.m_sweep.t0 = 1;
  this.m_sweep.a0 = this.m_sweep.a = bd.angle;
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  this.m_sweep.c.x += this.m_xf.position.x;
  this.m_sweep.c.y += this.m_xf.position.y;
  this.m_sweep.c0.SetV(this.m_sweep.c);
  this.m_jointList = null;
  this.m_controllerList = null;
  this.m_contactList = null;
  this.m_controllerCount = 0;
  this.m_prev = null;
  this.m_next = null;
  this.m_linearVelocity.SetV(bd.linearVelocity);
  this.m_angularVelocity = bd.angularVelocity;
  this.m_linearDamping = bd.linearDamping;
  this.m_angularDamping = bd.angularDamping;
  this.m_force.Set(0, 0);
  this.m_torque = 0;
  this.m_sleepTime = 0;
  this.m_type = bd.type;
  if(this.m_type == b2Body.b2_dynamicBody) {
    this.m_mass = 1;
    this.m_invMass = 1
  }else {
    this.m_mass = 0;
    this.m_invMass = 0
  }
  this.m_I = 0;
  this.m_invI = 0;
  this.m_inertiaScale = bd.inertiaScale;
  this.m_userData = bd.userData;
  this.m_fixtureList = null;
  this.m_fixtureCount = 0
};
b2Body.prototype.__varz = function() {
  this.m_xf = new b2Transform;
  this.m_sweep = new b2Sweep;
  this.m_linearVelocity = new b2Vec2;
  this.m_force = new b2Vec2
};
b2Body.b2_staticBody = 0;
b2Body.b2_kinematicBody = 1;
b2Body.b2_dynamicBody = 2;
b2Body.s_xf1 = new b2Transform;
b2Body.e_islandFlag = 1;
b2Body.e_awakeFlag = 2;
b2Body.e_allowSleepFlag = 4;
b2Body.e_bulletFlag = 8;
b2Body.e_fixedRotationFlag = 16;
b2Body.e_activeFlag = 32;
b2Body.prototype.connectEdges = function(s1, s2, angle1) {
  var angle2 = Math.atan2(s2.GetDirectionVector().y, s2.GetDirectionVector().x);
  var coreOffset = Math.tan((angle2 - angle1) * 0.5);
  var core = b2Math.MulFV(coreOffset, s2.GetDirectionVector());
  core = b2Math.SubtractVV(core, s2.GetNormalVector());
  core = b2Math.MulFV(b2Settings.b2_toiSlop, core);
  core = b2Math.AddVV(core, s2.GetVertex1());
  var cornerDir = b2Math.AddVV(s1.GetDirectionVector(), s2.GetDirectionVector());
  cornerDir.Normalize();
  var convex = b2Math.Dot(s1.GetDirectionVector(), s2.GetNormalVector()) > 0;
  s1.SetNextEdge(s2, core, cornerDir, convex);
  s2.SetPrevEdge(s1, core, cornerDir, convex);
  return angle2
};
b2Body.prototype.SynchronizeFixtures = function() {
  var xf1 = b2Body.s_xf1;
  xf1.R.Set(this.m_sweep.a0);
  var tMat = xf1.R;
  var tVec = this.m_sweep.localCenter;
  xf1.position.x = this.m_sweep.c0.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  xf1.position.y = this.m_sweep.c0.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var f;
  var broadPhase = this.m_world.m_contactManager.m_broadPhase;
  for(f = this.m_fixtureList;f;f = f.m_next) {
    f.Synchronize(broadPhase, xf1, this.m_xf)
  }
};
b2Body.prototype.SynchronizeTransform = function() {
  this.m_xf.R.Set(this.m_sweep.a);
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_xf.position.x = this.m_sweep.c.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  this.m_xf.position.y = this.m_sweep.c.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y)
};
b2Body.prototype.ShouldCollide = function(other) {
  if(this.m_type != b2Body.b2_dynamicBody && other.m_type != b2Body.b2_dynamicBody) {
    return false
  }
  for(var jn = this.m_jointList;jn;jn = jn.next) {
    if(jn.other == other) {
      if(jn.joint.m_collideConnected == false) {
        return false
      }
    }
  }
  return true
};
b2Body.prototype.Advance = function(t) {
  this.m_sweep.Advance(t);
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_sweep.a = this.m_sweep.a0;
  this.SynchronizeTransform()
};
b2Body.prototype.CreateFixture = function(def) {
  if(this.m_world.IsLocked() == true) {
    return null
  }
  var fixture = new b2Fixture;
  fixture.Create(this, this.m_xf, def);
  if(this.m_flags & b2Body.e_activeFlag) {
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    fixture.CreateProxy(broadPhase, this.m_xf)
  }
  fixture.m_next = this.m_fixtureList;
  this.m_fixtureList = fixture;
  ++this.m_fixtureCount;
  fixture.m_body = this;
  if(fixture.m_density > 0) {
    this.ResetMassData()
  }
  this.m_world.m_flags |= b2World.e_newFixture;
  return fixture
};
b2Body.prototype.CreateFixture2 = function(shape, density) {
  var def = new b2FixtureDef;
  def.shape = shape;
  def.density = density;
  return this.CreateFixture(def)
};
b2Body.prototype.DestroyFixture = function(fixture) {
  if(this.m_world.IsLocked() == true) {
    return
  }
  var node = this.m_fixtureList;
  var ppF = null;
  var found = false;
  while(node != null) {
    if(node == fixture) {
      if(ppF) {
        ppF.m_next = fixture.m_next
      }else {
        this.m_fixtureList = fixture.m_next
      }
      found = true;
      break
    }
    ppF = node;
    node = node.m_next
  }
  var edge = this.m_contactList;
  while(edge) {
    var c = edge.contact;
    edge = edge.next;
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();
    if(fixture == fixtureA || fixture == fixtureB) {
      this.m_world.m_contactManager.Destroy(c)
    }
  }
  if(this.m_flags & b2Body.e_activeFlag) {
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    fixture.DestroyProxy(broadPhase)
  }else {
  }
  fixture.Destroy();
  fixture.m_body = null;
  fixture.m_next = null;
  --this.m_fixtureCount;
  this.ResetMassData()
};
b2Body.prototype.SetPositionAndAngle = function(position, angle) {
  var f;
  if(this.m_world.IsLocked() == true) {
    return
  }
  this.m_xf.R.Set(angle);
  this.m_xf.position.SetV(position);
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  this.m_sweep.c.x += this.m_xf.position.x;
  this.m_sweep.c.y += this.m_xf.position.y;
  this.m_sweep.c0.SetV(this.m_sweep.c);
  this.m_sweep.a0 = this.m_sweep.a = angle;
  var broadPhase = this.m_world.m_contactManager.m_broadPhase;
  for(f = this.m_fixtureList;f;f = f.m_next) {
    f.Synchronize(broadPhase, this.m_xf, this.m_xf)
  }
  this.m_world.m_contactManager.FindNewContacts()
};
b2Body.prototype.SetTransform = function(xf) {
  this.SetPositionAndAngle(xf.position, xf.GetAngle())
};
b2Body.prototype.GetTransform = function() {
  return this.m_xf
};
b2Body.prototype.GetPosition = function() {
  return this.m_xf.position
};
b2Body.prototype.SetPosition = function(position) {
  this.SetPositionAndAngle(position, this.GetAngle())
};
b2Body.prototype.GetAngle = function() {
  return this.m_sweep.a
};
b2Body.prototype.SetAngle = function(angle) {
  this.SetPositionAndAngle(this.GetPosition(), angle)
};
b2Body.prototype.GetWorldCenter = function() {
  return this.m_sweep.c
};
b2Body.prototype.GetLocalCenter = function() {
  return this.m_sweep.localCenter
};
b2Body.prototype.SetLinearVelocity = function(v) {
  if(this.m_type == b2Body.b2_staticBody) {
    return
  }
  this.m_linearVelocity.SetV(v)
};
b2Body.prototype.GetLinearVelocity = function() {
  return this.m_linearVelocity
};
b2Body.prototype.SetAngularVelocity = function(omega) {
  if(this.m_type == b2Body.b2_staticBody) {
    return
  }
  this.m_angularVelocity = omega
};
b2Body.prototype.GetAngularVelocity = function() {
  return this.m_angularVelocity
};
b2Body.prototype.GetDefinition = function() {
  var bd = new b2BodyDef;
  bd.type = this.GetType();
  bd.allowSleep = (this.m_flags & b2Body.e_allowSleepFlag) == b2Body.e_allowSleepFlag;
  bd.angle = this.GetAngle();
  bd.angularDamping = this.m_angularDamping;
  bd.angularVelocity = this.m_angularVelocity;
  bd.fixedRotation = (this.m_flags & b2Body.e_fixedRotationFlag) == b2Body.e_fixedRotationFlag;
  bd.bullet = (this.m_flags & b2Body.e_bulletFlag) == b2Body.e_bulletFlag;
  bd.awake = (this.m_flags & b2Body.e_awakeFlag) == b2Body.e_awakeFlag;
  bd.linearDamping = this.m_linearDamping;
  bd.linearVelocity.SetV(this.GetLinearVelocity());
  bd.position = this.GetPosition();
  bd.userData = this.GetUserData();
  return bd
};
b2Body.prototype.ApplyForce = function(force, point) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_force.x += force.x;
  this.m_force.y += force.y;
  this.m_torque += (point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x
};
b2Body.prototype.ApplyTorque = function(torque) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_torque += torque
};
b2Body.prototype.ApplyImpulse = function(impulse, point) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_linearVelocity.x += this.m_invMass * impulse.x;
  this.m_linearVelocity.y += this.m_invMass * impulse.y;
  this.m_angularVelocity += this.m_invI * ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * impulse.x)
};
b2Body.prototype.Split = function(callback) {
  var linearVelocity = this.GetLinearVelocity().Copy();
  var angularVelocity = this.GetAngularVelocity();
  var center = this.GetWorldCenter();
  var body1 = this;
  var body2 = this.m_world.CreateBody(this.GetDefinition());
  var prev;
  for(var f = body1.m_fixtureList;f;) {
    if(callback(f)) {
      var next = f.m_next;
      if(prev) {
        prev.m_next = next
      }else {
        body1.m_fixtureList = next
      }
      body1.m_fixtureCount--;
      f.m_next = body2.m_fixtureList;
      body2.m_fixtureList = f;
      body2.m_fixtureCount++;
      f.m_body = body2;
      f = next
    }else {
      prev = f;
      f = f.m_next
    }
  }
  body1.ResetMassData();
  body2.ResetMassData();
  var center1 = body1.GetWorldCenter();
  var center2 = body2.GetWorldCenter();
  var velocity1 = b2Math.AddVV(linearVelocity, b2Math.CrossFV(angularVelocity, b2Math.SubtractVV(center1, center)));
  var velocity2 = b2Math.AddVV(linearVelocity, b2Math.CrossFV(angularVelocity, b2Math.SubtractVV(center2, center)));
  body1.SetLinearVelocity(velocity1);
  body2.SetLinearVelocity(velocity2);
  body1.SetAngularVelocity(angularVelocity);
  body2.SetAngularVelocity(angularVelocity);
  body1.SynchronizeFixtures();
  body2.SynchronizeFixtures();
  return body2
};
b2Body.prototype.Merge = function(other) {
  var f;
  for(f = other.m_fixtureList;f;) {
    var next = f.m_next;
    other.m_fixtureCount--;
    f.m_next = this.m_fixtureList;
    this.m_fixtureList = f;
    this.m_fixtureCount++;
    f.m_body = body2;
    f = next
  }
  body1.m_fixtureCount = 0;
  var body1 = this;
  var body2 = other;
  var center1 = body1.GetWorldCenter();
  var center2 = body2.GetWorldCenter();
  var velocity1 = body1.GetLinearVelocity().Copy();
  var velocity2 = body2.GetLinearVelocity().Copy();
  var angular1 = body1.GetAngularVelocity();
  var angular = body2.GetAngularVelocity();
  body1.ResetMassData();
  this.SynchronizeFixtures()
};
b2Body.prototype.GetMass = function() {
  return this.m_mass
};
b2Body.prototype.GetInertia = function() {
  return this.m_I
};
b2Body.prototype.GetMassData = function(data) {
  data.mass = this.m_mass;
  data.I = this.m_I;
  data.center.SetV(this.m_sweep.localCenter)
};
b2Body.prototype.SetMassData = function(massData) {
  b2Settings.b2Assert(this.m_world.IsLocked() == false);
  if(this.m_world.IsLocked() == true) {
    return
  }
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  this.m_invMass = 0;
  this.m_I = 0;
  this.m_invI = 0;
  this.m_mass = massData.mass;
  if(this.m_mass <= 0) {
    this.m_mass = 1
  }
  this.m_invMass = 1 / this.m_mass;
  if(massData.I > 0 && (this.m_flags & b2Body.e_fixedRotationFlag) == 0) {
    this.m_I = massData.I - this.m_mass * (massData.center.x * massData.center.x + massData.center.y * massData.center.y);
    this.m_invI = 1 / this.m_I
  }
  var oldCenter = this.m_sweep.c.Copy();
  this.m_sweep.localCenter.SetV(massData.center);
  this.m_sweep.c0.SetV(b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - oldCenter.y);
  this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - oldCenter.x)
};
b2Body.prototype.ResetMassData = function() {
  this.m_mass = 0;
  this.m_invMass = 0;
  this.m_I = 0;
  this.m_invI = 0;
  this.m_sweep.localCenter.SetZero();
  if(this.m_type == b2Body.b2_staticBody || this.m_type == b2Body.b2_kinematicBody) {
    return
  }
  var center = b2Vec2.Make(0, 0);
  for(var f = this.m_fixtureList;f;f = f.m_next) {
    if(f.m_density == 0) {
      continue
    }
    var massData = f.GetMassData();
    this.m_mass += massData.mass;
    center.x += massData.center.x * massData.mass;
    center.y += massData.center.y * massData.mass;
    this.m_I += massData.I
  }
  if(this.m_mass > 0) {
    this.m_invMass = 1 / this.m_mass;
    center.x *= this.m_invMass;
    center.y *= this.m_invMass
  }else {
    this.m_mass = 1;
    this.m_invMass = 1
  }
  if(this.m_I > 0 && (this.m_flags & b2Body.e_fixedRotationFlag) == 0) {
    this.m_I -= this.m_mass * (center.x * center.x + center.y * center.y);
    this.m_I *= this.m_inertiaScale;
    b2Settings.b2Assert(this.m_I > 0);
    this.m_invI = 1 / this.m_I
  }else {
    this.m_I = 0;
    this.m_invI = 0
  }
  var oldCenter = this.m_sweep.c.Copy();
  this.m_sweep.localCenter.SetV(center);
  this.m_sweep.c0.SetV(b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - oldCenter.y);
  this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - oldCenter.x)
};
b2Body.prototype.GetWorldPoint = function(localPoint) {
  var A = this.m_xf.R;
  var u = new b2Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
  u.x += this.m_xf.position.x;
  u.y += this.m_xf.position.y;
  return u
};
b2Body.prototype.GetWorldVector = function(localVector) {
  return b2Math.MulMV(this.m_xf.R, localVector)
};
b2Body.prototype.GetLocalPoint = function(worldPoint) {
  return b2Math.MulXT(this.m_xf, worldPoint)
};
b2Body.prototype.GetLocalVector = function(worldVector) {
  return b2Math.MulTMV(this.m_xf.R, worldVector)
};
b2Body.prototype.GetLinearVelocityFromWorldPoint = function(worldPoint) {
  return new b2Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x))
};
b2Body.prototype.GetLinearVelocityFromLocalPoint = function(localPoint) {
  var A = this.m_xf.R;
  var worldPoint = new b2Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
  worldPoint.x += this.m_xf.position.x;
  worldPoint.y += this.m_xf.position.y;
  return new b2Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x))
};
b2Body.prototype.GetLinearDamping = function() {
  return this.m_linearDamping
};
b2Body.prototype.SetLinearDamping = function(linearDamping) {
  this.m_linearDamping = linearDamping
};
b2Body.prototype.GetAngularDamping = function() {
  return this.m_angularDamping
};
b2Body.prototype.SetAngularDamping = function(angularDamping) {
  this.m_angularDamping = angularDamping
};
b2Body.prototype.SetType = function(type) {
  if(this.m_type == type) {
    return
  }
  this.m_type = type;
  this.ResetMassData();
  if(this.m_type == b2Body.b2_staticBody) {
    this.m_linearVelocity.SetZero();
    this.m_angularVelocity = 0
  }
  this.SetAwake(true);
  this.m_force.SetZero();
  this.m_torque = 0;
  for(var ce = this.m_contactList;ce;ce = ce.next) {
    ce.contact.FlagForFiltering()
  }
};
b2Body.prototype.GetType = function() {
  return this.m_type
};
b2Body.prototype.SetBullet = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_bulletFlag
  }else {
    this.m_flags &= ~b2Body.e_bulletFlag
  }
};
b2Body.prototype.IsBullet = function() {
  return(this.m_flags & b2Body.e_bulletFlag) == b2Body.e_bulletFlag
};
b2Body.prototype.SetSleepingAllowed = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_allowSleepFlag
  }else {
    this.m_flags &= ~b2Body.e_allowSleepFlag;
    this.SetAwake(true)
  }
};
b2Body.prototype.SetAwake = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_awakeFlag;
    this.m_sleepTime = 0
  }else {
    this.m_flags &= ~b2Body.e_awakeFlag;
    this.m_sleepTime = 0;
    this.m_linearVelocity.SetZero();
    this.m_angularVelocity = 0;
    this.m_force.SetZero();
    this.m_torque = 0
  }
};
b2Body.prototype.IsAwake = function() {
  return(this.m_flags & b2Body.e_awakeFlag) == b2Body.e_awakeFlag
};
b2Body.prototype.SetFixedRotation = function(fixed) {
  if(fixed) {
    this.m_flags |= b2Body.e_fixedRotationFlag
  }else {
    this.m_flags &= ~b2Body.e_fixedRotationFlag
  }
  this.ResetMassData()
};
b2Body.prototype.IsFixedRotation = function() {
  return(this.m_flags & b2Body.e_fixedRotationFlag) == b2Body.e_fixedRotationFlag
};
b2Body.prototype.SetActive = function(flag) {
  if(flag == this.IsActive()) {
    return
  }
  var broadPhase;
  var f;
  if(flag) {
    this.m_flags |= b2Body.e_activeFlag;
    broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for(f = this.m_fixtureList;f;f = f.m_next) {
      f.CreateProxy(broadPhase, this.m_xf)
    }
  }else {
    this.m_flags &= ~b2Body.e_activeFlag;
    broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for(f = this.m_fixtureList;f;f = f.m_next) {
      f.DestroyProxy(broadPhase)
    }
    var ce = this.m_contactList;
    while(ce) {
      var ce0 = ce;
      ce = ce.next;
      this.m_world.m_contactManager.Destroy(ce0.contact)
    }
    this.m_contactList = null
  }
};
b2Body.prototype.IsActive = function() {
  return(this.m_flags & b2Body.e_activeFlag) == b2Body.e_activeFlag
};
b2Body.prototype.IsSleepingAllowed = function() {
  return(this.m_flags & b2Body.e_allowSleepFlag) == b2Body.e_allowSleepFlag
};
b2Body.prototype.GetFixtureList = function() {
  return this.m_fixtureList
};
b2Body.prototype.GetJointList = function() {
  return this.m_jointList
};
b2Body.prototype.GetControllerList = function() {
  return this.m_controllerList
};
b2Body.prototype.GetContactList = function() {
  return this.m_contactList
};
b2Body.prototype.GetNext = function() {
  return this.m_next
};
b2Body.prototype.GetUserData = function() {
  return this.m_userData
};
b2Body.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Body.prototype.GetWorld = function() {
  return this.m_world
};
b2Body.prototype.m_flags = 0;
b2Body.prototype.m_type = 0;
b2Body.prototype.m_islandIndex = 0;
b2Body.prototype.m_xf = new b2Transform;
b2Body.prototype.m_sweep = new b2Sweep;
b2Body.prototype.m_linearVelocity = new b2Vec2;
b2Body.prototype.m_angularVelocity = null;
b2Body.prototype.m_force = new b2Vec2;
b2Body.prototype.m_torque = null;
b2Body.prototype.m_world = null;
b2Body.prototype.m_prev = null;
b2Body.prototype.m_next = null;
b2Body.prototype.m_fixtureList = null;
b2Body.prototype.m_fixtureCount = 0;
b2Body.prototype.m_controllerList = null;
b2Body.prototype.m_controllerCount = 0;
b2Body.prototype.m_jointList = null;
b2Body.prototype.m_contactList = null;
b2Body.prototype.m_mass = null;
b2Body.prototype.m_invMass = null;
b2Body.prototype.m_I = null;
b2Body.prototype.m_invI = null;
b2Body.prototype.m_inertiaScale = null;
b2Body.prototype.m_linearDamping = null;
b2Body.prototype.m_angularDamping = null;
b2Body.prototype.m_sleepTime = null;
b2Body.prototype.m_userData = null;var b2ContactImpulse = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactImpulse.prototype.__constructor = function() {
};
b2ContactImpulse.prototype.__varz = function() {
  this.normalImpulses = new Array(b2Settings.b2_maxManifoldPoints);
  this.tangentImpulses = new Array(b2Settings.b2_maxManifoldPoints)
};
b2ContactImpulse.prototype.normalImpulses = new Array(b2Settings.b2_maxManifoldPoints);
b2ContactImpulse.prototype.tangentImpulses = new Array(b2Settings.b2_maxManifoldPoints);var b2TensorDampingController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2TensorDampingController.prototype, b2Controller.prototype);
b2TensorDampingController.prototype._super = b2Controller.prototype;
b2TensorDampingController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2TensorDampingController.prototype.__varz = function() {
  this.T = new b2Mat22
};
b2TensorDampingController.prototype.SetAxisAligned = function(xDamping, yDamping) {
  this.T.col1.x = -xDamping;
  this.T.col1.y = 0;
  this.T.col2.x = 0;
  this.T.col2.y = -yDamping;
  if(xDamping > 0 || yDamping > 0) {
    this.maxTimestep = 1 / Math.max(xDamping, yDamping)
  }else {
    this.maxTimestep = 0
  }
};
b2TensorDampingController.prototype.Step = function(step) {
  var timestep = step.dt;
  if(timestep <= Number.MIN_VALUE) {
    return
  }
  if(timestep > this.maxTimestep && this.maxTimestep > 0) {
    timestep = this.maxTimestep
  }
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    var damping = body.GetWorldVector(b2Math.MulMV(this.T, body.GetLocalVector(body.GetLinearVelocity())));
    body.SetLinearVelocity(new b2Vec2(body.GetLinearVelocity().x + damping.x * timestep, body.GetLinearVelocity().y + damping.y * timestep))
  }
};
b2TensorDampingController.prototype.T = new b2Mat22;
b2TensorDampingController.prototype.maxTimestep = 0;var b2ManifoldPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ManifoldPoint.prototype.__constructor = function() {
  this.Reset()
};
b2ManifoldPoint.prototype.__varz = function() {
  this.m_localPoint = new b2Vec2;
  this.m_id = new b2ContactID
};
b2ManifoldPoint.prototype.Reset = function() {
  this.m_localPoint.SetZero();
  this.m_normalImpulse = 0;
  this.m_tangentImpulse = 0;
  this.m_id.key = 0
};
b2ManifoldPoint.prototype.Set = function(m) {
  this.m_localPoint.SetV(m.m_localPoint);
  this.m_normalImpulse = m.m_normalImpulse;
  this.m_tangentImpulse = m.m_tangentImpulse;
  this.m_id.Set(m.m_id)
};
b2ManifoldPoint.prototype.m_localPoint = new b2Vec2;
b2ManifoldPoint.prototype.m_normalImpulse = null;
b2ManifoldPoint.prototype.m_tangentImpulse = null;
b2ManifoldPoint.prototype.m_id = new b2ContactID;var b2PolygonShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolygonShape.prototype, b2Shape.prototype);
b2PolygonShape.prototype._super = b2Shape.prototype;
b2PolygonShape.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.m_type = b2Shape.e_polygonShape;
  this.m_centroid = new b2Vec2;
  this.m_vertices = new Array;
  this.m_normals = new Array
};
b2PolygonShape.prototype.__varz = function() {
};
b2PolygonShape.AsArray = function(vertices, vertexCount) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsArray(vertices, vertexCount);
  return polygonShape
};
b2PolygonShape.AsVector = function(vertices, vertexCount) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsVector(vertices, vertexCount);
  return polygonShape
};
b2PolygonShape.AsBox = function(hx, hy) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsBox(hx, hy);
  return polygonShape
};
b2PolygonShape.AsOrientedBox = function(hx, hy, center, angle) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsOrientedBox(hx, hy, center, angle);
  return polygonShape
};
b2PolygonShape.AsEdge = function(v1, v2) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsEdge(v1, v2);
  return polygonShape
};
b2PolygonShape.ComputeCentroid = function(vs, count) {
  var c = new b2Vec2;
  var area = 0;
  var p1X = 0;
  var p1Y = 0;
  var inv3 = 1 / 3;
  for(var i = 0;i < count;++i) {
    var p2 = vs[i];
    var p3 = i + 1 < count ? vs[parseInt(i + 1)] : vs[0];
    var e1X = p2.x - p1X;
    var e1Y = p2.y - p1Y;
    var e2X = p3.x - p1X;
    var e2Y = p3.y - p1Y;
    var D = e1X * e2Y - e1Y * e2X;
    var triangleArea = 0.5 * D;
    area += triangleArea;
    c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
    c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y)
  }
  c.x *= 1 / area;
  c.y *= 1 / area;
  return c
};
b2PolygonShape.ComputeOBB = function(obb, vs, count) {
  var i = 0;
  var p = new Array(count + 1);
  for(i = 0;i < count;++i) {
    p[i] = vs[i]
  }
  p[count] = p[0];
  var minArea = Number.MAX_VALUE;
  for(i = 1;i <= count;++i) {
    var root = p[parseInt(i - 1)];
    var uxX = p[i].x - root.x;
    var uxY = p[i].y - root.y;
    var length = Math.sqrt(uxX * uxX + uxY * uxY);
    uxX /= length;
    uxY /= length;
    var uyX = -uxY;
    var uyY = uxX;
    var lowerX = Number.MAX_VALUE;
    var lowerY = Number.MAX_VALUE;
    var upperX = -Number.MAX_VALUE;
    var upperY = -Number.MAX_VALUE;
    for(var j = 0;j < count;++j) {
      var dX = p[j].x - root.x;
      var dY = p[j].y - root.y;
      var rX = uxX * dX + uxY * dY;
      var rY = uyX * dX + uyY * dY;
      if(rX < lowerX) {
        lowerX = rX
      }
      if(rY < lowerY) {
        lowerY = rY
      }
      if(rX > upperX) {
        upperX = rX
      }
      if(rY > upperY) {
        upperY = rY
      }
    }
    var area = (upperX - lowerX) * (upperY - lowerY);
    if(area < 0.95 * minArea) {
      minArea = area;
      obb.R.col1.x = uxX;
      obb.R.col1.y = uxY;
      obb.R.col2.x = uyX;
      obb.R.col2.y = uyY;
      var centerX = 0.5 * (lowerX + upperX);
      var centerY = 0.5 * (lowerY + upperY);
      var tMat = obb.R;
      obb.center.x = root.x + (tMat.col1.x * centerX + tMat.col2.x * centerY);
      obb.center.y = root.y + (tMat.col1.y * centerX + tMat.col2.y * centerY);
      obb.extents.x = 0.5 * (upperX - lowerX);
      obb.extents.y = 0.5 * (upperY - lowerY)
    }
  }
};
b2PolygonShape.s_mat = new b2Mat22;
b2PolygonShape.prototype.Validate = function() {
  return false
};
b2PolygonShape.prototype.Reserve = function(count) {
  for(var i = this.m_vertices.length;i < count;i++) {
    this.m_vertices[i] = new b2Vec2;
    this.m_normals[i] = new b2Vec2
  }
};
b2PolygonShape.prototype.Copy = function() {
  var s = new b2PolygonShape;
  s.Set(this);
  return s
};
b2PolygonShape.prototype.Set = function(other) {
  this._super.Set.apply(this, [other]);
  if(isInstanceOf(other, b2PolygonShape)) {
    var other2 = other;
    this.m_centroid.SetV(other2.m_centroid);
    this.m_vertexCount = other2.m_vertexCount;
    this.Reserve(this.m_vertexCount);
    for(var i = 0;i < this.m_vertexCount;i++) {
      this.m_vertices[i].SetV(other2.m_vertices[i]);
      this.m_normals[i].SetV(other2.m_normals[i])
    }
  }
};
b2PolygonShape.prototype.SetAsArray = function(vertices, vertexCount) {
  var v = new Array;
  for(var i = 0, tVec = null;i < vertices.length, tVec = vertices[i];i++) {
    v.push(tVec)
  }
  this.SetAsVector(v, vertexCount)
};
b2PolygonShape.prototype.SetAsVector = function(vertices, vertexCount) {
  if(typeof vertexCount == "undefined") {
    vertexCount = vertices.length
  }
  b2Settings.b2Assert(2 <= vertexCount);
  this.m_vertexCount = vertexCount;
  this.Reserve(vertexCount);
  var i = 0;
  for(i = 0;i < this.m_vertexCount;i++) {
    this.m_vertices[i].SetV(vertices[i])
  }
  for(i = 0;i < this.m_vertexCount;++i) {
    var i1 = i;
    var i2 = i + 1 < this.m_vertexCount ? i + 1 : 0;
    var edge = b2Math.SubtractVV(this.m_vertices[i2], this.m_vertices[i1]);
    b2Settings.b2Assert(edge.LengthSquared() > Number.MIN_VALUE);
    this.m_normals[i].SetV(b2Math.CrossVF(edge, 1));
    this.m_normals[i].Normalize()
  }
  this.m_centroid = b2PolygonShape.ComputeCentroid(this.m_vertices, this.m_vertexCount)
};
b2PolygonShape.prototype.SetAsBox = function(hx, hy) {
  this.m_vertexCount = 4;
  this.Reserve(4);
  this.m_vertices[0].Set(-hx, -hy);
  this.m_vertices[1].Set(hx, -hy);
  this.m_vertices[2].Set(hx, hy);
  this.m_vertices[3].Set(-hx, hy);
  this.m_normals[0].Set(0, -1);
  this.m_normals[1].Set(1, 0);
  this.m_normals[2].Set(0, 1);
  this.m_normals[3].Set(-1, 0);
  this.m_centroid.SetZero()
};
b2PolygonShape.prototype.SetAsOrientedBox = function(hx, hy, center, angle) {
  this.m_vertexCount = 4;
  this.Reserve(4);
  this.m_vertices[0].Set(-hx, -hy);
  this.m_vertices[1].Set(hx, -hy);
  this.m_vertices[2].Set(hx, hy);
  this.m_vertices[3].Set(-hx, hy);
  this.m_normals[0].Set(0, -1);
  this.m_normals[1].Set(1, 0);
  this.m_normals[2].Set(0, 1);
  this.m_normals[3].Set(-1, 0);
  this.m_centroid = center;
  var xf = new b2Transform;
  xf.position = center;
  xf.R.Set(angle);
  for(var i = 0;i < this.m_vertexCount;++i) {
    this.m_vertices[i] = b2Math.MulX(xf, this.m_vertices[i]);
    this.m_normals[i] = b2Math.MulMV(xf.R, this.m_normals[i])
  }
};
b2PolygonShape.prototype.SetAsEdge = function(v1, v2) {
  this.m_vertexCount = 2;
  this.Reserve(2);
  this.m_vertices[0].SetV(v1);
  this.m_vertices[1].SetV(v2);
  this.m_centroid.x = 0.5 * (v1.x + v2.x);
  this.m_centroid.y = 0.5 * (v1.y + v2.y);
  this.m_normals[0] = b2Math.CrossVF(b2Math.SubtractVV(v2, v1), 1);
  this.m_normals[0].Normalize();
  this.m_normals[1].x = -this.m_normals[0].x;
  this.m_normals[1].y = -this.m_normals[0].y
};
b2PolygonShape.prototype.TestPoint = function(xf, p) {
  var tVec;
  var tMat = xf.R;
  var tX = p.x - xf.position.x;
  var tY = p.y - xf.position.y;
  var pLocalX = tX * tMat.col1.x + tY * tMat.col1.y;
  var pLocalY = tX * tMat.col2.x + tY * tMat.col2.y;
  for(var i = 0;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    tX = pLocalX - tVec.x;
    tY = pLocalY - tVec.y;
    tVec = this.m_normals[i];
    var dot = tVec.x * tX + tVec.y * tY;
    if(dot > 0) {
      return false
    }
  }
  return true
};
b2PolygonShape.prototype.RayCast = function(output, input, transform) {
  var lower = 0;
  var upper = input.maxFraction;
  var tX;
  var tY;
  var tMat;
  var tVec;
  tX = input.p1.x - transform.position.x;
  tY = input.p1.y - transform.position.y;
  tMat = transform.R;
  var p1X = tX * tMat.col1.x + tY * tMat.col1.y;
  var p1Y = tX * tMat.col2.x + tY * tMat.col2.y;
  tX = input.p2.x - transform.position.x;
  tY = input.p2.y - transform.position.y;
  tMat = transform.R;
  var p2X = tX * tMat.col1.x + tY * tMat.col1.y;
  var p2Y = tX * tMat.col2.x + tY * tMat.col2.y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var index = -1;
  for(var i = 0;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    tX = tVec.x - p1X;
    tY = tVec.y - p1Y;
    tVec = this.m_normals[i];
    var numerator = tVec.x * tX + tVec.y * tY;
    var denominator = tVec.x * dX + tVec.y * dY;
    if(denominator == 0) {
      if(numerator < 0) {
        return false
      }
    }else {
      if(denominator < 0 && numerator < lower * denominator) {
        lower = numerator / denominator;
        index = i
      }else {
        if(denominator > 0 && numerator < upper * denominator) {
          upper = numerator / denominator
        }
      }
    }
    if(upper < lower - Number.MIN_VALUE) {
      return false
    }
  }
  if(index >= 0) {
    output.fraction = lower;
    tMat = transform.R;
    tVec = this.m_normals[index];
    output.normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    output.normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    return true
  }
  return false
};
b2PolygonShape.prototype.ComputeAABB = function(aabb, xf) {
  var tMat = xf.R;
  var tVec = this.m_vertices[0];
  var lowerX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var lowerY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var upperX = lowerX;
  var upperY = lowerY;
  for(var i = 1;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    var vX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var vY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    lowerX = lowerX < vX ? lowerX : vX;
    lowerY = lowerY < vY ? lowerY : vY;
    upperX = upperX > vX ? upperX : vX;
    upperY = upperY > vY ? upperY : vY
  }
  aabb.lowerBound.x = lowerX - this.m_radius;
  aabb.lowerBound.y = lowerY - this.m_radius;
  aabb.upperBound.x = upperX + this.m_radius;
  aabb.upperBound.y = upperY + this.m_radius
};
b2PolygonShape.prototype.ComputeMass = function(massData, density) {
  if(this.m_vertexCount == 2) {
    massData.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x);
    massData.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y);
    massData.mass = 0;
    massData.I = 0;
    return
  }
  var centerX = 0;
  var centerY = 0;
  var area = 0;
  var I = 0;
  var p1X = 0;
  var p1Y = 0;
  var k_inv3 = 1 / 3;
  for(var i = 0;i < this.m_vertexCount;++i) {
    var p2 = this.m_vertices[i];
    var p3 = i + 1 < this.m_vertexCount ? this.m_vertices[parseInt(i + 1)] : this.m_vertices[0];
    var e1X = p2.x - p1X;
    var e1Y = p2.y - p1Y;
    var e2X = p3.x - p1X;
    var e2Y = p3.y - p1Y;
    var D = e1X * e2Y - e1Y * e2X;
    var triangleArea = 0.5 * D;
    area += triangleArea;
    centerX += triangleArea * k_inv3 * (p1X + p2.x + p3.x);
    centerY += triangleArea * k_inv3 * (p1Y + p2.y + p3.y);
    var px = p1X;
    var py = p1Y;
    var ex1 = e1X;
    var ey1 = e1Y;
    var ex2 = e2X;
    var ey2 = e2Y;
    var intx2 = k_inv3 * (0.25 * (ex1 * ex1 + ex2 * ex1 + ex2 * ex2) + (px * ex1 + px * ex2)) + 0.5 * px * px;
    var inty2 = k_inv3 * (0.25 * (ey1 * ey1 + ey2 * ey1 + ey2 * ey2) + (py * ey1 + py * ey2)) + 0.5 * py * py;
    I += D * (intx2 + inty2)
  }
  massData.mass = density * area;
  centerX *= 1 / area;
  centerY *= 1 / area;
  massData.center.Set(centerX, centerY);
  massData.I = density * I
};
b2PolygonShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var normalL = b2Math.MulTMV(xf.R, normal);
  var offsetL = offset - b2Math.Dot(normal, xf.position);
  var depths = new Array;
  var diveCount = 0;
  var intoIndex = -1;
  var outoIndex = -1;
  var lastSubmerged = false;
  var i = 0;
  for(i = 0;i < this.m_vertexCount;++i) {
    depths[i] = b2Math.Dot(normalL, this.m_vertices[i]) - offsetL;
    var isSubmerged = depths[i] < -Number.MIN_VALUE;
    if(i > 0) {
      if(isSubmerged) {
        if(!lastSubmerged) {
          intoIndex = i - 1;
          diveCount++
        }
      }else {
        if(lastSubmerged) {
          outoIndex = i - 1;
          diveCount++
        }
      }
    }
    lastSubmerged = isSubmerged
  }
  switch(diveCount) {
    case 0:
      if(lastSubmerged) {
        var md = new b2MassData;
        this.ComputeMass(md, 1);
        c.SetV(b2Math.MulX(xf, md.center));
        return md.mass
      }else {
        return 0
      }
      break;
    case 1:
      if(intoIndex == -1) {
        intoIndex = this.m_vertexCount - 1
      }else {
        outoIndex = this.m_vertexCount - 1
      }
      break
  }
  var intoIndex2 = (intoIndex + 1) % this.m_vertexCount;
  var outoIndex2 = (outoIndex + 1) % this.m_vertexCount;
  var intoLamdda = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
  var outoLamdda = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);
  var intoVec = new b2Vec2(this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * intoLamdda, this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
  var outoVec = new b2Vec2(this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda, this.m_vertices[outoIndex].y * (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);
  var area = 0;
  var center = new b2Vec2;
  var p2 = this.m_vertices[intoIndex2];
  var p3;
  i = intoIndex2;
  while(i != outoIndex2) {
    i = (i + 1) % this.m_vertexCount;
    if(i == outoIndex2) {
      p3 = outoVec
    }else {
      p3 = this.m_vertices[i]
    }
    var triangleArea = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
    area += triangleArea;
    center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
    center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;
    p2 = p3
  }
  center.Multiply(1 / area);
  c.SetV(b2Math.MulX(xf, center));
  return area
};
b2PolygonShape.prototype.GetVertexCount = function() {
  return this.m_vertexCount
};
b2PolygonShape.prototype.GetVertices = function() {
  return this.m_vertices
};
b2PolygonShape.prototype.GetNormals = function() {
  return this.m_normals
};
b2PolygonShape.prototype.GetSupport = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_vertexCount;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return bestIndex
};
b2PolygonShape.prototype.GetSupportVertex = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_vertexCount;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return this.m_vertices[bestIndex]
};
b2PolygonShape.prototype.m_centroid = null;
b2PolygonShape.prototype.m_vertices = null;
b2PolygonShape.prototype.m_normals = null;
b2PolygonShape.prototype.m_vertexCount = 0;var b2Fixture = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Fixture.prototype.__constructor = function() {
  this.m_aabb = new b2AABB;
  this.m_userData = null;
  this.m_body = null;
  this.m_next = null;
  this.m_shape = null;
  this.m_density = 0;
  this.m_friction = 0;
  this.m_restitution = 0
};
b2Fixture.prototype.__varz = function() {
  this.m_filter = new b2FilterData
};
b2Fixture.prototype.Create = function(body, xf, def) {
  this.m_userData = def.userData;
  this.m_friction = def.friction;
  this.m_restitution = def.restitution;
  this.m_body = body;
  this.m_next = null;
  this.m_filter = def.filter.Copy();
  this.m_isSensor = def.isSensor;
  this.m_shape = def.shape.Copy();
  this.m_density = def.density
};
b2Fixture.prototype.Destroy = function() {
  this.m_shape = null
};
b2Fixture.prototype.CreateProxy = function(broadPhase, xf) {
  this.m_shape.ComputeAABB(this.m_aabb, xf);
  this.m_proxy = broadPhase.CreateProxy(this.m_aabb, this)
};
b2Fixture.prototype.DestroyProxy = function(broadPhase) {
  if(this.m_proxy == null) {
    return
  }
  broadPhase.DestroyProxy(this.m_proxy);
  this.m_proxy = null
};
b2Fixture.prototype.Synchronize = function(broadPhase, transform1, transform2) {
  if(!this.m_proxy) {
    return
  }
  var aabb1 = new b2AABB;
  var aabb2 = new b2AABB;
  this.m_shape.ComputeAABB(aabb1, transform1);
  this.m_shape.ComputeAABB(aabb2, transform2);
  this.m_aabb.Combine(aabb1, aabb2);
  var displacement = b2Math.SubtractVV(transform2.position, transform1.position);
  broadPhase.MoveProxy(this.m_proxy, this.m_aabb, displacement)
};
b2Fixture.prototype.GetType = function() {
  return this.m_shape.GetType()
};
b2Fixture.prototype.GetShape = function() {
  return this.m_shape
};
b2Fixture.prototype.SetSensor = function(sensor) {
  if(this.m_isSensor == sensor) {
    return
  }
  this.m_isSensor = sensor;
  if(this.m_body == null) {
    return
  }
  var edge = this.m_body.GetContactList();
  while(edge) {
    var contact = edge.contact;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    if(fixtureA == this || fixtureB == this) {
      contact.SetSensor(fixtureA.IsSensor() || fixtureB.IsSensor())
    }
    edge = edge.next
  }
};
b2Fixture.prototype.IsSensor = function() {
  return this.m_isSensor
};
b2Fixture.prototype.SetFilterData = function(filter) {
  this.m_filter = filter.Copy();
  if(this.m_body) {
    return
  }
  var edge = this.m_body.GetContactList();
  while(edge) {
    var contact = edge.contact;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    if(fixtureA == this || fixtureB == this) {
      contact.FlagForFiltering()
    }
    edge = edge.next
  }
};
b2Fixture.prototype.GetFilterData = function() {
  return this.m_filter.Copy()
};
b2Fixture.prototype.GetBody = function() {
  return this.m_body
};
b2Fixture.prototype.GetNext = function() {
  return this.m_next
};
b2Fixture.prototype.GetUserData = function() {
  return this.m_userData
};
b2Fixture.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Fixture.prototype.TestPoint = function(p) {
  return this.m_shape.TestPoint(this.m_body.GetTransform(), p)
};
b2Fixture.prototype.RayCast = function(output, input) {
  return this.m_shape.RayCast(output, input, this.m_body.GetTransform())
};
b2Fixture.prototype.GetMassData = function(massData) {
  if(massData == null) {
    massData = new b2MassData
  }
  this.m_shape.ComputeMass(massData, this.m_density);
  return massData
};
b2Fixture.prototype.SetDensity = function(density) {
  this.m_density = density
};
b2Fixture.prototype.GetDensity = function() {
  return this.m_density
};
b2Fixture.prototype.GetFriction = function() {
  return this.m_friction
};
b2Fixture.prototype.SetFriction = function(friction) {
  this.m_friction = friction
};
b2Fixture.prototype.GetRestitution = function() {
  return this.m_restitution
};
b2Fixture.prototype.SetRestitution = function(restitution) {
  this.m_restitution = restitution
};
b2Fixture.prototype.GetAABB = function() {
  return this.m_aabb
};
b2Fixture.prototype.m_massData = null;
b2Fixture.prototype.m_aabb = null;
b2Fixture.prototype.m_density = null;
b2Fixture.prototype.m_next = null;
b2Fixture.prototype.m_body = null;
b2Fixture.prototype.m_shape = null;
b2Fixture.prototype.m_friction = null;
b2Fixture.prototype.m_restitution = null;
b2Fixture.prototype.m_proxy = null;
b2Fixture.prototype.m_filter = new b2FilterData;
b2Fixture.prototype.m_isSensor = null;
b2Fixture.prototype.m_userData = null;var b2DynamicTreeNode = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreeNode.prototype.__constructor = function() {
};
b2DynamicTreeNode.prototype.__varz = function() {
  this.aabb = new b2AABB
};
b2DynamicTreeNode.prototype.IsLeaf = function() {
  return this.child1 == null
};
b2DynamicTreeNode.prototype.userData = null;
b2DynamicTreeNode.prototype.aabb = new b2AABB;
b2DynamicTreeNode.prototype.parent = null;
b2DynamicTreeNode.prototype.child1 = null;
b2DynamicTreeNode.prototype.child2 = null;var b2BodyDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BodyDef.prototype.__constructor = function() {
  this.userData = null;
  this.position.Set(0, 0);
  this.angle = 0;
  this.linearVelocity.Set(0, 0);
  this.angularVelocity = 0;
  this.linearDamping = 0;
  this.angularDamping = 0;
  this.allowSleep = true;
  this.awake = true;
  this.fixedRotation = false;
  this.bullet = false;
  this.type = b2Body.b2_staticBody;
  this.active = true;
  this.inertiaScale = 1
};
b2BodyDef.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.linearVelocity = new b2Vec2
};
b2BodyDef.prototype.type = 0;
b2BodyDef.prototype.position = new b2Vec2;
b2BodyDef.prototype.angle = null;
b2BodyDef.prototype.linearVelocity = new b2Vec2;
b2BodyDef.prototype.angularVelocity = null;
b2BodyDef.prototype.linearDamping = null;
b2BodyDef.prototype.angularDamping = null;
b2BodyDef.prototype.allowSleep = null;
b2BodyDef.prototype.awake = null;
b2BodyDef.prototype.fixedRotation = null;
b2BodyDef.prototype.bullet = null;
b2BodyDef.prototype.active = null;
b2BodyDef.prototype.userData = null;
b2BodyDef.prototype.inertiaScale = null;var b2DynamicTreeBroadPhase = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreeBroadPhase.prototype.__constructor = function() {
};
b2DynamicTreeBroadPhase.prototype.__varz = function() {
  this.m_tree = new b2DynamicTree;
  this.m_moveBuffer = new Array;
  this.m_pairBuffer = new Array
};
b2DynamicTreeBroadPhase.prototype.BufferMove = function(proxy) {
  this.m_moveBuffer[this.m_moveBuffer.length] = proxy
};
b2DynamicTreeBroadPhase.prototype.UnBufferMove = function(proxy) {
  var i = this.m_moveBuffer.indexOf(proxy);
  this.m_moveBuffer.splice(i, 1)
};
b2DynamicTreeBroadPhase.prototype.ComparePairs = function(pair1, pair2) {
  return 0
};
b2DynamicTreeBroadPhase.prototype.CreateProxy = function(aabb, userData) {
  var proxy = this.m_tree.CreateProxy(aabb, userData);
  ++this.m_proxyCount;
  this.BufferMove(proxy);
  return proxy
};
b2DynamicTreeBroadPhase.prototype.DestroyProxy = function(proxy) {
  this.UnBufferMove(proxy);
  --this.m_proxyCount;
  this.m_tree.DestroyProxy(proxy)
};
b2DynamicTreeBroadPhase.prototype.MoveProxy = function(proxy, aabb, displacement) {
  var buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
  if(buffer) {
    this.BufferMove(proxy)
  }
};
b2DynamicTreeBroadPhase.prototype.TestOverlap = function(proxyA, proxyB) {
  var aabbA = this.m_tree.GetFatAABB(proxyA);
  var aabbB = this.m_tree.GetFatAABB(proxyB);
  return aabbA.TestOverlap(aabbB)
};
b2DynamicTreeBroadPhase.prototype.GetUserData = function(proxy) {
  return this.m_tree.GetUserData(proxy)
};
b2DynamicTreeBroadPhase.prototype.GetFatAABB = function(proxy) {
  return this.m_tree.GetFatAABB(proxy)
};
b2DynamicTreeBroadPhase.prototype.GetProxyCount = function() {
  return this.m_proxyCount
};
b2DynamicTreeBroadPhase.prototype.UpdatePairs = function(callback) {
  this.m_pairCount = 0;
  for(var i = 0, queryProxy = null;i < this.m_moveBuffer.length, queryProxy = this.m_moveBuffer[i];i++) {
    var that = this;
    function QueryCallback(proxy) {
      if(proxy == queryProxy) {
        return true
      }
      if(that.m_pairCount == that.m_pairBuffer.length) {
        that.m_pairBuffer[that.m_pairCount] = new b2DynamicTreePair
      }
      var pair = that.m_pairBuffer[that.m_pairCount];
      pair.proxyA = proxy < queryProxy ? proxy : queryProxy;
      pair.proxyB = proxy >= queryProxy ? proxy : queryProxy;
      ++that.m_pairCount;
      return true
    }
    var fatAABB = this.m_tree.GetFatAABB(queryProxy);
    this.m_tree.Query(QueryCallback, fatAABB)
  }
  this.m_moveBuffer.length = 0;
  for(var i = 0;i < this.m_pairCount;) {
    var primaryPair = this.m_pairBuffer[i];
    var userDataA = this.m_tree.GetUserData(primaryPair.proxyA);
    var userDataB = this.m_tree.GetUserData(primaryPair.proxyB);
    callback(userDataA, userDataB);
    ++i;
    while(i < this.m_pairCount) {
      var pair = this.m_pairBuffer[i];
      if(pair.proxyA != primaryPair.proxyA || pair.proxyB != primaryPair.proxyB) {
        break
      }
      ++i
    }
  }
};
b2DynamicTreeBroadPhase.prototype.Query = function(callback, aabb) {
  this.m_tree.Query(callback, aabb)
};
b2DynamicTreeBroadPhase.prototype.RayCast = function(callback, input) {
  this.m_tree.RayCast(callback, input)
};
b2DynamicTreeBroadPhase.prototype.Validate = function() {
};
b2DynamicTreeBroadPhase.prototype.Rebalance = function(iterations) {
  this.m_tree.Rebalance(iterations)
};
b2DynamicTreeBroadPhase.prototype.m_tree = new b2DynamicTree;
b2DynamicTreeBroadPhase.prototype.m_proxyCount = 0;
b2DynamicTreeBroadPhase.prototype.m_moveBuffer = new Array;
b2DynamicTreeBroadPhase.prototype.m_pairBuffer = new Array;
b2DynamicTreeBroadPhase.prototype.m_pairCount = 0;var b2BroadPhase = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BroadPhase.prototype.__constructor = function(worldAABB) {
  var i = 0;
  this.m_pairManager.Initialize(this);
  this.m_worldAABB = worldAABB;
  this.m_proxyCount = 0;
  this.m_bounds = new Array;
  for(i = 0;i < 2;i++) {
    this.m_bounds[i] = new Array
  }
  var dX = worldAABB.upperBound.x - worldAABB.lowerBound.x;
  var dY = worldAABB.upperBound.y - worldAABB.lowerBound.y;
  this.m_quantizationFactor.x = b2Settings.USHRT_MAX / dX;
  this.m_quantizationFactor.y = b2Settings.USHRT_MAX / dY;
  this.m_timeStamp = 1;
  this.m_queryResultCount = 0
};
b2BroadPhase.prototype.__varz = function() {
  this.m_pairManager = new b2PairManager;
  this.m_proxyPool = new Array;
  this.m_querySortKeys = new Array;
  this.m_queryResults = new Array;
  this.m_quantizationFactor = new b2Vec2
};
b2BroadPhase.BinarySearch = function(bounds, count, value) {
  var low = 0;
  var high = count - 1;
  while(low <= high) {
    var mid = Math.round((low + high) / 2);
    var bound = bounds[mid];
    if(bound.value > value) {
      high = mid - 1
    }else {
      if(bound.value < value) {
        low = mid + 1
      }else {
        return parseInt(mid)
      }
    }
  }
  return parseInt(low)
};
b2BroadPhase.s_validate = false;
b2BroadPhase.b2_invalid = b2Settings.USHRT_MAX;
b2BroadPhase.b2_nullEdge = b2Settings.USHRT_MAX;
b2BroadPhase.prototype.ComputeBounds = function(lowerValues, upperValues, aabb) {
  var minVertexX = aabb.lowerBound.x;
  var minVertexY = aabb.lowerBound.y;
  minVertexX = b2Math.Min(minVertexX, this.m_worldAABB.upperBound.x);
  minVertexY = b2Math.Min(minVertexY, this.m_worldAABB.upperBound.y);
  minVertexX = b2Math.Max(minVertexX, this.m_worldAABB.lowerBound.x);
  minVertexY = b2Math.Max(minVertexY, this.m_worldAABB.lowerBound.y);
  var maxVertexX = aabb.upperBound.x;
  var maxVertexY = aabb.upperBound.y;
  maxVertexX = b2Math.Min(maxVertexX, this.m_worldAABB.upperBound.x);
  maxVertexY = b2Math.Min(maxVertexY, this.m_worldAABB.upperBound.y);
  maxVertexX = b2Math.Max(maxVertexX, this.m_worldAABB.lowerBound.x);
  maxVertexY = b2Math.Max(maxVertexY, this.m_worldAABB.lowerBound.y);
  lowerValues[0] = parseInt(this.m_quantizationFactor.x * (minVertexX - this.m_worldAABB.lowerBound.x)) & b2Settings.USHRT_MAX - 1;
  upperValues[0] = parseInt(this.m_quantizationFactor.x * (maxVertexX - this.m_worldAABB.lowerBound.x)) % 65535 | 1;
  lowerValues[1] = parseInt(this.m_quantizationFactor.y * (minVertexY - this.m_worldAABB.lowerBound.y)) & b2Settings.USHRT_MAX - 1;
  upperValues[1] = parseInt(this.m_quantizationFactor.y * (maxVertexY - this.m_worldAABB.lowerBound.y)) % 65535 | 1
};
b2BroadPhase.prototype.TestOverlapValidate = function(p1, p2) {
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var bound1 = bounds[p1.lowerBounds[axis]];
    var bound2 = bounds[p2.upperBounds[axis]];
    if(bound1.value > bound2.value) {
      return false
    }
    bound1 = bounds[p1.upperBounds[axis]];
    bound2 = bounds[p2.lowerBounds[axis]];
    if(bound1.value < bound2.value) {
      return false
    }
  }
  return true
};
b2BroadPhase.prototype.QueryAxis = function(lowerQueryOut, upperQueryOut, lowerValue, upperValue, bounds, boundCount, axis) {
  var lowerQuery = b2BroadPhase.BinarySearch(bounds, boundCount, lowerValue);
  var upperQuery = b2BroadPhase.BinarySearch(bounds, boundCount, upperValue);
  var bound;
  for(var j = lowerQuery;j < upperQuery;++j) {
    bound = bounds[j];
    if(bound.IsLower()) {
      this.IncrementOverlapCount(bound.proxy)
    }
  }
  if(lowerQuery > 0) {
    var i = lowerQuery - 1;
    bound = bounds[i];
    var s = bound.stabbingCount;
    while(s) {
      bound = bounds[i];
      if(bound.IsLower()) {
        var proxy = bound.proxy;
        if(lowerQuery <= proxy.upperBounds[axis]) {
          this.IncrementOverlapCount(bound.proxy);
          --s
        }
      }
      --i
    }
  }
  lowerQueryOut[0] = lowerQuery;
  upperQueryOut[0] = upperQuery
};
b2BroadPhase.prototype.IncrementOverlapCount = function(proxy) {
  if(proxy.timeStamp < this.m_timeStamp) {
    proxy.timeStamp = this.m_timeStamp;
    proxy.overlapCount = 1
  }else {
    proxy.overlapCount = 2;
    this.m_queryResults[this.m_queryResultCount] = proxy;
    ++this.m_queryResultCount
  }
};
b2BroadPhase.prototype.IncrementTimeStamp = function() {
  if(this.m_timeStamp == b2Settings.USHRT_MAX) {
    for(var i = 0;i < this.m_proxyPool.length;++i) {
      this.m_proxyPool[i].timeStamp = 0
    }
    this.m_timeStamp = 1
  }else {
    ++this.m_timeStamp
  }
};
b2BroadPhase.prototype.InRange = function(aabb) {
  var dX;
  var dY;
  var d2X;
  var d2Y;
  dX = aabb.lowerBound.x;
  dY = aabb.lowerBound.y;
  dX -= this.m_worldAABB.upperBound.x;
  dY -= this.m_worldAABB.upperBound.y;
  d2X = this.m_worldAABB.lowerBound.x;
  d2Y = this.m_worldAABB.lowerBound.y;
  d2X -= aabb.upperBound.x;
  d2Y -= aabb.upperBound.y;
  dX = b2Math.Max(dX, d2X);
  dY = b2Math.Max(dY, d2Y);
  return b2Math.Max(dX, dY) < 0
};
b2BroadPhase.prototype.CreateProxy = function(aabb, userData) {
  var index = 0;
  var proxy;
  var i = 0;
  var j = 0;
  if(!this.m_freeProxy) {
    this.m_freeProxy = this.m_proxyPool[this.m_proxyCount] = new b2Proxy;
    this.m_freeProxy.next = null;
    this.m_freeProxy.timeStamp = 0;
    this.m_freeProxy.overlapCount = b2BroadPhase.b2_invalid;
    this.m_freeProxy.userData = null;
    for(i = 0;i < 2;i++) {
      j = this.m_proxyCount * 2;
      this.m_bounds[i][j++] = new b2Bound;
      this.m_bounds[i][j] = new b2Bound
    }
  }
  proxy = this.m_freeProxy;
  this.m_freeProxy = proxy.next;
  proxy.overlapCount = 0;
  proxy.userData = userData;
  var boundCount = 2 * this.m_proxyCount;
  var lowerValues = new Array;
  var upperValues = new Array;
  this.ComputeBounds(lowerValues, upperValues, aabb);
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = 0;
    var upperIndex = 0;
    var lowerIndexOut = new Array;
    lowerIndexOut.push(lowerIndex);
    var upperIndexOut = new Array;
    upperIndexOut.push(upperIndex);
    this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[axis], upperValues[axis], bounds, boundCount, axis);
    lowerIndex = lowerIndexOut[0];
    upperIndex = upperIndexOut[0];
    bounds.splice(upperIndex, 0, bounds[bounds.length - 1]);
    bounds.length--;
    bounds.splice(lowerIndex, 0, bounds[bounds.length - 1]);
    bounds.length--;
    ++upperIndex;
    var tBound1 = bounds[lowerIndex];
    var tBound2 = bounds[upperIndex];
    tBound1.value = lowerValues[axis];
    tBound1.proxy = proxy;
    tBound2.value = upperValues[axis];
    tBound2.proxy = proxy;
    var tBoundAS3 = bounds[parseInt(lowerIndex - 1)];
    tBound1.stabbingCount = lowerIndex == 0 ? 0 : tBoundAS3.stabbingCount;
    tBoundAS3 = bounds[parseInt(upperIndex - 1)];
    tBound2.stabbingCount = tBoundAS3.stabbingCount;
    for(index = lowerIndex;index < upperIndex;++index) {
      tBoundAS3 = bounds[index];
      tBoundAS3.stabbingCount++
    }
    for(index = lowerIndex;index < boundCount + 2;++index) {
      tBound1 = bounds[index];
      var proxy2 = tBound1.proxy;
      if(tBound1.IsLower()) {
        proxy2.lowerBounds[axis] = index
      }else {
        proxy2.upperBounds[axis] = index
      }
    }
  }
  ++this.m_proxyCount;
  for(i = 0;i < this.m_queryResultCount;++i) {
    this.m_pairManager.AddBufferedPair(proxy, this.m_queryResults[i])
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  return proxy
};
b2BroadPhase.prototype.DestroyProxy = function(proxy_) {
  var proxy = proxy_;
  var tBound1;
  var tBound2;
  var boundCount = 2 * this.m_proxyCount;
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = proxy.lowerBounds[axis];
    var upperIndex = proxy.upperBounds[axis];
    tBound1 = bounds[lowerIndex];
    var lowerValue = tBound1.value;
    tBound2 = bounds[upperIndex];
    var upperValue = tBound2.value;
    bounds.splice(upperIndex, 1);
    bounds.splice(lowerIndex, 1);
    bounds.push(tBound1);
    bounds.push(tBound2);
    var tEnd = boundCount - 2;
    for(var index = lowerIndex;index < tEnd;++index) {
      tBound1 = bounds[index];
      var proxy2 = tBound1.proxy;
      if(tBound1.IsLower()) {
        proxy2.lowerBounds[axis] = index
      }else {
        proxy2.upperBounds[axis] = index
      }
    }
    tEnd = upperIndex - 1;
    for(var index2 = lowerIndex;index2 < tEnd;++index2) {
      tBound1 = bounds[index2];
      tBound1.stabbingCount--
    }
    var ignore = new Array;
    this.QueryAxis(ignore, ignore, lowerValue, upperValue, bounds, boundCount - 2, axis)
  }
  for(var i = 0;i < this.m_queryResultCount;++i) {
    this.m_pairManager.RemoveBufferedPair(proxy, this.m_queryResults[i])
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  proxy.userData = null;
  proxy.overlapCount = b2BroadPhase.b2_invalid;
  proxy.lowerBounds[0] = b2BroadPhase.b2_invalid;
  proxy.lowerBounds[1] = b2BroadPhase.b2_invalid;
  proxy.upperBounds[0] = b2BroadPhase.b2_invalid;
  proxy.upperBounds[1] = b2BroadPhase.b2_invalid;
  proxy.next = this.m_freeProxy;
  this.m_freeProxy = proxy;
  --this.m_proxyCount
};
b2BroadPhase.prototype.MoveProxy = function(proxy_, aabb, displacement) {
  var proxy = proxy_;
  var as3arr;
  var as3int = 0;
  var axis = 0;
  var index = 0;
  var bound;
  var prevBound;
  var nextBound;
  var nextProxyId = 0;
  var nextProxy;
  if(proxy == null) {
    return
  }
  if(aabb.IsValid() == false) {
    return
  }
  var boundCount = 2 * this.m_proxyCount;
  var newValues = new b2BoundValues;
  this.ComputeBounds(newValues.lowerValues, newValues.upperValues, aabb);
  var oldValues = new b2BoundValues;
  for(axis = 0;axis < 2;++axis) {
    bound = this.m_bounds[axis][proxy.lowerBounds[axis]];
    oldValues.lowerValues[axis] = bound.value;
    bound = this.m_bounds[axis][proxy.upperBounds[axis]];
    oldValues.upperValues[axis] = bound.value
  }
  for(axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = proxy.lowerBounds[axis];
    var upperIndex = proxy.upperBounds[axis];
    var lowerValue = newValues.lowerValues[axis];
    var upperValue = newValues.upperValues[axis];
    bound = bounds[lowerIndex];
    var deltaLower = lowerValue - bound.value;
    bound.value = lowerValue;
    bound = bounds[upperIndex];
    var deltaUpper = upperValue - bound.value;
    bound.value = upperValue;
    if(deltaLower < 0) {
      index = lowerIndex;
      while(index > 0 && lowerValue < bounds[parseInt(index - 1)].value) {
        bound = bounds[index];
        prevBound = bounds[parseInt(index - 1)];
        var prevProxy = prevBound.proxy;
        prevBound.stabbingCount++;
        if(prevBound.IsUpper() == true) {
          if(this.TestOverlapBound(newValues, prevProxy)) {
            this.m_pairManager.AddBufferedPair(proxy, prevProxy)
          }
          as3arr = prevProxy.upperBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }else {
          as3arr = prevProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }
        as3arr = proxy.lowerBounds;
        as3int = as3arr[axis];
        as3int--;
        as3arr[axis] = as3int;
        bound.Swap(prevBound);
        --index
      }
    }
    if(deltaUpper > 0) {
      index = upperIndex;
      while(index < boundCount - 1 && bounds[parseInt(index + 1)].value <= upperValue) {
        bound = bounds[index];
        nextBound = bounds[parseInt(index + 1)];
        nextProxy = nextBound.proxy;
        nextBound.stabbingCount++;
        if(nextBound.IsLower() == true) {
          if(this.TestOverlapBound(newValues, nextProxy)) {
            this.m_pairManager.AddBufferedPair(proxy, nextProxy)
          }
          as3arr = nextProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }else {
          as3arr = nextProxy.upperBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }
        as3arr = proxy.upperBounds;
        as3int = as3arr[axis];
        as3int++;
        as3arr[axis] = as3int;
        bound.Swap(nextBound);
        index++
      }
    }
    if(deltaLower > 0) {
      index = lowerIndex;
      while(index < boundCount - 1 && bounds[parseInt(index + 1)].value <= lowerValue) {
        bound = bounds[index];
        nextBound = bounds[parseInt(index + 1)];
        nextProxy = nextBound.proxy;
        nextBound.stabbingCount--;
        if(nextBound.IsUpper()) {
          if(this.TestOverlapBound(oldValues, nextProxy)) {
            this.m_pairManager.RemoveBufferedPair(proxy, nextProxy)
          }
          as3arr = nextProxy.upperBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }else {
          as3arr = nextProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }
        as3arr = proxy.lowerBounds;
        as3int = as3arr[axis];
        as3int++;
        as3arr[axis] = as3int;
        bound.Swap(nextBound);
        index++
      }
    }
    if(deltaUpper < 0) {
      index = upperIndex;
      while(index > 0 && upperValue < bounds[parseInt(index - 1)].value) {
        bound = bounds[index];
        prevBound = bounds[parseInt(index - 1)];
        prevProxy = prevBound.proxy;
        prevBound.stabbingCount--;
        if(prevBound.IsLower() == true) {
          if(this.TestOverlapBound(oldValues, prevProxy)) {
            this.m_pairManager.RemoveBufferedPair(proxy, prevProxy)
          }
          as3arr = prevProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }else {
          as3arr = prevProxy.upperBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }
        as3arr = proxy.upperBounds;
        as3int = as3arr[axis];
        as3int--;
        as3arr[axis] = as3int;
        bound.Swap(prevBound);
        index--
      }
    }
  }
};
b2BroadPhase.prototype.UpdatePairs = function(callback) {
  this.m_pairManager.Commit(callback)
};
b2BroadPhase.prototype.TestOverlap = function(proxyA, proxyB) {
  var proxyA_ = proxyA;
  var proxyB_ = proxyB;
  if(proxyA_.lowerBounds[0] > proxyB_.upperBounds[0]) {
    return false
  }
  if(proxyB_.lowerBounds[0] > proxyA_.upperBounds[0]) {
    return false
  }
  if(proxyA_.lowerBounds[1] > proxyB_.upperBounds[1]) {
    return false
  }
  if(proxyB_.lowerBounds[1] > proxyA_.upperBounds[1]) {
    return false
  }
  return true
};
b2BroadPhase.prototype.GetUserData = function(proxy) {
  return proxy.userData
};
b2BroadPhase.prototype.GetFatAABB = function(proxy_) {
  var aabb = new b2AABB;
  var proxy = proxy_;
  aabb.lowerBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.lowerBounds[0]].value / this.m_quantizationFactor.x;
  aabb.lowerBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.lowerBounds[1]].value / this.m_quantizationFactor.y;
  aabb.upperBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.upperBounds[0]].value / this.m_quantizationFactor.x;
  aabb.upperBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.upperBounds[1]].value / this.m_quantizationFactor.y;
  return aabb
};
b2BroadPhase.prototype.GetProxyCount = function() {
  return this.m_proxyCount
};
b2BroadPhase.prototype.Query = function(callback, aabb) {
  var lowerValues = new Array;
  var upperValues = new Array;
  this.ComputeBounds(lowerValues, upperValues, aabb);
  var lowerIndex = 0;
  var upperIndex = 0;
  var lowerIndexOut = new Array;
  lowerIndexOut.push(lowerIndex);
  var upperIndexOut = new Array;
  upperIndexOut.push(upperIndex);
  this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[0], upperValues[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);
  this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[1], upperValues[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);
  for(var i = 0;i < this.m_queryResultCount;++i) {
    var proxy = this.m_queryResults[i];
    if(!callback(proxy)) {
      break
    }
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp()
};
b2BroadPhase.prototype.Validate = function() {
  var pair;
  var proxy1;
  var proxy2;
  var overlap;
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var boundCount = 2 * this.m_proxyCount;
    var stabbingCount = 0;
    for(var i = 0;i < boundCount;++i) {
      var bound = bounds[i];
      if(bound.IsLower() == true) {
        stabbingCount++
      }else {
        stabbingCount--
      }
    }
  }
};
b2BroadPhase.prototype.Rebalance = function(iterations) {
};
b2BroadPhase.prototype.RayCast = function(callback, input) {
  var subInput = new b2RayCastInput;
  subInput.p1.SetV(input.p1);
  subInput.p2.SetV(input.p2);
  subInput.maxFraction = input.maxFraction;
  var dx = (input.p2.x - input.p1.x) * this.m_quantizationFactor.x;
  var dy = (input.p2.y - input.p1.y) * this.m_quantizationFactor.y;
  var sx = dx < -Number.MIN_VALUE ? -1 : dx > Number.MIN_VALUE ? 1 : 0;
  var sy = dy < -Number.MIN_VALUE ? -1 : dy > Number.MIN_VALUE ? 1 : 0;
  var p1x = this.m_quantizationFactor.x * (input.p1.x - this.m_worldAABB.lowerBound.x);
  var p1y = this.m_quantizationFactor.y * (input.p1.y - this.m_worldAABB.lowerBound.y);
  var startValues = new Array;
  var startValues2 = new Array;
  startValues[0] = parseInt(p1x) & b2Settings.USHRT_MAX - 1;
  startValues[1] = parseInt(p1y) & b2Settings.USHRT_MAX - 1;
  startValues2[0] = startValues[0] + 1;
  startValues2[1] = startValues[1] + 1;
  var startIndices = new Array;
  var xIndex = 0;
  var yIndex = 0;
  var proxy;
  var lowerIndex = 0;
  var upperIndex = 0;
  var lowerIndexOut = new Array;
  lowerIndexOut.push(lowerIndex);
  var upperIndexOut = new Array;
  upperIndexOut.push(upperIndex);
  this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[0], startValues2[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);
  if(sx >= 0) {
    xIndex = upperIndexOut[0] - 1
  }else {
    xIndex = lowerIndexOut[0]
  }
  this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[1], startValues2[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);
  if(sy >= 0) {
    yIndex = upperIndexOut[0] - 1
  }else {
    yIndex = lowerIndexOut[0]
  }
  for(var i = 0;i < this.m_queryResultCount;i++) {
    subInput.maxFraction = callback(this.m_queryResults[i], subInput)
  }
  for(;;) {
    var xProgress = 0;
    var yProgress = 0;
    xIndex += sx >= 0 ? 1 : -1;
    if(xIndex < 0 || xIndex >= this.m_proxyCount * 2) {
      break
    }
    if(sx != 0) {
      xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx
    }
    yIndex += sy >= 0 ? 1 : -1;
    if(yIndex < 0 || yIndex >= this.m_proxyCount * 2) {
      break
    }
    if(sy != 0) {
      yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy
    }
    for(;;) {
      if(sy == 0 || sx != 0 && xProgress < yProgress) {
        if(xProgress > subInput.maxFraction) {
          break
        }
        if(sx > 0 ? this.m_bounds[0][xIndex].IsLower() : this.m_bounds[0][xIndex].IsUpper()) {
          proxy = this.m_bounds[0][xIndex].proxy;
          if(sy >= 0) {
            if(proxy.lowerBounds[1] <= yIndex - 1 && proxy.upperBounds[1] >= yIndex) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }else {
            if(proxy.lowerBounds[1] <= yIndex && proxy.upperBounds[1] >= yIndex + 1) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }
        }
        if(subInput.maxFraction == 0) {
          break
        }
        if(sx > 0) {
          xIndex++;
          if(xIndex == this.m_proxyCount * 2) {
            break
          }
        }else {
          xIndex--;
          if(xIndex < 0) {
            break
          }
        }
        xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx
      }else {
        if(yProgress > subInput.maxFraction) {
          break
        }
        if(sy > 0 ? this.m_bounds[1][yIndex].IsLower() : this.m_bounds[1][yIndex].IsUpper()) {
          proxy = this.m_bounds[1][yIndex].proxy;
          if(sx >= 0) {
            if(proxy.lowerBounds[0] <= xIndex - 1 && proxy.upperBounds[0] >= xIndex) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }else {
            if(proxy.lowerBounds[0] <= xIndex && proxy.upperBounds[0] >= xIndex + 1) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }
        }
        if(subInput.maxFraction == 0) {
          break
        }
        if(sy > 0) {
          yIndex++;
          if(yIndex == this.m_proxyCount * 2) {
            break
          }
        }else {
          yIndex--;
          if(yIndex < 0) {
            break
          }
        }
        yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy
      }
    }
    break
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  return
};
b2BroadPhase.prototype.TestOverlapBound = function(b, p) {
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var bound = bounds[p.upperBounds[axis]];
    if(b.lowerValues[axis] > bound.value) {
      return false
    }
    bound = bounds[p.lowerBounds[axis]];
    if(b.upperValues[axis] < bound.value) {
      return false
    }
  }
  return true
};
b2BroadPhase.prototype.m_pairManager = new b2PairManager;
b2BroadPhase.prototype.m_proxyPool = new Array;
b2BroadPhase.prototype.m_freeProxy = null;
b2BroadPhase.prototype.m_bounds = null;
b2BroadPhase.prototype.m_querySortKeys = new Array;
b2BroadPhase.prototype.m_queryResults = new Array;
b2BroadPhase.prototype.m_queryResultCount = 0;
b2BroadPhase.prototype.m_worldAABB = null;
b2BroadPhase.prototype.m_quantizationFactor = new b2Vec2;
b2BroadPhase.prototype.m_proxyCount = 0;
b2BroadPhase.prototype.m_timeStamp = 0;var b2Manifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Manifold.prototype.__constructor = function() {
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2ManifoldPoint
  }
  this.m_localPlaneNormal = new b2Vec2;
  this.m_localPoint = new b2Vec2
};
b2Manifold.prototype.__varz = function() {
};
b2Manifold.e_circles = 1;
b2Manifold.e_faceA = 2;
b2Manifold.e_faceB = 4;
b2Manifold.prototype.Reset = function() {
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i].Reset()
  }
  this.m_localPlaneNormal.SetZero();
  this.m_localPoint.SetZero();
  this.m_type = 0;
  this.m_pointCount = 0
};
b2Manifold.prototype.Set = function(m) {
  this.m_pointCount = m.m_pointCount;
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i].Set(m.m_points[i])
  }
  this.m_localPlaneNormal.SetV(m.m_localPlaneNormal);
  this.m_localPoint.SetV(m.m_localPoint);
  this.m_type = m.m_type
};
b2Manifold.prototype.Copy = function() {
  var copy = new b2Manifold;
  copy.Set(this);
  return copy
};
b2Manifold.prototype.m_points = null;
b2Manifold.prototype.m_localPlaneNormal = null;
b2Manifold.prototype.m_localPoint = null;
b2Manifold.prototype.m_type = 0;
b2Manifold.prototype.m_pointCount = 0;var b2CircleShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2CircleShape.prototype, b2Shape.prototype);
b2CircleShape.prototype._super = b2Shape.prototype;
b2CircleShape.prototype.__constructor = function(radius) {
  this._super.__constructor.apply(this, []);
  this.m_type = b2Shape.e_circleShape;
  this.m_radius = radius
};
b2CircleShape.prototype.__varz = function() {
  this.m_p = new b2Vec2
};
b2CircleShape.prototype.Copy = function() {
  var s = new b2CircleShape;
  s.Set(this);
  return s
};
b2CircleShape.prototype.Set = function(other) {
  this._super.Set.apply(this, [other]);
  if(isInstanceOf(other, b2CircleShape)) {
    var other2 = other;
    this.m_p.SetV(other2.m_p)
  }
};
b2CircleShape.prototype.TestPoint = function(transform, p) {
  var tMat = transform.R;
  var dX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var dY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  dX = p.x - dX;
  dY = p.y - dY;
  return dX * dX + dY * dY <= this.m_radius * this.m_radius
};
b2CircleShape.prototype.RayCast = function(output, input, transform) {
  var tMat = transform.R;
  var positionX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var positionY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  var sX = input.p1.x - positionX;
  var sY = input.p1.y - positionY;
  var b = sX * sX + sY * sY - this.m_radius * this.m_radius;
  var rX = input.p2.x - input.p1.x;
  var rY = input.p2.y - input.p1.y;
  var c = sX * rX + sY * rY;
  var rr = rX * rX + rY * rY;
  var sigma = c * c - rr * b;
  if(sigma < 0 || rr < Number.MIN_VALUE) {
    return false
  }
  var a = -(c + Math.sqrt(sigma));
  if(0 <= a && a <= input.maxFraction * rr) {
    a /= rr;
    output.fraction = a;
    output.normal.x = sX + a * rX;
    output.normal.y = sY + a * rY;
    output.normal.Normalize();
    return true
  }
  return false
};
b2CircleShape.prototype.ComputeAABB = function(aabb, transform) {
  var tMat = transform.R;
  var pX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var pY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  aabb.lowerBound.Set(pX - this.m_radius, pY - this.m_radius);
  aabb.upperBound.Set(pX + this.m_radius, pY + this.m_radius)
};
b2CircleShape.prototype.ComputeMass = function(massData, density) {
  massData.mass = density * b2Settings.b2_pi * this.m_radius * this.m_radius;
  massData.center.SetV(this.m_p);
  massData.I = massData.mass * (0.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y))
};
b2CircleShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var p = b2Math.MulX(xf, this.m_p);
  var l = -(b2Math.Dot(normal, p) - offset);
  if(l < -this.m_radius + Number.MIN_VALUE) {
    return 0
  }
  if(l > this.m_radius) {
    c.SetV(p);
    return Math.PI * this.m_radius * this.m_radius
  }
  var r2 = this.m_radius * this.m_radius;
  var l2 = l * l;
  var area = r2 * (Math.asin(l / this.m_radius) + Math.PI / 2) + l * Math.sqrt(r2 - l2);
  var com = -2 / 3 * Math.pow(r2 - l2, 1.5) / area;
  c.x = p.x + normal.x * com;
  c.y = p.y + normal.y * com;
  return area
};
b2CircleShape.prototype.GetLocalPosition = function() {
  return this.m_p
};
b2CircleShape.prototype.SetLocalPosition = function(position) {
  this.m_p.SetV(position)
};
b2CircleShape.prototype.GetRadius = function() {
  return this.m_radius
};
b2CircleShape.prototype.SetRadius = function(radius) {
  this.m_radius = radius
};
b2CircleShape.prototype.m_p = new b2Vec2;var b2Joint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Joint.prototype.__constructor = function(def) {
  b2Settings.b2Assert(def.bodyA != def.bodyB);
  this.m_type = def.type;
  this.m_prev = null;
  this.m_next = null;
  this.m_bodyA = def.bodyA;
  this.m_bodyB = def.bodyB;
  this.m_collideConnected = def.collideConnected;
  this.m_islandFlag = false;
  this.m_userData = def.userData
};
b2Joint.prototype.__varz = function() {
  this.m_edgeA = new b2JointEdge;
  this.m_edgeB = new b2JointEdge;
  this.m_localCenterA = new b2Vec2;
  this.m_localCenterB = new b2Vec2
};
b2Joint.Create = function(def, allocator) {
  var joint = null;
  switch(def.type) {
    case b2Joint.e_distanceJoint:
      joint = new b2DistanceJoint(def);
      break;
    case b2Joint.e_mouseJoint:
      joint = new b2MouseJoint(def);
      break;
    case b2Joint.e_prismaticJoint:
      joint = new b2PrismaticJoint(def);
      break;
    case b2Joint.e_revoluteJoint:
      joint = new b2RevoluteJoint(def);
      break;
    case b2Joint.e_pulleyJoint:
      joint = new b2PulleyJoint(def);
      break;
    case b2Joint.e_gearJoint:
      joint = new b2GearJoint(def);
      break;
    case b2Joint.e_lineJoint:
      joint = new b2LineJoint(def);
      break;
    case b2Joint.e_weldJoint:
      joint = new b2WeldJoint(def);
      break;
    case b2Joint.e_frictionJoint:
      joint = new b2FrictionJoint(def);
      break;
    default:
      break
  }
  return joint
};
b2Joint.Destroy = function(joint, allocator) {
};
b2Joint.e_unknownJoint = 0;
b2Joint.e_revoluteJoint = 1;
b2Joint.e_prismaticJoint = 2;
b2Joint.e_distanceJoint = 3;
b2Joint.e_pulleyJoint = 4;
b2Joint.e_mouseJoint = 5;
b2Joint.e_gearJoint = 6;
b2Joint.e_lineJoint = 7;
b2Joint.e_weldJoint = 8;
b2Joint.e_frictionJoint = 9;
b2Joint.e_inactiveLimit = 0;
b2Joint.e_atLowerLimit = 1;
b2Joint.e_atUpperLimit = 2;
b2Joint.e_equalLimits = 3;
b2Joint.prototype.InitVelocityConstraints = function(step) {
};
b2Joint.prototype.SolveVelocityConstraints = function(step) {
};
b2Joint.prototype.FinalizeVelocityConstraints = function() {
};
b2Joint.prototype.SolvePositionConstraints = function(baumgarte) {
  return false
};
b2Joint.prototype.GetType = function() {
  return this.m_type
};
b2Joint.prototype.GetAnchorA = function() {
  return null
};
b2Joint.prototype.GetAnchorB = function() {
  return null
};
b2Joint.prototype.GetReactionForce = function(inv_dt) {
  return null
};
b2Joint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2Joint.prototype.GetBodyA = function() {
  return this.m_bodyA
};
b2Joint.prototype.GetBodyB = function() {
  return this.m_bodyB
};
b2Joint.prototype.GetNext = function() {
  return this.m_next
};
b2Joint.prototype.GetUserData = function() {
  return this.m_userData
};
b2Joint.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Joint.prototype.IsActive = function() {
  return this.m_bodyA.IsActive() && this.m_bodyB.IsActive()
};
b2Joint.prototype.m_type = 0;
b2Joint.prototype.m_prev = null;
b2Joint.prototype.m_next = null;
b2Joint.prototype.m_edgeA = new b2JointEdge;
b2Joint.prototype.m_edgeB = new b2JointEdge;
b2Joint.prototype.m_bodyA = null;
b2Joint.prototype.m_bodyB = null;
b2Joint.prototype.m_islandFlag = null;
b2Joint.prototype.m_collideConnected = null;
b2Joint.prototype.m_userData = null;
b2Joint.prototype.m_localCenterA = new b2Vec2;
b2Joint.prototype.m_localCenterB = new b2Vec2;
b2Joint.prototype.m_invMassA = null;
b2Joint.prototype.m_invMassB = null;
b2Joint.prototype.m_invIA = null;
b2Joint.prototype.m_invIB = null;var b2LineJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2LineJoint.prototype, b2Joint.prototype);
b2LineJoint.prototype._super = b2Joint.prototype;
b2LineJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_localXAxis1.SetV(def.localAxisA);
  this.m_localYAxis1.x = -this.m_localXAxis1.y;
  this.m_localYAxis1.y = this.m_localXAxis1.x;
  this.m_impulse.SetZero();
  this.m_motorMass = 0;
  this.m_motorImpulse = 0;
  this.m_lowerTranslation = def.lowerTranslation;
  this.m_upperTranslation = def.upperTranslation;
  this.m_maxMotorForce = def.maxMotorForce;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit;
  this.m_axis.SetZero();
  this.m_perp.SetZero()
};
b2LineJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_localXAxis1 = new b2Vec2;
  this.m_localYAxis1 = new b2Vec2;
  this.m_axis = new b2Vec2;
  this.m_perp = new b2Vec2;
  this.m_K = new b2Mat22;
  this.m_impulse = new b2Vec2
};
b2LineJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  this.m_localCenterA.SetV(bA.GetLocalCenter());
  this.m_localCenterB.SetV(bB.GetLocalCenter());
  var xf1 = bA.GetTransform();
  var xf2 = bB.GetTransform();
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  this.m_invMassA = bA.m_invMass;
  this.m_invMassB = bB.m_invMass;
  this.m_invIA = bA.m_invI;
  this.m_invIB = bB.m_invI;
  this.m_axis.SetV(b2Math.MulMV(xf1.R, this.m_localXAxis1));
  this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
  this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
  this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
  this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1 / this.m_motorMass : 0;
  this.m_perp.SetV(b2Math.MulMV(xf1.R, this.m_localYAxis1));
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var m1 = this.m_invMassA;
  var m2 = this.m_invMassB;
  var i1 = this.m_invIA;
  var i2 = this.m_invIB;
  this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
  this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
  this.m_K.col2.x = this.m_K.col1.y;
  this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
  if(this.m_enableLimit) {
    var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointTransition <= this.m_lowerTranslation) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_limitState = b2Joint.e_atLowerLimit;
          this.m_impulse.y = 0
        }
      }else {
        if(jointTransition >= this.m_upperTranslation) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_limitState = b2Joint.e_atUpperLimit;
            this.m_impulse.y = 0
          }
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.y = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x;
    var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y;
    var L1 = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1;
    var L2 = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2;
    bA.m_linearVelocity.x -= this.m_invMassA * PX;
    bA.m_linearVelocity.y -= this.m_invMassA * PY;
    bA.m_angularVelocity -= this.m_invIA * L1;
    bB.m_linearVelocity.x += this.m_invMassB * PX;
    bB.m_linearVelocity.y += this.m_invMassB * PY;
    bB.m_angularVelocity += this.m_invIB * L2
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2LineJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var PX;
  var PY;
  var L1;
  var L2;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorForce;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    PX = impulse * this.m_axis.x;
    PY = impulse * this.m_axis.y;
    L1 = impulse * this.m_a1;
    L2 = impulse * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  var Cdot1 = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var f1 = this.m_impulse.Copy();
    var df = this.m_K.Solve(new b2Vec2, -Cdot1, -Cdot2);
    this.m_impulse.Add(df);
    if(this.m_limitState == b2Joint.e_atLowerLimit) {
      this.m_impulse.y = b2Math.Max(this.m_impulse.y, 0)
    }else {
      if(this.m_limitState == b2Joint.e_atUpperLimit) {
        this.m_impulse.y = b2Math.Min(this.m_impulse.y, 0)
      }
    }
    var b = -Cdot1 - (this.m_impulse.y - f1.y) * this.m_K.col2.x;
    var f2r;
    if(this.m_K.col1.x != 0) {
      f2r = b / this.m_K.col1.x + f1.x
    }else {
      f2r = f1.x
    }
    this.m_impulse.x = f2r;
    df.x = this.m_impulse.x - f1.x;
    df.y = this.m_impulse.y - f1.y;
    PX = df.x * this.m_perp.x + df.y * this.m_axis.x;
    PY = df.x * this.m_perp.y + df.y * this.m_axis.y;
    L1 = df.x * this.m_s1 + df.y * this.m_a1;
    L2 = df.x * this.m_s2 + df.y * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }else {
    var df2;
    if(this.m_K.col1.x != 0) {
      df2 = -Cdot1 / this.m_K.col1.x
    }else {
      df2 = 0
    }
    this.m_impulse.x += df2;
    PX = df2 * this.m_perp.x;
    PY = df2 * this.m_perp.y;
    L1 = df2 * this.m_s1;
    L2 = df2 * this.m_s2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2LineJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var limitC;
  var oldLimitImpulse;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var c1 = bA.m_sweep.c;
  var a1 = bA.m_sweep.a;
  var c2 = bB.m_sweep.c;
  var a2 = bB.m_sweep.a;
  var tMat;
  var tX;
  var m1;
  var m2;
  var i1;
  var i2;
  var linearError = 0;
  var angularError = 0;
  var active = false;
  var C2 = 0;
  var R1 = b2Mat22.FromAngle(a1);
  var R2 = b2Mat22.FromAngle(a2);
  tMat = R1;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = R2;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = c2.x + r2X - c1.x - r1X;
  var dY = c2.y + r2Y - c1.y - r1Y;
  if(this.m_enableLimit) {
    this.m_axis = b2Math.MulMV(R1, this.m_localXAxis1);
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    var translation = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      C2 = b2Math.Clamp(translation, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
      linearError = b2Math.Abs(translation);
      active = true
    }else {
      if(translation <= this.m_lowerTranslation) {
        C2 = b2Math.Clamp(translation - this.m_lowerTranslation + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
        linearError = this.m_lowerTranslation - translation;
        active = true
      }else {
        if(translation >= this.m_upperTranslation) {
          C2 = b2Math.Clamp(translation - this.m_upperTranslation + b2Settings.b2_linearSlop, 0, b2Settings.b2_maxLinearCorrection);
          linearError = translation - this.m_upperTranslation;
          active = true
        }
      }
    }
  }
  this.m_perp = b2Math.MulMV(R1, this.m_localYAxis1);
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var impulse = new b2Vec2;
  var C1 = this.m_perp.x * dX + this.m_perp.y * dY;
  linearError = b2Math.Max(linearError, b2Math.Abs(C1));
  angularError = 0;
  if(active) {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    this.m_K.Solve(impulse, -C1, -C2)
  }else {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    var impulse1;
    if(k11 != 0) {
      impulse1 = -C1 / k11
    }else {
      impulse1 = 0
    }
    impulse.x = impulse1;
    impulse.y = 0
  }
  var PX = impulse.x * this.m_perp.x + impulse.y * this.m_axis.x;
  var PY = impulse.x * this.m_perp.y + impulse.y * this.m_axis.y;
  var L1 = impulse.x * this.m_s1 + impulse.y * this.m_a1;
  var L2 = impulse.x * this.m_s2 + impulse.y * this.m_a2;
  c1.x -= this.m_invMassA * PX;
  c1.y -= this.m_invMassA * PY;
  a1 -= this.m_invIA * L1;
  c2.x += this.m_invMassB * PX;
  c2.y += this.m_invMassB * PY;
  a2 += this.m_invIB * L2;
  bA.m_sweep.a = a1;
  bB.m_sweep.a = a2;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2LineJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2LineJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2LineJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y))
};
b2LineJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.y
};
b2LineJoint.prototype.GetJointTranslation = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var p1 = bA.GetWorldPoint(this.m_localAnchor1);
  var p2 = bB.GetWorldPoint(this.m_localAnchor2);
  var dX = p2.x - p1.x;
  var dY = p2.y - p1.y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var translation = axis.x * dX + axis.y * dY;
  return translation
};
b2LineJoint.prototype.GetJointSpeed = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var v1 = bA.m_linearVelocity;
  var v2 = bB.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var w2 = bB.m_angularVelocity;
  var speed = dX * -w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x + -w2 * r2Y - v1.x - -w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
  return speed
};
b2LineJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2LineJoint.prototype.EnableLimit = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableLimit = flag
};
b2LineJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerTranslation
};
b2LineJoint.prototype.GetUpperLimit = function() {
  return this.m_upperTranslation
};
b2LineJoint.prototype.SetLimits = function(lower, upper) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_lowerTranslation = lower;
  this.m_upperTranslation = upper
};
b2LineJoint.prototype.IsMotorEnabled = function() {
  return this.m_enableMotor
};
b2LineJoint.prototype.EnableMotor = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag
};
b2LineJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2LineJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2LineJoint.prototype.SetMaxMotorForce = function(force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorForce = force
};
b2LineJoint.prototype.GetMaxMotorForce = function() {
  return this.m_maxMotorForce
};
b2LineJoint.prototype.GetMotorForce = function() {
  return this.m_motorImpulse
};
b2LineJoint.prototype.m_localAnchor1 = new b2Vec2;
b2LineJoint.prototype.m_localAnchor2 = new b2Vec2;
b2LineJoint.prototype.m_localXAxis1 = new b2Vec2;
b2LineJoint.prototype.m_localYAxis1 = new b2Vec2;
b2LineJoint.prototype.m_axis = new b2Vec2;
b2LineJoint.prototype.m_perp = new b2Vec2;
b2LineJoint.prototype.m_s1 = null;
b2LineJoint.prototype.m_s2 = null;
b2LineJoint.prototype.m_a1 = null;
b2LineJoint.prototype.m_a2 = null;
b2LineJoint.prototype.m_K = new b2Mat22;
b2LineJoint.prototype.m_impulse = new b2Vec2;
b2LineJoint.prototype.m_motorMass = null;
b2LineJoint.prototype.m_motorImpulse = null;
b2LineJoint.prototype.m_lowerTranslation = null;
b2LineJoint.prototype.m_upperTranslation = null;
b2LineJoint.prototype.m_maxMotorForce = null;
b2LineJoint.prototype.m_motorSpeed = null;
b2LineJoint.prototype.m_enableLimit = null;
b2LineJoint.prototype.m_enableMotor = null;
b2LineJoint.prototype.m_limitState = 0;var b2ContactSolver = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactSolver.prototype.__constructor = function() {
};
b2ContactSolver.prototype.__varz = function() {
  this.m_step = new b2TimeStep;
  this.m_constraints = new Array
};
b2ContactSolver.s_worldManifold = new b2WorldManifold;
b2ContactSolver.s_psm = new b2PositionSolverManifold;
b2ContactSolver.prototype.Initialize = function(step, contacts, contactCount, allocator) {
  var contact;
  this.m_step.Set(step);
  this.m_allocator = allocator;
  var i = 0;
  var tVec;
  var tMat;
  this.m_constraintCount = contactCount;
  while(this.m_constraints.length < this.m_constraintCount) {
    this.m_constraints[this.m_constraints.length] = new b2ContactConstraint
  }
  for(i = 0;i < contactCount;++i) {
    contact = contacts[i];
    var fixtureA = contact.m_fixtureA;
    var fixtureB = contact.m_fixtureB;
    var shapeA = fixtureA.m_shape;
    var shapeB = fixtureB.m_shape;
    var radiusA = shapeA.m_radius;
    var radiusB = shapeB.m_radius;
    var bodyA = fixtureA.m_body;
    var bodyB = fixtureB.m_body;
    var manifold = contact.GetManifold();
    var friction = b2Settings.b2MixFriction(fixtureA.GetFriction(), fixtureB.GetFriction());
    var restitution = b2Settings.b2MixRestitution(fixtureA.GetRestitution(), fixtureB.GetRestitution());
    var vAX = bodyA.m_linearVelocity.x;
    var vAY = bodyA.m_linearVelocity.y;
    var vBX = bodyB.m_linearVelocity.x;
    var vBY = bodyB.m_linearVelocity.y;
    var wA = bodyA.m_angularVelocity;
    var wB = bodyB.m_angularVelocity;
    b2Settings.b2Assert(manifold.m_pointCount > 0);
    b2ContactSolver.s_worldManifold.Initialize(manifold, bodyA.m_xf, radiusA, bodyB.m_xf, radiusB);
    var normalX = b2ContactSolver.s_worldManifold.m_normal.x;
    var normalY = b2ContactSolver.s_worldManifold.m_normal.y;
    var cc = this.m_constraints[i];
    cc.bodyA = bodyA;
    cc.bodyB = bodyB;
    cc.manifold = manifold;
    cc.normal.x = normalX;
    cc.normal.y = normalY;
    cc.pointCount = manifold.m_pointCount;
    cc.friction = friction;
    cc.restitution = restitution;
    cc.localPlaneNormal.x = manifold.m_localPlaneNormal.x;
    cc.localPlaneNormal.y = manifold.m_localPlaneNormal.y;
    cc.localPoint.x = manifold.m_localPoint.x;
    cc.localPoint.y = manifold.m_localPoint.y;
    cc.radius = radiusA + radiusB;
    cc.type = manifold.m_type;
    for(var k = 0;k < cc.pointCount;++k) {
      var cp = manifold.m_points[k];
      var ccp = cc.points[k];
      ccp.normalImpulse = cp.m_normalImpulse;
      ccp.tangentImpulse = cp.m_tangentImpulse;
      ccp.localPoint.SetV(cp.m_localPoint);
      var rAX = ccp.rA.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyA.m_sweep.c.x;
      var rAY = ccp.rA.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyA.m_sweep.c.y;
      var rBX = ccp.rB.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyB.m_sweep.c.x;
      var rBY = ccp.rB.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyB.m_sweep.c.y;
      var rnA = rAX * normalY - rAY * normalX;
      var rnB = rBX * normalY - rBY * normalX;
      rnA *= rnA;
      rnB *= rnB;
      var kNormal = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rnA + bodyB.m_invI * rnB;
      ccp.normalMass = 1 / kNormal;
      var kEqualized = bodyA.m_mass * bodyA.m_invMass + bodyB.m_mass * bodyB.m_invMass;
      kEqualized += bodyA.m_mass * bodyA.m_invI * rnA + bodyB.m_mass * bodyB.m_invI * rnB;
      ccp.equalizedMass = 1 / kEqualized;
      var tangentX = normalY;
      var tangentY = -normalX;
      var rtA = rAX * tangentY - rAY * tangentX;
      var rtB = rBX * tangentY - rBY * tangentX;
      rtA *= rtA;
      rtB *= rtB;
      var kTangent = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rtA + bodyB.m_invI * rtB;
      ccp.tangentMass = 1 / kTangent;
      ccp.velocityBias = 0;
      var tX = vBX + -wB * rBY - vAX - -wA * rAY;
      var tY = vBY + wB * rBX - vAY - wA * rAX;
      var vRel = cc.normal.x * tX + cc.normal.y * tY;
      if(vRel < -b2Settings.b2_velocityThreshold) {
        ccp.velocityBias += -cc.restitution * vRel
      }
    }
    if(cc.pointCount == 2) {
      var ccp1 = cc.points[0];
      var ccp2 = cc.points[1];
      var invMassA = bodyA.m_invMass;
      var invIA = bodyA.m_invI;
      var invMassB = bodyB.m_invMass;
      var invIB = bodyB.m_invI;
      var rn1A = ccp1.rA.x * normalY - ccp1.rA.y * normalX;
      var rn1B = ccp1.rB.x * normalY - ccp1.rB.y * normalX;
      var rn2A = ccp2.rA.x * normalY - ccp2.rA.y * normalX;
      var rn2B = ccp2.rB.x * normalY - ccp2.rB.y * normalX;
      var k11 = invMassA + invMassB + invIA * rn1A * rn1A + invIB * rn1B * rn1B;
      var k22 = invMassA + invMassB + invIA * rn2A * rn2A + invIB * rn2B * rn2B;
      var k12 = invMassA + invMassB + invIA * rn1A * rn2A + invIB * rn1B * rn2B;
      var k_maxConditionNumber = 100;
      if(k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
        cc.K.col1.Set(k11, k12);
        cc.K.col2.Set(k12, k22);
        cc.K.GetInverse(cc.normalMass)
      }else {
        cc.pointCount = 1
      }
    }
  }
};
b2ContactSolver.prototype.InitVelocityConstraints = function(step) {
  var tVec;
  var tVec2;
  var tMat;
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var invMassA = bodyA.m_invMass;
    var invIA = bodyA.m_invI;
    var invMassB = bodyB.m_invMass;
    var invIB = bodyB.m_invI;
    var normalX = c.normal.x;
    var normalY = c.normal.y;
    var tangentX = normalY;
    var tangentY = -normalX;
    var tX;
    var j = 0;
    var tCount = 0;
    if(step.warmStarting) {
      tCount = c.pointCount;
      for(j = 0;j < tCount;++j) {
        var ccp = c.points[j];
        ccp.normalImpulse *= step.dtRatio;
        ccp.tangentImpulse *= step.dtRatio;
        var PX = ccp.normalImpulse * normalX + ccp.tangentImpulse * tangentX;
        var PY = ccp.normalImpulse * normalY + ccp.tangentImpulse * tangentY;
        bodyA.m_angularVelocity -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
        bodyA.m_linearVelocity.x -= invMassA * PX;
        bodyA.m_linearVelocity.y -= invMassA * PY;
        bodyB.m_angularVelocity += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
        bodyB.m_linearVelocity.x += invMassB * PX;
        bodyB.m_linearVelocity.y += invMassB * PY
      }
    }else {
      tCount = c.pointCount;
      for(j = 0;j < tCount;++j) {
        var ccp2 = c.points[j];
        ccp2.normalImpulse = 0;
        ccp2.tangentImpulse = 0
      }
    }
  }
};
b2ContactSolver.prototype.SolveVelocityConstraints = function() {
  var j = 0;
  var ccp;
  var rAX;
  var rAY;
  var rBX;
  var rBY;
  var dvX;
  var dvY;
  var vn;
  var vt;
  var lambda;
  var maxFriction;
  var newImpulse;
  var PX;
  var PY;
  var dX;
  var dY;
  var P1X;
  var P1Y;
  var P2X;
  var P2Y;
  var tMat;
  var tVec;
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var wA = bodyA.m_angularVelocity;
    var wB = bodyB.m_angularVelocity;
    var vA = bodyA.m_linearVelocity;
    var vB = bodyB.m_linearVelocity;
    var invMassA = bodyA.m_invMass;
    var invIA = bodyA.m_invI;
    var invMassB = bodyB.m_invMass;
    var invIB = bodyB.m_invI;
    var normalX = c.normal.x;
    var normalY = c.normal.y;
    var tangentX = normalY;
    var tangentY = -normalX;
    var friction = c.friction;
    var tX;
    for(j = 0;j < c.pointCount;j++) {
      ccp = c.points[j];
      dvX = vB.x - wB * ccp.rB.y - vA.x + wA * ccp.rA.y;
      dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
      vt = dvX * tangentX + dvY * tangentY;
      lambda = ccp.tangentMass * -vt;
      maxFriction = friction * ccp.normalImpulse;
      newImpulse = b2Math.Clamp(ccp.tangentImpulse + lambda, -maxFriction, maxFriction);
      lambda = newImpulse - ccp.tangentImpulse;
      PX = lambda * tangentX;
      PY = lambda * tangentY;
      vA.x -= invMassA * PX;
      vA.y -= invMassA * PY;
      wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
      vB.x += invMassB * PX;
      vB.y += invMassB * PY;
      wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
      ccp.tangentImpulse = newImpulse
    }
    var tCount = c.pointCount;
    if(c.pointCount == 1) {
      ccp = c.points[0];
      dvX = vB.x + -wB * ccp.rB.y - vA.x - -wA * ccp.rA.y;
      dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
      vn = dvX * normalX + dvY * normalY;
      lambda = -ccp.normalMass * (vn - ccp.velocityBias);
      newImpulse = ccp.normalImpulse + lambda;
      newImpulse = newImpulse > 0 ? newImpulse : 0;
      lambda = newImpulse - ccp.normalImpulse;
      PX = lambda * normalX;
      PY = lambda * normalY;
      vA.x -= invMassA * PX;
      vA.y -= invMassA * PY;
      wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
      vB.x += invMassB * PX;
      vB.y += invMassB * PY;
      wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
      ccp.normalImpulse = newImpulse
    }else {
      var cp1 = c.points[0];
      var cp2 = c.points[1];
      var aX = cp1.normalImpulse;
      var aY = cp2.normalImpulse;
      var dv1X = vB.x - wB * cp1.rB.y - vA.x + wA * cp1.rA.y;
      var dv1Y = vB.y + wB * cp1.rB.x - vA.y - wA * cp1.rA.x;
      var dv2X = vB.x - wB * cp2.rB.y - vA.x + wA * cp2.rA.y;
      var dv2Y = vB.y + wB * cp2.rB.x - vA.y - wA * cp2.rA.x;
      var vn1 = dv1X * normalX + dv1Y * normalY;
      var vn2 = dv2X * normalX + dv2Y * normalY;
      var bX = vn1 - cp1.velocityBias;
      var bY = vn2 - cp2.velocityBias;
      tMat = c.K;
      bX -= tMat.col1.x * aX + tMat.col2.x * aY;
      bY -= tMat.col1.y * aX + tMat.col2.y * aY;
      var k_errorTol = 0.0010;
      for(;;) {
        tMat = c.normalMass;
        var xX = -(tMat.col1.x * bX + tMat.col2.x * bY);
        var xY = -(tMat.col1.y * bX + tMat.col2.y * bY);
        if(xX >= 0 && xY >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = -cp1.normalMass * bX;
        xY = 0;
        vn1 = 0;
        vn2 = c.K.col1.y * xX + bY;
        if(xX >= 0 && vn2 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = 0;
        xY = -cp2.normalMass * bY;
        vn1 = c.K.col2.x * xY + bX;
        vn2 = 0;
        if(xY >= 0 && vn1 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = 0;
        xY = 0;
        vn1 = bX;
        vn2 = bY;
        if(vn1 >= 0 && vn2 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        break
      }
    }
    bodyA.m_angularVelocity = wA;
    bodyB.m_angularVelocity = wB
  }
};
b2ContactSolver.prototype.FinalizeVelocityConstraints = function() {
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var m = c.manifold;
    for(var j = 0;j < c.pointCount;++j) {
      var point1 = m.m_points[j];
      var point2 = c.points[j];
      point1.m_normalImpulse = point2.normalImpulse;
      point1.m_tangentImpulse = point2.tangentImpulse
    }
  }
};
b2ContactSolver.prototype.SolvePositionConstraints = function(baumgarte) {
  var minSeparation = 0;
  for(var i = 0;i < this.m_constraintCount;i++) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var invMassA = bodyA.m_mass * bodyA.m_invMass;
    var invIA = bodyA.m_mass * bodyA.m_invI;
    var invMassB = bodyB.m_mass * bodyB.m_invMass;
    var invIB = bodyB.m_mass * bodyB.m_invI;
    b2ContactSolver.s_psm.Initialize(c);
    var normal = b2ContactSolver.s_psm.m_normal;
    for(var j = 0;j < c.pointCount;j++) {
      var ccp = c.points[j];
      var point = b2ContactSolver.s_psm.m_points[j];
      var separation = b2ContactSolver.s_psm.m_separations[j];
      var rAX = point.x - bodyA.m_sweep.c.x;
      var rAY = point.y - bodyA.m_sweep.c.y;
      var rBX = point.x - bodyB.m_sweep.c.x;
      var rBY = point.y - bodyB.m_sweep.c.y;
      minSeparation = minSeparation < separation ? minSeparation : separation;
      var C = b2Math.Clamp(baumgarte * (separation + b2Settings.b2_linearSlop), -b2Settings.b2_maxLinearCorrection, 0);
      var impulse = -ccp.equalizedMass * C;
      var PX = impulse * normal.x;
      var PY = impulse * normal.y;
      bodyA.m_sweep.c.x -= invMassA * PX;
      bodyA.m_sweep.c.y -= invMassA * PY;
      bodyA.m_sweep.a -= invIA * (rAX * PY - rAY * PX);
      bodyA.SynchronizeTransform();
      bodyB.m_sweep.c.x += invMassB * PX;
      bodyB.m_sweep.c.y += invMassB * PY;
      bodyB.m_sweep.a += invIB * (rBX * PY - rBY * PX);
      bodyB.SynchronizeTransform()
    }
  }
  return minSeparation > -1.5 * b2Settings.b2_linearSlop
};
b2ContactSolver.prototype.m_step = new b2TimeStep;
b2ContactSolver.prototype.m_allocator = null;
b2ContactSolver.prototype.m_constraints = new Array;
b2ContactSolver.prototype.m_constraintCount = 0;var b2Simplex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Simplex.prototype.__constructor = function() {
  this.m_vertices[0] = this.m_v1;
  this.m_vertices[1] = this.m_v2;
  this.m_vertices[2] = this.m_v3
};
b2Simplex.prototype.__varz = function() {
  this.m_v1 = new b2SimplexVertex;
  this.m_v2 = new b2SimplexVertex;
  this.m_v3 = new b2SimplexVertex;
  this.m_vertices = new Array(3)
};
b2Simplex.prototype.ReadCache = function(cache, proxyA, transformA, proxyB, transformB) {
  b2Settings.b2Assert(0 <= cache.count && cache.count <= 3);
  var wALocal;
  var wBLocal;
  this.m_count = cache.count;
  var vertices = this.m_vertices;
  for(var i = 0;i < this.m_count;i++) {
    var v = vertices[i];
    v.indexA = cache.indexA[i];
    v.indexB = cache.indexB[i];
    wALocal = proxyA.GetVertex(v.indexA);
    wBLocal = proxyB.GetVertex(v.indexB);
    v.wA = b2Math.MulX(transformA, wALocal);
    v.wB = b2Math.MulX(transformB, wBLocal);
    v.w = b2Math.SubtractVV(v.wB, v.wA);
    v.a = 0
  }
  if(this.m_count > 1) {
    var metric1 = cache.metric;
    var metric2 = this.GetMetric();
    if(metric2 < 0.5 * metric1 || 2 * metric1 < metric2 || metric2 < Number.MIN_VALUE) {
      this.m_count = 0
    }
  }
  if(this.m_count == 0) {
    v = vertices[0];
    v.indexA = 0;
    v.indexB = 0;
    wALocal = proxyA.GetVertex(0);
    wBLocal = proxyB.GetVertex(0);
    v.wA = b2Math.MulX(transformA, wALocal);
    v.wB = b2Math.MulX(transformB, wBLocal);
    v.w = b2Math.SubtractVV(v.wB, v.wA);
    this.m_count = 1
  }
};
b2Simplex.prototype.WriteCache = function(cache) {
  cache.metric = this.GetMetric();
  cache.count = parseInt(this.m_count);
  var vertices = this.m_vertices;
  for(var i = 0;i < this.m_count;i++) {
    cache.indexA[i] = parseInt(vertices[i].indexA);
    cache.indexB[i] = parseInt(vertices[i].indexB)
  }
};
b2Simplex.prototype.GetSearchDirection = function() {
  switch(this.m_count) {
    case 1:
      return this.m_v1.w.GetNegative();
    case 2:
      var e12 = b2Math.SubtractVV(this.m_v2.w, this.m_v1.w);
      var sgn = b2Math.CrossVV(e12, this.m_v1.w.GetNegative());
      if(sgn > 0) {
        return b2Math.CrossFV(1, e12)
      }else {
        return b2Math.CrossVF(e12, 1)
      }
    ;
    default:
      b2Settings.b2Assert(false);
      return new b2Vec2
  }
};
b2Simplex.prototype.GetClosestPoint = function() {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      return new b2Vec2;
    case 1:
      return this.m_v1.w;
    case 2:
      return new b2Vec2(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);
    default:
      b2Settings.b2Assert(false);
      return new b2Vec2
  }
};
b2Simplex.prototype.GetWitnessPoints = function(pA, pB) {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      break;
    case 1:
      pA.SetV(this.m_v1.wA);
      pB.SetV(this.m_v1.wB);
      break;
    case 2:
      pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
      pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
      pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
      pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
      break;
    case 3:
      pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
      pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
      break;
    default:
      b2Settings.b2Assert(false);
      break
  }
};
b2Simplex.prototype.GetMetric = function() {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      return 0;
    case 1:
      return 0;
    case 2:
      return b2Math.SubtractVV(this.m_v1.w, this.m_v2.w).Length();
    case 3:
      return b2Math.CrossVV(b2Math.SubtractVV(this.m_v2.w, this.m_v1.w), b2Math.SubtractVV(this.m_v3.w, this.m_v1.w));
    default:
      b2Settings.b2Assert(false);
      return 0
  }
};
b2Simplex.prototype.Solve2 = function() {
  var w1 = this.m_v1.w;
  var w2 = this.m_v2.w;
  var e12 = b2Math.SubtractVV(w2, w1);
  var d12_2 = -(w1.x * e12.x + w1.y * e12.y);
  if(d12_2 <= 0) {
    this.m_v1.a = 1;
    this.m_count = 1;
    return
  }
  var d12_1 = w2.x * e12.x + w2.y * e12.y;
  if(d12_1 <= 0) {
    this.m_v2.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v2);
    return
  }
  var inv_d12 = 1 / (d12_1 + d12_2);
  this.m_v1.a = d12_1 * inv_d12;
  this.m_v2.a = d12_2 * inv_d12;
  this.m_count = 2
};
b2Simplex.prototype.Solve3 = function() {
  var w1 = this.m_v1.w;
  var w2 = this.m_v2.w;
  var w3 = this.m_v3.w;
  var e12 = b2Math.SubtractVV(w2, w1);
  var w1e12 = b2Math.Dot(w1, e12);
  var w2e12 = b2Math.Dot(w2, e12);
  var d12_1 = w2e12;
  var d12_2 = -w1e12;
  var e13 = b2Math.SubtractVV(w3, w1);
  var w1e13 = b2Math.Dot(w1, e13);
  var w3e13 = b2Math.Dot(w3, e13);
  var d13_1 = w3e13;
  var d13_2 = -w1e13;
  var e23 = b2Math.SubtractVV(w3, w2);
  var w2e23 = b2Math.Dot(w2, e23);
  var w3e23 = b2Math.Dot(w3, e23);
  var d23_1 = w3e23;
  var d23_2 = -w2e23;
  var n123 = b2Math.CrossVV(e12, e13);
  var d123_1 = n123 * b2Math.CrossVV(w2, w3);
  var d123_2 = n123 * b2Math.CrossVV(w3, w1);
  var d123_3 = n123 * b2Math.CrossVV(w1, w2);
  if(d12_2 <= 0 && d13_2 <= 0) {
    this.m_v1.a = 1;
    this.m_count = 1;
    return
  }
  if(d12_1 > 0 && d12_2 > 0 && d123_3 <= 0) {
    var inv_d12 = 1 / (d12_1 + d12_2);
    this.m_v1.a = d12_1 * inv_d12;
    this.m_v2.a = d12_2 * inv_d12;
    this.m_count = 2;
    return
  }
  if(d13_1 > 0 && d13_2 > 0 && d123_2 <= 0) {
    var inv_d13 = 1 / (d13_1 + d13_2);
    this.m_v1.a = d13_1 * inv_d13;
    this.m_v3.a = d13_2 * inv_d13;
    this.m_count = 2;
    this.m_v2.Set(this.m_v3);
    return
  }
  if(d12_1 <= 0 && d23_2 <= 0) {
    this.m_v2.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v2);
    return
  }
  if(d13_1 <= 0 && d23_1 <= 0) {
    this.m_v3.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v3);
    return
  }
  if(d23_1 > 0 && d23_2 > 0 && d123_1 <= 0) {
    var inv_d23 = 1 / (d23_1 + d23_2);
    this.m_v2.a = d23_1 * inv_d23;
    this.m_v3.a = d23_2 * inv_d23;
    this.m_count = 2;
    this.m_v1.Set(this.m_v3);
    return
  }
  var inv_d123 = 1 / (d123_1 + d123_2 + d123_3);
  this.m_v1.a = d123_1 * inv_d123;
  this.m_v2.a = d123_2 * inv_d123;
  this.m_v3.a = d123_3 * inv_d123;
  this.m_count = 3
};
b2Simplex.prototype.m_v1 = new b2SimplexVertex;
b2Simplex.prototype.m_v2 = new b2SimplexVertex;
b2Simplex.prototype.m_v3 = new b2SimplexVertex;
b2Simplex.prototype.m_vertices = new Array(3);
b2Simplex.prototype.m_count = 0;var b2WeldJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2WeldJoint.prototype, b2Joint.prototype);
b2WeldJoint.prototype._super = b2Joint.prototype;
b2WeldJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchorA.SetV(def.localAnchorA);
  this.m_localAnchorB.SetV(def.localAnchorB);
  this.m_referenceAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_mass = new b2Mat33
};
b2WeldJoint.prototype.__varz = function() {
  this.m_localAnchorA = new b2Vec2;
  this.m_localAnchorB = new b2Vec2;
  this.m_impulse = new b2Vec3;
  this.m_mass = new b2Mat33
};
b2WeldJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
  this.m_mass.col2.x = -rAY * rAX * iA - rBY * rBX * iB;
  this.m_mass.col3.x = -rAY * iA - rBY * iB;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
  this.m_mass.col3.y = rAX * iA + rBX * iB;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = iA + iB;
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_impulse.z *= step.dtRatio;
    bA.m_linearVelocity.x -= mA * this.m_impulse.x;
    bA.m_linearVelocity.y -= mA * this.m_impulse.y;
    bA.m_angularVelocity -= iA * (rAX * this.m_impulse.y - rAY * this.m_impulse.x + this.m_impulse.z);
    bB.m_linearVelocity.x += mB * this.m_impulse.x;
    bB.m_linearVelocity.y += mB * this.m_impulse.y;
    bB.m_angularVelocity += iB * (rBX * this.m_impulse.y - rBY * this.m_impulse.x + this.m_impulse.z)
  }else {
    this.m_impulse.SetZero()
  }
};
b2WeldJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var vA = bA.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var vB = bB.m_linearVelocity;
  var wB = bB.m_angularVelocity;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var Cdot1X = vB.x - wB * rBY - vA.x + wA * rAY;
  var Cdot1Y = vB.y + wB * rBX - vA.y - wA * rAX;
  var Cdot2 = wB - wA;
  var impulse = new b2Vec3;
  this.m_mass.Solve33(impulse, -Cdot1X, -Cdot1Y, -Cdot2);
  this.m_impulse.Add(impulse);
  vA.x -= mA * impulse.x;
  vA.y -= mA * impulse.y;
  wA -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
  vB.x += mB * impulse.x;
  vB.y += mB * impulse.y;
  wB += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
  bA.m_angularVelocity = wA;
  bB.m_angularVelocity = wB
};
b2WeldJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  var C1X = bB.m_sweep.c.x + rBX - bA.m_sweep.c.x - rAX;
  var C1Y = bB.m_sweep.c.y + rBY - bA.m_sweep.c.y - rAY;
  var C2 = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
  var k_allowedStretch = 10 * b2Settings.b2_linearSlop;
  var positionError = Math.sqrt(C1X * C1X + C1Y * C1Y);
  var angularError = b2Math.Abs(C2);
  if(positionError > k_allowedStretch) {
    iA *= 1;
    iB *= 1
  }
  this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
  this.m_mass.col2.x = -rAY * rAX * iA - rBY * rBX * iB;
  this.m_mass.col3.x = -rAY * iA - rBY * iB;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
  this.m_mass.col3.y = rAX * iA + rBX * iB;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = iA + iB;
  var impulse = new b2Vec3;
  this.m_mass.Solve33(impulse, -C1X, -C1Y, -C2);
  bA.m_sweep.c.x -= mA * impulse.x;
  bA.m_sweep.c.y -= mA * impulse.y;
  bA.m_sweep.a -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
  bB.m_sweep.c.x += mB * impulse.x;
  bB.m_sweep.c.y += mB * impulse.y;
  bB.m_sweep.a += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2WeldJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
b2WeldJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
b2WeldJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2WeldJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.z
};
b2WeldJoint.prototype.m_localAnchorA = new b2Vec2;
b2WeldJoint.prototype.m_localAnchorB = new b2Vec2;
b2WeldJoint.prototype.m_referenceAngle = null;
b2WeldJoint.prototype.m_impulse = new b2Vec3;
b2WeldJoint.prototype.m_mass = new b2Mat33;var b2Math = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Math.prototype.__constructor = function() {
};
b2Math.prototype.__varz = function() {
};
b2Math.IsValid = function(x) {
  return isFinite(x)
};
b2Math.Dot = function(a, b) {
  return a.x * b.x + a.y * b.y
};
b2Math.CrossVV = function(a, b) {
  return a.x * b.y - a.y * b.x
};
b2Math.CrossVF = function(a, s) {
  var v = new b2Vec2(s * a.y, -s * a.x);
  return v
};
b2Math.CrossFV = function(s, a) {
  var v = new b2Vec2(-s * a.y, s * a.x);
  return v
};
b2Math.MulMV = function(A, v) {
  var u = new b2Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
  return u
};
b2Math.MulTMV = function(A, v) {
  var u = new b2Vec2(b2Math.Dot(v, A.col1), b2Math.Dot(v, A.col2));
  return u
};
b2Math.MulX = function(T, v) {
  var a = b2Math.MulMV(T.R, v);
  a.x += T.position.x;
  a.y += T.position.y;
  return a
};
b2Math.MulXT = function(T, v) {
  var a = b2Math.SubtractVV(v, T.position);
  var tX = a.x * T.R.col1.x + a.y * T.R.col1.y;
  a.y = a.x * T.R.col2.x + a.y * T.R.col2.y;
  a.x = tX;
  return a
};
b2Math.AddVV = function(a, b) {
  var v = new b2Vec2(a.x + b.x, a.y + b.y);
  return v
};
b2Math.SubtractVV = function(a, b) {
  var v = new b2Vec2(a.x - b.x, a.y - b.y);
  return v
};
b2Math.Distance = function(a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return Math.sqrt(cX * cX + cY * cY)
};
b2Math.DistanceSquared = function(a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return cX * cX + cY * cY
};
b2Math.MulFV = function(s, a) {
  var v = new b2Vec2(s * a.x, s * a.y);
  return v
};
b2Math.AddMM = function(A, B) {
  var C = b2Mat22.FromVV(b2Math.AddVV(A.col1, B.col1), b2Math.AddVV(A.col2, B.col2));
  return C
};
b2Math.MulMM = function(A, B) {
  var C = b2Mat22.FromVV(b2Math.MulMV(A, B.col1), b2Math.MulMV(A, B.col2));
  return C
};
b2Math.MulTMM = function(A, B) {
  var c1 = new b2Vec2(b2Math.Dot(A.col1, B.col1), b2Math.Dot(A.col2, B.col1));
  var c2 = new b2Vec2(b2Math.Dot(A.col1, B.col2), b2Math.Dot(A.col2, B.col2));
  var C = b2Mat22.FromVV(c1, c2);
  return C
};
b2Math.Abs = function(a) {
  return a > 0 ? a : -a
};
b2Math.AbsV = function(a) {
  var b = new b2Vec2(b2Math.Abs(a.x), b2Math.Abs(a.y));
  return b
};
b2Math.AbsM = function(A) {
  var B = b2Mat22.FromVV(b2Math.AbsV(A.col1), b2Math.AbsV(A.col2));
  return B
};
b2Math.Min = function(a, b) {
  return a < b ? a : b
};
b2Math.MinV = function(a, b) {
  var c = new b2Vec2(b2Math.Min(a.x, b.x), b2Math.Min(a.y, b.y));
  return c
};
b2Math.Max = function(a, b) {
  return a > b ? a : b
};
b2Math.MaxV = function(a, b) {
  var c = new b2Vec2(b2Math.Max(a.x, b.x), b2Math.Max(a.y, b.y));
  return c
};
b2Math.Clamp = function(a, low, high) {
  return a < low ? low : a > high ? high : a
};
b2Math.ClampV = function(a, low, high) {
  return b2Math.MaxV(low, b2Math.MinV(a, high))
};
b2Math.Swap = function(a, b) {
  var tmp = a[0];
  a[0] = b[0];
  b[0] = tmp
};
b2Math.Random = function() {
  return Math.random() * 2 - 1
};
b2Math.RandomRange = function(lo, hi) {
  var r = Math.random();
  r = (hi - lo) * r + lo;
  return r
};
b2Math.NextPowerOfTwo = function(x) {
  x |= x >> 1 & 2147483647;
  x |= x >> 2 & 1073741823;
  x |= x >> 4 & 268435455;
  x |= x >> 8 & 16777215;
  x |= x >> 16 & 65535;
  return x + 1
};
b2Math.IsPowerOfTwo = function(x) {
  var result = x > 0 && (x & x - 1) == 0;
  return result
};
b2Math.b2Vec2_zero = new b2Vec2(0, 0);
b2Math.b2Mat22_identity = b2Mat22.FromVV(new b2Vec2(1, 0), new b2Vec2(0, 1));
b2Math.b2Transform_identity = new b2Transform(b2Math.b2Vec2_zero, b2Math.b2Mat22_identity);var b2PulleyJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PulleyJoint.prototype, b2Joint.prototype);
b2PulleyJoint.prototype._super = b2Joint.prototype;
b2PulleyJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_ground = this.m_bodyA.m_world.m_groundBody;
  this.m_groundAnchor1.x = def.groundAnchorA.x - this.m_ground.m_xf.position.x;
  this.m_groundAnchor1.y = def.groundAnchorA.y - this.m_ground.m_xf.position.y;
  this.m_groundAnchor2.x = def.groundAnchorB.x - this.m_ground.m_xf.position.x;
  this.m_groundAnchor2.y = def.groundAnchorB.y - this.m_ground.m_xf.position.y;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_ratio = def.ratio;
  this.m_constant = def.lengthA + this.m_ratio * def.lengthB;
  this.m_maxLength1 = b2Math.Min(def.maxLengthA, this.m_constant - this.m_ratio * b2PulleyJoint.b2_minPulleyLength);
  this.m_maxLength2 = b2Math.Min(def.maxLengthB, (this.m_constant - b2PulleyJoint.b2_minPulleyLength) / this.m_ratio);
  this.m_impulse = 0;
  this.m_limitImpulse1 = 0;
  this.m_limitImpulse2 = 0
};
b2PulleyJoint.prototype.__varz = function() {
  this.m_groundAnchor1 = new b2Vec2;
  this.m_groundAnchor2 = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_u1 = new b2Vec2;
  this.m_u2 = new b2Vec2
};
b2PulleyJoint.b2_minPulleyLength = 2;
b2PulleyJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  this.m_u1.Set(p1X - s1X, p1Y - s1Y);
  this.m_u2.Set(p2X - s2X, p2Y - s2Y);
  var length1 = this.m_u1.Length();
  var length2 = this.m_u2.Length();
  if(length1 > b2Settings.b2_linearSlop) {
    this.m_u1.Multiply(1 / length1)
  }else {
    this.m_u1.SetZero()
  }
  if(length2 > b2Settings.b2_linearSlop) {
    this.m_u2.Multiply(1 / length2)
  }else {
    this.m_u2.SetZero()
  }
  var C = this.m_constant - length1 - this.m_ratio * length2;
  if(C > 0) {
    this.m_state = b2Joint.e_inactiveLimit;
    this.m_impulse = 0
  }else {
    this.m_state = b2Joint.e_atUpperLimit
  }
  if(length1 < this.m_maxLength1) {
    this.m_limitState1 = b2Joint.e_inactiveLimit;
    this.m_limitImpulse1 = 0
  }else {
    this.m_limitState1 = b2Joint.e_atUpperLimit
  }
  if(length2 < this.m_maxLength2) {
    this.m_limitState2 = b2Joint.e_inactiveLimit;
    this.m_limitImpulse2 = 0
  }else {
    this.m_limitState2 = b2Joint.e_atUpperLimit
  }
  var cr1u1 = r1X * this.m_u1.y - r1Y * this.m_u1.x;
  var cr2u2 = r2X * this.m_u2.y - r2Y * this.m_u2.x;
  this.m_limitMass1 = bA.m_invMass + bA.m_invI * cr1u1 * cr1u1;
  this.m_limitMass2 = bB.m_invMass + bB.m_invI * cr2u2 * cr2u2;
  this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2;
  this.m_limitMass1 = 1 / this.m_limitMass1;
  this.m_limitMass2 = 1 / this.m_limitMass2;
  this.m_pulleyMass = 1 / this.m_pulleyMass;
  if(step.warmStarting) {
    this.m_impulse *= step.dtRatio;
    this.m_limitImpulse1 *= step.dtRatio;
    this.m_limitImpulse2 *= step.dtRatio;
    var P1X = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.x;
    var P1Y = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.y;
    var P2X = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.x;
    var P2Y = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }else {
    this.m_impulse = 0;
    this.m_limitImpulse1 = 0;
    this.m_limitImpulse2 = 0
  }
};
b2PulleyJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var v1X;
  var v1Y;
  var v2X;
  var v2Y;
  var P1X;
  var P1Y;
  var P2X;
  var P2Y;
  var Cdot;
  var impulse;
  var oldImpulse;
  if(this.m_state == b2Joint.e_atUpperLimit) {
    v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
    v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
    v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
    v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
    Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y) - this.m_ratio * (this.m_u2.x * v2X + this.m_u2.y * v2Y);
    impulse = this.m_pulleyMass * -Cdot;
    oldImpulse = this.m_impulse;
    this.m_impulse = b2Math.Max(0, this.m_impulse + impulse);
    impulse = this.m_impulse - oldImpulse;
    P1X = -impulse * this.m_u1.x;
    P1Y = -impulse * this.m_u1.y;
    P2X = -this.m_ratio * impulse * this.m_u2.x;
    P2Y = -this.m_ratio * impulse * this.m_u2.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }
  if(this.m_limitState1 == b2Joint.e_atUpperLimit) {
    v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
    v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
    Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y);
    impulse = -this.m_limitMass1 * Cdot;
    oldImpulse = this.m_limitImpulse1;
    this.m_limitImpulse1 = b2Math.Max(0, this.m_limitImpulse1 + impulse);
    impulse = this.m_limitImpulse1 - oldImpulse;
    P1X = -impulse * this.m_u1.x;
    P1Y = -impulse * this.m_u1.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X)
  }
  if(this.m_limitState2 == b2Joint.e_atUpperLimit) {
    v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
    v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
    Cdot = -(this.m_u2.x * v2X + this.m_u2.y * v2Y);
    impulse = -this.m_limitMass2 * Cdot;
    oldImpulse = this.m_limitImpulse2;
    this.m_limitImpulse2 = b2Math.Max(0, this.m_limitImpulse2 + impulse);
    impulse = this.m_limitImpulse2 - oldImpulse;
    P2X = -impulse * this.m_u2.x;
    P2Y = -impulse * this.m_u2.y;
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }
};
b2PulleyJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  var r1X;
  var r1Y;
  var r2X;
  var r2Y;
  var p1X;
  var p1Y;
  var p2X;
  var p2Y;
  var length1;
  var length2;
  var C;
  var impulse;
  var oldImpulse;
  var oldLimitPositionImpulse;
  var tX;
  var linearError = 0;
  if(this.m_state == b2Joint.e_atUpperLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    p1X = bA.m_sweep.c.x + r1X;
    p1Y = bA.m_sweep.c.y + r1Y;
    p2X = bB.m_sweep.c.x + r2X;
    p2Y = bB.m_sweep.c.y + r2Y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    length1 = this.m_u1.Length();
    length2 = this.m_u2.Length();
    if(length1 > b2Settings.b2_linearSlop) {
      this.m_u1.Multiply(1 / length1)
    }else {
      this.m_u1.SetZero()
    }
    if(length2 > b2Settings.b2_linearSlop) {
      this.m_u2.Multiply(1 / length2)
    }else {
      this.m_u2.SetZero()
    }
    C = this.m_constant - length1 - this.m_ratio * length2;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_pulleyMass * C;
    p1X = -impulse * this.m_u1.x;
    p1Y = -impulse * this.m_u1.y;
    p2X = -this.m_ratio * impulse * this.m_u2.x;
    p2Y = -this.m_ratio * impulse * this.m_u2.y;
    bA.m_sweep.c.x += bA.m_invMass * p1X;
    bA.m_sweep.c.y += bA.m_invMass * p1Y;
    bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
    bB.m_sweep.c.x += bB.m_invMass * p2X;
    bB.m_sweep.c.y += bB.m_invMass * p2Y;
    bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
    bA.SynchronizeTransform();
    bB.SynchronizeTransform()
  }
  if(this.m_limitState1 == b2Joint.e_atUpperLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    p1X = bA.m_sweep.c.x + r1X;
    p1Y = bA.m_sweep.c.y + r1Y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    length1 = this.m_u1.Length();
    if(length1 > b2Settings.b2_linearSlop) {
      this.m_u1.x *= 1 / length1;
      this.m_u1.y *= 1 / length1
    }else {
      this.m_u1.SetZero()
    }
    C = this.m_maxLength1 - length1;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_limitMass1 * C;
    p1X = -impulse * this.m_u1.x;
    p1Y = -impulse * this.m_u1.y;
    bA.m_sweep.c.x += bA.m_invMass * p1X;
    bA.m_sweep.c.y += bA.m_invMass * p1Y;
    bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
    bA.SynchronizeTransform()
  }
  if(this.m_limitState2 == b2Joint.e_atUpperLimit) {
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    p2X = bB.m_sweep.c.x + r2X;
    p2Y = bB.m_sweep.c.y + r2Y;
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    length2 = this.m_u2.Length();
    if(length2 > b2Settings.b2_linearSlop) {
      this.m_u2.x *= 1 / length2;
      this.m_u2.y *= 1 / length2
    }else {
      this.m_u2.SetZero()
    }
    C = this.m_maxLength2 - length2;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_limitMass2 * C;
    p2X = -impulse * this.m_u2.x;
    p2Y = -impulse * this.m_u2.y;
    bB.m_sweep.c.x += bB.m_invMass * p2X;
    bB.m_sweep.c.y += bB.m_invMass * p2Y;
    bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
    bB.SynchronizeTransform()
  }
  return linearError < b2Settings.b2_linearSlop
};
b2PulleyJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2PulleyJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2PulleyJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_u2.x, inv_dt * this.m_impulse * this.m_u2.y)
};
b2PulleyJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2PulleyJoint.prototype.GetGroundAnchorA = function() {
  var a = this.m_ground.m_xf.position.Copy();
  a.Add(this.m_groundAnchor1);
  return a
};
b2PulleyJoint.prototype.GetGroundAnchorB = function() {
  var a = this.m_ground.m_xf.position.Copy();
  a.Add(this.m_groundAnchor2);
  return a
};
b2PulleyJoint.prototype.GetLength1 = function() {
  var p = this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
  var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var dX = p.x - sX;
  var dY = p.y - sY;
  return Math.sqrt(dX * dX + dY * dY)
};
b2PulleyJoint.prototype.GetLength2 = function() {
  var p = this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
  var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  var dX = p.x - sX;
  var dY = p.y - sY;
  return Math.sqrt(dX * dX + dY * dY)
};
b2PulleyJoint.prototype.GetRatio = function() {
  return this.m_ratio
};
b2PulleyJoint.prototype.m_ground = null;
b2PulleyJoint.prototype.m_groundAnchor1 = new b2Vec2;
b2PulleyJoint.prototype.m_groundAnchor2 = new b2Vec2;
b2PulleyJoint.prototype.m_localAnchor1 = new b2Vec2;
b2PulleyJoint.prototype.m_localAnchor2 = new b2Vec2;
b2PulleyJoint.prototype.m_u1 = new b2Vec2;
b2PulleyJoint.prototype.m_u2 = new b2Vec2;
b2PulleyJoint.prototype.m_constant = null;
b2PulleyJoint.prototype.m_ratio = null;
b2PulleyJoint.prototype.m_maxLength1 = null;
b2PulleyJoint.prototype.m_maxLength2 = null;
b2PulleyJoint.prototype.m_pulleyMass = null;
b2PulleyJoint.prototype.m_limitMass1 = null;
b2PulleyJoint.prototype.m_limitMass2 = null;
b2PulleyJoint.prototype.m_impulse = null;
b2PulleyJoint.prototype.m_limitImpulse1 = null;
b2PulleyJoint.prototype.m_limitImpulse2 = null;
b2PulleyJoint.prototype.m_state = 0;
b2PulleyJoint.prototype.m_limitState1 = 0;
b2PulleyJoint.prototype.m_limitState2 = 0;var b2PrismaticJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PrismaticJoint.prototype, b2Joint.prototype);
b2PrismaticJoint.prototype._super = b2Joint.prototype;
b2PrismaticJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_localXAxis1.SetV(def.localAxisA);
  this.m_localYAxis1.x = -this.m_localXAxis1.y;
  this.m_localYAxis1.y = this.m_localXAxis1.x;
  this.m_refAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_motorMass = 0;
  this.m_motorImpulse = 0;
  this.m_lowerTranslation = def.lowerTranslation;
  this.m_upperTranslation = def.upperTranslation;
  this.m_maxMotorForce = def.maxMotorForce;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit;
  this.m_axis.SetZero();
  this.m_perp.SetZero()
};
b2PrismaticJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_localXAxis1 = new b2Vec2;
  this.m_localYAxis1 = new b2Vec2;
  this.m_axis = new b2Vec2;
  this.m_perp = new b2Vec2;
  this.m_K = new b2Mat33;
  this.m_impulse = new b2Vec3
};
b2PrismaticJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  this.m_localCenterA.SetV(bA.GetLocalCenter());
  this.m_localCenterB.SetV(bB.GetLocalCenter());
  var xf1 = bA.GetTransform();
  var xf2 = bB.GetTransform();
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  this.m_invMassA = bA.m_invMass;
  this.m_invMassB = bB.m_invMass;
  this.m_invIA = bA.m_invI;
  this.m_invIB = bB.m_invI;
  this.m_axis.SetV(b2Math.MulMV(xf1.R, this.m_localXAxis1));
  this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
  this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
  this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
  if(this.m_motorMass > Number.MIN_VALUE) {
    this.m_motorMass = 1 / this.m_motorMass
  }
  this.m_perp.SetV(b2Math.MulMV(xf1.R, this.m_localYAxis1));
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var m1 = this.m_invMassA;
  var m2 = this.m_invMassB;
  var i1 = this.m_invIA;
  var i2 = this.m_invIB;
  this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
  this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
  this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
  this.m_K.col2.x = this.m_K.col1.y;
  this.m_K.col2.y = i1 + i2;
  this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
  this.m_K.col3.x = this.m_K.col1.z;
  this.m_K.col3.y = this.m_K.col2.z;
  this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
  if(this.m_enableLimit) {
    var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointTransition <= this.m_lowerTranslation) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_limitState = b2Joint.e_atLowerLimit;
          this.m_impulse.z = 0
        }
      }else {
        if(jointTransition >= this.m_upperTranslation) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_limitState = b2Joint.e_atUpperLimit;
            this.m_impulse.z = 0
          }
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.z = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x;
    var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y;
    var L1 = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1;
    var L2 = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
    bA.m_linearVelocity.x -= this.m_invMassA * PX;
    bA.m_linearVelocity.y -= this.m_invMassA * PY;
    bA.m_angularVelocity -= this.m_invIA * L1;
    bB.m_linearVelocity.x += this.m_invMassB * PX;
    bB.m_linearVelocity.y += this.m_invMassB * PY;
    bB.m_angularVelocity += this.m_invIB * L2
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2PrismaticJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var PX;
  var PY;
  var L1;
  var L2;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorForce;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    PX = impulse * this.m_axis.x;
    PY = impulse * this.m_axis.y;
    L1 = impulse * this.m_a1;
    L2 = impulse * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  var Cdot1X = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
  var Cdot1Y = w2 - w1;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var f1 = this.m_impulse.Copy();
    var df = this.m_K.Solve33(new b2Vec3, -Cdot1X, -Cdot1Y, -Cdot2);
    this.m_impulse.Add(df);
    if(this.m_limitState == b2Joint.e_atLowerLimit) {
      this.m_impulse.z = b2Math.Max(this.m_impulse.z, 0)
    }else {
      if(this.m_limitState == b2Joint.e_atUpperLimit) {
        this.m_impulse.z = b2Math.Min(this.m_impulse.z, 0)
      }
    }
    var bX = -Cdot1X - (this.m_impulse.z - f1.z) * this.m_K.col3.x;
    var bY = -Cdot1Y - (this.m_impulse.z - f1.z) * this.m_K.col3.y;
    var f2r = this.m_K.Solve22(new b2Vec2, bX, bY);
    f2r.x += f1.x;
    f2r.y += f1.y;
    this.m_impulse.x = f2r.x;
    this.m_impulse.y = f2r.y;
    df.x = this.m_impulse.x - f1.x;
    df.y = this.m_impulse.y - f1.y;
    df.z = this.m_impulse.z - f1.z;
    PX = df.x * this.m_perp.x + df.z * this.m_axis.x;
    PY = df.x * this.m_perp.y + df.z * this.m_axis.y;
    L1 = df.x * this.m_s1 + df.y + df.z * this.m_a1;
    L2 = df.x * this.m_s2 + df.y + df.z * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }else {
    var df2 = this.m_K.Solve22(new b2Vec2, -Cdot1X, -Cdot1Y);
    this.m_impulse.x += df2.x;
    this.m_impulse.y += df2.y;
    PX = df2.x * this.m_perp.x;
    PY = df2.x * this.m_perp.y;
    L1 = df2.x * this.m_s1 + df2.y;
    L2 = df2.x * this.m_s2 + df2.y;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2PrismaticJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var limitC;
  var oldLimitImpulse;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var c1 = bA.m_sweep.c;
  var a1 = bA.m_sweep.a;
  var c2 = bB.m_sweep.c;
  var a2 = bB.m_sweep.a;
  var tMat;
  var tX;
  var m1;
  var m2;
  var i1;
  var i2;
  var linearError = 0;
  var angularError = 0;
  var active = false;
  var C2 = 0;
  var R1 = b2Mat22.FromAngle(a1);
  var R2 = b2Mat22.FromAngle(a2);
  tMat = R1;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = R2;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = c2.x + r2X - c1.x - r1X;
  var dY = c2.y + r2Y - c1.y - r1Y;
  if(this.m_enableLimit) {
    this.m_axis = b2Math.MulMV(R1, this.m_localXAxis1);
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    var translation = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      C2 = b2Math.Clamp(translation, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
      linearError = b2Math.Abs(translation);
      active = true
    }else {
      if(translation <= this.m_lowerTranslation) {
        C2 = b2Math.Clamp(translation - this.m_lowerTranslation + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
        linearError = this.m_lowerTranslation - translation;
        active = true
      }else {
        if(translation >= this.m_upperTranslation) {
          C2 = b2Math.Clamp(translation - this.m_upperTranslation + b2Settings.b2_linearSlop, 0, b2Settings.b2_maxLinearCorrection);
          linearError = translation - this.m_upperTranslation;
          active = true
        }
      }
    }
  }
  this.m_perp = b2Math.MulMV(R1, this.m_localYAxis1);
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var impulse = new b2Vec3;
  var C1X = this.m_perp.x * dX + this.m_perp.y * dY;
  var C1Y = a2 - a1 - this.m_refAngle;
  linearError = b2Math.Max(linearError, b2Math.Abs(C1X));
  angularError = b2Math.Abs(C1Y);
  if(active) {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
    this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = i1 + i2;
    this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
    this.m_K.col3.x = this.m_K.col1.z;
    this.m_K.col3.y = this.m_K.col2.z;
    this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    this.m_K.Solve33(impulse, -C1X, -C1Y, -C2)
  }else {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    var k12 = i1 * this.m_s1 + i2 * this.m_s2;
    var k22 = i1 + i2;
    this.m_K.col1.Set(k11, k12, 0);
    this.m_K.col2.Set(k12, k22, 0);
    var impulse1 = this.m_K.Solve22(new b2Vec2, -C1X, -C1Y);
    impulse.x = impulse1.x;
    impulse.y = impulse1.y;
    impulse.z = 0
  }
  var PX = impulse.x * this.m_perp.x + impulse.z * this.m_axis.x;
  var PY = impulse.x * this.m_perp.y + impulse.z * this.m_axis.y;
  var L1 = impulse.x * this.m_s1 + impulse.y + impulse.z * this.m_a1;
  var L2 = impulse.x * this.m_s2 + impulse.y + impulse.z * this.m_a2;
  c1.x -= this.m_invMassA * PX;
  c1.y -= this.m_invMassA * PY;
  a1 -= this.m_invIA * L1;
  c2.x += this.m_invMassB * PX;
  c2.y += this.m_invMassB * PY;
  a2 += this.m_invIB * L2;
  bA.m_sweep.a = a1;
  bB.m_sweep.a = a2;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2PrismaticJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2PrismaticJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2PrismaticJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y))
};
b2PrismaticJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.y
};
b2PrismaticJoint.prototype.GetJointTranslation = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var p1 = bA.GetWorldPoint(this.m_localAnchor1);
  var p2 = bB.GetWorldPoint(this.m_localAnchor2);
  var dX = p2.x - p1.x;
  var dY = p2.y - p1.y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var translation = axis.x * dX + axis.y * dY;
  return translation
};
b2PrismaticJoint.prototype.GetJointSpeed = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var v1 = bA.m_linearVelocity;
  var v2 = bB.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var w2 = bB.m_angularVelocity;
  var speed = dX * -w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x + -w2 * r2Y - v1.x - -w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
  return speed
};
b2PrismaticJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2PrismaticJoint.prototype.EnableLimit = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableLimit = flag
};
b2PrismaticJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerTranslation
};
b2PrismaticJoint.prototype.GetUpperLimit = function() {
  return this.m_upperTranslation
};
b2PrismaticJoint.prototype.SetLimits = function(lower, upper) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_lowerTranslation = lower;
  this.m_upperTranslation = upper
};
b2PrismaticJoint.prototype.IsMotorEnabled = function() {
  return this.m_enableMotor
};
b2PrismaticJoint.prototype.EnableMotor = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag
};
b2PrismaticJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2PrismaticJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2PrismaticJoint.prototype.SetMaxMotorForce = function(force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorForce = force
};
b2PrismaticJoint.prototype.GetMotorForce = function() {
  return this.m_motorImpulse
};
b2PrismaticJoint.prototype.m_localAnchor1 = new b2Vec2;
b2PrismaticJoint.prototype.m_localAnchor2 = new b2Vec2;
b2PrismaticJoint.prototype.m_localXAxis1 = new b2Vec2;
b2PrismaticJoint.prototype.m_localYAxis1 = new b2Vec2;
b2PrismaticJoint.prototype.m_refAngle = null;
b2PrismaticJoint.prototype.m_axis = new b2Vec2;
b2PrismaticJoint.prototype.m_perp = new b2Vec2;
b2PrismaticJoint.prototype.m_s1 = null;
b2PrismaticJoint.prototype.m_s2 = null;
b2PrismaticJoint.prototype.m_a1 = null;
b2PrismaticJoint.prototype.m_a2 = null;
b2PrismaticJoint.prototype.m_K = new b2Mat33;
b2PrismaticJoint.prototype.m_impulse = new b2Vec3;
b2PrismaticJoint.prototype.m_motorMass = null;
b2PrismaticJoint.prototype.m_motorImpulse = null;
b2PrismaticJoint.prototype.m_lowerTranslation = null;
b2PrismaticJoint.prototype.m_upperTranslation = null;
b2PrismaticJoint.prototype.m_maxMotorForce = null;
b2PrismaticJoint.prototype.m_motorSpeed = null;
b2PrismaticJoint.prototype.m_enableLimit = null;
b2PrismaticJoint.prototype.m_enableMotor = null;
b2PrismaticJoint.prototype.m_limitState = 0;var b2RevoluteJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2RevoluteJoint.prototype, b2Joint.prototype);
b2RevoluteJoint.prototype._super = b2Joint.prototype;
b2RevoluteJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_referenceAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_motorImpulse = 0;
  this.m_lowerAngle = def.lowerAngle;
  this.m_upperAngle = def.upperAngle;
  this.m_maxMotorTorque = def.maxMotorTorque;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit
};
b2RevoluteJoint.prototype.__varz = function() {
  this.K = new b2Mat22;
  this.K1 = new b2Mat22;
  this.K2 = new b2Mat22;
  this.K3 = new b2Mat22;
  this.impulse3 = new b2Vec3;
  this.impulse2 = new b2Vec2;
  this.reduced = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_impulse = new b2Vec3;
  this.m_mass = new b2Mat33
};
b2RevoluteJoint.tImpulse = new b2Vec2;
b2RevoluteJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  if(this.m_enableMotor || this.m_enableLimit) {
  }
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var m1 = bA.m_invMass;
  var m2 = bB.m_invMass;
  var i1 = bA.m_invI;
  var i2 = bB.m_invI;
  this.m_mass.col1.x = m1 + m2 + r1Y * r1Y * i1 + r2Y * r2Y * i2;
  this.m_mass.col2.x = -r1Y * r1X * i1 - r2Y * r2X * i2;
  this.m_mass.col3.x = -r1Y * i1 - r2Y * i2;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = m1 + m2 + r1X * r1X * i1 + r2X * r2X * i2;
  this.m_mass.col3.y = r1X * i1 + r2X * i2;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = i1 + i2;
  this.m_motorMass = 1 / (i1 + i2);
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(this.m_enableLimit) {
    var jointAngle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    if(b2Math.Abs(this.m_upperAngle - this.m_lowerAngle) < 2 * b2Settings.b2_angularSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointAngle <= this.m_lowerAngle) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_impulse.z = 0
        }
        this.m_limitState = b2Joint.e_atLowerLimit
      }else {
        if(jointAngle >= this.m_upperAngle) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_impulse.z = 0
          }
          this.m_limitState = b2Joint.e_atUpperLimit
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.z = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x;
    var PY = this.m_impulse.y;
    bA.m_linearVelocity.x -= m1 * PX;
    bA.m_linearVelocity.y -= m1 * PY;
    bA.m_angularVelocity -= i1 * (r1X * PY - r1Y * PX + this.m_motorImpulse + this.m_impulse.z);
    bB.m_linearVelocity.x += m2 * PX;
    bB.m_linearVelocity.y += m2 * PY;
    bB.m_angularVelocity += i2 * (r2X * PY - r2Y * PX + this.m_motorImpulse + this.m_impulse.z)
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2RevoluteJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  var newImpulse;
  var r1X;
  var r1Y;
  var r2X;
  var r2Y;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var m1 = bA.m_invMass;
  var m2 = bB.m_invMass;
  var i1 = bA.m_invI;
  var i2 = bB.m_invI;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = w2 - w1 - this.m_motorSpeed;
    var impulse = this.m_motorMass * -Cdot;
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorTorque;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    w1 -= i1 * impulse;
    w2 += i2 * impulse
  }
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var Cdot1X = v2.x + -w2 * r2Y - v1.x - -w1 * r1Y;
    var Cdot1Y = v2.y + w2 * r2X - v1.y - w1 * r1X;
    var Cdot2 = w2 - w1;
    this.m_mass.Solve33(this.impulse3, -Cdot1X, -Cdot1Y, -Cdot2);
    if(this.m_limitState == b2Joint.e_equalLimits) {
      this.m_impulse.Add(this.impulse3)
    }else {
      if(this.m_limitState == b2Joint.e_atLowerLimit) {
        newImpulse = this.m_impulse.z + this.impulse3.z;
        if(newImpulse < 0) {
          this.m_mass.Solve22(this.reduced, -Cdot1X, -Cdot1Y);
          this.impulse3.x = this.reduced.x;
          this.impulse3.y = this.reduced.y;
          this.impulse3.z = -this.m_impulse.z;
          this.m_impulse.x += this.reduced.x;
          this.m_impulse.y += this.reduced.y;
          this.m_impulse.z = 0
        }
      }else {
        if(this.m_limitState == b2Joint.e_atUpperLimit) {
          newImpulse = this.m_impulse.z + this.impulse3.z;
          if(newImpulse > 0) {
            this.m_mass.Solve22(this.reduced, -Cdot1X, -Cdot1Y);
            this.impulse3.x = this.reduced.x;
            this.impulse3.y = this.reduced.y;
            this.impulse3.z = -this.m_impulse.z;
            this.m_impulse.x += this.reduced.x;
            this.m_impulse.y += this.reduced.y;
            this.m_impulse.z = 0
          }
        }
      }
    }
    v1.x -= m1 * this.impulse3.x;
    v1.y -= m1 * this.impulse3.y;
    w1 -= i1 * (r1X * this.impulse3.y - r1Y * this.impulse3.x + this.impulse3.z);
    v2.x += m2 * this.impulse3.x;
    v2.y += m2 * this.impulse3.y;
    w2 += i2 * (r2X * this.impulse3.y - r2Y * this.impulse3.x + this.impulse3.z)
  }else {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var CdotX = v2.x + -w2 * r2Y - v1.x - -w1 * r1Y;
    var CdotY = v2.y + w2 * r2X - v1.y - w1 * r1X;
    this.m_mass.Solve22(this.impulse2, -CdotX, -CdotY);
    this.m_impulse.x += this.impulse2.x;
    this.m_impulse.y += this.impulse2.y;
    v1.x -= m1 * this.impulse2.x;
    v1.y -= m1 * this.impulse2.y;
    w1 -= i1 * (r1X * this.impulse2.y - r1Y * this.impulse2.x);
    v2.x += m2 * this.impulse2.x;
    v2.y += m2 * this.impulse2.y;
    w2 += i2 * (r2X * this.impulse2.y - r2Y * this.impulse2.x)
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2RevoluteJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var oldLimitImpulse;
  var C;
  var tMat;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var angularError = 0;
  var positionError = 0;
  var tX;
  var impulseX;
  var impulseY;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var angle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    var limitImpulse = 0;
    if(this.m_limitState == b2Joint.e_equalLimits) {
      C = b2Math.Clamp(angle - this.m_lowerAngle, -b2Settings.b2_maxAngularCorrection, b2Settings.b2_maxAngularCorrection);
      limitImpulse = -this.m_motorMass * C;
      angularError = b2Math.Abs(C)
    }else {
      if(this.m_limitState == b2Joint.e_atLowerLimit) {
        C = angle - this.m_lowerAngle;
        angularError = -C;
        C = b2Math.Clamp(C + b2Settings.b2_angularSlop, -b2Settings.b2_maxAngularCorrection, 0);
        limitImpulse = -this.m_motorMass * C
      }else {
        if(this.m_limitState == b2Joint.e_atUpperLimit) {
          C = angle - this.m_upperAngle;
          angularError = C;
          C = b2Math.Clamp(C - b2Settings.b2_angularSlop, 0, b2Settings.b2_maxAngularCorrection);
          limitImpulse = -this.m_motorMass * C
        }
      }
    }
    bA.m_sweep.a -= bA.m_invI * limitImpulse;
    bB.m_sweep.a += bB.m_invI * limitImpulse;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform()
  }
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var CLengthSquared = CX * CX + CY * CY;
  var CLength = Math.sqrt(CLengthSquared);
  positionError = CLength;
  var invMass1 = bA.m_invMass;
  var invMass2 = bB.m_invMass;
  var invI1 = bA.m_invI;
  var invI2 = bB.m_invI;
  var k_allowedStretch = 10 * b2Settings.b2_linearSlop;
  if(CLengthSquared > k_allowedStretch * k_allowedStretch) {
    var uX = CX / CLength;
    var uY = CY / CLength;
    var k = invMass1 + invMass2;
    var m = 1 / k;
    impulseX = m * -CX;
    impulseY = m * -CY;
    var k_beta = 0.5;
    bA.m_sweep.c.x -= k_beta * invMass1 * impulseX;
    bA.m_sweep.c.y -= k_beta * invMass1 * impulseY;
    bB.m_sweep.c.x += k_beta * invMass2 * impulseX;
    bB.m_sweep.c.y += k_beta * invMass2 * impulseY;
    CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y
  }
  this.K1.col1.x = invMass1 + invMass2;
  this.K1.col2.x = 0;
  this.K1.col1.y = 0;
  this.K1.col2.y = invMass1 + invMass2;
  this.K2.col1.x = invI1 * r1Y * r1Y;
  this.K2.col2.x = -invI1 * r1X * r1Y;
  this.K2.col1.y = -invI1 * r1X * r1Y;
  this.K2.col2.y = invI1 * r1X * r1X;
  this.K3.col1.x = invI2 * r2Y * r2Y;
  this.K3.col2.x = -invI2 * r2X * r2Y;
  this.K3.col1.y = -invI2 * r2X * r2Y;
  this.K3.col2.y = invI2 * r2X * r2X;
  this.K.SetM(this.K1);
  this.K.AddM(this.K2);
  this.K.AddM(this.K3);
  this.K.Solve(b2RevoluteJoint.tImpulse, -CX, -CY);
  impulseX = b2RevoluteJoint.tImpulse.x;
  impulseY = b2RevoluteJoint.tImpulse.y;
  bA.m_sweep.c.x -= bA.m_invMass * impulseX;
  bA.m_sweep.c.y -= bA.m_invMass * impulseY;
  bA.m_sweep.a -= bA.m_invI * (r1X * impulseY - r1Y * impulseX);
  bB.m_sweep.c.x += bB.m_invMass * impulseX;
  bB.m_sweep.c.y += bB.m_invMass * impulseY;
  bB.m_sweep.a += bB.m_invI * (r2X * impulseY - r2Y * impulseX);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2RevoluteJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2RevoluteJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2RevoluteJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2RevoluteJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.z
};
b2RevoluteJoint.prototype.GetJointAngle = function() {
  return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle
};
b2RevoluteJoint.prototype.GetJointSpeed = function() {
  return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity
};
b2RevoluteJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2RevoluteJoint.prototype.EnableLimit = function(flag) {
  this.m_enableLimit = flag
};
b2RevoluteJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerAngle
};
b2RevoluteJoint.prototype.GetUpperLimit = function() {
  return this.m_upperAngle
};
b2RevoluteJoint.prototype.SetLimits = function(lower, upper) {
  this.m_lowerAngle = lower;
  this.m_upperAngle = upper
};
b2RevoluteJoint.prototype.IsMotorEnabled = function() {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  return this.m_enableMotor
};
b2RevoluteJoint.prototype.EnableMotor = function(flag) {
  this.m_enableMotor = flag
};
b2RevoluteJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2RevoluteJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2RevoluteJoint.prototype.SetMaxMotorTorque = function(torque) {
  this.m_maxMotorTorque = torque
};
b2RevoluteJoint.prototype.GetMotorTorque = function() {
  return this.m_maxMotorTorque
};
b2RevoluteJoint.prototype.K = new b2Mat22;
b2RevoluteJoint.prototype.K1 = new b2Mat22;
b2RevoluteJoint.prototype.K2 = new b2Mat22;
b2RevoluteJoint.prototype.K3 = new b2Mat22;
b2RevoluteJoint.prototype.impulse3 = new b2Vec3;
b2RevoluteJoint.prototype.impulse2 = new b2Vec2;
b2RevoluteJoint.prototype.reduced = new b2Vec2;
b2RevoluteJoint.prototype.m_localAnchor1 = new b2Vec2;
b2RevoluteJoint.prototype.m_localAnchor2 = new b2Vec2;
b2RevoluteJoint.prototype.m_impulse = new b2Vec3;
b2RevoluteJoint.prototype.m_motorImpulse = null;
b2RevoluteJoint.prototype.m_mass = new b2Mat33;
b2RevoluteJoint.prototype.m_motorMass = null;
b2RevoluteJoint.prototype.m_enableMotor = null;
b2RevoluteJoint.prototype.m_maxMotorTorque = null;
b2RevoluteJoint.prototype.m_motorSpeed = null;
b2RevoluteJoint.prototype.m_enableLimit = null;
b2RevoluteJoint.prototype.m_referenceAngle = null;
b2RevoluteJoint.prototype.m_lowerAngle = null;
b2RevoluteJoint.prototype.m_upperAngle = null;
b2RevoluteJoint.prototype.m_limitState = 0;var b2JointDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2JointDef.prototype.__constructor = function() {
  this.type = b2Joint.e_unknownJoint;
  this.userData = null;
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false
};
b2JointDef.prototype.__varz = function() {
};
b2JointDef.prototype.type = 0;
b2JointDef.prototype.userData = null;
b2JointDef.prototype.bodyA = null;
b2JointDef.prototype.bodyB = null;
b2JointDef.prototype.collideConnected = null;var b2LineJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2LineJointDef.prototype, b2JointDef.prototype);
b2LineJointDef.prototype._super = b2JointDef.prototype;
b2LineJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_lineJoint;
  this.localAxisA.Set(1, 0);
  this.enableLimit = false;
  this.lowerTranslation = 0;
  this.upperTranslation = 0;
  this.enableMotor = false;
  this.maxMotorForce = 0;
  this.motorSpeed = 0
};
b2LineJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2;
  this.localAxisA = new b2Vec2
};
b2LineJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.localAxisA = this.bodyA.GetLocalVector(axis)
};
b2LineJointDef.prototype.localAnchorA = new b2Vec2;
b2LineJointDef.prototype.localAnchorB = new b2Vec2;
b2LineJointDef.prototype.localAxisA = new b2Vec2;
b2LineJointDef.prototype.enableLimit = null;
b2LineJointDef.prototype.lowerTranslation = null;
b2LineJointDef.prototype.upperTranslation = null;
b2LineJointDef.prototype.enableMotor = null;
b2LineJointDef.prototype.maxMotorForce = null;
b2LineJointDef.prototype.motorSpeed = null;var b2DistanceJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2DistanceJoint.prototype, b2Joint.prototype);
b2DistanceJoint.prototype._super = b2Joint.prototype;
b2DistanceJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_length = def.length;
  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;
  this.m_impulse = 0;
  this.m_gamma = 0;
  this.m_bias = 0
};
b2DistanceJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_u = new b2Vec2
};
b2DistanceJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  this.m_u.x = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  this.m_u.y = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var length = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
  if(length > b2Settings.b2_linearSlop) {
    this.m_u.Multiply(1 / length)
  }else {
    this.m_u.SetZero()
  }
  var cr1u = r1X * this.m_u.y - r1Y * this.m_u.x;
  var cr2u = r2X * this.m_u.y - r2Y * this.m_u.x;
  var invMass = bA.m_invMass + bA.m_invI * cr1u * cr1u + bB.m_invMass + bB.m_invI * cr2u * cr2u;
  this.m_mass = invMass != 0 ? 1 / invMass : 0;
  if(this.m_frequencyHz > 0) {
    var C = length - this.m_length;
    var omega = 2 * Math.PI * this.m_frequencyHz;
    var d = 2 * this.m_mass * this.m_dampingRatio * omega;
    var k = this.m_mass * omega * omega;
    this.m_gamma = step.dt * (d + step.dt * k);
    this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
    this.m_bias = C * step.dt * k * this.m_gamma;
    this.m_mass = invMass + this.m_gamma;
    this.m_mass = this.m_mass != 0 ? 1 / this.m_mass : 0
  }
  if(step.warmStarting) {
    this.m_impulse *= step.dtRatio;
    var PX = this.m_impulse * this.m_u.x;
    var PY = this.m_impulse * this.m_u.y;
    bA.m_linearVelocity.x -= bA.m_invMass * PX;
    bA.m_linearVelocity.y -= bA.m_invMass * PY;
    bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
    bB.m_linearVelocity.x += bB.m_invMass * PX;
    bB.m_linearVelocity.y += bB.m_invMass * PY;
    bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX)
  }else {
    this.m_impulse = 0
  }
};
b2DistanceJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
  var v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
  var v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
  var v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
  var Cdot = this.m_u.x * (v2X - v1X) + this.m_u.y * (v2Y - v1Y);
  var impulse = -this.m_mass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
  this.m_impulse += impulse;
  var PX = impulse * this.m_u.x;
  var PY = impulse * this.m_u.y;
  bA.m_linearVelocity.x -= bA.m_invMass * PX;
  bA.m_linearVelocity.y -= bA.m_invMass * PY;
  bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
  bB.m_linearVelocity.x += bB.m_invMass * PX;
  bB.m_linearVelocity.y += bB.m_invMass * PY;
  bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX)
};
b2DistanceJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var tMat;
  if(this.m_frequencyHz > 0) {
    return true
  }
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var length = Math.sqrt(dX * dX + dY * dY);
  dX /= length;
  dY /= length;
  var C = length - this.m_length;
  C = b2Math.Clamp(C, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
  var impulse = -this.m_mass * C;
  this.m_u.Set(dX, dY);
  var PX = impulse * this.m_u.x;
  var PY = impulse * this.m_u.y;
  bA.m_sweep.c.x -= bA.m_invMass * PX;
  bA.m_sweep.c.y -= bA.m_invMass * PY;
  bA.m_sweep.a -= bA.m_invI * (r1X * PY - r1Y * PX);
  bB.m_sweep.c.x += bB.m_invMass * PX;
  bB.m_sweep.c.y += bB.m_invMass * PY;
  bB.m_sweep.a += bB.m_invI * (r2X * PY - r2Y * PX);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return b2Math.Abs(C) < b2Settings.b2_linearSlop
};
b2DistanceJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2DistanceJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2DistanceJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_u.x, inv_dt * this.m_impulse * this.m_u.y)
};
b2DistanceJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2DistanceJoint.prototype.GetLength = function() {
  return this.m_length
};
b2DistanceJoint.prototype.SetLength = function(length) {
  this.m_length = length
};
b2DistanceJoint.prototype.GetFrequency = function() {
  return this.m_frequencyHz
};
b2DistanceJoint.prototype.SetFrequency = function(hz) {
  this.m_frequencyHz = hz
};
b2DistanceJoint.prototype.GetDampingRatio = function() {
  return this.m_dampingRatio
};
b2DistanceJoint.prototype.SetDampingRatio = function(ratio) {
  this.m_dampingRatio = ratio
};
b2DistanceJoint.prototype.m_localAnchor1 = new b2Vec2;
b2DistanceJoint.prototype.m_localAnchor2 = new b2Vec2;
b2DistanceJoint.prototype.m_u = new b2Vec2;
b2DistanceJoint.prototype.m_frequencyHz = null;
b2DistanceJoint.prototype.m_dampingRatio = null;
b2DistanceJoint.prototype.m_gamma = null;
b2DistanceJoint.prototype.m_bias = null;
b2DistanceJoint.prototype.m_impulse = null;
b2DistanceJoint.prototype.m_mass = null;
b2DistanceJoint.prototype.m_length = null;var b2PulleyJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PulleyJointDef.prototype, b2JointDef.prototype);
b2PulleyJointDef.prototype._super = b2JointDef.prototype;
b2PulleyJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_pulleyJoint;
  this.groundAnchorA.Set(-1, 1);
  this.groundAnchorB.Set(1, 1);
  this.localAnchorA.Set(-1, 0);
  this.localAnchorB.Set(1, 0);
  this.lengthA = 0;
  this.maxLengthA = 0;
  this.lengthB = 0;
  this.maxLengthB = 0;
  this.ratio = 1;
  this.collideConnected = true
};
b2PulleyJointDef.prototype.__varz = function() {
  this.groundAnchorA = new b2Vec2;
  this.groundAnchorB = new b2Vec2;
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2PulleyJointDef.prototype.Initialize = function(bA, bB, gaA, gaB, anchorA, anchorB, r) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.groundAnchorA.SetV(gaA);
  this.groundAnchorB.SetV(gaB);
  this.localAnchorA = this.bodyA.GetLocalPoint(anchorA);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchorB);
  var d1X = anchorA.x - gaA.x;
  var d1Y = anchorA.y - gaA.y;
  this.lengthA = Math.sqrt(d1X * d1X + d1Y * d1Y);
  var d2X = anchorB.x - gaB.x;
  var d2Y = anchorB.y - gaB.y;
  this.lengthB = Math.sqrt(d2X * d2X + d2Y * d2Y);
  this.ratio = r;
  var C = this.lengthA + this.ratio * this.lengthB;
  this.maxLengthA = C - this.ratio * b2PulleyJoint.b2_minPulleyLength;
  this.maxLengthB = (C - b2PulleyJoint.b2_minPulleyLength) / this.ratio
};
b2PulleyJointDef.prototype.groundAnchorA = new b2Vec2;
b2PulleyJointDef.prototype.groundAnchorB = new b2Vec2;
b2PulleyJointDef.prototype.localAnchorA = new b2Vec2;
b2PulleyJointDef.prototype.localAnchorB = new b2Vec2;
b2PulleyJointDef.prototype.lengthA = null;
b2PulleyJointDef.prototype.maxLengthA = null;
b2PulleyJointDef.prototype.lengthB = null;
b2PulleyJointDef.prototype.maxLengthB = null;
b2PulleyJointDef.prototype.ratio = null;var b2DistanceJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2DistanceJointDef.prototype, b2JointDef.prototype);
b2DistanceJointDef.prototype._super = b2JointDef.prototype;
b2DistanceJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_distanceJoint;
  this.length = 1;
  this.frequencyHz = 0;
  this.dampingRatio = 0
};
b2DistanceJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2DistanceJointDef.prototype.Initialize = function(bA, bB, anchorA, anchorB) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchorA));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchorB));
  var dX = anchorB.x - anchorA.x;
  var dY = anchorB.y - anchorA.y;
  this.length = Math.sqrt(dX * dX + dY * dY);
  this.frequencyHz = 0;
  this.dampingRatio = 0
};
b2DistanceJointDef.prototype.localAnchorA = new b2Vec2;
b2DistanceJointDef.prototype.localAnchorB = new b2Vec2;
b2DistanceJointDef.prototype.length = null;
b2DistanceJointDef.prototype.frequencyHz = null;
b2DistanceJointDef.prototype.dampingRatio = null;var b2FrictionJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2FrictionJointDef.prototype, b2JointDef.prototype);
b2FrictionJointDef.prototype._super = b2JointDef.prototype;
b2FrictionJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_frictionJoint;
  this.maxForce = 0;
  this.maxTorque = 0
};
b2FrictionJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2FrictionJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor))
};
b2FrictionJointDef.prototype.localAnchorA = new b2Vec2;
b2FrictionJointDef.prototype.localAnchorB = new b2Vec2;
b2FrictionJointDef.prototype.maxForce = null;
b2FrictionJointDef.prototype.maxTorque = null;var b2WeldJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2WeldJointDef.prototype, b2JointDef.prototype);
b2WeldJointDef.prototype._super = b2JointDef.prototype;
b2WeldJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_weldJoint;
  this.referenceAngle = 0
};
b2WeldJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2WeldJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor));
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2WeldJointDef.prototype.localAnchorA = new b2Vec2;
b2WeldJointDef.prototype.localAnchorB = new b2Vec2;
b2WeldJointDef.prototype.referenceAngle = null;var b2GearJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GearJointDef.prototype, b2JointDef.prototype);
b2GearJointDef.prototype._super = b2JointDef.prototype;
b2GearJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_gearJoint;
  this.joint1 = null;
  this.joint2 = null;
  this.ratio = 1
};
b2GearJointDef.prototype.__varz = function() {
};
b2GearJointDef.prototype.joint1 = null;
b2GearJointDef.prototype.joint2 = null;
b2GearJointDef.prototype.ratio = null;var b2Color = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Color.prototype.__constructor = function(rr, gg, bb) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1));
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1));
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
};
b2Color.prototype.__varz = function() {
};
b2Color.prototype.Set = function(rr, gg, bb) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1));
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1));
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
};
b2Color.prototype.__defineGetter__("r", function() {
  return this._r
});
b2Color.prototype.__defineSetter__("r", function(rr) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1))
});
b2Color.prototype.__defineGetter__("g", function() {
  return this._g
});
b2Color.prototype.__defineSetter__("g", function(gg) {
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1))
});
b2Color.prototype.__defineGetter__("b", function() {
  return this._g
});
b2Color.prototype.__defineSetter__("b", function(bb) {
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
});
b2Color.prototype.__defineGetter__("color", function() {
  return this._r << 16 | this._g << 8 | this._b
});
b2Color.prototype._r = 0;
b2Color.prototype._g = 0;
b2Color.prototype._b = 0;var b2FrictionJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2FrictionJoint.prototype, b2Joint.prototype);
b2FrictionJoint.prototype._super = b2Joint.prototype;
b2FrictionJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchorA.SetV(def.localAnchorA);
  this.m_localAnchorB.SetV(def.localAnchorB);
  this.m_linearMass.SetZero();
  this.m_angularMass = 0;
  this.m_linearImpulse.SetZero();
  this.m_angularImpulse = 0;
  this.m_maxForce = def.maxForce;
  this.m_maxTorque = def.maxTorque
};
b2FrictionJoint.prototype.__varz = function() {
  this.m_localAnchorA = new b2Vec2;
  this.m_localAnchorB = new b2Vec2;
  this.m_linearImpulse = new b2Vec2;
  this.m_linearMass = new b2Mat22
};
b2FrictionJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  var K = new b2Mat22;
  K.col1.x = mA + mB;
  K.col2.x = 0;
  K.col1.y = 0;
  K.col2.y = mA + mB;
  K.col1.x += iA * rAY * rAY;
  K.col2.x += -iA * rAX * rAY;
  K.col1.y += -iA * rAX * rAY;
  K.col2.y += iA * rAX * rAX;
  K.col1.x += iB * rBY * rBY;
  K.col2.x += -iB * rBX * rBY;
  K.col1.y += -iB * rBX * rBY;
  K.col2.y += iB * rBX * rBX;
  K.GetInverse(this.m_linearMass);
  this.m_angularMass = iA + iB;
  if(this.m_angularMass > 0) {
    this.m_angularMass = 1 / this.m_angularMass
  }
  if(step.warmStarting) {
    this.m_linearImpulse.x *= step.dtRatio;
    this.m_linearImpulse.y *= step.dtRatio;
    this.m_angularImpulse *= step.dtRatio;
    var P = this.m_linearImpulse;
    bA.m_linearVelocity.x -= mA * P.x;
    bA.m_linearVelocity.y -= mA * P.y;
    bA.m_angularVelocity -= iA * (rAX * P.y - rAY * P.x + this.m_angularImpulse);
    bB.m_linearVelocity.x += mB * P.x;
    bB.m_linearVelocity.y += mB * P.y;
    bB.m_angularVelocity += iB * (rBX * P.y - rBY * P.x + this.m_angularImpulse)
  }else {
    this.m_linearImpulse.SetZero();
    this.m_angularImpulse = 0
  }
};
b2FrictionJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var vA = bA.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var vB = bB.m_linearVelocity;
  var wB = bB.m_angularVelocity;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var maxImpulse;
  var Cdot = wB - wA;
  var impulse = -this.m_angularMass * Cdot;
  var oldImpulse = this.m_angularImpulse;
  maxImpulse = step.dt * this.m_maxTorque;
  this.m_angularImpulse = b2Math.Clamp(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
  impulse = this.m_angularImpulse - oldImpulse;
  wA -= iA * impulse;
  wB += iB * impulse;
  var CdotX = vB.x - wB * rBY - vA.x + wA * rAY;
  var CdotY = vB.y + wB * rBX - vA.y - wA * rAX;
  var impulseV = b2Math.MulMV(this.m_linearMass, new b2Vec2(-CdotX, -CdotY));
  var oldImpulseV = this.m_linearImpulse.Copy();
  this.m_linearImpulse.Add(impulseV);
  maxImpulse = step.dt * this.m_maxForce;
  if(this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
    this.m_linearImpulse.Normalize();
    this.m_linearImpulse.Multiply(maxImpulse)
  }
  impulseV = b2Math.SubtractVV(this.m_linearImpulse, oldImpulseV);
  vA.x -= mA * impulseV.x;
  vA.y -= mA * impulseV.y;
  wA -= iA * (rAX * impulseV.y - rAY * impulseV.x);
  vB.x += mB * impulseV.x;
  vB.y += mB * impulseV.y;
  wB += iB * (rBX * impulseV.y - rBY * impulseV.x);
  bA.m_angularVelocity = wA;
  bB.m_angularVelocity = wB
};
b2FrictionJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  return true
};
b2FrictionJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
b2FrictionJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
b2FrictionJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_linearImpulse.x, inv_dt * this.m_linearImpulse.y)
};
b2FrictionJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_angularImpulse
};
b2FrictionJoint.prototype.SetMaxForce = function(force) {
  this.m_maxForce = force
};
b2FrictionJoint.prototype.GetMaxForce = function() {
  return this.m_maxForce
};
b2FrictionJoint.prototype.SetMaxTorque = function(torque) {
  this.m_maxTorque = torque
};
b2FrictionJoint.prototype.GetMaxTorque = function() {
  return this.m_maxTorque
};
b2FrictionJoint.prototype.m_localAnchorA = new b2Vec2;
b2FrictionJoint.prototype.m_localAnchorB = new b2Vec2;
b2FrictionJoint.prototype.m_linearImpulse = new b2Vec2;
b2FrictionJoint.prototype.m_angularImpulse = null;
b2FrictionJoint.prototype.m_maxForce = null;
b2FrictionJoint.prototype.m_maxTorque = null;
b2FrictionJoint.prototype.m_linearMass = new b2Mat22;
b2FrictionJoint.prototype.m_angularMass = null;var b2Distance = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Distance.prototype.__constructor = function() {
};
b2Distance.prototype.__varz = function() {
};
b2Distance.Distance = function(output, cache, input) {
  ++b2Distance.b2_gjkCalls;
  var proxyA = input.proxyA;
  var proxyB = input.proxyB;
  var transformA = input.transformA;
  var transformB = input.transformB;
  var simplex = b2Distance.s_simplex;
  simplex.ReadCache(cache, proxyA, transformA, proxyB, transformB);
  var vertices = simplex.m_vertices;
  var k_maxIters = 20;
  var saveA = b2Distance.s_saveA;
  var saveB = b2Distance.s_saveB;
  var saveCount = 0;
  var closestPoint = simplex.GetClosestPoint();
  var distanceSqr1 = closestPoint.LengthSquared();
  var distanceSqr2 = distanceSqr1;
  var i = 0;
  var p;
  var iter = 0;
  while(iter < k_maxIters) {
    saveCount = simplex.m_count;
    for(i = 0;i < saveCount;i++) {
      saveA[i] = vertices[i].indexA;
      saveB[i] = vertices[i].indexB
    }
    switch(simplex.m_count) {
      case 1:
        break;
      case 2:
        simplex.Solve2();
        break;
      case 3:
        simplex.Solve3();
        break;
      default:
        b2Settings.b2Assert(false)
    }
    if(simplex.m_count == 3) {
      break
    }
    p = simplex.GetClosestPoint();
    distanceSqr2 = p.LengthSquared();
    if(distanceSqr2 > distanceSqr1) {
    }
    distanceSqr1 = distanceSqr2;
    var d = simplex.GetSearchDirection();
    if(d.LengthSquared() < Number.MIN_VALUE * Number.MIN_VALUE) {
      break
    }
    var vertex = vertices[simplex.m_count];
    vertex.indexA = proxyA.GetSupport(b2Math.MulTMV(transformA.R, d.GetNegative()));
    vertex.wA = b2Math.MulX(transformA, proxyA.GetVertex(vertex.indexA));
    vertex.indexB = proxyB.GetSupport(b2Math.MulTMV(transformB.R, d));
    vertex.wB = b2Math.MulX(transformB, proxyB.GetVertex(vertex.indexB));
    vertex.w = b2Math.SubtractVV(vertex.wB, vertex.wA);
    ++iter;
    ++b2Distance.b2_gjkIters;
    var duplicate = false;
    for(i = 0;i < saveCount;i++) {
      if(vertex.indexA == saveA[i] && vertex.indexB == saveB[i]) {
        duplicate = true;
        break
      }
    }
    if(duplicate) {
      break
    }
    ++simplex.m_count
  }
  b2Distance.b2_gjkMaxIters = b2Math.Max(b2Distance.b2_gjkMaxIters, iter);
  simplex.GetWitnessPoints(output.pointA, output.pointB);
  output.distance = b2Math.SubtractVV(output.pointA, output.pointB).Length();
  output.iterations = iter;
  simplex.WriteCache(cache);
  if(input.useRadii) {
    var rA = proxyA.m_radius;
    var rB = proxyB.m_radius;
    if(output.distance > rA + rB && output.distance > Number.MIN_VALUE) {
      output.distance -= rA + rB;
      var normal = b2Math.SubtractVV(output.pointB, output.pointA);
      normal.Normalize();
      output.pointA.x += rA * normal.x;
      output.pointA.y += rA * normal.y;
      output.pointB.x -= rB * normal.x;
      output.pointB.y -= rB * normal.y
    }else {
      p = new b2Vec2;
      p.x = 0.5 * (output.pointA.x + output.pointB.x);
      p.y = 0.5 * (output.pointA.y + output.pointB.y);
      output.pointA.x = output.pointB.x = p.x;
      output.pointA.y = output.pointB.y = p.y;
      output.distance = 0
    }
  }
};
b2Distance.b2_gjkCalls = 0;
b2Distance.b2_gjkIters = 0;
b2Distance.b2_gjkMaxIters = 0;
b2Distance.s_simplex = new b2Simplex;
b2Distance.s_saveA = new Array(3);
b2Distance.s_saveB = new Array(3);var b2MouseJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2MouseJoint.prototype, b2Joint.prototype);
b2MouseJoint.prototype._super = b2Joint.prototype;
b2MouseJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_target.SetV(def.target);
  var tX = this.m_target.x - this.m_bodyB.m_xf.position.x;
  var tY = this.m_target.y - this.m_bodyB.m_xf.position.y;
  var tMat = this.m_bodyB.m_xf.R;
  this.m_localAnchor.x = tX * tMat.col1.x + tY * tMat.col1.y;
  this.m_localAnchor.y = tX * tMat.col2.x + tY * tMat.col2.y;
  this.m_maxForce = def.maxForce;
  this.m_impulse.SetZero();
  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;
  this.m_beta = 0;
  this.m_gamma = 0
};
b2MouseJoint.prototype.__varz = function() {
  this.K = new b2Mat22;
  this.K1 = new b2Mat22;
  this.K2 = new b2Mat22;
  this.m_localAnchor = new b2Vec2;
  this.m_target = new b2Vec2;
  this.m_impulse = new b2Vec2;
  this.m_mass = new b2Mat22;
  this.m_C = new b2Vec2
};
b2MouseJoint.prototype.InitVelocityConstraints = function(step) {
  var b = this.m_bodyB;
  var mass = b.GetMass();
  var omega = 2 * Math.PI * this.m_frequencyHz;
  var d = 2 * mass * this.m_dampingRatio * omega;
  var k = mass * omega * omega;
  this.m_gamma = step.dt * (d + step.dt * k);
  this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
  this.m_beta = step.dt * k * this.m_gamma;
  var tMat;
  tMat = b.m_xf.R;
  var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
  var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
  var tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var invMass = b.m_invMass;
  var invI = b.m_invI;
  this.K1.col1.x = invMass;
  this.K1.col2.x = 0;
  this.K1.col1.y = 0;
  this.K1.col2.y = invMass;
  this.K2.col1.x = invI * rY * rY;
  this.K2.col2.x = -invI * rX * rY;
  this.K2.col1.y = -invI * rX * rY;
  this.K2.col2.y = invI * rX * rX;
  this.K.SetM(this.K1);
  this.K.AddM(this.K2);
  this.K.col1.x += this.m_gamma;
  this.K.col2.y += this.m_gamma;
  this.K.GetInverse(this.m_mass);
  this.m_C.x = b.m_sweep.c.x + rX - this.m_target.x;
  this.m_C.y = b.m_sweep.c.y + rY - this.m_target.y;
  b.m_angularVelocity *= 0.98;
  this.m_impulse.x *= step.dtRatio;
  this.m_impulse.y *= step.dtRatio;
  b.m_linearVelocity.x += invMass * this.m_impulse.x;
  b.m_linearVelocity.y += invMass * this.m_impulse.y;
  b.m_angularVelocity += invI * (rX * this.m_impulse.y - rY * this.m_impulse.x)
};
b2MouseJoint.prototype.SolveVelocityConstraints = function(step) {
  var b = this.m_bodyB;
  var tMat;
  var tX;
  var tY;
  tMat = b.m_xf.R;
  var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
  var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
  tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var CdotX = b.m_linearVelocity.x + -b.m_angularVelocity * rY;
  var CdotY = b.m_linearVelocity.y + b.m_angularVelocity * rX;
  tMat = this.m_mass;
  tX = CdotX + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x;
  tY = CdotY + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y;
  var impulseX = -(tMat.col1.x * tX + tMat.col2.x * tY);
  var impulseY = -(tMat.col1.y * tX + tMat.col2.y * tY);
  var oldImpulseX = this.m_impulse.x;
  var oldImpulseY = this.m_impulse.y;
  this.m_impulse.x += impulseX;
  this.m_impulse.y += impulseY;
  var maxImpulse = step.dt * this.m_maxForce;
  if(this.m_impulse.LengthSquared() > maxImpulse * maxImpulse) {
    this.m_impulse.Multiply(maxImpulse / this.m_impulse.Length())
  }
  impulseX = this.m_impulse.x - oldImpulseX;
  impulseY = this.m_impulse.y - oldImpulseY;
  b.m_linearVelocity.x += b.m_invMass * impulseX;
  b.m_linearVelocity.y += b.m_invMass * impulseY;
  b.m_angularVelocity += b.m_invI * (rX * impulseY - rY * impulseX)
};
b2MouseJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  return true
};
b2MouseJoint.prototype.GetAnchorA = function() {
  return this.m_target
};
b2MouseJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor)
};
b2MouseJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2MouseJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2MouseJoint.prototype.GetTarget = function() {
  return this.m_target
};
b2MouseJoint.prototype.SetTarget = function(target) {
  if(this.m_bodyB.IsAwake() == false) {
    this.m_bodyB.SetAwake(true)
  }
  this.m_target = target
};
b2MouseJoint.prototype.GetMaxForce = function() {
  return this.m_maxForce
};
b2MouseJoint.prototype.SetMaxForce = function(maxForce) {
  this.m_maxForce = maxForce
};
b2MouseJoint.prototype.GetFrequency = function() {
  return this.m_frequencyHz
};
b2MouseJoint.prototype.SetFrequency = function(hz) {
  this.m_frequencyHz = hz
};
b2MouseJoint.prototype.GetDampingRatio = function() {
  return this.m_dampingRatio
};
b2MouseJoint.prototype.SetDampingRatio = function(ratio) {
  this.m_dampingRatio = ratio
};
b2MouseJoint.prototype.K = new b2Mat22;
b2MouseJoint.prototype.K1 = new b2Mat22;
b2MouseJoint.prototype.K2 = new b2Mat22;
b2MouseJoint.prototype.m_localAnchor = new b2Vec2;
b2MouseJoint.prototype.m_target = new b2Vec2;
b2MouseJoint.prototype.m_impulse = new b2Vec2;
b2MouseJoint.prototype.m_mass = new b2Mat22;
b2MouseJoint.prototype.m_C = new b2Vec2;
b2MouseJoint.prototype.m_maxForce = null;
b2MouseJoint.prototype.m_frequencyHz = null;
b2MouseJoint.prototype.m_dampingRatio = null;
b2MouseJoint.prototype.m_beta = null;
b2MouseJoint.prototype.m_gamma = null;var b2PrismaticJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PrismaticJointDef.prototype, b2JointDef.prototype);
b2PrismaticJointDef.prototype._super = b2JointDef.prototype;
b2PrismaticJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_prismaticJoint;
  this.localAxisA.Set(1, 0);
  this.referenceAngle = 0;
  this.enableLimit = false;
  this.lowerTranslation = 0;
  this.upperTranslation = 0;
  this.enableMotor = false;
  this.maxMotorForce = 0;
  this.motorSpeed = 0
};
b2PrismaticJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2;
  this.localAxisA = new b2Vec2
};
b2PrismaticJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.localAxisA = this.bodyA.GetLocalVector(axis);
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2PrismaticJointDef.prototype.localAnchorA = new b2Vec2;
b2PrismaticJointDef.prototype.localAnchorB = new b2Vec2;
b2PrismaticJointDef.prototype.localAxisA = new b2Vec2;
b2PrismaticJointDef.prototype.referenceAngle = null;
b2PrismaticJointDef.prototype.enableLimit = null;
b2PrismaticJointDef.prototype.lowerTranslation = null;
b2PrismaticJointDef.prototype.upperTranslation = null;
b2PrismaticJointDef.prototype.enableMotor = null;
b2PrismaticJointDef.prototype.maxMotorForce = null;
b2PrismaticJointDef.prototype.motorSpeed = null;var b2TimeOfImpact = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TimeOfImpact.prototype.__constructor = function() {
};
b2TimeOfImpact.prototype.__varz = function() {
};
b2TimeOfImpact.TimeOfImpact = function(input) {
  ++b2TimeOfImpact.b2_toiCalls;
  var proxyA = input.proxyA;
  var proxyB = input.proxyB;
  var sweepA = input.sweepA;
  var sweepB = input.sweepB;
  b2Settings.b2Assert(sweepA.t0 == sweepB.t0);
  b2Settings.b2Assert(1 - sweepA.t0 > Number.MIN_VALUE);
  var radius = proxyA.m_radius + proxyB.m_radius;
  var tolerance = input.tolerance;
  var alpha = 0;
  var k_maxIterations = 1E3;
  var iter = 0;
  var target = 0;
  b2TimeOfImpact.s_cache.count = 0;
  b2TimeOfImpact.s_distanceInput.useRadii = false;
  for(;;) {
    sweepA.GetTransform(b2TimeOfImpact.s_xfA, alpha);
    sweepB.GetTransform(b2TimeOfImpact.s_xfB, alpha);
    b2TimeOfImpact.s_distanceInput.proxyA = proxyA;
    b2TimeOfImpact.s_distanceInput.proxyB = proxyB;
    b2TimeOfImpact.s_distanceInput.transformA = b2TimeOfImpact.s_xfA;
    b2TimeOfImpact.s_distanceInput.transformB = b2TimeOfImpact.s_xfB;
    b2Distance.Distance(b2TimeOfImpact.s_distanceOutput, b2TimeOfImpact.s_cache, b2TimeOfImpact.s_distanceInput);
    if(b2TimeOfImpact.s_distanceOutput.distance <= 0) {
      alpha = 1;
      break
    }
    b2TimeOfImpact.s_fcn.Initialize(b2TimeOfImpact.s_cache, proxyA, b2TimeOfImpact.s_xfA, proxyB, b2TimeOfImpact.s_xfB);
    var separation = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
    if(separation <= 0) {
      alpha = 1;
      break
    }
    if(iter == 0) {
      if(separation > radius) {
        target = b2Math.Max(radius - tolerance, 0.75 * radius)
      }else {
        target = b2Math.Max(separation - tolerance, 0.02 * radius)
      }
    }
    if(separation - target < 0.5 * tolerance) {
      if(iter == 0) {
        alpha = 1;
        break
      }
      break
    }
    var newAlpha = alpha;
    var x1 = alpha;
    var x2 = 1;
    var f1 = separation;
    sweepA.GetTransform(b2TimeOfImpact.s_xfA, x2);
    sweepB.GetTransform(b2TimeOfImpact.s_xfB, x2);
    var f2 = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
    if(f2 >= target) {
      alpha = 1;
      break
    }
    var rootIterCount = 0;
    for(;;) {
      var x;
      if(rootIterCount & 1) {
        x = x1 + (target - f1) * (x2 - x1) / (f2 - f1)
      }else {
        x = 0.5 * (x1 + x2)
      }
      sweepA.GetTransform(b2TimeOfImpact.s_xfA, x);
      sweepB.GetTransform(b2TimeOfImpact.s_xfB, x);
      var f = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
      if(b2Math.Abs(f - target) < 0.025 * tolerance) {
        newAlpha = x;
        break
      }
      if(f > target) {
        x1 = x;
        f1 = f
      }else {
        x2 = x;
        f2 = f
      }
      ++rootIterCount;
      ++b2TimeOfImpact.b2_toiRootIters;
      if(rootIterCount == 50) {
        break
      }
    }
    b2TimeOfImpact.b2_toiMaxRootIters = b2Math.Max(b2TimeOfImpact.b2_toiMaxRootIters, rootIterCount);
    if(newAlpha < (1 + 100 * Number.MIN_VALUE) * alpha) {
      break
    }
    alpha = newAlpha;
    iter++;
    ++b2TimeOfImpact.b2_toiIters;
    if(iter == k_maxIterations) {
      break
    }
  }
  b2TimeOfImpact.b2_toiMaxIters = b2Math.Max(b2TimeOfImpact.b2_toiMaxIters, iter);
  return alpha
};
b2TimeOfImpact.b2_toiCalls = 0;
b2TimeOfImpact.b2_toiIters = 0;
b2TimeOfImpact.b2_toiMaxIters = 0;
b2TimeOfImpact.b2_toiRootIters = 0;
b2TimeOfImpact.b2_toiMaxRootIters = 0;
b2TimeOfImpact.s_cache = new b2SimplexCache;
b2TimeOfImpact.s_distanceInput = new b2DistanceInput;
b2TimeOfImpact.s_xfA = new b2Transform;
b2TimeOfImpact.s_xfB = new b2Transform;
b2TimeOfImpact.s_fcn = new b2SeparationFunction;
b2TimeOfImpact.s_distanceOutput = new b2DistanceOutput;var b2GearJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GearJoint.prototype, b2Joint.prototype);
b2GearJoint.prototype._super = b2Joint.prototype;
b2GearJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var type1 = def.joint1.m_type;
  var type2 = def.joint2.m_type;
  this.m_revolute1 = null;
  this.m_prismatic1 = null;
  this.m_revolute2 = null;
  this.m_prismatic2 = null;
  var coordinate1;
  var coordinate2;
  this.m_ground1 = def.joint1.GetBodyA();
  this.m_bodyA = def.joint1.GetBodyB();
  if(type1 == b2Joint.e_revoluteJoint) {
    this.m_revolute1 = def.joint1;
    this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1);
    this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2);
    coordinate1 = this.m_revolute1.GetJointAngle()
  }else {
    this.m_prismatic1 = def.joint1;
    this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1);
    this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2);
    coordinate1 = this.m_prismatic1.GetJointTranslation()
  }
  this.m_ground2 = def.joint2.GetBodyA();
  this.m_bodyB = def.joint2.GetBodyB();
  if(type2 == b2Joint.e_revoluteJoint) {
    this.m_revolute2 = def.joint2;
    this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1);
    this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2);
    coordinate2 = this.m_revolute2.GetJointAngle()
  }else {
    this.m_prismatic2 = def.joint2;
    this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1);
    this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2);
    coordinate2 = this.m_prismatic2.GetJointTranslation()
  }
  this.m_ratio = def.ratio;
  this.m_constant = coordinate1 + this.m_ratio * coordinate2;
  this.m_impulse = 0
};
b2GearJoint.prototype.__varz = function() {
  this.m_groundAnchor1 = new b2Vec2;
  this.m_groundAnchor2 = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_J = new b2Jacobian
};
b2GearJoint.prototype.InitVelocityConstraints = function(step) {
  var g1 = this.m_ground1;
  var g2 = this.m_ground2;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var ugX;
  var ugY;
  var rX;
  var rY;
  var tMat;
  var tVec;
  var crug;
  var tX;
  var K = 0;
  this.m_J.SetZero();
  if(this.m_revolute1) {
    this.m_J.angularA = -1;
    K += bA.m_invI
  }else {
    tMat = g1.m_xf.R;
    tVec = this.m_prismatic1.m_localXAxis1;
    ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = bA.m_xf.R;
    rX = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    rY = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    crug = rX * ugY - rY * ugX;
    this.m_J.linearA.Set(-ugX, -ugY);
    this.m_J.angularA = -crug;
    K += bA.m_invMass + bA.m_invI * crug * crug
  }
  if(this.m_revolute2) {
    this.m_J.angularB = -this.m_ratio;
    K += this.m_ratio * this.m_ratio * bB.m_invI
  }else {
    tMat = g2.m_xf.R;
    tVec = this.m_prismatic2.m_localXAxis1;
    ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = bB.m_xf.R;
    rX = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    rY = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    crug = rX * ugY - rY * ugX;
    this.m_J.linearB.Set(-this.m_ratio * ugX, -this.m_ratio * ugY);
    this.m_J.angularB = -this.m_ratio * crug;
    K += this.m_ratio * this.m_ratio * (bB.m_invMass + bB.m_invI * crug * crug)
  }
  this.m_mass = K > 0 ? 1 / K : 0;
  if(step.warmStarting) {
    bA.m_linearVelocity.x += bA.m_invMass * this.m_impulse * this.m_J.linearA.x;
    bA.m_linearVelocity.y += bA.m_invMass * this.m_impulse * this.m_J.linearA.y;
    bA.m_angularVelocity += bA.m_invI * this.m_impulse * this.m_J.angularA;
    bB.m_linearVelocity.x += bB.m_invMass * this.m_impulse * this.m_J.linearB.x;
    bB.m_linearVelocity.y += bB.m_invMass * this.m_impulse * this.m_J.linearB.y;
    bB.m_angularVelocity += bB.m_invI * this.m_impulse * this.m_J.angularB
  }else {
    this.m_impulse = 0
  }
};
b2GearJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var Cdot = this.m_J.Compute(bA.m_linearVelocity, bA.m_angularVelocity, bB.m_linearVelocity, bB.m_angularVelocity);
  var impulse = -this.m_mass * Cdot;
  this.m_impulse += impulse;
  bA.m_linearVelocity.x += bA.m_invMass * impulse * this.m_J.linearA.x;
  bA.m_linearVelocity.y += bA.m_invMass * impulse * this.m_J.linearA.y;
  bA.m_angularVelocity += bA.m_invI * impulse * this.m_J.angularA;
  bB.m_linearVelocity.x += bB.m_invMass * impulse * this.m_J.linearB.x;
  bB.m_linearVelocity.y += bB.m_invMass * impulse * this.m_J.linearB.y;
  bB.m_angularVelocity += bB.m_invI * impulse * this.m_J.angularB
};
b2GearJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var linearError = 0;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var coordinate1;
  var coordinate2;
  if(this.m_revolute1) {
    coordinate1 = this.m_revolute1.GetJointAngle()
  }else {
    coordinate1 = this.m_prismatic1.GetJointTranslation()
  }
  if(this.m_revolute2) {
    coordinate2 = this.m_revolute2.GetJointAngle()
  }else {
    coordinate2 = this.m_prismatic2.GetJointTranslation()
  }
  var C = this.m_constant - (coordinate1 + this.m_ratio * coordinate2);
  var impulse = -this.m_mass * C;
  bA.m_sweep.c.x += bA.m_invMass * impulse * this.m_J.linearA.x;
  bA.m_sweep.c.y += bA.m_invMass * impulse * this.m_J.linearA.y;
  bA.m_sweep.a += bA.m_invI * impulse * this.m_J.angularA;
  bB.m_sweep.c.x += bB.m_invMass * impulse * this.m_J.linearB.x;
  bB.m_sweep.c.y += bB.m_invMass * impulse * this.m_J.linearB.y;
  bB.m_sweep.a += bB.m_invI * impulse * this.m_J.angularB;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError < b2Settings.b2_linearSlop
};
b2GearJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2GearJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2GearJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_J.linearB.x, inv_dt * this.m_impulse * this.m_J.linearB.y)
};
b2GearJoint.prototype.GetReactionTorque = function(inv_dt) {
  var tMat = this.m_bodyB.m_xf.R;
  var rX = this.m_localAnchor1.x - this.m_bodyB.m_sweep.localCenter.x;
  var rY = this.m_localAnchor1.y - this.m_bodyB.m_sweep.localCenter.y;
  var tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var PX = this.m_impulse * this.m_J.linearB.x;
  var PY = this.m_impulse * this.m_J.linearB.y;
  return inv_dt * (this.m_impulse * this.m_J.angularB - rX * PY + rY * PX)
};
b2GearJoint.prototype.GetRatio = function() {
  return this.m_ratio
};
b2GearJoint.prototype.SetRatio = function(ratio) {
  this.m_ratio = ratio
};
b2GearJoint.prototype.m_ground1 = null;
b2GearJoint.prototype.m_ground2 = null;
b2GearJoint.prototype.m_revolute1 = null;
b2GearJoint.prototype.m_prismatic1 = null;
b2GearJoint.prototype.m_revolute2 = null;
b2GearJoint.prototype.m_prismatic2 = null;
b2GearJoint.prototype.m_groundAnchor1 = new b2Vec2;
b2GearJoint.prototype.m_groundAnchor2 = new b2Vec2;
b2GearJoint.prototype.m_localAnchor1 = new b2Vec2;
b2GearJoint.prototype.m_localAnchor2 = new b2Vec2;
b2GearJoint.prototype.m_J = new b2Jacobian;
b2GearJoint.prototype.m_constant = null;
b2GearJoint.prototype.m_ratio = null;
b2GearJoint.prototype.m_mass = null;
b2GearJoint.prototype.m_impulse = null;var b2TOIInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TOIInput.prototype.__constructor = function() {
};
b2TOIInput.prototype.__varz = function() {
  this.proxyA = new b2DistanceProxy;
  this.proxyB = new b2DistanceProxy;
  this.sweepA = new b2Sweep;
  this.sweepB = new b2Sweep
};
b2TOIInput.prototype.proxyA = new b2DistanceProxy;
b2TOIInput.prototype.proxyB = new b2DistanceProxy;
b2TOIInput.prototype.sweepA = new b2Sweep;
b2TOIInput.prototype.sweepB = new b2Sweep;
b2TOIInput.prototype.tolerance = null;var b2RevoluteJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2RevoluteJointDef.prototype, b2JointDef.prototype);
b2RevoluteJointDef.prototype._super = b2JointDef.prototype;
b2RevoluteJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_revoluteJoint;
  this.localAnchorA.Set(0, 0);
  this.localAnchorB.Set(0, 0);
  this.referenceAngle = 0;
  this.lowerAngle = 0;
  this.upperAngle = 0;
  this.maxMotorTorque = 0;
  this.motorSpeed = 0;
  this.enableLimit = false;
  this.enableMotor = false
};
b2RevoluteJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2RevoluteJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2RevoluteJointDef.prototype.localAnchorA = new b2Vec2;
b2RevoluteJointDef.prototype.localAnchorB = new b2Vec2;
b2RevoluteJointDef.prototype.referenceAngle = null;
b2RevoluteJointDef.prototype.enableLimit = null;
b2RevoluteJointDef.prototype.lowerAngle = null;
b2RevoluteJointDef.prototype.upperAngle = null;
b2RevoluteJointDef.prototype.enableMotor = null;
b2RevoluteJointDef.prototype.motorSpeed = null;
b2RevoluteJointDef.prototype.maxMotorTorque = null;var b2MouseJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2MouseJointDef.prototype, b2JointDef.prototype);
b2MouseJointDef.prototype._super = b2JointDef.prototype;
b2MouseJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_mouseJoint;
  this.maxForce = 0;
  this.frequencyHz = 5;
  this.dampingRatio = 0.7
};
b2MouseJointDef.prototype.__varz = function() {
  this.target = new b2Vec2
};
b2MouseJointDef.prototype.target = new b2Vec2;
b2MouseJointDef.prototype.maxForce = null;
b2MouseJointDef.prototype.frequencyHz = null;
b2MouseJointDef.prototype.dampingRatio = null;var b2Contact = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Contact.prototype.__constructor = function() {
};
b2Contact.prototype.__varz = function() {
  this.m_nodeA = new b2ContactEdge;
  this.m_nodeB = new b2ContactEdge;
  this.m_manifold = new b2Manifold;
  this.m_oldManifold = new b2Manifold
};
b2Contact.s_input = new b2TOIInput;
b2Contact.e_sensorFlag = 1;
b2Contact.e_continuousFlag = 2;
b2Contact.e_islandFlag = 4;
b2Contact.e_toiFlag = 8;
b2Contact.e_touchingFlag = 16;
b2Contact.e_enabledFlag = 32;
b2Contact.e_filterFlag = 64;
b2Contact.prototype.Reset = function(fixtureA, fixtureB) {
  this.m_flags = b2Contact.e_enabledFlag;
  if(!fixtureA || !fixtureB) {
    this.m_fixtureA = null;
    this.m_fixtureB = null;
    return
  }
  if(fixtureA.IsSensor() || fixtureB.IsSensor()) {
    this.m_flags |= b2Contact.e_sensorFlag
  }
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(bodyA.GetType() != b2Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
    this.m_flags |= b2Contact.e_continuousFlag
  }
  this.m_fixtureA = fixtureA;
  this.m_fixtureB = fixtureB;
  this.m_manifold.m_pointCount = 0;
  this.m_prev = null;
  this.m_next = null;
  this.m_nodeA.contact = null;
  this.m_nodeA.prev = null;
  this.m_nodeA.next = null;
  this.m_nodeA.other = null;
  this.m_nodeB.contact = null;
  this.m_nodeB.prev = null;
  this.m_nodeB.next = null;
  this.m_nodeB.other = null
};
b2Contact.prototype.Update = function(listener) {
  var tManifold = this.m_oldManifold;
  this.m_oldManifold = this.m_manifold;
  this.m_manifold = tManifold;
  this.m_flags |= b2Contact.e_enabledFlag;
  var touching = false;
  var wasTouching = (this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag;
  var bodyA = this.m_fixtureA.m_body;
  var bodyB = this.m_fixtureB.m_body;
  var aabbOverlap = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);
  if(this.m_flags & b2Contact.e_sensorFlag) {
    if(aabbOverlap) {
      var shapeA = this.m_fixtureA.GetShape();
      var shapeB = this.m_fixtureB.GetShape();
      var xfA = bodyA.GetTransform();
      var xfB = bodyB.GetTransform();
      touching = b2Shape.TestOverlap(shapeA, xfA, shapeB, xfB)
    }
    this.m_manifold.m_pointCount = 0
  }else {
    if(bodyA.GetType() != b2Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
      this.m_flags |= b2Contact.e_continuousFlag
    }else {
      this.m_flags &= ~b2Contact.e_continuousFlag
    }
    if(aabbOverlap) {
      this.Evaluate();
      touching = this.m_manifold.m_pointCount > 0;
      for(var i = 0;i < this.m_manifold.m_pointCount;++i) {
        var mp2 = this.m_manifold.m_points[i];
        mp2.m_normalImpulse = 0;
        mp2.m_tangentImpulse = 0;
        var id2 = mp2.m_id;
        for(var j = 0;j < this.m_oldManifold.m_pointCount;++j) {
          var mp1 = this.m_oldManifold.m_points[j];
          if(mp1.m_id.key == id2.key) {
            mp2.m_normalImpulse = mp1.m_normalImpulse;
            mp2.m_tangentImpulse = mp1.m_tangentImpulse;
            break
          }
        }
      }
    }else {
      this.m_manifold.m_pointCount = 0
    }
    if(touching != wasTouching) {
      bodyA.SetAwake(true);
      bodyB.SetAwake(true)
    }
  }
  if(touching) {
    this.m_flags |= b2Contact.e_touchingFlag
  }else {
    this.m_flags &= ~b2Contact.e_touchingFlag
  }
  if(wasTouching == false && touching == true) {
    listener.BeginContact(this)
  }
  if(wasTouching == true && touching == false) {
    listener.EndContact(this)
  }
  if((this.m_flags & b2Contact.e_sensorFlag) == 0) {
    listener.PreSolve(this, this.m_oldManifold)
  }
};
b2Contact.prototype.Evaluate = function() {
};
b2Contact.prototype.ComputeTOI = function(sweepA, sweepB) {
  b2Contact.s_input.proxyA.Set(this.m_fixtureA.GetShape());
  b2Contact.s_input.proxyB.Set(this.m_fixtureB.GetShape());
  b2Contact.s_input.sweepA = sweepA;
  b2Contact.s_input.sweepB = sweepB;
  b2Contact.s_input.tolerance = b2Settings.b2_linearSlop;
  return b2TimeOfImpact.TimeOfImpact(b2Contact.s_input)
};
b2Contact.prototype.GetManifold = function() {
  return this.m_manifold
};
b2Contact.prototype.GetWorldManifold = function(worldManifold) {
  var bodyA = this.m_fixtureA.GetBody();
  var bodyB = this.m_fixtureB.GetBody();
  var shapeA = this.m_fixtureA.GetShape();
  var shapeB = this.m_fixtureB.GetShape();
  worldManifold.Initialize(this.m_manifold, bodyA.GetTransform(), shapeA.m_radius, bodyB.GetTransform(), shapeB.m_radius)
};
b2Contact.prototype.IsTouching = function() {
  return(this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag
};
b2Contact.prototype.IsContinuous = function() {
  return(this.m_flags & b2Contact.e_continuousFlag) == b2Contact.e_continuousFlag
};
b2Contact.prototype.SetSensor = function(sensor) {
  if(sensor) {
    this.m_flags |= b2Contact.e_sensorFlag
  }else {
    this.m_flags &= ~b2Contact.e_sensorFlag
  }
};
b2Contact.prototype.IsSensor = function() {
  return(this.m_flags & b2Contact.e_sensorFlag) == b2Contact.e_sensorFlag
};
b2Contact.prototype.SetEnabled = function(flag) {
  if(flag) {
    this.m_flags |= b2Contact.e_enabledFlag
  }else {
    this.m_flags &= ~b2Contact.e_enabledFlag
  }
};
b2Contact.prototype.IsEnabled = function() {
  return(this.m_flags & b2Contact.e_enabledFlag) == b2Contact.e_enabledFlag
};
b2Contact.prototype.GetNext = function() {
  return this.m_next
};
b2Contact.prototype.GetFixtureA = function() {
  return this.m_fixtureA
};
b2Contact.prototype.GetFixtureB = function() {
  return this.m_fixtureB
};
b2Contact.prototype.FlagForFiltering = function() {
  this.m_flags |= b2Contact.e_filterFlag
};
b2Contact.prototype.m_flags = 0;
b2Contact.prototype.m_prev = null;
b2Contact.prototype.m_next = null;
b2Contact.prototype.m_nodeA = new b2ContactEdge;
b2Contact.prototype.m_nodeB = new b2ContactEdge;
b2Contact.prototype.m_fixtureA = null;
b2Contact.prototype.m_fixtureB = null;
b2Contact.prototype.m_manifold = new b2Manifold;
b2Contact.prototype.m_oldManifold = new b2Manifold;
b2Contact.prototype.m_toi = null;var b2ContactConstraint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactConstraint.prototype.__constructor = function() {
  this.points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.points[i] = new b2ContactConstraintPoint
  }
};
b2ContactConstraint.prototype.__varz = function() {
  this.localPlaneNormal = new b2Vec2;
  this.localPoint = new b2Vec2;
  this.normal = new b2Vec2;
  this.normalMass = new b2Mat22;
  this.K = new b2Mat22
};
b2ContactConstraint.prototype.points = null;
b2ContactConstraint.prototype.localPlaneNormal = new b2Vec2;
b2ContactConstraint.prototype.localPoint = new b2Vec2;
b2ContactConstraint.prototype.normal = new b2Vec2;
b2ContactConstraint.prototype.normalMass = new b2Mat22;
b2ContactConstraint.prototype.K = new b2Mat22;
b2ContactConstraint.prototype.bodyA = null;
b2ContactConstraint.prototype.bodyB = null;
b2ContactConstraint.prototype.type = 0;
b2ContactConstraint.prototype.radius = null;
b2ContactConstraint.prototype.friction = null;
b2ContactConstraint.prototype.restitution = null;
b2ContactConstraint.prototype.pointCount = 0;
b2ContactConstraint.prototype.manifold = null;var b2ContactResult = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactResult.prototype.__constructor = function() {
};
b2ContactResult.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.normal = new b2Vec2;
  this.id = new b2ContactID
};
b2ContactResult.prototype.shape1 = null;
b2ContactResult.prototype.shape2 = null;
b2ContactResult.prototype.position = new b2Vec2;
b2ContactResult.prototype.normal = new b2Vec2;
b2ContactResult.prototype.normalImpulse = null;
b2ContactResult.prototype.tangentImpulse = null;
b2ContactResult.prototype.id = new b2ContactID;var b2PolygonContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolygonContact.prototype, b2Contact.prototype);
b2PolygonContact.prototype._super = b2Contact.prototype;
b2PolygonContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolygonContact.prototype.__varz = function() {
};
b2PolygonContact.Create = function(allocator) {
  return new b2PolygonContact
};
b2PolygonContact.Destroy = function(contact, allocator) {
};
b2PolygonContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  b2Collision.CollidePolygons(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolygonContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var ClipVertex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
ClipVertex.prototype.__constructor = function() {
};
ClipVertex.prototype.__varz = function() {
  this.v = new b2Vec2;
  this.id = new b2ContactID
};
ClipVertex.prototype.Set = function(other) {
  this.v.SetV(other.v);
  this.id.Set(other.id)
};
ClipVertex.prototype.v = new b2Vec2;
ClipVertex.prototype.id = new b2ContactID;var b2ContactFilter = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactFilter.prototype.__constructor = function() {
};
b2ContactFilter.prototype.__varz = function() {
};
b2ContactFilter.b2_defaultFilter = new b2ContactFilter;
b2ContactFilter.prototype.ShouldCollide = function(fixtureA, fixtureB) {
  var filter1 = fixtureA.GetFilterData();
  var filter2 = fixtureB.GetFilterData();
  if(filter1.groupIndex == filter2.groupIndex && filter1.groupIndex != 0) {
    return filter1.groupIndex > 0
  }
  var collide = (filter1.maskBits & filter2.categoryBits) != 0 && (filter1.categoryBits & filter2.maskBits) != 0;
  return collide
};
b2ContactFilter.prototype.RayCollide = function(userData, fixture) {
  if(!userData) {
    return true
  }
  return this.ShouldCollide(userData, fixture)
};var b2NullContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2NullContact.prototype, b2Contact.prototype);
b2NullContact.prototype._super = b2Contact.prototype;
b2NullContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2NullContact.prototype.__varz = function() {
};
b2NullContact.prototype.Evaluate = function() {
};var b2ContactListener = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactListener.prototype.__constructor = function() {
};
b2ContactListener.prototype.__varz = function() {
};
b2ContactListener.b2_defaultListener = new b2ContactListener;
b2ContactListener.prototype.BeginContact = function(contact) {
};
b2ContactListener.prototype.EndContact = function(contact) {
};
b2ContactListener.prototype.PreSolve = function(contact, oldManifold) {
};
b2ContactListener.prototype.PostSolve = function(contact, impulse) {
};var b2Island = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Island.prototype.__constructor = function() {
  this.m_bodies = new Array;
  this.m_contacts = new Array;
  this.m_joints = new Array
};
b2Island.prototype.__varz = function() {
};
b2Island.s_impulse = new b2ContactImpulse;
b2Island.prototype.Initialize = function(bodyCapacity, contactCapacity, jointCapacity, allocator, listener, contactSolver) {
  var i = 0;
  this.m_bodyCapacity = bodyCapacity;
  this.m_contactCapacity = contactCapacity;
  this.m_jointCapacity = jointCapacity;
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
  this.m_allocator = allocator;
  this.m_listener = listener;
  this.m_contactSolver = contactSolver;
  for(i = this.m_bodies.length;i < bodyCapacity;i++) {
    this.m_bodies[i] = null
  }
  for(i = this.m_contacts.length;i < contactCapacity;i++) {
    this.m_contacts[i] = null
  }
  for(i = this.m_joints.length;i < jointCapacity;i++) {
    this.m_joints[i] = null
  }
};
b2Island.prototype.Clear = function() {
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0
};
b2Island.prototype.Solve = function(step, gravity, allowSleep) {
  var i = 0;
  var j = 0;
  var b;
  var joint;
  for(i = 0;i < this.m_bodyCount;++i) {
    b = this.m_bodies[i];
    if(b.GetType() != b2Body.b2_dynamicBody) {
      continue
    }
    b.m_linearVelocity.x += step.dt * (gravity.x + b.m_invMass * b.m_force.x);
    b.m_linearVelocity.y += step.dt * (gravity.y + b.m_invMass * b.m_force.y);
    b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;
    b.m_linearVelocity.Multiply(b2Math.Clamp(1 - step.dt * b.m_linearDamping, 0, 1));
    b.m_angularVelocity *= b2Math.Clamp(1 - step.dt * b.m_angularDamping, 0, 1)
  }
  this.m_contactSolver.Initialize(step, this.m_contacts, this.m_contactCount, this.m_allocator);
  var contactSolver = this.m_contactSolver;
  contactSolver.InitVelocityConstraints(step);
  for(i = 0;i < this.m_jointCount;++i) {
    joint = this.m_joints[i];
    joint.InitVelocityConstraints(step)
  }
  for(i = 0;i < step.velocityIterations;++i) {
    for(j = 0;j < this.m_jointCount;++j) {
      joint = this.m_joints[j];
      joint.SolveVelocityConstraints(step)
    }
    contactSolver.SolveVelocityConstraints()
  }
  for(i = 0;i < this.m_jointCount;++i) {
    joint = this.m_joints[i];
    joint.FinalizeVelocityConstraints()
  }
  contactSolver.FinalizeVelocityConstraints();
  for(i = 0;i < this.m_bodyCount;++i) {
    b = this.m_bodies[i];
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    var translationX = step.dt * b.m_linearVelocity.x;
    var translationY = step.dt * b.m_linearVelocity.y;
    if(translationX * translationX + translationY * translationY > b2Settings.b2_maxTranslationSquared) {
      b.m_linearVelocity.Normalize();
      b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * step.inv_dt;
      b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * step.inv_dt
    }
    var rotation = step.dt * b.m_angularVelocity;
    if(rotation * rotation > b2Settings.b2_maxRotationSquared) {
      if(b.m_angularVelocity < 0) {
        b.m_angularVelocity = -b2Settings.b2_maxRotation * step.inv_dt
      }else {
        b.m_angularVelocity = b2Settings.b2_maxRotation * step.inv_dt
      }
    }
    b.m_sweep.c0.SetV(b.m_sweep.c);
    b.m_sweep.a0 = b.m_sweep.a;
    b.m_sweep.c.x += step.dt * b.m_linearVelocity.x;
    b.m_sweep.c.y += step.dt * b.m_linearVelocity.y;
    b.m_sweep.a += step.dt * b.m_angularVelocity;
    b.SynchronizeTransform()
  }
  for(i = 0;i < step.positionIterations;++i) {
    var contactsOkay = contactSolver.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
    var jointsOkay = true;
    for(j = 0;j < this.m_jointCount;++j) {
      joint = this.m_joints[j];
      var jointOkay = joint.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
      jointsOkay = jointsOkay && jointOkay
    }
    if(contactsOkay && jointsOkay) {
      break
    }
  }
  this.Report(contactSolver.m_constraints);
  if(allowSleep) {
    var minSleepTime = Number.MAX_VALUE;
    var linTolSqr = b2Settings.b2_linearSleepTolerance * b2Settings.b2_linearSleepTolerance;
    var angTolSqr = b2Settings.b2_angularSleepTolerance * b2Settings.b2_angularSleepTolerance;
    for(i = 0;i < this.m_bodyCount;++i) {
      b = this.m_bodies[i];
      if(b.GetType() == b2Body.b2_staticBody) {
        continue
      }
      if((b.m_flags & b2Body.e_allowSleepFlag) == 0) {
        b.m_sleepTime = 0;
        minSleepTime = 0
      }
      if((b.m_flags & b2Body.e_allowSleepFlag) == 0 || b.m_angularVelocity * b.m_angularVelocity > angTolSqr || b2Math.Dot(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr) {
        b.m_sleepTime = 0;
        minSleepTime = 0
      }else {
        b.m_sleepTime += step.dt;
        minSleepTime = b2Math.Min(minSleepTime, b.m_sleepTime)
      }
    }
    if(minSleepTime >= b2Settings.b2_timeToSleep) {
      for(i = 0;i < this.m_bodyCount;++i) {
        b = this.m_bodies[i];
        b.SetAwake(false)
      }
    }
  }
};
b2Island.prototype.SolveTOI = function(subStep) {
  var i = 0;
  var j = 0;
  this.m_contactSolver.Initialize(subStep, this.m_contacts, this.m_contactCount, this.m_allocator);
  var contactSolver = this.m_contactSolver;
  for(i = 0;i < this.m_jointCount;++i) {
    this.m_joints[i].InitVelocityConstraints(subStep)
  }
  for(i = 0;i < subStep.velocityIterations;++i) {
    contactSolver.SolveVelocityConstraints();
    for(j = 0;j < this.m_jointCount;++j) {
      this.m_joints[j].SolveVelocityConstraints(subStep)
    }
  }
  for(i = 0;i < this.m_bodyCount;++i) {
    var b = this.m_bodies[i];
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    var translationX = subStep.dt * b.m_linearVelocity.x;
    var translationY = subStep.dt * b.m_linearVelocity.y;
    if(translationX * translationX + translationY * translationY > b2Settings.b2_maxTranslationSquared) {
      b.m_linearVelocity.Normalize();
      b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * subStep.inv_dt;
      b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * subStep.inv_dt
    }
    var rotation = subStep.dt * b.m_angularVelocity;
    if(rotation * rotation > b2Settings.b2_maxRotationSquared) {
      if(b.m_angularVelocity < 0) {
        b.m_angularVelocity = -b2Settings.b2_maxRotation * subStep.inv_dt
      }else {
        b.m_angularVelocity = b2Settings.b2_maxRotation * subStep.inv_dt
      }
    }
    b.m_sweep.c0.SetV(b.m_sweep.c);
    b.m_sweep.a0 = b.m_sweep.a;
    b.m_sweep.c.x += subStep.dt * b.m_linearVelocity.x;
    b.m_sweep.c.y += subStep.dt * b.m_linearVelocity.y;
    b.m_sweep.a += subStep.dt * b.m_angularVelocity;
    b.SynchronizeTransform()
  }
  var k_toiBaumgarte = 0.75;
  for(i = 0;i < subStep.positionIterations;++i) {
    var contactsOkay = contactSolver.SolvePositionConstraints(k_toiBaumgarte);
    var jointsOkay = true;
    for(j = 0;j < this.m_jointCount;++j) {
      var jointOkay = this.m_joints[j].SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
      jointsOkay = jointsOkay && jointOkay
    }
    if(contactsOkay && jointsOkay) {
      break
    }
  }
  this.Report(contactSolver.m_constraints)
};
b2Island.prototype.Report = function(constraints) {
  if(this.m_listener == null) {
    return
  }
  for(var i = 0;i < this.m_contactCount;++i) {
    var c = this.m_contacts[i];
    var cc = constraints[i];
    for(var j = 0;j < cc.pointCount;++j) {
      b2Island.s_impulse.normalImpulses[j] = cc.points[j].normalImpulse;
      b2Island.s_impulse.tangentImpulses[j] = cc.points[j].tangentImpulse
    }
    this.m_listener.PostSolve(c, b2Island.s_impulse)
  }
};
b2Island.prototype.AddBody = function(body) {
  body.m_islandIndex = this.m_bodyCount;
  this.m_bodies[this.m_bodyCount++] = body
};
b2Island.prototype.AddContact = function(contact) {
  this.m_contacts[this.m_contactCount++] = contact
};
b2Island.prototype.AddJoint = function(joint) {
  this.m_joints[this.m_jointCount++] = joint
};
b2Island.prototype.m_allocator = null;
b2Island.prototype.m_listener = null;
b2Island.prototype.m_contactSolver = null;
b2Island.prototype.m_bodies = null;
b2Island.prototype.m_contacts = null;
b2Island.prototype.m_joints = null;
b2Island.prototype.m_bodyCount = 0;
b2Island.prototype.m_jointCount = 0;
b2Island.prototype.m_contactCount = 0;
b2Island.prototype.m_bodyCapacity = 0;
b2Island.prototype.m_contactCapacity = 0;
b2Island.prototype.m_jointCapacity = 0;var b2PolyAndEdgeContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolyAndEdgeContact.prototype, b2Contact.prototype);
b2PolyAndEdgeContact.prototype._super = b2Contact.prototype;
b2PolyAndEdgeContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolyAndEdgeContact.prototype.__varz = function() {
};
b2PolyAndEdgeContact.Create = function(allocator) {
  return new b2PolyAndEdgeContact
};
b2PolyAndEdgeContact.Destroy = function(contact, allocator) {
};
b2PolyAndEdgeContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolyAndEdgeContact.prototype.b2CollidePolyAndEdge = function(manifold, polygon, xf1, edge, xf2) {
};
b2PolyAndEdgeContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);
  b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
  b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_edgeShape)
};var b2Collision = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Collision.prototype.__constructor = function() {
};
b2Collision.prototype.__varz = function() {
};
b2Collision.MakeClipPointVector = function() {
  var r = new Array(2);
  r[0] = new ClipVertex;
  r[1] = new ClipVertex;
  return r
};
b2Collision.ClipSegmentToLine = function(vOut, vIn, normal, offset) {
  var cv;
  var numOut = 0;
  cv = vIn[0];
  var vIn0 = cv.v;
  cv = vIn[1];
  var vIn1 = cv.v;
  var distance0 = normal.x * vIn0.x + normal.y * vIn0.y - offset;
  var distance1 = normal.x * vIn1.x + normal.y * vIn1.y - offset;
  if(distance0 <= 0) {
    vOut[numOut++].Set(vIn[0])
  }
  if(distance1 <= 0) {
    vOut[numOut++].Set(vIn[1])
  }
  if(distance0 * distance1 < 0) {
    var interp = distance0 / (distance0 - distance1);
    cv = vOut[numOut];
    var tVec = cv.v;
    tVec.x = vIn0.x + interp * (vIn1.x - vIn0.x);
    tVec.y = vIn0.y + interp * (vIn1.y - vIn0.y);
    cv = vOut[numOut];
    var cv2;
    if(distance0 > 0) {
      cv2 = vIn[0];
      cv.id = cv2.id
    }else {
      cv2 = vIn[1];
      cv.id = cv2.id
    }
    ++numOut
  }
  return numOut
};
b2Collision.EdgeSeparation = function(poly1, xf1, edge1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var vertices1 = poly1.m_vertices;
  var normals1 = poly1.m_normals;
  var count2 = poly2.m_vertexCount;
  var vertices2 = poly2.m_vertices;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = normals1[edge1];
  var normal1WorldX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  var normal1WorldY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  tMat = xf2.R;
  var normal1X = tMat.col1.x * normal1WorldX + tMat.col1.y * normal1WorldY;
  var normal1Y = tMat.col2.x * normal1WorldX + tMat.col2.y * normal1WorldY;
  var index = 0;
  var minDot = Number.MAX_VALUE;
  for(var i = 0;i < count2;++i) {
    tVec = vertices2[i];
    var dot = tVec.x * normal1X + tVec.y * normal1Y;
    if(dot < minDot) {
      minDot = dot;
      index = i
    }
  }
  tVec = vertices1[edge1];
  tMat = xf1.R;
  var v1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var v1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tVec = vertices2[index];
  tMat = xf2.R;
  var v2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var v2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  v2X -= v1X;
  v2Y -= v1Y;
  var separation = v2X * normal1WorldX + v2Y * normal1WorldY;
  return separation
};
b2Collision.FindMaxSeparation = function(edgeIndex, poly1, xf1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var normals1 = poly1.m_normals;
  var tVec;
  var tMat;
  tMat = xf2.R;
  tVec = poly2.m_centroid;
  var dX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var dY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tMat = xf1.R;
  tVec = poly1.m_centroid;
  dX -= xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  dY -= xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var dLocal1X = dX * xf1.R.col1.x + dY * xf1.R.col1.y;
  var dLocal1Y = dX * xf1.R.col2.x + dY * xf1.R.col2.y;
  var edge = 0;
  var maxDot = -Number.MAX_VALUE;
  for(var i = 0;i < count1;++i) {
    tVec = normals1[i];
    var dot = tVec.x * dLocal1X + tVec.y * dLocal1Y;
    if(dot > maxDot) {
      maxDot = dot;
      edge = i
    }
  }
  var s = b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
  var prevEdge = edge - 1 >= 0 ? edge - 1 : count1 - 1;
  var sPrev = b2Collision.EdgeSeparation(poly1, xf1, prevEdge, poly2, xf2);
  var nextEdge = edge + 1 < count1 ? edge + 1 : 0;
  var sNext = b2Collision.EdgeSeparation(poly1, xf1, nextEdge, poly2, xf2);
  var bestEdge = 0;
  var bestSeparation;
  var increment = 0;
  if(sPrev > s && sPrev > sNext) {
    increment = -1;
    bestEdge = prevEdge;
    bestSeparation = sPrev
  }else {
    if(sNext > s) {
      increment = 1;
      bestEdge = nextEdge;
      bestSeparation = sNext
    }else {
      edgeIndex[0] = edge;
      return s
    }
  }
  while(true) {
    if(increment == -1) {
      edge = bestEdge - 1 >= 0 ? bestEdge - 1 : count1 - 1
    }else {
      edge = bestEdge + 1 < count1 ? bestEdge + 1 : 0
    }
    s = b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
    if(s > bestSeparation) {
      bestEdge = edge;
      bestSeparation = s
    }else {
      break
    }
  }
  edgeIndex[0] = bestEdge;
  return bestSeparation
};
b2Collision.FindIncidentEdge = function(c, poly1, xf1, edge1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var normals1 = poly1.m_normals;
  var count2 = poly2.m_vertexCount;
  var vertices2 = poly2.m_vertices;
  var normals2 = poly2.m_normals;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = normals1[edge1];
  var normal1X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  var normal1Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  tMat = xf2.R;
  var tX = tMat.col1.x * normal1X + tMat.col1.y * normal1Y;
  normal1Y = tMat.col2.x * normal1X + tMat.col2.y * normal1Y;
  normal1X = tX;
  var index = 0;
  var minDot = Number.MAX_VALUE;
  for(var i = 0;i < count2;++i) {
    tVec = normals2[i];
    var dot = normal1X * tVec.x + normal1Y * tVec.y;
    if(dot < minDot) {
      minDot = dot;
      index = i
    }
  }
  var tClip;
  var i1 = index;
  var i2 = i1 + 1 < count2 ? i1 + 1 : 0;
  tClip = c[0];
  tVec = vertices2[i1];
  tMat = xf2.R;
  tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tClip.id.features.referenceEdge = edge1;
  tClip.id.features.incidentEdge = i1;
  tClip.id.features.incidentVertex = 0;
  tClip = c[1];
  tVec = vertices2[i2];
  tMat = xf2.R;
  tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tClip.id.features.referenceEdge = edge1;
  tClip.id.features.incidentEdge = i2;
  tClip.id.features.incidentVertex = 1
};
b2Collision.CollidePolygons = function(manifold, polyA, xfA, polyB, xfB) {
  var cv;
  manifold.m_pointCount = 0;
  var totalRadius = polyA.m_radius + polyB.m_radius;
  var edgeA = 0;
  b2Collision.s_edgeAO[0] = edgeA;
  var separationA = b2Collision.FindMaxSeparation(b2Collision.s_edgeAO, polyA, xfA, polyB, xfB);
  edgeA = b2Collision.s_edgeAO[0];
  if(separationA > totalRadius) {
    return
  }
  var edgeB = 0;
  b2Collision.s_edgeBO[0] = edgeB;
  var separationB = b2Collision.FindMaxSeparation(b2Collision.s_edgeBO, polyB, xfB, polyA, xfA);
  edgeB = b2Collision.s_edgeBO[0];
  if(separationB > totalRadius) {
    return
  }
  var poly1;
  var poly2;
  var xf1;
  var xf2;
  var edge1 = 0;
  var flip = 0;
  var k_relativeTol = 0.98;
  var k_absoluteTol = 0.0010;
  var tMat;
  if(separationB > k_relativeTol * separationA + k_absoluteTol) {
    poly1 = polyB;
    poly2 = polyA;
    xf1 = xfB;
    xf2 = xfA;
    edge1 = edgeB;
    manifold.m_type = b2Manifold.e_faceB;
    flip = 1
  }else {
    poly1 = polyA;
    poly2 = polyB;
    xf1 = xfA;
    xf2 = xfB;
    edge1 = edgeA;
    manifold.m_type = b2Manifold.e_faceA;
    flip = 0
  }
  var incidentEdge = b2Collision.s_incidentEdge;
  b2Collision.FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);
  var count1 = poly1.m_vertexCount;
  var vertices1 = poly1.m_vertices;
  var local_v11 = vertices1[edge1];
  var local_v12;
  if(edge1 + 1 < count1) {
    local_v12 = vertices1[parseInt(edge1 + 1)]
  }else {
    local_v12 = vertices1[0]
  }
  var localTangent = b2Collision.s_localTangent;
  localTangent.Set(local_v12.x - local_v11.x, local_v12.y - local_v11.y);
  localTangent.Normalize();
  var localNormal = b2Collision.s_localNormal;
  localNormal.x = localTangent.y;
  localNormal.y = -localTangent.x;
  var planePoint = b2Collision.s_planePoint;
  planePoint.Set(0.5 * (local_v11.x + local_v12.x), 0.5 * (local_v11.y + local_v12.y));
  var tangent = b2Collision.s_tangent;
  tMat = xf1.R;
  tangent.x = tMat.col1.x * localTangent.x + tMat.col2.x * localTangent.y;
  tangent.y = tMat.col1.y * localTangent.x + tMat.col2.y * localTangent.y;
  var tangent2 = b2Collision.s_tangent2;
  tangent2.x = -tangent.x;
  tangent2.y = -tangent.y;
  var normal = b2Collision.s_normal;
  normal.x = tangent.y;
  normal.y = -tangent.x;
  var v11 = b2Collision.s_v11;
  var v12 = b2Collision.s_v12;
  v11.x = xf1.position.x + (tMat.col1.x * local_v11.x + tMat.col2.x * local_v11.y);
  v11.y = xf1.position.y + (tMat.col1.y * local_v11.x + tMat.col2.y * local_v11.y);
  v12.x = xf1.position.x + (tMat.col1.x * local_v12.x + tMat.col2.x * local_v12.y);
  v12.y = xf1.position.y + (tMat.col1.y * local_v12.x + tMat.col2.y * local_v12.y);
  var frontOffset = normal.x * v11.x + normal.y * v11.y;
  var sideOffset1 = -tangent.x * v11.x - tangent.y * v11.y + totalRadius;
  var sideOffset2 = tangent.x * v12.x + tangent.y * v12.y + totalRadius;
  var clipPoints1 = b2Collision.s_clipPoints1;
  var clipPoints2 = b2Collision.s_clipPoints2;
  var np = 0;
  np = b2Collision.ClipSegmentToLine(clipPoints1, incidentEdge, tangent2, sideOffset1);
  if(np < 2) {
    return
  }
  np = b2Collision.ClipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2);
  if(np < 2) {
    return
  }
  manifold.m_localPlaneNormal.SetV(localNormal);
  manifold.m_localPoint.SetV(planePoint);
  var pointCount = 0;
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;++i) {
    cv = clipPoints2[i];
    var separation = normal.x * cv.v.x + normal.y * cv.v.y - frontOffset;
    if(separation <= totalRadius) {
      var cp = manifold.m_points[pointCount];
      tMat = xf2.R;
      var tX = cv.v.x - xf2.position.x;
      var tY = cv.v.y - xf2.position.y;
      cp.m_localPoint.x = tX * tMat.col1.x + tY * tMat.col1.y;
      cp.m_localPoint.y = tX * tMat.col2.x + tY * tMat.col2.y;
      cp.m_id.Set(cv.id);
      cp.m_id.features.flip = flip;
      ++pointCount
    }
  }
  manifold.m_pointCount = pointCount
};
b2Collision.CollideCircles = function(manifold, circle1, xf1, circle2, xf2) {
  manifold.m_pointCount = 0;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = circle1.m_p;
  var p1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var p1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tMat = xf2.R;
  tVec = circle2.m_p;
  var p2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var p2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var distSqr = dX * dX + dY * dY;
  var radius = circle1.m_radius + circle2.m_radius;
  if(distSqr > radius * radius) {
    return
  }
  manifold.m_type = b2Manifold.e_circles;
  manifold.m_localPoint.SetV(circle1.m_p);
  manifold.m_localPlaneNormal.SetZero();
  manifold.m_pointCount = 1;
  manifold.m_points[0].m_localPoint.SetV(circle2.m_p);
  manifold.m_points[0].m_id.key = 0
};
b2Collision.CollidePolygonAndCircle = function(manifold, polygon, xf1, circle, xf2) {
  manifold.m_pointCount = 0;
  var tPoint;
  var dX;
  var dY;
  var positionX;
  var positionY;
  var tVec;
  var tMat;
  tMat = xf2.R;
  tVec = circle.m_p;
  var cX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var cY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  dX = cX - xf1.position.x;
  dY = cY - xf1.position.y;
  tMat = xf1.R;
  var cLocalX = dX * tMat.col1.x + dY * tMat.col1.y;
  var cLocalY = dX * tMat.col2.x + dY * tMat.col2.y;
  var dist;
  var normalIndex = 0;
  var separation = -Number.MAX_VALUE;
  var radius = polygon.m_radius + circle.m_radius;
  var vertexCount = polygon.m_vertexCount;
  var vertices = polygon.m_vertices;
  var normals = polygon.m_normals;
  for(var i = 0;i < vertexCount;++i) {
    tVec = vertices[i];
    dX = cLocalX - tVec.x;
    dY = cLocalY - tVec.y;
    tVec = normals[i];
    var s = tVec.x * dX + tVec.y * dY;
    if(s > radius) {
      return
    }
    if(s > separation) {
      separation = s;
      normalIndex = i
    }
  }
  var vertIndex1 = normalIndex;
  var vertIndex2 = vertIndex1 + 1 < vertexCount ? vertIndex1 + 1 : 0;
  var v1 = vertices[vertIndex1];
  var v2 = vertices[vertIndex2];
  if(separation < Number.MIN_VALUE) {
    manifold.m_pointCount = 1;
    manifold.m_type = b2Manifold.e_faceA;
    manifold.m_localPlaneNormal.SetV(normals[normalIndex]);
    manifold.m_localPoint.x = 0.5 * (v1.x + v2.x);
    manifold.m_localPoint.y = 0.5 * (v1.y + v2.y);
    manifold.m_points[0].m_localPoint.SetV(circle.m_p);
    manifold.m_points[0].m_id.key = 0;
    return
  }
  var u1 = (cLocalX - v1.x) * (v2.x - v1.x) + (cLocalY - v1.y) * (v2.y - v1.y);
  var u2 = (cLocalX - v2.x) * (v1.x - v2.x) + (cLocalY - v2.y) * (v1.y - v2.y);
  if(u1 <= 0) {
    if((cLocalX - v1.x) * (cLocalX - v1.x) + (cLocalY - v1.y) * (cLocalY - v1.y) > radius * radius) {
      return
    }
    manifold.m_pointCount = 1;
    manifold.m_type = b2Manifold.e_faceA;
    manifold.m_localPlaneNormal.x = cLocalX - v1.x;
    manifold.m_localPlaneNormal.y = cLocalY - v1.y;
    manifold.m_localPlaneNormal.Normalize();
    manifold.m_localPoint.SetV(v1);
    manifold.m_points[0].m_localPoint.SetV(circle.m_p);
    manifold.m_points[0].m_id.key = 0
  }else {
    if(u2 <= 0) {
      if((cLocalX - v2.x) * (cLocalX - v2.x) + (cLocalY - v2.y) * (cLocalY - v2.y) > radius * radius) {
        return
      }
      manifold.m_pointCount = 1;
      manifold.m_type = b2Manifold.e_faceA;
      manifold.m_localPlaneNormal.x = cLocalX - v2.x;
      manifold.m_localPlaneNormal.y = cLocalY - v2.y;
      manifold.m_localPlaneNormal.Normalize();
      manifold.m_localPoint.SetV(v2);
      manifold.m_points[0].m_localPoint.SetV(circle.m_p);
      manifold.m_points[0].m_id.key = 0
    }else {
      var faceCenterX = 0.5 * (v1.x + v2.x);
      var faceCenterY = 0.5 * (v1.y + v2.y);
      separation = (cLocalX - faceCenterX) * normals[vertIndex1].x + (cLocalY - faceCenterY) * normals[vertIndex1].y;
      if(separation > radius) {
        return
      }
      manifold.m_pointCount = 1;
      manifold.m_type = b2Manifold.e_faceA;
      manifold.m_localPlaneNormal.x = normals[vertIndex1].x;
      manifold.m_localPlaneNormal.y = normals[vertIndex1].y;
      manifold.m_localPlaneNormal.Normalize();
      manifold.m_localPoint.Set(faceCenterX, faceCenterY);
      manifold.m_points[0].m_localPoint.SetV(circle.m_p);
      manifold.m_points[0].m_id.key = 0
    }
  }
};
b2Collision.TestOverlap = function(a, b) {
  var t1 = b.lowerBound;
  var t2 = a.upperBound;
  var d1X = t1.x - t2.x;
  var d1Y = t1.y - t2.y;
  t1 = a.lowerBound;
  t2 = b.upperBound;
  var d2X = t1.x - t2.x;
  var d2Y = t1.y - t2.y;
  if(d1X > 0 || d1Y > 0) {
    return false
  }
  if(d2X > 0 || d2Y > 0) {
    return false
  }
  return true
};
b2Collision.b2_nullFeature = 255;
b2Collision.s_incidentEdge = b2Collision.MakeClipPointVector();
b2Collision.s_clipPoints1 = b2Collision.MakeClipPointVector();
b2Collision.s_clipPoints2 = b2Collision.MakeClipPointVector();
b2Collision.s_edgeAO = new Array(1);
b2Collision.s_edgeBO = new Array(1);
b2Collision.s_localTangent = new b2Vec2;
b2Collision.s_localNormal = new b2Vec2;
b2Collision.s_planePoint = new b2Vec2;
b2Collision.s_normal = new b2Vec2;
b2Collision.s_tangent = new b2Vec2;
b2Collision.s_tangent2 = new b2Vec2;
b2Collision.s_v11 = new b2Vec2;
b2Collision.s_v12 = new b2Vec2;
b2Collision.b2CollidePolyTempVec = new b2Vec2;var b2PolyAndCircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolyAndCircleContact.prototype, b2Contact.prototype);
b2PolyAndCircleContact.prototype._super = b2Contact.prototype;
b2PolyAndCircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolyAndCircleContact.prototype.__varz = function() {
};
b2PolyAndCircleContact.Create = function(allocator) {
  return new b2PolyAndCircleContact
};
b2PolyAndCircleContact.Destroy = function(contact, allocator) {
};
b2PolyAndCircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.m_body;
  var bB = this.m_fixtureB.m_body;
  b2Collision.CollidePolygonAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolyAndCircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);
  b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
  b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_circleShape)
};var b2ContactPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactPoint.prototype.__constructor = function() {
};
b2ContactPoint.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.velocity = new b2Vec2;
  this.normal = new b2Vec2;
  this.id = new b2ContactID
};
b2ContactPoint.prototype.shape1 = null;
b2ContactPoint.prototype.shape2 = null;
b2ContactPoint.prototype.position = new b2Vec2;
b2ContactPoint.prototype.velocity = new b2Vec2;
b2ContactPoint.prototype.normal = new b2Vec2;
b2ContactPoint.prototype.separation = null;
b2ContactPoint.prototype.friction = null;
b2ContactPoint.prototype.restitution = null;
b2ContactPoint.prototype.id = new b2ContactID;var b2CircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2CircleContact.prototype, b2Contact.prototype);
b2CircleContact.prototype._super = b2Contact.prototype;
b2CircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2CircleContact.prototype.__varz = function() {
};
b2CircleContact.Create = function(allocator) {
  return new b2CircleContact
};
b2CircleContact.Destroy = function(contact, allocator) {
};
b2CircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  b2Collision.CollideCircles(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2CircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var b2EdgeAndCircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2EdgeAndCircleContact.prototype, b2Contact.prototype);
b2EdgeAndCircleContact.prototype._super = b2Contact.prototype;
b2EdgeAndCircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2EdgeAndCircleContact.prototype.__varz = function() {
};
b2EdgeAndCircleContact.Create = function(allocator) {
  return new b2EdgeAndCircleContact
};
b2EdgeAndCircleContact.Destroy = function(contact, allocator) {
};
b2EdgeAndCircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  this.b2CollideEdgeAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2EdgeAndCircleContact.prototype.b2CollideEdgeAndCircle = function(manifold, edge, xf1, circle, xf2) {
};
b2EdgeAndCircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var b2ContactManager = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactManager.prototype.__constructor = function() {
  this.m_world = null;
  this.m_contactCount = 0;
  this.m_contactFilter = b2ContactFilter.b2_defaultFilter;
  this.m_contactListener = b2ContactListener.b2_defaultListener;
  this.m_contactFactory = new b2ContactFactory(this.m_allocator);
  this.m_broadPhase = new b2DynamicTreeBroadPhase
};
b2ContactManager.prototype.__varz = function() {
};
b2ContactManager.s_evalCP = new b2ContactPoint;
b2ContactManager.prototype.AddPair = function(proxyUserDataA, proxyUserDataB) {
  var fixtureA = proxyUserDataA;
  var fixtureB = proxyUserDataB;
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(bodyA == bodyB) {
    return
  }
  var edge = bodyB.GetContactList();
  while(edge) {
    if(edge.other == bodyA) {
      var fA = edge.contact.GetFixtureA();
      var fB = edge.contact.GetFixtureB();
      if(fA == fixtureA && fB == fixtureB) {
        return
      }
      if(fA == fixtureB && fB == fixtureA) {
        return
      }
    }
    edge = edge.next
  }
  if(bodyB.ShouldCollide(bodyA) == false) {
    return
  }
  if(this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
    return
  }
  var c = this.m_contactFactory.Create(fixtureA, fixtureB);
  fixtureA = c.GetFixtureA();
  fixtureB = c.GetFixtureB();
  bodyA = fixtureA.m_body;
  bodyB = fixtureB.m_body;
  c.m_prev = null;
  c.m_next = this.m_world.m_contactList;
  if(this.m_world.m_contactList != null) {
    this.m_world.m_contactList.m_prev = c
  }
  this.m_world.m_contactList = c;
  c.m_nodeA.contact = c;
  c.m_nodeA.other = bodyB;
  c.m_nodeA.prev = null;
  c.m_nodeA.next = bodyA.m_contactList;
  if(bodyA.m_contactList != null) {
    bodyA.m_contactList.prev = c.m_nodeA
  }
  bodyA.m_contactList = c.m_nodeA;
  c.m_nodeB.contact = c;
  c.m_nodeB.other = bodyA;
  c.m_nodeB.prev = null;
  c.m_nodeB.next = bodyB.m_contactList;
  if(bodyB.m_contactList != null) {
    bodyB.m_contactList.prev = c.m_nodeB
  }
  bodyB.m_contactList = c.m_nodeB;
  ++this.m_world.m_contactCount;
  return
};
b2ContactManager.prototype.FindNewContacts = function() {
  var that = this;
  this.m_broadPhase.UpdatePairs(function(a, b) {
    return that.AddPair(a, b)
  })
};
b2ContactManager.prototype.Destroy = function(c) {
  var fixtureA = c.GetFixtureA();
  var fixtureB = c.GetFixtureB();
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(c.IsTouching()) {
    this.m_contactListener.EndContact(c)
  }
  if(c.m_prev) {
    c.m_prev.m_next = c.m_next
  }
  if(c.m_next) {
    c.m_next.m_prev = c.m_prev
  }
  if(c == this.m_world.m_contactList) {
    this.m_world.m_contactList = c.m_next
  }
  if(c.m_nodeA.prev) {
    c.m_nodeA.prev.next = c.m_nodeA.next
  }
  if(c.m_nodeA.next) {
    c.m_nodeA.next.prev = c.m_nodeA.prev
  }
  if(c.m_nodeA == bodyA.m_contactList) {
    bodyA.m_contactList = c.m_nodeA.next
  }
  if(c.m_nodeB.prev) {
    c.m_nodeB.prev.next = c.m_nodeB.next
  }
  if(c.m_nodeB.next) {
    c.m_nodeB.next.prev = c.m_nodeB.prev
  }
  if(c.m_nodeB == bodyB.m_contactList) {
    bodyB.m_contactList = c.m_nodeB.next
  }
  this.m_contactFactory.Destroy(c);
  --this.m_contactCount
};
b2ContactManager.prototype.Collide = function() {
  var c = this.m_world.m_contactList;
  while(c) {
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();
    if(bodyA.IsAwake() == false && bodyB.IsAwake() == false) {
      c = c.GetNext();
      continue
    }
    if(c.m_flags & b2Contact.e_filterFlag) {
      if(bodyB.ShouldCollide(bodyA) == false) {
        var cNuke = c;
        c = cNuke.GetNext();
        this.Destroy(cNuke);
        continue
      }
      if(this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
        cNuke = c;
        c = cNuke.GetNext();
        this.Destroy(cNuke);
        continue
      }
      c.m_flags &= ~b2Contact.e_filterFlag
    }
    var proxyA = fixtureA.m_proxy;
    var proxyB = fixtureB.m_proxy;
    var overlap = this.m_broadPhase.TestOverlap(proxyA, proxyB);
    if(overlap == false) {
      cNuke = c;
      c = cNuke.GetNext();
      this.Destroy(cNuke);
      continue
    }
    c.Update(this.m_contactListener);
    c = c.GetNext()
  }
};
b2ContactManager.prototype.m_world = null;
b2ContactManager.prototype.m_broadPhase = null;
b2ContactManager.prototype.m_contactList = null;
b2ContactManager.prototype.m_contactCount = 0;
b2ContactManager.prototype.m_contactFilter = null;
b2ContactManager.prototype.m_contactListener = null;
b2ContactManager.prototype.m_contactFactory = null;
b2ContactManager.prototype.m_allocator = null;var b2World = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2World.prototype.__constructor = function(gravity, doSleep) {
  this.m_destructionListener = null;
  this.m_debugDraw = null;
  this.m_bodyList = null;
  this.m_contactList = null;
  this.m_jointList = null;
  this.m_controllerList = null;
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
  this.m_controllerCount = 0;
  b2World.m_warmStarting = true;
  b2World.m_continuousPhysics = true;
  this.m_allowSleep = doSleep;
  this.m_gravity = gravity;
  this.m_inv_dt0 = 0;
  this.m_contactManager.m_world = this;
  var bd = new b2BodyDef;
  this.m_groundBody = this.CreateBody(bd)
};
b2World.prototype.__varz = function() {
  this.s_stack = new Array;
  this.m_contactManager = new b2ContactManager;
  this.m_contactSolver = new b2ContactSolver;
  this.m_island = new b2Island
};
b2World.s_timestep2 = new b2TimeStep;
b2World.s_backupA = new b2Sweep;
b2World.s_backupB = new b2Sweep;
b2World.s_timestep = new b2TimeStep;
b2World.s_queue = new Array;
b2World.e_newFixture = 1;
b2World.e_locked = 2;
b2World.s_xf = new b2Transform;
b2World.s_jointColor = new b2Color(0.5, 0.8, 0.8);
b2World.m_warmStarting = null;
b2World.m_continuousPhysics = null;
b2World.prototype.Solve = function(step) {
  var b;
  for(var controller = this.m_controllerList;controller;controller = controller.m_next) {
    controller.Step(step)
  }
  var island = this.m_island;
  island.Initialize(this.m_bodyCount, this.m_contactCount, this.m_jointCount, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
  for(b = this.m_bodyList;b;b = b.m_next) {
    b.m_flags &= ~b2Body.e_islandFlag
  }
  for(var c = this.m_contactList;c;c = c.m_next) {
    c.m_flags &= ~b2Contact.e_islandFlag
  }
  for(var j = this.m_jointList;j;j = j.m_next) {
    j.m_islandFlag = false
  }
  var stackSize = this.m_bodyCount;
  var stack = this.s_stack;
  for(var seed = this.m_bodyList;seed;seed = seed.m_next) {
    if(seed.m_flags & b2Body.e_islandFlag) {
      continue
    }
    if(seed.IsAwake() == false || seed.IsActive() == false) {
      continue
    }
    if(seed.GetType() == b2Body.b2_staticBody) {
      continue
    }
    island.Clear();
    var stackCount = 0;
    stack[stackCount++] = seed;
    seed.m_flags |= b2Body.e_islandFlag;
    while(stackCount > 0) {
      b = stack[--stackCount];
      island.AddBody(b);
      if(b.IsAwake() == false) {
        b.SetAwake(true)
      }
      if(b.GetType() == b2Body.b2_staticBody) {
        continue
      }
      var other;
      for(var ce = b.m_contactList;ce;ce = ce.next) {
        if(ce.contact.m_flags & b2Contact.e_islandFlag) {
          continue
        }
        if(ce.contact.IsSensor() == true || ce.contact.IsEnabled() == false || ce.contact.IsTouching() == false) {
          continue
        }
        island.AddContact(ce.contact);
        ce.contact.m_flags |= b2Contact.e_islandFlag;
        other = ce.other;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        stack[stackCount++] = other;
        other.m_flags |= b2Body.e_islandFlag
      }
      for(var jn = b.m_jointList;jn;jn = jn.next) {
        if(jn.joint.m_islandFlag == true) {
          continue
        }
        other = jn.other;
        if(other.IsActive() == false) {
          continue
        }
        island.AddJoint(jn.joint);
        jn.joint.m_islandFlag = true;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        stack[stackCount++] = other;
        other.m_flags |= b2Body.e_islandFlag
      }
    }
    island.Solve(step, this.m_gravity, this.m_allowSleep);
    for(var i = 0;i < island.m_bodyCount;++i) {
      b = island.m_bodies[i];
      if(b.GetType() == b2Body.b2_staticBody) {
        b.m_flags &= ~b2Body.e_islandFlag
      }
    }
  }
  for(i = 0;i < stack.length;++i) {
    if(!stack[i]) {
      break
    }
    stack[i] = null
  }
  for(b = this.m_bodyList;b;b = b.m_next) {
    if(b.IsAwake() == false || b.IsActive() == false) {
      continue
    }
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    b.SynchronizeFixtures()
  }
  this.m_contactManager.FindNewContacts()
};
b2World.prototype.SolveTOI = function(step) {
  var b;
  var fA;
  var fB;
  var bA;
  var bB;
  var cEdge;
  var j;
  var island = this.m_island;
  island.Initialize(this.m_bodyCount, b2Settings.b2_maxTOIContactsPerIsland, b2Settings.b2_maxTOIJointsPerIsland, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
  var queue = b2World.s_queue;
  for(b = this.m_bodyList;b;b = b.m_next) {
    b.m_flags &= ~b2Body.e_islandFlag;
    b.m_sweep.t0 = 0
  }
  var c;
  for(c = this.m_contactList;c;c = c.m_next) {
    c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag)
  }
  for(j = this.m_jointList;j;j = j.m_next) {
    j.m_islandFlag = false
  }
  for(;;) {
    var minContact = null;
    var minTOI = 1;
    for(c = this.m_contactList;c;c = c.m_next) {
      if(c.IsSensor() == true || c.IsEnabled() == false || c.IsContinuous() == false) {
        continue
      }
      var toi = 1;
      if(c.m_flags & b2Contact.e_toiFlag) {
        toi = c.m_toi
      }else {
        fA = c.m_fixtureA;
        fB = c.m_fixtureB;
        bA = fA.m_body;
        bB = fB.m_body;
        if((bA.GetType() != b2Body.b2_dynamicBody || bA.IsAwake() == false) && (bB.GetType() != b2Body.b2_dynamicBody || bB.IsAwake() == false)) {
          continue
        }
        var t0 = bA.m_sweep.t0;
        if(bA.m_sweep.t0 < bB.m_sweep.t0) {
          t0 = bB.m_sweep.t0;
          bA.m_sweep.Advance(t0)
        }else {
          if(bB.m_sweep.t0 < bA.m_sweep.t0) {
            t0 = bA.m_sweep.t0;
            bB.m_sweep.Advance(t0)
          }
        }
        toi = c.ComputeTOI(bA.m_sweep, bB.m_sweep);
        b2Settings.b2Assert(0 <= toi && toi <= 1);
        if(toi > 0 && toi < 1) {
          toi = (1 - toi) * t0 + toi;
          if(toi > 1) {
            toi = 1
          }
        }
        c.m_toi = toi;
        c.m_flags |= b2Contact.e_toiFlag
      }
      if(Number.MIN_VALUE < toi && toi < minTOI) {
        minContact = c;
        minTOI = toi
      }
    }
    if(minContact == null || 1 - 100 * Number.MIN_VALUE < minTOI) {
      break
    }
    fA = minContact.m_fixtureA;
    fB = minContact.m_fixtureB;
    bA = fA.m_body;
    bB = fB.m_body;
    b2World.s_backupA.Set(bA.m_sweep);
    b2World.s_backupB.Set(bB.m_sweep);
    bA.Advance(minTOI);
    bB.Advance(minTOI);
    minContact.Update(this.m_contactManager.m_contactListener);
    minContact.m_flags &= ~b2Contact.e_toiFlag;
    if(minContact.IsSensor() == true || minContact.IsEnabled() == false) {
      bA.m_sweep.Set(b2World.s_backupA);
      bB.m_sweep.Set(b2World.s_backupB);
      bA.SynchronizeTransform();
      bB.SynchronizeTransform();
      continue
    }
    if(minContact.IsTouching() == false) {
      continue
    }
    var seed = bA;
    if(seed.GetType() != b2Body.b2_dynamicBody) {
      seed = bB
    }
    island.Clear();
    var queueStart = 0;
    var queueSize = 0;
    queue[queueStart + queueSize++] = seed;
    seed.m_flags |= b2Body.e_islandFlag;
    while(queueSize > 0) {
      b = queue[queueStart++];
      --queueSize;
      island.AddBody(b);
      if(b.IsAwake() == false) {
        b.SetAwake(true)
      }
      if(b.GetType() != b2Body.b2_dynamicBody) {
        continue
      }
      for(cEdge = b.m_contactList;cEdge;cEdge = cEdge.next) {
        if(island.m_contactCount == island.m_contactCapacity) {
          break
        }
        if(cEdge.contact.m_flags & b2Contact.e_islandFlag) {
          continue
        }
        if(cEdge.contact.IsSensor() == true || cEdge.contact.IsEnabled() == false || cEdge.contact.IsTouching() == false) {
          continue
        }
        island.AddContact(cEdge.contact);
        cEdge.contact.m_flags |= b2Contact.e_islandFlag;
        var other = cEdge.other;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        if(other.GetType() != b2Body.b2_staticBody) {
          other.Advance(minTOI);
          other.SetAwake(true)
        }
        queue[queueStart + queueSize] = other;
        ++queueSize;
        other.m_flags |= b2Body.e_islandFlag
      }
      for(var jEdge = b.m_jointList;jEdge;jEdge = jEdge.next) {
        if(island.m_jointCount == island.m_jointCapacity) {
          continue
        }
        if(jEdge.joint.m_islandFlag == true) {
          continue
        }
        other = jEdge.other;
        if(other.IsActive() == false) {
          continue
        }
        island.AddJoint(jEdge.joint);
        jEdge.joint.m_islandFlag = true;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        if(other.GetType() != b2Body.b2_staticBody) {
          other.Advance(minTOI);
          other.SetAwake(true)
        }
        queue[queueStart + queueSize] = other;
        ++queueSize;
        other.m_flags |= b2Body.e_islandFlag
      }
    }
    var subStep = b2World.s_timestep;
    subStep.warmStarting = false;
    subStep.dt = (1 - minTOI) * step.dt;
    subStep.inv_dt = 1 / subStep.dt;
    subStep.dtRatio = 0;
    subStep.velocityIterations = step.velocityIterations;
    subStep.positionIterations = step.positionIterations;
    island.SolveTOI(subStep);
    var i = 0;
    for(i = 0;i < island.m_bodyCount;++i) {
      b = island.m_bodies[i];
      b.m_flags &= ~b2Body.e_islandFlag;
      if(b.IsAwake() == false) {
        continue
      }
      if(b.GetType() != b2Body.b2_dynamicBody) {
        continue
      }
      b.SynchronizeFixtures();
      for(cEdge = b.m_contactList;cEdge;cEdge = cEdge.next) {
        cEdge.contact.m_flags &= ~b2Contact.e_toiFlag
      }
    }
    for(i = 0;i < island.m_contactCount;++i) {
      c = island.m_contacts[i];
      c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag)
    }
    for(i = 0;i < island.m_jointCount;++i) {
      j = island.m_joints[i];
      j.m_islandFlag = false
    }
    this.m_contactManager.FindNewContacts()
  }
};
b2World.prototype.DrawJoint = function(joint) {
  var b1 = joint.GetBodyA();
  var b2 = joint.GetBodyB();
  var xf1 = b1.m_xf;
  var xf2 = b2.m_xf;
  var x1 = xf1.position;
  var x2 = xf2.position;
  var p1 = joint.GetAnchorA();
  var p2 = joint.GetAnchorB();
  var color = b2World.s_jointColor;
  switch(joint.m_type) {
    case b2Joint.e_distanceJoint:
      this.m_debugDraw.DrawSegment(p1, p2, color);
      break;
    case b2Joint.e_pulleyJoint:
      var pulley = joint;
      var s1 = pulley.GetGroundAnchorA();
      var s2 = pulley.GetGroundAnchorB();
      this.m_debugDraw.DrawSegment(s1, p1, color);
      this.m_debugDraw.DrawSegment(s2, p2, color);
      this.m_debugDraw.DrawSegment(s1, s2, color);
      break;
    case b2Joint.e_mouseJoint:
      this.m_debugDraw.DrawSegment(p1, p2, color);
      break;
    default:
      if(b1 != this.m_groundBody) {
        this.m_debugDraw.DrawSegment(x1, p1, color)
      }
      this.m_debugDraw.DrawSegment(p1, p2, color);
      if(b2 != this.m_groundBody) {
        this.m_debugDraw.DrawSegment(x2, p2, color)
      }
  }
};
b2World.prototype.DrawShape = function(shape, xf, color) {
  switch(shape.m_type) {
    case b2Shape.e_circleShape:
      var circle = shape;
      var center = b2Math.MulX(xf, circle.m_p);
      var radius = circle.m_radius;
      var axis = xf.R.col1;
      this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
      break;
    case b2Shape.e_polygonShape:
      var i = 0;
      var poly = shape;
      var vertexCount = poly.GetVertexCount();
      var localVertices = poly.GetVertices();
      var vertices = new Array(vertexCount);
      for(i = 0;i < vertexCount;++i) {
        vertices[i] = b2Math.MulX(xf, localVertices[i])
      }
      this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
      break;
    case b2Shape.e_edgeShape:
      var edge = shape;
      this.m_debugDraw.DrawSegment(b2Math.MulX(xf, edge.GetVertex1()), b2Math.MulX(xf, edge.GetVertex2()), color);
      break
  }
};
b2World.prototype.SetDestructionListener = function(listener) {
  this.m_destructionListener = listener
};
b2World.prototype.SetContactFilter = function(filter) {
  this.m_contactManager.m_contactFilter = filter
};
b2World.prototype.SetContactListener = function(listener) {
  this.m_contactManager.m_contactListener = listener
};
b2World.prototype.SetDebugDraw = function(debugDraw) {
  this.m_debugDraw = debugDraw
};
b2World.prototype.SetBroadPhase = function(broadPhase) {
  var oldBroadPhase = this.m_contactManager.m_broadPhase;
  this.m_contactManager.m_broadPhase = broadPhase;
  for(var b = this.m_bodyList;b;b = b.m_next) {
    for(var f = b.m_fixtureList;f;f = f.m_next) {
      f.m_proxy = broadPhase.CreateProxy(oldBroadPhase.GetFatAABB(f.m_proxy), f)
    }
  }
};
b2World.prototype.Validate = function() {
  this.m_contactManager.m_broadPhase.Validate()
};
b2World.prototype.GetProxyCount = function() {
  return this.m_contactManager.m_broadPhase.GetProxyCount()
};
b2World.prototype.CreateBody = function(def) {
  if(this.IsLocked() == true) {
    return null
  }
  var b = new b2Body(def, this);
  b.m_prev = null;
  b.m_next = this.m_bodyList;
  if(this.m_bodyList) {
    this.m_bodyList.m_prev = b
  }
  this.m_bodyList = b;
  ++this.m_bodyCount;
  return b
};
b2World.prototype.DestroyBody = function(b) {
  if(this.IsLocked() == true) {
    return
  }
  var jn = b.m_jointList;
  while(jn) {
    var jn0 = jn;
    jn = jn.next;
    if(this.m_destructionListener) {
      this.m_destructionListener.SayGoodbyeJoint(jn0.joint)
    }
    this.DestroyJoint(jn0.joint)
  }
  var coe = b.m_controllerList;
  while(coe) {
    var coe0 = coe;
    coe = coe.nextController;
    coe0.controller.RemoveBody(b)
  }
  var ce = b.m_contactList;
  while(ce) {
    var ce0 = ce;
    ce = ce.next;
    this.m_contactManager.Destroy(ce0.contact)
  }
  b.m_contactList = null;
  var f = b.m_fixtureList;
  while(f) {
    var f0 = f;
    f = f.m_next;
    if(this.m_destructionListener) {
      this.m_destructionListener.SayGoodbyeFixture(f0)
    }
    f0.DestroyProxy(this.m_contactManager.m_broadPhase);
    f0.Destroy()
  }
  b.m_fixtureList = null;
  b.m_fixtureCount = 0;
  if(b.m_prev) {
    b.m_prev.m_next = b.m_next
  }
  if(b.m_next) {
    b.m_next.m_prev = b.m_prev
  }
  if(b == this.m_bodyList) {
    this.m_bodyList = b.m_next
  }
  --this.m_bodyCount
};
b2World.prototype.CreateJoint = function(def) {
  var j = b2Joint.Create(def, null);
  j.m_prev = null;
  j.m_next = this.m_jointList;
  if(this.m_jointList) {
    this.m_jointList.m_prev = j
  }
  this.m_jointList = j;
  ++this.m_jointCount;
  j.m_edgeA.joint = j;
  j.m_edgeA.other = j.m_bodyB;
  j.m_edgeA.prev = null;
  j.m_edgeA.next = j.m_bodyA.m_jointList;
  if(j.m_bodyA.m_jointList) {
    j.m_bodyA.m_jointList.prev = j.m_edgeA
  }
  j.m_bodyA.m_jointList = j.m_edgeA;
  j.m_edgeB.joint = j;
  j.m_edgeB.other = j.m_bodyA;
  j.m_edgeB.prev = null;
  j.m_edgeB.next = j.m_bodyB.m_jointList;
  if(j.m_bodyB.m_jointList) {
    j.m_bodyB.m_jointList.prev = j.m_edgeB
  }
  j.m_bodyB.m_jointList = j.m_edgeB;
  var bodyA = def.bodyA;
  var bodyB = def.bodyB;
  if(def.collideConnected == false) {
    var edge = bodyB.GetContactList();
    while(edge) {
      if(edge.other == bodyA) {
        edge.contact.FlagForFiltering()
      }
      edge = edge.next
    }
  }
  return j
};
b2World.prototype.DestroyJoint = function(j) {
  var collideConnected = j.m_collideConnected;
  if(j.m_prev) {
    j.m_prev.m_next = j.m_next
  }
  if(j.m_next) {
    j.m_next.m_prev = j.m_prev
  }
  if(j == this.m_jointList) {
    this.m_jointList = j.m_next
  }
  var bodyA = j.m_bodyA;
  var bodyB = j.m_bodyB;
  bodyA.SetAwake(true);
  bodyB.SetAwake(true);
  if(j.m_edgeA.prev) {
    j.m_edgeA.prev.next = j.m_edgeA.next
  }
  if(j.m_edgeA.next) {
    j.m_edgeA.next.prev = j.m_edgeA.prev
  }
  if(j.m_edgeA == bodyA.m_jointList) {
    bodyA.m_jointList = j.m_edgeA.next
  }
  j.m_edgeA.prev = null;
  j.m_edgeA.next = null;
  if(j.m_edgeB.prev) {
    j.m_edgeB.prev.next = j.m_edgeB.next
  }
  if(j.m_edgeB.next) {
    j.m_edgeB.next.prev = j.m_edgeB.prev
  }
  if(j.m_edgeB == bodyB.m_jointList) {
    bodyB.m_jointList = j.m_edgeB.next
  }
  j.m_edgeB.prev = null;
  j.m_edgeB.next = null;
  b2Joint.Destroy(j, null);
  --this.m_jointCount;
  if(collideConnected == false) {
    var edge = bodyB.GetContactList();
    while(edge) {
      if(edge.other == bodyA) {
        edge.contact.FlagForFiltering()
      }
      edge = edge.next
    }
  }
};
b2World.prototype.AddController = function(c) {
  c.m_next = this.m_controllerList;
  c.m_prev = null;
  this.m_controllerList = c;
  c.m_world = this;
  this.m_controllerCount++;
  return c
};
b2World.prototype.RemoveController = function(c) {
  if(c.m_prev) {
    c.m_prev.m_next = c.m_next
  }
  if(c.m_next) {
    c.m_next.m_prev = c.m_prev
  }
  if(this.m_controllerList == c) {
    this.m_controllerList = c.m_next
  }
  this.m_controllerCount--
};
b2World.prototype.CreateController = function(controller) {
  if(controller.m_world != this) {
    throw new Error("Controller can only be a member of one world");
  }
  controller.m_next = this.m_controllerList;
  controller.m_prev = null;
  if(this.m_controllerList) {
    this.m_controllerList.m_prev = controller
  }
  this.m_controllerList = controller;
  ++this.m_controllerCount;
  controller.m_world = this;
  return controller
};
b2World.prototype.DestroyController = function(controller) {
  controller.Clear();
  if(controller.m_next) {
    controller.m_next.m_prev = controller.m_prev
  }
  if(controller.m_prev) {
    controller.m_prev.m_next = controller.m_next
  }
  if(controller == this.m_controllerList) {
    this.m_controllerList = controller.m_next
  }
  --this.m_controllerCount
};
b2World.prototype.SetWarmStarting = function(flag) {
  b2World.m_warmStarting = flag
};
b2World.prototype.SetContinuousPhysics = function(flag) {
  b2World.m_continuousPhysics = flag
};
b2World.prototype.GetBodyCount = function() {
  return this.m_bodyCount
};
b2World.prototype.GetJointCount = function() {
  return this.m_jointCount
};
b2World.prototype.GetContactCount = function() {
  return this.m_contactCount
};
b2World.prototype.SetGravity = function(gravity) {
  this.m_gravity = gravity
};
b2World.prototype.GetGravity = function() {
  return this.m_gravity
};
b2World.prototype.GetGroundBody = function() {
  return this.m_groundBody
};
b2World.prototype.Step = function(dt, velocityIterations, positionIterations) {
  if(this.m_flags & b2World.e_newFixture) {
    this.m_contactManager.FindNewContacts();
    this.m_flags &= ~b2World.e_newFixture
  }
  this.m_flags |= b2World.e_locked;
  var step = b2World.s_timestep2;
  step.dt = dt;
  step.velocityIterations = velocityIterations;
  step.positionIterations = positionIterations;
  if(dt > 0) {
    step.inv_dt = 1 / dt
  }else {
    step.inv_dt = 0
  }
  step.dtRatio = this.m_inv_dt0 * dt;
  step.warmStarting = b2World.m_warmStarting;
  this.m_contactManager.Collide();
  if(step.dt > 0) {
    this.Solve(step)
  }
  if(b2World.m_continuousPhysics && step.dt > 0) {
    this.SolveTOI(step)
  }
  if(step.dt > 0) {
    this.m_inv_dt0 = step.inv_dt
  }
  this.m_flags &= ~b2World.e_locked
};
b2World.prototype.ClearForces = function() {
  for(var body = this.m_bodyList;body;body = body.m_next) {
    body.m_force.SetZero();
    body.m_torque = 0
  }
};
b2World.prototype.DrawDebugData = function() {
  if(this.m_debugDraw == null) {
    return
  }
  this.m_debugDraw.Clear();
  var flags = this.m_debugDraw.GetFlags();
  var i = 0;
  var b;
  var f;
  var s;
  var j;
  var bp;
  var invQ = new b2Vec2;
  var x1 = new b2Vec2;
  var x2 = new b2Vec2;
  var xf;
  var b1 = new b2AABB;
  var b2 = new b2AABB;
  var vs = [new b2Vec2, new b2Vec2, new b2Vec2, new b2Vec2];
  var color = new b2Color(0, 0, 0);
  if(flags & b2DebugDraw.e_shapeBit) {
    for(b = this.m_bodyList;b;b = b.m_next) {
      xf = b.m_xf;
      for(f = b.GetFixtureList();f;f = f.m_next) {
        s = f.GetShape();
        if(b.IsActive() == false) {
          color.Set(0.5, 0.5, 0.3);
          this.DrawShape(s, xf, color)
        }else {
          if(b.GetType() == b2Body.b2_staticBody) {
            color.Set(0.5, 0.9, 0.5);
            this.DrawShape(s, xf, color)
          }else {
            if(b.GetType() == b2Body.b2_kinematicBody) {
              color.Set(0.5, 0.5, 0.9);
              this.DrawShape(s, xf, color)
            }else {
              if(b.IsAwake() == false) {
                color.Set(0.6, 0.6, 0.6);
                this.DrawShape(s, xf, color)
              }else {
                color.Set(0.9, 0.7, 0.7);
                this.DrawShape(s, xf, color)
              }
            }
          }
        }
      }
    }
  }
  if(flags & b2DebugDraw.e_jointBit) {
    for(j = this.m_jointList;j;j = j.m_next) {
      this.DrawJoint(j)
    }
  }
  if(flags & b2DebugDraw.e_controllerBit) {
    for(var c = this.m_controllerList;c;c = c.m_next) {
      c.Draw(this.m_debugDraw)
    }
  }
  if(flags & b2DebugDraw.e_pairBit) {
    color.Set(0.3, 0.9, 0.9);
    for(var contact = this.m_contactManager.m_contactList;contact;contact = contact.GetNext()) {
      var fixtureA = contact.GetFixtureA();
      var fixtureB = contact.GetFixtureB();
      var cA = fixtureA.GetAABB().GetCenter();
      var cB = fixtureB.GetAABB().GetCenter();
      this.m_debugDraw.DrawSegment(cA, cB, color)
    }
  }
  if(flags & b2DebugDraw.e_aabbBit) {
    bp = this.m_contactManager.m_broadPhase;
    vs = [new b2Vec2, new b2Vec2, new b2Vec2, new b2Vec2];
    for(b = this.m_bodyList;b;b = b.GetNext()) {
      if(b.IsActive() == false) {
        continue
      }
      for(f = b.GetFixtureList();f;f = f.GetNext()) {
        var aabb = bp.GetFatAABB(f.m_proxy);
        vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
        vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
        vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
        vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);
        this.m_debugDraw.DrawPolygon(vs, 4, color)
      }
    }
  }
  if(flags & b2DebugDraw.e_centerOfMassBit) {
    for(b = this.m_bodyList;b;b = b.m_next) {
      xf = b2World.s_xf;
      xf.R = b.m_xf.R;
      xf.position = b.GetWorldCenter();
      this.m_debugDraw.DrawTransform(xf)
    }
  }
};
b2World.prototype.QueryAABB = function(callback, aabb) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    return callback(broadPhase.GetUserData(proxy))
  }
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.QueryShape = function(callback, shape, transform) {
  if(transform == null) {
    transform = new b2Transform;
    transform.SetIdentity()
  }
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    var fixture = broadPhase.GetUserData(proxy);
    if(b2Shape.TestOverlap(shape, transform, fixture.GetShape(), fixture.GetBody().GetTransform())) {
      return callback(fixture)
    }
    return true
  }
  var aabb = new b2AABB;
  shape.ComputeAABB(aabb, transform);
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.QueryPoint = function(callback, p) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    var fixture = broadPhase.GetUserData(proxy);
    if(fixture.TestPoint(p)) {
      return callback(fixture)
    }
    return true
  }
  var aabb = new b2AABB;
  aabb.lowerBound.Set(p.x - b2Settings.b2_linearSlop, p.y - b2Settings.b2_linearSlop);
  aabb.upperBound.Set(p.x + b2Settings.b2_linearSlop, p.y + b2Settings.b2_linearSlop);
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.RayCast = function(callback, point1, point2) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  var output = new b2RayCastOutput;
  function RayCastWrapper(input, proxy) {
    var userData = broadPhase.GetUserData(proxy);
    var fixture = userData;
    var hit = fixture.RayCast(output, input);
    if(hit) {
      var fraction = output.fraction;
      var point = new b2Vec2((1 - fraction) * point1.x + fraction * point2.x, (1 - fraction) * point1.y + fraction * point2.y);
      return callback(fixture, point, output.normal, fraction)
    }
    return input.maxFraction
  }
  var input = new b2RayCastInput(point1, point2);
  broadPhase.RayCast(RayCastWrapper, input)
};
b2World.prototype.RayCastOne = function(point1, point2) {
  var result;
  function RayCastOneWrapper(fixture, point, normal, fraction) {
    result = fixture;
    return fraction
  }
  this.RayCast(RayCastOneWrapper, point1, point2);
  return result
};
b2World.prototype.RayCastAll = function(point1, point2) {
  var result = new Array;
  function RayCastAllWrapper(fixture, point, normal, fraction) {
    result[result.length] = fixture;
    return 1
  }
  this.RayCast(RayCastAllWrapper, point1, point2);
  return result
};
b2World.prototype.GetBodyList = function() {
  return this.m_bodyList
};
b2World.prototype.GetJointList = function() {
  return this.m_jointList
};
b2World.prototype.GetContactList = function() {
  return this.m_contactList
};
b2World.prototype.IsLocked = function() {
  return(this.m_flags & b2World.e_locked) > 0
};
b2World.prototype.s_stack = new Array;
b2World.prototype.m_flags = 0;
b2World.prototype.m_contactManager = new b2ContactManager;
b2World.prototype.m_contactSolver = new b2ContactSolver;
b2World.prototype.m_island = new b2Island;
b2World.prototype.m_bodyList = null;
b2World.prototype.m_jointList = null;
b2World.prototype.m_contactList = null;
b2World.prototype.m_bodyCount = 0;
b2World.prototype.m_contactCount = 0;
b2World.prototype.m_jointCount = 0;
b2World.prototype.m_controllerList = null;
b2World.prototype.m_controllerCount = 0;
b2World.prototype.m_gravity = null;
b2World.prototype.m_allowSleep = null;
b2World.prototype.m_groundBody = null;
b2World.prototype.m_destructionListener = null;
b2World.prototype.m_debugDraw = null;
b2World.prototype.m_inv_dt0 = null;if(typeof exports !== "undefined") {
  exports.b2BoundValues = b2BoundValues;
  exports.b2Math = b2Math;
  exports.b2DistanceOutput = b2DistanceOutput;
  exports.b2Mat33 = b2Mat33;
  exports.b2ContactPoint = b2ContactPoint;
  exports.b2PairManager = b2PairManager;
  exports.b2PositionSolverManifold = b2PositionSolverManifold;
  exports.b2OBB = b2OBB;
  exports.b2CircleContact = b2CircleContact;
  exports.b2PulleyJoint = b2PulleyJoint;
  exports.b2Pair = b2Pair;
  exports.b2TimeStep = b2TimeStep;
  exports.b2FixtureDef = b2FixtureDef;
  exports.b2World = b2World;
  exports.b2PrismaticJoint = b2PrismaticJoint;
  exports.b2Controller = b2Controller;
  exports.b2ContactID = b2ContactID;
  exports.b2RevoluteJoint = b2RevoluteJoint;
  exports.b2JointDef = b2JointDef;
  exports.b2Transform = b2Transform;
  exports.b2GravityController = b2GravityController;
  exports.b2EdgeAndCircleContact = b2EdgeAndCircleContact;
  exports.b2EdgeShape = b2EdgeShape;
  exports.b2BuoyancyController = b2BuoyancyController;
  exports.b2LineJointDef = b2LineJointDef;
  exports.b2Contact = b2Contact;
  exports.b2DistanceJoint = b2DistanceJoint;
  exports.b2Body = b2Body;
  exports.b2DestructionListener = b2DestructionListener;
  exports.b2PulleyJointDef = b2PulleyJointDef;
  exports.b2ContactEdge = b2ContactEdge;
  exports.b2ContactConstraint = b2ContactConstraint;
  exports.b2ContactImpulse = b2ContactImpulse;
  exports.b2DistanceJointDef = b2DistanceJointDef;
  exports.b2ContactResult = b2ContactResult;
  exports.b2EdgeChainDef = b2EdgeChainDef;
  exports.b2Vec2 = b2Vec2;
  exports.b2Vec3 = b2Vec3;
  exports.b2DistanceProxy = b2DistanceProxy;
  exports.b2FrictionJointDef = b2FrictionJointDef;
  exports.b2PolygonContact = b2PolygonContact;
  exports.b2TensorDampingController = b2TensorDampingController;
  exports.b2ContactFactory = b2ContactFactory;
  exports.b2WeldJointDef = b2WeldJointDef;
  exports.b2ConstantAccelController = b2ConstantAccelController;
  exports.b2GearJointDef = b2GearJointDef;
  exports.ClipVertex = ClipVertex;
  exports.b2SeparationFunction = b2SeparationFunction;
  exports.b2ManifoldPoint = b2ManifoldPoint;
  exports.b2Color = b2Color;
  exports.b2PolygonShape = b2PolygonShape;
  exports.b2DynamicTreePair = b2DynamicTreePair;
  exports.b2ContactConstraintPoint = b2ContactConstraintPoint;
  exports.b2FrictionJoint = b2FrictionJoint;
  exports.b2ContactFilter = b2ContactFilter;
  exports.b2ControllerEdge = b2ControllerEdge;
  exports.b2Distance = b2Distance;
  exports.b2Fixture = b2Fixture;
  exports.b2DynamicTreeNode = b2DynamicTreeNode;
  exports.b2MouseJoint = b2MouseJoint;
  exports.b2DistanceInput = b2DistanceInput;
  exports.b2BodyDef = b2BodyDef;
  exports.b2DynamicTreeBroadPhase = b2DynamicTreeBroadPhase;
  exports.b2Settings = b2Settings;
  exports.b2Proxy = b2Proxy;
  exports.b2Point = b2Point;
  exports.b2BroadPhase = b2BroadPhase;
  exports.b2Manifold = b2Manifold;
  exports.b2WorldManifold = b2WorldManifold;
  exports.b2PrismaticJointDef = b2PrismaticJointDef;
  exports.b2RayCastOutput = b2RayCastOutput;
  exports.b2ConstantForceController = b2ConstantForceController;
  exports.b2TimeOfImpact = b2TimeOfImpact;
  exports.b2CircleShape = b2CircleShape;
  exports.b2MassData = b2MassData;
  exports.b2Joint = b2Joint;
  exports.b2GearJoint = b2GearJoint;
  exports.b2DynamicTree = b2DynamicTree;
  exports.b2JointEdge = b2JointEdge;
  exports.b2LineJoint = b2LineJoint;
  exports.b2NullContact = b2NullContact;
  exports.b2ContactListener = b2ContactListener;
  exports.b2RayCastInput = b2RayCastInput;
  exports.b2TOIInput = b2TOIInput;
  exports.Features = Features;
  exports.b2FilterData = b2FilterData;
  exports.b2Island = b2Island;
  exports.b2ContactManager = b2ContactManager;
  exports.b2ContactSolver = b2ContactSolver;
  exports.b2Simplex = b2Simplex;
  exports.b2AABB = b2AABB;
  exports.b2Jacobian = b2Jacobian;
  exports.b2Bound = b2Bound;
  exports.b2RevoluteJointDef = b2RevoluteJointDef;
  exports.b2PolyAndEdgeContact = b2PolyAndEdgeContact;
  exports.b2SimplexVertex = b2SimplexVertex;
  exports.b2WeldJoint = b2WeldJoint;
  exports.b2Collision = b2Collision;
  exports.b2Mat22 = b2Mat22;
  exports.b2SimplexCache = b2SimplexCache;
  exports.b2PolyAndCircleContact = b2PolyAndCircleContact;
  exports.b2MouseJointDef = b2MouseJointDef;
  exports.b2Shape = b2Shape;
  exports.b2Segment = b2Segment;
  exports.b2ContactRegister = b2ContactRegister;
  exports.b2DebugDraw = b2DebugDraw;
  exports.b2Sweep = b2Sweep
}
;

}};
__resources__["/__builtin__/libs/cocos2d/ActionManager.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console,
    Timer = require('./Scheduler').Timer,
    Scheduler = require('./Scheduler').Scheduler;

var ActionManager = BObject.extend(/** @lends cocos.ActionManager# */{
    targets: null,
    currentTarget: null,
    currentTargetSalvaged: null,

    /**
     * <p>A singleton that manages all the actions. Normally you
     * won't need to use this singleton directly. 99% of the cases you will use the
     * cocos.nodes.Node interface, which uses this singleton. But there are some cases where
     * you might need to use this singleton. Examples:</p>
     *
     * <ul>
     * <li>When you want to run an action where the target is different from a cocos.nodes.Node</li>
     * <li>When you want to pause / resume the actions</li>
     * </ul>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        ActionManager.superclass.init.call(this);

        Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: 0, paused: false});
        this.targets = [];
    },

    /**
     * Adds an action with a target. If the target is already present, then the
     * action will be added to the existing target. If the target is not
     * present, a new instance of this target will be created either paused or
     * paused, and the action will be added to the newly created target. When
     * the target is paused, the queued actions won't be 'ticked'.
     *
     * @opt {cocos.nodes.Node} target Node to run the action on
     */
    addAction: function (opts) {

        var targetID = opts.target.get('id');
        var element = this.targets[targetID];

        if (!element) {
            element = this.targets[targetID] = {
                paused: false,
                target: opts.target,
                actions: []
            };
        }

        element.actions.push(opts.action);

        opts.action.startWithTarget(opts.target);
    },

    /**
     * Remove an action
     *
     * @param {cocos.actions.Action} action Action to remove
     */
    removeAction: function (action) {
        var targetID = action.originalTarget.get('id'),
            element = this.targets[targetID];

        if (!element) {
            return;
        }

        var actionIndex = element.actions.indexOf(action);

        if (actionIndex == -1) {
            return;
        }

        if (this.currentTarget == element) {
            element.currentActionSalvaged = true;
        } 
        
        element.actions[actionIndex] = null;
        element.actions.splice(actionIndex, 1); // Delete array item

        if (element.actions.length === 0) {
            if (this.currentTarget == element) {
                this.set('currentTargetSalvaged', true);
            }
        }
            
    },

    /**
     * Remove all actions for a cocos.nodes.Node
     *
     * @param {cocos.nodes.Node} target Node to remove all actions for
     */
    removeAllActionsFromTarget: function (target) {
        var targetID = target.get('id');

        var element = this.targets[targetID];
        if (!element) {
            return;
        }

        // Delete everything in array but don't replace it incase something else has a reference
        element.actions.splice(0, element.actions.length - 1);
    },

    /**
     * @private
     */
    update: function (dt) {
        var self = this;
        util.each(this.targets, function (currentTarget, i) {

            if (!currentTarget) {
                return;
            }
            self.currentTarget = currentTarget;

            if (!currentTarget.paused) {
                util.each(currentTarget.actions, function (currentAction, j) {
                    if (!currentAction) {
                        return;
                    }

                    currentTarget.currentAction = currentAction;
                    currentTarget.currentActionSalvaged = false;

                    currentTarget.currentAction.step(dt);

                    if (currentTarget.currentAction.get('isDone')) {
                        currentTarget.currentAction.stop();

                        var a = currentTarget.currentAction;
                        currentTarget.currentAction = null;
                        self.removeAction(a);
                    }

                    currentTarget.currentAction = null;

                });
            }

            if (self.currentTargetSalvaged && currentTarget.actions.length === 0) {
                self.targets[i] = null;
                delete self.targets[i];
            }
        });
    },

    pauseTarget: function (target) {
    },

	resumeTarget: function (target) {
		// TODO
	}
});

util.extend(ActionManager, /** @lends cocos.ActionManager */{
    /**
     * Singleton instance of cocos.ActionManager
     * @getter sharedManager
     * @type cocos.ActionManager
     */
    get_sharedManager: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.ActionManager = ActionManager;

}};
__resources__["/__builtin__/libs/cocos2d/Animation.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var Animation = BObject.extend(/** @lends cocos.Animation# */{
    name: null,
    delay: 0.0,
    frames: null,

    /** 
     * A cocos.Animation object is used to perform animations on the Sprite objects.
     * 
     * The Animation object contains cocos.SpriteFrame objects, and a possible delay between the frames.
     * You can animate a cocos.Animation object by using the cocos.actions.Animate action.
     * 
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {cocos.SpriteFrame[]} frames Frames to animate
     * @opt {Float} [delay=0.0] Delay between each frame
     * 
     * @example
     * var animation = cocos.Animation.create({frames: [f1, f2, f3], delay: 0.1});
     * sprite.runAction(cocos.actions.Animate.create({animation: animation}));
     */
    init: function (opts) {
        Animation.superclass.init.call(this, opts);

        this.frames = opts.frames || [];
        this.delay  = opts.delay  || 0.0;
    }
});

exports.Animation = Animation;

}};
__resources__["/__builtin__/libs/cocos2d/AnimationCache.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Plist = require('Plist').Plist;

var AnimationCache = BObject.extend(/** @lends cocos.AnimationCache# */{
    /**
     * Cached animations
     * @type Object
     */
    animations: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        AnimationCache.superclass.init.call(this);

        this.set('animations', {});
    },

    /**
     * Add an animation to the cache
     *
     * @opt {String} name Unique name of the animation
     * @opt {cocos.Animcation} animation Animation to cache
     */
    addAnimation: function (opts) {
        var name = opts.name,
            animation = opts.animation;

        this.get('animations')[name] = animation;
    },

    /**
     * Remove an animation from the cache
     *
     * @opt {String} name Unique name of the animation
     */
    removeAnimation: function (opts) {
        var name = opts.name;

        delete this.get('animations')[name];
    },

    /**
     * Get an animation from the cache
     *
     * @opt {String} name Unique name of the animation
     * @returns {cocos.Animation} Cached animation
     */
    getAnimation: function (opts) {
        var name = opts.name;

        return this.get('animations')[name];
    }
});

/**
 * Class methods
 */
util.extend(AnimationCache, /** @lends cocos.AnimationCache */{
    /**
     * @getter sharedAnimationCache
     * @type cocos.AnimationCache
     */
    get_sharedAnimationCache: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.AnimationCache = AnimationCache;

}};
__resources__["/__builtin__/libs/cocos2d/Director.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS SHOW_REDRAW_REGIONS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp,
    Scheduler = require('./Scheduler').Scheduler,
    EventDispatcher = require('./EventDispatcher').EventDispatcher,
    Scene = require('./nodes/Scene').Scene;

var Director = BObject.extend(/** @lends cocos.Director# */{
    backgroundColor: 'rgb(0, 0, 0)',
    canvas: null,
    context: null,
    sceneStack: null,
    winSize: null,
    isPaused: false,
    maxFrameRate: 30,
    displayFPS: false,

    // Time delta
    dt: 0,
    nextDeltaTimeZero: false,
    lastUpdate: 0,

    _nextScene: null,

    /**
     * <p>Creates and handles the main view and manages how and when to execute the
     * Scenes.</p>
     *
     * <p>This class is a singleton so don't instantiate it yourself, instead use
     * cocos.Director.get('sharedDirector') to return the instance.</p>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        Director.superclass.init.call(this);

        this.set('sceneStack', []);
    },

    /**
     * Append to a HTML element. It will create a canvas tag
     *
     * @param {HTMLElement} view Any HTML element to add the application to
     */
    attachInView: function (view) {
        if (!view.tagName) {
            throw "Director.attachInView must be given a HTML DOM Node";
        }

        while (view.firstChild) {
            view.removeChild(view.firstChild);
        }

        var canvas = document.createElement('canvas');
        this.set('canvas', canvas);
        canvas.setAttribute('width', view.clientWidth);
        canvas.setAttribute('height', view.clientHeight);

        var context = canvas.getContext('2d');
        this.set('context', context);

        if (FLIP_Y_AXIS) {
            context.translate(0, view.clientHeight);
            context.scale(1, -1);
        }

        view.appendChild(canvas);

        this.set('winSize', {width: view.clientWidth, height: view.clientHeight});


        // Setup event handling

        // Mouse events
        var eventDispatcher = EventDispatcher.get('sharedDispatcher');
        var self = this;
        function mouseDown(evt) {
            evt.locationInWindow = ccp(evt.clientX, evt.clientY);
            evt.locationInCanvas = self.convertEventToCanvas(evt);

            function mouseDragged(evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY);
                evt.locationInCanvas = self.convertEventToCanvas(evt);

                eventDispatcher.mouseDragged(evt);
            }
            function mouseUp(evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY);
                evt.locationInCanvas = self.convertEventToCanvas(evt);

                document.body.removeEventListener('mousemove', mouseDragged, false);
                document.body.removeEventListener('mouseup',   mouseUp,   false);


                eventDispatcher.mouseUp(evt);
            }

            document.body.addEventListener('mousemove', mouseDragged, false);
            document.body.addEventListener('mouseup',   mouseUp,   false);

            eventDispatcher.mouseDown(evt);
        }
        function mouseMoved(evt) {
            evt.locationInWindow = ccp(evt.clientX, evt.clientY);
            evt.locationInCanvas = self.convertEventToCanvas(evt);

            eventDispatcher.mouseMoved(evt);
        }
        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('mousemove', mouseMoved, false);

        // Keyboard events
        function keyDown(evt) {
            this._keysDown = this._keysDown || {};
            eventDispatcher.keyDown(evt);
        }
        function keyUp(evt) {
            eventDispatcher.keyUp(evt);
        }
        /*
        function keyPress(evt) {
            eventDispatcher.keyPress(evt)
        }
        */
        document.documentElement.addEventListener('keydown', keyDown, false);
        document.documentElement.addEventListener('keyup', keyUp, false);
        /*
        document.documentElement.addEventListener('keypress', keyPress, false);
        */
    },

    /**
     * Enters the Director's main loop with the given Scene. Call it to run
     * only your FIRST scene. Don't call it if there is already a running
     * scene.
     *
     * @param {cocos.Scene} scene The scene to start
     */
    runWithScene: function (scene) {
        if (!(scene instanceof Scene)) {
            throw "Director.runWithScene must be given an instance of Scene";
        }

        if (this._runningScene) {
            throw "You can't run an scene if another Scene is running. Use replaceScene or pushScene instead";
        }

        this.pushScene(scene);
        this.startAnimation();
    },

    /**
     * Replaces the running scene with a new one. The running scene is
     * terminated. ONLY call it if there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to replace with
     */
    replaceScene: function (scene) {
        var index = this.sceneStack.length;

        this._sendCleanupToScene = true;
        this.sceneStack.pop();
        this.sceneStack.push(scene);
        this._nextScene = scene;
    },

    /**
     * Pops out a scene from the queue. This scene will replace the running
     * one. The running scene will be deleted. If there are no more scenes in
     * the stack the execution is terminated. ONLY call it if there is a
     * running scene.
     */
    popScene: function () {
    },

    /**
     * Suspends the execution of the running scene, pushing it on the stack of
     * suspended scenes. The new scene will be executed. Try to avoid big
     * stacks of pushed scenes to reduce memory allocation. ONLY call it if
     * there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to add to the stack
     */
    pushScene: function (scene) {
        this._nextScene = scene;
    },

    /**
     * The main loop is triggered again. Call this function only if
     * cocos.Directory#stopAnimation was called earlier.
     */
    startAnimation: function () {
        var animationInterval = 1.0 / this.get('maxFrameRate');
        this._animationTimer = setInterval(util.callback(this, 'drawScene'), animationInterval * 1000);
    },

    /**
     * Stops the animation. Nothing will be drawn. The main loop won't be
     * triggered anymore. If you want to pause your animation call
     * cocos.Directory#pause instead.
     */
    stopAnimation: function () {
    },

    /**
     * Calculate time since last call
     * @private
     */
    calculateDeltaTime: function () {
        var now = (new Date()).getTime() / 1000;

        if (this.nextDeltaTimeZero) {
            this.dt = 0;
            this.nextDeltaTimeZero = false;
        }

        this.dt = Math.max(0, now - this.lastUpdate);

        this.lastUpdate = now;
    },

    /**
     * The main run loop
     * @private
     */
    drawScene: function () {
        this.calculateDeltaTime();

        if (!this.isPaused) {
            Scheduler.get('sharedScheduler').tick(this.dt);
        }


        var context = this.get('context');
        context.fillStyle = this.get('backgroundColor');
        context.fillRect(0, 0, this.winSize.width, this.winSize.height);
        //this.canvas.width = this.canvas.width


        if (this._nextScene) {
            this.setNextScene();
        }

        var rect = new geo.Rect(0, 0, this.winSize.width, this.winSize.height);

        if (rect) {
            context.beginPath();
            context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
            context.clip();
            context.closePath();
        }

        this._runningScene.visit(context, rect);

        if (SHOW_REDRAW_REGIONS) {
            if (rect) {
                context.beginPath();
                context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                context.fillStyle = "rgba(255, 0, 0, 0.5)";
                //context.fill();
                context.closePath();
            }
        }

        if (this.get('displayFPS')) {
            this.showFPS();
        }
    },

    /**
     * Initialises the next scene
     * @private
     */
    setNextScene: function () {
        // TODO transitions

        if (this._runningScene) {
            this._runningScene.onExit();
            if (this._sendCleanupToScene) {
                this._runningScene.cleanup();
            }
        }

        this._runningScene = this._nextScene;

        this._nextScene = null;

        this._runningScene.onEnter();
    },

    convertEventToCanvas: function (evt) {
        var x = this.canvas.offsetLeft - document.documentElement.scrollLeft,
            y = this.canvas.offsetTop - document.documentElement.scrollTop;

        var o = this.canvas;
        while ((o = o.offsetParent)) {
            x += o.offsetLeft - o.scrollLeft;
            y += o.offsetTop - o.scrollTop;
        }

        var p = geo.ccpSub(evt.locationInWindow, ccp(x, y));
        if (FLIP_Y_AXIS) {
            p.y = this.canvas.height - p.y;
        }

        return p;
    },

    showFPS: function () {
        if (!this._fpsLabel) {
            var Label = require('./nodes/Label').Label;
            this._fpsLabel = Label.create({string: '', fontSize: 16});
            this._fpsLabel.set('anchorPoint', ccp(0, 1));
            this._frames = 0;
            this._accumDt = 0;
        }


        this._frames++;
        this._accumDt += this.get('dt');
        
        if (this._accumDt > 1.0 / 3.0)  {
            var frameRate = this._frames / this._accumDt;
            this._frames = 0;
            this._accumDt = 0;

            this._fpsLabel.set('string', 'FPS: ' + (Math.round(frameRate * 100) / 100).toString());
        }
		

        var s = this.get('winSize');
        this._fpsLabel.set('position', ccp(10, s.height - 10));

        this._fpsLabel.visit(this.get('context'));
    }

});

/**
 * Class methods
 */
util.extend(Director, /** @lends cocos.Director */{
    /**
     * A shared singleton instance of cocos.Director
     *
     * @getter sharedDirector
     * @type cocos.Director
     */
    get_sharedDirector: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.Director = Director;

}};
__resources__["/__builtin__/libs/cocos2d/EventDispatcher.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry');

var EventDispatcher = BObject.extend(/** @lends cocos.EventDispatcher# */{
    dispatchEvents: true,
    keyboardDelegates: null,
    mouseDelegates: null,
    _keysDown: null,
    
    /**
     * This singleton is responsible for dispatching Mouse and Keyboard events.
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        EventDispatcher.superclass.init.call(this);

        this.keyboardDelegates = [];
        this.mouseDelegates = [];

        this._keysDown = {};
    },

    addDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority,
            flags    = opts.flags,
            list     = opts.list;

        var listElement = {
            delegate: delegate,
            priority: priority,
            flags: flags
        };

        var added = false;
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            if (priority < elem.priority) {
                // Priority is lower, so insert before elem
                list.splice(i, 0, listElement);
                added = true;
                break;
            }
        }

        // High priority; append to array
        if (!added) {
            list.push(listElement);
        }
    },

    removeDelegate: function (opts) {
        var delegate = opts.delegate,
            list = opts.list;

        var idx = -1,
            i;
        for (i = 0; i < list.length; i++) {
            var l = list[i];
            if (l.delegate == delegate) {
                idx = i;
                break;
            }
        }
        if (idx == -1) {
            return;
        }
        list.splice(idx, 1);
    },
    removeAllDelegates: function (opts) {
        var list = opts.list;

        list.splice(0, list.length - 1);
    },

    addMouseDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority;

        var flags = 0;

        // TODO flags

        this.addDelegate({delegate: delegate, priority: priority, flags: flags, list: this.mouseDelegates});
    },

    removeMouseDelegate: function (opts) {
        var delegate = opts.delegate;

        this.removeDelegate({delegate: delegate, list: this.mouseDelegates});
    },

    removeAllMouseDelegate: function () {
        this.removeAllDelegates({list: this.mouseDelegates});
    },

    addKeyboardDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority;

        var flags = 0;

        // TODO flags

        this.addDelegate({delegate: delegate, priority: priority, flags: flags, list: this.keyboardDelegates});
    },

    removeKeyboardDelegate: function (opts) {
        var delegate = opts.delegate;

        this.removeDelegate({delegate: delegate, list: this.keyboardDelegates});
    },

    removeAllKeyboardDelegate: function () {
        this.removeAllDelegates({list: this.keyboardDelegates});
    },



    // Mouse Events

    mouseDown: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        this._previousMouseMovePosition = geo.ccp(evt.clientX, evt.clientY);
        this._previousMouseDragPosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDown) {
                var swallows = entry.delegate.mouseDown(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseMoved: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        if (this._previousMouseMovePosition) {
            evt.deltaX = evt.clientX - this._previousMouseMovePosition.x;
            evt.deltaY = evt.clientY - this._previousMouseMovePosition.y;
            if (FLIP_Y_AXIS) {
                evt.deltaY *= -1;
            }
        } else {
            evt.deltaX = 0;
            evt.deltaY = 0;
        }
        this._previousMouseMovePosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseMoved) {
                var swallows = entry.delegate.mouseMoved(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseDragged: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        if (this._previousMouseDragPosition) {
            evt.deltaX = evt.clientX - this._previousMouseDragPosition.x;
            evt.deltaY = evt.clientY - this._previousMouseDragPosition.y;
            if (FLIP_Y_AXIS) {
                evt.deltaY *= -1;
            }
        } else {
            evt.deltaX = 0;
            evt.deltaY = 0;
        }
        this._previousMouseDragPosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDragged) {
                var swallows = entry.delegate.mouseDragged(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseUp: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseUp) {
                var swallows = entry.delegate.mouseUp(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },

    // Keyboard events
    keyDown: function (evt) {
        var kc = evt.keyCode;
        if (!this.dispatchEvents || this._keysDown[kc]) {
            return;
        }

        this._keysDown[kc] = true;

        for (var i = 0; i < this.keyboardDelegates.length; i++) {
            var entry = this.keyboardDelegates[i];
            if (entry.delegate.keyDown) {
                var swallows = entry.delegate.keyDown(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },

    keyUp: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        var kc = evt.keyCode;
        if (this._keysDown[kc]) {
            delete this._keysDown[kc];
        }

        for (var i = 0; i < this.keyboardDelegates.length; i++) {
            var entry = this.keyboardDelegates[i];
            if (entry.delegate.keyUp) {
                var swallows = entry.delegate.keyUp(evt);
                if (swallows) {
                    break;
                }
            }
        }
    }

});

/**
 * Class methods
 */
util.extend(EventDispatcher, /** @lends cocos.EventDispatcher */{
    /**
     * A shared singleton instance of cocos.EventDispatcher
     *
     * @getter sharedDispatcher
     * @type cocos.EventDispatcher
     */
    get_sharedDispatcher: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});
exports.EventDispatcher = EventDispatcher;

}};
__resources__["/__builtin__/libs/cocos2d/Scheduler.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

/** @ignore */
function HashUpdateEntry() {
    this.timers = [];
    this.timerIndex = 0;
    this.currentTimer = null;
    this.currentTimerSalvaged = false;
    this.paused = false;
}

/** @ignore */
function HashMethodEntry() {
    this.timers = [];
    this.timerIndex = 0;
    this.currentTimer = null;
    this.currentTimerSalvaged = false;
    this.paused = false;
}

var Timer = BObject.extend(/** @lends cocos.Timer# */{
    callback: null,
    interval: 0,
    elapsed: -1,

    /**
     * Runs a function repeatedly at a fixed interval
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {Function} callback The function to run at each interval
     * @opt {Float} interval Number of milliseconds to wait between each exectuion of callback
     */
    init: function (opts) {
        Timer.superclass.init(this, opts);

        this.set('callback', opts.callback);
        this.set('interval', opts.interval || 0);
        this.set('elapsed', -1);
    },

    /**
     * @private
     */
    update: function (dt) {
        if (this.elapsed == -1) {
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        if (this.elapsed >= this.interval) {
            this.callback(this.elapsed);
            this.elapsed = 0;
        }
    }
});


var Scheduler = BObject.extend(/** @lends cocos.Scheduler# */{
    updates0: null,
    updatesNeg: null,
    updatesPos: null,
    hashForUpdates: null,
    hashForMethods: null,
    timeScale: 1.0,

    /**
     * Runs the timers
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     * @private
     */
    init: function () {
        this.updates0 = [];
        this.updatesNeg = [];
        this.updatesPos = [];
        this.hashForUpdates = {};
        this.hashForMethods = {};
    },

    schedule: function (opts) {
        var target   = opts.target,
            method   = opts.method,
            interval = opts.interval,
            paused   = opts.paused || false;

        var element = this.hashForMethods[target.get('id')];

        if (!element) {
            element = new HashMethodEntry();
            this.hashForMethods[target.get('id')] = element;
            element.target = target;
            element.paused = paused;
        } else if (element.paused != paused) {
            throw "cocos.Scheduler. Trying to schedule a method with a pause value different than the target";
        }

        var timer = Timer.create({callback: util.callback(target, method), interval: interval});
        element.timers.push(timer);
    },

    scheduleUpdate: function (opts) {
        var target   = opts.target,
            priority = opts.priority,
            paused   = opts.paused;

        var i, len;
        var entry = {target: target, priority: priority, paused: paused};
        var added = false;

        if (priority === 0) {
            this.updates0.push(entry);
        } else if (priority < 0) {
            for (i = 0, len = this.updatesNeg.length; i < len; i++) {
                if (priority < this.updatesNeg[i].priority) {
                    this.updatesNeg.splice(i, 0, entry);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.updatesNeg.push(entry);
            }
        } else /* priority > 0 */{
            for (i = 0, len = this.updatesPos.length; i < len; i++) {
                if (priority < this.updatesPos[i].priority) {
                    this.updatesPos.splice(i, 0, entry);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.updatesPos.push(entry);
            }
        }

        this.hashForUpdates[target.get('id')] = entry;
    },

    tick: function (dt) {
        var i, len, x;
        if (this.timeScale != 1.0) {
            dt *= this.timeScale;
        }

        var entry;
        for (i = 0, len = this.updatesNeg.length; i < len; i++) {
            entry = this.updatesNeg[i];
            if (!entry.paused) {
                entry.target.update(dt);
            }
        }

        for (i = 0, len = this.updates0.length; i < len; i++) {
            entry = this.updates0[i];
            if (!entry.paused) {
                entry.target.update(dt);
            }
        }

        for (i = 0, len = this.updatesPos.length; i < len; i++) {
            entry = this.updatesPos[i];
            if (!entry.paused) {
                entry.target.update(dt);
            }
        }

        for (x in this.hashForMethods) {
            if (this.hashForMethods.hasOwnProperty(x)) {
                entry = this.hashForMethods[x];
                for (i = 0, len = entry.timers.length; i < len; i++) {
                    var timer = entry.timers[i];
                    timer.update(dt);
                }
            }
        }

	},

    unscheduleAllSelectorsForTarget: function (target) {
    },

    pauseTarget: function (target) {
        var element = this.hashForMethods[target.get('id')];
        if (element) {
            element.paused = true;
        }

        var elementUpdate = this.hashForUpdates[target.get('id')];
        if (elementUpdate) {
            elementUpdate.paused = true;
        }
    },

	resumeTarget: function (target) {
        var element = this.hashForMethods[target.get('id')];
        if (element) {
            element.paused = false;
        }

        var elementUpdate = this.hashForUpdates[target.get('id')];
        //console.log('foo', target.get('id'), elementUpdate);
        if (elementUpdate) {
            elementUpdate.paused = false;
        }
	}
});

util.extend(Scheduler, /** @lends cocos.Scheduler */{
    /**
     * A shared singleton instance of cocos.Scheduler
     * @getter sharedScheduler 
     * @type cocos.Scheduler
     */
    get_sharedScheduler: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.Timer = Timer;
exports.Scheduler = Scheduler;

}};
__resources__["/__builtin__/libs/cocos2d/SpriteFrame.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp;

var SpriteFrame = BObject.extend(/** @lends cocos.SpriteFrame# */{
    rect: null,
    rotated: false,
    offset: null,
    originalSize: null,
    texture: null,

    /**
     * Represents a single frame of animation for a cocos.Sprite
     *
     * <p>A SpriteFrame has:<br>
     * - texture: A Texture2D that will be used by the Sprite<br>
     * - rectangle: A rectangle of the texture</p>
     *
     * <p>You can modify the frame of a Sprite by doing:</p>
     * 
     * <code>var frame = SpriteFrame.create({texture: texture, rect: rect});
     * sprite.set('displayFrame', frame);</code>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {cocos.Texture2D} texture The texture to draw this frame using
     * @opt {geometry.Rect} rect The rectangle inside the texture to draw
     */
    init: function (opts) {
        SpriteFrame.superclass.init(this, opts);

        this.texture      = opts.texture;
        this.rect         = opts.rect;
        this.rotated      = !!opts.rotate;
        this.offset       = opts.offset || ccp(0, 0);
        this.originalSize = opts.originalSize || util.copy(this.rect.size);
    },

    /**
     * @ignore
     */
    toString: function () {
        return "[object SpriteFrame | TextureName=" + this.texture.get('name') + ", Rect = (" + this.rect.origin.x + ", " + this.rect.origin.y + ", " + this.rect.size.width + ", " + this.rect.size.height + ")]";
    },

    /**
     * Make a copy of this frame
     *
     * @returns {cocos.SpriteFrame} Exact copy of this object
     */
    copy: function () {
        return SpriteFrame.create({rect: this.rect, rotated: this.rotated, offset: this.offset, originalSize: this.originalSize, texture: this.texture});
    }

});

exports.SpriteFrame = SpriteFrame;

}};
__resources__["/__builtin__/libs/cocos2d/SpriteFrameCache.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    Plist = require('Plist').Plist,
    SpriteFrame = require('./SpriteFrame').SpriteFrame,
    Texture2D = require('./Texture2D').Texture2D;

var SpriteFrameCache = BObject.extend(/** @lends cocos.SpriteFrameCache# */{
    /**
     * List of sprite frames
     * @type Object
     */
    spriteFrames: null,

    /**
     * List of sprite frame aliases
     * @type Object
     */
    spriteFrameAliases: null,


    /**
     * @memberOf cocos
     * @extends BObject
     * @constructs
     * @singleton
     */
    init: function () {
        SpriteFrameCache.superclass.init.call(this);

        this.set('spriteFrames', {});
        this.set('spriteFrameAliases', {});
    },

    /**
     * Add SpriteFrame(s) to the cache
     *
     * @param {String} opts.file The filename of a Zwoptex .plist containing the frame definiitons.
     */
    addSpriteFrames: function (opts) {
        var plistPath = opts.file,
            plist = Plist.create({file: plistPath}),
            plistData = plist.get('data');


        var metaDataDict = plistData.metadata,
            framesDict = plistData.frames;

        var format = 0,
            texturePath = null;

        if (metaDataDict) {
            format = metaDataDict.format;
            // Get texture path from meta data
            texturePath = metaDataDict.textureFileName;
        }

        if (!texturePath) {
            // No texture path so assuming it's the same name as the .plist but ending in .png
            texturePath = plistPath.replace(/\.plist$/i, '.png');
        }


        var texture = Texture2D.create({file: texturePath});

        // Add frames
        for (var frameDictKey in framesDict) {
            if (framesDict.hasOwnProperty(frameDictKey)) {
                var frameDict = framesDict[frameDictKey],
                    spriteFrame = null;

                switch (format) {
                case 0:
                    var x = frameDict.x,
                        y =  frameDict.y,
                        w =  frameDict.width,
                        h =  frameDict.height,
                        ox = frameDict.offsetX,
                        oy = frameDict.offsetY,
                        ow = frameDict.originalWidth,
                        oh = frameDict.originalHeight;

                    // check ow/oh
                    if (!ow || !oh) {
                        //console.log("cocos2d: WARNING: originalWidth/Height not found on the CCSpriteFrame. AnchorPoint won't work as expected. Regenerate the .plist");
                    }

                    if (FLIP_Y_AXIS) {
                        oy *= -1;
                    }

                    // abs ow/oh
                    ow = Math.abs(ow);
                    oh = Math.abs(oh);

                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: geo.rectMake(x, y, w, h),
                                                       rotate: false,
                                                       offset: geo.ccp(ox, oy),
                                                 originalSize: geo.sizeMake(ow, oh)});
                    break;

                case 1:
                case 2:
                    var frame      = geo.rectFromString(frameDict.frame),
                        rotated    = !!frameDict.rotated,
                        offset     = geo.pointFromString(frameDict.offset),
                        sourceSize = geo.sizeFromString(frameDict.sourceSize);

                    if (FLIP_Y_AXIS) {
                        offset.y *= -1;
                    }


                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: frame,
                                                       rotate: rotated,
                                                       offset: offset,
                                                 originalSize: sourceSize});
                    break;

                case 3:
                    var spriteSize       = geo.sizeFromString(frameDict.spriteSize),
                        spriteOffset     = geo.pointFromString(frameDict.spriteOffset),
                        spriteSourceSize = geo.sizeFromString(frameDict.spriteSourceSize),
                        textureRect      = geo.rectFromString(frameDict.textureRect),
                        textureRotated   = frameDict.textureRotated;
                    

                    if (FLIP_Y_AXIS) {
                        spriteOffset.y *= -1;
                    }

                    // get aliases
                    var aliases = frameDict.aliases;
                    for (var i = 0, len = aliases.length; i < len; i++) {
                        var alias = aliases[i];
                        this.get('spriteFrameAliases')[frameDictKey] = alias;
                    }
                    
                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: geo.rectMake(textureRect.origin.x, textureRect.origin.y, spriteSize.width, spriteSize.height),
                                                       rotate: textureRotated,
                                                       offset: spriteOffset,
                                                 originalSize: spriteSourceSize});
                    break;

                default:
                    throw "Unsupported Zwoptex format: " + format;
                }

                // Add sprite frame
                this.get('spriteFrames')[frameDictKey] = spriteFrame;
            }
        }
    },

    /**
     * Get a single SpriteFrame
     *
     * @param {String} opts.name The name of the sprite frame
     * @returns {cocos.SpriteFrame} The sprite frame
     */
    getSpriteFrame: function (opts) {
        var name = opts.name;

        var frame = this.get('spriteFrames')[name];

        if (!frame) {
            // No frame, look for an alias
            var key = this.get('spriteFrameAliases')[name];

            if (key) {
                frame = this.get('spriteFrames')[key];
            }

            if (!frame) {
                throw "Unable to find frame: " + name;
            }
        }

        return frame;
    }
});

/**
 * Class methods
 */
util.extend(SpriteFrameCache, /** @lends cocos.SpriteFrameCache */{
    /**
     * @field
     * @name cocos.SpriteFrameCache.sharedSpriteFrameCache
     * @type cocos.SpriteFrameCache
     */
    get_sharedSpriteFrameCache: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.SpriteFrameCache = SpriteFrameCache;

}};
__resources__["/__builtin__/libs/cocos2d/TMXOrientation.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

/**
 * @memberOf cocos
 * @namespace
 */
var TMXOrientation = /** @lends cocos.TMXOrientation */{
    /**
     * Orthogonal orientation
     * @constant
     */
	TMXOrientationOrtho: 1,

    /**
     * Hexagonal orientation
     * @constant
     */
	TMXOrientationHex: 2,

    /**
     * Isometric orientation
     * @constant
     */
	TMXOrientationIso: 3
};

module.exports = TMXOrientation;

}};
__resources__["/__builtin__/libs/cocos2d/TMXXMLParser.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray DOMParser*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path'),
    ccp = require('geometry').ccp,
    base64 = require('base64'),
    gzip   = require('gzip'),
    TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex = require('./TMXOrientation').TMXOrientationHex,
    TMXOrientationIso = require('./TMXOrientation').TMXOrientationIso;

var TMXTilesetInfo = BObject.extend(/** @lends cocos.TMXTilesetInfo# */{
    name: '',
    firstGID: 0,
    tileSize: null,
    spacing: 0,
    margin: 0,
    sourceImage: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXTilesetInfo.superclass.init.call(this);
    },

    rectForGID: function (gid) {
        var rect = {size: {}, origin: ccp(0, 0)};
        rect.size = util.copy(this.tileSize);
        
        gid = gid - this.firstGID;

        var imgSize = this.get('imageSize');
        
        var maxX = Math.floor((imgSize.width - this.margin * 2 + this.spacing) / (this.tileSize.width + this.spacing));
        
        rect.origin.x = (gid % maxX) * (this.tileSize.width + this.spacing) + this.margin;
        rect.origin.y = Math.floor(gid / maxX) * (this.tileSize.height + this.spacing) + this.margin;
        
        return rect;
    }
});

var TMXLayerInfo = BObject.extend(/** @lends cocos.TMXLayerInfo# */{
    name: '',
    layerSize: null,
    tiles: null,
    visible: true,
    opacity: 255,
    minGID: 100000,
    maxGID: 0,
    properties: null,
    offset: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXLayerInfo.superclass.init.call(this);

        this.properties = {};
        this.offset = ccp(0, 0);
    }
});

var TMXObjectGroup = BObject.extend(/** @lends cocos.TMXObjectGroup# */{
    name: '',
    properties: null,
    offset: null,
    objects: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXObjectGroup.superclass.init.call(this);

        this.properties = {};
        this.objects = {};
        this.offset = ccp(0, 0);
    },

    /**
     * return the value for the specific property name
     *
     * @opt {String} name Property name
     * @returns {String} Property value
     */
    propertyNamed: function(opts) {
        var propertyName = opts.name
        return this.properties[propertyName];
    },

    /**
     * Return the object for the specific object name. It will return the 1st
     * object found on the array for the given name.
     *
     * @opt {String} name Object name
     * @returns {Object} Object
     */
    objectNamed: function(opts) {
        var objectName = opts.name;
        var object = null;
        
        this.objects.forEach(function(item) {
         
            if(item.name == objectName) {
                object = item;
            }
        });
        if(object != null) {
            return object;
        }
    }
});

var TMXMapInfo = BObject.extend(/** @lends cocos.TMXMapInfo# */{
    filename: '',
    orientation: 0,
    mapSize: null,
    tileSize: null,
    layer: null,
    tilesets: null,
    objectGroups: null,
    properties: null,
    tileProperties: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @param {String} tmxFile The file path of the TMX file to load
     */
    init: function (tmxFile) {
        TMXMapInfo.superclass.init.call(this, tmxFile);

        this.tilesets = [];
        this.layers = [];
        this.objectGroups = [];
        this.properties = {};
        this.tileProperties = {};
        this.filename = tmxFile;

        this.parseXMLFile(tmxFile);
    },

    parseXMLFile: function (xmlFile) {
        var parser = new DOMParser(),
            doc = parser.parseFromString(resource(xmlFile), 'text/xml');

        // PARSE <map>
        var map = doc.documentElement;

        // Set Orientation
        switch (map.getAttribute('orientation')) {
        case 'orthogonal':
            this.orientation = TMXOrientationOrtho;
            break;
        case 'isometric':
            this.orientation = TMXOrientationIso;
            break;
        case 'hexagonal':
            this.orientation = TMXOrientationHex;
            break;
        default:
            throw "cocos2d: TMXFomat: Unsupported orientation: " + map.getAttribute('orientation');
        }
        this.mapSize = {width: parseInt(map.getAttribute('width'), 10), height: parseInt(map.getAttribute('height'), 10)};
        this.tileSize = {width: parseInt(map.getAttribute('tilewidth'), 10), height: parseInt(map.getAttribute('tileheight'), 10)};


        // PARSE <tilesets>
        var tilesets = map.getElementsByTagName('tileset');
        var i, len, s;
        for (i = 0, len = tilesets.length; i < len; i++) {
            var t = tilesets[i];

            var tileset = TMXTilesetInfo.create();
            tileset.set('name', t.getAttribute('name'));
            tileset.set('firstGID', parseInt(t.getAttribute('firstgid'), 10));
            if (t.getAttribute('spacing')) {
                tileset.set('spacing', parseInt(t.getAttribute('spacing'), 10));
            }
            if (t.getAttribute('margin')) {
                tileset.set('margin', parseInt(t.getAttribute('margin'), 10));
            }

            s = {};
            s.width = parseInt(t.getAttribute('tilewidth'), 10);
            s.height = parseInt(t.getAttribute('tileheight'), 10);
            tileset.set('tileSize', s);

            // PARSE <image> We assume there's only 1
            var image = t.getElementsByTagName('image')[0];
            tileset.set('sourceImage', path.join(path.dirname(this.filename), image.getAttribute('source')));

            this.tilesets.push(tileset);
        }

        // PARSE <layers>
        var layers = map.getElementsByTagName('layer');
        for (i = 0, len = layers.length; i < len; i++) {
            var l = layers[i];
            var data = l.getElementsByTagName('data')[0];
            var layer = TMXLayerInfo.create();

            layer.set('name', l.getAttribute('name'));
            if (l.getAttribute('visible') !== false) {
                layer.set('visible', true);
            } else {
                layer.set('visible', !!parseInt(l.getAttribute('visible'), 10));
            }

            s = {};
            s.width = parseInt(l.getAttribute('width'), 10);
            s.height = parseInt(l.getAttribute('height'), 10);
            layer.set('layerSize', s);

            var opacity = l.getAttribute('opacity');
            if (opacity === undefined) {
                layer.set('opacity', 255);
            } else {
                layer.set('opacity', 255 * parseFloat(opacity));
            }

            var x = parseInt(l.getAttribute('x'), 10),
                y = parseInt(l.getAttribute('y'), 10);
            if (isNaN(x)) {
                x = 0;
            }
            if (isNaN(y)) {
                y = 0;
            }
            layer.set('offset', ccp(x, y));


            // Firefox has a 4KB limit on node values. It will split larger
            // nodes up into multiple nodes. So, we'll stitch them back
            // together.
            var nodeValue = '';
            for (var j = 0, jen = data.childNodes.length; j < jen; j++) {
                nodeValue += data.childNodes[j].nodeValue;
            }

            // Unpack the tilemap data
            var compression = data.getAttribute('compression');
            switch (compression) {
            case 'gzip':
                layer.set('tiles', gzip.unzipBase64AsArray(nodeValue, 4));
                break;
                
            // Uncompressed
            case null:
            case '': 
                layer.set('tiles', base64.decodeAsArray(nodeValue, 4));
                break;

            default: 
                throw "Unsupported TMX Tile Map compression: " + compression;
            }

            this.layers.push(layer);
        }

        // TODO PARSE <tile>

        // PARSE <objectgroup>
        var objectgroups = map.getElementsByTagName('objectgroup');
        for (i = 0, len = objectgroups.length; i < len; i++) {
            var g = objectgroups[i],
                objectGroup = TMXObjectGroup.create();

            objectGroup.set('name', g.getAttribute('name'));
            
            var properties = g.querySelectorAll('objectgroup > properties property'),
                propertiesValue = {};
            
            for(j = 0; j < properties.length; j++) {
                var property = properties[j];
                if(property.getAttribute('name')) {
                    propertiesValue[property.getAttribute('name')] = property.getAttribute('value');
                }
            }
           
            objectGroup.set('properties', propertiesValue);

            var objectsArray = [],
                objects = g.querySelectorAll('object');

            for(j = 0; j < objects.length; j++) {
                var object = objects[j];
                var objectValue = {
                    x       : parseInt(object.getAttribute('x'), 10),
                    y       : parseInt(object.getAttribute('y'), 10),
                    width   : parseInt(object.getAttribute('width'), 10),
                    height  : parseInt(object.getAttribute('height'), 10)
                };
                if(object.getAttribute('name')) {
                    objectValue.name = object.getAttribute('name');
                }
                if(object.getAttribute('type')) {
                    objectValue.name = object.getAttribute('type');
                }
                properties = object.querySelectorAll('property');
                for(var k = 0; k < properties.length; k++) {
                    property = properties[k];
                    if(property.getAttribute('name')) {
                        objectValue[property.getAttribute('name')] = property.getAttribute('value');
                    }
                }
                objectsArray.push(objectValue);

            }
            objectGroup.set('objects', objectsArray);
            this.objectGroups.push(objectGroup);
        }
    }
});

exports.TMXMapInfo = TMXMapInfo;
exports.TMXLayerInfo = TMXLayerInfo;
exports.TMXTilesetInfo = TMXTilesetInfo;
exports.TMXObjectGroup = TMXObjectGroup;
}};
__resources__["/__builtin__/libs/cocos2d/Texture2D.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var Texture2D = BObject.extend(/** @lends cocos.Texture2D# */{
	imgElement: null,
	size: null,
    name: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {String} [file] The file path of the image to use as a texture
     * @opt {Texture2D|HTMLImageElement} [data] Image data to read from
     */
	init: function (opts) {
		var file = opts.file,
			data = opts.data,
			texture = opts.texture;

		if (file) {
            this.name = file;
			data = resource(file);
		} else if (texture) {
            this.name = texture.get('name');
			data = texture.get('imgElement');
		}

		this.size = {width: 0, height: 0};

		this.set('imgElement', data);
		this.set('size', {width: this.imgElement.width, height: this.imgElement.height});
	},

	drawAtPoint: function (ctx, point) {
		ctx.drawImage(this.imgElement, point.x, point.y);
	},
	drawInRect: function (ctx, rect) {
		ctx.drawImage(this.imgElement,
			rect.origin.x, rect.origin.y,
			rect.size.width, rect.size.height
		);
	},

    /**
     * @getter data
     * @type {String} Base64 encoded image data
     */
    get_data: function () {
        return this.imgElement ? this.imgElement.src : null;
	},

    /**
     * @getter contentSize
     * @type {geometry.Size} Size of the texture
     */
    get_contentSize: function () {
		return this.size;
    }
});

exports.Texture2D = Texture2D;

}};
__resources__["/__builtin__/libs/cocos2d/TextureAtlas.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
	Texture2D = require('./Texture2D').Texture2D;


/* QUAD STRUCTURE
 quad = {
	 drawRect: <rect>, // Where the quad is drawn to
	 textureRect: <rect>  // The slice of the texture to draw in drawRect
 }
*/

var TextureAtlas = BObject.extend(/** @lends cocos.TextureAtlas# */{
	quads: null,
	imgElement: null,
	texture: null,

    /**
     * A single texture that can represent lots of smaller images
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {String} file The file path of the image to use as a texture
     * @opt {Texture2D|HTMLImageElement} [data] Image data to read from
     * @opt {CanvasElement} [canvas] A canvas to use as a texture
     */
	init: function (opts) {
		var file = opts.file,
			data = opts.data,
			texture = opts.texture,
			canvas = opts.canvas;

        if (canvas) {
            // If we've been given a canvas element then we'll use that for our image
            this.imgElement = canvas;
        } else {
            texture = Texture2D.create({texture: texture, file: file, data: data});
			this.set('texture', texture);
			this.imgElement = texture.get('imgElement');
        }

		this.quads = [];
	},

	insertQuad: function (opts) {
		var quad = opts.quad,
			index = opts.index || 0;

		this.quads.splice(index, 0, quad);
	},
	removeQuad: function (opts) {
		var index = opts.index;

		this.quads.splice(index, 1);
	},


	drawQuads: function (ctx) {
		util.each(this.quads, util.callback(this, function (quad) {
            if (!quad) {
                return;
            }

			this.drawQuad(ctx, quad);
		}));
	},

	drawQuad: function (ctx, quad) {
        var sx = quad.textureRect.origin.x,
            sy = quad.textureRect.origin.y,
            sw = quad.textureRect.size.width, 
            sh = quad.textureRect.size.height;

        var dx = quad.drawRect.origin.x,
            dy = quad.drawRect.origin.y,
            dw = quad.drawRect.size.width, 
            dh = quad.drawRect.size.height;


        var scaleX = 1;
        var scaleY = 1;

        if (FLIP_Y_AXIS) {
            dy -= dh;
            dh *= -1;
        }

            
        if (dw < 0) {
            dw *= -1;
            scaleX = -1;
        }
            
        if (dh < 0) {
            dh *= -1;
            scaleY = -1;
        }

        ctx.scale(scaleX, scaleY);

        var img = this.get('imgElement');
		ctx.drawImage(img, 
			sx, sy, // Draw slice from x,y
			sw, sh, // Draw slice size
			dx, dy, // Draw at 0, 0
			dw, dh  // Draw size
		);
        ctx.scale(1, 1);
	}
});

exports.TextureAtlas = TextureAtlas;

}};
__resources__["/__builtin__/libs/cocos2d/actions/Action.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console;

/** 
 * @memberOf cocos.actions
 * @class Base class for Actions
 * @extends BObject
 * @constructor
 */
var Action = BObject.extend(/** @lends cocos.actions.Action# */{
    /**
     * The Node the action is being performed on
     * @type cocos.nodes.Node
     */
    target: null,
    originalTarget: null,

    /**
     * Called every frame with it's delta time.
     *
     * @param {Float} dt The delta time
     */
    step: function (dt) {
        console.log('Action.step() Override me');
    },

    /**
     * Called once per frame.
     *
     * @param {Float} time How much of the animation has played. 0.0 = just started, 1.0 just finished.
     */
    update: function (time) {
        console.log('Action.update() Override me');
    },

    /**
     * Called before the action start. It will also set the target.
     *
     * @param {cocos.nodes.Node} target The Node to run the action on
     */
    startWithTarget: function (target) {
        this.target = this.originalTarget = target;
    },

    /**
     * Called after the action has finished. It will set the 'target' to nil.
     * <strong>Important</strong>: You should never call cocos.actions.Action#stop manually.
     * Instead, use cocos.nodes.Node#stopAction(action)
     */
    stop: function () {
        this.target = null;
    },

    /**
     * @getter isDone
     * @type {Boolean} 
     */
    get_isDone: function (key) {
        return true;
    },


    /**
     * Returns a copy of this Action but in reverse
     *
     * @returns {cocos.actions.Action} A new Action in reverse
     */
    reverse: function () {
    }
});

var RepeatForever = Action.extend(/** @lends cocos.actions.RepeatForever# */{
    other: null,

    /**
     * @memberOf cocos.actions
     * @class Repeats an action forever. To repeat the an action for a limited
     * number of times use the cocos.Repeat action.
     * @extends cocos.actions.Action
     * @param {cocos.actions.Action} action An action to repeat forever
     * @constructs
     */
    init: function (action) {
        RepeatForever.superclass.init(this, action);

        this.other = action;
    },

    startWithTarget: function (target) {
        RepeatForever.superclass.startWithTarget.call(this, target);

        this.other.startWithTarget(this.target);
    },

    step: function (dt) {
        this.other.step(dt);
        if (this.other.get('isDone')) {
            var diff = dt - this.other.get('duration') - this.other.get('elapsed');
            this.other.startWithTarget(this.target);

            this.other.step(diff);
        }
    },

    get_isDone: function () {
        return false;
    },

    reverse: function () {
        return RepeatForever.create(this.other.reverse());
    },

    copy: function () {
        return RepeatForever.create(this.other.copy());
    }
});

var FiniteTimeAction = Action.extend(/** @lends cocos.actions.FiniteTimeAction# */{
    /**
     * Number of seconds to run the Action for
     * @type Float
     */
    duration: 2,

    /** 
     * Repeats an action a number of times. To repeat an action forever use the
     * cocos.RepeatForever action.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.Action
     */
    init: function () {
        FiniteTimeAction.superclass.init.call(this);
    },

    /** @ignore */
    reverse: function () {
        console.log('FiniteTimeAction.reverse() Override me');
    }
});

exports.Action = Action;
exports.RepeatForever = RepeatForever;
exports.FiniteTimeAction = FiniteTimeAction;

}};
__resources__["/__builtin__/libs/cocos2d/actions/ActionInstant.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

var ActionInstant = act.FiniteTimeAction.extend(/** @lends cocos.actions.ActionInstant */{
    /**
     * @memberOf cocos.actions
     * @class Base class for actions that triggers instantly. They have no duration.
     * @extends cocos.actions.FiniteTimeAction
     * @constructs
     */
    init: function (opts) {
        ActionInstant.superclass.init.call(this, opts);

        this.duration = 0;
    },
    get_isDone: function () {
        return true;
    },
    step: function (dt) {
        this.update(1);
    },
    update: function (t) {
        // ignore
    },
    reverse: function () {
        return this.copy();
    }
});

var FlipX = ActionInstant.extend(/** @lends cocos.actions.FlipX# */{
    flipX: false,

    /**
     * @memberOf cocos.actions
     * @class Flips a sprite horizontally
     * @extends cocos.actions.ActionInstant
     * @constructs
     *
     * @opt {Boolean} flipX Should the sprite be flipped
     */
    init: function (opts) {
        FlipX.superclass.init.call(this, opts);

        this.flipX = opts.flipX;
    },
    startWithTarget: function (target) {
        FlipX.superclass.startWithTarget.call(this, target);

        target.set('flipX', this.flipX);
    },
    reverse: function () {
        return FlipX.create({flipX: !this.flipX});
    },
    copy: function () {
        return FlipX.create({flipX: this.flipX});
    }
});

var FlipY = ActionInstant.extend(/** @lends cocos.actions.FlipY# */{
    flipY: false,

    /**
     * @memberOf cocos.actions
     * @class Flips a sprite vertically
     * @extends cocos.actions.ActionInstant
     * @constructs
     *
     * @opt {Boolean} flipY Should the sprite be flipped
     */
    init: function (opts) {
        FlipY.superclass.init.call(this, opts);

        this.flipY = opts.flipY;
    },
    startWithTarget: function (target) {
        FlipY.superclass.startWithTarget.call(this, target);

        target.set('flipY', this.flipY);
    },
    reverse: function () {
        return FlipY.create({flipY: !this.flipY});
    },
    copy: function () {
        return FlipY.create({flipY: this.flipY});
    }
});

exports.ActionInstant = ActionInstant;
exports.FlipX = FlipX;
exports.FlipY = FlipY;

}};
__resources__["/__builtin__/libs/cocos2d/actions/ActionInterval.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

var ActionInterval = act.FiniteTimeAction.extend(/** @lends cocos.actions.ActionInterval# */{
    /**
     * Number of seconds that have elapsed
     * @type Float
     */
    elapsed: 0.0,

    _firstTick: true,

    /**
     * Base class actions that do have a finite time duration. 
     *
     * Possible actions:
     *
     * - An action with a duration of 0 seconds
     * - An action with a duration of 35.5 seconds Infinite time actions are valid
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.FiniteTimeAction
     *
     * @opt {Float} duration Number of seconds to run action for
     */
    init: function (opts) {
        ActionInterval.superclass.init.call(this, opts);

        var dur = opts.duration || 0;
        if (dur === 0) {
            dur = 0.0000001;
        }

        this.set('duration', dur);
        this.set('elapsed', 0);
        this._firstTick = true;
    },

    get_isDone: function () {
        return (this.elapsed >= this.duration);
    },

    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.update(Math.min(1, this.elapsed / this.duration));
    },

    startWithTarget: function (target) {
        ActionInterval.superclass.startWithTarget.call(this, target);

        this.elapsed = 0.0;
        this._firstTick = true;
    },

    reverse: function () {
        throw "Reverse Action not implemented";
    }
});

var ScaleTo = ActionInterval.extend(/** @lends cocos.actions.ScaleTo# */{
    /**
     * Current X Scale
     * @type Float
     */
    scaleX: 1,

    /**
     * Current Y Scale
     * @type Float
     */
    scaleY: 1,

    /**
     * Initial X Scale
     * @type Float
     */
    startScaleX: 1,

    /**
     * Initial Y Scale
     * @type Float
     */
    startScaleY: 1,

    /**
     * Final X Scale
     * @type Float
     */
    endScaleX: 1,

    /**
     * Final Y Scale
     * @type Float
     */
    endScaleY: 1,

    /**
     * Delta X Scale
     * @type Float
     * @private
     */
    deltaX: 0.0,

    /**
     * Delta Y Scale
     * @type Float
     * @private
     */
    deltaY: 0.0,

    /**
     * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} [scale] Size to scale Node to
     * @opt {Float} [scaleX] Size to scale width of Node to
     * @opt {Float} [scaleY] Size to scale height of Node to
     */
    init: function (opts) {
        ScaleTo.superclass.init.call(this, opts);

        if (opts.scale !== undefined) {
            this.endScaleX = this.endScaleY = opts.scale;
        } else {
            this.endScaleX = opts.scaleX;
            this.endScaleY = opts.scaleY;
        }


    },

    startWithTarget: function (target) {
        ScaleTo.superclass.startWithTarget.call(this, target);

        this.startScaleX = this.target.get('scaleX');
        this.startScaleY = this.target.get('scaleY');
        this.deltaX = this.endScaleX - this.startScaleX;
        this.deltaY = this.endScaleY - this.startScaleY;
    },

    update: function (t) {
        if (!this.target) {
            return;
        }
        
        this.target.set('scaleX', this.startScaleX + this.deltaX * t);
        this.target.set('scaleY', this.startScaleY + this.deltaY * t);
    }
});

var ScaleBy = ScaleTo.extend(/** @lends cocos.actions.ScaleBy# */{
    /**
     * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ScaleTo
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} [scale] Size to scale Node by
     * @opt {Float} [scaleX] Size to scale width of Node by
     * @opt {Float} [scaleY] Size to scale height of Node by
     */
    init: function (opts) {
        ScaleBy.superclass.init.call(this, opts);
    },

    startWithTarget: function (target) {
        ScaleBy.superclass.startWithTarget.call(this, target);

        this.deltaX = this.startScaleX * this.endScaleX - this.startScaleX;
        this.deltaY = this.startScaleY * this.endScaleY - this.startScaleY;
    },

    reverse: function () {
        return ScaleBy.create({duration: this.duration, scaleX: 1 / this.endScaleX, scaleY: 1 / this.endScaleY});
    }
});


var RotateTo = ActionInterval.extend(/** @lends cocos.actions.RotateTo# */{
    /**
     * Final angle
     * @type Float
     */
    dstAngle: 0,

    /**
     * Initial angle
     * @type Float
     */
    startAngle: 0,

    /**
     * Angle delta
     * @type Float
     */
    diffAngle: 0,

    /**
     * Rotates a cocos.Node object to a certain angle by modifying its rotation
     * attribute. The direction will be decided by the shortest angle.
     * 
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} angle Angle in degrees to rotate to
     */
    init: function (opts) {
        RotateTo.superclass.init.call(this, opts);

        this.dstAngle = opts.angle;
    },

    startWithTarget: function (target) {
        RotateTo.superclass.startWithTarget.call(this, target);

        this.startAngle = target.get('rotation');

        if (this.startAngle > 0) {
            this.startAngle = (this.startAngle % 360);
        } else {
            this.startAngle = (this.startAngle % -360);
        }

        this.diffAngle = this.dstAngle - this.startAngle;
        if (this.diffAngle > 180) {
            this.diffAngle -= 360;
        } else if (this.diffAngle < -180) {
            this.diffAngle += 360;
        }
    },

    update: function (t) {
        this.target.set('rotation', this.startAngle + this.diffAngle * t);
    }
});

var RotateBy = RotateTo.extend(/** @lends cocos.actions.RotateBy# */{
    /**
     * Number of degrees to rotate by
     * @type Float
     */
    angle: 0,

    /**
     * Rotates a cocos.Node object to a certain angle by modifying its rotation
     * attribute. The direction will be decided by the shortest angle.
     *
     * @memberOf cocos.action
     * @constructs
     * @extends cocos.actions.RotateTo
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} angle Angle in degrees to rotate by
     */
    init: function (opts) {
        RotateBy.superclass.init.call(this, opts);

        this.angle = opts.angle;
    },

    startWithTarget: function (target) {
        RotateBy.superclass.startWithTarget.call(this, target);

        this.startAngle = this.target.get('rotation');
    },

    update: function (t) {
        this.target.set('rotation', this.startAngle + this.angle * t);
    },

    reverse: function () {
        return RotateBy.create({duration: this.duration, angle: -this.angle});
    },

    copy: function () {
        return RotateBy.create({duration: this.duration, angle: this.angle});
    }
});



var Sequence = ActionInterval.extend(/** @lends cocos.actions.Sequence# */{
    /**
     * Array of actions to run
     * @type cocos.Node[]
     */
    actions: null,

    /**
     * The array index of the currently running action
     * @type Integer
     */
    currentActionIndex: 0,

    /**
     * The duration when the current action finishes
     * @type Float
     */
    currentActionEndDuration: 0,

    /**
     * Runs a number of actions sequentially, one after another
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {cocos.actions.Action[]} Array of actions to run in sequence
     */
    init: function (opts) {
        Sequence.superclass.init.call(this, opts);

        this.actions = util.copy(opts.actions);
        this.actionSequence = {};
        
        util.each(this.actions, util.callback(this, function (action) {
            this.duration += action.duration;
        }));
    },

    startWithTarget: function (target) {
        Sequence.superclass.startWithTarget.call(this, target);

        this.currentActionIndex = 0;
        this.currentActionEndDuration = this.actions[0].get('duration');
        this.actions[0].startWithTarget(this.target);
    },

    stop: function () {
        util.each(this.actions, function (action) {
            action.stop();
        });

        Sequence.superclass.stop.call(this);
    },

    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.actions[this.currentActionIndex].step(dt);
        this.update(Math.min(1, this.elapsed / this.duration));
    },

    update: function (dt) {
        // Action finished onto the next one
        if (this.elapsed > this.currentActionEndDuration) {
            var previousAction = this.actions[this.currentActionIndex];
            previousAction.update(1.0);
            previousAction.stop();


            this.currentActionIndex++;

            if (this.currentActionIndex < this.actions.length) {
                var currentAction = this.actions[this.currentActionIndex];
                currentAction.startWithTarget(this.target);

                this.currentActionEndDuration += currentAction.duration;
            }
        }
    }
});

var Animate = ActionInterval.extend(/** @lends cocos.actions.Animate# */{
    animation: null,
    restoreOriginalFrame: true,
    origFrame: null,


    /**
     * Animates a sprite given the name of an Animation 
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {cocos.Animation} animation Animation to run
     * @opt {Boolean} [restoreOriginalFrame=true] Return to first frame when finished
     */
    init: function (opts) {
        this.animation = opts.animation;
        this.restoreOriginalFrame = opts.restoreOriginalFrame !== false;
        opts.duration = this.animation.frames.length * this.animation.delay;

        Animate.superclass.init.call(this, opts);
    },

    startWithTarget: function (target) {
        Animate.superclass.startWithTarget.call(this, target);

        if (this.restoreOriginalFrame) {
            this.set('origFrame', this.target.get('displayedFrame'));
        }
    },

    stop: function () {
        if (this.target && this.restoreOriginalFrame) {
            var sprite = this.target;
            sprite.set('displayFrame', this.origFrame);
        }

        Animate.superclass.stop.call(this);
    },

    update: function (t) {
        var frames = this.animation.get('frames'),
            numberOfFrames = frames.length,
            idx = Math.floor(t * numberOfFrames);

        if (idx >= numberOfFrames) {
            idx = numberOfFrames - 1;
        }

        var sprite = this.target;
        if (!sprite.isFrameDisplayed(frames[idx])) {
            sprite.set('displayFrame', frames[idx]);
        }
    },

    copy: function () {
        return Animate.create({animation: this.animation, restoreOriginalFrame: this.restoreOriginalFrame});
    }

});

exports.ActionInterval = ActionInterval;
exports.ScaleTo = ScaleTo;
exports.ScaleBy = ScaleBy;
exports.RotateTo = RotateTo;
exports.RotateBy = RotateBy;
exports.Sequence = Sequence;
exports.Animate = Animate;

}};
__resources__["/__builtin__/libs/cocos2d/actions/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'Action ActionInterval ActionInstant'.w();

/**
 * @memberOf cocos
 * @namespace Actions used to animate or change a Node
 */
var actions = {};

util.each(modules, function (mod, i) {
    util.extend(actions, require('./' + mod));
});

module.exports = actions;

}};
__resources__["/__builtin__/libs/cocos2d/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'SpriteFrame SpriteFrameCache Director Animation AnimationCache Scheduler ActionManager TMXXMLParser'.w();

/**
 * @namespace All cocos2d objects live in this namespace
 */
var cocos = {
    nodes: require('./nodes'),
    actions: require('./actions')
};

util.each(modules, function (mod, i) {
    util.extend(cocos, require('./' + mod));
});

module.exports = cocos;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/BatchNode.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray SHOW_REDRAW_REGIONS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    geo = require('geometry'),
    ccp = geo.ccp,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    RenderTexture = require('./RenderTexture').RenderTexture,
	Node = require('./Node').Node;

var BatchNode = Node.extend(/** @lends cocos.nodes.BatchNode# */{
    partialDraw: false,
    contentRect: null,
    renderTexture: null,
    dirty: true,

    /**
     * Region to redraw
     * @type geometry.Rect
     */
    dirtyRegion: null,
    dynamicResize: false,

    /** @private
     * Areas that need redrawing
     *
     * Not implemented
     */
    _dirtyRects: null,


    /**
     * Draws all children to an in-memory canvas and only redraws when something changes
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {geometry.Size} size The size of the in-memory canvas used for drawing to
     * @opt {Boolean} [partialDraw=false] Draw only the area visible on screen. Small maps may be slower in some browsers if this is true.
     */
	init: function (opts) {
		BatchNode.superclass.init.call(this, opts);

        var size = opts.size || geo.sizeMake(1, 1);
        this.set('partialDraw', opts.partialDraw);

        evt.addListener(this, 'contentsize_changed', util.callback(this, this._resizeCanvas));
        
		this._dirtyRects = [];
        this.set('contentRect', geo.rectMake(0, 0, size.width, size.height));
        this.renderTexture = RenderTexture.create(size);
        this.renderTexture.sprite.set('isRelativeAnchorPoint', false);
        this.addChild({child: this.renderTexture});
	},

    addChild: function (opts) {
        BatchNode.superclass.addChild.call(this, opts);

        var child = opts.child,
            z     = opts.z;

        if (child == this.renderTexture) {
            return;
        }

        // TODO handle texture resize

        // Watch for changes in child
        evt.addListener(child, 'istransformdirty_changed', util.callback(this, function () {
            this.addDirtyRegion(child.get('boundingBox'));
        }));
        evt.addListener(child, 'visible_changed', util.callback(this, function () {
            this.addDirtyRegion(child.get('boundingBox'));
        }));

        this.addDirtyRegion(child.get('boundingBox'));
    },

    removeChild: function (opts) {
        BatchNode.superclass.removeChild.call(this, opts);

        // TODO remove istransformdirty_changed and visible_changed listeners

        this.set('dirty', true);
    },

    addDirtyRegion: function (rect) {
        var region = this.get('dirtyRegion');
        if (!region) {
            region = util.copy(rect);
        } else {
            region = geo.rectUnion(region, rect);
        }

        this.set('dirtyRegion', region);
        this.set('dirty', true);
    },

    _resizeCanvas: function (oldSize) {
        var size = this.get('contentSize');

        if (geo.sizeEqualToSize(size, oldSize)) {
            return; // No change
        }


        this.renderTexture.set('contentSize', size);
        this.set('dirty', true);
    },

    update: function () {

    },

    visit: function (context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        var rect = this.get('dirtyRegion');
        // Only redraw if something changed
        if (this.dirty) {

            if (rect) {
                if (this.get('partialDraw')) {
                    // Clip region to visible area
                    var s = require('../Director').Director.get('sharedDirector').get('winSize'),
                        p = this.get('position');
                    var r = new geo.Rect(
                        0, 0,
                        s.width, s.height
                    );
                    r = geo.rectApplyAffineTransform(r, this.worldToNodeTransform());
                    rect = geo.rectIntersection(r, rect);
                }

                this.renderTexture.clear(rect);

                this.renderTexture.context.save();
                this.renderTexture.context.beginPath();
                this.renderTexture.context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                this.renderTexture.context.clip();
                this.renderTexture.context.closePath();
            } else {
                this.renderTexture.clear();
            }

            for (var i = 0, childLen = this.children.length; i < childLen; i++) {
                var c = this.children[i];
                if (c == this.renderTexture) {
                    continue;
                }

                // Draw children inside rect
                if (!rect || geo.rectOverlapsRect(c.get('boundingBox'), rect)) {
                    c.visit(this.renderTexture.context, rect);
                }
            }

            if (SHOW_REDRAW_REGIONS) {
                if (rect) {
                    this.renderTexture.context.beginPath();
                    this.renderTexture.context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                    this.renderTexture.context.fillStyle = "rgba(0, 0, 255, 0.5)";
                    this.renderTexture.context.fill();
                    this.renderTexture.context.closePath();
                }
            }

            if (rect) {
                this.renderTexture.context.restore();
            }

            this.set('dirty', false);
            this.set('dirtyRegion', null);
        }

        this.renderTexture.visit(context);

        context.restore();
	},

	draw: function (ctx) {
    },

    onEnter: function () {
        if (this.get('partialDraw')) {
            evt.addListener(this.get('parent'), 'istransformdirty_changed', util.callback(this, function () {
                var box = this.get('visibleRect');
                this.addDirtyRegion(box);
            }));
        }
    }
});

var SpriteBatchNode = BatchNode.extend(/** @lends cocos.nodes.SpriteBatchNode# */{
    textureAtlas: null,

    /**
     * @memberOf cocos.nodes
     * @class A BatchNode that accepts only Sprite using the same texture
     * @extends cocos.nodes.BatchNode
     * @constructs
     *
     * @opt {String} file (Optional) Path to image to use as sprite atlas
     * @opt {Texture2D} texture (Optional) Texture to use as sprite atlas
     * @opt {cocos.TextureAtlas} textureAtlas (Optional) TextureAtlas to use as sprite atlas
     */
    init: function (opts) {
        SpriteBatchNode.superclass.init.call(this, opts);

        var file         = opts.file,
            textureAtlas = opts.textureAtlas,
            texture      = opts.texture;

        if (file || texture) {
            textureAtlas = TextureAtlas.create({file: file, texture: texture});
        }

        this.set('textureAtlas', textureAtlas);
    },

    /**
     * @getter texture
     * @type cocos.Texture2D
     */
    get_texture: function () {
		return this.textureAtlas ? this.textureAtlas.texture : null;
	}

});

exports.BatchNode = BatchNode;
exports.SpriteBatchNode = SpriteBatchNode;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Label.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console,
    Director = require('../Director').Director,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp;

var Label = Node.extend(/** @lends cocos.nodes.Label# */{
    string:   '',
    fontName: 'Helvetica',
    fontSize: 16,
    fontColor: 'white',

    /**
     * Renders a simple text label
     *
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} [string=""] The text string to draw
     * @opt {Float} [fontSize=16] The size of the font
     * @opt {String} [fontName="Helvetica"] The name of the font to use
     * @opt {String} [fontColor="white"] The color of the text
     */
    init: function (opts) {
        Label.superclass.init.call(this, opts);

        util.each('fontSize fontName fontColor string'.w(), util.callback(this, function (name) {
            // Set property on init
            if (opts[name]) {
                this.set(name, opts[name]);
            }

            // Update content size
            this._updateLabelContentSize();
        }));
    },

    /** 
     * String of the font name and size to use in a format &lt;canvas&gt; understands
     *
     * @getter font
     * @type String
     */
    get_font: function (key) {
        return this.get('fontSize') + 'px ' + this.get('fontName');
    },

    draw: function (context) {
        if (FLIP_Y_AXIS) {
            context.save();

            // Flip Y axis
            context.scale(1, -1);
            context.translate(0, -this.get('fontSize'));
        }


        context.fillStyle = this.get('fontColor');
        context.font = this.get('font');
        context.textBaseline = 'top';
        if (context.fillText) {
            context.fillText(this.get('string'), 0, 0);
        } else if (context.mozDrawText) {
            context.mozDrawText(this.get('string'));
        }

        if (FLIP_Y_AXIS) {
            context.restore();
        }
    },

    /**
     * @private
     */
    _updateLabelContentSize: function () {
        var ctx = Director.get('sharedDirector').get('context');
        var size = {width: 0, height: this.get('fontSize')};

        var prevFont = ctx.font;
        ctx.font = this.get('font');

        if (ctx.measureText) {
            var txtSize = ctx.measureText(this.get('string'));
            size.width = txtSize.width;
        } else if (ctx.mozMeasureText) {
            size.width = ctx.mozMeasureText(this.get('string'));
        }

        ctx.font = prevFont;

        this.set('contentSize', size);
    }
});

module.exports.Label = Label;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Layer.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Node = require('./Node').Node,
    util = require('util'),
    evt = require('event'),
    Director = require('../Director').Director,
    ccp    = require('geometry').ccp,
    EventDispatcher = require('../EventDispatcher').EventDispatcher;

var Layer = Node.extend(/** @lends cocos.nodes.Layer# */{
    isMouseEnabled: false,
    isKeyboardEnabled: false,
    mouseDelegatePriority: 0,
    keyboardDelegatePriority: 0,

    /** 
     * A fullscreen Node. You need at least 1 layer in your app to add other nodes to.
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     */
    init: function () {
        Layer.superclass.init.call(this);

        var s = Director.get('sharedDirector').get('winSize');

        this.set('isRelativeAnchorPoint', false);
        this.anchorPoint = ccp(0.5, 0.5);
        this.set('contentSize', s);

        evt.addListener(this, 'ismouseenabled_changed', util.callback(this, function () {
            if (this.isRunning) {
                if (this.isMouseEnabled) {
                    EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority: this.get('mouseDelegatePriority')});
                } else {
                    EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
                }
            }
        }));


        evt.addListener(this, 'iskeyboardenabled_changed', util.callback(this, function () {
            if (this.isRunning) {
                if (this.isKeyboardEnabled) {
                    EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority: this.get('keyboardDelegatePriority')});
                } else {
                    EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this});
                }
            }
        }));
    },

    onEnter: function () {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority: this.get('mouseDelegatePriority')});
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority: this.get('keyboardDelegatePriority')});
        }

        Layer.superclass.onEnter.call(this);
    },

    onExit: function () {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this});
        }

        Layer.superclass.onExit.call(this);
    }
});

module.exports.Layer = Layer;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Menu.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Layer = require('./Layer').Layer,
    Director = require('../Director').Director,
    MenuItem = require('./MenuItem').MenuItem,
    geom = require('geometry'), ccp = geom.ccp;

/** @private
 * @constant */
var kMenuStateWaiting = 0;

/** @private
 * @constant */
var kMenuStateTrackingTouch = 1;
	

var Menu = Layer.extend(/** @lends cocos.nodes.Menu# */{
	mouseDelegatePriority: (-Number.MAX_VALUE + 1),
	state: kMenuStateWaiting,
	selectedItem: null,
	opacuty: 255,
	color: null,

    /**
     * A fullscreen node used to render a selection of menu options
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Layer
     *
     * @opt {cocos.nodes.MenuItem[]} items An array of MenuItems to draw on the menu
     */
	init: function (opts) {
		Menu.superclass.init.call(this, opts);

		var items = opts.items;

		this.set('isMouseEnabled', true);
		
        var s = Director.get('sharedDirector').get('winSize');

		this.set('isRelativeAnchorPoint', false);
		this.anchorPoint = ccp(0.5, 0.5);
		this.set('contentSize', s);

		this.set('position', ccp(s.width / 2, s.height / 2));


		if (items) {
			var z = 0;
			util.each(items, util.callback(this, function (item) {
				this.addChild({child: item, z: z++});
			}));
		}

        
	},

	addChild: function (opts) {
		if (!opts.child instanceof MenuItem) {
			throw "Menu only supports MenuItem objects as children";
		}

        Menu.superclass.addChild.call(this, opts);
    },

    itemForMouseEvent: function (event) {
        var location = event.locationInCanvas;

        var children = this.get('children');
        for (var i = 0, len = children.length; i < len; i++) {
            var item = children[i];

            if (item.get('visible') && item.get('isEnabled')) {
                var local = item.convertToNodeSpace(location);
                
                var r = item.get('rect');
                r.origin = ccp(0, 0);

                if (geom.rectContainsPoint(r, local)) {
                    return item;
                }

            }
        }

        return null;
    },

    mouseUp: function (event) {
        if (this.selectedItem) {
            this.selectedItem.set('isSelected', false);
            this.selectedItem.activate();

            return true;
        }

        if (this.state != kMenuStateWaiting) {
            this.set('state', kMenuStateWaiting);
        }

        return false;

    },
    mouseDown: function (event) {
        if (this.state != kMenuStateWaiting || !this.visible) {
            return false;
        }

        var selectedItem = this.itemForMouseEvent(event);
        this.set('selectedItem', selectedItem);
        if (selectedItem) {
            selectedItem.set('isSelected', true);
            this.set('state', kMenuStateTrackingTouch);

            return true;
        }

        return false;
    },

    mouseDragged: function (event) {
        var currentItem = this.itemForMouseEvent(event);

        if (currentItem != this.selectedItem) {
            if (this.selectedItem) {
                this.selectedItem.set('isSelected', false);
            }
            this.set('selectedItem', currentItem);
            if (this.selectedItem) {
                this.selectedItem.set('isSelected', true);
            }
        }

        if (currentItem && this.state == kMenuStateTrackingTouch) {
            return true;
        }

        return false;
        
    }

});

exports.Menu = Menu;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/MenuItem.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Node = require('./Node').Node,
    Sprite = require('./Sprite').Sprite,
    rectMake = require('geometry').rectMake,
    ccp = require('geometry').ccp;

var MenuItem = Node.extend(/** @lends cocos.nodes.MenuItem# */{
	isEnabled: true,
	isSelected: false,
	callback: null,

    /**
     * Base class for any buttons or options in a menu
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {Function} callback Function to call when menu item is activated
     */
	init: function (opts) {
		MenuItem.superclass.init.call(this, opts);

		var callback = opts.callback;

		this.set('anchorPoint', ccp(0.5, 0.5));
		this.set('callback', callback);
	},

	activate: function () {
		if (this.isEnabled && this.callback) {
			this.callback(this);
		}
	},

    /**
     * @getter rect
     * @type geometry.Rect
     */
	get_rect: function () {
		return rectMake(
			this.position.x - this.contentSize.width  * this.anchorPoint.x,
			this.position.y - this.contentSize.height * this.anchorPoint.y,
			this.contentSize.width,
			this.contentSize.height
		);
	}
});

var MenuItemSprite = MenuItem.extend(/** @lends cocos.nodes.MenuItemSprite# */{
	normalImage: null,
	selectedImage: null,
	disabledImage: null,

    /**
     * A menu item that accepts any cocos.nodes.Node
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.MenuItem
     *
     * @opt {cocos.nodes.Node} normalImage Main Node to draw
     * @opt {cocos.nodes.Node} selectedImage Node to draw when menu item is selected
     * @opt {cocos.nodes.Node} disabledImage Node to draw when menu item is disabled
     */
	init: function (opts) {
		MenuItemSprite.superclass.init.call(this, opts);

		var normalImage   = opts.normalImage,
			selectedImage = opts.selectedImage,
			disabledImage = opts.disabledImage;

		this.set('normalImage', normalImage);
		this.set('selectedImage', selectedImage);
		this.set('disabledImage', disabledImage);

		this.set('contentSize', normalImage.get('contentSize'));
	},

	draw: function (ctx) {
		if (this.isEnabled) {
			if (this.isSelected) {
				this.selectedImage.draw(ctx);
			} else {
				this.normalImage.draw(ctx);
			}
		} else {
			if (this.disabledImage) {
				this.disabledImage.draw(ctx);
			} else {
				this.normalImage.draw(ctx);
			}
		}
	}
});

var MenuItemImage = MenuItemSprite.extend(/** @lends cocos.nodes.MenuItemImage# */{

    /**
     * MenuItem that accepts image files
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.MenuItemSprite
     *
     * @opt {String} normalImage Main image file to draw
     * @opt {String} selectedImage Image file to draw when menu item is selected
     * @opt {String} disabledImage Image file to draw when menu item is disabled
     */
	init: function (opts) {
		var normalI   = opts.normalImage,
			selectedI = opts.selectedImage,
			disabledI = opts.disabledImage,
			callback  = opts.callback;

		var normalImage = Sprite.create({file: normalI}),
			selectedImage = Sprite.create({file: selectedI}),
			disabledImage = null;

		if (disabledI) {
			disabledImage = Sprite.create({file: disabledI});
		}

		return MenuItemImage.superclass.init.call(this, {normalImage: normalImage, selectedImage: selectedImage, disabledImage: disabledImage, callback: callback});
    }
});

exports.MenuItem = MenuItem;
exports.MenuItemImage = MenuItemImage;
exports.MenuItemSprite = MenuItemSprite;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Node.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    Scheduler = require('../Scheduler').Scheduler,
    ActionManager = require('../ActionManager').ActionManager,
    geo = require('geometry'), ccp = geo.ccp;

var Node = BObject.extend(/** @lends cocos.nodes.Node# */{
    isCocosNode: true,

    /**
     * Is the node visible
     * @type boolean
     */
    visible: true,

    /**
     * Position relative to parent node
     * @type geometry.Point
     */
    position: null,

    /**
     * Parent node
     * @type cocos.nodes.Node
     */
    parent: null,

    /**
     * Unique tag to identify the node
     * @type *
     */
    tag: null,

    /**
     * Size of the node
     * @type geometry.Size
     */
    contentSize: null,

    /**
     * Nodes Z index. i.e. draw order
     * @type Integer
     */
    zOrder: 0,

    /**
     * Anchor point for scaling and rotation. 0x0 is top left and 1x1 is bottom right
     * @type geometry.Point
     */
    anchorPoint: null,

    /**
     * Anchor point for scaling and rotation in pixels from top left
     * @type geometry.Point
     */
    anchorPointInPixels: null,

    /**
     * Rotation angle in degrees
     * @type Float
     */
    rotation: 0,

    /**
     * X scale factor
     * @type Float
     */
    scaleX: 1,

    /**
     * Y scale factor
     * @type Float
     */
    scaleY: 1,
    isRunning: false,
    isRelativeAnchorPoint: true,

    isTransformDirty: true,
    isInverseDirty: true,
    inverse: null,
    transformMatrix: null,

    /**
     * The child Nodes
     * @type cocos.nodes.Node[]
     */
    children: null,

    /**
     * @memberOf cocos.nodes
     * @class The base class all visual elements extend from
     * @extends BObject
     * @constructs
     */
    init: function () {
        Node.superclass.init.call(this);
        this.set('contentSize', {width: 0, height: 0});
        this.anchorPoint = ccp(0.5, 0.5);
        this.anchorPointInPixels = ccp(0, 0);
        this.position = ccp(0, 0);
        this.children = [];

        util.each(['scaleX', 'scaleY', 'rotation', 'position', 'anchorPoint', 'contentSize', 'isRelativeAnchorPoint'], util.callback(this, function (key) {
            evt.addListener(this, key.toLowerCase() + '_changed', util.callback(this, this._dirtyTransform));
        }));
        evt.addListener(this, 'anchorpoint_changed', util.callback(this, this._updateAnchorPointInPixels));
        evt.addListener(this, 'contentsize_changed', util.callback(this, this._updateAnchorPointInPixels));
    },

    /**
     * Calculates the anchor point in pixels and updates the
     * anchorPointInPixels property
     * @private
     */
    _updateAnchorPointInPixels: function () {
        var ap = this.get('anchorPoint'),
            cs = this.get('contentSize');
        this.set('anchorPointInPixels', ccp(cs.width * ap.x, cs.height * ap.y));
    },

    /**
     * Add a child Node
     *
     * @opt {cocos.nodes.Node} child The child node to add
     * @opt {Integer} [z] Z Index for the child
     * @opt {Integer|String} [tag] A tag to reference the child with
     * @returns {cocos.nodes.Node} The node the child was added to. i.e. 'this'
     */
    addChild: function (opts) {
        if (opts.isCocosNode) {
            return this.addChild({child: opts});
        }

        var child = opts.child,
            z = opts.z,
            tag = opts.tag;

        if (z === undefined || z === null) {
            z = child.get('zOrder');
        }

        //this.insertChild({child: child, z:z});
        var added = false;

        
        for (var i = 0, childLen = this.children.length; i < childLen; i++) {
            var c = this.children[i];
            if (c.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                break;
            }
        }

        if (!added) {
            this.children.push(child);
        }

        child.set('tag', tag);
        child.set('zOrder', z);
        child.set('parent', this);

        if (this.isRunning) {
            child.onEnter();
        }

        return this;
    },
    getChild: function (opts) {
        var tag = opts.tag;

        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].tag == tag) {
                return this.children[i];
            }
        }

        return null;
    },

    removeChild: function (opts) {
        var child = opts.child,
            cleanup = opts.cleanup;

        if (!child) {
            return;
        }

        var children = this.get('children'),
            idx = children.indexOf(child);

        if (idx > -1) {
            this.detatchChild({child: child, cleanup: cleanup});
        }
    },

    detatchChild: function (opts) {
        var child = opts.child,
            cleanup = opts.cleanup;

        var children = this.get('children'),
            isRunning = this.get('isRunning'),
            idx = children.indexOf(child);

        if (isRunning) {
            child.onExit();
        }

        if (cleanup) {
            child.cleanup();
        }

        child.set('parent', null);
        children.splice(idx, 1);
    },

    reorderChild: function (opts) {
        var child = opts.child,
            z     = opts.z;

        var pos = this.children.indexOf(child);
        if (pos == -1) {
            throw "Node isn't a child of this node";
        }

        child.set('zOrder', z);

        // Remove child
        this.children.splice(pos, 1);

        // Add child back at correct location
        var added = false;
        for (var i = 0, childLen = this.children.length; i < childLen; i++) {
            var c = this.children[i];
            if (c.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                break;
            }
        }

        if (!added) {
            this.children.push(child);
        }
    },

    /**
     * Draws the node. Override to do custom drawing. If it's less efficient to
     * draw only the area inside the rect then don't bother. The result will be
     * clipped to that area anyway.
     *
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} context Canvas rendering context
     * @param {geometry.Rect} rect Rectangular region that needs redrawing. Limit drawing to this area only if it's more efficient to do so.
     */
    draw: function (context, rect) {
        // All draw code goes here
    },

    /**
     * @getter scale
     * @type Float
     */
    get_scale: function () {
        if (this.scaleX != this.scaleY) {
            throw "scaleX and scaleY aren't identical";
        }

        return this.scaleX;
    },

    /**
     * @setter scale
     * @type Float
     */
    set_scale: function (val) {
        this.set('scaleX', val);
        this.set('scaleY', val);
    },

    scheduleUpdate: function (opts) {
        opts = opts || {};
        var priority = opts.priority || 0;

        Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: priority, paused: !this.get('isRunning')});
    },

    /**
     * Triggered when the node is added to a scene
     *
     * @event
     */
    onEnter: function () {
        util.each(this.children, function (child) {
            child.onEnter();
        });

        this.resumeSchedulerAndActions();
        this.set('isRunning', true);
    },

    /**
     * Triggered when the node is removed from a scene
     *
     * @event
     */
    onExit: function () {
        this.pauseSchedulerAndActions();
        this.set('isRunning', false);

        util.each(this.children, function (child) {
            child.onExit();
        });
    },

    cleanup: function () {
        this.stopAllActions();
        this.unscheduleAllSelectors();
        util.each(this.children, function (child) {
            child.cleanup();
        });
    },

    resumeSchedulerAndActions: function () {
        Scheduler.get('sharedScheduler').resumeTarget(this);
        ActionManager.get('sharedManager').resumeTarget(this);
    },
    pauseSchedulerAndActions: function () {
        Scheduler.get('sharedScheduler').pauseTarget(this);
        ActionManager.get('sharedManager').pauseTarget(this);
    },
    unscheduleAllSelectors: function () {
        Scheduler.get('sharedScheduler').unscheduleAllSelectorsForTarget(this);
    },
    stopAllActions: function () {
        ActionManager.get('sharedManager').removeAllActionsFromTarget(this);
    },

    visit: function (context, rect) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        // Adjust redraw region by nodes position
        if (rect) {
            var pos = this.get('position');
            rect = new geo.Rect(rect.origin.x - pos.x, rect.origin.y - pos.y, rect.size.width, rect.size.height);
        }

        // Draw background nodes
        util.each(this.children, function (child, i) {
            if (child.zOrder < 0) {
                child.visit(context, rect);
            }
        });

        this.draw(context, rect);

        // Draw foreground nodes
        util.each(this.children, function (child, i) {
            if (child.zOrder >= 0) {
                child.visit(context, rect);
            }
        });

        context.restore();
    },
    transform: function (context) {
        // Translate
        if (this.isRelativeAnchorPoint && (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels !== 0)) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }

        if (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels !== 0) {
            context.translate(Math.round(this.position.x + this.anchorPointInPixels.x), Math.round(this.position.y + this.anchorPointInPixels.y));
        } else {
            context.translate(Math.round(this.position.x), Math.round(this.position.y));
        }

        // Rotate
        context.rotate(geo.degreesToRadians(this.get('rotation')));

        // Scale
        context.scale(this.scaleX, this.scaleY);
 
        if (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels !== 0) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }
    },

    runAction: function (action) {
        ActionManager.get('sharedManager').addAction({action: action, target: this, paused: this.get('isRunning')});
    },

    nodeToParentTransform: function () {
        if (this.isTransformDirty) {
            this.transformMatrix = geo.affineTransformIdentity();

            if (!this.isRelativeAnchorPoint && !geo.pointEqualToPoint(this.anchorPointInPixels, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, this.anchorPointInPixels.x, this.anchorPointInPixels.y);
            }
            
            if (!geo.pointEqualToPoint(this.position, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, this.position.x, this.position.y);
            }

            if (this.rotation !== 0) {
                this.transformMatrix = geo.affineTransformRotate(this.transformMatrix, -geo.degreesToRadians(this.rotation));
            }
            if (!(this.scaleX == 1 && this.scaleY == 1)) {
                this.transformMatrix = geo.affineTransformScale(this.transformMatrix, this.scaleX, this.scaleY);
            }
            
            if (!geo.pointEqualToPoint(this.anchorPointInPixels, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, -this.anchorPointInPixels.x, -this.anchorPointInPixels.y);
            }
            
            this.set('isTransformDirty', false);
                
        }

        return this.transformMatrix;
    },

    parentToNodeTransform: function () {
        // TODO
    },

    nodeToWorldTransform: function () {
        var t = this.nodeToParentTransform();

        var p;
        for (p = this.get('parent'); p; p = p.get('parent')) {
            t = geo.affineTransformConcat(t, p.nodeToParentTransform());
        }

        return t;
    },

    worldToNodeTransform: function () {
        return geo.affineTransformInvert(this.nodeToWorldTransform());
    },

    convertToNodeSpace: function (worldPoint) {
        return geo.pointApplyAffineTransform(worldPoint, this.worldToNodeTransform());
    },

    /**
     * @getter boundingBox
     * @type geometry.Rect
     */
    get_boundingBox: function () {
        var cs = this.get('contentSize');
        var rect = geo.rectMake(0, 0, cs.width, cs.height);
        rect = geo.rectApplyAffineTransform(rect, this.nodeToParentTransform());
        return rect;
    },

    /**
     * @getter worldBoundingBox
     * @type geometry.Rect
     */
    get_worldBoundingBox: function () {
        var cs = this.get('contentSize');

        var rect = geo.rectMake(0, 0, cs.width, cs.height);
        rect = geo.rectApplyAffineTransform(rect, this.nodeToWorldTransform());
        return rect;
    },

    /**
     * The area of the node currently visible on screen. Returns an rect even
     * if visible is false.
     *
     * @getter visibleRect
     * @type geometry.Rect
     */
    get_visibleRect: function () {
        var s = require('../Director').Director.get('sharedDirector').get('winSize');
        var rect = new geo.Rect(
            0, 0,
            s.width, s.height
        );

        return geo.rectApplyAffineTransform(rect, this.worldToNodeTransform());
    },

    /**
     * @private
     */
    _dirtyTransform: function () {
        this.set('isTransformDirty', true);
    }
});

module.exports.Node = Node;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/RenderTexture.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    Node = require('./Node').Node,
    geo = require('geometry'),
    Sprite = require('./Sprite').Sprite,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    ccp = geo.ccp;

var RenderTexture = Node.extend(/** @lends cocos.nodes.RenderTexture# */{
    canvas: null,
    context: null,
    sprite: null,

    /** 
     * An in-memory canvas which can be drawn to in the background before drawing on screen
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {Integer} width The width of the canvas
     * @opt {Integer} height The height of the canvas
     */
    init: function (opts) {
        RenderTexture.superclass.init.call(this, opts);

        var width = opts.width,
            height = opts.height;

        evt.addListener(this, 'contentsize_changed', util.callback(this, this._resizeCanvas));

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        var atlas = TextureAtlas.create({canvas: this.canvas});
        this.sprite = Sprite.create({textureAtlas: atlas, rect: {origin: ccp(0, 0), size: {width: width, height: height}}});

        this.set('contentSize', geo.sizeMake(width, height));
        this.addChild(this.sprite);
        this.set('anchorPoint', ccp(0, 0));
        this.sprite.set('anchorPoint', ccp(0, 0));

    },

    /**
     * @private
     */
    _resizeCanvas: function () {
        var size = this.get('contentSize'),
            canvas = this.get('canvas');

        canvas.width  = size.width;
        canvas.height = size.height;
        if (FLIP_Y_AXIS) {
            this.context.scale(1, -1);
            this.context.translate(0, -canvas.height);
        }

        var s = this.get('sprite');
        if (s) {
            s.set('textureRect', {rect: geo.rectMake(0, 0, size.width, size.height)});
        }
    },

    /**
     * Clear the canvas
     */
    clear: function (rect) {
        if (rect) {
            this.context.clearRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
        } else {
            this.canvas.width = this.canvas.width;
            if (FLIP_Y_AXIS) {
                this.context.scale(1, -1);
                this.context.translate(0, -this.canvas.height);
            }
        }
    }
});

module.exports.RenderTexture = RenderTexture;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Scene.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Node = require('./Node').Node;

var Scene = Node.extend(/** @lends cocos.nodes.Scene */{
    /**
     * Everything in your view will be a child of this object. You need at least 1 scene per app.
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     */
    init: function () {
        Scene.superclass.init.call(this);
    }

});

module.exports.Scene = Scene;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Sprite.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    Director = require('../Director').Director,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    Node = require('./Node').Node,
    geo = require('geometry'),
    ccp = geo.ccp;

var Sprite = Node.extend(/** @lends cocos.nodes.Sprite# */{
    textureAtlas: null,
    rect: null,
    dirty: true,
    recursiveDirty: true,
    quad: null,
    flipX: false,
    flipY: false,
    offsetPosition: null,
    unflippedOffsetPositionFromCenter: null,
    untrimmedSize: null,

    /**
     * A small 2D graphics than can be animated
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} file Path to image to use as sprite atlas
     * @opt {Rect} [rect] The rect in the sprite atlas image file to use as the sprite
     */
    init: function (opts) {
        Sprite.superclass.init.call(this, opts);

        opts = opts || {};

        var file         = opts.file,
            textureAtlas = opts.textureAtlas,
            texture      = opts.texture,
            frame        = opts.frame,
            spritesheet  = opts.spritesheet,
            rect         = opts.rect;

        this.set('offsetPosition', ccp(0, 0));
        this.set('unflippedOffsetPositionFromCenter', ccp(0, 0));


        if (frame) {
            texture = frame.get('texture');
            rect    = frame.get('rect');
        }

        util.each(['scale', 'scaleX', 'scaleY', 'rect', 'flipX', 'flipY'], util.callback(this, function (key) {
            evt.addListener(this, key.toLowerCase() + '_changed', util.callback(this, this._updateQuad));
        }));
        evt.addListener(this, 'textureatlas_changed', util.callback(this, this._updateTextureQuad));

        if (file || texture) {
            textureAtlas = TextureAtlas.create({file: file, texture: texture});
        } else if (spritesheet) {
            textureAtlas = spritesheet.get('textureAtlas');
            this.set('useSpriteSheet', true);
        } else if (!textureAtlas) {
            //throw "Sprite has no texture";
        }

        if (!rect && textureAtlas) {
            rect = {origin: ccp(0, 0), size: {width: textureAtlas.texture.size.width, height: textureAtlas.texture.size.height}};
        }

        if (rect) {
            this.set('rect', rect);
            this.set('contentSize', rect.size);

            this.quad = {
                drawRect: {origin: ccp(0, 0), size: rect.size},
                textureRect: rect
            };
        }

        this.set('textureAtlas', textureAtlas);

        if (frame) {
            this.set('displayFrame', frame);
        }
    },

    /**
     * @private
     */
    _updateTextureQuad: function (obj, key, texture, oldTexture) {
        if (oldTexture) {
            oldTexture.removeQuad({quad: this.get('quad')});
        }

        if (texture) {
            texture.insertQuad({quad: this.get('quad')});
        }
    },

    /**
     * @setter textureCoords
     * @type geometry.Rect
     */
    set_textureCoords: function (rect) {
        var quad = this.get('quad');
        if (!quad) {
            quad = {
                drawRect: geo.rectMake(0, 0, 0, 0), 
                textureRect: geo.rectMake(0, 0, 0, 0)
            };
        }

        quad.textureRect = util.copy(rect);

        this.set('quad', quad);
    },

    /**
     * @setter textureRect
     * @type geometry.Rect
     */
    set_textureRect: function (opts) {
        var rect = opts.rect,
            rotated = !!opts.rotated,
            untrimmedSize = opts.untrimmedSize || rect.size;

        this.set('contentSize', untrimmedSize);
        this.set('rect', util.copy(rect));
        this.set('textureCoords', rect);

        var quad = this.get('quad');

        var relativeOffset = util.copy(this.get('unflippedOffsetPositionFromCenter'));

        if (this.get('flipX')) {
            relativeOffset.x = -relativeOffset.x;
        }
        if (this.get('flipY')) {
            relativeOffset.y = -relativeOffset.y;
        }

        var offsetPosition = this.get('offsetPosition');
        offsetPosition.x =  relativeOffset.x + (this.get('contentSize').width  - rect.size.width) / 2;
        offsetPosition.y = -relativeOffset.y + (this.get('contentSize').height - rect.size.height) / 2;

        quad.drawRect.origin = util.copy(offsetPosition);
        quad.drawRect.size = util.copy(rect.size);
        if (this.flipX) {
            quad.drawRect.size.width *= -1;
            quad.drawRect.origin.x = -rect.size.width;
        }
        if (this.flipY) {
            quad.drawRect.size.height *= -1;
            quad.drawRect.origin.y = -rect.size.height;
        }

        this.set('quad', quad);
    },

    /**
     * @private
     */
    _updateQuad: function () {
        if (!this.quad) {
            this.quad = {
                drawRect: geo.rectMake(0, 0, 0, 0), 
                textureRect: geo.rectMake(0, 0, 0, 0)
            };
        }

        var relativeOffset = util.copy(this.get('unflippedOffsetPositionFromCenter'));

        if (this.get('flipX')) {
            relativeOffset.x = -relativeOffset.x;
        }
        if (this.get('flipY')) {
            relativeOffset.y = -relativeOffset.y;
        }

        var offsetPosition = this.get('offsetPosition');
        offsetPosition.x = relativeOffset.x + (this.get('contentSize').width  - this.get('rect').size.width) / 2;
        offsetPosition.y = relativeOffset.y + (this.get('contentSize').height - this.get('rect').size.height) / 2;

        this.quad.textureRect = util.copy(this.rect);
        this.quad.drawRect.origin = util.copy(offsetPosition);
        this.quad.drawRect.size = util.copy(this.rect.size);

        if (this.flipX) {
            this.quad.drawRect.size.width *= -1;
            this.quad.drawRect.origin.x = -this.rect.size.width;
        }
        if (this.flipY) {
            this.quad.drawRect.size.height *= -1;
            this.quad.drawRect.origin.y = -this.rect.size.height;
        }
    },

    updateTransform: function (ctx) {
        if (!this.useSpriteSheet) {
            throw "updateTransform is only valid when Sprite is being rendered using a SpriteSheet";
        }

        if (!this.visible) {
            this.set('dirty', false);
            this.set('recursiveDirty', false);
            return;
        }

        // TextureAtlas has hard reference to this quad so we can just update it directly
        this.quad.drawRect.origin = {
            x: this.position.x - this.anchorPointInPixels.x * this.scaleX,
            y: this.position.y - this.anchorPointInPixels.y * this.scaleY
        };
        this.quad.drawRect.size = {
            width: this.rect.size.width * this.scaleX,
            height: this.rect.size.height * this.scaleY
        };

        this.set('dirty', false);
        this.set('recursiveDirty', false);
    },

    draw: function (ctx) {
        if (!this.quad) {
            return;
        }
        this.get('textureAtlas').drawQuad(ctx, this.quad);
    },

    isFrameDisplayed: function (frame) {
        if (!this.rect || !this.textureAtlas) {
            return false;
        }
        return (frame.texture === this.textureAtlas.texture && geo.rectEqualToRect(frame.rect, this.rect));
    },


    /**
     * @setter displayFrame
     * @type cocos.SpriteFrame
     */
    set_displayFrame: function (frame) {
        if (!frame) {
            delete this.quad;
            return;
        }
        this.set('unflippedOffsetPositionFromCenter', util.copy(frame.offset));


        // change texture
        if (!this.textureAtlas || frame.texture !== this.textureAtlas.texture) {
            this.set('textureAtlas', TextureAtlas.create({texture: frame.texture}));
        }

        this.set('textureRect', {rect: frame.rect, rotated: frame.rotated, untrimmedSize: frame.originalSize});
    }
});

module.exports.Sprite = Sprite;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/TMXLayer.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    SpriteBatchNode = require('./BatchNode').SpriteBatchNode,
    Sprite = require('./Sprite').Sprite,
    TMXOrientationOrtho = require('../TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('../TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('../TMXOrientation').TMXOrientationIso,
    geo    = require('geometry'),
    ccp    = geo.ccp,
    Node = require('./Node').Node;

var TMXLayer = SpriteBatchNode.extend(/** @lends cocos.nodes.TMXLayer# */{
    layerSize: null,
    layerName: '',
    tiles: null,
    tilset: null,
    layerOrientation: 0,
    mapTileSize: null,
    properties: null,

    /** 
     * A tile map layer loaded from a TMX file. This will probably automatically be made by cocos.TMXTiledMap
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.SpriteBatchNode
     *
     * @opt {cocos.TMXTilesetInfo} tilesetInfo
     * @opt {cocos.TMXLayerInfo} layerInfo
     * @opt {cocos.TMXMapInfo} mapInfo
     */
    init: function (opts) {
        var tilesetInfo = opts.tilesetInfo,
            layerInfo = opts.layerInfo,
            mapInfo = opts.mapInfo;

        var size = layerInfo.get('layerSize'),
            totalNumberOfTiles = size.width * size.height;

        var tex = null;
        if (tilesetInfo) {
            tex = tilesetInfo.sourceImage;
        }

        TMXLayer.superclass.init.call(this, {file: tex});

		this.set('anchorPoint', ccp(0, 0));

        this.layerName = layerInfo.get('name');
        this.layerSize = layerInfo.get('layerSize');
        this.tiles = layerInfo.get('tiles');
        this.minGID = layerInfo.get('minGID');
        this.maxGID = layerInfo.get('maxGID');
        this.opacity = layerInfo.get('opacity');
        this.properties = util.copy(layerInfo.properties);

        this.tileset = tilesetInfo;
        this.mapTileSize = mapInfo.get('tileSize');
        this.layerOrientation = mapInfo.get('orientation');

        var offset = this.calculateLayerOffset(layerInfo.get('offset'));
        this.set('position', offset);

        this.set('contentSize', geo.sizeMake(this.layerSize.width * this.mapTileSize.width, (this.layerSize.height * (this.mapTileSize.height - 1)) + this.tileset.tileSize.height));
    },

    calculateLayerOffset: function (pos) {
        var ret = ccp(0, 0);

        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            ret = ccp(pos.x * this.mapTileSize.width, pos.y * this.mapTileSize.height);
            break;
        case TMXOrientationIso:
            // TODO
            break;
        case TMXOrientationHex:
            // TODO
            break;
        }

        return ret;
    },

    setupTiles: function () {
        this.tileset.bindTo('imageSize', this.get('texture'), 'contentSize');


        for (var y = 0; y < this.layerSize.height; y++) {
            for (var x = 0; x < this.layerSize.width; x++) {
                
                var pos = x + this.layerSize.width * y,
                    gid = this.tiles[pos];
                
                if (gid !== 0) {
                    this.appendTile({gid: gid, position: ccp(x, y)});
                    
                    // Optimization: update min and max GID rendered by the layer
                    this.minGID = Math.min(gid, this.minGID);
                    this.maxGID = Math.max(gid, this.maxGID);
                }
            }
        }
    },
    appendTile: function (opts) {
        var gid = opts.gid,
            pos = opts.position;

        var z = pos.x + pos.y * this.layerSize.width;
            
        var rect = this.tileset.rectForGID(gid);
        var tile = Sprite.create({rect: rect, textureAtlas: this.textureAtlas});
        tile.set('position', this.positionAt(pos));
        tile.set('anchorPoint', ccp(0, 0));
        tile.set('opacity', this.get('opacity'));
        
        this.addChild({child: tile, z: 0, tag: z});
    },
    positionAt: function (pos) {
        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            return this.positionForOrthoAt(pos);
        case TMXOrientationIso:
            return this.positionForIsoAt(pos);
        /*
        case TMXOrientationHex:
            // TODO
        */
        default:
            return ccp(0, 0);
        }
    },
    positionForOrthoAt: function (pos) {
        var overlap = this.mapTileSize.height - this.tileset.tileSize.height;
        var x = Math.floor(pos.x * this.mapTileSize.width + 0.49);
        var y;
        if (FLIP_Y_AXIS) {
            y = Math.floor((this.get('layerSize').height - pos.y - 1) * this.mapTileSize.height + 0.49);
        } else {
            y = Math.floor(pos.y * this.mapTileSize.height + 0.49) + overlap;
        }
        return ccp(x, y);
    },

    positionForIsoAt: function (pos) {
        var mapTileSize = this.get('mapTileSize'),
            layerSize = this.get('layerSize');

        if (FLIP_Y_AXIS) {
            return ccp(
                mapTileSize.width  / 2 * (layerSize.width + pos.x - pos.y - 1),
                mapTileSize.height / 2 * ((layerSize.height * 2 - pos.x - pos.y) - 2)
            );
        } else {
            throw "Isometric tiles without FLIP_Y_AXIS is currently unsupported";
        }
    },


    tileGID: function (pos) {
        var tilesPerRow = this.get('layerSize').width,
            tilePos = pos.x + (pos.y * tilesPerRow);

        return this.tiles[tilePos];
    },
    removeTile: function (pos) {
        var gid = this.tileGID(pos);
        if (gid === 0) {
            // Tile is already blank
            return;
        }

        var tiles = this.get('tiles'),
            tilesPerRow = this.get('layerSize').width,
            tilePos = pos.x + (pos.y * tilesPerRow);


        tiles[tilePos] = 0;

        var sprite = this.getChild({tag: tilePos});
        if (sprite) {
            this.removeChild({child: sprite});
        }
    }
});

exports.TMXLayer = TMXLayer;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/TMXTiledMap.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp,
    Node = require('./Node').Node,
    TMXOrientationOrtho = require('../TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('../TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('../TMXOrientation').TMXOrientationIso,
    TMXLayer   = require('./TMXLayer').TMXLayer,
    TMXMapInfo = require('../TMXXMLParser').TMXMapInfo;

var TMXTiledMap = Node.extend(/** @lends cocos.nodes.TMXTiledMap# */{
    mapSize: null,
    tileSize: null,
    mapOrientation: 0,
    objectGroups: null,
    properties: null,
    tileProperties: null,

    /**
     * A TMX Map loaded from a .tmx file
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} file The file path of the TMX map to load
     */
    init: function (opts) {
        TMXTiledMap.superclass.init.call(this, opts);

        this.set('anchorPoint', ccp(0, 0));

        var mapInfo = TMXMapInfo.create(opts.file);

        this.mapSize        = mapInfo.get('mapSize');
        this.tileSize       = mapInfo.get('tileSize');
        this.mapOrientation = mapInfo.get('orientation');
        this.objectGroups   = mapInfo.get('objectGroups');
        this.properties     = mapInfo.get('properties');
        this.tileProperties = mapInfo.get('tileProperties');

        // Add layers to map
        var idx = 0;
        util.each(mapInfo.layers, util.callback(this, function (layerInfo) {
            if (layerInfo.get('visible')) {
                var child = this.parseLayer({layerInfo: layerInfo, mapInfo: mapInfo});
                this.addChild({child: child, z: idx, tag: idx});

                var childSize   = child.get('contentSize');
                var currentSize = this.get('contentSize');
                currentSize.width  = Math.max(currentSize.width,  childSize.width);
                currentSize.height = Math.max(currentSize.height, childSize.height);
                this.set('contentSize', currentSize);

                idx++;
            }
        }));
    },
    
    parseLayer: function (opts) {
        var tileset = this.tilesetForLayer(opts);
        var layer = TMXLayer.create({tilesetInfo: tileset, layerInfo: opts.layerInfo, mapInfo: opts.mapInfo});

        layer.setupTiles();

        return layer;
    },

    tilesetForLayer: function (opts) {
        var layerInfo = opts.layerInfo,
            mapInfo = opts.mapInfo,
            size = layerInfo.get('layerSize');

        // Reverse loop
        var tileset;
        for (var i = mapInfo.tilesets.length - 1; i >= 0; i--) {
            tileset = mapInfo.tilesets[i];

            for (var y = 0; y < size.height; y++) {
                for (var x = 0; x < size.width; x++) {
                    var pos = x + size.width * y, 
                        gid = layerInfo.tiles[pos];

                    if (gid !== 0 && gid >= tileset.firstGID) {
                        return tileset;
                    }
                } // for (var x
            } // for (var y
        } // for (var i

        //console.log("cocos2d: Warning: TMX Layer '%s' has no tiles", layerInfo.name);
        return tileset;
    },
    
    /**
     * Return the ObjectGroup for the secific group
     *
     * @opt {String} name The object group name
     * @returns {cocos.TMXObjectGroup} The object group
     */
    objectGroupNamed: function(opts) {
        var objectGroupName = opts.name,
            objectGroup = null;

        this.objectGroups.forEach(function(item) {

            if(item.name == objectGroupName) {
                objectGroup = item;
            }
        });
        if(objectGroup != null) {
            return objectGroup;
        }
    }
});

exports.TMXTiledMap = TMXTiledMap;


}};
__resources__["/__builtin__/libs/cocos2d/nodes/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'Node Layer Scene Label Sprite TMXTiledMap BatchNode RenderTexture Menu MenuItem'.w();

/** 
 * @memberOf cocos
 * @namespace All cocos2d nodes. i.e. anything that can be added to a Scene
 */
var nodes = {};

util.each(modules, function (mod, i) {
    util.extend(nodes, require('./' + mod));
});

module.exports = nodes;

}};
__resources__["/__builtin__/libs/geometry.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var RE_PAIR = /\{\s*([\d.\-]+)\s*,\s*([\d.\-]+)\s*\}/,
    RE_DOUBLE_PAIR = /\{\s*(\{[\s\d,.\-]+\})\s*,\s*(\{[\s\d,.\-]+\})\s*\}/;

/** @namespace */
var geometry = {
    /**
     * @class
     * A 2D point in space
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     */
    Point: function (x, y) {
        /**
         * X coordinate
         * @type Float
         */
        this.x = x;

        /**
         * Y coordinate
         * @type Float
         */
        this.y = y;
    },

    /**
     * @class
     * A 2D size
     *
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Size: function (w, h) {
        /**
         * Width
         * @type Float
         */
        this.width = w;

        /**
         * Height
         * @type Float
         */
        this.height = h;
    },

    /**
     * @class
     * A rectangle
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Rect: function (x, y, w, h) {
        /**
         * Coordinate in 2D space
         * @type {geometry.Point}
         */
        this.origin = new geometry.Point(x, y);

        /**
         * Size in 2D space
         * @type {geometry.Size}
         */
        this.size   = new geometry.Size(w, h);
    },

    /**
     * @class
     * Transform matrix
     *
     * @param {Float} a
     * @param {Float} b
     * @param {Float} c
     * @param {Float} d
     * @param {Float} tx
     * @param {Float} ty
     */
    TransformMatrix: function (a, b, c, d, tx, ty) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    },

    /**
     * Creates a geometry.Point instance
     *
     * @param {Float} x X coordinate
     * @param {Float} y Y coordinate
     * @returns {geometry.Point} 
     */
    ccp: function (x, y) {
        return module.exports.pointMake(x, y);
    },

    /**
     * Add the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpAdd: function (p1, p2) {
        return geometry.ccp(p1.x + p2.x, p1.y + p2.y);
    },

    /**
     * Subtract the values of two points
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpSub: function (p1, p2) {
        return geometry.ccp(p1.x - p2.x, p1.y - p2.y);
    },

    /**
     * Muliply the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpMult: function (p1, p2) {
        return geometry.ccp(p1.x * p2.x, p1.y * p2.y);
    },


    /**
     * Invert the values of a geometry.Point
     *
     * @param {geometry.Point} p Point to invert
     * @returns {geometry.Point} New point
     */
    ccpNeg: function (p) {
        return geometry.ccp(-p.x, -p.y);
    },

    /**
     * Round values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpRound: function (p) {
        return geometry.ccp(Math.round(p.x), Math.round(p.y));
    },

    /**
     * Round up values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpCeil: function (p) {
        return geometry.ccp(Math.ceil(p.x), Math.ceil(p.y));
    },

    /**
     * Round down values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpFloor: function (p) {
        return geometry.ccp(Math.floor(p.x), Math.floor(p.y));
    },

    /**
     * A point at 0x0
     *
     * @returns {geometry.Point} New point at 0x0
     */
    PointZero: function () {
        return geometry.ccp(0, 0);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectMake: function (x, y, w, h) {
        return new geometry.Rect(x, y, w, h);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectFromString: function (str) {
        var matches = str.match(RE_DOUBLE_PAIR),
            p = geometry.pointFromString(matches[1]),
            s = geometry.sizeFromString(matches[2]);

        return geometry.rectMake(p.x, p.y, s.width, s.height);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeMake: function (w, h) {
        return new geometry.Size(w, h);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeFromString: function (str) {
        var matches = str.match(RE_PAIR),
            w = parseFloat(matches[1]),
            h = parseFloat(matches[2]);

        return geometry.sizeMake(w, h);
    },

    /**
     * @returns {geometry.Point}
     */
    pointMake: function (x, y) {
        return new geometry.Point(x, y);
    },

    /**
     * @returns {geometry.Point}
     */
    pointFromString: function (str) {
        var matches = str.match(RE_PAIR),
            x = parseFloat(matches[1]),
            y = parseFloat(matches[2]);

        return geometry.pointMake(x, y);
    },

    /**
     * @returns {Boolean}
     */
    rectContainsPoint: function (r, p) {
        return ((p.x >= r.origin.x && p.x <= r.origin.x + r.size.width) &&
                (p.y >= r.origin.y && p.y <= r.origin.y + r.size.height));
    },

    /**
     * Returns the smallest rectangle that contains the two source rectangles.
     *
     * @param {geometry.Rect} r1
     * @param {geometry.Rect} r2
     * @returns {geometry.Rect}
     */
    rectUnion: function (r1, r2) {
        var rect = new geometry.Rect(0, 0, 0, 0);

        rect.origin.x = Math.min(r1.origin.x, r2.origin.x);
        rect.origin.y = Math.min(r1.origin.y, r2.origin.y);
        rect.size.width = Math.max(r1.origin.x + r1.size.width, r2.origin.x + r2.size.width) - rect.origin.x;
        rect.size.height = Math.max(r1.origin.y + r1.size.height, r2.origin.y + r2.size.height) - rect.origin.y;

        return rect;
    },

    /**
     * @returns {Boolean}
     */
    rectOverlapsRect: function (r1, r2) {
        if (r1.origin.x + r1.size.width < r2.origin.x) {
            return false;
        }
        if (r2.origin.x + r2.size.width < r1.origin.x) {
            return false;
        }
        if (r1.origin.y + r1.size.height < r2.origin.y) {
            return false;
        }
        if (r2.origin.y + r2.size.height < r1.origin.y) {
            return false;
        }

        return true;
    },

    /**
     * Returns the overlapping portion of 2 rectangles
     *
     * @param {geometry.Rect} lhsRect First rectangle
     * @param {geometry.Rect} rhsRect Second rectangle
     * @returns {geometry.Rect} The overlapping portion of the 2 rectangles
     */
    rectIntersection: function (lhsRect, rhsRect) {

        var intersection = new geometry.Rect(
            Math.max(geometry.rectGetMinX(lhsRect), geometry.rectGetMinX(rhsRect)),
            Math.max(geometry.rectGetMinY(lhsRect), geometry.rectGetMinY(rhsRect)),
            0,
            0
        );

        intersection.size.width = Math.min(geometry.rectGetMaxX(lhsRect), geometry.rectGetMaxX(rhsRect)) - geometry.rectGetMinX(intersection);
        intersection.size.height = Math.min(geometry.rectGetMaxY(lhsRect), geometry.rectGetMaxY(rhsRect)) - geometry.rectGetMinY(intersection);

        return intersection;
    },

    /**
     * @returns {Boolean}
     */
    pointEqualToPoint: function (point1, point2) {
        return (point1.x == point2.x && point1.y == point2.y);
    },

    /**
     * @returns {Boolean}
     */
    sizeEqualToSize: function (size1, size2) {
        return (size1.width == size2.width && size1.height == size2.height);
    },

    /**
     * @returns {Boolean}
     */
    rectEqualToRect: function (rect1, rect2) {
        return (module.exports.sizeEqualToSize(rect1.size, rect2.size) && module.exports.pointEqualToPoint(rect1.origin, rect2.origin));
    },

    /**
     * @returns {Float}
     */
    rectGetMinX: function (rect) {
        return rect.origin.x;
    },

    /**
     * @returns {Float}
     */
    rectGetMinY: function (rect) {
        return rect.origin.y;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxX: function (rect) {
        return rect.origin.x + rect.size.width;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxY: function (rect) {
        return rect.origin.y + rect.size.height;
    },

    boundingRectMake: function (p1, p2, p3, p4) {
        var minX = Math.min(p1.x, p2.x, p3.x, p4.x);
        var minY = Math.min(p1.y, p2.y, p3.y, p4.y);
        var maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
        var maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

        return new geometry.Rect(minX, minY, (maxX - minX), (maxY - minY));
    },

    /**
     * @returns {geometry.Point}
     */
    pointApplyAffineTransform: function (point, t) {

        /*
        aPoint.x * aTransform.a + aPoint.y * aTransform.c + aTransform.tx,
        aPoint.x * aTransform.b + aPoint.y * aTransform.d + aTransform.ty
        */

        return new geometry.Point(t.a * point.x + t.c * point.y + t.tx, t.b * point.x + t.d * point.y + t.ty);

    },

    /**
     * Apply a transform matrix to a rectangle
     *
     * @param {geometry.Rect} rect Rectangle to transform
     * @param {geometry.TransformMatrix} trans TransformMatrix to apply to rectangle
     * @returns {geometry.Rect} A new transformed rectangle
     */
    rectApplyAffineTransform: function (rect, trans) {

        var p1 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMinY(rect));
        var p2 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMinY(rect));
        var p3 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMaxY(rect));
        var p4 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMaxY(rect));

        p1 = geometry.pointApplyAffineTransform(p1, trans);
        p2 = geometry.pointApplyAffineTransform(p2, trans);
        p3 = geometry.pointApplyAffineTransform(p3, trans);
        p4 = geometry.pointApplyAffineTransform(p4, trans);

        return geometry.boundingRectMake(p1, p2, p3, p4);
    },

    /**
     * Inverts a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to invert
     * @returns {geometry.TransformMatrix} New transform matrix
     */
    affineTransformInvert: function (trans) {
        var determinant = 1 / (trans.a * trans.d - trans.b * trans.c);

        return new geometry.TransformMatrix(
            determinant * trans.d,
            -determinant * trans.b,
            -determinant * trans.c,
            determinant * trans.a,
            determinant * (trans.c * trans.ty - trans.d * trans.tx),
            determinant * (trans.b * trans.tx - trans.a * trans.ty)
        );
    },

    /**
     * Multiply 2 transform matrices together
     * @param {geometry.TransformMatrix} lhs Left matrix
     * @param {geometry.TransformMatrix} rhs Right matrix
     * @returns {geometry.TransformMatrix} New transform matrix
     */
    affineTransformConcat: function (lhs, rhs) {
        return new geometry.TransformMatrix(
            lhs.a * rhs.a + lhs.b * rhs.c,
            lhs.a * rhs.b + lhs.b * rhs.d,
            lhs.c * rhs.a + lhs.d * rhs.c,
            lhs.c * rhs.b + lhs.d * rhs.d,
            lhs.tx * rhs.a + lhs.ty * rhs.c + rhs.tx,
            lhs.tx * rhs.b + lhs.ty * rhs.d + rhs.ty
        );
    },

    /**
     * @returns {Float}
     */
    degreesToRadians: function (angle) {
        return angle / 180.0 * Math.PI;
    },

    /**
     * @returns {Float}
     */
    radiansToDegrees: function (angle) {
        return angle * (180.0 / Math.PI);
    },

    /**
     * Translate (move) a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to translate
     * @param {Float} tx Amount to translate along X axis
     * @param {Float} ty Amount to translate along Y axis
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformTranslate: function (trans, tx, ty) {
        var newTrans = util.copy(trans);
        newTrans.tx = trans.tx + trans.a * tx + trans.c * ty;
        newTrans.ty = trans.ty + trans.b * tx + trans.d * ty;
        return newTrans;
    },

    /**
     * Rotate a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to rotate
     * @param {Float} angle Angle in radians
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformRotate: function (trans, angle) {
        var sin = Math.sin(angle),
            cos = Math.cos(angle);

        return new geometry.TransformMatrix(
            trans.a * cos + trans.c * sin,
            trans.b * cos + trans.d * sin,
            trans.c * cos - trans.a * sin,
            trans.d * cos - trans.b * sin,
            trans.tx,
            trans.ty
        );
    },

    /**
     * Scale a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to scale
     * @param {Float} sx X scale factor
     * @param {Float} [sy=sx] Y scale factor
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformScale: function (trans, sx, sy) {
        if (sy === undefined) {
            sy = sx;
        }

        return new geometry.TransformMatrix(trans.a * sx, trans.b * sx, trans.c * sy, trans.d * sy, trans.tx, trans.ty);
    },

    /**
     * @returns {geometry.TransformMatrix} identity matrix
     */
    affineTransformIdentity: function () {
        return new geometry.TransformMatrix(1, 0, 0, 1, 0, 0);
    }
};

module.exports = geometry;

}};
__resources__["/__builtin__/libs/gzip.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * @fileoverview 
 */

/** @ignore */
var JXG = require('./JXGUtil');

/**
 * @namespace
 * Wrappers around JXG's GZip utils
 * @see JXG.Util
 */
var gzip = {
    /**
     * Unpack a gzipped byte array
     *
     * @param {Integer[]} input Byte array
     * @returns {String} Unpacked byte string
     */
    unzip: function(input) {
        return (new JXG.Util.Unzip(input)).unzip()[0][0];
    },

    /**
     * Unpack a gzipped byte string encoded as base64
     *
     * @param {String} input Byte string encoded as base64
     * @returns {String} Unpacked byte string
     */
    unzipBase64: function(input) {
        return (new JXG.Util.Unzip(JXG.Util.Base64.decodeAsArray(input))).unzip()[0][0];
    },

    /**
     * Unpack a gzipped byte string encoded as base64
     *
     * @param {String} input Byte string encoded as base64
     * @param {Integer} bytes Bytes per array item
     * @returns {Integer[]} Unpacked byte array
     */
    unzipBase64AsArray: function(input, bytes) {
        bytes = bytes || 1;

        var dec = this.unzipBase64(input),
            ar = [], i, j, len;
        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    },

    /**
     * Unpack a gzipped byte array
     *
     * @param {Integer[]} input Byte array
     * @param {Integer} bytes Bytes per array item
     * @returns {Integer[]} Unpacked byte array
     */
    unzipAsArray: function (input, bytes) {
        bytes = bytes || 1;

        var dec = this.unzip(input),
            ar = [], i, j, len;
        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    }

};

module.exports = gzip;

}};
__resources__["/__builtin__/libs/qunit.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*
 * QUnit - A JavaScript Unit Testing Framework
 * 
 * http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2011 John Resig, Jörn Zaefferer
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * or GPL (GPL-LICENSE.txt) licenses.
 */

(function(window) {

var defined = {
	setTimeout: typeof window.setTimeout !== "undefined",
	sessionStorage: (function() {
		try {
			return !!sessionStorage.getItem;
		} catch(e){
			return false;
		}
  })()
}

var testId = 0;

var Test = function(name, testName, expected, testEnvironmentArg, async, callback) {
	this.name = name;
	this.testName = testName;
	this.expected = expected;
	this.testEnvironmentArg = testEnvironmentArg;
	this.async = async;
	this.callback = callback;
	this.assertions = [];
};
Test.prototype = {
	init: function() {
		var tests = id("qunit-tests");
		if (tests) {
			var b = document.createElement("strong");
				b.innerHTML = "Running " + this.name;
			var li = document.createElement("li");
				li.appendChild( b );
				li.id = this.id = "test-output" + testId++;
			tests.appendChild( li );
		}
	},
	setup: function() {
		if (this.module != config.previousModule) {
			if ( config.previousModule ) {
				QUnit.moduleDone( {
					name: config.previousModule,
					failed: config.moduleStats.bad,
					passed: config.moduleStats.all - config.moduleStats.bad,
					total: config.moduleStats.all
				} );
			}
			config.previousModule = this.module;
			config.moduleStats = { all: 0, bad: 0 };
			QUnit.moduleStart( {
				name: this.module
			} );
		}

		config.current = this;
		this.testEnvironment = extend({
			setup: function() {},
			teardown: function() {}
		}, this.moduleTestEnvironment);
		if (this.testEnvironmentArg) {
			extend(this.testEnvironment, this.testEnvironmentArg);
		}

		QUnit.testStart( {
			name: this.testName
		} );

		// allow utility functions to access the current test environment
		// TODO why??
		QUnit.current_testEnvironment = this.testEnvironment;
		
		try {
			if ( !config.pollution ) {
				saveGlobal();
			}

			this.testEnvironment.setup.call(this.testEnvironment);
		} catch(e) {
			QUnit.ok( false, "Setup failed on " + this.testName + ": " + e.message );
		}
	},
	run: function() {
		if ( this.async ) {
			QUnit.stop();
		}

		if ( config.notrycatch ) {
			this.callback.call(this.testEnvironment);
			return;
		}
		try {
			this.callback.call(this.testEnvironment);
		} catch(e) {
			fail("Test " + this.testName + " died, exception and test follows", e, this.callback);
			QUnit.ok( false, "Died on test #" + (this.assertions.length + 1) + ": " + e.message + " - " + QUnit.jsDump.parse(e) );
			// else next test will carry the responsibility
			saveGlobal();

			// Restart the tests if they're blocking
			if ( config.blocking ) {
				start();
			}
		}
	},
	teardown: function() {
		try {
			checkPollution();
			this.testEnvironment.teardown.call(this.testEnvironment);
		} catch(e) {
			QUnit.ok( false, "Teardown failed on " + this.testName + ": " + e.message );
		}
	},
	finish: function() {
		if ( this.expected && this.expected != this.assertions.length ) {
			QUnit.ok( false, "Expected " + this.expected + " assertions, but " + this.assertions.length + " were run" );
		}
		
		var good = 0, bad = 0,
			tests = id("qunit-tests");

		config.stats.all += this.assertions.length;
		config.moduleStats.all += this.assertions.length;

		if ( tests ) {
			var ol  = document.createElement("ol");

			for ( var i = 0; i < this.assertions.length; i++ ) {
				var assertion = this.assertions[i];

				var li = document.createElement("li");
				li.className = assertion.result ? "pass" : "fail";
				li.innerHTML = assertion.message || (assertion.result ? "okay" : "failed");
				ol.appendChild( li );

				if ( assertion.result ) {
					good++;
				} else {
					bad++;
					config.stats.bad++;
					config.moduleStats.bad++;
				}
			}

			// store result when possible
			defined.sessionStorage && sessionStorage.setItem("qunit-" + this.testName, bad);

			if (bad == 0) {
				ol.style.display = "none";
			}

			var b = document.createElement("strong");
			b.innerHTML = this.name + " <b class='counts'>(<b class='failed'>" + bad + "</b>, <b class='passed'>" + good + "</b>, " + this.assertions.length + ")</b>";
			
			addEvent(b, "click", function() {
				var next = b.nextSibling, display = next.style.display;
				next.style.display = display === "none" ? "block" : "none";
			});
			
			addEvent(b, "dblclick", function(e) {
				var target = e && e.target ? e.target : window.event.srcElement;
				if ( target.nodeName.toLowerCase() == "span" || target.nodeName.toLowerCase() == "b" ) {
					target = target.parentNode;
				}
				if ( window.location && target.nodeName.toLowerCase() === "strong" ) {
					window.location.search = "?" + encodeURIComponent(getText([target]).replace(/\(.+\)$/, "").replace(/(^\s*|\s*$)/g, ""));
				}
			});

			var li = id(this.id);
			li.className = bad ? "fail" : "pass";
			li.style.display = resultDisplayStyle(!bad);
			li.removeChild( li.firstChild );
			li.appendChild( b );
			li.appendChild( ol );

		} else {
			for ( var i = 0; i < this.assertions.length; i++ ) {
				if ( !this.assertions[i].result ) {
					bad++;
					config.stats.bad++;
					config.moduleStats.bad++;
				}
			}
		}

		try {
			QUnit.reset();
		} catch(e) {
			fail("reset() failed, following Test " + this.testName + ", exception and reset fn follows", e, QUnit.reset);
		}

		QUnit.testDone( {
			name: this.testName,
			failed: bad,
			passed: this.assertions.length - bad,
			total: this.assertions.length
		} );
	},
	
	queue: function() {
		var test = this;
		synchronize(function() {
			test.init();
		});
		function run() {
			// each of these can by async
			synchronize(function() {
				test.setup();
			});
			synchronize(function() {
				test.run();
			});
			synchronize(function() {
				test.teardown();
			});
			synchronize(function() {
				test.finish();
			});
		}
		// defer when previous test run passed, if storage is available
		var bad = defined.sessionStorage && +sessionStorage.getItem("qunit-" + this.testName);
		if (bad) {
			run();
		} else {
			synchronize(run);
		};
	}
	
}

var QUnit = {

	// call on start of module test to prepend name to all tests
	module: function(name, testEnvironment) {
		config.currentModule = name;
		config.currentModuleTestEnviroment = testEnvironment;
	},

	asyncTest: function(testName, expected, callback) {
		if ( arguments.length === 2 ) {
			callback = expected;
			expected = 0;
		}

		QUnit.test(testName, expected, callback, true);
	},
	
	test: function(testName, expected, callback, async) {
		var name = '<span class="test-name">' + testName + '</span>', testEnvironmentArg;

		if ( arguments.length === 2 ) {
			callback = expected;
			expected = null;
		}
		// is 2nd argument a testEnvironment?
		if ( expected && typeof expected === 'object') {
			testEnvironmentArg =  expected;
			expected = null;
		}

		if ( config.currentModule ) {
			name = '<span class="module-name">' + config.currentModule + "</span>: " + name;
		}

		if ( !validTest(config.currentModule + ": " + testName) ) {
			return;
		}
		
		var test = new Test(name, testName, expected, testEnvironmentArg, async, callback);
		test.module = config.currentModule;
		test.moduleTestEnvironment = config.currentModuleTestEnviroment;
		test.queue();
	},
	
	/**
	 * Specify the number of expected assertions to gurantee that failed test (no assertions are run at all) don't slip through.
	 */
	expect: function(asserts) {
		config.current.expected = asserts;
	},

	/**
	 * Asserts true.
	 * @example ok( "asdfasdf".length > 5, "There must be at least 5 chars" );
	 */
	ok: function(a, msg) {
		a = !!a;
		var details = {
			result: a,
			message: msg
		};
		msg = escapeHtml(msg);
		QUnit.log(details);
		config.current.assertions.push({
			result: a,
			message: msg
		});
	},

	/**
	 * Checks that the first two arguments are equal, with an optional message.
	 * Prints out both actual and expected values.
	 *
	 * Prefered to ok( actual == expected, message )
	 *
	 * @example equal( format("Received {0} bytes.", 2), "Received 2 bytes." );
	 *
	 * @param Object actual
	 * @param Object expected
	 * @param String message (optional)
	 */
	equal: function(actual, expected, message) {
		QUnit.push(expected == actual, actual, expected, message);
	},

	notEqual: function(actual, expected, message) {
		QUnit.push(expected != actual, actual, expected, message);
	},
	
	deepEqual: function(actual, expected, message) {
		QUnit.push(QUnit.equiv(actual, expected), actual, expected, message);
	},

	notDeepEqual: function(actual, expected, message) {
		QUnit.push(!QUnit.equiv(actual, expected), actual, expected, message);
	},

	strictEqual: function(actual, expected, message) {
		QUnit.push(expected === actual, actual, expected, message);
	},

	notStrictEqual: function(actual, expected, message) {
		QUnit.push(expected !== actual, actual, expected, message);
	},

	raises: function(block, expected, message) {
		var actual, ok = false;
	
		if (typeof expected === 'string') {
			message = expected;
			expected = null;
		}
	
		try {
			block();
		} catch (e) {
			actual = e;
		}
	
		if (actual) {
			// we don't want to validate thrown error
			if (!expected) {
				ok = true;
			// expected is a regexp	
			} else if (QUnit.objectType(expected) === "regexp") {
				ok = expected.test(actual);
			// expected is a constructor	
			} else if (actual instanceof expected) {
				ok = true;
			// expected is a validation function which returns true is validation passed	
			} else if (expected.call({}, actual) === true) {
				ok = true;
			}
		}
			
		QUnit.ok(ok, message);
	},

	start: function() {
		config.semaphore--;
		if (config.semaphore > 0) {
			// don't start until equal number of stop-calls
			return;
		}
		if (config.semaphore < 0) {
			// ignore if start is called more often then stop
			config.semaphore = 0;
		}
		// A slight delay, to avoid any current callbacks
		if ( defined.setTimeout ) {
			window.setTimeout(function() {
				if ( config.timeout ) {
					clearTimeout(config.timeout);
				}

				config.blocking = false;
				process();
			}, 13);
		} else {
			config.blocking = false;
			process();
		}
	},
	
	stop: function(timeout) {
		config.semaphore++;
		config.blocking = true;

		if ( timeout && defined.setTimeout ) {
			clearTimeout(config.timeout);
			config.timeout = window.setTimeout(function() {
				QUnit.ok( false, "Test timed out" );
				QUnit.start();
			}, timeout);
		}
	}

};

// Backwards compatibility, deprecated
QUnit.equals = QUnit.equal;
QUnit.same = QUnit.deepEqual;

// Maintain internal state
var config = {
	// The queue of tests to run
	queue: [],

	// block until document ready
	blocking: true
};

// Load paramaters
(function() {
	var location = window.location || { search: "", protocol: "file:" },
		GETParams = location.search.slice(1).split('&');

	for ( var i = 0; i < GETParams.length; i++ ) {
		GETParams[i] = decodeURIComponent( GETParams[i] );
		if ( GETParams[i] === "noglobals" ) {
			GETParams.splice( i, 1 );
			i--;
			config.noglobals = true;
		} else if ( GETParams[i] === "notrycatch" ) {
			GETParams.splice( i, 1 );
			i--;
			config.notrycatch = true;
		} else if ( GETParams[i].search('=') > -1 ) {
			GETParams.splice( i, 1 );
			i--;
		}
	}
	
	// restrict modules/tests by get parameters
	config.filters = GETParams;
	
	// Figure out if we're running the tests from a server or not
	QUnit.isLocal = !!(location.protocol === 'file:');
})();

// Expose the API as global variables, unless an 'exports'
// object exists, in that case we assume we're in CommonJS
if ( typeof exports === "undefined" || typeof require === "undefined" ) {
	extend(window, QUnit);
	window.QUnit = QUnit;
} else {
	extend(exports, QUnit);
	exports.QUnit = QUnit;
}

// define these after exposing globals to keep them in these QUnit namespace only
extend(QUnit, {
	config: config,

	// Initialize the configuration options
	init: function() {
		extend(config, {
			stats: { all: 0, bad: 0 },
			moduleStats: { all: 0, bad: 0 },
			started: +new Date,
			updateRate: 1000,
			blocking: false,
			autostart: true,
			autorun: false,
			filters: [],
			queue: [],
			semaphore: 0
		});

		var tests = id("qunit-tests"),
			banner = id("qunit-banner"),
			result = id("qunit-testresult");

		if ( tests ) {
			tests.innerHTML = "";
		}

		if ( banner ) {
			banner.className = "";
		}

		if ( result ) {
			result.parentNode.removeChild( result );
		}
	},
	
	/**
	 * Resets the test setup. Useful for tests that modify the DOM.
	 * 
	 * If jQuery is available, uses jQuery's html(), otherwise just innerHTML.
	 */
	reset: function() {
		if ( window.jQuery ) {
			jQuery( "#main, #qunit-fixture" ).html( config.fixture );
		} else {
			var main = id( 'main' ) || id( 'qunit-fixture' );
			if ( main ) {
				main.innerHTML = config.fixture;
			}
		}
	},
	
	/**
	 * Trigger an event on an element.
	 *
	 * @example triggerEvent( document.body, "click" );
	 *
	 * @param DOMElement elem
	 * @param String type
	 */
	triggerEvent: function( elem, type, event ) {
		if ( document.createEvent ) {
			event = document.createEvent("MouseEvents");
			event.initMouseEvent(type, true, true, elem.ownerDocument.defaultView,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
			elem.dispatchEvent( event );

		} else if ( elem.fireEvent ) {
			elem.fireEvent("on"+type);
		}
	},
	
	// Safe object type checking
	is: function( type, obj ) {
		return QUnit.objectType( obj ) == type;
	},
	
	objectType: function( obj ) {
		if (typeof obj === "undefined") {
				return "undefined";

		// consider: typeof null === object
		}
		if (obj === null) {
				return "null";
		}

		var type = Object.prototype.toString.call( obj )
			.match(/^\[object\s(.*)\]$/)[1] || '';

		switch (type) {
				case 'Number':
						if (isNaN(obj)) {
								return "nan";
						} else {
								return "number";
						}
				case 'String':
				case 'Boolean':
				case 'Array':
				case 'Date':
				case 'RegExp':
				case 'Function':
						return type.toLowerCase();
		}
		if (typeof obj === "object") {
				return "object";
		}
		return undefined;
	},
	
	push: function(result, actual, expected, message) {
		var details = {
			result: result,
			message: message,
			actual: actual,
			expected: expected
		};
		
		message = escapeHtml(message) || (result ? "okay" : "failed");
		message = '<span class="test-message">' + message + "</span>";
		expected = escapeHtml(QUnit.jsDump.parse(expected));
		actual = escapeHtml(QUnit.jsDump.parse(actual));
		var output = message + '<table><tr class="test-expected"><th>Expected: </th><td><pre>' + expected + '</pre></td></tr>';
		if (actual != expected) {
			output += '<tr class="test-actual"><th>Result: </th><td><pre>' + actual + '</pre></td></tr>';
			output += '<tr class="test-diff"><th>Diff: </th><td><pre>' + QUnit.diff(expected, actual) +'</pre></td></tr>';
		}
		if (!result) {
			var source = sourceFromStacktrace();
			if (source) {
				details.source = source;
				output += '<tr class="test-source"><th>Source: </th><td><pre>' + source +'</pre></td></tr>';
			}
		}
		output += "</table>";
		
		QUnit.log(details);
		
		config.current.assertions.push({
			result: !!result,
			message: output
		});
	},
	
	// Logging callbacks; all receive a single argument with the listed properties
	// run test/logs.html for any related changes
	begin: function() {},
	// done: { failed, passed, total, runtime }
	done: function() {},
	// log: { result, actual, expected, message }
	log: function() {},
	// testStart: { name }
	testStart: function() {},
	// testDone: { name, failed, passed, total }
	testDone: function() {},
	// moduleStart: { name }
	moduleStart: function() {},
	// moduleDone: { name, failed, passed, total }
	moduleDone: function() {}
});

if ( typeof document === "undefined" || document.readyState === "complete" ) {
	config.autorun = true;
}

addEvent(window, "load", function() {
	QUnit.begin({});
	
	// Initialize the config, saving the execution queue
	var oldconfig = extend({}, config);
	QUnit.init();
	extend(config, oldconfig);

	config.blocking = false;

	var userAgent = id("qunit-userAgent");
	if ( userAgent ) {
		userAgent.innerHTML = navigator.userAgent;
	}
	var banner = id("qunit-header");
	if ( banner ) {
		var paramsIndex = location.href.lastIndexOf(location.search);
		if ( paramsIndex > -1 ) {
			var mainPageLocation = location.href.slice(0, paramsIndex);
			if ( mainPageLocation == location.href ) {
				banner.innerHTML = '<a href=""> ' + banner.innerHTML + '</a> ';
			} else {
				var testName = decodeURIComponent(location.search.slice(1));
				banner.innerHTML = '<a href="' + mainPageLocation + '">' + banner.innerHTML + '</a> &#8250; <a href="">' + testName + '</a>';
			}
		}
	}
	
	var toolbar = id("qunit-testrunner-toolbar");
	if ( toolbar ) {
		var filter = document.createElement("input");
		filter.type = "checkbox";
		filter.id = "qunit-filter-pass";
		addEvent( filter, "click", function() {
			var li = document.getElementsByTagName("li");
			for ( var i = 0; i < li.length; i++ ) {
				if ( li[i].className.indexOf("pass") > -1 ) {
					li[i].style.display = filter.checked ? "none" : "";
				}
			}
			if ( defined.sessionStorage ) {
				sessionStorage.setItem("qunit-filter-passed-tests", filter.checked ? "true" : "");
			}
		});
		if ( defined.sessionStorage && sessionStorage.getItem("qunit-filter-passed-tests") ) {
			filter.checked = true;
		}
		toolbar.appendChild( filter );

		var label = document.createElement("label");
		label.setAttribute("for", "qunit-filter-pass");
		label.innerHTML = "Hide passed tests";
		toolbar.appendChild( label );
	}

	var main = id('main') || id('qunit-fixture');
	if ( main ) {
		config.fixture = main.innerHTML;
	}

	if (config.autostart) {
		QUnit.start();
	}
});

function done() {
	config.autorun = true;

	// Log the last module results
	if ( config.currentModule ) {
		QUnit.moduleDone( {
			name: config.currentModule,
			failed: config.moduleStats.bad,
			passed: config.moduleStats.all - config.moduleStats.bad,
			total: config.moduleStats.all
		} );
	}

	var banner = id("qunit-banner"),
		tests = id("qunit-tests"),
		runtime = +new Date - config.started,
		passed = config.stats.all - config.stats.bad,
		html = [
			'Tests completed in ',
			runtime,
			' milliseconds.<br/>',
			'<span class="passed">',
			passed,
			'</span> tests of <span class="total">',
			config.stats.all,
			'</span> passed, <span class="failed">',
			config.stats.bad,
			'</span> failed.'
		].join('');

	if ( banner ) {
		banner.className = (config.stats.bad ? "qunit-fail" : "qunit-pass");
	}

	if ( tests ) {	
		var result = id("qunit-testresult");

		if ( !result ) {
			result = document.createElement("p");
			result.id = "qunit-testresult";
			result.className = "result";
			tests.parentNode.insertBefore( result, tests.nextSibling );
		}

		result.innerHTML = html;
	}

	QUnit.done( {
		failed: config.stats.bad,
		passed: passed, 
		total: config.stats.all,
		runtime: runtime
	} );
}

function validTest( name ) {
	var i = config.filters.length,
		run = false;

	if ( !i ) {
		return true;
	}
	
	while ( i-- ) {
		var filter = config.filters[i],
			not = filter.charAt(0) == '!';

		if ( not ) {
			filter = filter.slice(1);
		}

		if ( name.indexOf(filter) !== -1 ) {
			return !not;
		}

		if ( not ) {
			run = true;
		}
	}

	return run;
}

// so far supports only Firefox, Chrome and Opera (buggy)
// could be extended in the future to use something like https://github.com/csnover/TraceKit
function sourceFromStacktrace() {
	try {
		throw new Error();
	} catch ( e ) {
		if (e.stacktrace) {
			// Opera
			return e.stacktrace.split("\n")[6];
		} else if (e.stack) {
			// Firefox, Chrome
			return e.stack.split("\n")[4];
		}
	}
}

function resultDisplayStyle(passed) {
	return passed && id("qunit-filter-pass") && id("qunit-filter-pass").checked ? 'none' : '';
}

function escapeHtml(s) {
	if (!s) {
		return "";
	}
	s = s + "";
	return s.replace(/[\&"<>\\]/g, function(s) {
		switch(s) {
			case "&": return "&amp;";
			case "\\": return "\\\\";
			case '"': return '\"';
			case "<": return "&lt;";
			case ">": return "&gt;";
			default: return s;
		}
	});
}

function synchronize( callback ) {
	config.queue.push( callback );

	if ( config.autorun && !config.blocking ) {
		process();
	}
}

function process() {
	var start = (new Date()).getTime();

	while ( config.queue.length && !config.blocking ) {
		if ( config.updateRate <= 0 || (((new Date()).getTime() - start) < config.updateRate) ) {
			config.queue.shift()();
		} else {
			window.setTimeout( process, 13 );
			break;
		}
	}
  if (!config.blocking && !config.queue.length) {
    done();
  }
}

function saveGlobal() {
	config.pollution = [];
	
	if ( config.noglobals ) {
		for ( var key in window ) {
			config.pollution.push( key );
		}
	}
}

function checkPollution( name ) {
	var old = config.pollution;
	saveGlobal();
	
	var newGlobals = diff( old, config.pollution );
	if ( newGlobals.length > 0 ) {
		ok( false, "Introduced global variable(s): " + newGlobals.join(", ") );
		config.current.expected++;
	}

	var deletedGlobals = diff( config.pollution, old );
	if ( deletedGlobals.length > 0 ) {
		ok( false, "Deleted global variable(s): " + deletedGlobals.join(", ") );
		config.current.expected++;
	}
}

// returns a new Array with the elements that are in a but not in b
function diff( a, b ) {
	var result = a.slice();
	for ( var i = 0; i < result.length; i++ ) {
		for ( var j = 0; j < b.length; j++ ) {
			if ( result[i] === b[j] ) {
				result.splice(i, 1);
				i--;
				break;
			}
		}
	}
	return result;
}

function fail(message, exception, callback) {
	if ( typeof console !== "undefined" && console.error && console.warn ) {
		console.error(message);
		console.error(exception);
		console.warn(callback.toString());

	} else if ( window.opera && opera.postError ) {
		opera.postError(message, exception, callback.toString);
	}
}

function extend(a, b) {
	for ( var prop in b ) {
		a[prop] = b[prop];
	}

	return a;
}

function addEvent(elem, type, fn) {
	if ( elem.addEventListener ) {
		elem.addEventListener( type, fn, false );
	} else if ( elem.attachEvent ) {
		elem.attachEvent( "on" + type, fn );
	} else {
		fn();
	}
}

function id(name) {
	return !!(typeof document !== "undefined" && document && document.getElementById) &&
		document.getElementById( name );
}

// Test for equality any JavaScript type.
// Discussions and reference: http://philrathe.com/articles/equiv
// Test suites: http://philrathe.com/tests/equiv
// Author: Philippe Rathé <prathe@gmail.com>
QUnit.equiv = function () {

    var innerEquiv; // the real equiv function
    var callers = []; // stack to decide between skip/abort functions
    var parents = []; // stack to avoiding loops from circular referencing

    // Call the o related callback with the given arguments.
    function bindCallbacks(o, callbacks, args) {
        var prop = QUnit.objectType(o);
        if (prop) {
            if (QUnit.objectType(callbacks[prop]) === "function") {
                return callbacks[prop].apply(callbacks, args);
            } else {
                return callbacks[prop]; // or undefined
            }
        }
    }
    
    var callbacks = function () {

        // for string, boolean, number and null
        function useStrictEquality(b, a) {
            if (b instanceof a.constructor || a instanceof b.constructor) {
                // to catch short annotaion VS 'new' annotation of a declaration
                // e.g. var i = 1;
                //      var j = new Number(1);
                return a == b;
            } else {
                return a === b;
            }
        }

        return {
            "string": useStrictEquality,
            "boolean": useStrictEquality,
            "number": useStrictEquality,
            "null": useStrictEquality,
            "undefined": useStrictEquality,

            "nan": function (b) {
                return isNaN(b);
            },

            "date": function (b, a) {
                return QUnit.objectType(b) === "date" && a.valueOf() === b.valueOf();
            },

            "regexp": function (b, a) {
                return QUnit.objectType(b) === "regexp" &&
                    a.source === b.source && // the regex itself
                    a.global === b.global && // and its modifers (gmi) ...
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
            },

            // - skip when the property is a method of an instance (OOP)
            // - abort otherwise,
            //   initial === would have catch identical references anyway
            "function": function () {
                var caller = callers[callers.length - 1];
                return caller !== Object &&
                        typeof caller !== "undefined";
            },

            "array": function (b, a) {
                var i, j, loop;
                var len;

                // b could be an object literal here
                if ( ! (QUnit.objectType(b) === "array")) {
                    return false;
                }   
                
                len = a.length;
                if (len !== b.length) { // safe and faster
                    return false;
                }
                
                //track reference to avoid circular references
                parents.push(a);
                for (i = 0; i < len; i++) {
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i]){
                            loop = true;//dont rewalk array
                        }
                    }
                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        parents.pop();
                        return false;
                    }
                }
                parents.pop();
                return true;
            },

            "object": function (b, a) {
                var i, j, loop;
                var eq = true; // unless we can proove it
                var aProperties = [], bProperties = []; // collection of strings

                // comparing constructors is more strict than using instanceof
                if ( a.constructor !== b.constructor) {
                    return false;
                }

                // stack constructor before traversing properties
                callers.push(a.constructor);
                //track reference to avoid circular references
                parents.push(a);
                
                for (i in a) { // be strict: don't ensures hasOwnProperty and go deep
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i])
                            loop = true; //don't go down the same path twice
                    }
                    aProperties.push(i); // collect a's properties

                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        eq = false;
                        break;
                    }
                }

                callers.pop(); // unstack, we are done
                parents.pop();

                for (i in b) {
                    bProperties.push(i); // collect b's properties
                }

                // Ensures identical properties name
                return eq && innerEquiv(aProperties.sort(), bProperties.sort());
            }
        };
    }();

    innerEquiv = function () { // can take multiple arguments
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) {
            return true; // end transition
        }

        return (function (a, b) {
            if (a === b) {
                return true; // catch the most you can
            } else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || QUnit.objectType(a) !== QUnit.objectType(b)) {
                return false; // don't lose time with error prone cases
            } else {
                return bindCallbacks(a, callbacks, [b, a]);
            }

        // apply transition with (1..n) arguments
        })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
    };

    return innerEquiv;

}();

/**
 * jsDump
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 5/15/2008
 * @projectDescription Advanced and extensible data dumping for Javascript.
 * @version 1.0.0
 * @author Ariel Flesler
 * @link {http://flesler.blogspot.com/2008/05/jsdump-pretty-dump-of-any-javascript.html}
 */
QUnit.jsDump = (function() {
	function quote( str ) {
		return '"' + str.toString().replace(/"/g, '\\"') + '"';
	};
	function literal( o ) {
		return o + '';	
	};
	function join( pre, arr, post ) {
		var s = jsDump.separator(),
			base = jsDump.indent(),
			inner = jsDump.indent(1);
		if ( arr.join )
			arr = arr.join( ',' + s + inner );
		if ( !arr )
			return pre + post;
		return [ pre, inner + arr, base + post ].join(s);
	};
	function array( arr ) {
		var i = arr.length,	ret = Array(i);					
		this.up();
		while ( i-- )
			ret[i] = this.parse( arr[i] );				
		this.down();
		return join( '[', ret, ']' );
	};
	
	var reName = /^function (\w+)/;
	
	var jsDump = {
		parse:function( obj, type ) { //type is used mostly internally, you can fix a (custom)type in advance
			var	parser = this.parsers[ type || this.typeOf(obj) ];
			type = typeof parser;			
			
			return type == 'function' ? parser.call( this, obj ) :
				   type == 'string' ? parser :
				   this.parsers.error;
		},
		typeOf:function( obj ) {
			var type;
			if ( obj === null ) {
				type = "null";
			} else if (typeof obj === "undefined") {
				type = "undefined";
			} else if (QUnit.is("RegExp", obj)) {
				type = "regexp";
			} else if (QUnit.is("Date", obj)) {
				type = "date";
			} else if (QUnit.is("Function", obj)) {
				type = "function";
			} else if (typeof obj.setInterval !== undefined && typeof obj.document !== "undefined" && typeof obj.nodeType === "undefined") {
				type = "window";
			} else if (obj.nodeType === 9) {
				type = "document";
			} else if (obj.nodeType) {
				type = "node";
			} else if (typeof obj === "object" && typeof obj.length === "number" && obj.length >= 0) {
				type = "array";
			} else {
				type = typeof obj;
			}
			return type;
		},
		separator:function() {
			return this.multiline ?	this.HTML ? '<br />' : '\n' : this.HTML ? '&nbsp;' : ' ';
		},
		indent:function( extra ) {// extra can be a number, shortcut for increasing-calling-decreasing
			if ( !this.multiline )
				return '';
			var chr = this.indentChar;
			if ( this.HTML )
				chr = chr.replace(/\t/g,'   ').replace(/ /g,'&nbsp;');
			return Array( this._depth_ + (extra||0) ).join(chr);
		},
		up:function( a ) {
			this._depth_ += a || 1;
		},
		down:function( a ) {
			this._depth_ -= a || 1;
		},
		setParser:function( name, parser ) {
			this.parsers[name] = parser;
		},
		// The next 3 are exposed so you can use them
		quote:quote, 
		literal:literal,
		join:join,
		//
		_depth_: 1,
		// This is the list of parsers, to modify them, use jsDump.setParser
		parsers:{
			window: '[Window]',
			document: '[Document]',
			error:'[ERROR]', //when no parser is found, shouldn't happen
			unknown: '[Unknown]',
			'null':'null',
			undefined:'undefined',
			'function':function( fn ) {
				var ret = 'function',
					name = 'name' in fn ? fn.name : (reName.exec(fn)||[])[1];//functions never have name in IE
				if ( name )
					ret += ' ' + name;
				ret += '(';
				
				ret = [ ret, QUnit.jsDump.parse( fn, 'functionArgs' ), '){'].join('');
				return join( ret, QUnit.jsDump.parse(fn,'functionCode'), '}' );
			},
			array: array,
			nodelist: array,
			arguments: array,
			object:function( map ) {
				var ret = [ ];
				QUnit.jsDump.up();
				for ( var key in map )
					ret.push( QUnit.jsDump.parse(key,'key') + ': ' + QUnit.jsDump.parse(map[key]) );
				QUnit.jsDump.down();
				return join( '{', ret, '}' );
			},
			node:function( node ) {
				var open = QUnit.jsDump.HTML ? '&lt;' : '<',
					close = QUnit.jsDump.HTML ? '&gt;' : '>';
					
				var tag = node.nodeName.toLowerCase(),
					ret = open + tag;
					
				for ( var a in QUnit.jsDump.DOMAttrs ) {
					var val = node[QUnit.jsDump.DOMAttrs[a]];
					if ( val )
						ret += ' ' + a + '=' + QUnit.jsDump.parse( val, 'attribute' );
				}
				return ret + close + open + '/' + tag + close;
			},
			functionArgs:function( fn ) {//function calls it internally, it's the arguments part of the function
				var l = fn.length;
				if ( !l ) return '';				
				
				var args = Array(l);
				while ( l-- )
					args[l] = String.fromCharCode(97+l);//97 is 'a'
				return ' ' + args.join(', ') + ' ';
			},
			key:quote, //object calls it internally, the key part of an item in a map
			functionCode:'[code]', //function calls it internally, it's the content of the function
			attribute:quote, //node calls it internally, it's an html attribute value
			string:quote,
			date:quote,
			regexp:literal, //regex
			number:literal,
			'boolean':literal
		},
		DOMAttrs:{//attributes to dump from nodes, name=>realName
			id:'id',
			name:'name',
			'class':'className'
		},
		HTML:false,//if true, entities are escaped ( <, >, \t, space and \n )
		indentChar:'  ',//indentation unit
		multiline:true //if true, items in a collection, are separated by a \n, else just a space.
	};

	return jsDump;
})();

// from Sizzle.js
function getText( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += getText( elem.childNodes );
		}
	}

	return ret;
};

/*
 * Javascript Diff Algorithm
 *  By John Resig (http://ejohn.org/)
 *  Modified by Chu Alan "sprite"
 *
 * Released under the MIT license.
 *
 * More Info:
 *  http://ejohn.org/projects/javascript-diff-algorithm/
 *  
 * Usage: QUnit.diff(expected, actual)
 * 
 * QUnit.diff("the quick brown fox jumped over", "the quick fox jumps over") == "the  quick <del>brown </del> fox <del>jumped </del><ins>jumps </ins> over"
 */
QUnit.diff = (function() {
	function diff(o, n){
		var ns = new Object();
		var os = new Object();
		
		for (var i = 0; i < n.length; i++) {
			if (ns[n[i]] == null) 
				ns[n[i]] = {
					rows: new Array(),
					o: null
				};
			ns[n[i]].rows.push(i);
		}
		
		for (var i = 0; i < o.length; i++) {
			if (os[o[i]] == null) 
				os[o[i]] = {
					rows: new Array(),
					n: null
				};
			os[o[i]].rows.push(i);
		}
		
		for (var i in ns) {
			if (ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1) {
				n[ns[i].rows[0]] = {
					text: n[ns[i].rows[0]],
					row: os[i].rows[0]
				};
				o[os[i].rows[0]] = {
					text: o[os[i].rows[0]],
					row: ns[i].rows[0]
				};
			}
		}
		
		for (var i = 0; i < n.length - 1; i++) {
			if (n[i].text != null && n[i + 1].text == null && n[i].row + 1 < o.length && o[n[i].row + 1].text == null &&
			n[i + 1] == o[n[i].row + 1]) {
				n[i + 1] = {
					text: n[i + 1],
					row: n[i].row + 1
				};
				o[n[i].row + 1] = {
					text: o[n[i].row + 1],
					row: i + 1
				};
			}
		}
		
		for (var i = n.length - 1; i > 0; i--) {
			if (n[i].text != null && n[i - 1].text == null && n[i].row > 0 && o[n[i].row - 1].text == null &&
			n[i - 1] == o[n[i].row - 1]) {
				n[i - 1] = {
					text: n[i - 1],
					row: n[i].row - 1
				};
				o[n[i].row - 1] = {
					text: o[n[i].row - 1],
					row: i - 1
				};
			}
		}
		
		return {
			o: o,
			n: n
		};
	}
	
	return function(o, n){
		o = o.replace(/\s+$/, '');
		n = n.replace(/\s+$/, '');
		var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/));

		var str = "";
		
		var oSpace = o.match(/\s+/g);
		if (oSpace == null) {
			oSpace = [" "];
		}
		else {
			oSpace.push(" ");
		}
		var nSpace = n.match(/\s+/g);
		if (nSpace == null) {
			nSpace = [" "];
		}
		else {
			nSpace.push(" ");
		}
		
		if (out.n.length == 0) {
			for (var i = 0; i < out.o.length; i++) {
				str += '<del>' + out.o[i] + oSpace[i] + "</del>";
			}
		}
		else {
			if (out.n[0].text == null) {
				for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
					str += '<del>' + out.o[n] + oSpace[n] + "</del>";
				}
			}
			
			for (var i = 0; i < out.n.length; i++) {
				if (out.n[i].text == null) {
					str += '<ins>' + out.n[i] + nSpace[i] + "</ins>";
				}
				else {
					var pre = "";
					
					for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++) {
						pre += '<del>' + out.o[n] + oSpace[n] + "</del>";
					}
					str += " " + out.n[i].text + nSpace[i] + pre;
				}
			}
		}
		
		return str;
	};
})();

})(this);

}};
__resources__["/__builtin__/libs/util.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var path = require('path');

/**
 * @namespace
 * Useful utility functions
 */
var util = {
    /**
     * Merge two or more objects and return the result.
     *
     * @param {Object} firstObject First object to merge with
     * @param {Object} secondObject Second object to merge with
     * @param {Object} [...] More objects to merge
     * @returns {Object} A new object containing the properties of all the objects passed in
     */
    merge: function(firstObject, secondObject) {
        var result = {};

        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];

            for (var x in obj) {
                if (!obj.hasOwnProperty(x)) {
                    continue;
                }

                result[x] = obj[x];
            }
        };

        return result;
    },

    /**
     * Creates a deep copy of an object
     *
     * @param {Object} obj The Object to copy
     * @returns {Object} A copy of the original Object
     */
    copy: function(obj) {
        if (obj === null) {
            return null;
        }

        var copy;

        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = arguments.callee(obj[i]);
            }
        } else if (typeof(obj) == 'object') {
            if (typeof(obj.copy) == 'function') {
                copy = obj.copy();
            } else {
                copy = {};

                var o, x;
                for (x in obj) {
                    copy[x] = arguments.callee(obj[x]);
                }
            }
        } else {
            // Primative type. Doesn't need copying
            copy = obj;
        }

        return copy;
    },

    /**
     * Iterates over an array and calls a function for each item.
     *
     * @param {Array} arr An Array to iterate over
     * @param {Function} func A function to call for each item in the array
     * @returns {Array} The original array
     */
    each: function(arr, func) {
        var i = 0,
            len = arr.length;
        for (i = 0; i < len; i++) {
            func(arr[i], i);
        }

        return arr;
    },

    /**
     * Iterates over an array, calls a function for each item and returns the results.
     *
     * @param {Array} arr An Array to iterate over
     * @param {Function} func A function to call for each item in the array
     * @returns {Array} The return values from each function call
     */
    map: function(arr, func) {
        var i = 0,
            len = arr.length,
            result = [];

        for (i = 0; i < len; i++) {
            result.push(func(arr[i], i));
        }

        return result;
    },

    extend: function(target, ext) {
        if (arguments.length < 2) {
            throw "You must provide at least a target and 1 object to extend from"
        }

        var i, j, obj, key, val;

        for (i = 1; i < arguments.length; i++) {
            obj = arguments[i];
            for (key in obj) {
                // Don't copy built-ins
                if (!obj.hasOwnProperty(key)) {
                    continue;
                }

                val = obj[key];
                // Don't copy undefineds or references to target (would cause infinite loop)
                if (val === undefined || val === target) {
                    continue;
                }

                // Replace existing function and store reference to it in .base
                if (val instanceof Function && target[key] && val !== target[key]) {
                    val.base = target[key];
                    val._isProperty = val.base._isProperty;
                }
                target[key] = val;

                if (val instanceof Function) {
                    // If this function observes make a reference to it so we can set
                    // them up when this get instantiated
                    if (val._observing) {
                        // Force a COPY of the array or we will probably end up with various
                        // classes sharing the same one.
                        if (!target._observingFunctions) {
                            target._observingFunctions = [];
                        } else {
                            target._observingFunctions = target._observingFunctions.slice(0);
                        }


                        for (j = 0; j<val._observing.length; j++) {
                            target._observingFunctions.push({property:val._observing[j], method: key});
                        }
                    } // if (val._observing)

                    // If this is a computer property then add it to the list so get/set know where to look
                    if (val._isProperty) {
                        if (!target._computedProperties) {
                            target._computedProperties = [];
                        } else {
                            target._computedProperties = target._computedProperties.slice(0);
                        }

                        target._computedProperties.push(key)
                    }
                }
        
            }
        }


        return target;
    },

    beget: function(o) {
        var F = function(){};
        F.prototype = o;
        var ret  = new F();
        F.prototype = null;
        return ret;
    },

    callback: function(target, method) {
        if (typeof(method) == 'string') {
            method = target[method];
        }

        return function() {
            method.apply(target, arguments);
        }
    },

    domReady: function() {
        if (this._isReady) {
            return;
        }

        if (!document.body) {
            setTimeout(function() { util.domReady(); }, 13);
        }

        window.__isReady = true;

        if (window.__readyList) {
            var fn, i = 0;
            while ( (fn = window.__readyList[ i++ ]) ) {
                fn.call(document);
            }

            window.__readyList = null;
            delete window.__readyList;
        }
    },


    /**
     * Adapted from jQuery
     * @ignore
     */
    bindReady: function() {

        if (window.__readyBound) {
            return;
        }

        window.__readyBound = true;

        // Catch cases where $(document).ready() is called after the
        // browser event has already occurred.
        if ( document.readyState === "complete" ) {
            return util.domReady();
        }

        // Mozilla, Opera and webkit nightlies currently support this event
        if ( document.addEventListener ) {
            // Use the handy event callback
            //document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
            
            // A fallback to window.onload, that will always work
            window.addEventListener( "load", util.domReady, false );

        // If IE event model is used
        } else if ( document.attachEvent ) {
            // ensure firing before onload,
            // maybe late but safe also for iframes
            //document.attachEvent("onreadystatechange", DOMContentLoaded);
            
            // A fallback to window.onload, that will always work
            window.attachEvent( "onload", util.domReady );

            // If IE and not a frame
            /*
            // continually check to see if the document is ready
            var toplevel = false;

            try {
                toplevel = window.frameElement == null;
            } catch(e) {}

            if ( document.documentElement.doScroll && toplevel ) {
                doScrollCheck();
            }
            */
        }
    },



    ready: function(func) {
        if (window.__isReady) {
            func()
        } else {
            if (!window.__readyList) {
                window.__readyList = [];
            }
            window.__readyList.push(func);
        }

        util.bindReady();
    },


    /**
     * Tests if a given object is an Array
     *
     * @param {Array} ar The object to test
     *
     * @returns {Boolean} True if it is an Array, otherwise false
     */
    isArray: function(ar) {
      return ar instanceof Array
          || (ar && ar !== Object.prototype && util.isArray(ar.__proto__));
    },


    /**
     * Tests if a given object is a RegExp
     *
     * @param {RegExp} ar The object to test
     *
     * @returns {Boolean} True if it is an RegExp, otherwise false
     */
    isRegExp: function(re) {
      var s = ""+re;
      return re instanceof RegExp // easy case
          || typeof(re) === "function" // duck-type for context-switching evalcx case
          && re.constructor.name === "RegExp"
          && re.compile
          && re.test
          && re.exec
          && s.charAt(0) === "/"
          && s.substr(-1) === "/";
    },


    /**
     * Tests if a given object is a Date
     *
     * @param {Date} ar The object to test
     *
     * @returns {Boolean} True if it is an Date, otherwise false
     */
    isDate: function(d) {
        if (d instanceof Date) return true;
        if (typeof d !== "object") return false;
        var properties = Date.prototype && Object.getOwnPropertyNames(Date.prototype);
        var proto = d.__proto__ && Object.getOwnPropertyNames(d.__proto__);
        return JSON.stringify(proto) === JSON.stringify(properties);
    },

    /**
     * Utility to populate a namespace's index with its modules
     *
     * @param {Object} parent The module the namespace lives in. parent.exports will be populated automatically
     * @param {String} modules A space separated string of all the module names
     *
     * @returns {Object} The index namespace
     */
    populateIndex: function(parent, modules) {
        var namespace = {};
        modules = modules.split(' ');

        util.each(modules, function(mod, i) {
            // Use the global 'require' which allows overriding the parent module
            util.extend(namespace, window.require('./' + mod, parent));
        });

        parent.exports = namespace;

        return namespace;
    }


}

util.extend(String.prototype, /** @scope String.prototype */ {
    /**
     * Create an array of words from a string
     *
     * @returns {String[]} Array of the words in the string
     */
    w: function() {
        return this.split(' ');
    }
});




module.exports = util;

}};
__resources__["/__builtin__/path.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @namespace */
var path = {
    /**
     * Returns full directory path for the filename given. The path must be formed using forward slashes '/'.
     *
     * @param {String} path Path to return the directory name of
     * @returns {String} Directory name
     */
    dirname: function(path) {
        var tokens = path.split('/');
        tokens.pop();
        return tokens.join('/');
    },

    /**
     * Returns just the filename portion of a path.
     *
     * @param {String} path Path to return the filename portion of
     * @returns {String} Filename
     */
    basename: function(path) {
        var tokens = path.split('/');
        return tokens[tokens.length-1];
    },

    /**
     * Joins multiple paths together to form a single path
     * @param {String} ... Any number of string arguments to join together
     * @returns {String} The joined path
     */
    join: function () {
        return module.exports.normalize(Array.prototype.join.call(arguments, "/"));
    },

    /**
     * Tests if a path exists
     *
     * @param {String} path Path to test
     * @returns {Boolean} True if the path exists, false if not
     */
    exists: function(path) {
        return (__resources__[path] !== undefined);
    },

    /**
     * @private
     */
    normalizeArray: function (parts, keepBlanks) {
      var directories = [], prev;
      for (var i = 0, l = parts.length - 1; i <= l; i++) {
        var directory = parts[i];

        // if it's blank, but it's not the first thing, and not the last thing, skip it.
        if (directory === "" && i !== 0 && i !== l && !keepBlanks) continue;

        // if it's a dot, and there was some previous dir already, then skip it.
        if (directory === "." && prev !== undefined) continue;

        // if it starts with "", and is a . or .., then skip it.
        if (directories.length === 1 && directories[0] === "" && (
            directory === "." || directory === "..")) continue;

        if (
          directory === ".."
          && directories.length
          && prev !== ".."
          && prev !== "."
          && prev !== undefined
          && (prev !== "" || keepBlanks)
        ) {
          directories.pop();
          prev = directories.slice(-1)[0]
        } else {
          if (prev === ".") directories.pop();
          directories.push(directory);
          prev = directory;
        }
      }
      return directories;
    },

    /**
     * Returns the real path by expanding any '.' and '..' portions
     *
     * @param {String} path Path to normalize
     * @param {Boolean} [keepBlanks=false] Whether to keep blanks. i.e. double slashes in a path
     * @returns {String} Normalized path
     */
    normalize: function (path, keepBlanks) {
      return module.exports.normalizeArray(path.split("/"), keepBlanks).join("/");
    }
};

module.exports = path;

}};
__resources__["/__builtin__/system.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @namespace */
var system = {
    /** @namespace */
    stdio: {
        /**
         * Print text and objects to the debug console if the browser has one
         * 
         * @param {*} Any value to output
         */
        print: function() {
            if (console) {
                console.log.apply(console, arguments);
            } else {
                // TODO
            }
        }
    }
};

if (window.console) {
    system.console = window.console
} else {
    system.console = {
        log: function(){}
    }
}

}};
__resources__["/main.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
// Import the cocos2d module
var cocos = require('cocos2d'),
// Import the geometry module
    geo = require('geometry');

// Import the bioblock module
var BioBlock = require('BioBlock').BioBlock;
	
// Create a new layer
var Breakout = cocos.nodes.Layer.extend({
	bioblock: null,

    init: function() {
		// You must always call the super class version of init
        Breakout.superclass.init.call(this);
	
		var bioblock = BioBlock.create();
		bioblock.set('position', new geo.Point(160, 280));
		this.addChild({child: bioblock});
		this.set('bioblock', bioblock);
    }
});

exports.main = function() {
    // Initialise application

    // Get director
    var director = cocos.Director.get('sharedDirector');

    // Attach director to our <div> element
    director.attachInView(document.getElementById('breakout_app'));

    // Create a scene
    var scene = cocos.nodes.Scene.create();
	
    // Add our layer to the scene
    scene.addChild({child: Breakout.create()});

    // Run the scene
    director.runWithScene(scene);
};

}};
__resources__["/resources/t.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAACXBIWXMAAC4jAAAuIwF4pT92AAABNmlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjarY6xSsNQFEDPi6LiUCsEcXB4kygotupgxqQtRRCs1SHJ1qShSmkSXl7VfoSjWwcXd7/AyVFwUPwC/0Bx6uAQIYODCJ7p3MPlcsGo2HWnYZRhEGvVbjrS9Xw5+8QMUwDQCbPUbrUOAOIkjvjB5ysC4HnTrjsN/sZ8mCoNTIDtbpSFICpA/0KnGsQYMIN+qkHcAaY6addAPAClXu4vQCnI/Q0oKdfzQXwAZs/1fDDmADPIfQUwdXSpAWpJOlJnvVMtq5ZlSbubBJE8HmU6GmRyPw4TlSaqo6MukP8HwGK+2G46cq1qWXvr/DOu58vc3o8QgFh6LFpBOFTn3yqMnd/n4sZ4GQ5vYXpStN0ruNmAheuirVahvAX34y/Axk/96FpPYgAAACBjSFJNAAB6JQAAgIMAAPn/AACA6AAAUggAARVYAAA6lwAAF2/XWh+QAAE61UlEQVR42uz9ebxlx1XejX9XVe29z3Dn23OrNVqTNVqSRzzII8YGbLCZE0MSkh/h94a8Sd7wIwkkBAgkITEhJCRgwECYZ3CYPM+2JA+y5lktqdVz953POXuoqveP2nuffVr+4SGywXY9/ly31Oq+99xzzq2n1lrPeh7x3hMREREREfG5QsWnICIiIiIiEkhERERERCSQiIiIiIhIIBERERERkUAiIiIiIiIigURERERERAKJiIiIiIgEEhERERERCSQiIiIiIhJIREREREREJJCIiIiIiEggERERERGRQCIiIiIiIoFEREREREQCiYiIiIiIiAQSEREREREJJCIiIiIiEkhERERERCSQiIiIiIhIIBEREREREZFAIiIiIiIigURERERERAKJiIiIiIgEEhERERERCSQiIiIiIiISSEREREREJJCIiIiIiEggERERERGRQCIiIiIiIoFEREREREREAomIiIiIiAQSEREREREJJCIiIiIiEkhERERERCSQiIiIiIiISCAREREREZFAIiIiIiIigURERERERAKJiIiIiIiIBBIREREREQkkIiIiIiISSEREREREJJCIiIiIiEggERERERERkUAiIiIiIiKBREREREREAomIiIiIiAQSEREREREJJCIiIiIiIhJIREREREQkkIiIiIiISCAREREREZFAIiIiIiIigUREREREREQCiYiIiIiIBBIREREREQkkIiIiIiISSEREREREJJCIiIiIiIhIIBERERERkUAiIiIiIiKBREREREREAomIiIiIiAQSERERERERCSQiIiIiIhJIREREREQkkIiIiIiISCAREREREZFAIiIiIiIiIoFEREREREQCiYiIiIiIBBIREREREQkkIiIiIiISSERERERERCSQiIiIiIhIIBERERERkUAiIiIiIiKBRERERERERAKJiIiIiIgEEhERERERCSQiIiIiIhJIREREREQkkIiIiIiIiEggERERERGRQCIiIiIiIoFEREREREQCiYiIiIiIBBIREREREREJJCIiIiIiEkhERERERCSQiIiIiIhIIBERERERkUAiIiIiIiIigURERERERAKJiIiIiIgEEhERERERCSQiIiIiIhJIREREREREJJCIiIiIiEggERERERGRQCIiIiIiIoFEREREREQCiYiIiIiIiAQSEREREfEFhXm6PtGnnvjRv77vQqAqU448POKn/t0fkplltHOI6dEfDHn08EOcXT+L0hnaVTjRVM7hvScRwWGN9/pSreUl/bT3VQnqHjH6VzXpk8lwgK9gPKrozc3j0V/wb8d7zzg/inhwOIqiIjMaaytEGxwOO6lIEo1XQl4UWFuRmASjDCiF94A4bFVhtAbtUaLBgsfjvGeST9Ba43HY0uEFtBa899hKmkeDUqAERCv6/WH4XetRAgsrS2yureGcQ0QBJeNxAaIAhxZBUFhbkmUJg8ESSoQs6/OMSy7hGZdexh/88R+QFxMSHd6OXgRxoEQQ8VjvEaCXJZSVpawsoDAavHOUeYEogxdPWTq0Bo+inxiUOAb9HtrAw0c2WJ3LwDrKKseLwnnPYNDDew9APrK86nsu4nmvOkg5LlgYDqjKbZYW+6xvjxgOBuxdWMaWjrWzFSePHGS0OaKwmzizRZIZcODcBJNk9PuK0ajAVhpXeUwmpKlCaw3iUTojMYIQXiulCzyeTKdYnzKZOMqtORyCVWfwyuKdQpzgcHivEC+4KiVhiOlZ0rkd+kOLFkEbwbmMzfUtKutw3gMGURZrK/Ap3oOrFN57XOURl4B3ZENFfy7HpD08CuV30DrFeUWeQ1V4xBmk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")};
__resources__["/resources/2.jpg"] = {meta: {mimetype: "image/jpeg"}, data: __imageResource("data:image/jpeg;base64,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oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr5L/4Kif8mja7/wBhCy/9HCvrSvkv/gqJ/wAmja7/ANhCy/8ARwpPYa3D/gl3/wAmjaF/2EL3/wBHGvrSvkv/AIJd/wDJo2hf9hC9/wDRxr60oWwPcKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvkv/gqJ/yaNrv/AGELL/0cK+tK+S/+Con/ACaNrv8A2ELL/wBHCk9hrcP+CXf/ACaNoX/YQvf/AEca+tK+S/8Agl3/AMmjaF/2EL3/ANHGvrShbA9wooopiCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK+S/+Con/Jo2u/8AYQsv/Rwr60r5L/4Kif8AJo2u/wDYQsv/AEcKT2Gtw/4Jd/8AJo2hf9hC9/8ARxr60r5L/wCCXf8AyaNoX/YQvf8A0ca+tKFsD3CiiimIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr5L/4Kif8mja7/wBhCy/9HCvrSvkv/gqJ/wAmja7/ANhCy/8ARwpPYa3D/gl3/wAmjaF/2EL3/wBHGvrSvkv/AIJd/wDJo2hf9hC9/wDRxr60oWwPcKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvkv/gqJ/yaNrv/AGELL/0cK+tK+S/+Con/ACaNrv8A2ELL/wBHCk9hrcP+CXf/ACaNoX/YQvf/AEca+tK+S/8Agl3/AMmjaF/2EL3/ANHGvrShbA9wooopiCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK+S/+Con/Jo2u/8AYQsv/Rwr60r5L/4Kif8AJo2u/wDYQsv/AEcKT2Gtw/4Jd/8AJo2hf9hC9/8ARxr60r5L/wCCXf8AyaNoX/YQvf8A0ca+tKFsD3CiiimIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr5L/4Kif8mja7/wBhCy/9HCvrSvkv/gqJ/wAmja7/ANhCy/8ARwpPYa3D/gl3/wAmjaF/2EL3/wBHGvrSvkv/AIJd/wDJo2hf9hC9/wDRxr60oWwPcKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvkv/gqJ/yaNrv/AGELL/0cK+tK+S/+Con/ACaNrv8A2ELL/wBHCk9hrcP+CXf/ACaNoX/YQvf/AEca+tK+S/8Agl3/AMmjaF/2EL3/ANHGvrShbA9wooopiCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK+S/+Con/Jo2u/8AYQsv/Rwr60r5L/4Kif8AJo2u/wDYQsv/AEcKT2Gtw/4Jd/8AJo2hf9hC9/8ARxr60r5L/wCCXf8AyaNoX/YQvf8A0ca+tKFsD3CiiimIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr5L/4Kif8mja7/wBhCy/9HCvrSvkv/gqJ/wAmja7/ANhCy/8ARwpPYa3D/gl3/wAmjaF/2EL3/wBHGvrSvkv/AIJd/wDJo2hf9hC9/wDRxr60oWwPcKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvkv/gqJ/yaNrv/AGELL/0cK+tK+S/+Con/ACaNrv8A2ELL/wBHCk9hrcP+CXf/ACaNoX/YQvf/AEca+tK+S/8Agl3/AMmjaF/2EL3/ANHGvrShbA9wooopiCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK+S/+Con/Jo2u/8AYQsv/Rwr60r5L/4Kif8AJo2u/wDYQsv/AEcKT2Gtw/4Jd/8AJo2hf9hC9/8ARxr60r5L/wCCXf8AyaNoX/YQvf8A0ca+tKFsD3CiiimIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr5L/4Kif8mja7/wBhCy/9HCvrSvkv/gqJ/wAmja7/ANhCy/8ARwpPYa3D/gl3/wAmjaF/2EL3/wBHGvrSvkv/AIJd/wDJo2hf9hC9/wDRxr60oWwPcKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvkv/gqJ/yaNrv/AGELL/0cK+tK+S/+Con/ACaNrv8A2ELL/wBHCk9hrcP+CXf/ACaNoX/YQvf/AEca+tK+S/8Agl3/AMmjaF/2EL3/ANHGvrShbA9wooopiCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK+S/+Con/Jo2u/8AYQsv/Rwr60r5L/4Kif8AJo2u/wDYQsv/AEcKT2Gtw/4Jd/8AJo2hf9hC9/8ARxr60r5L/wCCXf8AyaNoX/YQvf8A0ca+tKFsD3CiiimIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr5L/4Kif8mja7/wBhCy/9HCvrSvkv/gqJ/wAmja7/ANhCy/8ARwpPYa3D/gl3/wAmjaF/2EL3/wBHGvrSvkv/AIJd/wDJo2hf9hC9/wDRxr60oWwPcKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK84+JX7Q3gL4TXcVn4i16K3vpOfsdujTzKPVlQEqPTOM9q4n/huP4R/9By6/wDBfN/8TXLPF4enLlnUSfqj26GR5piqaq0MNOUXs1FtP52PfaK8C/4bj+Ef/Qcuv/BfN/8AE0f8Nx/CP/oOXX/gvm/+JqPr2F/5+R+9G/8Aq5nP/QJU/wDAJf5HvtFeBf8ADcfwj/6Dl1/4L5v/AImj/huP4R/9By6/8F83/wATR9ewv/PyP3oP9XM5/wCgSp/4BL/I99orwL/huP4R/wDQcuv/AAXzf/E0f8Nx/CP/AKDl1/4L5v8A4mj69hf+fkfvQf6uZz/0CVP/AACX+R77RXgX/Dcfwj/6Dl1/4L5v/iaP+G4/hH/0HLr/AMF83/xNH17C/wDPyP3oP9XM5/6BKn/gEv8AI99orwL/AIbj+Ef/AEHLr/wXzf8AxNH/AA3H8I/+g5df+C+b/wCJo+vYX/n5H70H+rmc/wDQJU/8Al/ke+0V4H/w3H8I/wDoO3X/AIL5v/iaP+G4/hF/0Hbr/wAF83/xNH17C/8APyP3oP8AVzOf+gSp/wCAS/yPfKK8D/4bj+EX/Qduv/BfN/8AE0f8Nx/CL/oO3X/gvm/+Jo+vYX/n5H70H+rmc/8AQJU/8Al/ke+UV4H/AMNx/CL/AKDt1/4L5v8A4mj/AIbj+EX/AEHbr/wXzf8AxNH17C/8/I/eg/1czn/oEqf+AS/yPfKK8D/4bj+EX/Qduv8AwXzf/E0f8Nx/CL/oO3X/AIL5v/iaPr2F/wCfkfvQf6uZz/0CVP8AwCX+R75RXgf/AA3H8Iv+g7df+C+b/wCJo/4bj+EX/Qduv/BfN/8AE0fXsL/z8j96D/VzOf8AoEqf+AS/yPfKK8D/AOG4/hF/0Hbr/wAF83/xNH/Dcfwi/wCg7df+C+b/AOJo+vYX/n5H70H+rmc/9AlT/wAAl/ke+UV4H/w3H8Iv+g7df+C+b/4mj/huP4Rf9B26/wDBfN/8TR9ewv8Az8j96D/VzOf+gSp/4BL/ACPfKK8D/wCG4/hF/wBB26/8F83/AMTR/wANx/CL/oO3X/gvm/8AiaPr2F/5+R+9B/q5nP8A0CVP/AJf5HvlFeB/8Nx/CL/oO3X/AIL5v/iaP+G4/hF/0Hbr/wAF83/xNH17C/8APyP3oP8AVzOf+gSp/wCAS/yPfKK8D/4bj+EX/Qduv/BfN/8AE0f8Nx/CL/oO3X/gvm/+Jo+vYX/n5H70H+rmc/8AQJU/8Al/ke+UV4H/AMNx/CL/AKDt1/4L5v8A4mj/AIbj+EX/AEHbr/wXzf8AxNH17C/8/I/eg/1czn/oEqf+AS/yPfKK8E/4bi+EX/Qeuf8AwXz/APxNH/DcXwi/6D1z/wCC+f8A+Jo+u4X/AJ+R+9B/q5nP/QJU/wDAJf5HvdFeCf8ADcXwi/6D1z/4L5//AImj/huL4Rf9B65/8F8//wATR9dwv/PyP3oP9XM5/wCgSp/4BL/I97orwT/huL4Rf9B65/8ABfP/APE0f8NxfCL/AKD1z/4L5/8A4mj67hf+fkfvQf6uZz/0CVP/AACX+R73RXgn/DcXwi/6D1z/AOC+f/4mj/huL4Rf9B65/wDBfP8A/E0fXcL/AM/I/eg/1czn/oEqf+AS/wAj3uivBP8AhuL4Rf8AQeuf/BfP/wDE0f8ADcXwi/6D1z/4L5//AImj67hf+fkfvQf6uZz/ANAlT/wCX+R73RXgn/DcXwi/6D1z/wCC+f8A+Jp8P7b3wimmSP8A4SGdNzBdz6fOAM9z8nSj67hf+fkfvQf6u5yv+YSp/wCAS/yPeKKo6JrmneJNMt9R0q9g1GwuF3xXNtIJEcexHFXq7E01dHz8oyg3GSs0FFFFMkKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK+S/8AgqJ/yaNrv/YQsv8A0cK+tK+S/wDgqJ/yaNrv/YQsv/RwpPYa3D/gl3/yaNoX/YQvf/Rxr60r5L/4Jd/8mjaF/wBhC9/9HGvrShbA9wooopiCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKhu7yDT7WW5upo7a3iUvJLKwVEUdSSeAK+T/jf+3po3hn7RpXgOKPXtTGUbU5c/ZIj/sDgyn34X3auXEYmlho81WVj2sryfHZzV9jgqbk+r6L1ey/PsfSnjj4g+Hfhvosmq+JNVt9Ksl4DTN80h/uoo5Y+wBNfDvxv/bz1vxR9o0rwJFJoGlnKNqUuPtko9V6iIfTLe46V81+N/H/AIh+I+tyat4j1W41W9fo8zfKg/uoo4VfYACufr43GZxVr3hR92P4/wDAP6DyDgDBZbavjrVanb7K9F19X9yJbu7nv7mW4uZpLi4lYvJLKxZnY9SSeSaioor54/VUklZBRRRQMKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA774UfHHxf8ABrU/tXh3UmjtnYNPp8+Xtp/95M9f9oYPvX338Dv2xvCPxZFvpuouvhrxI+F+x3Ug8qdv+mUhwCT/AHTg+metfmNQDg5HBr1MJmNbCO0XePZ/1ofF57wnl2fJzqx5KvSa3+f8y9dezR+3FFfmn8Dv21PFfwx+z6Zrxk8UeHUwojnk/wBJt1/6ZyHqB/dbI4wCtfe/ww+MfhT4v6QL/wANapHdFQDNaP8AJcQE9nQ8j68g9ia+2wmYUcWrRdpdn/Wp/OOe8K5jkMnKtHmp9Jrb59n6/Js7WiiivTPjgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig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ZA5r7F0nV7HXtOgv9NvIL+ynUPFcW0geN19Qw4NfinXonwj+PfjD4L6iJtA1FjYu26fTLnL2031XPB/2lwfevpcHnU6doYjVd+v/AAT8dz/w8w+LvXypqnP+V/C/T+X8vJH66UV4T8D/ANrzwf8AGAQafcSDw74kfC/2feSDZM3/AEyk4Df7pw3sete7V9jSrU68eem7o/Acdl+Ky2s8Pi6bhJdH+aezXmtAooorY88KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK+S/+Con/ACaNrv8A2ELL/wBHCvrSvkv/AIKif8mja7/2ELL/ANHCk9hrcP8Agl3/AMmjaF/2EL3/ANHGvrSvkv8A4Jd/8mjaF/2EL3/0ca+tKFsD3CiiimIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAqnq+sWOgadPf6leQWFjAu+W4uZBHGg9Sx4FeF/G79sjwf8KPtGnaa6+JvESZX7JaSDyYW/6aycgEf3Vyexx1r4I+LHx28YfGbUfP8AEOps1ojbodOt8x20P+6meT/tNk+9eJjM1o4a8Y+9L+t2fo+QcD5hnFq1ZeypPq1q/wDCv1dl2ufVPxv/AG/LWw+0aT8OoFvJxlG1u7jPlL7xRnlv95sD/ZIr4q8T+K9Y8aaxPquu6lcapqExy9xcyF2+g9AOwHA7VlUV8VicZWxbvUenbof0Rk/D+X5HT5MJT97rJ6yfq/0Vl5BRRRXEfSBTJZUgjaSR1jRRlmY4AHua5jxT8RNM8Mh4t/2u9H/LvEeh/wBo9v5+1eP+JfG2p+KJCLmby7bOVt4uEH19T7mvXwmWVsT7z92Pd/ofn+e8Z5fk16UH7Sr/ACp6L/E+npq/I9D8VfF62st9vo6i7m6G4f8A1a/Qfxfy+teU6pq95rV01xe3D3Ex7uensB0A9hVSivssNgqOEX7ta9+p/PWc8RZhnk74qfu9IrSK+XV+buwooorvPmQooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAo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KACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA+VP2of2OLX4gLd+KPBcEVl4l5kubAYSK+Pcjskh9ejd8Hmvz61HTbrR7+4sr62ltLy3cxywToUeNgcEMDyCK/bCvBv2kv2V9H+NthJqWn+VpPi6FMRXu3CXIA4jmA6jsG6j3HFfM5jlKrXq0FaXVd/+CfsnCXHE8By4HM3elspbuPk+8fxXpt+YFFbPi/wdrHgPxBd6Jr1hLp2pWrbZIZR+RB6Mp6gjg1jV8S04uz3P6Lp1IVYKpTd09U1s0R3FvFdwPDNGssTjayOMgj3rxnx78NZdDMl/pqtNp/V4+rQ/4r79u/rXtVIQGBBGQexrtwmMqYOfNDbqu585nvD+Ez+h7KurSXwyW6/zXdfrqfLFFep+PvhfjzNR0WL/AGpbRR+ZT/D8vSvLCCCQRgjtX3+GxVPFQ56b/wCAfyxnGS4vI8Q8Pio+j6SXdP8ANboKKKK6zwgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiirWmaXdaxex2lnC008hwFX+Z9B71LairvY0p051ZqnTV29Elu2Q21tLdzpDBG0srnaqIMkmvaPAPw2i0FUvtRVZtRPKp1WH6ere/5etaHgjwDa+FIBNJtuNRcfPNjhP8AZX0Hv3/Susr4zMM0da9Kg7R6vv8A8A/orhPgqGX8uOzFXq7qO6j5vvL8F66hRRRXzh+uhXefB74MeIvjV4nTSdCt8RJhru+lBENqhP3mPr1wo5P5kdB+z9+zlr/x21zFuG0/w9buBearImVXvsjH8Tkdugzk9s/pr8OvhvoHwr8MW+heHbJbOyi5Zuskz93kb+Jj6/gMAAV7uXZZLFP2lTSH5+n+Z+ZcV8ZUcki8LhbTrv7o+b8+y+b03xPgv8EPDvwQ8NLpmiwebdygNeajKo865cdyeyjnCjge5JJ9Coor72EI0oqEFZI/mLE4mtjK0q+Ik5Tlq2woooqzmCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvkv/gqJ/yaNrv/AGELL/0cK+tK+S/+Con/ACaNrv8A2ELL/wBHCk9hrcP+CXf/ACaNoX/YQvf/AEca+tK+S/8Agl3/AMmjaF/2EL3/ANHGvrShbA9wooopiCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA8w+OnwA8O/HTw/8AZdTjFpq0Cn7FqsSgywH0P95Ceqn8MHmvzI+Kvwl8RfB3xPLoviG0MMnLQXMeTDcpnh427j26joQK/YauR+J3wt8PfFzwxPofiKzFxbv80Uy4Etu/Z427EfkehBHFeJmGWQxa54aT/P1/zP0fhbjCvkU1h6950H06x84/qtn5M/HWivVfj1+zz4h+BWveTfIb7Q7hyLLVokxHKOu1h/A4HVT9QSK8qr4GpTnRm4VFZo/qDCYyhj6EcThpqUJbNf1966BXAePfhpFrYkv9NVYb/q8fRZv8G9+/f1rv6K0oYiphp89N2Zy5nleFzfDvDYuN4v70+6fR/wBPQ+W7i3ltJ3hmjaKVDtZHGCD6EVHXvnjfwDa+K4TNHtt9RQfJNjh/ZvUe/b9K8N1TS7rRr2S0vIWhnQ8q38x6j3r73BY6njI6aSW6P5b4i4ZxXD9b3/epP4Zfo+z/AD6FWiiivTPjgooooAKKKKACiiigAooooAKKKKACiiigAoore8JeDr3xbe+XAPLtkP724YfKg9Pc+1Z1KkKUXObskdeFwtfG1o4fDRcpy2S/r8ehU8P+Hb3xLfra2ce5urufuoPUmvd/Cfg+y8J2XlwL5lw4/e3DD5nP9B7Vb0Dw9ZeG7BbSyj2KOWc/ec+pNadfCY/MZ4t8kNIfn6n9N8L8I0MjgsRXtOu+vSPlH9X+SCiiivGP0UK+g/2Z/wBlDVPjNdxazrIl0vwfE/zT42y3hB5SLPbsX6DoMnOOv/Zb/Y3uPHBtPFfje3ktPD3ElrprZSS9HUM/dY/1b2GCfv8AsrK302zhtLSCO2tYEEcUMKhURQMBQBwAB2r6fLcpdW1bEL3ei7+vkfjHF3HEcFzYDLJXqbSl0j5LvLz2XrtS8NeGdL8HaHaaPo1lFp2m2iCOG3hXCqP6k9STySSTWpRRX2qSSsj+dpzlUk5zd292+oUUUUyAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK+S/wDgqJ/yaNrv/YQsv/Rwr60r5L/4Kif8mja7/wBhCy/9HCk9hrcP+CXf/Jo2hf8AYQvf/Rxr60r5L/4Jd/8AJo2hf9hC9/8ARxr60oWwPcKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDJ8U+FdJ8baDd6NrdjFqOm3SbJYJhkH0I7gjqCOQeRX5u/tK/so6t8F7yXV9JEuq+D5X+S5xmS0JPCTY7dg/Q9Dg4B/TioL6xt9Ts57S7gjubWdDHLDMoZHUjBUg8EEdq83G4GnjYWlpJbP8ArofX8O8S4vh6vzUvepv4ovZ+a7Pz++5+J1FfWn7UX7Glx4KN34q8D28l3oAzLdaWmXlsh1LJ3aP9V9xkj5Lr89xGGqYWfs6i/wCCf1XlWb4TOcMsThJXXVdU+zXR/wBLQKwvFfhGy8WWXlXC7J0H7q4UfMh/qPat2isadSVKSnB2aO/FYWjjaMsPiIqUJaNM+a/EXhu98MX7Wt5Hjuki/dkHqDWXX0xrmhWfiKwe0vYhJGeQ38SH1B7GvCfGHgq88JXeJAZrNz+6uFHB9j6GvusBmUcUuSek/wA/T/I/mbing+tkknicNedB9esfJ+XZ/frvztFFFe2fm4UUUUAFFFFABRRRQAUUUUAFFFd74B+G0uumO/1FWh0/qidGm/wX379vWuevXp4aDqVHZHq5ZleKzfErC4SN5P7ku7fRf0tTO8EeAbnxXOJpd1vpqH55scv7L/j2r3LTdMttIso7W0hWGCMYCr/M+p96mt7eK0gSGGNYokG1UQYAHoKkr4HG46pjJa6RWyP6m4d4awvD9G0Peqv4pfouy8uvUKKKtaVpV5rmo21hp9rLe3ty4iht4ELvIx4AAHU15qV9EfXNqKcpOyRXjjaWRURS7scKqjJJ9BX3H+y1+xetl9k8W/EGzD3HEtloUy5EfcPOO59E7fxc8Dsv2Xf2P7P4Zx23ibxbFFf+KiA8FscPFp/07NJ/tdB/D6n6hr7LLcp5LVsQtei/z/yP5+4u45dfmwGVStHaU118o+Xn16aatAAoAAwB0ApaKK+rPw8KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK+S/+Con/ACaNrv8A2ELL/wBHCvrSvkv/AIKif8mja7/2ELL/ANHCk9hrcP8Agl3/AMmjaF/2EL3/ANHGvrSvkv8A4Jd/8mjaF/2EL3/0ca+tKFsD3CiiimIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAEIBBB5Br42/aj/Yuj1gXfiz4f2ixX/Mt5ocQws3cvCOzeqdD2weD9lUVyYnC08VDkqL/AIB7mT5zi8kxKxOElZ9V0kuzX9NdD8Sp4JLaaSGaNopY2KujjDKRwQR2NMr9Jf2nP2RNP+LMNx4h8NpDpni9V3OvCw3+Oz/3X9H79G7EfnTrug6j4Y1e60vVbOaw1C1cxzW86lXRh2I/zmvz3GYKpg52lqujP6s4f4jwnEFD2lF2mvii91/muz++z0KFV76wt9TtJLa6iWaCQYZGHBqxRXAm07o+onCNSLhNXT3TPCvHXw7uPDMjXVruuNNY/e6tF7N7e9cZX1NJGk0bJIodGGGVhkEehryDx98MW07zNR0hC9r96S2HLR+6+o9u38vscvzVVLUq716Pv6+Z/PnFfBEsJzY7K43p7yh1j5ruvLdem3nFFFFfTH40FFFFABRRRQAUdadFE88ixxo0kjHCqoySfQCvYvAHwzTShHqGqosl796OA8rF7n1b+VcOLxdPCQ5p79F3PpMjyHF59iPY4dWivik9or/PsuvpqZfgD4YGXy9R1mLCcNFaMOvu49Pb8/SvV1UKAAAAOABS0V8BisVUxc+eo/Rdj+qMmyTCZHh1h8LH1b3k+7/RbIKKK7D4W/CnxD8X/FEOieHrMzzNhprh8iG3jzy8jdh+p6AE1zQhKclGKu2exXr0sNTlWrSUYx1beyRkeD/B2sePfENpomg2Euo6ldNtjhiH5sT0CjqSeBX6Vfs3fst6N8ENOTULzytV8XTpie+K5SAHrHDnoOxbq3sOK6X4E/s/+HvgV4eFrpyC81edR9t1WVAJJz6D+6gPRR+OTzXqFfd5dlccNarV1n+X/BP5n4s40q5u5YPAtxodXs5+vaPl169kUUUV9AflYUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFfJf8AwVE/5NG13/sIWX/o4V9aV8l/8FRP+TRtd/7CFl/6OFJ7DW4f8Eu/+TRtC/7CF7/6ONfWlfJf/BLv/k0bQv8AsIXv/o419aULYHuFFFFMQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABXjX7Q37NOg/HXSDKQmmeJrdMWmqInX0jlA+8n6r1HcH2WisqtKFaDp1FdM7sFjcRl1eOJws3Gcdmv61XdH41fED4e698MfEtzoXiGxexvoTkZ5SVOzo3RlPqPp1BFc5X68/GT4KeHPjZ4abS9ct9txGC1pqEQHnWrnup7g8ZU8H6gEfmP8Zvgj4j+CPiVtM1uDzLWQk2eoxKfJuUHdT2YcZU8j6EE/AY/LZ4N80dYd+3qf1Hwvxdh8/gqNW0K63j0fnH9VuvNann1FFFeMfoR5p4++GC3vm6jo8YS4+9LarwH919D7d/5+RujRuyOpV1OCrDBB9K+p64nx38OYPEiPd2YW31IDk9Fl9m9/f8/b6bL81dO1LEPTo+3qfjHFfBEcVzY7K42nvKHSXnHs/LZ+u/htFTXllPp91Jb3MTQzxnayOMEGoa+xTTV0fz7KMoScZKzQVPY2NxqV1HbWsTTzyHCog5NT6Lol54gv0tLKIySt1P8Kj1J7CvdvB3gmz8JWnyATXrj97cEcn2HoK8vHY+GDjbeT2X+Z9pw3wvic/q83w0VvL9I93+C69E6HgX4eW/hiJbq523GpsOX6rF7L/jXZ0UV8FWrTxE3UqO7P6jy/LsNleHjhcJDlivx82+rfcKKK9x/Zv/AGXtZ+OOppfXXm6X4SgfFxqBXDTEdY4c9W9W6L7nglGjOvNU6au2Vj8fhssw8sVip8sI9f0Xdvojm/gZ8AvEPx08RCz0yM2mlQMPtuqyoTFAvoP7zkdFH44HNfpz8K/hP4e+D3heLRPD1oIYxhp7l8Ga5kxy8jdz7dB0AArX8G+C9G+H/h200PQbCLTtNtl2pFGOp7sx6sx6knk1t1+gYDLoYON3rN9f8j+WeJ+LMTxBU9nH3KCeke/nLu/LZfiyiiivXPggooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvkv8A4Kif8mja7/2ELL/0cK+tK+S/+Con/Jo2u/8AYQsv/RwpPYa3D/gl3/yaNoX/AGEL3/0ca+tK+S/+CXf/ACaNoX/YQvf/AEca+tKFsD3CiiimIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK53x74A0L4meGrnQvENil/YTjo3DRt2dG6qw7EfyJroqKmUVJOMldM1pVZ0ZqpSk1JaprRpn5XftEfsza78C9WM4EmqeF7h8Wupqv3T2jlA+6/v0bqO4HjFftVrmh6f4l0m60zVLOG/0+6QxzW86BkdT2INfnX+07+yFqHwpmufEXhiObUvCLEvJHy81hns/wDej9H7dG9T8RmOVOherQ1j27f8A/pDhLjeGZcuCzFqNbZS2U/8pfg+muh800UUV82frxzXjLwPZ+LbXLYgvkH7u4A5+jeo/lXkdj8OtZu9dfTHtzCY+ZJ2H7sL/eB757D/AOvX0DRXq4bMq2Fg6cdV0v0Phc54Py7OcTDFVU4yT97l+0uz8/Pe2na2R4a8MWXhawFtaJ8x5kmb70h9T/hWvRRXmznKpJzm7tn2WHw9LC0o0KEVGMdElsgooAJOByTX2f8AstfsYNqX2Txd8QLMpacS2WhzLhpe4ecdl9E7/wAXHB6MNhamLnyU1/wDys4znCZHhnicXK3ZdZPsl/SXU439l79kC9+KEtt4l8VxS6f4TUh4YDlJdQ+ndY/Vup/h9R+iGk6TZaDpttp+nWsVlY2yCKG3gQKkajoAB0qxFEkEaxxoscaAKqqMAAdABT6/QsHgqeDhyw36vufyln/EWL4gxHta7tBfDFbL/N93+S0CiiivQPlgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr5L/AOCon/Jo2u/9hCy/9HCvrSvkv/gqJ/yaNrv/AGELL/0cKT2Gtw/4Jd/8mjaF/wBhC9/9HGvrSvkv/gl3/wAmjaF/2EL3/wBHGvrShbA9wooopiCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApk0MdxE8UqLJG4KsjjIYHqCKfRQGx8K/tR/sWvpn2vxZ8PrRpLPmW80OEZaLuXgHdfVOo/h44HxiQVJBGCOxr9uK+Tv2ov2NrbxyLvxV4Igjs/EPMl1pq4SK9PUsvZZD+Td8HJPyWY5Te9bDL1X+X+R+68JcdOHLgM2lptGb/KX/AMl9/c/Piip7+wudKvZ7O8t5LW7gcxywTIVeNgcFSDyCD2qCvj9j99TTV0FTWdnPqN3Da2sMlzczOI44YlLO7E4AAHJJParnhzw3qfi7W7TSNGsptQ1K7cRw28C5Zj/QDqSeAASa/R/9mX9k7TPg3aQ63raw6p4wlTmXG6KyBHKRZ6t2L/gMDOfRwWBqY2do6RW7/rqfJcQ8SYTh6hz1feqP4Yrd+b7Lz+67OQ/Za/Y2g8GC08WeOLeO617i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BVN/hRdBZn1pRXyX/wAPRPgH/wBB3VP/AAVTf4Uf8PRPgH/0HdU/8FU3+FF0FmfWlFfJf/D0T4B/9B3VP/BVN/hR/wAPRPgH/wBB3VP/AAVTf4UXQWZ9aUV8l/8AD0T4B/8AQd1T/wAFU3+FH/D0T4B/9B3VP/BVN/hRdBZn1pRXyX/w9E+Af/Qd1T/wVTf4Uf8AD0T4B/8AQd1T/wAFU3+FF0FmfWlFfJf/AA9E+Af/AEHdU/8ABVN/hR/w9E+Af/Qd1T/wVTf4UXQWZ9aUV8l/8PRPgH/0HdU/8FU3+FH/AA9E+Af/AEHdU/8ABVN/hRdBZn1pRXyX/wAPRPgH/wBB3VP/AAVTf4Uf8PRPgH/0HdU/8FU3+FF0FmfWlFfJf/D0T4B/9B3VP/BVN/hR/wAPRPgH/wBB3VP/AAVTf4UXQWZ9aUV8l/8AD0T4B/8AQd1T/wAFU3+FH/D0T4B/9B3VP/BVN/hRdBZn1pRXyX/w9E+Af/Qd1T/wVTf4Uf8AD0T4B/8AQd1T/wAFU3+FF0FmfWlFfJf/AA9E+Af/AEHdU/8ABVN/hR/w9E+Af/Qd1T/wVTf4UXQWZ9aUV8l/8PRPgH/0HdU/8FU3+FH/AA9E+Af/AEHdU/8ABVN/hRdBZn1pRXyX/wAPRPgH/wBB3VP/AAVTf4Uf8PRPgH/0HdU/8FU3+FF0FmfWlFfJf/D0T4B/9B3VP/BVN/hR/wAPRPgH/wBB3VP/AAVTf4UXQWZ9aUV8l/8AD0T4B/8AQd1T/wAFU3+FH/D0T4B/9B3VP/BVN/hRdBZn1pRXyX/w9E+Af/Qd1T/wVTf4Uf8AD0T4B/8AQd1T/wAFU3+FF0FmfWlFfJf/AA9E+Af/AEHdU/8ABVN/hR/w9E+Af/Qd1T/wVTf4UXQWZ9aUV8l/8PRPgH/0HdU/8FU3+FH/AA9E+Af/AEHdU/8ABVN/hRdBZn1pRXyX/wAPRPgH/wBB3VP/AAVTf4Uf8PRPgH/0HdU/8FU3+FF0FmfWlFfJf/D0T4B/9B3VP/BVN/hR/wAPRPgH/wBB3VP/AAVTf4UXQWZ9aUV8l/8AD0T4B/8AQd1T/wAFU3+FH/D0T4B/9B3VP/BVN/hRdBZn1pRXyX/w9E+Af/Qd1T/wVTf4Uf8AD0T4B/8AQd1T/wAFU3+FF0FmfWlFfJf/AA9E+Af/AEHdU/8ABVN/hR/w9E+Af/Qd1T/wVTf4UXQWZ9aUV8l/8PRPgH/0HdU/8FU3+FH/AA9E+Af/AEHdU/8ABVN/hRdBZn1pRXyX/wAPRPgH/wBB3VP/AAVTf4Uf8PRPgH/0HdU/8FU3+FF0FmfWlFfJf/D0T4B/9B3VP/BVN/hR/wAPRPgH/wBB3VP/AAVTf4UXQWZ9aUV8l/8AD0T4B/8AQd1T/wAFU3+FH/D0T4B/9B3VP/BVN/hRdBZn1pRXyX/w9E+Af/Qd1T/wVTf4Uf8AD0T4B/8AQd1T/wAFU3+FF0FmfWlFfJf/AA9E+Af/AEHdU/8ABVN/hR/w9E+Af/Qd1T/wVTf4UXQWZ9aUV8l/8PRPgH/0HdU/8FU3+FH/AA9E+Af/AEHdU/8ABVN/hRdBZn1pRXyX/wAPRPgH/wBB3VP/AAVTf4Uf8PRPgH/0HdU/8FU3+FF0FmfWlFfJf/D0T4B/9B3VP/BVN/hR/wAPRPgH/wBB3VP/AAVTf4UXQWZ9aUV8l/8AD0T4B/8AQd1T/wAFU3+FH/D0T4B/9B3VP/BVN/hRdBZn1pRXyX/w9E+Af/Qd1T/wVTf4Uf8AD0T4B/8AQd1T/wAFU3+FF0FmfWlFfJf/AA9E+Af/AEHdU/8ABVN/hR/w9E+Af/Qd1T/wVTf4UXQWZ9aUV8l/8PRPgH/0HdU/8FU3+FH/AA9E+Af/AEHdU/8ABVN/hRdBZn1pRXyX/wAPRPgH/wBB3VP/AAVTf4Uf8PRPgH/0HdU/8FU3+FF0FmfWlFfJf/D0T4B/9B3VP/BVN/hR/wAPRPgH/wBB3VP/AAVTf4UXQWZ9aUV8l/8AD0T4B/8AQd1T/wAFU3+FH/D0T4B/9B3VP/BVN/hRdBZn1pRXyX/w9E+Af/Qd1T/wVTf4Uf8AD0T4B/8AQd1T/wAFU3+FF0FmfWlFfJf/AA9E+Af/AEHdU/8ABVN/hR/w9E+Af/Qd1T/wVTf4UXQWZ9aUV8l/8PRPgH/0HdU/8FU3+FH/AA9E+Af/AEHdU/8ABVN/hRdBZn1pRXyX/wAPRPgH/wBB3VP/AAVTf4Uf8PRPgH/0HdU/8FU3+FF0FmfWlFfJf/D0T4B/9B3VP/BVN/hR/wAPRPgH/wBB3VP/AAVTf4UXQWZ9aUV8l/8AD0T4B/8AQd1T/wAFU3+FH/D0T4B/9B3VP/BVN/hRdBZn1pRXyX/w9E+Af/Qd1T/wVTf4Uf8AD0T4B/8AQd1T/wAFU3+FF0FmfWlFfJf/AA9E+Af/AEHdU/8ABVN/hR/w9E+Af/Qd1T/wVTf4UXQWZ9aUV8l/8PRPgH/0HdU/8FU3+FH/AA9E+Af/AEHdU/8ABVN/hRdBZn1pRXyX/wAPRPgH/wBB3VP/AAVTf4Uf8PRPgH/0HdU/8FU3+FF0FmfWlFfJf/D0T4B/9B3VP/BVN/hR/wAPRPgH/wBB3VP/AAVTf4UXQWZ9aUV8l/8AD0T4B/8AQd1T/wAFU3+FH/D0T4B/9B3VP/BVN/hRdBZn1pRXyX/w9E+Af/Qd1T/wVTf4Uf8AD0T4B/8AQd1T/wAFU3+FF0FmfWlFfJf/AA9E+Af/AEHdU/8ABVN/hR/w9E+Af/Qd1T/wVTf4UXQWZ9aUV8l/8PRPgH/0HdU/8FU3+FH/AA9E+Af/AEHdU/8ABVN/hRdBZn1pRXyX/wAPRPgH/wBB3VP/AAVTf4Uf8PRPgH/0HdU/8FU3+FF0FmfWlFfJf/D0T4B/9B3VP/BVN/hR/wAPRPgH/wBB3VP/AAVTf4UXQWZ9aUV8l/8AD0T4B/8AQd1T/wAFU3+FH/D0T4B/9B3VP/BVN/hRdBZn1pRXyX/w9E+Af/Qd1T/wVTf4Uf8AD0T4B/8AQd1T/wAFU3+FF0FmfWlFfJf/AA9E+Af/AEHdU/8ABVN/hR/w9E+Af/Qd1T/wVTf4UXQWZ9aUV8l/8PRPgH/0HdU/8FU3+FH/AA9E+Af/AEHdU/8ABVN/hRdBZn1pRXyX/wAPRPgH/wBB3VP/AAVTf4Uf8PRPgH/0HdU/8FU3+FF0FmfWlFfJf/D0T4B/9B3VP/BVN/hR/wAPRPgH/wBB3VP/AAVTf4UXQWZ9aUV8l/8AD0T4B/8AQd1T/wAFU3+FH/D0T4B/9B3VP/BVN/hRdBZn1pRXyX/w9E+Af/Qd1T/wVTf4Uf8AD0T4B/8AQd1T/wAFU3+FF0FmfWlFfJf/AA9E+Af/AEHdU/8ABVN/hR/w9E+Af/Qd1T/wVTf4UXQWZ9aV8l/8FRP+TRtd/wCwhZf+jhR/w9E+Af8A0HdU/wDBVN/hXgH7cn7cnwo+Of7PuqeE/CeqX11rNxd200cc9hJEpVJAzfMwx0FJtWGk7n//2Q==")};
__resources__["/resources/logo.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};
__resources__["/resources/heart.jpg"] = {meta: {mimetype: "image/jpeg"}, data: __imageResource("data:image/jpeg;base64,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")};
__resources__["/BioBlock.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
// Import the cocos2d module
var cocos = require('cocos2d'),
// Import the geometry module
    geo = require('geometry');

var BioBlock = cocos.nodes.Node.extend({
	init: function() {
		BioBlock.superclass.init.call(this);
		
		var BioBlockSprite = cocos.nodes.Sprite.create({
			file: '/resources/heart.jpg',
			rect: new geo.Rect(0, 0, 164, 164)
		});
		BioBlockSprite.set('anchorPoint', new geo.Point(0, 0));
		this.addChild({child: BioBlockSprite});
		this.set('contentSize', BioBlockSprite.get('contentSize'));		
	}
});

exports.BioBlock = BioBlock;

}};/*globals module exports resource require window Module __main_module_name__ __resources__*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

function resource(path) {
    return __resources__[path].data;
}

(function () {
    var process = {};
    var modulePaths = ['/__builtin__', '/__builtin__/libs', '/libs', '/'];

    var path; // Will be loaded further down

    function resolveModulePath(request, parent) {
        // If not a relative path then search the modulePaths for it
        var start = request.substring(0, 2);
        if (start !== "./" && start !== "..") {
            return modulePaths;
        }

        var parentIsIndex = path.basename(parent.filename).match(/^index\.js$/),
            parentPath    = parentIsIndex ? parent.id : path.dirname(parent.id);

        // Relative path so searching inside parent's directory
        return [path.dirname(parent.filename)];
    }

    function findModulePath(id, dirs) {
        if (id.charAt(0) === '/') {
            dirs = [''];
        }
        for (var i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            var p = path.join(dir, id);

            // Check for index first
            if (path.exists(path.join(p, 'index.js'))) {
                return path.join(p, 'index.js');
            } else if (path.exists(p + '.js')) {
                return p + '.js';
            }
        }

        return false;
    }

    function loadModule(request, parent) {
        parent = parent || process.mainModule;

        var paths    = resolveModulePath(request, parent),
            filename = findModulePath(request, paths);

        if (filename === false) {
            throw "Unable to find module: " + request;
        }


        if (parent) {
            var cachedModule = parent.moduleCache[filename];
            if (cachedModule) {
                return cachedModule;
            }
        }

        //console.log('Loading module: ', filename);

        var module = new Module(filename, parent);

        // Assign main module to process
        if (request == __main_module_name__ && !process.mainModule) {
            process.mainModule = module;
        }

        // Run all the code in the module
        module._initialize(filename);

        return module;
    }

    function Module(id, parent) {
        this.id = id;
        this.parent = parent;
        this.children = [];
        this.exports = {};

        if (parent) {
            this.moduleCache = parent.moduleCache;
            parent.children.push(this);
        } else {
            this.moduleCache = {};
        }
        this.moduleCache[this.id] = this;

        this.filename = null;
        this.dirname = null;
    }

    Module.prototype._initialize = function (filename) {
        var module = this;
        function require(request) {
            return loadModule(request, module).exports;
        }

        this.filename = filename;

        // Work around incase this IS the path module
        if (path) {
            this.dirname = path.dirname(filename);
        } else {
            this.dirname = '';
        }

        require.paths = modulePaths;
        require.main = process.mainModule;

        __resources__[this.filename].data.apply(this.exports, [this.exports, require, this, this.filename, this.dirname]);

        return this;
    };

    // Manually load the path module because we need it to load other modules
    path = (new Module('path'))._initialize('/__builtin__/path.js').exports;

    var util = loadModule('util').exports;
    util.ready(function () {
        // Populate globals
        var globals = loadModule('global').exports;
        for (var x in globals) {
            if (globals.hasOwnProperty(x)) {
                window[x] = globals[x];
            }
        }

        process.mainModule = loadModule(__main_module_name__);
        if (process.mainModule.exports.main) {
            process.mainModule.exports.main();
        }

        // Add a global require. Useful in the debug console.
        window.require = function require(request, parent) {
            return loadModule(request, parent).exports;
        };
        window.require.main = process.mainModule;
        window.require.paths = modulePaths;

    });
})();

// vim:ft=javascript

})();
