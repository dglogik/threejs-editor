/**
 * @author Michael Bullington <m.bullington@dglogik.com>
 */

Sidebar.Data = function (editor) {
  var collapsedKey = 'ui/sidebar/data/collapsed';
  var paramsKey = 'ui/sidebar/data/params';
  var symbolKey = 'ui/sidebar/data/name';

	var config = editor.config;
	var signals = editor.signals;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed(collapsedKey);
	container.onCollapsedChange(function(collapsed) {
		config.setKey(collapsedKey, collapsed);
	});

	container.addStatic(new UI.Text('DATA'));
	container.add(new UI.Break());

  var options = {
    string: 'string',
    number: 'number',
    bool: 'bool',
    tabledata: 'tabledata',
    dynamic: 'dynamic'
  };

  var updateProps;

  function addParam(name) {
    var params = config.getKey(paramsKey);

    if(params[name])
      return;

    params[name] = {
      type: 'string',
      'default': ''
    };

    config.setKey(paramsKey, params);
    if(updateProps)
      updateProps();
  }

  function updateParam(name, key, value) {
    var params = config.getKey(paramsKey);

    if(!params[name])
      return;
    params[name][key] = value;
    config.setKey(paramsKey, params);
    if(updateProps)
      updateProps();
  }

  function deleteParam(name) {
    var params = config.getKey(paramsKey);

    if(!params[name])
      return;
    delete params[name];
    config.setKey(paramsKey, params);
    if(updateProps)
      updateProps();
  }

  function updateData(name, value, type) {
    updateParam(name, 'default', value);

    switch(type) {
      case 'string':
        dgframe.updateParam(name, value);
        dgframe.emit(name, value);
        break;
      case 'number':
        if(!isNaN(parseFloat(value))) {
          var num = parseFloat(value);
          dgframe.updateParam(name, num);
          dgframe.emit(name, num);
        }
        break;
      case 'bool':
        if(value === 'true' || value === 'false') {
          var bool = value === 'true';
          dgframe.updateParam(name, bool);
          dgframe.emit(name, bool);
        }
        break;
      default:
        try {
          var json = JSON.parse(value);
          dgframe.updateParam(name, json);
          dgframe.emit(name, json);
        } catch(e) {}
        break;
    }
  }

  var DataComponent = React.createClass({
    getInitialState: function() {
      updateProps = function() {
        this.setState({
          params: config.getKey(paramsKey),
          symbolName: config.getKey(symbolKey),
          newParamName: this.state.newParamName
        });
      }.bind(this);

      return {
        params: config.getKey(paramsKey),
        symbolName: config.getKey(symbolKey),
        newParamName: 'parameter'
      };
    },
    render: function() {
      var parent = R('div');

      parent.children([
        R('div')
          .children([
            R('span')
              .style('width', '90px')
              .child('Symbol Name')
              ('className', 'Text sidebar-data-title'),
            R('input')
              .style('width', '150px')
              .style('marginLeft', '10px')
              ('className', 'Input')
              ('value', this.state.symbolName)
              ('onKeyDown', function(e) { e.stopPropagation() })
              ('onChange', function(e) {
                config.setKey(symbolKey, e.target.value);
                updateProps();
              }),
          ])
          ('className', 'Panel'),
        R('div')
          .children([
            R('input')
              .style('width', '150px')
              ('className', 'Input')
              ('value', this.state.newParamName)
              ('onKeyDown', function(e) { e.stopPropagation() })
              ('onChange', function(e) {
                this.state.newParamName = e.target.value;
                updateProps();
              }.bind(this)),
            R('button')
              .child('New')
              .style('marginLeft', '10px')
              ('className', 'Button')
              ('onClick', function() {
                addParam(this.state.newParamName);
              }.bind(this))
          ])
          ('className', 'Panel sidebar-data-flex')
      ]);

      Object.keys(this.state.params).forEach(function(key) {
        var param = this.state.params[key];

        parent.child(
          R('div').children([
            R('div')
              .children([
                R('span')
                  .style('width', '90px')
                  .child(key),
                R('input')
                  .style('width', '150px')
                  .style('marginLeft', '10px')
                  ('className', 'Input')
                  ('value', param.default)
                  ('onKeyDown', function(e) { e.stopPropagation() })
                  ('onChange', function(e) {
                    updateData(key, e.target.value, param.type);
                  })
              ])
              ('className', 'Panel'),
            R('div')
              .child(R('div')
                .children([
                  R('select')
                    .children(Object.keys(options).map(function(opt) {
                      return R('option')('value', opt).child(options[opt]);
                    }))
                    .style('width', '60px')
                    ('value', param.type)
                    ('onChange', function(e) {
                      updateParam(key, 'type', e.target.value);
                    }),
                  R('button')
                    .child('Remove')
                    .style('marginLeft', '10px')
                    ('className', 'Button')
                    ('onClick', function() {
                      deleteParam(key);
                    })
                ])
                ('className', 'Panel sidebar-data-entry'))
              ('className', 'Panel sidebar-data-flex-end')
          ])
        );
      }.bind(this));

      return parent.build();
    }
  });

  var panel = new UI.Panel();
	React.render(R(DataComponent).build(),
			panel.dom);

	container.add(panel);

  dgframe.onReady(function() {
    if(updateProps)
      updateProps();
  });

  editor.signals.editorImported.add(function() {
    if(updateProps)
      updateProps();
  });

  editor.signals.editorCleared.add(function() {
    config.setKey(paramsKey, {});
    if(updateProps)
      updateProps();
  });

	return container;
}
