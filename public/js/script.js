/*global variable for storing data*/
var globalFieldData;

/*--------------------------permanent data functions---------------------------*/
/*variable storing online account urls (e.g. www.skype.com) and keying them against their names (e.g. skype)*/

//TODO possibly this should be a global array
function getAllOnlineAccounts(){
	//TODO: need to increase this list.  See allAccountServiceurls file.
	var oA = new Array();
	oA['Skype'] = 'http://www.skype.com/';
	oA['Yahoo'] = 'http://messenger.yahoo.com/';
	oA['MSN'] = 'http://messenger.msn.com/';
	oA['Delicious'] = 'http://del.icio.us';
	oA['Flickr'] = 'http://www.flickr.com/';
	oA['Livejournal'] = 'http://www.livejournal.com/';
	
	return oA;
}

//XXX not really a data function but it seems to fit best here.  Turns a username into a profile page url, returns null if it can't.
//TODO: increase this list and arrange in a more sensible way. Possibly use QDOS here?
function getUrlFromOnlineAccounts(username,type){
	
	var allAccountsArray = getAllOnlineAccounts();

	if(typeof(allAccountsArray[type]) == 'undefined'){
		return null;
	} else {
		switch(type){
			case 'Skype':
				return null;
				break;
			case 'MSN':
				return null;
				break;
			case 'Yahoo':
				return null;
				break;
			case 'Delicious':
				return 'http://del.icio.us/'+username+'/';
				break;
			case 'Flickr':
				return 'http://www.flickr.com/people/'+username+'/';
				break;
			case 'Livejournal':
				return 'http://'+username+'.livejournal.com/';
				break;
			default:
				return null;
				break;
		}
	}
	
}


/*------------------------------------------------------------------------------*/

/*---------------------------------------load, save, clear, write (ajax functions)---------------------------------------*/

/*loads all the foaf data from the given file (or the session if there is no uri) into the editor.*/
function loadFoaf(name){

	url = document.getElementById('foafUri').value;

  	//TODO use jquery event handler to deal with errors on requests
  	//TODO perhaps this is bad.  There certainly should be less hardcoding here.
  	$.post("/ajax/"+name, { uri: url}, function(data){genericObjectsToDisplay(data);}, "json");
  	
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
function saveFoaf(name){
	displayToObjects();
	jsonstring = JSON.serialize(globalFieldData);
	
	//updateFoafDateOfBirthElements();
	
	//TODO use jquery event handler to deal with errors on this request
  	$.post("/ajax/save-foaf", {model : jsonstring});
  	
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

	globalFieldData = data;
	  	
	document.getElementById('personal');

	//TODO: perhaps some fading here further down the line
  	document.getElementById('personal').innerHTML = '';	
  	
  	//TODO: perhaps don't need this loop
	for(i=0 ; i < data.length; i++){	
		var name = data[i].name;
		var containerElement = createFieldContainer(name, data[i].displayLabel);
		
		/*loop through all the simple fields and render them*/	
		if(data[i].fields){
			
			renderSimpleFields(i, name, data);

		/*render an account field*/
		} else if(data[i].foafHoldsAccountFields){
		
			renderAccountFields(i, data, containerElement);
		}
	}
}

function renderAccountFields(i, data, containerElement){
	//TODO: make this shiny i.e. use dropdowns and icons etc.
	
	//createAccountsInputElement(name, '', k, holdsAccountElement);	
	for(accountBnodeId in data[i].foafHoldsAccountFields){
		
		/*create a container for this account. E.g. a Skype account represented by accountBnodeId=bNode3*/
		var holdsAccountElement = createHoldsAccountElement(containerElement,accountBnodeId);
		
		/*create an element for the foafAccountServiceHomepage*/
		if(data[i].foafHoldsAccountFields[accountBnodeId].foafAccountServiceHomepage[0]){
			createFoafAccountServiceHomepageInputElement(data[i].foafHoldsAccountFields[accountBnodeId].foafAccountServiceHomepage[0].uri, holdsAccountElement);	
		} else {
			/*create an empty element*/
			createFoafAccountServiceHomepageInputElement('', holdsAccountElement);	
		}
		/*create an element for the foafAccountName*/
		if(data[i].foafHoldsAccountFields[accountBnodeId].foafAccountName[0]){
			createAccountsInputElement('foafAccountName', data[i].foafHoldsAccountFields[accountBnodeId].foafAccountName[0].label, holdsAccountElement);	
		} else {
			/*create an empty element*/
			createAccountsInputElement('foafAccountName', '', holdsAccountElement);	
		}
		/*create an element for the foafAccountProfilePage*/
		if(data[i].foafHoldsAccountFields[accountBnodeId].foafAccountProfilePage[0]){
			createAccountsInputElement('foafAccountProfilePage', data[i].foafHoldsAccountFields[accountBnodeId].foafAccountProfilePage[0].uri, holdsAccountElement);	
		} else {
			/*create an empty element*/
			createAccountsInputElement('foafAccountProfilePage', '', holdsAccountElement);	
		}
		/*hide/show the profilePage url as appropriate*/	
		if(data[i].foafHoldsAccountFields[accountBnodeId].foafAccountServiceHomepage[0].uri){
			toggleHiddenAccountInputElements(data[i].foafHoldsAccountFields[accountBnodeId].foafAccountServiceHomepage[0].uri,holdsAccountElement,'');
		}
	}
	/*a link to add another account*/	
	createAccountsAddElement(containerElement);
}

/*renders the appropriate simple fields for the index i in the json data, data with the name name*/
function renderSimpleFields(i, name, data){
	for(k=0 ; k < data[i].fields.length; k++){
		if(data[i].fields[k][name].label){
			createGenericInputElement(name, data[i].fields[k][name].label, k);
		} else if(data[i].fields[k][name].uri){
			createGenericInputElement(name, data[i].fields[k][name].uri, k);
		} 
	}
	if(data[i].fields.length == 0){
		createGenericInputElement(name, "", k);
	}
}

/*populates the triples objects with stuff from the actual display (i.e. what the user has changed)*/
//TODO: needs to cope with added and deleted triples and scary random stuff like combining different ways of describing a birthday
//TODO: datatypes/languages

function displayToObjects(){  
	
	/*first do accounts stuff*/	
	/*TODO This will change when the display is improved + need a bit less hardcoding possibly*/
  	var containerElement = document.getElementById('foafHoldsAccount_container');
  	
  	/*an array of keys that have not been removed from the dom tree*/
 	var doNotCleanArray = new Array();
 	
 	
  	for(i=0; i < containerElement.childNodes.length; i++){
  		
  		var holdsAccountElement = containerElement.childNodes[i];
  		var bNodeId = containerElement.childNodes[i].id;
  		
		/*some mangling to autogenerate profilePage urils */
  		updateProfilePageUrl(holdsAccountElement);
  		
  		/*we don't want to clean this from the globalFieldData*/
  		doNotCleanArray[bNodeId] = bNodeId;
  		
  		/*ignore all elements that don't don't contain accounts (such as add/remove links)*/
  		if(holdsAccountElement.className == "holdsAccount"){
  			//globalFieldData[i].foafHoldsAccountFields[containerElement.childNodes[i].id] = new Array();
		
			
  			for(k=0; k < containerElement.childNodes[i].childNodes.length; k++){
  				
  				if(holdsAccountElement.childNodes[k].value != ''){
  				
	  				//do the right thing for the right element, and miss any elements we don't care about.
	  				if (holdsAccountElement.childNodes[k].id == 'foafAccountName'){
	  					/*create a new element if this account is new*/
	  					if(!globalFieldData[0].foafHoldsAccountFields[bNodeId]){
	  						globalFieldData[0].foafHoldsAccountFields[bNodeId] = new Object;
	  					}
	  					if(globalFieldData[0].foafHoldsAccountFields[bNodeId]){
	  						globalFieldData[0].foafHoldsAccountFields[bNodeId]['foafAccountName'] = [{label : holdsAccountElement.childNodes[k].value}];
	  					}
	  				} else if(holdsAccountElement.childNodes[k].id == 'foafAccountProfilePage'){
	  					/*create a new element if this account is new*/
	  					if(!globalFieldData[0].foafHoldsAccountFields[bNodeId]){
	  						globalFieldData[0].foafHoldsAccountFields[bNodeId] = new Object;
	  					}
	  					globalFieldData[0].foafHoldsAccountFields[bNodeId]['foafAccountProfilePage'] = [{uri : holdsAccountElement.childNodes[k].value}];
	  				} else if (holdsAccountElement.childNodes[k].id == 'foafAccountServiceHomepage'){		
	  					/*create a new element if this account is new*/
	  					if(!globalFieldData[0].foafHoldsAccountFields[bNodeId]){
	  						globalFieldData[0].foafHoldsAccountFields[bNodeId] = new Object;
	  					}
	  					if(globalFieldData[0].foafHoldsAccountFields[bNodeId]){
	  						globalFieldData[0].foafHoldsAccountFields[bNodeId]['foafAccountServiceHomepage'] = [{uri : holdsAccountElement.childNodes[k].value}];				
	  					}
	  				} 	
	  			} 
  			}
  		} 
  	}
  	
  	/*remove all elements (accounts) from the globalFieldData object that have been removed from the dom tree*/
  	for(key in globalFieldData[0].foafHoldsAccountFields){
  		if(!doNotCleanArray[key]){
  			delete globalFieldData[0].foafHoldsAccountFields[key];
  		}
  	}
  	
  	//TODO: sort this out.  This used to use the arrays that were defined in main.phtml but they aren't there anymore.
  	/*loop through all the arrays (for foafName, foafHomepage etc) defined in the pageData object*/
	/*
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
	*/
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
function createFieldContainer(name,label){
	//if(!document.getElementById(name+'_container')){
		/*label*/
		newFieldLabelContainer = document.createElement('div');
		newFieldLabelContainer.setAttribute("class","fieldLabelContainer");
		textNode = document.createTextNode(label);
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
		
		return newFieldValueContainer;
	//}
}

/*creates and appends an account input element to the appropriate field container*/
/*TODO: need one of these for each different type of account element*/
function createAccountsInputElement(name, value, element){
	newElement = document.createElement('input');
	newElement.id = name;
	newElement.setAttribute('value',value);
	
	/*if there is a specific container we want to put it in*/
	if(!element){
		var element = document.getElementById(name);
	}
	/*to make sure the url is automatically generated as we enter this*/ 
	/*if(name == 'foafAccountName'){
		newElement.setAttribute('onchange', 'updateProfilePageUrl(this.parentNode);');
	}*/
	element.appendChild(newElement);
	newElement.setAttribute('class','fieldInput');

	return newElement;
}

/*renders a dropdown box with a list of possible accountServiceHomepages in it (e.g. skype, msn etc)*/
function createFoafAccountServiceHomepageInputElement(value,container){
	selectElement = document.createElement("select");
	

	var allAccounts = getAllOnlineAccounts();
	
	selectElement[0] = new Option('Other','',false,false);
	var y=1;
				
	/*loop through all online accounts and create options from them*/
	for(key in allAccounts){
		if(key != 'dedup'){
			selectElement[y] = new Option(key,allAccounts[key],false,false);
			y++;
		}
	}
	selectElement.id = 'foafAccountServiceHomepage';
	selectElement.className = 'fieldInput';
	selectElement.value = value;
	
	/*show the hidden input elements if there is no option matching this id here*/
	selectElement.setAttribute('onchange',"toggleHiddenAccountInputElements(this.value,this.parentNode, '')");
	
	container.appendChild(selectElement);
}

function createAccountsAddElement(container){

	/*create add link and attach it to the container*/
	var addDiv = document.createElement("div");
	addDiv.id = "addLinkContainer";
	addDiv.className = "addLinkContainer";
	var addLink = document.createElement('a');
	addLink.appendChild(document.createTextNode("+Add another Account"));
	addLink.className="addLink";
	addLink.setAttribute("onclick" , "createEmptyHoldsAccountElement(this.parentNode.parentNode,null)");
	addDiv.appendChild(addLink);
	container.appendChild(addDiv);

}


function createHoldsAccountElement(attachElement, bnodeId){
	
	/*if new, create a random id*/
	if(!bnodeId){
		var bnodeId = createRandomString(50);
	}
	
	/*create holdsAccount div and attach it to the element given*/
	var holdsAccountElement = document.createElement("div");
	holdsAccountElement.setAttribute('class','holdsAccount');
	holdsAccountElement.id = bnodeId;
	attachElement.appendChild(holdsAccountElement);
	
	/*create remove link and attach it to the holds account div*/
	var removeDiv = document.createElement("div");
	removeDiv.id = "removeLinkContainer";
	removeDiv.className = "removeLinkContainer";
	var removeLink = document.createElement('a');
	removeLink.appendChild(document.createTextNode("- Remove this account"));
	removeLink.id="removeLink";
	removeLink.className="removeLink";
	removeLink.setAttribute("onclick" , "this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);");
	removeDiv.appendChild(removeLink);
	holdsAccountElement.appendChild(removeDiv);
	
	return holdsAccountElement;
}

/*creates a holds account element and fills it with empty fields*/
function createEmptyHoldsAccountElement(container){
	
	/*create a new holdsaccount div*/
	var holdsAccountElement = createHoldsAccountElement(container, '');
	
	/*generate fields to fill it up*/
	createFoafAccountServiceHomepageInputElement('', holdsAccountElement);
	createAccountsInputElement('foafAccountName', '', holdsAccountElement);
	createAccountsInputElement('foafAccountProfilePage', '', holdsAccountElement);
	
	/*remove the add element and re add it (to make sure it's at the bottom)*/
	var addElement = document.getElementById('addLinkContainer');
	addElement.parentNode.removeChild(addElement);
	createAccountsAddElement(container);
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

/*when an account dropdown is changed, this renders the appropriate hidden or showing fields 
for the users profile page and/or the account provider box*/
function toggleHiddenAccountInputElements(selectedValue,container,prePopulateValue){

	var allArrayNames = getAllOnlineAccounts();
	var allArrayNamesInverted = new Array();
	
	/*swap keys and values for convenience*/
	for(key in allArrayNames){
		allArrayNamesInverted[allArrayNames[key]] = key;
	}
	
	/*loop through the elements in the container in question and replace things as required*/
	for(var u=0; u<container.childNodes.length; u++){
	
		/*if Other has been selected in the dropdown (so selectedValue is '')*/ 
		if(typeof(allArrayNamesInverted[selectedValue]) == 'undefined'){
			if(container.childNodes[u].id == 'foafAccountProfilePage'){
				//TODO possibly add some nice onclick functionality here
				container.childNodes[u].value = 'Add URL of account service provider here';
				container.childNodes[u].style.display = 'inline';
			}
		} else {
			if(container.childNodes[u].id == 'foafAccountProfilePage'){
				/*hide the profile page box and set its value to blank.  On saving we'll fill it in.*/
				container.childNodes[u].value = '';
				container.childNodes[u].style.display = 'none';
			}
		}
	}
	
}

/*generates the profilePAgeURl from the username*/
function updateProfilePageUrl(container){
	//get username value to generate the uri for this account
	var allArrayNames = getAllOnlineAccounts();
	/*get all the usernames and invert them.  FIXME: this is going to become very slow if the inverted array names is not a global variable*/
	var allArrayNamesInverted = new Array();
	for(key in allArrayNames){
		allArrayNamesInverted[allArrayNames[key]] = key;
	}
	
	var accountServicePageElement = null;
	var username = null;
	var profilePageElement = null;
	
	/*find out what the username is and which element we need to set*/
	for(var z=0; z<container.childNodes.length; z++){
		if(container.childNodes[z].id == 'foafAccountName'){
			username = container.childNodes[z].value;
		}
		else if(container.childNodes[z].id == 'foafAccountProfilePage'){
			profilePageElement = container.childNodes[z];
		}
		else if(container.childNodes[z].id == 'foafAccountServiceHomepage'){
			accountServicePageElement = container.childNodes[z];
		}
	}
	
	if(username != null && accountServicePageElement && profilePageElement){
		var pageValue = getUrlFromOnlineAccounts(username,allArrayNamesInverted[accountServicePageElement.value]);
		if(pageValue){
			profilePageElement.value = pageValue;
		}
	} 
}

/*------------------------------miscellaneous utils-------------------------------*/

/*generates a random string*/
function createRandomString(varLength) {
	var sourceArr = new Array("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z");
	var randomKey;
	var randomCode = "";

	for (i=0; i<varLength; i++) {
		randomKey = Math.floor(Math.random()*sourceArr.length);
		randomCode = randomCode + sourceArr[randomKey];
	}
	return randomCode;
}