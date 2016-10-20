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

	var option = new UI.Row();
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

	var option = new UI.Row();
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

		saveString( output, 'scene.json' );
	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Publish

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Publish' );
	option.onClick( function () {

		var zip = new JSZip();

		//
		
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

		var output = editor.toJSON();
		output.metadata.type = 'App';
		delete output.history;

		var vr = output.project.vr;
		var orbit = output.project.orbit;

		output = JSON.stringify( output, null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		zip.file(projectName + '/assets/' + symbolName + '.json', output );

		//

		var manager = new THREE.LoadingManager( function () {

			save( zip.generate( { type: 'blob' } ), 'download.zip' );

		} );

		var loader = new THREE.XHRLoader( manager );
		loader.load( 'js/libs/app/index.html', function ( content ) {

			var includes = [];

			if ( vr ) {

				includes.push( '<script src="js/VRControls.js"></script>' );
				includes.push( '<script src="js/VREffect.js"></script>' );
				includes.push( '<script src="js/WebVR.js"></script>' );

			}
			
			if (orbit) {
				includes.push('<script src="js/OrbitControls.js"></script>')
			}

			content = content.replace( '<!-- includes -->', includes.join( '\n\t\t' ) );
			
			content = content.replace('<!-- symbolName -->', symbolName);

			zip.file(projectName + '/assets/index.html', content );

		} );
		loader.load( 'js/libs/app.js', function ( content ) {

			zip.file( projectName + '/assets/js/app.js', content );

		} );
		
		loader.load('dgframe/index.js', function(content) {
			zip.file(projectName + '/assets/js/dgframe.js', content);
		});
		
		loader.load( '../build/three.min.js', function ( content ) {

			zip.file(projectName + '/assets/js/three.min.js', content );

		} );

		if ( vr ) {

			loader.load( 'js/controls/VRControls.js', function ( content ) {

				zip.file(projectName + '/assets/js/VRControls.js', content );

			} );

			loader.load( '.js/effects/VREffect.js', function ( content ) {

				zip.file(projectName + '/assets/js/VREffect.js', content );

			} );

			loader.load( 'js/WebVR.js', function ( content ) {

				zip.file(projectName + '/assets/js/WebVR.js', content );

			} );

		}
		
		if (orbit) {
			loader.load('js/controls/OrbitControls.js', function(content) {
				zip.file(projectName + '/assets/js/OrbitControls.js', content);
			})
		}

	} );
	options.add( option );

	/*
	// Publish (Dropbox)

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Publish (Dropbox)' );
	option.onClick( function () {

		var parameters = {
			files: [
				{ 'url': 'data:text/plain;base64,' + window.btoa( "Hello, World" ), 'filename': 'app/test.txt' }
			]
		};

		Dropbox.save( parameters );

	} );
	options.add( option );
	*/


	//

	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link ); // Firefox workaround, see #6594

	function save( blob, filename ) {

		link.href = URL.createObjectURL( blob );
		link.download = filename || 'data.json';
		link.click();

		// URL.revokeObjectURL( url ); breaks Firefox...

	}

	function saveString( text, filename ) {

		save( new Blob( [ text ], { type: 'text/plain' } ), filename );

	}

	return container;

};
