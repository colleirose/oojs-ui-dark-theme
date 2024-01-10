/**
 * IndicatorElement is often mixed into other classes to generate an indicator.
 * Indicators are small graphics that are generally used in two ways:
 *
 * - To draw attention to the status of an item. For example, an indicator might be
 *   used to show that an item in a list has errors that need to be resolved.
 * - To clarify the function of a control that acts in an exceptional way (a button
 *   that opens a menu instead of performing an action directly, for example).
 *
 * For a list of indicators included in the library, please see the
 * [OOUI documentation on MediaWiki][1].
 *
 * Note that indicators don't come with any functionality by default. See e.g.
 * {@link OO.ui.SearchInputWidget SearchInputWidget} for a working 'clear' or
 * {@link OO.ui.ComboBoxInputWidget ComboBoxInputWidget} for a working 'down' indicator.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Icons,_Indicators,_and_Labels#Indicators
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$indicator] The indicator element created by the class. If this
 *  configuration is omitted, the indicator element will use a generated `<span>`.
 * @param {string} [config.indicator] Symbolic name of the indicator (e.g. ‘required’ or ‘down’).
 *  See the [OOUI documentation on MediaWiki][2] for a list of indicators included
 *  in the library.
 * [2]: https://www.mediawiki.org/wiki/OOUI/Widgets/Icons,_Indicators,_and_Labels#Indicators
 */
OO.ui.mixin.IndicatorElement = function OoUiMixinIndicatorElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$indicator = null;
	this.indicator = null;

	// Initialization
	this.setIndicator( config.indicator || this.constructor.static.indicator );
	this.setIndicatorElement( config.$indicator || $( '<span>' ) );
};

/* Setup */

OO.initClass( OO.ui.mixin.IndicatorElement );

/* Static Properties */

/**
 * Symbolic name of the indicator (e.g. ‘required’ or ‘down’).
 * The static property will be overridden if the #indicator configuration is used.
 *
 * @static
 * @property {string|null}
 */
OO.ui.mixin.IndicatorElement.static.indicator = null;

/**
 * A text string used as the indicator title, a function that returns title text, or `null`
 * for no title. The static property will be overridden if the #indicatorTitle configuration is
 * used.
 *
 * @static
 * @property {string|Function|null}
 */
OO.ui.mixin.IndicatorElement.static.indicatorTitle = null;

/* Methods */

/**
 * Set the indicator element.
 *
 * If an element is already set, it will be cleaned up before setting up the new element.
 *
 * @param {jQuery} $indicator Element to use as indicator
 */
OO.ui.mixin.IndicatorElement.prototype.setIndicatorElement = function ( $indicator ) {
	if ( this.$indicator ) {
		this.$indicator
			.removeClass( 'oo-ui-indicatorElement-indicator oo-ui-indicator-' + this.indicator )
			.removeAttr( 'title' );
	}

	this.$indicator = $indicator
		.addClass( 'oo-ui-indicatorElement-indicator' )
		.toggleClass( 'oo-ui-indicatorElement-noIndicator', !this.indicator )
		.toggleClass( 'oo-ui-indicator-' + this.indicator, !!this.indicator );
	if ( this.indicatorTitle !== null ) {
		this.$indicator.attr( 'title', this.indicatorTitle );
	}

	this.updateThemeClasses();
};

/**
 * Set the indicator by its symbolic name. Built-in names currently include ‘clear’, ‘up’,
 * ‘down’ and ‘required’ (declared via indicators.json). Use `null` to remove the indicator.
 *
 * @param {string|null} indicator Symbolic name of indicator, or `null` for no indicator
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.IndicatorElement.prototype.setIndicator = function ( indicator ) {
	indicator = typeof indicator === 'string' && indicator.length ? indicator.trim() : null;

	if ( this.indicator !== indicator ) {
		if ( this.$indicator ) {
			if ( this.indicator !== null ) {
				this.$indicator.removeClass( 'oo-ui-indicator-' + this.indicator );
			}
			if ( indicator !== null ) {
				this.$indicator.addClass( 'oo-ui-indicator-' + indicator );
			}
		}
		this.indicator = indicator;
	}

	this.$element.toggleClass( 'oo-ui-indicatorElement', !!this.indicator );
	if ( this.$indicator ) {
		this.$indicator.toggleClass( 'oo-ui-indicatorElement-noIndicator', !this.indicator );
	}
	this.updateThemeClasses();

	return this;
};

/**
 * Get the symbolic name of the indicator (e.g., ‘required’ or ‘down’).
 *
 * @return {string|null} Symbolic name of indicator, null if not set
 */
OO.ui.mixin.IndicatorElement.prototype.getIndicator = function () {
	return this.indicator;
};
