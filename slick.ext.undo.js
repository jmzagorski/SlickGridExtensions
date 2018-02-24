/*
	Adds undoDirtyCount to each item on your data set to track changes
*/
(function ($) {
	$.extend(true, window, {
    "Slick": {
      "Ext": {
        "Plugins": {
          "Undo": Undo
        }
      }
		}
	});

	function Undo(items) {
		var grid,
				self = this,
        $canvas,
				defaults = {
					editCommandHandler: queueAndExecuteCommand
				},
				commandQueue = [],
				undoCommandQueuePop = [],
				rows = items || [],
				undoDirtyCountProp = "undoDirtyCount";

		function init(g) {
			grid = g;
			$canvas = grid.getCanvasNode();

			for (var i = 0; i < rows.length; i++) {
				rows[i][undoDirtyCountProp] = 0;
			}

			$($canvas).on("keydown", ctrlZ);
			$($canvas).on("keydown", ctrlY);

			grid.setOptions(defaults);
			grid.invalidate();
		}

		function destroy() {
		  $($canvas).off("keydown", ctrlZ);
		  $($canvas).off("keydown", ctrlY);
		  commandQueue = [];
		  undoCommandQueuePop = [];
		  rows = [];
    }

		function queueAndExecuteCommand(item, column, editCommand) {
		  item[undoDirtyCountProp] = item[undoDirtyCountProp] + 1 || 1

		  var savedItem = $.extend({}, item)
		  editCommand.item = savedItem;
			commandQueue.push(editCommand);
			editCommand.execute();
		}

		function undo() {

		  var command = commandQueue.pop();

		  if (!command) return false;

      // for redo need to track in this array
		  undoCommandQueuePop.push(command);

			command.item[undoDirtyCountProp] = command.item[undoDirtyCountProp] - 1

			if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
				command.undo();
				grid.gotoCell(command.row, command.cell, false);
			}

			return true;
		}

		function redo() {
		  var command = undoCommandQueuePop.pop()

		  if (!command) return false;

		  commandQueue.push(command);

			command.item[undoDirtyCountProp] = command.item[undoDirtyCountProp] + 1

			if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
			  command.execute();
			  grid.gotoCell(command.row, command.cell, false);
			}

			return true;
		}

		function ctrlZ(e) {
		  if (e.keyCode === 90 && e.ctrlKey) {
		    undo();
		  }
		}

		function ctrlY(e) {
		  if (e.keyCode === 89 && e.ctrlKey) {
		    redo();
		  }
		}

		$.extend(this, {
			"init": init,
			"destroy": destroy
		});

	}
})(jQuery)