const electron		= require('electron');
const remote			= electron.remote;
const main        = remote.require('./main');
const $						= require('jquery');
const ipcRenderer = electron.ipcRenderer;

$(function(){
	// キャラ選択の列数
	const COL_CHAR = 5;
	const CNF_CANCEL = 'キャンセルしますか？';
	const CNF_OK     = 'OKしますか？';

	//レンダーが読み込み完了すると、イベントを受ける
	ipcRenderer.on('csvDataList',function(event,data){

		// tableタグの表示域を計算
		var $btCs = $.stylesheet('.main-menu-area button');
		var tbHe = parseInt($btCs.css('height'));
		var tbWi = parseInt($btCs.css('width'));
		var tbBo = parseInt($btCs.css('border-width'));
		var tbMe = parseInt($btCs.css('margin'));
		var tbHeCalc = tbHe - tbBo - tbMe;
		var tbWiCalc = tbWi - tbBo - tbMe;

		for (var i = 0; i < data.length; i++) {
			var src = data[i]['path'];
			var name = data[i]['displayname'];
			$appendTag = $('<td><button class="transparent"><span class="left-align">' + name + '</span><img src="' + src + '"></button></td>');
			$appendTag.find('img').css({
				'clip' : 'rect(0,' + data[i]['width'] + 'px,' + data[i]['height'] + 'px,0)',
				'left' : (tbHeCalc - data[i]['width'])  + 'px',
				'top'  : (tbWiCalc - data[i]['height']) + 'px'
			});
			if(i % COL_CHAR == 0) {
				$('.main-menu-area table').append('<tr></tr>');
			}
			$('.main-menu-area table tr:last').append($appendTag);
		}
	});

	// キャラクター選択時
	$('body').on('click','.main-menu-area button',function (){
		// 選択済みキャラクターを選択
		if($(this).hasClass('actived')) {
			$(this).removeClass('actived');
			$('.btn-ok').addClass('disabled');
		// 未選択キャラクターを選択
		} else {
			$('.main-menu-area button').removeClass('actived');
			$(this).addClass('actived');
			$('.btn-ok').removeClass('disabled');
		}
	});

	//キャンセルボタン押下時
	$('.btn-cancel').on('click',function(){
		if(!confirm(CNF_CANCEL))return;
		main.closeMenu();
	});

	$('.btn-ok').on('click',function(){
		if(!confirm(CNF_OK))return;
		var src = $('.actived img').attr('src');
		main.createCharacterWindow(src);
		main.closeMenu();
	});
});
