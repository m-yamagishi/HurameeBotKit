$(function() {
	var doc_vec = undefined;
	var contents = [];
	var contents_href = [];
	// var headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
	// headings.forEach(function(value, index, arrar){
	// $(value).each(function(idx, elm) {
	// contents.push($(elm).text());
	// })
	// });
	var mode = 'search'; // search or question
	// debug
	 wakeUpHuramee();
	// changeModeLearning();

	$('#bot-mode-search').on('click', changeModeSearch);
	$('#bot-mode-question').on('click', changeModeQuestion);
	$('#bot-mode-learning').on('click', changeModeLearning);

	function changeModeSearch() {
		if (mode == 'search')
			return;
		mode = 'search';
		$('#line-bc').text("");
		setTimeout(function() {
			$('#line-bc').text("");
			hurameeMessage('ドキュメント内で意味検索を行います。')
		}, 1000);
		$('#bot-mode-text').text('BERT semantic search');
		$('#line-bc').css('background-color', '#7da4cd');
	}

	function changeModeQuestion() {
		if (mode == 'question')
			return;
		mode = 'question';
		$('#line-bc').text("");
		setTimeout(function() {
			$('#line-bc').text("");
			hurameeMessage('質問してください。ドキュメントの内容で答えます。');
		}, 1000);
		$('#bot-mode-text').text('BERT Q&A');
		$('#line-bc').css('background-color', '#ebb134');
	}

	function changeModeLearning() {
		if (mode == 'leaning')
			return;
		mode = 'learning';
		$('#line-bc').text("");
		setTimeout(function() {
			$('#line-bc').text("");
			hurameeMessage('質問してください。ドキュメントの内容で答えます。');
		}, 1000);
		$('#bot-mode-text').text('FAQ Active leaning');
		$('#line-bc').css('background-color', '#9403fc');
	}

	$('#TOC').find('a').each(function(idx, elm) {
		contents.push(elm.text);
		contents_href.push($(elm).attr('href'));
	});

	var base_url = 'http://vm-logic-test:9090';
	var data = {
		'contents_list' : contents
	};

	$.ajax({
		type : 'post',
		url : base_url + '/encode',
		data : JSON.stringify(data),
		contentType : 'application/json',
		dataType : 'json',
		success : function(json_data) {
			doc_vec = json_data['contents_vec'];
			console.info(doc_vec[0])
		},
		error : function() {
			console.info('http error');
		},
		complete : function() {
		}
	});

	var done = false;
	$('#huramee').on('click', wakeUpHuramee)
	$('#lychee-pj').dblclick(wakeUpHuramee)

	function wakeUpHuramee() {
		$('#huramee').fadeOut();
		$('#chat-board').slideDown();

		setTimeout(function() {
			if (done)
				return;

			$('#line-bc').text("");
			if (mode == 'search') {
				hurameeMessage('ドキュメント内で意味検索を行います。');
			} else if (mode == 'question' || mode == 'learning') {
				hurameeMessage('質問してください。ドキュメントの内容で答えます。');
			}
			done = true;
		}, 2000)
	}

	$('#board-close').on('click', function() {
		$('#chat-board').slideUp();
		$('#huramee').fadeIn();
	})

	$('#chat-input').keypress(function(e) {
		if (e.which == 13)
			conversation();
	});

	$('#chat-input').on('input', function(e) {
		// console.info(e)
	});

	$('#chat-submit-button').on('click', conversation);

	function conversation() {
		if (mode == 'search')
			search();
		else if (mode == 'question')
			question();
		else if (mode == 'learning')
			learning();
		else if (mode == 'addfaq')
			addfaq();
	}

	function search() {
		var val = $('#chat-input').val();
		if (val == '')
			return;
		$('#chat-input').val('')

		var data = {
			'query' : val,
			'contents' : contents,
			'contents_vec' : doc_vec
		};

		$('#line-bc').append('<div class="mycomment"><p>' + val + '</p></div>');

		$.ajax({
			type : 'post',
			url : base_url + '/search',
			data : JSON.stringify(data),
			contentType : 'application/json',
			dataType : 'json',
			success : function(json_data) {
				var idx_list = json_data['topk_idx'];
				var msg = '';
				for (var i = 0; i < idx_list.length; i++) {
					// console.log(contents[idx_list[i]])
					msg += '<p><a href="' + contents_href[idx_list[i]] + '">'
							+ contents[idx_list[i]] + '</a></p>';
				}
				hurameeMessage(msg);
			},
			error : function() {
				console.info('http error');
			},
			complete : function() {
			}
		});
	}

	function question() {
		var val = $('#chat-input').val();
		if (val == '')
			return;
		$('#chat-input').val('')

		var data = {
			'q' : val,
		};

		$('#line-bc').append('<div class="mycomment"><p>' + val + '</p></div>');

		$.ajax({
			type : 'post',
			url : base_url + '/question',
			data : JSON.stringify(data),
			contentType : 'application/json',
			dataType : 'json',
			success : function(json_data) {
				hurameeMessage(json_data['answer'])
			},
			error : function() {
				console.info('http error');
			},
			complete : function() {
			}
		});
	}

	var buttonTextIdIdx = 0;

	var newQuestion;

	function learning() {
		var val = newQuestion = $('#chat-input').val();
		if (val == '')
			return;
		$('#chat-input').val('')

		var data = {
			'q' : val,
		};

		$('#line-bc').append('<div class="mycomment"><p>' + val + '</p></div>');

		$
				.ajax({
					type : 'post',
					url : base_url + '/faq',
					data : JSON.stringify(data),
					contentType : 'application/json',
					dataType : 'json',
					success : function(json_data) {
						console.log(json_data);

						var topk = 3;
						var msg = 'どの質問に近いですか？<br /><br />';
						for (var i = 0; i < topk; i++) {
							msg += getButtonQuestion(
									json_data['question_list'][json_data['topk_idx'][i]],
									buttonTextIdIdx + i)
									+ '<br /><br />';
						}
						msg += '<button id="line-bc-button-text-no-'
								+ (buttonTextIdIdx + topk)
								+ '" type="button" class="btn btn-sm btn-link">該当なし</button>';
						hurameeMessage(msg)

						for (var i = 0; i < topk; i++) {
							$('#line-bc-button-text-' + (buttonTextIdIdx + i))
									.click(buttonQuestion);
						}
						$('#line-bc-button-text-no-' + (buttonTextIdIdx + topk))
								.click(noSimilarQuestion);
						buttonTextIdIdx += topk;
					},
					error : function() {
						console.info('http error');
					},
					complete : function() {
					}
				});
	}

	function getButtonQuestion(msg, idx) {
		return '<button id="line-bc-button-text-'
				+ idx
				+ '" type="button" class="btn btn-sm btn-outline-dark line-bc-button-text">'
				+ msg + '</button>'
	}

	function buttonQuestion() {
		console.info(this)
		$('#chat-input').val($(this).text());
		question();
	}

	function noSimilarQuestion() {
		mode = 'addfaq';
		var msg = '先ほどの質問に関する答えを入力してください。';
		var buttonId = 'line-bc-button-no-input-' + buttonTextIdIdx;
		msg += '<button id="' + buttonId
				+ '" type="button" class="btn btn-sm btn-link">入力しない</button>';
		hurameeMessage(msg);
		$('#' + buttonId).click(notAddAnswer);
	}

	function notAddAnswer() {
		var data = {
			'q' : newQuestion,
			'a' : 'この質問に答えはありません。'
		};
		$.ajax({
			type : 'post',
			url : base_url + '/addfaq',
			data : JSON.stringify(data),
			contentType : 'application/json',
			dataType : 'json',
			success : function(json_data) {
				end();
			},
			error : function() {
				console.info('http error');
			},
			complete : function() {
			}
		});
	}

	function addfaq() {
		var val = $('#chat-input').val();
		if (val == '')
			return;
		$('#chat-input').val('')

		var data = {
			'q' : newQuestion,
			'a' : val
		};

		$('#line-bc').append('<div class="mycomment"><p>' + val + '</p></div>');

		$.ajax({
			type : 'post',
			url : base_url + '/addfaq',
			data : JSON.stringify(data),
			contentType : 'application/json',
			dataType : 'json',
			success : function(json_data) {
				end();
			},
			error : function() {
				console.info('http error');
			},
			complete : function() {
			}
		});
	}

	function end() {
		hurameeMessage('ありがとうございました。')
		mode = 'learning';
	}

	function hurameeMessage(msg) {
		if (msg.slice(0, 1) != '<') {
			msg = '<p>' + msg + '</p>';
		}
		$('#line-bc')
				.append(
						'<div class="balloon6"><div class="faceicon"><img src="./img/huramee.png"></div><div class="chatting"><div class="says">'
								+ msg + '</div></div>');
		$('#line-bc').animate({
			scrollTop : $('#line-bc').get(0).scrollHeight
		}, 300);
	}
})