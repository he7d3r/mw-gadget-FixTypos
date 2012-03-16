function addButton() {
	console.debug('The code inside of addButton() was executed.');
	return false;
}

function processText( text ) {
	/* Check if the required modules are available and then customize the toolbar */
	if ( mw.user.options.get('usebetatoolbar') ) {
		mw.loader.using( 'ext.wikiEditor.toolbar', function () {
			console.debug('"$( addButton )" was executed inside of mw.loader.using( \'ext.wikiEditor.toolbar\'...');
			$( addButton );
			return false;
		} );
	}
}

function getWikiText( page ) {
	var api = new mw.Api();
	api.get( {
		action: 'query',
		prop: 'revisions',
		rvprop: 'content',
		rvlimit: 1,
		indexpageids: true,
		titles: page
	}, {
		ok: function ( data ) {
			processText( data.query.pages[ data.query.pageids[0] ].revisions[0]['*'] );		}
			return false;
	} );
}

if( $.inArray( mw.config.get( 'wgAction' ), [ 'edit', 'submit' ]) !== -1 ) {
	mw.loader.using( ['mediawiki.api', 'user.options' ], function () {
		getWikiText( 'Teste' );
	} );
}