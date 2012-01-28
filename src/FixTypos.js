/*
 * Insere um botão na barra de ferramentas de edição para realizar correções tipográficas
 * @source: Simplificação do [[User:Cacycle/wikEd.js]]
 */
var	typoRulesFind = [],
	typoRulesReplace = [];

/**
 * Fix typos using the AutoWikiBrowser/RegExTypoFix list (.test() is not faster)
 */ 
function fixTypos(text) {
	//	split into alternating plain text and {{lang}} template fragments (does not support nested templates)
	var	i, j, fragment = [],
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
		// cycle through the fragments, jump over {{lang}} templates
		for ( j = 0; j < fragment.length; j = j + 2) {
			fragment[j] = fragment[j].replace(typoRulesFind[i], typoRulesReplace[i]);
		}
	} 
	// re-assemble text
	return fragment.join('');
}

function addButton() {
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
						var text = $edit.val();
						$edit.val( fixTypos( text ) );
						$( '#wpMinoredit' ).attr('checked', true);
						$( '#wpSummary' ).val( 'Correção de erros tipográficos' );
						$( '#wpDiff' ).submit();
					}
				}
			}
		}
	} );
}

/**
 * Load and parse RegExTypoFix rules
 */
function loadTypoFixRules( page ) {

	var processText = function ( res ) {
		var	pages = res.query.pages,
			pageids = res.query.pageids,
			i, text, regExp, regExpMatch;
 
		for (i = 0; i < pageids.length; i++) {
			if (!pages[ pageids[i] ].pageid) {
				continue;
			}
			text = pages[ pageids[i] ].revisions[0]['*'];
			break;
		}
		
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
			$( addButton );
		} else {
			mw.log( 'A lista de regras de correções tipográficas está vazia.' );
		}
	};
	$.getJSON(
		mw.util.wikiScript( 'api' ), {
			'format': 'json',
			'action': 'query',
			'titles': page,
			'prop': 'revisions',
			'rvprop': 'content',
			'indexpageids': '1'
		}, processText
	);
}

if( $.inArray( mw.config.get( 'wgAction' ), [ 'edit', 'submit' ]) !== -1 ) {
	loadTypoFixRules( 'Project:AutoWikiBrowser/Typos' );
}