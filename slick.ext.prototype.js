// slickGridPrototypes.js

(function ($) {
  "use strict";

  Slick.Editors.Validation = Slick.Editors.Validation || {};
  Slick.Editors.Formatters = Slick.Editors.Formatters || {};

  // exclude rows that are filtered
  Slick.Data.DataView.prototype.getVisibleRows = function () {
    var visibleRows = this.getLength(),
        dataViewObj = [];

    // add data records next and delete properties i do not need
    for (var i = 0; i < visibleRows; i++) dataViewObj.push(this.getItem(i));

    return dataViewObj;
  };

  Slick.Grid.prototype.clearContainer = function () {
    var container = this.getContainerNode()
    container.innerHTML = ''
    container.removeAttribute("class");
    container.removeAttribute('style');
    this.destroy();
  };

  Slick.Grid.prototype.getColumnNames = function () {
    var columnNames = {},
        columnMetaData = this.getColumns();

    for (var i = 0; i < columnMetaData.length; i++) {
      columnNames[columnMetaData[i].id] = columnMetaData[i].name;
    }

    return columnNames;
  };

  Slick.Data.DataView.prototype.getDistinctColumnVals = function (columnId) {
    var cells = [];

    for (var i = 0; i < this.getLength() ; i++) {

      var value = this.getItem(i)[columnId];

      if (cells.indexOf(value) === -1) {
        cells.push(value);
      }
    }

    return cells;
  };

  Slick.Editors.Validation.required = function (value) {
    if (!value) {
      return { valid: false, msg: "This is a required field" };
    } else {
      return { valid: true, msg: null };
    }
  }

  Slick.Editors.Formatters.Info = function (row, cell, value, columnDef, dataContext) {
    return '<img src="' + PS.Utilities.config.imagesDir + 'more_info.png">';
  }

  Slick.Data.DataView.prototype.filterForArgs = function (args) {

    if (!args) {
      this.setFilter();
    }
    else {
      this.setFilterArgs(args);
      this.setFilter(argsFilter);
    };

    this.refresh();
  }

  Slick.Grid.prototype.exportAsCsv = function (fileName, excludedProperties) {
    var processRow = function (row) {
      var finalVal = '';
      for (var j = 0; j < row.length; j++) {
        var innerValue = typeof row[j] === 'undefined' || row[j] === null ? '' : row[j].toString();
        if (row[j] instanceof Date) {
          innerValue = row[j].toLocaleString();
        };
        var result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|;|\n)/g) >= 0)
          result = '"' + result + '"';
        if (j > 0)
          finalVal += ',';
        finalVal += result;
      }
      return finalVal + '\n';
    };

    var csvFile = '',
        rows = [],
        colname = [],
        dataLength = this.getData() instanceof Slick.Data.DataView ? this.getData().getLength() : this.getData().length;

    for (var j = 0, len = this.getColumns().length; j < len; j++) {
      colname.push(this.getColumns()[j].name);
    }

    rows.push(colname);

    var singlerow = [];

    for (var i = 0, l = dataLength ; i < l; i++) {
      for (var j = 0, len = this.getColumns().length; j < len; j++) {
        singlerow.push(this.getDataItem(i)[this.getColumns()[j].field]);
      }

      rows.push(singlerow);
      singlerow = [];
    }

    for (var i = 0; i < rows.length; i++) {
      csvFile += processRow(rows[i]);
    }

    return downloadData(csvFile, fileName, "text/csv;charset=utf-8;")
  }


  /// helper functions
  ///////////////////////////////////////////////////////////////////


  // sorts the objects properties so it matches the grid layout
  function arrangeColumnsByIndex(grid, unsortedObjectArray) {
    var sortedObject = [];

    // val is the object
    for (var i = 0; i < unsortedObjectArray.length; i++) {

      var sortedArray = [];

      for (var prop in unsortedObjectArray[i]) {
        sortedArray.push([prop, unsortedObjectArray[i][prop]]);
      }

      sortedArray.sort(function (first, second) {
        var firstIndex = grid.getColumnIndex(first[0]);
        var secondIndex = grid.getColumnIndex(second[0]);
        return (firstIndex < secondIndex ? -1 : (firstIndex > secondIndex ? 1 : 0));
      });

      sortedObject.push(arraryToObject(sortedArray))
    };

    return sortedObject
  }

  // converts a 2 dimensional array to an object 
  // where the first dimension is the property name and then second is the value
  function arraryToObject(arrayToConvert) {
    var rv = {};
    for (var i = 0; i < arrayToConvert.length; ++i)
      rv[arrayToConvert[i][0]] = arrayToConvert[i][1];
    return rv;
  }

  // completes the export of the data depending on the browser
  function downloadData(strData, strFileName, strMimeType) {

    var D = document,
        a = D.createElement("a"),
        strMimeType = strMimeType || "application/octet-stream";

    // next steps: try to find out how to download the file to the client

    // IE 10
    if (window.navigator.msSaveOrOpenBlob) {
      return window.navigator.msSaveOrOpenBlob(new Blob([strData], { type: strMimeType }), strFileName);
    }

    //html5 A[download] 
    if ('download' in a) {
      a.href = "data:" + strMimeType + "," + encodeURIComponent(strData);
      a.setAttribute("download", strFileName);
      a.innerHTML = "downloading...";
      D.body.appendChild(a);
      setTimeout(function () {
        a.click();
        D.body.removeChild(a);
      }, 66);
      return true;
    }

    // iframe 

    var $iframe = document.createElement('iframe');
    $iframe.style.display = "none";
    document.body.appendChild($iframe);

    // Get the iframe's document
    var iframeDoc = $iframe.contentDocument || $iframe.contentWindow.document;

    // Make a form
    var $form = document.createElement('form');
    $form.action = exportToXlUrl; // Your URL
    $form.method = 'POST';

    // Add form element, to post your value
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = strData;  // Your POST data

    // Add input to form
    $form.appendChild(input);

    // Add form to iFrame
    // IE doesn't have the "body" property
    (iframeDoc.body || iframeDoc).appendChild($form);

    // Post the form :-)
    $form.submit();

    setTimeout(function () {
      D.body.removeChild($iframe);
    }, 333);

    return true;
  };

  function argsFilter(item, args) {

    for (var i = 0; i < args.length; i++) {
      if (args[i] == item) {
        return true;
      }
    }

    return false;
  }

})(jQuery);

