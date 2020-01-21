/**
 *
 * Objectify form
 * Get form data as object, set form value from object, vice versa!
 *
 * Author: Fatih Aziz
 * date: 14 Jan 2020
 * last update: 21 Jan 2020
 * https://github.com/fatih-aziz
 */

$(() => {
	$.fn.extend({
		formObjectify($options) {
			/**
			 * initialize formHelper
			 * @param  {} $reInit=false
			 */
			const init = ($reInit = false) => {
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
				if ($options.initCallback && isFunction($options.initCallback))
					$options.initCallback()
			}

			/**
			 *
			 * formHelper that put values from json to form
			 *
			 * @param  {} $data
			 * @param  {} $form
			 */
			const edit = ($data, $form) => {
				if (!$data)
					return false
				$options.rawData = $data;
				$form = $($form).prop("tagName") == "FORM" ? $($form) : $($form).find('form');

				$.each($data, (key, val) => {
					// filter data with no child or sub data
					if (!$.isArray(val) && !$.isPlainObject(val)) {
						$find = $form.find(':not(.form-array)[name=' + key + ']').val(val)


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

										return ($(em).prop('name') == name)
									}).val(val)
								})
							}
						})
					}
				})
			}

			/**
			 *
			 * get form data to object
			 *
			 * @param  {} $form
			 */
			const getData = ($form) => {

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
				return objectifyForm($formData);
			}

			/**
			 *
			 * objectify serialized array
			 *
			 * @param  {} formArray
			 */
			const objectifyForm = (formArray) => { //serialize data function
				if (!formArray instanceof Array) {
					return false
				}
				var returnArray = {};
				for (var i = 0; i < formArray.length; i++) {
					returnArray[formArray[i]['name']] = formArray[i]['value'];
				}
				return returnArray;
			}

			if (this.length > 1) {
				let $optArr = []
				$(this).each((i, el) => {
					// let $el = $(el);
					$optArr[i] = {
						init: init,
						edit: $options && $options.data ? edit($options.data, el) : edit,
						val: getData(el),
					}
				})
				return $.extend({
					val: $optArr
				}, $optArr)
			} else {
				$options = $.extend({
					init: init,
					edit: $options && $options.data ? edit($options.data, this) : edit,
					val: getData(this),
				}, $options)
				return $options
			}
		}
	})
})