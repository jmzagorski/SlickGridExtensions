(function ($, undefined) {
  $.extend(true, window, {
    "Slick": {
      "Ext": {
        "Plugins": {
          "OneClickCheckBox": OneClickCheckBox
        }
      }
    }
  });

  function OneClickCheckBox(idPropName) {
    var grid,
        self = this,
        options,
        idName = idPropName,
        data,
        handler = new Slick.EventHandler();

    function init(g) {
      grid = g;
      data = grid.getData(),
      options = grid.getOptions();

      handler.subscribe(grid.onClick, HandleClick)
    }

    function destroy() {
      handler.unsubscribeAll();
    }

    function HandleClick(e, args) {

      var column = grid.getColumns()[args.cell];

      if (column.editor && column.editor == Slick.Editors.Checkbox && options['editable'] && options['autoEdit']) {

        grid.invalidateRow(args.row);

        if (data instanceof Slick.Data.DataView) {
          var item = data.getItem(args.row);
          item[column.id] = !item[column.id]
          data.updateItem(item[idName], item);
        } else {
          data[args.row][grid.getColumns()[args.cell].field] = !data[args.row][grid.getColumns()[args.cell].field];
        }

        grid.updateCell(args.row, args.cell);
        grid.setActiveCell(args.row, args.cell);
        grid.render();
      }
    }

    $.extend(this, {
      "init": init,
      "destroy": destroy
    });

  }

})(jQuery)