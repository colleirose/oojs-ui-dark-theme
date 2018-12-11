// eslint-disable-next-line no-unused-vars, no-implicit-globals
var Widgets = {};
/*
* Back to top button
* Taken from https://codepen.io/desirecode/pen/MJPJqV/
*/
$( function () {
	$( window ).scroll( function () {
		if ( $( this ).scrollTop() > 100 ) {
			$( '.scroll' ).fadeIn();
		} else {
			$( '.scroll' ).fadeOut();
		}
	} );
	$( '.scroll' ).click( function () {
		$( 'html, body' ).animate( { scrollTop: 0 }, 600 );
		return false;
	} );
} );
