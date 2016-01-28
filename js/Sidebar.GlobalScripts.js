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

	var scriptsContainer = new UI.Panel();
	container.add( scriptsContainer );

	function addScript(script) {

		var name = new UI.Input( script.name ).setWidth( '130px' ).setFontSize( '12px' );
		name.onChange( function () {
			script.name = this.getValue();
			editor.config.setKey(scriptsKey, scripts);
		} )
		scriptsContainer.add( name );

		var edit = new UI.Button( 'Edit' );
		edit.setMarginLeft( '4px' );
		edit.onClick( function () {

			signals.editScript.dispatch({
				name: "global scripts"
			}, script);

		} );
		scriptsContainer.add( edit );

		var b = new UI.Break();
		var remove = new UI.Button( 'Remove' );
		remove.setMarginLeft( '4px' );
		remove.onClick( function () {

			if ( confirm( 'Are you sure?' ) ) {
				scriptsContainer.remove(name, edit, remove, b);

				var index;
				scripts.forEach(function(s, i) {
					if(script === s) {
						index = i;
					}
				});
				scripts.splice(index, 1);

				editor.config.setKey(scriptsKey, scripts);
			}

		} );
		scriptsContainer.add( remove, b );
	}

	var newScript = new UI.Button( 'New' );
	newScript.onClick( function () {
		var script = { name: '', source: "console.log('hello world!')" };
		var scripts = editor.config.getKey(scriptsKey);

		scripts.push(script);
		editor.config.setKey(scriptsKey, scripts);
		addScript(script);
	} );
	container.add( newScript );

	var scripts = editor.config.getKey(scriptsKey);
	scripts.forEach(function(script) {
		addScript(script);
	});

	editor.signals.editorImported.add(function() {
		scriptsContainer.clear();

		var scripts = editor.config.getKey(scriptsKey);
		scripts.forEach(function(script) {
			addScript(script);
		});
	});

	editor.signals.scriptChanged.add(function() {
		editor.config.setKey(scriptsKey, editor.config.getKey(scriptsKey));
	});

	return container;
};
