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