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

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );

	// class

	var options = {};

	for ( var key in rendererTypes ) {

		if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

		options[ key ] = key;

	}

	var rendererTypeRow = new UI.Row();
	var rendererType = new UI.Select().setOptions( options ).setWidth( '150px' ).onChange( function () {

		var value = this.getValue();

		config.setKey( 'project/renderer', value );

		updateRenderer();

	} );

	rendererTypeRow.add( new UI.Text( 'Renderer' ).setWidth( '90px' ) );
	rendererTypeRow.add( rendererType );

	var row = new UI.Row();

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

	var rendererPropertiesRow = new UI.Row().setMarginLeft( '90px' );

	var rendererAntialias = new UI.THREE.Boolean( config.getKey( 'project/renderer/antialias' ), 'antialias' ).onChange( function () {

		config.setKey( 'project/renderer/antialias', this.getValue() );
		updateRenderer();

	} );
	rendererPropertiesRow.add( rendererAntialias );

	// shadow

	var rendererShadows = new UI.THREE.Boolean( config.getKey( 'project/renderer/shadows' ), 'shadows' ).onChange( function () {

		config.setKey( 'project/renderer/shadows', this.getValue() );
		updateRenderer();

	} );
	rendererPropertiesRow.add( rendererShadows );

	rendererPropertiesRow.add( new UI.Break() );

	// gamma input

	var rendererGammaInput = new UI.THREE.Boolean( config.getKey( 'project/renderer/gammaInput' ), 'γ input' ).onChange( function () {

		config.setKey( 'project/renderer/gammaInput', this.getValue() );
		updateRenderer();

	} );
	rendererPropertiesRow.add( rendererGammaInput );

	// gamma output

	var rendererGammaOutput = new UI.THREE.Boolean( config.getKey( 'project/renderer/gammaOutput' ), 'γ output' ).onChange( function () {

		config.setKey( 'project/renderer/gammaOutput', this.getValue() );
		updateRenderer();

	} );
	rendererPropertiesRow.add( rendererGammaOutput );

	container.add( rendererPropertiesRow );

	// Editable

	var editableRow = new UI.Row();
	var editable = new UI.Checkbox( config.getKey( 'project/editable' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/editable', this.getValue() );

	} );

	editableRow.add( new UI.Text( 'Editable' ).setWidth( '90px' ) );
	editableRow.add( editable );

	container.add( editableRow );

	var vr, orbit;
	
	// VR

	var vrRow = new UI.Row();
	vr = new UI.Checkbox( config.getKey( 'project/vr' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/vr', this.getValue() );
		// updateRenderer();

		if (orbit.getValue()) {
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

		createRenderer( rendererType.getValue(), rendererAntialias.getValue(), rendererShadows.getValue(), rendererGammaInput.getValue(), rendererGammaOutput.getValue() );

	}

	function createRenderer( type, antialias, shadows, gammaIn, gammaOut ) {

		if ( type === 'WebGLRenderer' && System.support.webgl === false ) {

			type = 'CanvasRenderer';

		}

		rendererPropertiesRow.setDisplay( type === 'WebGLRenderer' ? '' : 'none' );

		var renderer = new rendererTypes[ type ]( { antialias: antialias} );
		renderer.gammaInput = gammaIn;
		renderer.gammaOutput = gammaOut;
		if ( shadows && renderer.shadowMap ) {

			renderer.shadowMap.enabled = true;
			// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		}

		signals.rendererChanged.dispatch( renderer );

	}

	createRenderer( config.getKey( 'project/renderer' ), config.getKey( 'project/renderer/antialias' ), config.getKey( 'project/renderer/shadows' ), config.getKey( 'project/renderer/gammaInput' ), config.getKey( 'project/renderer/gammaOutput' ) );

	return container;

};
