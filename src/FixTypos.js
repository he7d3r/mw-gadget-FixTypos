/*
 * Insere um botão na barra de ferramentas de edição para realizar correções tipográficas
 * (Simplificação do [[w:en:User:Cacycle/wikEd.js]])
 * @author: [[w:en:User:Cacycle/wikEd.js]]
 * @author: [[User:Helder.wiki]]
 * @source: [[Special:GlobalUsage/User:Helder.wiki/Tools/FixTypos.js]] ([[File:User:Helder.wiki/Tools/FixTypos.js]])
 */
/*jslint browser: true, white: true, continue: true, plusplus: true, regexp: true*/
/*global jQuery, mediaWiki */
( function ( $, mw ) {
'use strict';

var typoRulesFind = [],
	typoRulesReplace = [];

/**
 * Fix typos using the AutoWikiBrowser/RegExTypoFix list (.test() is not faster)
 */ 
function fixTypos(text) {
	//	split into alternating plain text and { {lang} } template fragments (does not support nested templates)
	var i, j, fragment = [], regExpMatch,
		nextPos = 0,
		regExp = /\{\{\s*lang\s*\|(.|\n)*?\}\}/gi;
	while ( (regExpMatch = regExp.exec(text)) !== null ) {
		fragment.push(text.substring(nextPos, regExpMatch.index));
		fragment.push(regExpMatch[0]);
		nextPos = regExp.lastIndex;
	}
	fragment.push(text.substring(nextPos));
 
	// cycle through the RegExTypoFix rules
	for ( i = 0; i < typoRulesFind.length; i ++) {
		// cycle through the fragments, jump over { {lang} } templates
		for ( j = 0; j < fragment.length; j = j + 2) {
			fragment[j] = fragment[j].replace(typoRulesFind[i], typoRulesReplace[i]);
		}
	} 
	// re-assemble text
	return fragment.join('');
}

function addMyButton() {
    var $edit = $( '#wpTextbox1' );
	if( typeof $edit.wikiEditor !== 'function' ) {
		return;
	}
	$edit.wikiEditor( 'addToToolbar', {
		'section': 'main',
		'group': 'insert',
		'tools': {
			'fix-typo': {
				label: 'Corrigir erros tipográficos',
				type: 'button',
				icon: '//upload.wikimedia.org/wikipedia/commons/9/94/WikEd_fix_reg-ex-typo.png',
				action: {
					type: 'callback',
					execute: function() {
						var text = $edit.val(),
							newText = fixTypos( text );
						if ( newText === text ) {
							return;
						}
						$edit.val( newText );
						$( '#wpMinoredit' ).attr('checked', true);
						$( '#wpSummary' ).val( 'Correção de [[m:w:pt:WP:AWBT|erros tipográficos]]' );
						$( '#wpDiff' ).click();
					}
				}
			}
		}
	} );
}

function processText( text ) {
	// parse regexp rules
	var	regExp = /<(?:Typo)?\s+(?:word="(.*?)"\s+)?find="(.*?)"\s+replace="(.*?)"\s*\/?>/g,
		regExpMatch, regExpFind, msg;
	while ( (regExpMatch = regExp.exec( text )) !== null) {
		// check if this is a valid regexp
		try {
			regExpFind = new RegExp(regExpMatch[2], 'gm');
		} catch (err) {
			msg = 'Expressão regular inválida:\nlocalizar=' +
				regExpMatch[2] + '\nsubstituir=' + regExpMatch[3];
			mw.log( msg );
			continue;
		}

		// save regexp and replace
		typoRulesFind.push(regExpFind);
		typoRulesReplace.push(regExpMatch[3]);
	}

	// display typo fix button
	if ( typoRulesFind.length > 0 ) {
		/* Check if we are in edit mode and the required modules are available and then customize the toolbar */
		if ( $.inArray( mw.config.get('wgAction'), [ 'edit', 'submit' ] ) !== -1 ) {
			if ( mw.user.options.get( 'usebetatoolbar' ) && mw.user.options.get( 'showtoolbar' ) ) {
				$.when(
					mw.loader.using( 'ext.wikiEditor.toolbar' ),
					$.ready
				).then( addMyButton );
			} /* else {
				// TODO: Add the button to the old toolbar
			} */
		}
	} else {
		mw.log( 'A lista de regras de correções tipográficas está vazia.' );
	}
}

/**
 * Load and parse RegExTypoFix rules
 */
function loadTypoFixRules( page ) {
	( new mw.Api() ).get( {
		prop: 'revisions',
		rvprop: 'content',
		rvlimit: 1,
		indexpageids: true,
		titles: page
	} ).done( function ( data ) {
		var q = data.query,
			id = q && q.pageids && q.pageids[0],
			pg = id && q.pages && q.pages[ id ],
			rv = pg && pg.revisions;
		if ( rv && rv[0] && rv[0]['*'] ) {
			processText( rv[0]['*'] );
		}
	} );
}

if( $.inArray( mw.config.get( 'wgAction' ), [ 'edit', 'submit' ]) !== -1 ) {
	mw.loader.using( ['mediawiki.api', 'user.options' ], function () {
		loadTypoFixRules( 'Project:AutoWikiBrowser/Typos' );
	} );
}

}( jQuery, mediaWiki ) );