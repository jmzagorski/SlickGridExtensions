(function ($) {
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"Ext": {
				"Editors": {
					"TextEditorLimit": TextEditorLimit,
					"SelectCellEditor": SelectCellEditor
				}
			}
		}
	});

	function TextEditorLimit(args) {
		var $input;
		var defaultValue;
		var scope = this;

		this.init = function () {
		  $input = $("<INPUT type=text class='editor-text' onblur='return ( this.value.length < " + args.column.editorLimit + " )' onKeyPress='return ( this.value.length < " + args.column.editorLimit + " )' />")
					.appendTo(args.container)
					.bind("keydown.nav", function (e) {
						if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
							e.stopImmediatePropagation();
						}
					})
					.focus()
					.select();
		};

		this.destroy = function () {
			$input.remove();
		};

		this.focus = function () {
			$input.focus();
		};

		this.getValue = function () {
			return $input.val();
		};

		this.setValue = function (val) {
			$input.val(val);
		};

		this.loadValue = function (item) {
			defaultValue = item[args.column.field] || "";
			$input.val(defaultValue);
			$input[0].defaultValue = defaultValue;
			$input.select();
		};

		this.serializeValue = function () {
			return $input.val();
		};

		this.applyValue = function (item, state) {
			item[args.column.field] = state;
		};

		this.isValueChanged = function () {
			return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
		};

		this.validate = function () {
			if (args.column.validator) {
				var validationResults = args.column.validator($input.val());
				if (!validationResults.valid) {
					return validationResults;
				}
			}

			return {
				valid: true,
				msg: null
			};
		};

		this.init();
	}

	function SelectCellEditor(args) {
		var $select;
		var defaultValue;
		var scope = this;

		this.init = function () {

		  var option_str = '<option value=""></option>';
		  var options = args.item[args.column.optionList]
			var opt_values = options.split(',');

			for (i = 0; i < opt_values.length; i++) {
				v = opt_values[i];
				// For data list option_str += "<OPTION value='" + v + "'>";
				option_str += "<option value='" + v + "'>" + v + "</option>";
			}

			// FOr Data List $select = $("<input list='molds' name='mold'><datalist id='molds' tabIndex='0' class='editor-select'>" + option_str + "</datalist>");
			$select = $("<select id='molds' tabIndex='0' class='editor-text'>" + option_str + "</select>");
			$select.appendTo(args.container);
			$select.focus();
		};

		this.destroy = function () {
			$select.remove();
		};

		this.focus = function () {
			$select.focus();
		};

		this.loadValue = function (item) {
			defaultValue = item[args.column.field] || "";
			$select.val(defaultValue);
			$select[0].defaultValue = defaultValue;
			$select.select();
		};

		this.serializeValue = function () {
			return $select.val();
		};

		this.applyValue = function (item, state) {
			item[args.column.field] = state;
		};

		this.isValueChanged = function () {
			return ($select.val() != defaultValue);
		};

		this.validate = function () {
			return {
				valid: true,
				msg: null
			};
		};

		this.getInputEl = function () {
			return $select;
		};

		this.init();
	}

})(jQuery);

