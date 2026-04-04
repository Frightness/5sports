'use strict';

(function () {
	function startLoginIntro() {
		if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			document.body.classList.add('login-intro-play');
			return;
		}
		requestAnimationFrame(function () {
			requestAnimationFrame(function () {
				document.body.classList.add('login-intro-play');
			});
		});
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', startLoginIntro);
	} else {
		startLoginIntro();
	}
}());

$(function () {
	var INTRAC_HEADER_INTRO_SS_KEY = 'intrac_has_animated_header';

	$('#form-signin-btn').on('click', function () {
		try {
			sessionStorage.removeItem(INTRAC_HEADER_INTRO_SS_KEY);
		} catch (e) {}
		window.location.href = 'app.html';
	});

	$('#form-signin').submit(async function (e) {
		e.preventDefault();

		$('#error').html('');
		if (($('#invoice').length) && ($('#invoice').val().trim() === '')) {
			return false;
		}
		if (($('#username').val().trim() === '') || ($('#password').val().trim() === '')) {
			return false;
		}
		if ($('#recaptcha_response').length && $('#recaptcha_key').length) {
			const recaptcha_response = $('#recaptcha_key').text() ? await grecaptcha.enterprise.execute($('#recaptcha_key').text(), {action: 'userlogin'}) : 'CAPTCHA_OFF';
			$('#recaptcha_response').val(recaptcha_response);
		}

		this.submit();
	});

	$('#form-2fa').submit(async function () {
		if (($('#code_2fa').val().trim() === '')) {
			return false;
		}
	});

	if ($('#error').html() !== '') {
		$('#error').show();
	}

	if ($('.loginttip').length) {
		tippy('.loginttip', {
			content: 'Please enter your invoice number and the username and password that you use to log in to the system. Please note that your user account must have the Reports privilege to log into the Online Payment System.',
			placement: 'right',
			arrow: true
		});
	}

	if ($('#resend_2fa').length) {
		setTimeout(() => {
			$('#resend_2fa_msg').addClass('noshow');
			$('#resend_2fa').removeClass('noshow');
		}, 30000);

		$('#resend_2fa').click(async function (e) {
			e.preventDefault();

			$('#2fa_error').text('');
			$('#resend_2fa').remove();

			$.ajax({
				type: 'POST',
				url: '/api/resend2fa?from=' + $(this).prop('dataset').intrac_from,
				dataType: 'JSON'
			}).done(async function (response) {
				if (response.success !== undefined) {
				} else if (response.redirect !== undefined) {
					$('#2fa_error').text('Your session is expired, please click cancel and start again');
				} else {
					$('#2fa_error').text(response.error.join('<br>'));
				}
			}).fail(function (xhr, textStatus, errorThrown) {
				$('#2fa_error').text('Operation failed ' + (xhr.responseText ? xhr.responseText : ''));
			});
		});
	}
});
