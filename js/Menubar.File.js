/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.File = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'File' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// New

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'New' );
	option.onClick( function () {

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

			editor.clear();

		}

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Import

	var fileInput = document.createElement( 'input' );
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function ( event ) {

		editor.loader.loadFile( fileInput.files[ 0 ] );

	} );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Import' );
	option.onClick( function () {

		fileInput.click();

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Export JSON

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export JSON' );
	option.onClick( function () {

		var output = editor.toJSON();

		try {
			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
		} catch ( e ) {
			output = JSON.stringify( output );
		}

		exportString( output, 'scene.json' );

	} );
	options.add( option );

	// Publish

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Publish' );
	option.onClick( function () {

		var camera = editor.camera;

		var zip = new JSZip();

		var params = editor.config.getKey('ui/sidebar/data/params');
		var values = [];

		Object.keys(params).forEach(function(key) {
			var param = params[key];
			values.push({
				name: key,
				type: param.type,
				'default': param.default
			});
		});

		var projectName = editor.config.getKey('ui/sidebar/project/name');
		var symbolName = editor.config.getKey('ui/sidebar/data/name');
		
		dgframe.dashboard.exportIFrameDashboard({
			projectName: projectName,
			symbolName: symbolName,
			params: values,
			callback: zip.file.bind(zip)
		});

		zip.file(projectName + '/assets/index.html', [

			'<!DOCTYPE html>',
			'<html lang="en">',
			'	<head>',
			'		<title>three.js</title>',
			'		<meta charset="utf-8">',
			'		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">',
			'		<style>',
			'		body {',
			'			margin: 0px;',
			'			overflow: hidden;',
			'		}',
			'		</style>',
			'	</head>',
			'	<body ontouchstart="">',
			'		<script src="js/three.min.js"></script>',
			'		<script src="js/orbit.js"></script>',
			'		<script src="js/app.js"></script>',
			' 	<script src="js/dgframe.js"></script>',
			'		<script>',
			'',
			'			var loader = new THREE.XHRLoader();',
			'			loader.load( \'' + symbolName + '.json\', function ( text ) {',
			'',
			'				var player = new APP.Player();',
			'				player.load( JSON.parse( text ) );',
			'				player.setSize( window.innerWidth, window.innerHeight );',
			'				player.play();',
			'',
			'				document.body.appendChild( player.dom );',
			'',
			'				window.addEventListener( \'resize\', function () {',
			'					player.setSize( window.innerWidth, window.innerHeight );',
			'				} );',
			'',
			'			} );',
			'',
			'		</script>',
			'	</body>',
			'</html>'

		].join( '\n' ) );

		//

		var output = editor.toJSON();
		output = JSON.stringify( output, null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		zip.file(projectName + '/assets/' + symbolName + '.json', output );

		//

		var manager = new THREE.LoadingManager( function () {

			location.href = 'data:application/zip;base64,' + zip.generate();

		} );

		var loader = new THREE.XHRLoader( manager );
		loader.load( 'js/libs/app.js', function ( content ) {

			zip.file(projectName + '/assets/js/app.js', content );

		} );

		loader.load( 'js/libs/three.min.js', function ( content ) {

			zip.file(projectName + '/assets/js/three.min.js', content );

		} );

		loader.load('js/controls/OrbitControls.js', function(content) {
			zip.file(projectName + '/assets/js/orbit.js', content);
		});

		loader.load('dgframe/index.js', function(content) {
			zip.file(projectName + '/assets/js/dgframe.js', content);
		});

	} );
	options.add( option );


	//

	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link ); // Firefox workaround, see #6594

	var exportString = function ( output, filename ) {

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		link.href = objectURL;
		link.download = filename || 'data.json';
		link.target = '_blank';

		var event = document.createEvent("MouseEvents");
		event.initMouseEvent(
			"click", true, false, window, 0, 0, 0, 0, 0
			, false, false, false, false, 0, null
		);
		link.dispatchEvent(event);

	};

	return container;

};
