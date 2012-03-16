var	typoRulesFind = [],
	typoRulesReplace = [];
function addButton() {
	console.debug('Inside addButton()');
}

function processText( text ) {
	// parse regexp rules
	regExp = /<(?:Typo)?\s+(?:word="(.*?)"\s+)?find="(.*?)"\s+replace="(.*?)"\s*\/?>/g;
	while ( (regExpMatch = regExp.exec( text )) !== null) {
		// check if this is a valid regexp
		var regExpFind;
		try {
			regExpFind = new RegExp(regExpMatch[2], 'gm');
		} catch (err) {
			var msg = 'Expressão regular inválida:\nlocalizar=' +
					regExpMatch[2] + '\nsubstituir=' + regExpMatch[3];
			mw.log( msg );
			continue;
		}

		// save regexp and replace
		typoRulesFind.push(regExpFind);
		typoRulesReplace.push(regExpMatch[3]);
	}

	// display typo fix button
	if (typoRulesFind.length > 0) {
		/* Check if the required modules are available and then customize the toolbar */
		if ( mw.user.options.get('usebetatoolbar') ) {
			mw.loader.using( 'ext.wikiEditor.toolbar', function () {
console.debug('Calling $( addButton )...');
				$( addButton );
			} );
		} /* else {
			// TODO: Add the button to the old toolbar
		} */
	} else {
		mw.log( 'A lista de regras de correções tipográficas está vazia.' );
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