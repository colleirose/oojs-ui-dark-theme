/**
 * SelectFileWidgets allow for selecting files, using the HTML5 File API. These
 * widgets can be configured with {@link OO.ui.mixin.IconElement icons}, {@link
 * OO.ui.mixin.IndicatorElement indicators} and {@link OO.ui.mixin.TitledElement titles}.
 * Please see the [OOUI documentation on MediaWiki] [1] for more information and examples.
 *
 * Although SelectFileWidget inherits from SelectFileInputWidget, it does not
 * behave as an InputWidget, and can't be used in HTML forms.
 *
 *     @example
 *     // A file select widget.
 *     var selectFile = new OO.ui.SelectFileWidget();
 *     $( document.body ).append( selectFile.$element );
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets
 *
 * @class
 * @extends OO.ui.SelectFileInputWidget
 * @mixins OO.ui.mixin.PendingElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [droppable=true] Whether to accept files by drag and drop.
 * @cfg {boolean} [buttonOnly=false] Show only the select file button, no info field. Requires
 *  showDropTarget to be false.
 * @cfg {boolean} [showDropTarget=false] Whether to show a drop target. Requires droppable to be
 *  true.
 * @cfg {number} [thumbnailSizeLimit=20] File size limit in MiB above which to not try and show a
 *  preview (for performance).
 */
OO.ui.SelectFileWidget = function OoUiSelectFileWidget( config ) {
	// Configuration initialization
	config = $.extend( {
		droppable: true,
		buttonOnly: false,
		showDropTarget: false,
		thumbnailSizeLimit: 20
	}, config );

	// Parent constructor
	OO.ui.SelectFileWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.PendingElement.call( this );

	// Properties
	this.showDropTarget = config.droppable && config.showDropTarget;
	this.thumbnailSizeLimit = config.thumbnailSizeLimit;

	// Initialization
	if ( this.showDropTarget ) {
		this.selectButton.setIcon( 'upload' );
		this.$element
			.addClass( 'oo-ui-selectFileWidget-dropTarget' )
			.on( {
				click: this.onDropTargetClick.bind( this )
			} )
			.append(
				this.info.$element,
				this.selectButton.$element,
				$( '<span>' )
					.addClass( 'oo-ui-selectFileWidget-dropLabel' )
					.text( OO.ui.msg(
						this.multiple ?
							'ooui-selectfile-dragdrop-placeholder-multiple' :
							'ooui-selectfile-dragdrop-placeholder'
					) )
			);
		if ( !this.multiple ) {
			this.$thumbnail = $( '<div>' ).addClass( 'oo-ui-selectFileWidget-thumbnail' );
			this.setPendingElement( this.$thumbnail );
			this.$element
				.addClass( 'oo-ui-selectFileWidget-withThumbnail' )
				.prepend( this.$thumbnail );
		}
		this.fieldLayout.$element.remove();
	} else if ( config.buttonOnly ) {
		// Copy over any classes that may have been added already.
		// Ensure no events are bound to this.$element before here.
		this.selectButton.$element
			.addClass( this.$element.attr( 'class' ) )
			.addClass( 'oo-ui-selectFileWidget-buttonOnly' );
		// Set this.$element to just be the button
		this.$element = this.selectButton.$element;
	}

	// Events
	if ( config.droppable ) {
		var dragHandler = this.onDragEnterOrOver.bind( this );
		this.$element.on( {
			dragenter: dragHandler,
			dragover: dragHandler,
			dragleave: this.onDragLeave.bind( this ),
			drop: this.onDrop.bind( this )
		} );
	}

	this.$input
		.on( 'click', function ( e ) {
			// Prevents dropTarget to get clicked which calls
			// a click on this input
			e.stopPropagation();
		} );

	this.$element.addClass( 'oo-ui-selectFileWidget' );

	this.updateUI();
};

/* Setup */

OO.inheritClass( OO.ui.SelectFileWidget, OO.ui.SelectFileInputWidget );
OO.mixinClass( OO.ui.SelectFileWidget, OO.ui.mixin.PendingElement );

/* Events */

/**
 * @event change
 *
 * A change event is emitted when the on/off state of the toggle changes.
 *
 * @param {File|null} value New value
 */

/* Methods */

/**
 * Get the current value of the field
 *
 * For single file widgets returns a File or null.
 * For multiple file widgets returns a list of Files.
 *
 * @return {File|File[]|null}
 */
OO.ui.SelectFileWidget.prototype.getValue = function () {
	return this.multiple ? this.currentFiles : this.currentFiles[ 0 ];
};

/**
 * Set the current value of the field
 *
 * @param {File[]|null} files Files to select
 */
OO.ui.SelectFileWidget.prototype.setValue = function ( files ) {
	if ( files && !this.multiple ) {
		files = files.slice( 0, 1 );
	}

	function comparableFile( file ) {
		// Use extend to convert to plain objects so they can be compared.
		return $.extend( {}, file );
	}

	if ( !OO.compare(
		files && files.map( comparableFile ),
		this.currentFiles && this.currentFiles.map( comparableFile )
	) ) {
		this.currentFiles = files || [];
		this.emit( 'change', this.currentFiles );
	}
};

/**
 * @inheritdoc
 */
OO.ui.SelectFileWidget.prototype.getFilename = function () {
	return this.currentFiles.map( function ( file ) {
		return file.name;
	} ).join( ', ' );
};

/**
 * Disable InputWidget#onEdit listener, onFileSelected is used instead.
 *
 * @inheritdoc
 */
OO.ui.SelectFileWidget.prototype.onEdit = function () {};

/**
 * @inheritdoc
 */
OO.ui.SelectFileWidget.prototype.updateUI = function () {
	// Too early
	if ( !this.selectButton ) {
		return;
	}

	// Parent method
	OO.ui.SelectFileWidget.super.prototype.updateUI.call( this );

	if ( this.currentFiles.length ) {
		this.$element.removeClass( 'oo-ui-selectFileInputWidget-empty' );

		if ( this.showDropTarget ) {
			if ( !this.multiple ) {
				this.pushPending();
				this.loadAndGetImageUrl( this.currentFiles[ 0 ] ).done( function ( url ) {
					this.$thumbnail.css( 'background-image', 'url( ' + url + ' )' );
				}.bind( this ) ).fail( function () {
					this.$thumbnail.append(
						new OO.ui.IconWidget( {
							icon: 'attachment',
							classes: [ 'oo-ui-selectFileWidget-noThumbnail-icon' ]
						} ).$element
					);
				}.bind( this ) ).always( function () {
					this.popPending();
				}.bind( this ) );
			}
			this.$element.off( 'click' );
		}
	} else {
		if ( this.showDropTarget ) {
			this.$element.off( 'click' );
			this.$element.on( {
				click: this.onDropTargetClick.bind( this )
			} );
			if ( !this.multiple ) {
				this.$thumbnail
					.empty()
					.css( 'background-image', '' );
			}
		}
		this.$element.addClass( 'oo-ui-selectFileInputWidget-empty' );
	}
};

/**
 * If the selected file is an image, get its URL and load it.
 *
 * @param {File} file File
 * @return {jQuery.Promise} Promise resolves with the image URL after it has loaded
 */
OO.ui.SelectFileWidget.prototype.loadAndGetImageUrl = function ( file ) {
	var deferred = $.Deferred(),
		reader = new FileReader();

	if (
		( OO.getProp( file, 'type' ) || '' ).indexOf( 'image/' ) === 0 &&
		file.size < this.thumbnailSizeLimit * 1024 * 1024
	) {
		reader.onload = function ( event ) {
			var img = document.createElement( 'img' );
			img.addEventListener( 'load', function () {
				if (
					img.naturalWidth === 0 ||
					img.naturalHeight === 0 ||
					img.complete === false
				) {
					deferred.reject();
				} else {
					deferred.resolve( event.target.result );
				}
			} );
			img.src = event.target.result;
		};
		reader.readAsDataURL( file );
	} else {
		deferred.reject();
	}

	return deferred.promise();
};

/**
 * @inheritdoc
 */
OO.ui.SelectFileWidget.prototype.onFileSelected = function ( e ) {
	if ( this.inputClearing ) {
		return;
	}

	var files = this.filterFiles( e.target.files || [] );

	// After a file is selected clear the native widget to avoid confusion
	this.inputClearing = true;
	this.$input[ 0 ].value = '';
	this.inputClearing = false;

	this.setValue( files );
};

/**
 * Handle drop target click events.
 *
 * @private
 * @param {jQuery.Event} e Key press event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectFileWidget.prototype.onDropTargetClick = function () {
	if ( !this.isDisabled() && this.$input ) {
		this.$input.trigger( 'click' );
		return false;
	}
};

/**
 * Handle drag enter and over events
 *
 * @private
 * @param {jQuery.Event} e Drag event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectFileWidget.prototype.onDragEnterOrOver = function ( e ) {
	var hasDroppableFile = false,
		dt = e.originalEvent.dataTransfer;

	e.preventDefault();
	e.stopPropagation();

	if ( this.isDisabled() ) {
		this.$element.removeClass( 'oo-ui-selectFileWidget-canDrop' );
		dt.dropEffect = 'none';
		return false;
	}

	// DataTransferItem and File both have a type property, but in Chrome files
	// have no information at this point.
	var itemsOrFiles = dt.items || dt.files;
	if ( itemsOrFiles && itemsOrFiles.length ) {
		if ( this.filterFiles( itemsOrFiles ).length ) {
			hasDroppableFile = true;
		}
	// dt.types is Array-like, but not an Array
	} else if ( Array.prototype.indexOf.call( OO.getProp( dt, 'types' ) || [], 'Files' ) !== -1 ) {
		// File information is not available at this point for security so just assume
		// it is acceptable for now.
		// https://bugzilla.mozilla.org/show_bug.cgi?id=640534
		hasDroppableFile = true;
	}

	this.$element.toggleClass( 'oo-ui-selectFileWidget-canDrop', hasDroppableFile );
	if ( !hasDroppableFile ) {
		dt.dropEffect = 'none';
	}

	return false;
};

/**
 * Handle drag leave events
 *
 * @private
 * @param {jQuery.Event} e Drag event
 */
OO.ui.SelectFileWidget.prototype.onDragLeave = function () {
	this.$element.removeClass( 'oo-ui-selectFileWidget-canDrop' );
};

/**
 * Handle drop events
 *
 * @private
 * @param {jQuery.Event} e Drop event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectFileWidget.prototype.onDrop = function ( e ) {
	var dt = e.originalEvent.dataTransfer;

	e.preventDefault();
	e.stopPropagation();
	this.$element.removeClass( 'oo-ui-selectFileWidget-canDrop' );

	if ( this.isDisabled() ) {
		return false;
	}

	var files = this.filterFiles( dt.files || [] );
	this.setValue( files );

	return false;
};
