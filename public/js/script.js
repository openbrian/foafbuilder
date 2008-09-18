/*---------------------------------------utils---------------------------------------*/

/*for uniquing an array*/
Array.prototype.dedup = function () {
  var newArray = new Array ();
  var seen = new Object ();
  for ( var i = 0; i < this.length; i++ ) {
    if ( seen[ this[i] ] ) continue;
    newArray.push( this[i] );
    seen[ this[i] ] = 1;
  }
  return newArray;
}

/*------------------------------------------------------------------------------*/

/*---------------------------------------load, save, clear, write (ajax functions)---------------------------------------*/

/*loads all the foaf data from the given file (or the session if there is no uri) into the editor.*/
function loadFoaf(name){

	url = document.getElementById('foafUri').value;
  	//we're now generating everything from javascript so we don't need to do this.
  	//$.post("/index/"+name, { uri: url}, function(data2){document.getElementById('personal').innerHTML=data2;});
  	
  	//TODO use jquery event handler to deal with errors on requests
  	//TODO perhaps this is bad.  There certainly should be less hardcoding here.
  	if(name == 'load-accounts'){
  		$.post("/ajax/"+name, { uri: url}, function(data){accountsObjectsToDisplay(data);}, "json");
  	} else {
  		$.post("/ajax/"+name, { uri: url}, function(data){genericObjectsToDisplay(data);}, "json");
  	}
  	
  	//FIXME: this is broken
  	document.getElementById('load-contact-details').style.backgroundImage = 'url(/images/pink_background.gif)';
  	document.getElementById('load-the-basics').style.backgroundImage = 'url(/images/pink_background.gif)';
  	document.getElementById('load-pictures').style.backgroundImage = 'url(/images/pink_background.gif)';
  	document.getElementById('load-accounts').style.backgroundImage = 'url(/images/pink_background.gif)';
  	document.getElementById('load-friends').style.backgroundImage = 'url(/images/pink_background.gif)';
  	document.getElementById('load-blogs').style.backgroundImage = 'url(/images/pink_background.gif)';
  	document.getElementById('load-interests').style.backgroundImage = 'url(/images/pink_background.gif)';
  	document.getElementById('load-other').style.backgroundImage = 'url(/images/pink_background.gif)';
  	
  	document.getElementById(name).style.backgroundImage='url(/images/blue_background.gif)';
}

/*saves all the foaf data*/
function saveFoaf(){
	displayToObjects();
	jsonstring = JSON.serialize(pageData);
	
	//updateFoafDateOfBirthElements();
	
	//TODO use jquery event handler to deal with errors on this request
  	$.post("/ajax/save-foaf", {model : jsonstring}, function(){}, "json");
  		
}

/*Writes FOAF to screen*/
function writeFoaf() {
        //$.post("/writer/write-Foaf", { }, function(data){alert(data.name);console.log(data.time);},"json");
	url = document.getElementById('writeUri').value;
        $.post("/writer/write-Foaf", {uri: url }, function(){},null);
}

/*Clears FOAF model from session*/
function clearFoaf() {
        //$.post("/ajax/clear-Foaf", { }, function(data){alert(data.name);console.log(data.time);},"json");
        $.post("/ajax/clear-Foaf", { }, function(){},null);
        
        /*empty all the text inputs*/
        var inputs = document.getElementsByTagName('input'); 
        for(i=0 ; i<inputs.length ; i++){
        	if(inputs[i].type=='text'){
        		document.getElementById(inputs[i].id).value = null;
        	}
        }
}

/*------------------------------------------------------------------------------*/

/*--------------------------------------inputs to objects---------------------------------------*/


/*populates form fields etc from javascript objects (from json) and fills out the global arrays */ 
function genericObjectsToDisplay(data){
  	
  	pageData = new PageDataObject();
	
	//TODO: perhaps some fading here further down the line
  	document.getElementById('personal').innerHTML = '';
  			
  	/*populate all the arrays in the pageData object (one for each field)*/	
	for(arrayName in pageData){			
	  	if(arrayName != 'foafPrimaryTopic'){
			var name = arrayName.substring(0,arrayName.length-10);

			for(k=0 ; k < data.length; k++){
				if(data[k][name]){		
					/*the average field, just slam it in the appropriate array and don't put in any empty fields*/
				  	if(data[k][name].label){
				 		pageData[arrayName][pageData[arrayName].length] = data[k][name].label;
				 	} else if(data[k][name].uri){
				 		pageData[arrayName][pageData[arrayName].length] = data[k][name].uri;
				 	} 
				 } 
		 	}
		 	pageData[arrayName] = pageData[arrayName].dedup();
		}//end if
	}
	
	
	for(arrayName in pageData){		 	
	  	if(arrayName != 'foafPrimaryTopic'){
	  		var name = arrayName.substring(0,arrayName.length-10);
	  		
			for(i=0 ; i < pageData[arrayName].length; i++){
			 	/*either create a new element or fill in the old one*/
			 	createElement(name,pageData[arrayName][i],i);
			}		
		}//end if
	}//end for
}

function accountsObjectsToDisplay(data){	
	pageData = new PageDataObject();
	
	//TODO: perhaps some fading here further down the line
  	document.getElementById('personal').innerHTML = '';
  			
  	/*populate all the arrays in the pageData object (one for each field)*/	
	for(arrayName in pageData){			
	  	if(arrayName != 'foafPrimaryTopic'){
			var name = arrayName.substring(0,arrayName.length-10);

			for(k=0 ; k < data.length; k++){
				/*render blank fields for accounts*/
				if(data[k][name] != null){		
				  	if(data[k][name].label){
				 		pageData[arrayName][pageData[arrayName].length] = data[k][name].label;
				 	} else if(data[k][name].uri){
				 		pageData[arrayName][pageData[arrayName].length] = data[k][name].uri;
				 	} else{
				 		pageData[arrayName][pageData[arrayName].length] = "";
				 	}
				 } 
		 	}
		 	/*don't dedup in this case*/
		 	//pageData[arrayName] = pageData[arrayName].dedup();
		}//end if
	}
	
	
	for(arrayName in pageData){		 	
	  	if(arrayName != 'foafPrimaryTopic'){
	  		var name = arrayName.substring(0,arrayName.length-10);
	  		
			for(i=0 ; i < pageData[arrayName].length; i++){
			 	/*either create a new element or fill in the old one*/
			 	createElement(name,pageData[arrayName][i],i);
			}		
		}//end if
	}//end for
}


/*populates the triples objects with stuff from the actual display (i.e. what the user has changed)*/
//TODO: needs to cope with added and deleted triples and scary random stuff like combining different ways of describing a birthday
//TODO: datatypes/languages

function displayToObjects(){
  	
  	/*loop through all the arrays (for foafName, foafHomepage etc) defined in the pageData object*/
	for(arrayName in pageData){
		if(arrayName != "foafPrimaryTopic"){
			//chop off the ArrayValue bit at the end.
			var name = arrayName.substring(0,arrayName.length-10);
			
			for(i=0; document.getElementById(name+'_'+i); i++){
				//TODO: what about validation.  Where's it to go?
				if(document.getElementById(name+'_'+i) != ""){
					pageData[arrayName][i] = document.getElementById(name+'_'+i).value;
				}
			}
		}//end if
	}//end for
}

/*------------------------------------------------------------------------------*/

/*--------------------------------------element generators---------------------------------------*/

/*creates an element for a given field, denoted by name and populates it with the appropriate value*/
function createElement(name,value,thisElementCount){
	//TODO: put some sort of big switch statement

	/*create the containing div and label, if it hasn't already been made*/
	//TODO: need a more sensible way to decide whether to render these.
	if(name == 'bioBirthday' || name == 'foafBirthday' || name == 'foafDateOfBirth'){
		/*We only want one birthday field, so create a container called foafDateOfBirth *
		 * and act like that's what we're dealing with now.*/
		createFirstFieldContainer('foafDateOfBirth');
		createFoafDateOfBirthElement(name, value, thisElementCount);
		
	} else if(name=='foafDepiction'){
		createFirstFieldContainer(name);
		createFoafDepictionElement(name, value, thisElementCount);
		
	} else {
	
		createFirstFieldContainer(name);
		createGenericInputElement(name, value, thisElementCount);
		
	}			
}

/*creates and appends a field container for the given name if it is not already there*/
function createFirstFieldContainer(name){
	if(!document.getElementById(name+'_container')){
		/*label*/
		newFieldLabelContainer = document.createElement('div');
		newFieldLabelContainer.setAttribute("class","fieldLabelContainer");
		textNode = document.createTextNode(fieldLabelsArray[name]);
		newFieldLabelContainer.appendChild(textNode);

		/*value*/
		newFieldValueContainer = document.createElement('div');
		newFieldValueContainer.id = name+'_container';
		newFieldValueContainer.setAttribute("class","fieldValueContainer");

		/*container*/
		newFieldContainer = document.createElement('div');
		newFieldContainer.setAttribute("class","fieldContainer");

		/*append them*/
		container = document.getElementById('personal');
		container.appendChild(newFieldContainer);
		newFieldContainer.appendChild(newFieldLabelContainer);
		newFieldContainer.appendChild(newFieldValueContainer);
	}
}

/*creates and appends a generic input element to the appropriate field container*/
function createGenericInputElement(name, value, thisElementCount, contname){
	newElement = document.createElement('input');
	newElement.id = name+'_'+thisElementCount;
	newElement.setAttribute('value',value);
	
	/*if there is a specific container we want to put it in*/
	if(contname){
		name = contname;
	}
	
	document.getElementById(name+'_container').appendChild(newElement);
	newElement.setAttribute('class','fieldInput');
	
	return newElement;
}


/*creates and appends a generic hidden element and appends it to the appropriate field container*/
function createGenericHiddenElement(name, value, thisElementCount, contname){
	newElement = document.createElement('input');
	newElement.id = name+'_'+thisElementCount;
	newElement.setAttribute('value',value);
	
	/*if there is a specific container we want to put it in*/
	if(contname){
		name = contname;
	}
	
	newElement.setAttribute('type','hidden');
	document.getElementById(name+'_container').appendChild(newElement);
//	newElement.setAttribute('class','fieldInput');
	
	return newElement;
}

//TODO: think about being more strict about variable scoping
/*creates an element for foaf depiction*/
function createFoafDepictionElement(name, value, thisElementCount){
	//create imgElement
	imgElement = document.createElement('img');
	imgElement.setAttribute('class','fieldImage');
	imgElement.src = value;

	//create input Element
	newElement = document.createElement('input');
	newElement.id = name+'_'+thisElementCount;
	newElement.setAttribute('value',value);
	newElement.setAttribute('class','fieldInput');

	//appendElements as necessary
	document.getElementById(name+'_container').appendChild(newElement);
	document.getElementById(name+'_container').appendChild(imgElement);
}

function createFoafDateOfBirthElement(name, value, thisElementCount){
	/*if we have rendered one of the alternative birthday things already then hide the other one*/
	//TODO: need to add some onchange functionality to ensure this saves properly.
	if(document.getElementById(name+'_container')){
		var hiddenElement = createGenericHiddenElement(name, value, thisElementCount,'foafDateOfBirth');		

  		var dayDropDownElement = document.createElement('select');
  		var monthDropDownElement = document.createElement('select');
  		var yearDropDownElement =document.createElement('select');
		dayDropDownElement.setAttribute('onchange', 'updateFoafDateOfBirthElements()');
		monthDropDownElement.setAttribute('onchange', 'updateFoafDateOfBirthElements()');
		yearDropDownElement.setAttribute('onchange', 'updateFoafDateOfBirthElements()');
			
  		dayDropDownElement.setAttribute('class','dateSelector');
  		dayDropDownElement.id = 'dayDropdown';
  		monthDropDownElement.setAttribute('class','dateSelector');
  		monthDropDownElement.id = 'monthDropdown';
  		yearDropDownElement.setAttribute('class','dateSelector');
  		yearDropDownElement.id = 'yearDropdown';
  		
  		document.getElementById(name+'_container').appendChild(dayDropDownElement);
  		document.getElementById(name+'_container').appendChild(monthDropDownElement);
  		document.getElementById(name+'_container').appendChild(yearDropDownElement);
  		
  		/*populate dropdowns with appropriate values*/
  		var dateArray = value.split("-");

  		if(dateArray.length == 2){
  			populatedropdown(dayDropDownElement,monthDropDownElement,yearDropDownElement,dateArray[0],dateArray[1],null);
		} else if(dateArray.length == 3){
  			populatedropdown(dayDropDownElement,monthDropDownElement,yearDropDownElement,dateArray[0],dateArray[1],dateArray[2]);
		} else {
			//FIXME: need to have a cleverer way of dealing with this.
  			alert("Date string invalid");
		}
	} else {
		createGenericHiddenElement(name, value, thisElementCount,'foafDateOfBirth');
	}
}

/*---------------------------------- functions to ensure hidden fields are up to date... TODO: poss to be done at save?-------------------------------*/

/*ensures that all the hidden date of birth fields are up to date*/
function updateFoafDateOfBirthElements(){
	var i=0
	
	for(i=0; i < document.getElementById('foafDateOfBirth_container').childNodes.length; i++){

		var element = document.getElementById('foafDateOfBirth_container').childNodes[i];
		
		//FIXME: ensure that this updates things in the right way i.e. only month and year for foaf:birthday
		var dayValue = document.getElementById('dayDropdown').value;
		if(dayValue.length==1){
			dayValue = '0'+dayValue;
		}

		var monthValue =document.getElementById('monthDropdown').value;
		if(monthValue.length==1){
			monthValue = '0'+monthValue;
		}
		var yearValue = document.getElementById('yearDropdown').value;
		
		var value;

		if(parseFloat(yearValue) == 0){
			/*we only want to set foafBirthday if this is the case*/
			if(element.id.substr(0,12) == 'foafBirthday'){
				element.value = monthValue+'-'+dayValue;
			} else {
				/*TODO: deal with deleting elements*/
				element.value = '';
			}
		} else {
			if(element.id.substr(0,12) == 'foafBirthday'){
				element.value = monthValue+'-'+dayValue;
			} else {
				element.value = yearValue+'-'+monthValue+'-'+dayValue;
			}
		}
	}																																
	document.getElementById('foafDateOfBirth_container').childNodes[i];
}


