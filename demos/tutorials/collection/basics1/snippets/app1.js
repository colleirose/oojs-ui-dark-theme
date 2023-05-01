( function () {
	const input = new OO.ui.TextInputWidget(),
		list = new OO.ui.SelectWidget( {
			items: [
				new OO.ui.OptionWidget( {
					label: 'Item 1',
					data: 'Item 1'
				} ),
				new OO.ui.OptionWidget( {
					label: 'Item 2',
					data: 'Item 2'
				} ),
				new OO.ui.OptionWidget( {
					label: 'Item 3',
					data: 'Item 3'
				} )
			]
		} );

	input.on( 'enter', function () {
		list.addItems( [
			new OO.ui.OptionWidget( {
				data: input.getValue(),
				label: input.getValue()
			} )
		] );
	} );

	// eslint-disable-next-line no-jquery/no-global-selector
	$( '.tutorials-embed-app1' ).append(
		new OO.ui.FieldsetLayout( {
			id: 'tutorials-basics1-app1',
			label: 'Demo #1',
			items: [
				input,
				list
			]
		} ).$element
	);
}() );
