/**
 *
 * Newsletter hadnler
 * send email to spesifiec endpoint automatically
 *
 * Author: Fatih Aziz
 * date: 14 Jan 2020
 * last update: 21 Jan 2020
 * repo: https://github.com/fatih-aziz/js-plugins
 * licence: GNU General Public License v3.0
 */

$(() => {
	$.fn.extend({
		newsletter: function ($opts) {

			const formData = ($form = null) => {
				if (!$($form).formObjectify)
					throw new Error('formObjectify plugin not found!')
				let $data = $($form).formObjectify().val
				return $data
			}

			const submit = ($form = null) => {
				$data = formData($form)
				if (!$data.email) {
					if ($opts && $opts.onFail instanceof Function)
						$opts.onFail({
							error: 'Required Email'
						})
				} else
					$.ajax({
						method: "POST",
						dataType: "json",
						crossDomain: true,
						url: $targetUrl,
						data: $data
					})
					.done((res) => {
						if ($opts && $opts.onSuccess instanceof Function)
							$opts.onSuccess(res)
					})
					.fail((err) => {
						if ($opts && $opts.onFail instanceof Function)
							$opts.onFail(err)
					})
			}

			let $targetUrl = "/subscribe";
			$targetUrl = $opts && $opts.targetUrl ? $opts.targetUrl : $targetUrl;

			if (this.length > 1) {
				let $optArr = []
				$(this).each((i, el) => {
					// let $el = $(el);
					$optArr[i] = {
						data: formData(el),
						submit: submit(el),
						targetUrl: $targetUrl
					}
					if ($opts && $opts.handleSubmit) {
						$(el).submit(function (e) {
							e.preventDefault();
							submit(this)
						})
					}
				})
				return $optArr
			} else {
				$opts = $.extend({
					data: formData(this),
					submit: submit(this),
					targetUrl: $targetUrl
				}, $opts)
				if ($opts.handleSubmit) {
					$(this).submit(e => {
						e.preventDefault();
						submit(this)
					})
				}
				return $opts;
			}
		}
	})
})