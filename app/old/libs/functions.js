Object.prototype.extend = function(x) {
   for(i in x)
      this[i] = x[i];
};

Object.prototype.addClass = function(className){
	if(this.className){
		this.className = this.className + ' ' + className;
	}else{
		this.className = className;
	}
}

Object.prototype.removeClass = function(e) {
	this.className = this.className.replace( new RegExp('(?:^|\\s)' + e + '(?!\\S)') ,'');
}

function create_attribute(target, name, value){
	var attribute = document.createAttribute(name);
		attribute.nodeValue = value;

		target.setAttributeNode(attribute);

		return target;
}

function defineInterval(){
	//TODO : Integrate screen size
	return 200;
}

function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}

function getMontName(number){
	switch(number)
	{
		case 0:
			return rezpawnMessage.month.jan;
			break;
		case 1:
			return rezpawnMessage.month.feb;
			break;
		case 2:
			return rezpawnMessage.month.mar;
			break;
		case 3:
			return rezpawnMessage.month.apr;
			break;
		case 4:
			return rezpawnMessage.month.may;
			break;
		case 5:
			return rezpawnMessage.month.jun;
			break;
		case 6:
			return rezpawnMessage.month.jul;
			break;
		case 7:
			return rezpawnMessage.month.aug;
			break;
		case 8:
			return rezpawnMessage.month.sep;
			break;
		case 9:
			return rezpawnMessage.month.oct;
			break;
		case 10:
			return rezpawnMessage.month.nov;
			break;
		case 11:
			return rezpawnMessage.month.dec;
			break;
		default:
			return rezpawnMessage.month.jan;
			break;
	}
}

function whichTransitionEvent(){
    var t;
    var el = document.createElement('fakeelement');
    var transitions = {
      'transition':'transitionend',
      'OTransition':'oTransitionEnd',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    }

    for(t in transitions){
        if( el.style[t] !== undefined ){
            return transitions[t];
        }
    }
}




