/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Help = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Help' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// Source code

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Source code' );
	option.onClick( function () {

		window.open( 'https://github.com/mrdoob/three.js/tree/master/editor', '_blank' )

	} );
	options.add( option );
	
	options.add(new UI.HorizontalRule());

	// About (dglogik)

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Built for DGLux' );
	option.onClick(function () {
		window.open('http://dglogik.com/products/dglux5-ioe-application-platform', '_blank');
	});
	options.add( option );

	// About (three.js)

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Based on three.js' );
	option.onClick(function () {
		window.open('http://threejs.org', '_blank');
	});
	options.add( option );

	return container;

};
