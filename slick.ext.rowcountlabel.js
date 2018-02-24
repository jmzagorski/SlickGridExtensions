/*
  Add a row count label after the grid container
*/
(function ($) {
  $.extend(true, window, {
    "Slick": {
      "Ext": {
        "Plugins": {
          "RowCountLabel": RowCountLabel
        }
      }
    }
  });

  function RowCountLabel(labelElem) {
    var grid,
        self = this,
        dataView,
        handler = new Slick.EventHandler(),
        label = labelElem,
        labelDiv,
        totalRows;

    function init(g) {
      grid = g;
      dataView = grid.getData();

      if (!(dataView instanceof Slick.Data.DataView)) {
        throw new Error("A dataview must be used with this plugin")
      }

      if (!label) {
        label = $("<label />").addClass("rowcount-label");
        labelDiv = $("<div />").addClass("rowcount-div");
        labelDiv.append(label).insertAfter($("#" + grid.getContainerNode().id));
      }

      handler.subscribe(dataView.onRowCountChanged, handleRowCountChanged);
    }

    function destroy() {
      handler.unsubscribeAll();
      label.remove();
      labelDiv.remove();
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
