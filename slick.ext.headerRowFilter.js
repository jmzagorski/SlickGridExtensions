(function ($, undefined) {
	$.extend(true, window, {
    "Slick": {
      "Ext": {
        "Plugins": {
          "HeaderRowFilter": HeaderRowFilter
        }
      }
		}
	});


	function HeaderRowFilter(options) {
	  var grid,
        self = this,
				columnFilters = {},
				dataView,
        handler = new Slick.EventHandler(),
        defaults = {
          filter: defaultFilter,
          columnFilters: columnFilters
        },
        $filterRow;

	  function init(g) {
			grid = g;
			dataView = grid.getData();

	    // if there is no data view then throw an error if my filter is used since it uses the data view
			if (!(dataView instanceof Slick.Data.DataView) && (!options || !options.filter)) {
				throw new Error("You must pass a filter if there is not data view attached to the grid");
			}

			if (options && options.filter && !options.columnFilters ) {
			  throw new Error("You must pass a column filter object in order to clear the filters properly");
			}

			options = $.extend(true, {}, defaults, options);
			handler.subscribe(grid.onHeaderRowCellRendered, handleHeaderRowCellRendered)

			// Force the grid to re-render the header now that the events are hooked up.
			grid.setColumns(grid.getColumns());
			$filterRow = $(grid.getHeaderRow());

			// allows a filter to be set on the dataView from the text boxes in the header
			$filterRow.delegate(":input", "change keyup", options.filter);
		}

		function destroy() {
			handler.unsubscribeAll();
			$(grid.getHeaderRow()).undelegate(":input", "change keyup", options.filter);
			columnFilters = [];
		}

		function handleHeaderRowCellRendered(e, args) {
			$(args.node).empty();
			$("<input type='text'>")
					.data("columnId", args.column.id)
					.val(columnFilters[args.column.id])
					.appendTo(args.node);
		}

		function defaultFilter(e) {

			var columnId = $(this).data("columnId");
			if (columnId != null) {
				columnFilters[columnId] = $.trim($(this).val());
				dataView.refresh();
			}

			dataView.setFilter(headerFilter);
			dataView.refresh();
			grid.resetActiveCell();
		}

		function headerFilter(item) {
			for (var columnId in columnFilters) {
				if (columnId !== undefined && columnFilters[columnId] !== "") {
					var c = grid.getColumns()[grid.getColumnIndex(columnId)];
					//if (item[c.field] != this.columnFilters[columnId]) {
					//    return false;
					//}
					if (item[c.field] !== null && columnFilters[columnId] !== null) {
						if (item[c.field].toString().toLowerCase().indexOf(columnFilters[columnId].toString().toLowerCase()) === -1) {
							return false;
						}
					}
					else {
						return false;
					}
				}
			}
			return true;
		}

		function clearFilters() {

      // remove the text
		  $filterRow.find("input[type='text']").each(function () {
		    this.value = "";
		  });

      // clear out column filters obj
		  for (var columnId in columnFilters) {
		    columnFilters[columnId] = "";
		  }

		  dataView.refresh();
		}

		$.extend(this, {
			"init": init,
			"destroy": destroy,
			"clearFilters": clearFilters
		});
	}

})(jQuery);
