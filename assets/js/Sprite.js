



	function Sprite (image, xImage, yImage, wImage, hImage) {
		this.image  = image;
		this.xImage = xImage;
		this.yImage = yImage;
		this.wImage = wImage;
		this.hImage = hImage;

		this.toDraw = function (xCanvas, yCanvas, wCanvas, hCanvas) {
			document.querySelector('canvas').getContext('2d').drawImage(
				this.image, this.xImage, this.yImage, this.wImage, this.hImage, xCanvas, yCanvas, wCanvas, hCanvas
			);
		};
	};






	







