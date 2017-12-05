	function Celula (x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;

		this.valor     = 0;
		this.flag      = false;
		this.covered   = true;
		this.suspect   = false;

		this.selectionArea = function (x, y) {
			return (y >= this.y * this.w && y <= this.y * this.w + this.w &&
					x >= this.x * this.w && x <= this.x * this.w + this.w);
		};

		this.revealIt = function (matriz) {
			this.covered = false;

			if (this.valor == 0) {
				this.floodFill(matriz);
			};
		};

		this.floodFill = function (matriz) {
			var _el = this;
			for (var i = -1; i <= 1; i++) {
				if (!matriz[_el.y + i]) continue;
				for (var j = -1; j <= 1; j++) {
					if (!matriz[_el.y + i][_el.x + j]) continue;
					if (matriz[_el.y + i][_el.x + j].valor >= 0 && matriz[_el.y + i][_el.x + j].covered) {
						matriz[_el.y + i][_el.x + j].revealIt(matriz);
					};
				};
			};
		};
	};













	function Game () {
		this.state = 'not_playing';

		this.startGame = function () {
			this.state = 'running';
		};

		this.loseGame = function () {
			this.state = 'you_lose';
		};

		this.restartGame = function () {
			this.startGame();
		};
	};













