function foo() {
console.debug('Started foo()');
	var $edit = $( '#wpTextbox1' );
	if( typeof $edit.wikiEditor !== 'function' ) {
		return;
	}
	$edit.wikiEditor( 'addToToolbar', {
		'section': 'main',
		'group': 'insert',
		'tools': {
			'test': {
				label: 'Test',
				type: 'button',
				icon: '//upload.wikimedia.org/wikipedia/commons/9/94/WikEd_fix_reg-ex-typo.png',
				action: {
					type: 'callback',
					execute: function() {
						console.debug('ok');
					}
				}
			}
		}
	} );
console.debug('Finished foo()');
}

if( $.inArray( mw.config.get( 'wgAction' ), [ 'edit', 'submit' ]) !== -1 ) {
	mw.loader.using( ['mediawiki.api', 'user.options' ], function () {
		if ( mw.user.options.get('usebetatoolbar') ) {
			mw.loader.using( 'ext.wikiEditor.toolbar', function () {
				console.debug('$( foo )');
				$( foo );
			} );
		}
	} );
}