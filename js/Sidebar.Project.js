/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Project = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;

	var rendererTypes = {

		'WebGLRenderer': THREE.WebGLRenderer,
		'CanvasRenderer': THREE.CanvasRenderer,
		'SVGRenderer': THREE.SVGRenderer,
		'SoftwareRenderer': THREE.SoftwareRenderer,
		'RaytracingRenderer': THREE.RaytracingRenderer

	};

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( config.getKey( 'ui/sidebar/project/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		config.setKey( 'ui/sidebar/project/collapsed', boolean );

	} );

	container.addStatic( new UI.Text( 'PROJECT' ) );
	container.add( new UI.Break() );

	// class

	var options = {};

	for ( var key in rendererTypes ) {

		if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

		options[ key ] = key;

	}

	var rendererTypeRow = new UI.Panel();
	var rendererType = new UI.Select().setOptions( options ).setWidth( '150px' ).onChange( function () {

		var value = this.getValue();

		if ( value === 'WebGLRenderer' ) {

			rendererPropertiesRow.setDisplay( '' );

		} else {

			rendererPropertiesRow.setDisplay( 'none' );

		}

		config.setKey( 'project/renderer', value );
		updateRenderer();

	} );

	rendererTypeRow.add( new UI.Text( 'Renderer' ).setWidth( '90px' ) );
	rendererTypeRow.add( rendererType );

	var row = new UI.Panel();

	row.add(new UI.Text('Project Name').setWidth('90px').setClass('sidebar-data-title'));

	var input = new UI.Input().setWidth('150px').onChange(function() {
		config.setKey('ui/sidebar/project/name', input.getValue());
	}).setValue(config.getKey('ui/sidebar/project/name'));
	row.add(input);

	container.add( rendererTypeRow );
	container.add(row);

	if ( config.getKey( 'project/renderer' ) !== undefined ) {

		rendererType.setValue( config.getKey( 'project/renderer' ) );

	}

	// antialiasing

	var rendererPropertiesRow = new UI.Panel();
	rendererPropertiesRow.add( new UI.Text( '' ).setWidth( '90px' ) );

	var rendererAntialiasSpan = new UI.Span().setMarginRight( '10px' );
	var rendererAntialias = new UI.Checkbox( config.getKey( 'project/renderer/antialias' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/renderer/antialias', this.getValue() );
		updateRenderer();

	} );

	rendererAntialiasSpan.add( rendererAntialias );
	rendererAntialiasSpan.add( new UI.Text( 'antialias' ).setMarginLeft( '3px' ) );

	rendererPropertiesRow.add( rendererAntialiasSpan );

	// shadow

	var rendererShadowsSpan = new UI.Span();
	var rendererShadows = new UI.Checkbox( config.getKey( 'project/renderer/shadows' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/renderer/shadows', this.getValue() );
		updateRenderer();

	} );

	rendererShadowsSpan.add( rendererShadows );
	rendererShadowsSpan.add( new UI.Text( 'shadows' ).setMarginLeft( '3px' ) );

	rendererPropertiesRow.add( rendererShadowsSpan );

	container.add( rendererPropertiesRow );

	// VR

	var vr, orbit;

	var vrRow = new UI.Panel();
	vr = new UI.Checkbox( config.getKey( 'project/vr' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/vr', this.getValue() );
		// updateRenderer();
		if(orbit.getValue()) {
			orbit.setValue(false);
			config.setKey('project/orbit', false);
		}
	} );

	vrRow.add( new UI.Text( 'VR' ).setWidth( '90px' ) );
	vrRow.add( vr );

	container.add( vrRow );

	// ORBIT

	var orbitRow = new UI.Panel();
	orbit = new UI.Checkbox(config.getKey('project/orbit')).setLeft('100px').onChange(function() {
		config.setKey('project/orbit', this.getValue());

		if(vr.getValue()) {
			vr.setValue(false);
			config.setKey('project/vr', false);
		}
	});

	orbitRow.add(new UI.Text('ORBIT').setWidth('90px'));
	orbitRow.add(orbit);

	container.add(orbitRow);

	editor.signals.editorImported.add(function() {
		vr.setValue(config.getKey('project/vr'));
		orbit.setValue(config.getKey('project/orbit'));
		input.setValue(config.getKey('ui/sidebar/project/name'));
		rendererShadows.setValue(config.getKey('project/renderer/shadows'));
	});

	//

	function updateRenderer() {

		createRenderer( rendererType.getValue(), rendererAntialias.getValue(), rendererShadows.getValue() );

	}

	function createRenderer( type, antialias, shadows ) {

		if ( type === 'WebGLRenderer' && System.support.webgl === false ) {

			type = 'CanvasRenderer';

		}

		var renderer = new rendererTypes[ type ]( { antialias: antialias } );
		if ( shadows && renderer.shadowMap ) renderer.shadowMap.enabled = true;
		signals.rendererChanged.dispatch( renderer );

	}

	createRenderer( config.getKey( 'project/renderer' ), config.getKey( 'project/renderer/antialias' ), config.getKey( 'project/renderer/shadows' ) );

	return container;

}
