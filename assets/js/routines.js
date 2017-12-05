(function () {



	var canvas, ctx, tileSize = 30, dropCounter = 0, dropInterval = 10, lastUpdate = 0, qnt_bombas = 40, tabuleiro;

	var url_image = 'assets/img/minesweeper_graphs.png', content = document.getElementById('mineSweeper');

	var graphs = {}, game = new Game();

	


	function createCanvas (w, h) {
		canvas = document.createElement('canvas');
		canvas.width  = w;
		canvas.height = h;
		canvas.textContent = 'sem suporte';

		content.appendChild(canvas);

		ctx = canvas.getContext('2d');

		canvas.addEventListener('click', onClickGame, false);
		canvas.addEventListener('dblclick', onDoubleClick, false);
		canvas.addEventListener('contextmenu', onRightClickGame, false);

		tabuleiro = preencher_tabuleiro(16, 16);

		update();
	};



	function createSprites () {
		graphs.covered   = new Sprite(image, 0, 0, 24, 24);
		graphs.emptyCell = new Sprite(image, 24, 0, 24, 24);
		graphs.bombFlag  = new Sprite(image, 48, 0, 24, 24);
		graphs.noBomb    = new Sprite(image, 72, 0, 24, 24);
		graphs.suspect   = new Sprite(image, 96, 0, 24, 24);
		graphs.hasBomb   = new Sprite(image, 120, 0, 24, 24);
		graphs.detonated = new Sprite(image, 144, 0, 24, 24);

		graphs.numbers = {};

		for (var n = 1, total = 8, starting = 168; n <= total; n++, starting += 24) {
			graphs.numbers['number' + n] = new Sprite(image, starting, 0, 24, 24);
		};
	};


	function preencher_tabuleiro (w, h) {
		var matrix = [];

		while (h--) {
			var reservaX = 0, row = [];

			while (reservaX < w) {
				row.push(new Celula(reservaX, h, tileSize));
				reservaX++;
			};

			matrix.unshift(row);
		};

		return lancar_bombas(matrix);
	};


	
	function freeOptions (matriz) {
		var options = [];

		for (var i = 0, lenI = matriz.length; i < lenI; i++) {
			for (var j = 0, lenJ = matriz[i].length; j < lenJ; j++) {
				if (matriz[i][j].valor !== -1) {
					options.push([i, j]);
				};
			};
		};

		return options;
	};



	function lancar_bombas (matriz) {
		var options = freeOptions(matriz);

		while (qnt_bombas > quantidade_bombas(matriz)) {
			var index = Math.floor(Math.random() * options.length), choice = options.splice(index, 1)[0];

			var celula = matriz[choice[0]][choice[1]];

			if (celula.valor >= 0) {
				celula.valor = -1;
				celula.is_bomb = true;
				celula.detonated = false;
			};
		};

		return lancar_indicadores(matriz);
	};


	function lancar_indicadores (matriz) {
		matriz.forEach((row, y) => {
			row.forEach((celula, x) => {
				if (celula.valor === -1) return;
				// seleciona uma celula e conta bombas ao seu redor
				for (var i = -1, indicador = 0; i <= 1; i++) {
					if (!matriz[y + i]) continue;
					for (var j = -1; j <= 1; j++) {
						var celula_vizinha = matriz[y + i][x + j];
						if (!celula_vizinha || celula_vizinha === celula) continue;
						if (celula_vizinha.valor === -1) indicador++;
					};
				};
				// depois de obter a quantidade de bombas, passo o valor para a celula
				celula.valor = indicador;
			});
		});

		return matriz;
	};



	function quantidade_bombas (matriz) {
		var qnt = 0;
		
		matriz.forEach(row => qnt += row.filter(campo => campo.valor === -1).length);

		return qnt;
	};


	function clearCanvas (newColor) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawRect(0, 0, canvas.width, canvas.height, newColor);
	};


	function drawRect (x, y, w, h, color) {
		ctx.fillStyle = color || 'black';
		ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
	};


	function draw () {
		clearCanvas('white');
		tabuleiro.forEach((row, y) => {
			row.forEach((celula, x) => {
				if (celula.covered) {
					if (celula.flag) {
						graphs.bombFlag.toDraw(x * tileSize, y * tileSize, tileSize, tileSize);
						return;
					};

					if (celula.suspect) {
						graphs.suspect.toDraw(x * tileSize, y * tileSize, tileSize, tileSize);
						return;
					};

					graphs.covered.toDraw(x * tileSize, y * tileSize, tileSize, tileSize);
					// if wanna se where the bombs is, remove the comments below
					// if (celula.valor === -1) {
					// 	drawRect(x * tileSize + 12, y * tileSize + 12, tileSize - 24, tileSize - 24, 'orange');
					// }
					return;
				};


				switch (celula.valor) {
					case -1:
						if (celula.detonated) {
							graphs.detonated.toDraw(x * tileSize, y * tileSize, tileSize, tileSize);
							break;
						};
						graphs.hasBomb.toDraw(x * tileSize, y * tileSize, tileSize, tileSize);
						break;
					case 0:
						if (celula.flag) {
							graphs.noBomb.toDraw(x * tileSize, y * tileSize, tileSize, tileSize);
							break;
						};
						graphs.emptyCell.toDraw(x * tileSize, y * tileSize, tileSize, tileSize);
						break;
					case 1:
					case 2:
					case 3:
					case 4:
					case 5:
					case 6:
					case 7:
					case 8:
						if (celula.flag) {
							graphs.noBomb.toDraw(x * tileSize, y * tileSize, tileSize, tileSize);
							break;
						};
						graphs.numbers['number' + celula.valor].toDraw(x * tileSize, y * tileSize, tileSize, tileSize);
						break;
				};
			});
		});
	};


	function virgin () {
		return !tabuleiro.some(row => row.some(celula => !celula.covered));
	};


	function clearIsUncovered () {
		var allCelulas = tabuleiro.length * tabuleiro[0].length, qnt = 0;

		tabuleiro.forEach(row => qnt += row.filter(celula => celula.valor !== -1 && !celula.covered).length);

		// retorna a quantidade de celulas que não são bombas ja abertas
		return (allCelulas - qnt_bombas == qnt);
	};


	function noOneIsDetonated () {
		return !tabuleiro.some(row => row.some(celula => celula.detonated));
	};


	function selectedElement (posX, posY) {
		for (var y = 0, lenY = tabuleiro.length; y < tabuleiro.length; y++) {
			if (!(posY >= y * tileSize && posY <= y * tileSize + tileSize)) continue;
			for (var x = 0; x < tabuleiro[y].length; x++) {
				var celula = tabuleiro[y][x];
				if (!celula.selectionArea(posX, posY)) continue;
				return celula;
			};
		};
	};



	function virginGame (_el, x, y) {
		if (_el.valor === -1 && virgin()) {

			while (_el.valor !== 0) {
				tabuleiro = preencher_tabuleiro(16, 16);
				_el = selectedElement(x, y);
			};

			return _el;
		};

		return _el;
	};



	function tagBombsCovered (matriz, el) {
		matriz.forEach(row => {
			row.forEach(celula => {
				if (celula.valor === -1 && celula.flag) return;
				if (celula.valor === -1 && !celula.flag) {
					celula.covered = false;
					celula.detonated = (celula === el);
				};
				if (celula.valor >= 0 && celula.flag) {
					celula.covered = false;
				};
			});
		});
	};



	function checkVictory () {
		if (clearIsUncovered()) {
			setTimeout(function () {
				alert('venceu');
			}, 1000);
		};
	};



	function onClickGame (event) {
		event.preventDefault();

		var mouseX = (event.pageX || event.clientX) - content.offsetLeft;
		var mouseY = (event.pageY || event.clientY) - content.offsetTop;

		var el = virginGame(selectedElement(mouseX, mouseY), mouseX, mouseY);

		if (el.covered && !el.flag && !el.suspect && noOneIsDetonated()) {
			if (el.valor === -1) {
				tagBombsCovered(tabuleiro, el);
				return;
			};

			el.revealIt(tabuleiro);

			checkVictory();
		};
	};



	function onDoubleClick (event) {
		event.preventDefault();

		var mouseX = (event.clientX || event.pageX) - content.offsetLeft;
		var mouseY = (event.clientY || event.pageY) - content.offsetTop;

		var _el = selectedElement(mouseX, mouseY);

		if (!_el.covered && !_el.flag && !_el.suspect && noOneIsDetonated()) {
			for (var y = -1, howMany = 0; y <= 1; y++) {
				if (!tabuleiro[_el.y + y]) continue;
				for (var x = -1; x <= 1; x++) {
					var celula_vizinha = tabuleiro[_el.y + y][_el.x + x];
					if (!celula_vizinha) continue;
					if (celula_vizinha.flag) howMany++;
				};
			};

			if (howMany === _el.valor) clearAround(_el);

			checkVictory();
		};
	};



	function clearAround (el) {
		for (var i = -1; i <= 1; i++) {
			if (!tabuleiro[el.y + i]) continue;
			for (var j = -1; j <= 1; j++) {
				var celula = tabuleiro[el.y + i][el.x + j];

				if (!celula || celula.flag) continue;
				if (celula.valor === -1) {
					tagBombsCovered(tabuleiro, celula);
					return;
				};

				celula.revealIt(tabuleiro);
			};
		};
	};



	function onRightClickGame (event) {
		event.preventDefault();

		var mouseX = (event.clientX || event.pageX) - content.offsetLeft;
		var mouseY = (event.clientY || event.pageY) - content.offsetTop;

		var _el = selectedElement(mouseX, mouseY);

		if (_el.covered && noOneIsDetonated()) {
			if (!_el.flag && !_el.suspect) {
				_el.flag = true;
				return;
			};

			if (_el.flag && !_el.suspect) {
				_el.flag = false;
				_el.suspect = true;
				return;
			};

			if (!_el.flag && _el.suspect) {
				_el.flag = _el.suspect = false;
				return;
			};

			checkVictory();
		};

	};


	function update (time = 0) {
		draw();

		requestAnimationFrame(update, canvas);
	};



	var image = new Image();
	image.src = url_image;
	image.onload = function () {
		createSprites();
		createCanvas(480, 480);
	};
} ());