/**
 * AccessKeyedElement is mixed into other classes to provide an `accesskey` HTML attribute.
 * Access keys allow an user to go to a specific element by using
 * a shortcut combination of a browser specific keys + the key
 * set to the field.
 *
 *     @example
 *     // AccessKeyedElement provides an `accesskey` attribute to the
 *     // ButtonWidget class.
 *     const button = new OO.ui.ButtonWidget( {
 *         label: 'Button with access key',
 *         accessKey: 'k'
 *     } );
 *     $( document.body ).append( button.$element );
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$accessKeyed] The element to which the `accesskey` attribute is applied.
 *  If this config is omitted, the access key functionality is applied to $element, the
 *  element created by the class.
 * @param {string|Function|null} [config.accessKey=null] The key or a function that returns the key. If
 *  this config is omitted, no access key will be added.
 */
OO.ui.mixin.AccessKeyedElement = function OoUiMixinAccessKeyedElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$accessKeyed = null;
	this.accessKey = null;

	// Initialization
	this.setAccessKey( config.accessKey || null );
	this.setAccessKeyedElement( config.$accessKeyed || this.$element );

	// If this is also a TitledElement and it initialized before we did, we may have
	// to update the title with the access key
	if ( this.updateTitle ) {
		this.updateTitle();
	}
};

/* Setup */

OO.initClass( OO.ui.mixin.AccessKeyedElement );

/* Static Properties */

/**
 * The access key, a function that returns a key, or `null` for no access key.
 *
 * @static
 * @property {string|Function|null}
 */
OO.ui.mixin.AccessKeyedElement.static.accessKey = null;

/* Methods */

/**
 * Set the access keyed element.
 *
 * This method is used to retarget a AccessKeyedElement mixin so that its functionality applies to
 * the specified element.
 * If an element is already set, the mixin's effect on that element is removed before the new
 * element is set up.
 *
 * @param {jQuery} $accessKeyed Element that should use the 'access keyed' functionality
 */
OO.ui.mixin.AccessKeyedElement.prototype.setAccessKeyedElement = function ( $accessKeyed ) {
	if ( this.$accessKeyed ) {
		this.$accessKeyed.removeAttr( 'accesskey' );
	}

	this.$accessKeyed = $accessKeyed;
	if ( this.accessKey ) {
		this.$accessKeyed.attr( 'accesskey', this.accessKey );
	}
};

/**
 * Set access key.
 *
 * @param {string|Function|null} accessKey Key, a function that returns a key, or `null` for no
 *  access key
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.AccessKeyedElement.prototype.setAccessKey = function ( accessKey ) {
	accessKey = OO.ui.resolveMsg( accessKey );
	accessKey = typeof accessKey === 'string' ? accessKey : null;

	if ( this.accessKey !== accessKey ) {
		if ( this.$accessKeyed ) {
			if ( accessKey !== null ) {
				this.$accessKeyed.attr( 'accesskey', accessKey );
			} else {
				this.$accessKeyed.removeAttr( 'accesskey' );
			}
		}
		this.accessKey = accessKey;

		// Only if this is a TitledElement
		if ( this.updateTitle ) {
			this.updateTitle();
		}
	}

	return this;
};

/**
 * Get access key.
 *
 * @return {string} accessKey string
 */
OO.ui.mixin.AccessKeyedElement.prototype.getAccessKey = function () {
	return this.accessKey;
};

/**
 * Add information about the access key to the element's tooltip label.
 * (This is only public for hacky usage in FieldLayout.)
 *
 * @param {string} title Tooltip label for `title` attribute
 * @return {string}
 */
OO.ui.mixin.AccessKeyedElement.prototype.formatTitleWithAccessKey = function ( title ) {
	if ( !this.$accessKeyed ) {
		// Not initialized yet; the constructor will call updateTitle() which will rerun this
		// function.
		return title;
	}
	// Use jquery.accessKeyLabel if available to show modifiers, otherwise just display the
	// single key.
	let accessKey;
	if ( $.fn.updateTooltipAccessKeys && $.fn.updateTooltipAccessKeys.getAccessKeyLabel ) {
		accessKey = $.fn.updateTooltipAccessKeys.getAccessKeyLabel( this.$accessKeyed[ 0 ] );
	} else {
		accessKey = this.getAccessKey();
	}
	if ( accessKey ) {
		title += ' [' + accessKey + ']';
	}
	return title;
};
