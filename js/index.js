const electron		= require('electron');
const remote			= electron.remote;
const main        = remote.require('./main');
const $						= require('jquery');
const ipcRenderer = electron.ipcRenderer;
let 	character   = {};

$(function(){
	//レンダーが読み込み完了すると、イベントを受ける
	ipcRenderer.on('csvData',function(event,data){
		character = data;
		$('.char-img').attr('src',data['src']).css({
			left:'0px',
			top: '-'+data['height']+'px'
		});
		startAnimationCharctor();
	});
	function startAnimationCharctor() {
		setInterval(function(){
			var win = remote.getCurrentWindow();
			var position = win.getPosition();
			position = judgeMove(position[0],position[1]);
			win.setPosition(position[0], position[1]);
		},250);
	}
	function judgeMove(x, y) {
		var $img = $('img.char-img');
		var left = parseInt($img.css('left'));
		var top  = parseInt($img.css('top'));
		var screen = main.getScreenInfo();
		var characterDirect = character.direct;

		//4隅位置判定
		//右下
		if(x >= (screen.size.width - character.width) && y >= (screen.size.height - character.height)) {
			characterDirect = 'LEFT';
			top = -1*character.height;
			left = 0;
		//左下
		} else if (x < character.width && y >= (screen.size.height - character.height)) {
			characterDirect = 'UP';
			top = -3*character.height;
			left = 0;
		//左上
		} else if(x < character.width && y < character.height) {
			characterDirect = 'RIGHT';
			top = -2*character.height;
			left = 0;
		//右上
		} else if(x >= (screen.size.width - character.width) && y < character.height){
			characterDirect = 'DOWN';
			top = 0;
			left = 0;
		}
		//移動値計算
		switch (characterDirect) {
			case 'LEFT':
				x = x - character.move;
				y = screen.size.height - character.height;
				break;
			case 'RIGHT':
			  x = x + character.move;
				y = 0;
				break;
			case 'UP':
				x = 0;
				y = y - character.move;
				break;
			case 'DOWN':
				x = screen.size.width - character.width;
				y = y + character.move;
				break;
		}
		if(left <= -2*character.width) {
			left = 0;
		} else {
			left = left - character.width
		}

		character.direct = characterDirect;
		$img.css({
			left:left+'px',
			top:top+'px'
		})
		var position = [x,y];
		return position;
	}
});
