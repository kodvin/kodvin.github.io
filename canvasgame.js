//************************************
// Simple canvas game for learning javascript
// TODO: 
//	1) use prototype
//  2) use prototype inheritance
//	3) use IIFE
//	4) use apply() or call() 
//	+5) invoke closure
//	n) ?
//	n+1) profit
//************************************
// Still need to implement skills, maybe achievements
//********************************


//using closure for frames per second display
//the counter will increased every frame and reset after 1000ms 
//the increase is executed in main loop calling fps() function
//not the best solution but wanted to use closure
function FPS(){
	var count = 0;
	return function(){
		return count++;
	};
}
var fps = FPS();
var trueFps = 0;
var theGame,
	objectArray,
	mousePosition;
window.setInterval(function(){
//counter starts at 0 so we do not need subtract last fps() increment 
	trueFps = fps();
	fps = FPS();
	},
	1000);
	
	// books can be in three different states. and the array holds arr staltes of the books
var READ_BOOK = 2,
	ACCESABLE_NOT_READ_BOOK = 1,
	NOT_ACCESABLE_BOOK = 0,
	ARRAY_OF_BOOK_STATES = [ACCESABLE_NOT_READ_BOOK, NOT_ACCESABLE_BOOK, NOT_ACCESABLE_BOOK, NOT_ACCESABLE_BOOK],
	
	//diferent z indez. the lsmaller the index the further the object is from the observer;
	BEHIND_ZERO_Z_INDEX = 0,
	ZERO_Z_INDEX = 1,
	MID_Z_INDEX = 2,
	TOP_Z_INDEX = 3,
	
	//basic game constants
	BACKGROUND_PATH = "background.png",
	BOOK1_PATH = "book_blue.png";
	BOOK2_PATH = "book_blue2.png";
	SKILL_PATH = "skills.png";
	CANVAS_WIDTH = 520,
	CANVAS_HEIGHT = 480,
	READING_BAR_INNER_COLOR = "#00FF00",
	READING_BAR_OUTTER_COLOR = "#555555",
	//length in pixels of reading bar;
	READING_BAR_LENGTH = 100,
	//width of the reading bar
	READING_BAR_WIDTH = 20,
	
	//width of arrow base(the rectangular part)
	ARROW_WIDTH = 8,
	//width of the pointing par(triangular part)
	ARROW_WIDTH2 = 15,
	//length of base (the rectangular part)
	ARROW_LENGTH = 20,
	//lenght of the pointing part(the triangular part)
	ARROW_LENGTH2 = 40,
	
	//posible arrow types 
	LEFT_ARROW = 1,
	RIGHT_ARROW = -1,
	
	//arrow position coordinates
	LEFT_ARROW_POSITION = {
		x: 100,
		y: 240
	},
	RIGHT_ARROW_POSITION = {
		x: 400,
		y: 240
	},
	
	//base arrow color . not hovered
	ARROW_COLOR = "#00FF00",
	//arrow hover color
	ARROW_HOVER_COLOR = "#FFFF00";

//setting canvas	
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

//object for background of the game
function Background(path){
	var self = this;
	this.interactable = true;
	this.zIndex = ZERO_Z_INDEX;
	this.imageReady = false;
	this.image = new Image();
	this.image.onload = function(){
		self.imageReady = true;				
	};
	this.image.src = path;
	this.render = function(context){
		context.save();
		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		context.restore();
		//ctx.drawImage(theGame.background.image, 0, 0);		
	};
	
	//if all elements in front of the background are not clicked then the background is clicked
	//by default if we come untill check we ar at the background layer
	this.inActiveShape = function(){
		return true;
	};
	
	this.onMouseClick = function(){
		return true;
	};
}
//code for the loading bar of the book.
function ReadingBar(posX, posY){
	var self = this;
	this.interactable = false;
	this.zIndex = MID_Z_INDEX;
	this.positionX = posX;
	this.positionY = posY;
	this.render = function(progress, context){
			context.save();
			context.fillStyle = READING_BAR_OUTTER_COLOR;
			context.fillRect(self.positionX, self.positionY, READING_BAR_LENGTH, READING_BAR_WIDTH);
			context.fillStyle = READING_BAR_INNER_COLOR;
			context.fillRect(self.positionX + 2 , self.positionY + 2, Math.floor(progress * 96 / 100), 16);
			context.restore();
	};	
}

//game object 			
function Game(startingMoney, bookArray, skillButton, skillMenu){
	var self = this; 
	this.interactable = false;
	this.zIndex = MID_Z_INDEX;
	this.bookArray = bookArray;
	//setting books parents as this game
	//maybe the books should have been created here and not passed as a variable
	for(var i = 0; i < bookArray.length; i++){
		self.bookArray[i].setParent(self);
	}
	this.bookStateAray = ARRAY_OF_BOOK_STATES;
	this.readingSpeed = 400;
	this.money = startingMoney;
	this.experience = 0;
	this.currentBookIndex = 0;
	this.currentBook = self.bookArray[0];
	this.background = new Background(BACKGROUND_PATH);
	//progression arrows (for selecting previous or next book)
	this.leftArrow = new Arrow(LEFT_ARROW, LEFT_ARROW_POSITION.x, LEFT_ARROW_POSITION.y, self);
	this.rightArrow = new Arrow(RIGHT_ARROW, RIGHT_ARROW_POSITION.x, RIGHT_ARROW_POSITION.y, self);
	this.skillButton = skillButton;
	this.skillMenu = skillMenu;
	
	this.increaseMoney = function(money){
		self.money += money;
	};
	
	this.increaseExperience = function(experience){
		self.experience += experience;
	};
	// after changing current book we need to reassign book object in the global object array
	this.changeCurrentBook = function(index){
		self.currentBook = self.bookArray[index];
		self.repopulateArray();		
	};
	
	this.getCurrentBook = function(){
		return self.bookArray[self.currentBookIndex];
	};
	
	this.render = function(context){
		context.save();
		context.font="20px Georgia";
		context.fillText("$: " + self.money.toString(), 10, 20);
		context.fillText("exp: " + self.experience.toString(), 10, 50);
		context.restore();
	};
//this function is called when we change objects. for example if we change the current book 
//we need to change reference to newly assigned book	
	this.repopulateArray = function(){
		objectArray = [theGame, theGame.background, theGame.currentBook,
								  theGame.rightArrow, theGame.leftArrow, theGame.skillButton, theGame.skillMenu];
	};
}

//base arrow object. will be used for progression arrow display and logic
var Arrow = function(arrow_type, positionX, positionY, parent){
	var self = this;
	this.interactable = true;
	this.arrow_type = arrow_type;
	this.zIndex = MID_Z_INDEX;
	this.parent = parent;
	this.x = positionX;
	this.y = positionY;
	this.visible = false;
	this.color = ARROW_COLOR;
	
	this.render = function(context){
		if(!self.visible) 
			return;
			
		context.save();
		context.beginPath();
		// quite scary looking arrow path. Depending on the arrow_type(left or right)
		//it will recalculate to different coordinates
		context.moveTo(self.x + (-1 * self.arrow_type) * ARROW_LENGTH, self.y - (-1 * self.arrow_type) * ARROW_WIDTH);
		context.lineTo(self.x, self.y - (-1 * self.arrow_type) * ARROW_WIDTH);
		context.lineTo(self.x, self.y - (-1 * self.arrow_type) * ARROW_WIDTH2 - (-1 * self.arrow_type) * ARROW_WIDTH);
		context.lineTo(self.x + (-1 * self.arrow_type) * ARROW_LENGTH2, self.y);
		context.lineTo(self.x, self.y + (-1 * self.arrow_type) *  ARROW_WIDTH2 + (-1 * self.arrow_type) * ARROW_WIDTH);
		context.lineTo(self.x, self.y + (-1 * self.arrow_type) * ARROW_WIDTH);
		context.lineTo(self.x - (-1 * self.arrow_type) * ARROW_LENGTH, self.y + (-1 * self.arrow_type) * ARROW_WIDTH);
		context.lineTo(self.x - (-1 * self.arrow_type) * ARROW_LENGTH, self.y - (-1 * self.arrow_type) * ARROW_WIDTH);
		
		context.closePath();
		context.stroke();
		context.fillStyle = self.color;
		context.fill();
		context.restore();
	};
	
	//update function changed visibility property, if visibility is set to false
	// we will not render the arrow and ignore hover and click events
	this.update = function(){
		if(self.arrow_type == RIGHT_ARROW){
		// don't render the arrow if there is no where to go
			if(self.getParent().currentBookIndex < (self.getParent().bookArray.length - 1)){
				self.visible = true;
			}
			else {
				self.visible = false;
			}
		} 
		else if(self.arrow_type == LEFT_ARROW){
		// don't render the arrow if there is no where to go
				if(self.getParent().currentBookIndex > 0){
				self.visible = true;
			}
			else {
				self.visible = false;
			}
		}		
	};
	//we need to know at what state game is. Do not want use global variable
	this.setParent = function(parent){
		self.parent = parent;
	};
	
	this.getParent = function(){
		return self.parent;
	};
	
	//check if the point is in the bounding rect of the arrow
	this.inActiveShape = function(position) {
		if(self.arrow_type == RIGHT_ARROW){
			if((position.x > (self.x - ARROW_LENGTH) && 
				position.y > (self.y - ARROW_WIDTH - ARROW_WIDTH2) && 
				position.x < (self.x + ARROW_LENGTH2) && 
				position.y < (self.y + ARROW_WIDTH + ARROW_WIDTH2)) && self.visible){
				return true;
			} 
			else{
				return false;
			}		
		}
		else if(self.arrow_type == LEFT_ARROW){
			if((position.x > (self.x - ARROW_LENGTH2) && 
				position.y > (self.y - ARROW_WIDTH - ARROW_WIDTH2) && 
				position.x < (self.x + ARROW_LENGTH) && 
				position.y < (self.y + ARROW_WIDTH + ARROW_WIDTH2)) && self.visible){
				return true;
			} 
			else{
				return false;
			}
		}
	};
	
	this.onMouseClick = function(){
		var	theLength = self.parent.bookArray.length;
		if(self.arrow_type == LEFT_ARROW){
			if(0 < self.parent.currentBookIndex){
				self.parent.currentBookIndex -= 1;
				self.parent.changeCurrentBook(self.parent.currentBookIndex);
			}
		}
		else if(self.arrow_type == RIGHT_ARROW){
			if((theLength - 1) > self.parent.currentBookIndex){
				self.parent.currentBookIndex += 1;
				self.parent.changeCurrentBook(self.parent.currentBookIndex);
			}
		}		
	};
};

//code for the book object			
function Book(path, hardness, moneyReward, experienceReward, pageNumber, positionX, positionY){
	var self = this;
	this.interactable = true;
	//we can create object without a parent and set it later
	this.parent = 0;
	this.readingBar = new ReadingBar(positionX, positionY - 50);
	this.positionX = positionX;
	this.positionY = positionY;
	this.active = false;
	this.ready = false;		
	this.zIndex = MID_Z_INDEX;
	this.hardness = hardness;
	this.moneyReward = moneyReward;
	this.experienceReward = experienceReward;
	this.pageNumber = pageNumber;
	this.progress = 0;
	this.image = new Image();
	this.image.src = path;
	this.image.onload = function(){
		self.ready = true;
	};
	
	this.startProgress = function(){
		if(self.active) {
			self.increase(1);
			return;
		}
		
		self.active = true;
		self.readingBar.active = true;
	};
	
	this.setParent = function(parent){
		self.parent = parent;
	};
	
	this.getParent = function(){
		return self.parent;
	};
	
	this.update = function(dt){
		if(self.active){					
			self.progress += (dt * self.getParent().readingSpeed / self.hardness);	
			// check if the progress reached 100 percent. if yes increase rewards.
			if(self.progress >= 100){
				self.getParent().increaseMoney(self.moneyReward);
				self.getParent().increaseExperience(self.experienceReward);
				self.active = false;
				self.progress = 0;
			} 					
		}
	};
	
	this.increase = function(delta){
		self.progress += delta;
		//if reached 100 percent recet the progress
		if(self.progress >= 100){
				self.active = false;
				self.progress = 0;
		}
	};
	
	this.render = function(context){
		if(this.ready){
			context.drawImage(self.image, self.positionX, self.positionY);
			// if the book was clicked we are progressing in reading it
			if(self.active){
				self.readingBar.render(self.progress, context);
			}
		}
	};
	
	this.inActiveShape = function(position) {
		if(position.x > self.positionX && 
			position.y > self.positionY && 
			position.x < (self.positionX + 100) && 
			position.y < (self.positionY + 127)){
			return true;
		} 
		else {
			return false;
		}
	};
	
	this.onMouseClick = function(){
		theGame.getCurrentBook().startProgress();
	};
}
//object for the button of skill menu
function SkillButton(path, positionX, positionY){
	var self = this;
	this.interactable = true;
	this.imageReady = false;
	this.image = new Image();
	this.image.src = path;
	this.image.onload = function(){
		self.imageReady = true;
	};
	this.x = positionX;
	this.y = positionY;
	this.zIndex = MID_Z_INDEX;
	
	this.render = function(context){
		context.drawImage(self.image, self.x, self.y );
	};
	
	this.inActiveShape = function(position) {
		if(position.x > self.x && 
			position.y > self.y && 
			position.x < (self.x + 40) && 
			position.y < (self.y + 40)){
			return true;
		} 
		else {
			return false;
		}
	};
	
	this.onMouseClick = function(){
		theGame.skillMenu.bringToFront();
		return true;
	};
}

//object for skill upgrade menu
function SkillMenu(imagePath, positionX, positionY){
	var self = this;
	this.interactable = true;
	//when initialised skillmenu will be invisible in other words will be hidden by the background;
	this.zIndex = BEHIND_ZERO_Z_INDEX;
	
	this.bringToFront = function(){
		self.zIndex = TOP_Z_INDEX;
	};
	
	this.bringToBack = function(){
		self.zIndex = BEHIND_ZERO_Z_INDEX;
	};
	
	this.render = function(context){
		context.save();
		context.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		context.fillStyle = 'rgba(0,0,0,0.5)';
		context.fill();
		context.restore();
	};
	
	this.onHoverIn = function (position){
	};
	
	this.onHoverOut = function(position){
	};
	
	this.onMouseClick = function(){
		self.bringToBack();
		return true;
	};
	
	this.inActiveShape = function(){
		return true;
	};
}

//handle mosue click events
function clickReporter(e){
	//get mouse coordinates relative to canvas stating points
	var mousePosition = getMousePosition(canvas, e),
	//sort array of interactable (items that can be clicked) items by z index
	sortedArray = sortArrayFromHighestToLowest(objectArray);
	for (var i = 0; i < sortedArray.length; i++){
		if(sortedArray[i].interactable){
			if(sortedArray[i].inActiveShape(mousePosition)){
				return sortedArray[i].onMouseClick();			
			}
		}
	}
	return false;
}

//handle mouse hover events
function mouseMoveHandler(e){
	mousePosition = getMousePosition(canvas,e);
	
	if(theGame.skillButton.inActiveShape(mousePosition)){
		document.body.style.cursor = 'pointer';
	} 
	else if(theGame.getCurrentBook().inActiveShape(mousePosition)){
		document.body.style.cursor = 'pointer';
	} 
	else if(theGame.leftArrow.inActiveShape(mousePosition)){
		document.body.style.cursor = 'pointer';
		theGame.leftArrow.color = "#FFFF00";
	}
	else if(theGame.rightArrow.inActiveShape(mousePosition)){
		document.body.style.cursor = 'pointer';
		theGame.rightArrow.color = "#FFFF00";
	}
	else {
		document.body.style.cursor = 'default';
		theGame.leftArrow.color = "#00FF00";
		theGame.rightArrow.color = "#00FF00";
	}
}

//gets mouse position in canvas coordinates
function getMousePosition(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

//star a new game, for now we create all objects when starting the game
var startNewGame = function(){		
	var middlex = 200;
	var middley = 180;
	
	var moneyReward = 1;
	var experienceReward = 1;
	var hardnesOfTheBook = 1;
	
	var moneyReward2 = 2;
	var experienceReward2 = 1;
	var hardnesOfTheBook2 = 2;
	var arithmeticsVol1 = new Book(BOOK1_PATH, hardnesOfTheBook, moneyReward, experienceReward, 100, middlex, middley);
			
	var arithmeticsVol11 = new Book(BOOK2_PATH, hardnesOfTheBook2, moneyReward2, experienceReward2, 100, middlex, middley);
	
	var skillX = 240;
	var skillY = 10;
	var skillButton = new SkillButton(SKILL_PATH, skillX, skillY);
	
	//attaching hover and click listeners to canvas
	canvas.addEventListener('click', clickReporter, false);				
	canvas.addEventListener('mousemove', mouseMoveHandler);
		
	var startingMoney = 10;
	var bookArray = [arithmeticsVol1, arithmeticsVol11];
	
	//TODO add default constructor values
	var skillMenu = new SkillMenu();
	
	//global theGame object
	window.theGame = new Game(startingMoney, bookArray, skillButton, skillMenu);
	//array of all items that will be drawn on the canvas
	window.objectArray = [theGame, theGame.background, theGame.currentBook,
								  theGame.rightArrow, theGame.leftArrow, theGame.skillButton, theGame.skillMenu];
};

// Update game objects
var update = function (modifier) {	
	theGame.getCurrentBook().update(modifier);
	theGame.leftArrow.update();
	theGame.rightArrow.update();
};

// Draw everything
var render = function () {
	//clear the screen
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	//sorting all object by z Index and rendering
	var sortedArray = sortArrayFromLowestToHighest(objectArray);
	for(var i = 0; i < sortedArray.length; i++){
		sortedArray[i].render(ctx);
	}
	//theGame.currentBook.render(ctx);
	//rendering frame per second text
	ctx.fillText(trueFps.toString(10) + " fps", 480, 20);
};

//sorting array of object so that items have incremental z index while traversing the array
function sortArrayFromLowestToHighest(array){
	return  array.sort(function(object1, object2){
		if(object1.zIndex > object2.zIndex)
			return true;
		else 
			return false;
	});
}
//sorting array of object so that items have decremental z index while traversing the array
function sortArrayFromHighestToLowest(array){
	return  array.sort(function(object1, object2){
		if(object1.zIndex < object2.zIndex)
			return true;
		else 
			return false;
	});
}

// Cross-browser support for requestAnimationFrame
var w = window;
var crossBrowserRequestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// The main game loop
var main = function () {
	//fps() function used for frames per second counting
	fps();
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	crossBrowserRequestAnimationFrame(main);
};

// Let's play this game!
var then = Date.now();
startNewGame();
main();