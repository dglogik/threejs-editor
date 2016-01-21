/**
 * @author Michael Bullington <m.bullington@dglogik.com>
 */

Sidebar.Data = function (editor) {
  var collapsedKey = 'ui/sidebar/data/collapsed';
  var paramsKey = 'ui/sidebar/data/params';

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

  var params = config.getKey(paramsKey);

  function addParam(name) {
    if(params[name])
      return;

    params[name] = {
      type: 'string',
      value: ''
    };

    config.setKey(paramsKey, params);
  }

  function updateParam(name, key, value) {
    if(!params[name])
      return;
    params[name][key] = value;
    config.setKey(paramsKey, params);
  }

  function deleteParam(name) {
    if(!params[name])
      return;
    delete params[name];
    config.setKey(paramsKey, params);
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

  function createData(name, valueConfig, typeConfig) {
    addParam(name);
    var row = new UI.Panel();
    var rowOptions = new UI.Panel();
    var rowFlexEnd = new UI.Panel();

    var type = new UI.Select().setOptions(options).setWidth('60px').onChange(function() {
      updateParam(name, 'type', type.getValue());
    }).setValue(typeConfig);

    var input = new UI.Input().setWidth('150px').onChange(function() {
      var value = input.getValue();
      updateData(name, value, type.getValue());
    }).setValue(valueConfig);

    row.add(new UI.Text(name).setWidth('90px').setClass('sidebar-data-title'));
    row.add(input);

    var removeButton = new UI.Button('Remove').setMarginLeft('10px');

    removeButton.onClick(function() {
      deleteParam(name);
      container.remove(row, rowFlexEnd);
    });

    rowOptions.setClass('Panel sidebar-data-entry');
    rowOptions.add(type);
    rowOptions.add(removeButton);

    rowFlexEnd.setClass('Panel sidebar-data-flex-end');
    rowFlexEnd.add(rowOptions);

    container.add(row, rowFlexEnd);
  }

  var srow = new UI.Panel();

  srow.add(new UI.Text('Symbol Name').setWidth('90px').setClass('sidebar-data-title'));

  var sinput = new UI.Input().setWidth('150px').onChange(function() {
    config.setKey('ui/sidebar/data/name', sinput.getValue());
  }).setValue(config.getKey('ui/sidebar/data/name'));
  srow.add(sinput);

  container.add(srow);

  var row = new UI.Panel();

  var input = new UI.Input().setValue("parameter").setWidth('150px');
  var newButton = new UI.Button('New').setMarginLeft('10px');

  newButton.onClick(function() {
    createData(input.getValue(), '', 'string');
  });

  row.setClass('Panel sidebar-data-flex');
  row.add(input);
  row.add(newButton);

  container.add(row);

  dgframe.onReady(function() {
    Object.keys(params).forEach(function(key) {
      var param = params[key];
      createData(key, param.default, param.type);
      updateData(key, param.default, param.type);
    });
  });

	return container;
}
