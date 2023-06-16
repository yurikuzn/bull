
/**
 * Credits to Backbone.js.
 * Copyright (c) 2010-2022 Jeremy Ashkenas, DocumentCloud
 */

/**
 * An Events mixin.
 *
 * @alias Bull.Events
 */
const Events = {};

if ('Backbone' in window) {
    /** For backward compatibility. */
    window.Backbone.Events = Events;
}

const eventSplitter = /\s+/;

let _listening;

const eventsApi = (iteratee, events, name, callback, opts) => {
    let i = 0, names;

    if (name && typeof name === 'object') {
        // Handle event maps.
        if (callback !== void 0 && 'context' in opts && opts.context === void 0) {
            opts.context = callback;
        }

        for (names = _.keys(name); i < names.length ; i++) {
            events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
        }
    } else if (name && eventSplitter.test(name)) {
        // Handle space-separated event names by delegating them individually.
        for (names = name.split(eventSplitter); i < names.length; i++) {
            events = iteratee(events, names[i], callback, opts);
        }
    } else {
        // Finally, standard events.
        events = iteratee(events, name, callback, opts);
    }

    return events;
};

/**
 * Subscribe to an event.
 *
 * @param {string} name An event.
 * @param {Bull.Events~callback} callback A callback.
 * @param {Object} [context] Deprecated.
 */
Events.on = function (name, callback, context) {
    this._events = eventsApi(onApi, this._events || {}, name, callback, {
        context: context,
        ctx: this,
        listening: _listening,
    });

    if (_listening) {
        let listeners = this._listeners || (this._listeners = {});

        listeners[_listening.id] = _listening;
        // Allow the listening to use a counter, instead of tracking
        // callbacks for library interop
        _listening.interop = false;
    }

    return this;
};

/**
 * Subscribe to an event of other object.
 *
 * @param {Object} other What to listen.
 * @param {string} name An event.
 * @param {Bull.Events~callback} callback A callback.
 */
Events.listenTo = function (other, name, callback) {
    if (!other) {
        return this;
    }

    let id = other._listenId || (other._listenId = _.uniqueId('l'));
    let listeningTo = this._listeningTo || (this._listeningTo = {});
    let listening = _listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Set up the necessary references to track the listening callbacks.
    if (!listening) {
        this._listenId || (this._listenId = _.uniqueId('l'));

        listening = _listening = listeningTo[id] = new Listening(this, other);
    }

    // Bind callbacks on obj.
    let error = tryCatchOn(other, name, callback, this);
    _listening = void 0;

    if (error) {
        throw error;
    }

    // If the target obj is not Backbone.Events, track events manually.
    if (listening.interop) {
        listening.on(name, callback);
    }

    return this;
};

const onApi = (events, name, callback, options) => {
    if (callback) {
        let handlers = events[name] || (events[name] = []);
        let context = options.context, ctx = options.ctx, listening = options.listening;

        if (listening) {
            listening.count++;
        }

        handlers.push({callback: callback, context: context, ctx: context || ctx, listening: listening});
    }

    return events;
};

const tryCatchOn = (obj, name, callback, context) => {
    try {
        obj.on(name, callback, context);
    } catch (e) {
        return e;
    }
};

/**
 * Unsubscribe from an event or all events.
 *
 * @function off
 * @memberof Bull.Events
 * @param {string} [name] From a specific event.
 * @param {Bull.Events~callback} [callback] From a specific callback.
 * @param {Object} [context] Deprecated.
 */
Events.off = function(name, callback, context) {
    if (!this._events) {
        return this;
    }

    this._events = eventsApi(offApi, this._events, name, callback, {
        context: context,
        listeners: this._listeners
    });

    return this;
};

/**
 * Stop listening to other object. No arguments will remove all listeners.
 *
 * @param {Object} [other] To remove listeners to a specific object.
 * @param {string} [name] To remove listeners to a specific event.
 * @param {Bull.Events~callback} [callback] To remove listeners to a specific callback.
 */
Events.stopListening = function (other, name, callback) {
    let listeningTo = this._listeningTo;

    if (!listeningTo) {
        return this;
    }

    let ids = other ? [other._listenId] : _.keys(listeningTo);

    for (let i = 0; i < ids.length; i++) {
        let listening = listeningTo[ids[i]];

        // If listening doesn't exist, this object is not currently
        // listening to obj. Break out early.
        if (!listening) {
            break;
        }

        listening.obj.off(name, callback, this);

        if (listening.interop) {
            listening.off(name, callback);
        }
    }

    if (_.isEmpty(listeningTo)) {
        this._listeningTo = void 0;
    }

    return this;
};

const offApi = (events, name, callback, options) => {
    if (!events) {
        return;
    }

    let context = options.context, listeners = options.listeners;
    let i = 0, names;

    // Delete all event listeners and "drop" events.
    if (!name && !context && !callback) {
        for (names = _.keys(listeners); i < names.length; i++) {
            listeners[names[i]].cleanup();
        }

        return;
    }

    names = name ? [name] : _.keys(events);

    for (; i < names.length; i++) {
        name = names[i];
        let handlers = events[name];

        // Bail out if there are no events stored.
        if (!handlers) {
            break;
        }

        // Find any remaining events.
        let remaining = [];

        for (let j = 0; j < handlers.length; j++) {
            let handler = handlers[j];

            if (
                callback && callback !== handler.callback &&
                callback !== handler.callback._callback ||
                context && context !== handler.context
            ) {
                remaining.push(handler);
            } else {
                let listening = handler.listening;

                if (listening) {
                    listening.off(name, callback);
                }
            }
        }

        // Replace events if there are any remaining.  Otherwise, clean up.
        if (remaining.length) {
            events[name] = remaining;
        } else {
            delete events[name];
        }
    }

    return events;
};

/**
 * Subscribe to an event. Fired once.
 *
 * @param {string} name An event.
 * @param {Bull.Events~callback} callback A callback.
 * @param {Object} [context] Deprecated.
 */
Events.once = function (name, callback, context) {
    // Map the event into a `{event: once}` object.
    let events = eventsApi(onceMap, {}, name, callback, this.off.bind(this));

    if (typeof name === 'string' && context == null) {
        callback = void 0;
    }

    return this.on(events, callback, context);
};

/**
 * Subscribe to an event of other object. Fired once. Will be automatically unsubscribed on view removal.
 *
 * @param {Object} other What to listen.
 * @param {string} name An event.
 * @param {Bull.Events~callback} callback A callback.
 */
Events.listenToOnce = function (other, name, callback) {
    // Map the event into a `{event: once}` object.
    let events = eventsApi(onceMap, {}, name, callback, this.stopListening.bind(this, other));

    return this.listenTo(other, events);
};

let onceMap = function (map, name, callback, offer) {
    if (callback) {
        let once = map[name] = _.once(function() {
            offer(name, once);
            callback.apply(this, arguments);
        });

        once._callback = callback;
    }

    return map;
};

/**
 * Trigger an event.
 *
 * @param {string} name An event.
 * @param {...*} arguments Arguments.
 */
Events.trigger = function(name) {
    if (!this._events) {
        return this;
    }

    let length = Math.max(0, arguments.length - 1);
    let args = Array(length);

    for (let i = 0; i < length; i++) {
        args[i] = arguments[i + 1];
    }

    eventsApi(triggerApi, this._events, name, void 0, args);

    return this;
};

const triggerApi = (objEvents, name, callback, args) => {
    if (objEvents) {
        let events = objEvents[name];
        let allEvents = objEvents.all;

        if (events && allEvents) {
            allEvents = allEvents.slice();
        }

        if (events) {
            triggerEvents(events, args);
        }

        if (allEvents) {
            triggerEvents(allEvents, [name].concat(args));
        }
    }

    return objEvents;
};

const triggerEvents = (events, args) => {
    let ev,
        i = -1,
        l = events.length,
        a1 = args[0],
        a2 = args[1],
        a3 = args[2];

    switch (args.length) {
        case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
        case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
        case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
        case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
        default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
};

const Listening = function(listener, obj) {
    this.id = listener._listenId;
    this.listener = listener;
    this.obj = obj;
    this.interop = true;
    this.count = 0;
    this._events = void 0;
};

Listening.prototype.on = Events.on;

Listening.prototype.off = function (name, callback) {
    let cleanup;

    if (this.interop) {
        this._events = eventsApi(offApi, this._events, name, callback, {
            context: void 0,
            listeners: void 0
        });

        cleanup = !this._events;
    }
    else {
        this.count--;

        cleanup = this.count === 0;
    }

    if (cleanup) {
        this.cleanup();
    }
};

Listening.prototype.cleanup = function () {
    delete this.listener._listeningTo[this.obj._listenId];

    if (!this.interop) {
        delete this.obj._listeners[this.id];
    }
};

export default Events;
