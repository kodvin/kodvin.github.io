var readingBarRender = function(progress){
	ctx.save();
	ctx.fillStyle = "#555555";
	ctx.fillRect(self.positionX, self.positionY, 100, 20);
	ctx.fillStyle = "#00FF00";
	ctx.fillRect(self.positionX + 2 , self.positionY + 2, Math.floor(progress * 96 / 100), 16);
	ctx.restore();
};	