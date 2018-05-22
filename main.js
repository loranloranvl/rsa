var __SPINNER__ = '<i class="am-icon-spinner am-icon-spin"></i>'

$(document).ready(function() {
	$('#keygen').on('click', function() {
		$(this).html(__SPINNER__).attr('disabled', true);
		var keysize = $('#keysize').val();
		var t0, t1;
		t0 = performance.now();
		$.ajax({
			type: 'GET',
			url: '/keygen/' + keysize,
			dataType: 'json',
			success: function(res) {
				t1 = performance.now();
				$('.time').text('-- ' + ((t1 - t0) / 1000).toFixed(2) + 's taken');
				$.each(res.data, function(key, value) {
					$('#key' + key).val(value);
				});
			},
			complete: function() {
				$('#keygen').html('生成密钥').attr('disabled', false);
			}
		});
	});
	$('#enc').on('click', function() {
		$(this).html(__SPINNER__).attr('disabled', true);
		$('#inc').val('正在加密...');
		$.ajax({
			type: 'POST',
			url: '/enc',
			dataType: 'json',
			data: JSON.stringify({
				inp: $('#inp').val(),
				e: $('#keye').val(),
				n: $('#keyn').val(),
				keysize: $('#keysize').val()
			}),
			headers: {
				'Content-Type': 'application/json'
			},
			success: function(res) {
				$('#inc').val(res.data);
			},
			complete: function() {
				$('#enc').html('开始加密').attr('disabled', false);
			}
		});
	});
	$('#dec').on('click', function() {
		$(this).html(__SPINNER__).attr('disabled', true);
		$('#inp').val('正在解密...');
		$.ajax({
			type: 'POST',
			url: '/dec',
			dataType: 'json',
			data: JSON.stringify({
				inc: $('#inc').val(),
				d: $('#keyd').val(),
				n: $('#keyn').val(),
				keysize: $('#keysize').val()
			}),
			headers: {
				'Content-Type': 'application/json'
			},
			success: function(res) {
				$('#inp').val(res.data.replace(/[ \t]+$/, ''));
			},
			complete: function() {
				$('#dec').html('开始解密').attr('disabled', false);
			}
		});
	});
});