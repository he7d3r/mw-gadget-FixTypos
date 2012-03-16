function addButton() {
	console.debug('The code inside of addButton() was executed.');
}

function processText( text ) {
	/* Check if the required modules are available and then customize the toolbar */
	if ( mw.user.options.get('usebetatoolbar') ) {
		mw.loader.using( 'ext.wikiEditor.toolbar', function () {
			console.debug('"$( addButton )" was executed inside of mw.loader.using( \'ext.wikiEditor.toolbar\'...');
			$( addButton );
		} );
	}
}

/**
 * Load and parse RegExTypoFix rules
 */
function loadTypoFixRules( page ) {
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
			var     q = data.query,
				id = q && q.pageids && q.pageids[0],
				pg = id && q.pages && q.pages[ id ],
				rv = pg && pg.revisions;
			if ( rv && rv[0] && rv[0]['*'] ) {
				processText( rv[0]['*'] );
			}
		}
	} );
}

if( $.inArray( mw.config.get( 'wgAction' ), [ 'edit', 'submit' ]) !== -1 ) {
	mw.loader.using( ['mediawiki.api', 'user.options' ], function () {
		loadTypoFixRules( 'Project:AutoWikiBrowser/Typos' );
	} );
}