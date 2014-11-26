/**
 * Created by Maxime Hersand
 * Copyright 2014
 * maxime.hersand@gmail.com
 */

'use strict';

var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];

/*
 *  @function gamesCollection
 *  the main object
 */
var gamesCollection;
gamesCollection = function() {
    var self = this;

    self.parameters = {
        numberOfLine: false
    };

    self.style = {
        margin: 10
    };

    self.state = {
        viewportWidth: w.innerWidth || e.clientWidth || g.clientWidth,
        viewportHeight: w.innerHeight || e.clientHeight|| g.clientHeight
    };

    self.section = document.getElementById('all-games');

    if(self.section !== null){
        self.games = self.section.getElementsByClassName('game');
        self.updateContainer();

        self.initSectionMouseMove();
    }
};

/*
 * @function updateContainer
 * Calculate number of line in function of viewport size
 */
gamesCollection.prototype.updateContainer = function() {
    var self = this;
    self.state.totalWidth = 0;

    var initialPlacementOfImportant = [];
    for(var i = 0; i < self.games.length; i++){
        //TODO ADD SIZE VARIATIONS
        self.state.widthOfGame = self.games[i].clientWidth + self.style.margin * 2;
        self.state.heightOfGame = self.games[i].clientHeight + self.style.margin * 2;
        self.state.totalWidth += self.state.widthOfGame;

        self.state.numberOfImportant = 0;
        if(self.games[i].className.indexOf('important') > -1) {
            self.state.numberOfImportant++;
            initialPlacementOfImportant.push(i);
        }
    }

    if(!self.parameters.numberOfLine) {
        self.state.numberOfLine = Math.ceil(self.state.totalWidth / self.state.viewportWidth);
        self.state.numberOfElementByLine = Math.ceil(self.games.length / self.state.numberOfLine);
    } else {
        //TODO MAKE USER CHOOSE NUMBER OF LINE
    }

    self.section.style.height = self.state.numberOfLine * self.state.heightOfGame + 'px';

    //POSITIONNING IMPORTANT GAMES
    var actualLine = Math.ceil(self.state.numberOfLine / 2) - 1,
        importantByLine = [];
    self.state.importantGamesChangement = [];
    for(i = 0; i < initialPlacementOfImportant.length; i++) {
        var wayOfChange = {};
        wayOfChange.start = initialPlacementOfImportant[i];

        if(typeof(importantByLine[actualLine]) === 'undefined') {
            importantByLine[actualLine] = 0;
        }

        var center = 0, numberOfElement = 0;
        if(actualLine === -1) {
            actualLine = self.state.numberOfLine - 1;
            numberOfElement = self.games.length - self.state.numberOfElementByLine * actualLine;
        } else {
            numberOfElement = self.state.numberOfElementByLine;
        }

        if(self.isPair(numberOfElement)) { center = Math.ceil(numberOfElement / 2); }
        else { center = Math.floor(numberOfElement / 2); }

        var incr = Math.pow(-1, importantByLine[actualLine]);

        //center - 1 : Because increment of games start at 0 and not at 1
        wayOfChange.end = self.state.numberOfElementByLine * actualLine + center - 1 + incr;
        self.state.importantGamesChangement.push(wayOfChange);

        console.log(wayOfChange);

        importantByLine[actualLine]++;
        actualLine--;
    }

    self.updateImportantPlacement();
    self.updatePlacement();
};

gamesCollection.prototype.updateImportantPlacement = function() {
    var self = this;

    for(var i = 0; i < self.state.importantGamesChangement.length; i++) {
        var initialPosition = self.games[self.state.importantGamesChangement[i].start],
            endPosition = self.games[self.state.importantGamesChangement[i].end];

        var tempInnerHTML = initialPosition.innerHTML;
        var tempInnerClassName = initialPosition.className;
        initialPosition.innerHTML = endPosition.innerHTML;
        initialPosition.className = endPosition.className;

        endPosition.innerHTML = tempInnerHTML;
        endPosition.className = tempInnerClassName;
    }
};

gamesCollection.prototype.updatePlacement = function() {
    var self = this;

    var nbGamesOnLine = 0, indentGame = 0;
    var numberOfGameToPlace = self.games.length;
    var center = self.state.viewportWidth / 2;
    for(var line = 0; line < self.state.numberOfLine; line++) {
        if(numberOfGameToPlace < self.state.numberOfElementByLine) {
            nbGamesOnLine = numberOfGameToPlace;
        } else {
            nbGamesOnLine = self.state.numberOfElementByLine;
        }

        var initLeft = 0;
        if(self.isPair(nbGamesOnLine)) {
            initLeft = center - nbGamesOnLine * self.state.widthOfGame / 2;
        } else {
            initLeft = center - (nbGamesOnLine - 1) * self.state.widthOfGame / 2 - self.state.widthOfGame / 2;
        }

        for(var i = 0; i < nbGamesOnLine; i++) {
            var elementPlacement = self.state.widthOfGame * i;
            var leftGame = initLeft + elementPlacement;

            var topGame = self.state.heightOfGame * (line);

            self.games[indentGame].style.left = leftGame + 'px';
            self.games[indentGame].style.top = topGame + 'px';

            numberOfGameToPlace--;
            indentGame++;
        }
    }
};

/*
 * @function isPair
 * This function return true if int is a pair number
 */
gamesCollection.prototype.isPair = function(int) {
    return int % 2;
};

/*
 * @function initSectionMouseMove
 * this function init the game flow on the mouse move
 */
gamesCollection.prototype.initSectionMouseMove = function() {
    this.section.addEventListener('mousemove', this.onSectionMouseMove.bind(this));
};

/*
 * @function onSectionMouseMove
 * this function allow the game flow on the mouse move
 */
gamesCollection.prototype.onSectionMouseMove = function(e) {
    var self = this;

    var sectionCenterX = self.section.clientWidth / 2,
        sectionCenterY = self.section.clientHeight / 2,
        distanceX = sectionCenterX - e.layerX,
        distanceY = sectionCenterY - e.layerY;

    //console.log(distanceX, distanceY);
};

/*
 * @function updateOnresize
 * This function is call on resize viewport to update properties
 */
gamesCollection.prototype.updateOnresize = function() {
    var self = this;

    self.state = {
        viewportWidth: w.innerWidth || e.clientWidth || g.clientWidth,
        viewportHeight: w.innerHeight|| e.clientHeight|| g.clientHeight
    };

    self.updateContainer();
};

/*
 * @function init
 * run function for games functionnement
 */
var games;
var init;
init = function() {
    games = new gamesCollection();
    console.log(games);
};

window.onload = function() {
    init();
};

window.addEventListener('resize', function() {
    games.updateOnresize();
});



