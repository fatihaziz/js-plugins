(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 *
 * Class for helping collect data as object
 *
 * Author: Fatih Aziz
 * date: 14 Jan 2020
 * https://github.com/fatih-aziz
 */

var formHelper = {
	/**
	 * initialize formHelper
	 * @param  {} $reInit=false
	 */
	init: ($reInit = false) => {
		let priceConfig = {
			currencySymbol: 'Rp ',
			decimalPlaces: 0,
			decimalCharacter: ',',
			digitGroupSeparator: '.',
		}
		$.each($('.auto-price'), (i, el) => {
			var $price = new AutoNumeric(el, priceConfig)
			$($price.domElement).on('keyup', function (e) {
				$(this).data('raw-val', $price.rawValue)
			})
			$($price.domElement).data('raw-val', $price.rawValue)
		})
		if (formHelper.initCallback && isFunction(formHelper.initCallback))
			formHelper.initCallback()
	},
	/**
	 *
	 * formHelper that put values from json to form
	 *
	 * @param  {} $data
	 * @param  {} $form
	 */
	edit: ($data, $form) => {
		if (!$data)
			return false
		formHelper.rawData = $data;
		$form = $($form).prop("tagName") == "FORM" ? $($form) : $($form).find('form');
		console.log($form);

		$.each($data, (key, val) => {
			// filter data with no child or sub data
			if (!$.isArray(val) && !$.isPlainObject(val)) {
				// console.log(key)
				$form.find(':not(.form-array) [name=' + key + ']').val(val)
			} else {
				// get formArray elements
				$formArray = $form.find('.form-array')
				$.each($formArray, (j, el) => {
					// matching data-name formArray with data key
					if ($(el).data('name') == key) {
						$(el).find('.form-array-input').filter((k, em) => {
							$(em).val(val[k])
						})
						// check if sub value is object
					} else if ($.isPlainObject(val)) {
						$.each(val, (k, val) => {
							name = key + '.' + k;
							$(el).find('.form-array-input').filter((l, em) => {
								// console.log(em);
								return ($(em).prop('name') == name)
							}).val(val)
						})
					}
				})
			}
		})
	},

	/**
	 *
	 * get form data to object
	 *
	 * @param  {} $form
	 */
	getData: ($form) => {
		$form = $($form).prop("tagName") == "FORM" ? $($form) : $($form).find('form');
		let $formData = $form.serializeArray();

		$formAuto = $form.find('.auto-price')
		$.each($formAuto, (i, el) => {
			if ($(el).data('rawVal')) {
				$formData.push({
					name: $(el).attr('name'),
					value: $(el).data('rawVal'),
				})
			}
		})
		$formArray = $form.find('.form-array')
		$.each($formArray, (i, el) => {
			$arrWrapper = $(el);
			$name = $arrWrapper.data('name')
			if ($name) {
				$arr = $.map($arrWrapper.find('.form-array-input'), (em) => {
					return $(em).val()
				})
				$formData.push({
					name: $name,
					value: $arr,
				})
			} else {
				var $name = null;
				$arr = {}
				$.map($arrWrapper.find('.form-array-input'), (em) => {
					if ($(em).attr('name')) {
						$nm = $(em).attr('name').split('.');
						if ($nm.length > 1) {
							$name = $nm[0];
							var $subname = $nm[1];
							if ($(em).val())
								$arr[$subname] = $(em).val()
						}
					}
				})
				$formData.push({
					name: $name,
					value: $arr,
				})
			}
		})
		// $formData = $formData.map(arr => {
		//     (arr.value == null) ? null
		//         : (arr.value.length == 0) ? arr.value = "" : null
		//     return arr
		// })
		return formHelper.objectifyForm($formData);
	},

	/**
	 *
	 * objectify serialized array
	 *
	 * @param  {} formArray
	 */
	objectifyForm: (formArray) => { //serialize data function
		if (!formArray instanceof Array) {
			return false
		}
		var returnArray = {};
		for (var i = 0; i < formArray.length; i++) {
			returnArray[formArray[i]['name']] = formArray[i]['value'];
		}
		return returnArray;
	}
}

},{}],2:[function(require,module,exports){
const formObj = require('./form-objectify')
const newsletter = require('./newsletter')

console.log(formObj)
console.log(newsletter)
},{"./form-objectify":1,"./newsletter":3}],3:[function(require,module,exports){
$(() => {
	$.extend({
		newsletter: {

			_: ($opts) => {
				return $.newsletter.init($opts)
			},

			init: ($opts) => {
				let $targetUrl = "/subscribe";
				if ($opts.form) {
					$.newsletter = Object.assign($.newsletter, $opts);
					$.newsletter.targetUrl = $opts.targetUrl ? $opts.targetUrl : $targetUrl;

					if ($.newsletter.handleSubmit) {
						$.newsletter.form.submit(e => {
							e.preventDefault();
							$.newsletter.submit()
						})
					}
				}
				return false;
			},
			data: ($form = null) => {
				$form = $form ? $form : $.newsletter.form;
				$form = $($form).prop("tagName") == "FORM" ? $($form) : $($form).find('form');
				if (!formHelper)
					throw new Error('formhelper plugin needed!')
				let $data = formHelper.getData($form)
				return $data
			},
			submit: ($form = null) => {
				$data = $.newsletter.data($form);
				if (!$data.email) {
					if ($.newsletter.onFail instanceof Function)
						$.newsletter.onFail({
							error: 'Required Email'
						})
					else
						throw Error("email needed")
				} else
					$.ajax({
						method: "POST",
						dataType: "json",
						crossDomain: true,
						url: $.newsletter.targetUrl,
						data: $data
					})
					.done((res) => {
						if ($.newsletter.onSuccess instanceof Function)
							$.newsletter.onSuccess(res)
					})
					.fail((err) => {
						if ($.newsletter.onFail instanceof Function)
							$.newsletter.onFail(err)
					})
			}
		}
	})
})
},{}]},{},[2]);
