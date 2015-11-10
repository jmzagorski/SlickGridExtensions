(function ($) {
  $.extend(true, window, {
    "Ext": {
      "Plugins": {
        "RowCountLabel": RowCountLabel
      }
    }
  });

  function RowCountLabel(labelElem) {
    var grid,
        self = this,
        dataView,
        handler = new Slick.EventHandler(),
        label = labelElem,
        totalRows;

    function init(g) {
      grid = g;
      dataView = grid.getData();

      if (!(dataView instanceof Slick.Data.DataView)) {
        throw new Error("A dataview must be used with this plugin")
      }

      if (!label) {
        label = $("<label />").addClass("rowcount-label")
        $("<div />").addClass("rowcount-div").append(label).insertAfter($("#" + grid.getContainerNode().id));
      }

      // TODO - will this fire when adding or deleting row?
      handler.subscribe(dataView.onRowCountChanged, handleRowCountChanged);
      grid.setColumns(grid.getColumns());
    }

    function destroy() {
      handler.unsubscribeAll();
    }

    function handleRowCountChanged(e, args) {
      var visibleRows = dataView.getLength();

      if (!totalRows) totalRows = grid.getDataLength();

      label.html('');
      label.html(visibleRows + ' OF ' + totalRows + ' RECORDS');
    }

    $.extend(this, {
      "init": init,
      "destroy": destroy
    });
  }
})(jQuery);
