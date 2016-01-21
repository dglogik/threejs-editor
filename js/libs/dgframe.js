(function() {
  // yet another lightweight event emitter implementation for browser
  // but it's obviously better...? yeah, probably not
  function EventEmitter() {
    Object.defineProperty(this, '_listeners', {
      value: {}
    });
  }

  EventEmitter.prototype = {
    emit: function(name) {
      var args = [];
      var count = 1;
      var length = arguments.length;

      for(; count < length; count++) {
        args.push(arguments[count]);
      }

      (this._listeners[name] || []).forEach(function(f) {
        f.apply(this, args);
      }, this);

      return this;
    },
    on: function(name, listener) {
      if(!this._listeners[name])
        this._listeners[name] = [];
      this._listeners[name].push(listener);

      var emitter = Object.create(this);
      var removeListener = emitter.removeListener;
      emitter.removeListener = function(n, l) {
        if(!n && !l) {
          removeListener.call(this, name, listener);
          return;
        }
        removeListener.call(this, n, l);
      };
      return emitter;
    },
    removeListener: function(name, listener) {
      if(!this._listeners[name] || this._listeners[name].indexOf(listener) === -1)
        return null;
      return this._listeners[name].splice(this._listeners[name].indexOf(listener), 1);
    }
  };

  // event emitter used for parameter updates
  var frame = new EventEmitter();
  Object.defineProperty(frame, '_readyListeners', {
    value: []
  });

  frame.onReady = function(listener) {
    frame._readyListeners.push(listener);
  };

  // raw object to get/set values, setting requires a call to pushParams
  frame.params = {};

  // could be used elsewhere in application, which is why it's publically exposed
  frame.EventEmitter = EventEmitter;

  // is the value a table?
  frame.isTable = function(val) {
    return (val != null && typeof(val) == 'object' &&
        val.hasOwnProperty('cols') &&
        val.hasOwnProperty('rows') &&
        Array.isArray(val.cols) &&
        Array.isArray(val.rows));
  };

  // pushes a parameter change upstream to DGLux
  frame.updateParam = function(key, value) {
    var updates = {};
    var i = 0;
    var length = arguments.length % 2 === 1 ? arguments.length - 1 : arguments.length;

    for(; i < length; i++) {
      if(i % 2 == 1)
        continue;
      updates[arguments[i]] = arguments[i + 1];
      frame.params[arguments[i]] = arguments[i + 1];
    }

    window.parent.postMessage({
      dgIframe: dgIframeId,
      changes: updates
    }, '*');
  };

  // pushes all params in dgframe.params upstream to DGLux
  frame.pushParams = function(params) {
    params = params || frame.params;
    Object.keys(params).forEach(function(key) {
      frame.updateParam(key, params[key]);
    });
  };

  // used in messages between iframe and DGLux
  var dgIframeId;

  // interface to the dglux5 application
  function onDGFrameMessage(e) {
    var data = e.data;

    if(typeof(data) === 'object') {
      // initial message
      if(data.hasOwnProperty('dgIframeInit')) {
        dgIframeId = data['dgIframeInit'];

        if(window.parent != null) {
          // the first post back shouldn't contain any data change
          window.parent.postMessage({
            dgIframe: dgIframeId
          }, '*');

          frame._readyListeners.forEach(function(listener) {
            listener();
          });
        }
      } else if(data.hasOwnProperty('dgIframeUpdate')) {
        var updates = data['updates'];

        if(typeof(updates) == 'object') {
          for (key in updates) {
            if (updates.hasOwnProperty(key)) {
              frame.params[key] = updates[key];

              // an example of using event emitter would be like...
              // dgframe.on('test_param', function(value, isTable) { /* ... */});
              frame.emit(key, updates[key], frame.isTable(updates[key]));
            }
          }
        }
      }
    }
  }

  window.addEventListener('message', onDGFrameMessage);

  // used for testing, development environments outside of DGLux, etc.
  frame.foreign = {
    init: function() {
      window.postMessage({
        dgIframeInit: 1
      }, "*");
    },
    updateParam: function(key, value) {
      var updates = {};
      var i = 0;
      var length = arguments.length % 2 === 1 ? arguments.length - 1 : arguments.length;

      for(; i < length; i++) {
        if(i % 2 == 1)
          continue;
        updates[arguments[i]] = arguments[i + 1];
      }

      window.postMessage({
        dgIframeUpdate: true,
        updates: updates
      }, "*");
    }
  };

  frame.dashboard = {
    exportIFrameDashboard: function(indexUrl, symbolName, params, cb) {
      var symbols = {};

      symbols[symbolName] = {
        '@type': 'iframe',
        width: '100%',
        height: '100%',
        url: indexUrl,
        '@params': {
          '!reuse': true,
          '!var': params.map(function(param) {
            return {
              n: param.name,
              t: param.type
            };
          }),
          '!layout': {
            type: 'vbox',
            children: params.map(function(param) { return param.name; })
          },
        },
        '@W': 1165,
        '@H': 715
      };

      params.forEach(function(param) {
        if(param.default) {
          symbols[symbolName]['@params'][param.name] = param.default;
        }
      });

      var index = JSON.stringify({
        '@type': 'group',
        '@ver': 5516,
        index: {
          '@type': 'symbol',
          symbol: symbolName,
          width: '100%',
          height: '100%'
        },
        width: '100%',
        height: '100%',
        clipContent: true,
        '@array': [
          ['index']
        ],
        '@symbols': symbols
      });

      var proj = JSON.stringify({
        owner: 'dgSuper',
        name: symbolName,
        isTemplate: false,
        canRead: [],
        canWrite: ['*']
      });

      if(cb) {
        cb('index.dg5', index);
        cb('_proj.json', proj);
      }

      return {
        'index.dg5': index,
        '_proj.json': proj
      };
    }
  };

  try {
    if(module && module.exports) {
      module.exports = frame;
    } else {
      window.dgframe = frame;
    }
  } catch(e) {
    window.dgframe = frame;
  }
})();
