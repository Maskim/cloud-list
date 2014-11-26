/*!
* rezpawn-timeline.js
* http://rezpawn.com/
*
* Copyright 2014 Maxime HERSAND
* Integrator at Clever age
* 
*/

'use strict';

function Timeline(context, config, messages){
	var timeline = this;

	timeline.options = { //the default parameters
        trophiesType: {
            psn: {active: false, indent: false},
            xbox: {active: false, indent: false},
            google: {active: false, indent: false},
            steam: {active: false, indent: false}
        },
        interval: 150,
        minDate: new Date(),
        maxDate: new Date(),
        transparency: 'rgba(255, 255, 255, 0)'
	};

    timeline.trophies = []; //All trophies of the timeline
    timeline.numberOfTrophies = {
        all: 0,
        years: {},
        maxFromYears: 0
    };

    timeline.canvasState = '';
    timeline.context = context;
    timeline.ctx = context.getContext('2d');

    timeline.width = timeline.ctx.canvas.width; //Width of the Canvas
    timeline.height = timeline.ctx.canvas.height; //Height of the Canvas

    timeline.init = function(){
        //merge config
        timeline.options = mergeTimelineConfig(timeline.options, config);

        //INSTANTIATE TROPHIES
        for(var i = 0; i < timeline.options.trophies.length; i++){
            var trophy = timeline.options.trophies[i];
            var trophyDate = trophy.date.split('-');

            trophyDate[0] = parseInt(trophyDate[0]) - 1;
            trophy.date = new Date(trophyDate[2], trophyDate[0], 29);

            timeline.numberOfTrophies.all++;

            if(typeof(timeline.numberOfTrophies.years[trophy.date.getFullYear()]) !== 'undefined'){
                timeline.numberOfTrophies.years[trophy.date.getFullYear()].number++;
            }else{
                timeline.numberOfTrophies.years[trophy.date.getFullYear()] = {
                    number: 1,
                    month: {}
                };
            }

            //DEFINE MIN DATE
            if(trophy.date < timeline.options.minDate){
                timeline.options.minDate = trophy.date;
            }

            //DEFINE NB Max trophies
            if(timeline.numberOfTrophies.maxFromYears < timeline.numberOfTrophies.years[trophy.date.getFullYear()].number){
                timeline.numberOfTrophies.maxFromYears = timeline.numberOfTrophies.years[trophy.date.getFullYear()].number;
            }
        }

        //INIT CANVAS STATE
        timeline.canvasState = new CanvasState(timeline.context);

        //CREATE BASE GRAPHISM
            var line = new TimelineLine({
                x: 0,
                y: timeline.height-50,
                x2: timeline.width,
                y2: timeline.height-50,
                strokeStyle: '#FFFFFF',
                lineWidth: 1
            });
            timeline.canvasState.addEntities(line);


            line = new TimelineLine({
                x: 0,
                y: 100,
                x2: timeline.width,
                y2: 100,
                fillStyle: '#FFFFFF',
                strokeStyle: '#FFFFFF',
                lineWidth: 1
            });
            timeline.canvasState.addEntities(line);

            var shape = new TimelineShape({
                x: 0,
                y: timeline.height-50,
                x2: timeline.width,
                y2: timeline.height,
                fillStyle: 'rgba(255, 255, 255, 0.3)'
            });
            timeline.canvasState.addEntities(shape);
        //END BASE GRAPHISM

        //CREATE ABSCISSE
        var yearSelected = timeline.options.maxDate.getFullYear();
        for(i = timeline.options.minDate.getFullYear(); i <= timeline.options.maxDate.getFullYear() + 1; i++){
            var yearInterval = i - yearSelected;
            var abscisse = timeline.width/2 + (yearInterval * timeline.options.interval);

            var optionsPoint = {};
            optionsPoint = {
                x: abscisse,
                y: timeline.height-50,
                radius: 3,
                fillStyle: '#FFFFFF',
                lineWidth: 1,
                strokeStyle: '#FFFFFF',
                isShadow: false,
                year: i
            };
            if(yearSelected === i){
                optionsPoint.isShadow = true;
                optionsPoint.shadowBlur = 3;
            }

            var yearPoint = new TimelinePoint(optionsPoint);
            timeline.canvasState.addEntities(yearPoint);

            var yearText = new TimelineText({
                content: i,
                x: abscisse,
                y: timeline.height-20,
                fillStyle: '#FFFFFF',
                font: "14pt Verdana"
            });
            timeline.canvasState.addEntities(yearText);
        }
    };
    //END INIT

    timeline.generateTrophies = function(){
        var timeline = this;

        //for()

        console.log(timeline);
    }

    //INSTANTIATE ELEMENTS
    timeline.init();
    timeline.generateTrophies();
}

function mergeTimelineConfig(defaults,userDefined){
    var returnObj = {},
        attrname = '';

    for (attrname in defaults) { returnObj[attrname] = defaults[attrname]; }
    for (attrname in userDefined) { returnObj[attrname] = userDefined[attrname]; }

    return returnObj;
}

function CanvasState(canvas){
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');

    // This complicates things a little but but fixes mouse co-ordinate problems
    // when there's a border or padding. See getMouse for more detail
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
        this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
        this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
        this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
    }
    // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
    // They will mess up mouse coordinates and this fixes that
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;

    // **** Keep track of state! ****

    this.valid = false; // when set to false, the canvas will redraw everything
    this.entities = [];  // the collection of things to be drawn
    this.dragging = false; // Keep track of when we are dragging
    // the current selected object. In the future we could turn this into an array for multiple selection
    this.selection = null;
    this.dragoffx = 0; // See mousedown and mousemove events for explanation
    this.dragoffy = 0;

    // **** Then events! ****

    // This is an example of a closure!
    // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
    // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
    // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
    // This is our reference!
    var myState = this;

    //fixes a problem where double clicking causes text to get selected on the canvas
    canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
    // Up, down, and move are for dragging
    canvas.addEventListener('mousedown', function(e) {
        var mouse = myState.getMouse(e);
        var mx = mouse.x;
        var my = mouse.y;

        //DO STUF

        // havent returned means we have failed to select anything.
        // If there was an object selected, we deselect it
        if (myState.selection) {
            myState.selection = null;
            myState.valid = false; // Need to clear the old selection border
        }
    }, true);
    canvas.addEventListener('mousemove', function(e) {
        if (myState.dragging){
            var mouse = myState.getMouse(e);
            // We don't want to drag the object by its top-left corner, we want to drag it
            // from where we clicked. Thats why we saved the offset and use it here
            myState.selection.x = mouse.x - myState.dragoffx;
            myState.selection.y = mouse.y - myState.dragoffy;
            myState.valid = false; // Something's dragging so we must redraw
        }
    }, true);
    canvas.addEventListener('mouseup', function(e) {
        myState.dragging = false;
    }, true);
    // double click for making new shapes
    canvas.addEventListener('dblclick', function(e) {
        var mouse = myState.getMouse(e);

        //DO STUF

    }, true);

    // **** Options! ****

    this.interval = 30;
    setInterval(function() { myState.draw(); }, myState.interval);
}

CanvasState.prototype.addEntities = function(entities){
    this.entities.push(entities);
    this.valid = false;
};

CanvasState.prototype.clear = function(){
    this.ctx.clearRect(0, 0, this.width, this.height);
};

CanvasState.prototype.draw = function(){
    if (!this.valid){
        var ctx = this.ctx;
        var entities = this.entities;

        this.clear();

        //draw all entitites
        for(var i = 0; i < entities.length; i++){
            entities[i].draw(ctx);
        }

        this.valid = true;
    }
};

function mergeOptions(defaultOptions, newOptions){
    for(var index in newOptions){
        if (newOptions.hasOwnProperty(index)) {
            defaultOptions[index] = newOptions[index];
        }
    }
}

function TimelineEntity(options){
    var entity = this

    entity.x = 0;
    entity.y = 0;
    entity.fillStyle = '#FFFFFF';

    entity.lineWidth = 0;
    entity.strokeStyle = '';

    entity.shadowColor = '#FFFFFF';
    entity.shadowBlur = 0;
    entity.shadowOffsetX = 0;
    entity.shadowOffsetY = 0;

    mergeOptions(entity, options);
}

function TimelinePoint(options){
    //extendsEntity
    TimelineEntity.apply(this, options);

    var pnt = this;

    pnt.radius = 0;
    pnt.isShadow = false;

    mergeOptions(pnt, options);
}

TimelinePoint.prototype.draw = function(context){
    var ptn = this;

    context.beginPath();
    context.arc(ptn.x, ptn.y, ptn.radius, 0, 2 * Math.PI, false);
    context.fillStyle = ptn.fillStyle;
    context.shadowColor = ptn.shadowColor;
    context.shadowBlur = ptn.shadowBlur;
    context.shadowOffsetX = ptn.shadowOffsetX;
    context.shadowOffsetY = ptn.shadowOffsetY;
    context.fill();

    if(ptn.strokeStyle){
        context.lineWidth = ptn.lineWidth;
        context.strokeStyle = ptn.strokeStyle;
        context.stroke();
    }

    context.closePath();
};

function TimelineLine(options){
    //extendsEntity
    TimelineEntity.apply(this, options);

    var line = this;

    line.x2 = 0;
    line.y2 = 0;

    mergeOptions(line, options);
}

TimelineLine.prototype.draw = function(context){
    var line = this;

    context.beginPath();

    context.moveTo(line.x, line.y);
    context.lineTo(line.x2, line.y2);

    context.shadowColor = line.shadowColor;
    context.shadowBlur = line.shadowBlur;
    context.shadowOffsetX = line.shadowOffsetX;
    context.shadowOffsetY = line.shadowOffsetY;

    context.lineWidth = line.lineWidth;

    if(line.strokeStyle){
        context.strokeStyle = line.strokeStyle;
    }
    context.stroke();

    context.closePath();
};

function TimelineShape(options){
    //extendsEntity
    TimelineEntity.apply(this, options);

    var shape = this;

    shape.x2 = 0;
    shape.y2 = 0;

    mergeOptions(shape, options);
}

TimelineShape.prototype.draw = function(context){
    var shape = this;

    context.beginPath();

    context.rect(shape.x, shape.y, shape.x2, shape.y2);
    context.fillStyle = shape.fillStyle;

    context.shadowColor = shape.shadowColor;
    context.shadowBlur = shape.shadowBlur;
    context.shadowOffsetX = shape.shadowOffsetX;
    context.shadowOffsetY = shape.shadowOffsetY;

    context.fill();
    context.lineWidth = shape.lineWidth;
    if(shape.strokeStyle){
        context.strokeStyle = shape.strokeStyle;
        context.stroke();
    }


    context.closePath();
};

function TimelineText(options){
    //extendsEntity
    TimelineEntity.apply(this, options);

    var text = this;

    text.content = '';
    text.textAlign = 'center';
    text.textBaseLine = 'top';
    text.font = '14pt Verdana';

    mergeOptions(text, options);
}

TimelineText.prototype.draw = function(context){
    var text = this;

    context.beginPath();
    context.font = text.font;
    context.textAlign = text.textAlign;
    context.textBaseLine = text.textBaseLine;
    context.fillStyle = text.fillStyle;
    context.fillText(text.content, text.x, text.y);

    context.shadowColor = text.shadowColor;
    context.shadowBlur = text.shadowBlur;
    context.shadowOffsetX = text.shadowOffsetX;
    context.shadowOffsetY = text.shadowOffsetY;

    context.closePath();
};