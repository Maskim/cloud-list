'use strict';

function Timeline(target, parameters, message){
	this.target = target;
	this.trophiesTable = [];
	this.allAbscisse = [];

	//SET DEFAULT PARAMETERS OF THE TIMELINE
	this.parameters = {
		trophies : [],
		trophiesType: {
			psn: {active: false, indent: false},
			xbox: {active: false, indent: false},
			google: {active: false, indent: false},
			steam: {active: false, indent: false}
		},
		trophiesCount: {},
		nbLine: 0,
		designOptions: {
			sizeOfGraph: 250,
			marginGraph: 40
		},
		sizeOfLine: 75,
		minDate: new Date(),
		today: new Date(),
		interval: defineInterval(),
		numberOfTrophiesMax: 0,
		lang: 'en'
	};

	//EXTEND DEFAULT TO USER PARAMETERS
    this.parameters.extend(parameters);

	//SET ENDING OF TIMELINE
	//TODO: FAIRE EN SORTE DE POUVOIR FAIRE EVOLUER CETTE VARIABLE
    this.today = new Date();
    this.rezpawnMessage = message;

    this.init();
    this.putTrophiesOnTimeline();

    var that = this;

    window.onload = function(){
		that.updatePositionAbscissePoint();
    };
}

//METHODS
Timeline.prototype = {
	//
	init: function(){
		var initialElement = this;

		//UPDATE IDENTIFIER STYLE
		initialElement.target.addClass('rezpawn-timeline');

		//DEFINE ZOOM LEVEL
		initialElement.zoomLevel = [
			{ className: 'zoom-year', value: 0 },
			{ className: 'zoom-month', value: 1 },
			{ className: 'zoom-day', value: 2 }
		];
		initialElement.currentZoom = 0;

		//INIT ANIMATOR
		initialElement.animation = {};
		initialElement.animation.list = [];
		initialElement.animation.animationCount = 0;
		//INSTANCIATE ANIMATOR
		initialElement.animation.animator = new Animator();

		//CREATE TROPHIES LINE
		(function(){
			var graph = document.createElement('div');
			graph.className = 'rez-trophies-graph';
			graph.style.height = parseInt(initialElement.parameters.designOptions.sizeOfGraph + initialElement.parameters.designOptions.marginGraph) + 'px';

			initialElement.target.appendChild(graph);
			initialElement.graph = graph;
		}());

		//CREATE ABCSISSE
		var abscisse = document.createElement('div');
		abscisse.className = 'rez-abscisse-container';

		(function(){
			var line = document.createElement('div');
			line.className = 'rez-abscisse';

			//INITIATE ZOOM
			line.className += ' ' + initialElement.zoomLevel[0].className;
			initialElement.currentZoom = 0;

			//TODO EXTERNALISE CREATION OF TODAY
			//Today abscisse
			(function(){
				var todayAbs = document.createElement('div');
				todayAbs.className = 'rez-abs rez-abs-element rez-abs-today';
				todayAbs = create_attribute(todayAbs, 'data-year', initialElement.today.getFullYear());

				var todayAbsDesc = document.createElement('p');
				todayAbsDesc.className = 'rez-abs-desc';

				(function(){
					var textTitle = document.createElement('p');
					textTitle.className = 'rez-abs-desc-title';

					var todayText = document.createTextNode( initialElement.rezpawnMessage.today );
					textTitle.appendChild(todayText);
					todayAbsDesc.appendChild(textTitle);
				}());

				todayAbs.appendChild(todayAbsDesc);

				//line.appendChild(today_abs);
				//initial_element.today_abs = today_abs;
			}());

			abscisse.appendChild(line);

            initialElement.abscisseLine = line;
		}());

		initialElement.target.appendChild(abscisse);
        initialElement.abscisse = abscisse;

		//CREATE NAVIGATION
		var navigation = document.createElement('div');
		navigation.className = 'rez-controls';

		(function(){
            var before = document.createElement('div'),
                next = document.createElement('div'),
                zoomPlus = document.createElement('div'),
                zoomMoins = document.createElement('div');

			before.className = 'rez-control rez-control-before';
			next.className = 'rez-control rez-control-next';
			zoomPlus.className = 'rez-control rez-control-zoom-plus';
			zoomMoins.className = 'rez-control rez-control-zoom-moins';

			before.onclick = function(){ initialElement.before(); };
			next.onclick = function(){ initialElement.next(); };
			zoomPlus.onclick = function(){ initialElement.zoomPlus(); };
			zoomMoins.onclick = function(){ initialElement.zoomMoins(); };

			navigation.appendChild(before);
			navigation.appendChild(next);
			//navigation.appendChild(zoomPlus);
			//navigation.appendChild(zoomMoins);
		}());

		initialElement.target.appendChild(navigation);

		//UPDATES VARIBLES
		initialElement.timelineWidth = parseInt(initialElement.abscisse.offsetWidth);

		//UPDATES PLACEMENT
		(function(){
			//TODAY

		}());
	}, // <-- END INIT -->
	//
	putTrophiesOnTimeline: function(){
		//VARIABLES
		var that = this;
		var trophies = this.parameters.trophies;

		for(var i = 0; i < trophies.length; i++){
			var trophy = trophies[i];

			//TODO TEST TROPHY

			//UPDATE TROPHIES' VARAIBLES
			//TODO TEST DATE FORMAT
			var trophyDate = trophy.date.split('-');
			trophy.date = new Date(trophyDate[2], trophyDate[0], trophyDate[1], 1, 1, 1, 1);

			//DEFINE MIN DATE
			if(that.parameters.minDate > trophy.date){
				that.parameters.minDate = trophy.date;
			}

			//Create trophies counter table
			if(typeof(that.parameters.trophiesCount[trophy.date.getFullYear()]) === 'undefined'){
				that.parameters.trophiesCount[trophy.date.getFullYear()] = {
					nbOfTrophies: 1
				};
			}else{
				that.parameters.trophiesCount[trophy.date.getFullYear()].nbOfTrophies++;
			}

			if(that.parameters.trophiesCount[trophy.date.getFullYear()].nbOfTrophies > that.parameters.numberOfTrophiesMax){
				that.parameters.numberOfTrophiesMax = that.parameters.trophiesCount[trophy.date.getFullYear()].nbOfTrophies;
			}

			if(!that.is_line_activated(trophy.type)){
				that.activate_thophies_line(trophy.type);
			}

			if(typeof(that.parameters.trophiesCount[trophy.date.getFullYear()][trophy.type]) === 'undefined'){
				that.parameters.trophiesCount[trophy.date.getFullYear()][trophy.type] = 1;
			}else{
				that.parameters.trophiesCount[trophy.date.getFullYear()][trophy.type]++;
			}

			if(typeof(that.trophiesTable[trophy.date.getFullYear()] ) === 'undefined'){
				that.trophiesTable[trophy.date.getFullYear()] = [trophy];
			}else{
				that.trophiesTable[trophy.date.getFullYear()].push(trophy);
			}
		}

		//UPGRADE numberOfTrophiesMax
		that.parameters.numberOfTrophiesMax = that.parameters.numberOfTrophiesMax.toString().length * 10;

		//DEFINE NB YEAR NEEDED
		var nbYear = that.today.getFullYear() - that.parameters.minDate.getFullYear();
		nbYear++; //Add a year for the current year

		for(i = 0; i <= nbYear; i ++){
			var create_date = new Date( that.today.getFullYear() + 1 - i, 0, 1 );
            var marginLeft = that.timelineWidth - ( that.parameters.interval * ( i + 1) );
            var newAbscisse = that.create_new_abscisse(create_date, marginLeft);

			that.allAbscisse.push(newAbscisse);
		}

		//Add trophies
		that.parameters.trophiesCount.numberOfTrophies = 0;
		for(var key in that.trophiesTable){
			if(typeof(that.trophiesTable[key]) !== 'function'){
				for(i = 0; i < that.trophiesTable[key].length; i++){
					//that.addTrophyToLine(that.trophiesTable[key][i]);
					that.parameters.trophiesCount.numberOfTrophies++;
				}
			}
		}
	}, // end of Puttrophiesonline
	//
	is_line_activated: function(type){
		if (type === 'psn'){
			return this.parameters.trophiesType.psn.active;
	    }

		if (type === 'xbox'){
			return this.parameters.trophiesType.xbox.active;
	    }

		if (type === 'google'){
			return this.parameters.trophiesType.google.active;
	    }

		if (type === 'steam'){
			return this.parameters.trophiesType.steam.active;
	    }

		return false;
	},
	activate_thophies_line: function(type){
		this.parameters.nbLine++;

		if (type === 'psn'){
			this.parameters.trophiesType.psn.active = true;
			this.parameters.trophiesType.psn.indent = this.parameters.nbLine;
		}

		if (type === 'xbox'){
			this.parameters.trophiesType.xbox.active = true;
			this.parameters.trophiesType.xbox.indent = this.parameters.nbLine;
		}

		if (type === 'google'){
			this.parameters.trophiesType.google.active = true;
			this.parameters.trophiesType.google.indent = this.parameters.nbLine;
		}

		if (type === 'steam'){
			this.parameters.trophiesType.steam.active = true;
			this.parameters.trophiesType.steam.indent = this.parameters.nbLine;
		}

		//this.create_trophies_line(type);
	},
	create_trophies_line: function(type){
		var line = document.createElement('div');
		line.className = 'rez-trophies-line ' + type;
		line.style.height = this.parameters.sizeOfLine + 'px';

		this.trophiesLines.appendChild(line);
	},
	create_new_abscisse: function(date, marginLeft){
		var that = this;
		var year, absPoint;
		var AllMonth = [], AllDay = [];

		/////////////////////
		//// CREATE YEAR ////
		/////////////////////
		(function(){
			year = document.createElement('div');
			year.className = 'rez-abs rez-abs-year';

			year = create_attribute(year, 'data-year', date.getFullYear());
			year.id = 'rez-abs-year-' + date.getFullYear();
	        year.style.marginLeft = marginLeft + 'px';

			var pointer = document.createElement('span');
			pointer.className = 'rez-abs-pointer';

			//create absisse point
			absPoint = document.createElement('div');
			absPoint.className = 'rez-abs-point';
			absPoint.style.top = -that.parameters.designOptions.marginGraph + 'px';

			year.appendChild(absPoint);
			year.appendChild(pointer);

			//year text
			(function(){
				var text = document.createElement('p');
				text.className = 'rez-title';

				var content = document.createTextNode( date.getFullYear() );
				text.appendChild(content);

				year.appendChild(text);
			}());

			//////////////////////
			//// CREATE MONTH ////
			//////////////////////
			var monthContainer = document.createElement('div');
			monthContainer.className = 'rez-abs-month-container';

			for(var i = 0; i < 12; i++){
				var month;

				month = document.createElement('div');
				month.className = 'rez-abs rez-abs-month';
				month = create_attribute(month, 'data-year', date.getFullYear());
				month = create_attribute(month, 'data-month', i);

				month.id = 'rez-abs-month-' + date.getFullYear() + '-' + i;

				pointer = document.createElement('span');
				pointer.className = 'rez-abs-pointer';

				//TODO Text month
				var text = document.createElement('p');
				text.className = 'rez-title';

				var content = document.createTextNode( getMontName(i) );
				text.appendChild(content);

				var monthPoint = document.createElement('div');
					monthPoint.className = 'rez-abs-point';

				month.appendChild(pointer);
				month.appendChild(text);
				month.appendChild(monthPoint);

				////////////////////
				//// CREATE DAY ////
				////////////////////
				var dayContainer = document.createElement('div');
				dayContainer.className = 'rez-abs-day-container';

				for(var j = 1; j <= daysInMonth(i, date.getFullYear()); j++){
					var day = document.createElement('div');
					day.className = 'rez-abs rez-abs-day';
					
					day = create_attribute(day, 'data-year', date.getFullYear());
					day = create_attribute(day, 'data-month', i);
					day = create_attribute(day, 'data-day', j);

					//POINTER
					pointer = document.createElement('span');
					pointer.className = 'rez-abs-pointer';

					//TEXT
					text = document.createElement('p');
					text.className = 'rez-title';

					content = document.createTextNode( j );
					text.appendChild(content);

					var dayPoint = document.createElement('div');
					dayPoint.className = 'rez-abs-point';

					day.appendChild(pointer);
					day.appendChild(text);
					day.appendChild(dayPoint);

					dayContainer.appendChild(day);
				}

				month.appendChild(dayContainer);

				var newMonth = {
					'HTMLObject' : month,
					'marginLeft': 0
				};
				AllMonth.push(newMonth);

				monthContainer.appendChild(month);
			}

			year.appendChild(monthContainer);

			that.abscisseLine.appendChild(year);

			if(typeof(that.parameters.trophiesCount[date.getFullYear()]) !== 'undefined'){
				that.parameters.trophiesCount[date.getFullYear()].abscisse = year;
			}
		}());

		var newAbscisse = {
			'marginLeft': marginLeft,
			'HTMLObject': year,
			'month': AllMonth,
			'point': absPoint,
			'date': date
		};

		return newAbscisse;
	},
	updatePositionAbscissePoint: function(){
		var that = this;

		console.log(that);

		for(var i = 0; i < that.allAbscisse.length; i++){
			var yearAbscisse = that.allAbscisse[i].point;
			var dateAbscisse = that.allAbscisse[i].date.getFullYear();
			var topOfPoint = that.parameters.designOptions.marginGraph;

			if(typeof(that.parameters.trophiesCount[dateAbscisse]) !== 'undefined'){
				topOfPoint += that.parameters.designOptions.sizeOfGraph * that.parameters.trophiesCount[dateAbscisse].nbOfTrophies / that.parameters.numberOfTrophiesMax;
				
				yearAbscisse.style.top = -topOfPoint + 'px';
			}
		}
	},
	addTrophyToLine: function(trophy){
		var trophyAbs = document.createElement('div');
		trophyAbs.className = 'rez-abs rez-trophy rez-trophy-' + trophy.type;

		trophyAbs = create_attribute(trophyAbs, 'data-year', trophy.date.getFullYear());
		trophyAbs = create_attribute(trophyAbs, 'data-month', trophy.date.getMonth());
		trophyAbs = create_attribute(trophyAbs, 'data-day', trophy.date.getDate());

		(function (){
			var theTrophy = document.createElement('div');
			theTrophy.className = 'rez-the-trophy';

			//TROPHY'S IMAGE
			var theTrophyImg = document.createElement('img');
			theTrophyImg.src = trophy.img;
			theTrophyImg.className = 'rez-trophy-img';

			trophyAbs.appendChild(theTrophyImg);
		}());

		trophyAbs.style.top = this.defineTop(trophy) + 'px';

		var line = document.getElementById('rez-abs-year-' + trophy.date.getFullYear() );
		line = line.getElementsByClassName('rez-trophies-' + trophy.type);

		line[0].appendChild(trophyAbs);
	},
	moveYear: function(indent, marginLeft, args){
		var that = this;
		var oncomplete = null;

		args = typeof args !== 'undefined' ? args : {};

		if(args.oncomplete){
			oncomplete = args.oncomplete(args);
		}

		var a = new Animation({
			timeline: that,
			from: this.allAbscisse[indent].marginLeft,
			to: marginLeft,
			ontween: function(value){
				that.allAbscisse[indent].HTMLObject.style.marginLeft = value + 'px';
			},
			oncomplete: oncomplete
		});
		//this.allAbscisse[indent].HTMLObject.style.marginLeft = marginLeft + 'px';
		a.start();
		this.allAbscisse[indent].marginLeft = marginLeft;
	},
	moveMonth: function(indent, indentMonth, marginLeft, isNeedToShow, isNeedAnimate){
		var that = this;

		isNeedToShow = typeof isNeedToShow !== 'undefined' ? isNeedToShow : false;
		isNeedAnimate = typeof isNeedAnimate !== 'undefined' ? isNeedAnimate : true;

		if(isNeedAnimate){

			that.allAbscisse[indent].month[indentMonth].HTMLObject.style.marginLeft = marginLeft + 'px';
			that.allAbscisse[indent].month[indentMonth].marginLeft = marginLeft;

			var a = new Animation({
				timeline: that,
				form: that.allAbscisse[indent].month[indentMonth].HTMLObject.style.marginLeft,
				to: marginLeft,
				ontween: function(value){
					that.allAbscisse[indent].month[indentMonth].HTMLObject.style.marginLeft = value + 'px';
				},
				oncomplete: function(){
					if(isNeedToShow){
						that.showMonth(indent, indentMonth);
					}
				}
			});

			a.start();
		}else{
			that.allAbscisse[indent].month[indentMonth].HTMLObject.style.marginLeft = marginLeft + 'px';

			if(isNeedToShow){
				that.showMonth(indent, indentMonth);
			}
		}
	},
	showMonth: function(indent, indentMonth){
		//this.allAbscisse[indent].month[indentMonth].HTMLObject.style.opacity = 1;

		var that = this;
		var a = new Animation({
			timeline: that,
			from: 0,
			to: 1,
			ontween: function(value){
				that.allAbscisse[indent].month[indentMonth].HTMLObject.style.opacity = value;
			}
		});
		//this.allAbscisse[indent].HTMLObject.style.marginLeft = marginLeft + 'px';
		a.start();
	},
	hideMonth: function(indent, indentMonth){
		//this.allAbscisse[indent].month[indentMonth].HTMLObject.style.opacity = 1;

		var that = this;
		var a = new Animation({
			timeline: that,
			from: 1,
			to: 0,
			ontween: function(value){
				that.allAbscisse[indent].month[indentMonth].HTMLObject.style.opacity = value;
			}
		});
		//this.allAbscisse[indent].HTMLObject.style.marginLeft = marginLeft + 'px';
		a.start();
	},
	before: function(){
		var that = this;

		if(parseInt(that.allAbscisse[that.allAbscisse.length - 1].HTMLObject.style.marginLeft) < that.timelineWidth * 0.05){
			for(var i = 0; i < that.allAbscisse.length; i++){
				var marginLeft = parseInt(that.allAbscisse[i].HTMLObject.style.marginLeft) + that.parameters.interval;
				
				that.moveYear(i, marginLeft);
			}
		}
	},
	next: function(){
		var that = this;

		if(parseInt(that.allAbscisse[0].HTMLObject.style.marginLeft) > that.timelineWidth - that.parameters.interval){
			for(var i = 0; i < that.allAbscisse.length; i++){
				var marginLeft = parseInt(that.allAbscisse[i].HTMLObject.style.marginLeft) - that.parameters.interval;
				
				that.moveYear(i, marginLeft);
			}
		}
	},
	changeZoomLevel: function(lastZoom, newZoom){
		this.abscisseLine.removeClass( this.zoomLevel[lastZoom].className );
		this.abscisseLine.addClass( this.zoomLevel[newZoom].className );

		this.currentZoom = newZoom;
	},
	zoomPlus: function(yearOfZoom){
		var that = this;
		var i;
		
		var center = that.timelineWidth/2;
		var spaceBetweenCenter = that.timelineWidth;
		var centerOfZoom = null;

		if(typeof(yearOfZoom) === 'undefined'){
			//FIND CENTER

			for(i = 0; i < that.allAbscisse.length; i++){
				if(Math.abs(that.allAbscisse[i].marginLeft - center) < spaceBetweenCenter) {
					spaceBetweenCenter = that.allAbscisse[i].marginLeft - center;
					centerOfZoom = i;
				}
			}
		}

		//TODO integrate current zoom lvl
		if(that.currentZoom !== that.zoomLevel.length -1){
			that.changeZoomLevel(that.currentZoom, that.currentZoom + 1);
		}

		//move year
		for(i = 0; i < that.allAbscisse.length; i++){
			var newMarginLeft = (centerOfZoom - i) * that.parameters.interval * 12;
			newMarginLeft = that.allAbscisse[i].marginLeft + newMarginLeft;

			that.moveYear(
				i, 
				newMarginLeft, 
				{
					indent: i,
					oncomplete: function(args){
						//Move Month
						for(var j = 0; j < that.allAbscisse[args.indent].month.length; j++){
							newMarginLeft = that.parameters.interval * (j + 1);

							that.moveMonth(args.indent, j, newMarginLeft, true, false);
						}
					}
				}
			);
		}

		//console.log(that.parameters.trophies);
	},
	zoomMoins: function(){
		var that = this;
		var i, j;

		var center = that.timelineWidth/2;
		var spaceBetweenCenter = that.timelineWidth;
		var centerOfZoom = null;

		if(typeof(yearOfZoom) === 'undefined'){
			//FIND CENTER

			for(i = 0; i < that.allAbscisse.length; i++){
				if(Math.abs(that.allAbscisse[i].marginLeft - center) < spaceBetweenCenter) {
					spaceBetweenCenter = that.allAbscisse[i].marginLeft - center;
					centerOfZoom = i;
				}
			}
		}

		//move year
		for(i = 0; i < that.allAbscisse.length; i++){
			var newMarginLeft = (centerOfZoom - i) * that.parameters.interval;
			newMarginLeft = that.allAbscisse[centerOfZoom].marginLeft + newMarginLeft;

			that.moveYear(i, newMarginLeft);

			if(that.currentZoom >= 1){
				//Hide Month
				for(j = 0; j < that.allAbscisse[i].month.length; j++){
					that.hideMonth(i, j);
				}
			}
		}

		//TODO integrate current zoom lvl
		if(that.currentZoom !== 0){
			that.changeZoomLevel(that.currentZoom, that.currentZoom - 1);
		}
	},
	defineTop: function(trophy){
	    return - this.parameters.trophiesType[ trophy.type ].indent * this.parameters.sizeOfLine;
	},
	//ANIMATION FUNCTIONS FOR TIMELINE
	nextAnimation: function(){
		if (this.animation.list[this.animation.animationCount]) {
		    this.animation.list[this.animation.animationCount].start();
		    this.animation.animationCount++;
	  	}
	},
	resetAnimations: function(){
		this.animationCount = 0;
		this.animation.list = [];
	}
};










//CREATE ANIMATOR FUNCTION FOR TIMELINE MOUVEMENT
// animator.js: Demo animator controller
// Scott Schiller | schillmania.com | May 2009
// -------------------------------------------
// Provided free, "as-is", for any use. No warranty or support.
// http://www.schillmania.com/projects/javascript-animation-3/

var writeDebug = (typeof console != 'undefined' && console.log && window.location.href.match(/debug=1/i))?function(sDebug) {
  // use #debug=1 etc. in URL to enable debug output for console.log()-supported shiz
  console.log(sDebug);
}:function() {
  // oh well
}

function Animator() {
  var self = this;
  var intervalRate = 20;
  this.tweenTypes = {
    'default': [1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,3,2,1],
    'blast': [12,12,11,10,10,9,8,7,6,5,4,3,2,1],
    'linear': [10,10,10,10,10,10,10,10,10,10]
  }
  this.queue = [];
  this.queueHash = [];
  this.active = false;
  this.timer = null;
  this.createTween = function(start,end,type) {
    // return array of tween coordinate data (start->end)
    type = type||'default';
    var tween = [start];
    var tmp = start;
    var diff = end-start;
    var x = self.tweenTypes[type].length;
    for (var i=0; i<x; i++) {
      tmp += diff*self.tweenTypes[type][i]*0.01;
      tween[i] = {};
      tween[i].data = tmp;
      tween[i].event = null;
    }
    return tween;
  }

  this.enqueue = function(o,fMethod,fOnComplete) {
    // add object and associated methods to animation queue
    if (!fMethod) {
      //writeDebug('animator.enqueue(): missing fMethod');
    }

    self.queue.push(o);
    o.active = true;
  }

  this.animate = function() {
    var active = 0;
    for (var i=0,j=self.queue.length; i<j; i++) {
      if (self.queue[i].active) {
        self.queue[i].animate();
        active++;
      }
    }
    if (active == 0 && self.timer) {
      // all animations finished
      //writeDebug('Animations complete');
      self.stop();
    } else {
      // writeDebug(active+' active');
    }
  }

  this.start = function() {
    if (self.timer || self.active) {
      //writeDebug('animator.start(): already active');
      return false;
    }
    //writeDebug('animator.start()'); // report only if started
    self.active = true;
    self.timer = setInterval(self.animate,intervalRate);
  }

  this.stop = function() {
    //writeDebug('animator.stop()',true);
    // reset some things, clear for next batch of animations
    clearInterval(self.timer);
    self.timer = null;
    self.active = false;
    self.queue = [];
  }

}

function Animation(oParams) {
  // unique animation object
  /*
    oParams = {
      from: 200,
      to: 300,
      tweenType: 'default',
      ontween: function(value) { ... }, // method called each time
      oncomplete: function() { ... } // when finished
    }
  */
  var self = this;
  if (typeof oParams.tweenType == 'undefined') {
    oParams.tweenType = 'default';
  }

  this.timeline = oParams.timeline;
  this.ontween = (oParams.ontween||null);
  this.oncomplete = (oParams.oncomplete||null);
  this.tween = self.timeline.animation.animator.createTween(oParams.from,oParams.to,oParams.tweenType);
  this.frameCount = self.timeline.animation.animator.tweenTypes[oParams.tweenType].length;
  this.frame = 0;
  this.active = false;

  this.animate = function() {
    // generic animation method
    if (self.active) {
      if (self.ontween && self.tween[self.frame]) {
        self.ontween(self.tween[self.frame].data);
      }
      if (self.frame++ >= self.frameCount-1) {
        //writeDebug('animation(): end');
        self.active = false;
        self.frame = 0;
        if (self.oncomplete) {
          self.oncomplete();
          // self.oncomplete = null;
        }
        return false;
      }
      return true;
    }
    return false;
  }

  this.start = function() {
    // add this to the main animation queue
    self.timeline.animation.animator.enqueue(self,self.animate,self.oncomplete);
    if (!self.timeline.animation.animator.active) {
      self.timeline.animation.animator.start();
    }
  }

  this.stop = function() {
    self.active = false;
  }
  
}