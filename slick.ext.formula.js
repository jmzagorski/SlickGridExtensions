(function ($) {
  $.extend(true, window, {
    "Slick": {
      "Ext": {
        "Plugins": {
          "ColumnFormula": ColumnFormula
        }
      }
    }
  });

  // Constructor
  function ColumnFormula(args) {
    this.operands = args.operandColumns;
    this.result = args.resultColumn;
    this.formula = args.formula;
    this.handler = new Slick.EventHandler();
  }

  ColumnFormula.prototype = function () {
    var init = function (grid) {
      this.grid = grid;
      this.handler.subscribe(this.grid.onCellChange, handleChange.bind(this));
      //this.grid.onCellChange.subscribe(handleChange.bind(this));
    },
    handleChange = function (e, args) {
      // apply a formula to the operand fields in the dataItem
      args.item[this.result] = this.formula(this.operands, args);
      this.grid.invalidateRow(args.row); // says these rows are invalid
    },
    destroy = function () {
      this.handler.unsubscribeAll();
    }

    return {
      init: init,
      destroy: destroy,
      handle: handleChange
    };
  }();


})(jQuery)
