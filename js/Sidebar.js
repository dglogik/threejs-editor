/**
 * @author mrdoob / http://mrdoob.com/
 */

var Sidebar = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'sidebar' );

	//

	var sceneTab = new UI.Text( 'SCENE' ).onClick( onClick );
	var dataTab = new UI.Text( 'DATA' ).onClick( onClick );
	var miscTab = new UI.Text( 'MISC' ).onClick( onClick );

	var tabs = new UI.Div();
	tabs.setId( 'tabs' );
	tabs.add( sceneTab, dataTab, miscTab );
	container.add( tabs );

	function onClick( event ) {

		select( event.target.textContent );

	}

	//

	var scene = new UI.Span().add(
		new Sidebar.Scene( editor ),
		new Sidebar.Properties( editor ),
		new Sidebar.Animation( editor ),
		new Sidebar.Script( editor )
	);
	container.add( scene );
	
	var data = new UI.Span().add(
		new Sidebar.Data(editor),
		new Sidebar.GlobalScripts(editor)
	);
	container.add( data );

	var misc = new UI.Span().add(
		new Sidebar.Project( editor ),
		new Sidebar.Settings( editor ),
		new Sidebar.History( editor )
	);
	container.add( misc );

	//

	function select( section ) {

		sceneTab.setClass( '' );
		dataTab.setClass( '' );
		miscTab.setClass( '' );

		scene.setDisplay( 'none' );
		data.setDisplay( 'none' );
		misc.setDisplay( 'none' );

		switch ( section ) {
			case 'SCENE':
				sceneTab.setClass( 'selected' );
				scene.setDisplay( '' );
				break;
			case 'DATA':
				dataTab.setClass( 'selected' );
				data.setDisplay( '' );
				break;
			case 'MISC':
				miscTab.setClass( 'selected' );
				misc.setDisplay( '' );
				break;
		}

	}

	select( 'SCENE' );

	return container;

};
