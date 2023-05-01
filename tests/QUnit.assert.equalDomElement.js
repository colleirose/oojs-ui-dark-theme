/*!
 * A QUnit assertion to compare DOM node trees.
 *
 * Adapted from VisualEditor plugin for QUnit. Additionally supports comparing properties to
 * attributes (for dynamically generated nodes) and order-insensitive comparison of classes on
 * DOM nodes.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
 */

( function ( QUnit ) {

	/**
	 * Build a summary of an HTML element.
	 *
	 * Summaries include node name, text, attributes and recursive summaries of children.
	 * Used for serializing or comparing HTML elements.
	 *
	 * @private
	 * @param {HTMLElement} element Element to summarize
	 * @return {Object|null} Summary of element.
	 */
	function getDomElementSummary( element ) {
		let i, name, attribute, property, childSummary, matches;
		const summary = {
			type: element.nodeName.toLowerCase(),
			// $( '<div><textarea>Foo</textarea></div>' )[0].textContent === 'Foo', which breaks
			// comparisons :( childNodes are summarized anyway, this would just be a nicety
			// text: element.textContent,
			attributes: {},
			children: []
		};

		const autogeneratedAttributes = [ 'id', 'for', 'aria-owns', 'aria-controls', 'aria-activedescendant', 'aria-labelledby' ];

		// This is used to gather certain properties and pretend they are attributes.
		// Take note of casing differences.
		const propertyAttributes = {
			value: 'value',
			readOnly: 'readonly',
			required: 'required',
			checked: 'checked',
			selected: 'selected',
			disabled: 'disabled',
			tabIndex: 'tabindex',
			dir: 'dir'
		};

		// Gather attributes
		if ( element.attributes ) {
			for ( i = 0; i < element.attributes.length; i++ ) {
				name = element.attributes[ i ].name;
				summary.attributes[ name ] = element.attributes[ i ].value;
			}
		}
		// Sort classes
		if ( summary.attributes.class ) {
			summary.attributes.class = summary.attributes.class.split( ' ' ).sort().join( ' ' );
		}

		for ( property in propertyAttributes ) {
			attribute = propertyAttributes[ property ];
			if ( element[ property ] !== undefined ) {
				summary.attributes[ attribute ] = element[ property ];
			}
		}

		// Ignore the nested DropdownWidget when comparing PHP and JS DropdownInputWidget
		if (
			summary.attributes.class &&
			summary.attributes.class.match( /oo-ui-dropdownWidget/ )
		) {
			return null;
		}

		// Summarize children
		if ( element.childNodes ) {
			for ( i = 0; i < element.childNodes.length; i++ ) {
				childSummary = getDomElementSummary( element.childNodes[ i ] );
				if ( childSummary ) {
					summary.children.push( childSummary );
				}
			}
		}

		// Special handling for textareas, where we only want to account for the content as the
		// 'value' property, never as childNodes or textContent.
		if ( summary.type === 'textarea' ) {
			// summary.text = '';
			summary.children = [];
		}

		// Filter out acceptable differences between OOUI's PHP widgets and JS widgets.
		// Automatically generated IDs (Tag::generateElementId(), OO.ui.generateElementId()).
		for ( i = 0; i < autogeneratedAttributes.length; i++ ) {
			attribute = autogeneratedAttributes[ i ];
			if (
				summary.attributes[ attribute ] !== undefined &&
				summary.attributes[ attribute ].match( /^(ooui-php-|ooui-)/ )
			) {
				summary.attributes[ attribute ] = '(autogenerated)';
			}
		}
		if ( summary.attributes.id === '(autogenerated)' ) {
			// The 'id' might be missing on the JS side, while PHP always generates them for
			// infusion. For other attributes using autogenerated ids, the value might differ,
			// but the attribute should be either present in both PHP and JS, or missing in both
			// PHP and JS.
			delete summary.attributes.id;
		}
		// Infusion data
		if ( summary.attributes[ 'data-ooui' ] !== undefined ) {
			delete summary.attributes[ 'data-ooui' ];
		}
		// Classes for custom styling of PHP widgets
		if ( summary.attributes.class !== undefined ) {
			// Ignore the extra classes on PHP widgets
			summary.attributes.class =
				summary.attributes.class.replace( /oo-ui-textInputWidget-php /g, '' );
			summary.attributes.class =
				summary.attributes.class.replace( /oo-ui-dropdownInputWidget-php /g, '' );
		}
		// Extra stuff on PHP DropdownInputWidget's $input
		if ( summary.type === 'select' ) {
			summary.attributes.class = 'oo-ui-inputWidget-input';
			delete summary.attributes.tabindex;
			delete summary.attributes.title;
			delete summary.attributes[ 'aria-disabled' ];
		}
		// PHP ToggleSwitchWidget has an extra 'a' tag that needs to be removed
		if ( summary.attributes.class &&
			summary.attributes.class.match( /oo-ui-toggleSwitchWidget/ ) &&
			summary.children[ 1 ] !== undefined &&
			summary.children[ 1 ].type === 'a'
		) {
			summary.children[ 1 ] = summary.children[ 1 ].children[ 0 ];
		}

		// Extra stuff on JS Field(set)Layout's $help
		if (
			summary.attributes.class &&
			( matches = summary.attributes.class.match( /oo-ui-field(set)?Layout-help/ ) )
		) {
			summary.attributes.class = matches[ 0 ];
			summary.children = [];
		}
		// Only used by JS FieldLayout
		delete summary.attributes[ 'aria-describedby' ];
		delete summary.attributes[ 'aria-haspopup' ];
		delete summary.attributes[ 'aria-owns' ];
		delete summary.attributes.role;

		return summary;
	}

	/**
	 * @method
	 * @static
	 * @param {HTMLElement} actual
	 * @param {HTMLElement} expected
	 * @param {string} message
	 */
	QUnit.assert.equalDomElement = function ( actual, expected, message ) {
		const actualSummary = getDomElementSummary( actual ),
			expectedSummary = getDomElementSummary( expected );

		this.pushResult( {
			result: QUnit.equiv( actualSummary, expectedSummary ),
			actual: {
				html: actual,
				summary: actualSummary
			},
			expected: {
				html: expected,
				summary: expectedSummary
			},
			message: message
		} );
	};

}( QUnit ) );
