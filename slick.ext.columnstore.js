(function ($) {
  $.extend(true, window, {
    "Slick": {
      "Ext": {
        "Plugins": {
          "ColumnStore": ColumnStore
        }
      }
    }
  });

  /*
		store must implement interface set method to store columns
	*/

  function ColumnStore(store, key) {
    var grid,
				self = this,
				origColumns,
        cacheKey = key || "gridcolumns",
				handler = new Slick.EventHandler(),
        colPicker;

    function init(g) {
      var cachedCols = store.get(cacheKey) || [];

      grid = g;

      origColumns = grid.getColumns();

      handler.subscribe(grid.onColumnsReordered, handleColumnsReordered);

      grid.setColumns(cachedCols.length ? cachedCols : origColumns);

      // Re-create editor and formatter functions
      if (cachedCols) {
        grid.getColumns().forEach(function (ch) {
          var result = $.grep(origColumns, function (e) { return e.id == ch.id; });
          if (result[0]) {
            ch.editor = result[0].editor;
            ch.formatter = result[0].formatter;
            ch.validator = result[0].validator;
          }
        });
      }

      // support for hidden columns
      colPicker = $(".slick-columnpicker");

      if (colPicker.length) {
        colPicker.bind("click", handleColumnsReordered);
      };
    }

    function destroy() {
      handler.unsubscribeAll();
      colPicker.unbind("click", handleColumnsReordered);
    }

    function handleColumnsReordered(e, args) {
      store.set(cacheKey, grid.getColumns());
    }

    $.extend(this, {
      "init": init,
      "destroy": destroy
    });
  }

})(jQuery);