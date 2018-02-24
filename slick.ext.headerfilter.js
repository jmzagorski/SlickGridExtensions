(function ($) {
  $.extend(true, window, {
    "Slick": {
      "Ext": {
        "Plugins": {
          "HeaderFilter": HeaderFilter
        }
      }
    }
  });

  /*
    Based on SlickGrid Header Menu Plugin (https://github.com/mleibman/SlickGrid/blob/master/plugins/slick.headermenu.js)

     used some code from src: https://github.com/danny-sg/slickgrid-spreadsheet-plugins
  */

  function HeaderFilter(options) {
    if (!options || !options.headerMenuPlugin) throw new Error('You must pass in the header plugin to use this filter.');

    var grid,
        self = this,
        dataView,
        handler = new Slick.EventHandler(),
        $filter,
        $menu,
        $activeHeaderColumn,
        defaults = {
          buttonImage: '../images/down.png',
          filterImage: '../images/filter.png',
          // provide a default filter if the user has a dataview
          filter: defaultFilter
        };

    function init(g) {
      options = $.extend(true, {}, defaults, options);
      grid = g;
      handler.subscribe(grid.onHeaderCellRendered, handleHeaderCellRendered)

      // Force the grid to re-render the header now that the events are hooked up.
      grid.setColumns(grid.getColumns());

      dataView = grid.getData();
    }

    function destroy() {
      handler.unsubscribeAll();
    }

    function handleHeaderCellRendered(e, args) {
      var column = args.column,
          menu = column.header && column.header.menu,
          $menuButton = $(args.node).find('.slick-header-menubutton');

      if (!$menuButton.length) throw new Error('Could not find menu button in header node.');

      saveButtonImage($menuButton);

      // if the user wants to show the button on click bind to each header, else just subscribe once to the event
      if (menu) {
        $menuButton.bind("click", showFilter).appendTo(args.node);
      }
      else {
        throw new Error("Can't find slick-header-menubutton. Make sure the slick.headermenu plugin is registered");
      }
    }

    function showFilter(e) {
      var $menuButton = $(this),
          columnDef = $menuButton.data("column"),
          $activeHeaderColumn = $menuButton.closest(".slick-header-column");

      $menu = $('.slick-header-menu');

      columnDef.filterValues = columnDef.filterValues || [];

      // WorkingFilters is a copy of the filters to enable apply/cancel behaviour
      var workingFilters = columnDef.filterValues.slice(0);

      var filterItems;

      if (workingFilters.length === 0) {
        // Filter based all available values
        filterItems = getFilterValues(grid.getData(), columnDef);
      }
      else {
        // Filter based on current dataView subset
        filterItems = getAllFilterValues(grid.getData().getItems(), columnDef);
      }

      var filterOptions = "<label><input type='checkbox' value='-1' />(Select All)</label>";

      for (var i = 0; i < filterItems.length; i++) {
        var filtered = _.contains(workingFilters, filterItems[i]);

        filterOptions += "<label><input type='checkbox' value='" + i + "'"
                         + (filtered ? " checked='checked'" : "")
                         + "/>" + filterItems[i] + "</label>";
      }

      $filter = $("<div class='filter'>")
                     .append($(filterOptions))
                     .appendTo($menu);

      $('<button>OK</button>')
          .appendTo($menu)
          .bind('click', function (ev) {
            columnDef.filterValues = workingFilters.splice(0, workingFilters.length); // JMZ EDIT: original was workingFilters.splice(0), not working in IE on our server
            setButtonImage($menuButton, columnDef.filterValues.length > 0);
            handleApply(ev, columnDef);
          });

      $('<button>Clear</button>')
          .appendTo($menu)
          .bind('click', function (ev) {
            columnDef.filterValues.length = 0;
            setButtonImage($menuButton, false);
            handleApply(ev, columnDef);
          });

      $('<button>Cancel</button>')
          .appendTo($menu)
          .bind('click', hideMenu);

      $(':checkbox', $filter).bind('click', function () {
        workingFilters = changeWorkingFilter(filterItems, workingFilters, $(this));
      });
    }

    function hideMenu() {
      if ($menu) {
        $menu.remove();
        $menu = null;
      }
    }

    function changeWorkingFilter(filterItems, workingFilters, $checkbox) {
      var value = $checkbox.val();
      var $filter = $checkbox.parent().parent();

      if ($checkbox.val() < 0) {
        // Select All
        if ($checkbox.prop('checked')) {
          $(':checkbox', $filter).prop('checked', true);
          workingFilters = filterItems.slice(0);
        } else {
          $(':checkbox', $filter).prop('checked', false);
          workingFilters.length = 0;
        }
      } else {
        var index = _.indexOf(workingFilters, filterItems[value]);

        if ($checkbox.prop('checked') && index < 0) {
          workingFilters.push(filterItems[value]);
        }
        else {
          if (index > -1) {
            workingFilters.splice(index, 1);
          }
        }
      }

      return workingFilters;
    }

    function setButtonImage($el, filtered) {

      var image = "url(" + (filtered ? options.filterImage : options.buttonImage) + ")",
          display = filtered ? 'inline' : '';

      $el.css({ "background-image": image, 'display': display });
    }

    function handleApply(e, columnDef) {
      hideMenu();

      if (dataView instanceof Slick.Data.DataView) {
        dataView.setFilter(options.filter);
        dataView.refresh();
        grid.resetActiveCell();
      }

      self.onFilterApplied.notify({ "grid": grid, "column": columnDef }, e, self);

      e.preventDefault();
      e.stopPropagation();
    }

    function getFilterValues(dataView, column) {
      var seen = [];
      for (var i = 0; i < dataView.getLength() ; i++) {
        var value = dataView.getItem(i)[column.field];

        if (!_.contains(seen, value)) {
          seen.push(value);
        }
      }

      return _.sortBy(seen, function (v) { return v; });
    }

    function getAllFilterValues(data, column) {
      var seen = [];
      for (var i = 0; i < data.length; i++) {
        var value = data[i][column.field];

        if (!_.contains(seen, value)) {
          seen.push(value);
        }
      }

      return _.sortBy(seen, function (v) { return v; });
    }

    function defaultFilter(item) {
      var columns = grid.getColumns();
      var value = true;
      for (var i = 0; i < columns.length; i++) {
        var col = columns[i];
        var filterValues = col.filterValues;

        if (filterValues && filterValues.length > 0) {
          value = value & _.contains(filterValues, item[col.field]);
        }
      }

      return value;
    }

    // use to toggle between filter and down arrow img
    function saveButtonImage($menuButton) {
      var $downImg = $menuButton.css('background-image');

      if (!saveButtonImage['isSaved']) {
        saveButtonImage['isSaved'] = true;
        options.buttonImage = $downImg || options.buttonImage;
        options.buttonImage = options.buttonImage.replace(/^url\(['"](.+)['"]\)/, '$1');
      }
    }

    function clearFilters(e) {
      var columns = grid.getColumns();

      for (var i = columns.length; i--;) {
        columns[i].filterValues = [];
      }
    }

    $.extend(this, {
      "init": init,
      "destroy": destroy,
      "clearFilters": clearFilters,
      "onFilterApplied": new Slick.Event(),
    });
  }
})(jQuery);
