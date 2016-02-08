/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.GlobalScripts = function ( editor ) {
	var scriptsKey = 'ui/sidebar/global_scripts/scripts';
	var signals = editor.signals;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/global_scripts/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/global_scripts/collapsed', boolean );

	} );

	container.addStatic( new UI.Text( 'Global Scripts' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break() );

	//

	var updateProps;

	var GlobalScriptsComponent = React.createClass({
		updateScripts: function() {
			editor.config.setKey(scriptsKey, this.state.scripts);
			this.setState({
				scripts: editor.config.getKey(scriptsKey)
			});
		},
		getInitialState: function() {
			updateProps = function() {
				this.setState({
					scripts: editor.config.getKey(scriptsKey)
				});
			}.bind(this);

			return {
				scripts: editor.config.getKey(scriptsKey)
			};
		},
		render: function() {
			var scripts = R('div')('className', 'Panel');

			var thisScripts = this.state.scripts;
			var updateScripts = this.updateScripts;

			thisScripts.forEach(function(script) {
				scripts.children([
					R('div')
						.children([
							R('input')
								.style('width', '130px')
								.style('fontSize', '12px')
								('value', script.name)
								('className', 'Input')
								('onKeyDown', function(e) { e.stopPropagation() })
								('onChange', function(e) {
									script.name = e.target.value;
									updateScripts();
								}.bind(this)),
							R('button')
								.style('marginLeft', '4px')
								.child('Edit')
								('className', 'Button')
								('onClick', function() {
									signals.editScript.dispatch({
										name: "global scripts"
									}, script);
								}),
							R('button')
								.style('marginLeft', '4px')
								.child('Remove')
								('className', 'Button')
								('onClick', function() {
									if(confirm( 'Are you sure?' )) {
										var index;
										thisScripts.forEach(function(s, i) {
											if(script === s) {
												index = i;
											}
										});
										thisScripts.splice(index, 1);
										updateScripts();
									}
								}.bind(this))
						])
						('className', 'Panel')
				]);
			}.bind(this));

			scripts.child(R('button')
				.child('New')
				('onClick', function() {
					var script = { name: '', source: "console.log('hello world!')" };

					thisScripts.push(script);
					updateScripts();
				}));

			return scripts.build();
		}
	});

	var panel = new UI.Panel();
	React.render(R(GlobalScriptsComponent).build(),
			panel.dom);

	container.add(panel);

	editor.signals.editorImported.add(function() {
		if(updateProps)
			updateProps();
	});

	editor.signals.editorCleared.add(function() {
		editor.config.setKey(scriptsKey, []);
		if(updateProps)
			updateProps();
	});

	editor.signals.scriptChanged.add(function() {
		editor.config.setKey(scriptsKey, editor.config.getKey(scriptsKey));
	});

	return container;
};
