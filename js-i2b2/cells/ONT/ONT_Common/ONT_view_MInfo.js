/**
 * @projectDescription	View controller for ONT's "Info" tab.
 * @inherits 	i2b2.ONT.view
 * @namespace	i2b2.ONT.view.mInfo
 * @author		Nich Wattanasin
 * @version 	1.0
 * ----------------------------------------------------------------------------------------
 * updated 12-12-18: Launch [Nich Wattanasin]
 */
console.group('Load & Execute component file: ONT > view > mInfo');
console.time('execute time');
 
 
// create and save the view object
i2b2.ONT.view.mInfo = new i2b2Base_cellViewController(i2b2.ONT, 'mInfo');
 
const VIEW_MINFO_BASE_URL = window.location.origin;

i2b2.ONT.view.mInfo.editDerivedConcept = async function(p_sType, p_aArgs, p_oValue) {
	document.getElementById('overlay').style.display = 'block';

	var requestOptions = {
		method: 'GET',
		headers: getAPIFetchHeader(),
		credentials: 'include'
	};
	
	try {
		const response = await fetch(VIEW_MINFO_BASE_URL + "/api/derived-concepts/" + p_oValue.origData.derivedId, requestOptions);
		const responseData = await response.json();
		
		document.getElementById('overlay').style.display = 'none';
		i2b2.ONT.view.mInfo.editDerivedConceptForm(responseData);

		$('editDerivedConceptDialog').select('INPUT#descriptionE')[0].value = responseData.description;
		$('editDerivedConceptDialog').select('INPUT#pathE')[0].value = responseData.path;
		$('editDerivedConceptDialog').select('INPUT#codeE')[0].value = responseData.code;
		$('editDerivedConceptDialog').select('TEXTAREA#factQueryE')[0].value = responseData.factQuery;

		var radioBtn = document.getElementsByName('typeE');
		for (var x = 0; x < radioBtn.length; x++) {
			if (radioBtn[x].value == responseData.type) {
				radioBtn[x].checked = true;
			}
		}
	}
	catch (error) {
		return console.warn(error);
	}
}

i2b2.ONT.view.mInfo.editDerivedConceptForm = function(filteredData) {
	var handleSubmit = function() {
		if(this.submit()) {

			var rawData = JSON.stringify({
				"description": $('editDerivedConceptDialog').select('INPUT#descriptionE')[0].value,
				"path": $('editDerivedConceptDialog').select('INPUT#pathE')[0].value,
				"code": $('editDerivedConceptDialog').select('INPUT#codeE')[0].value,
				"factQuery": $('editDerivedConceptDialog').select('TEXTAREA#factQueryE')[0].value,
				"type": document.getElementById("typeE1").checked ? 'TEXTUAL' : 'NUMERIC'
			})

			var requestOptions = {
				method: 'PUT',
				headers: getAPIFetchHeader(),
				body: rawData,
				credentials: 'include'
			};

			fetch(VIEW_MINFO_BASE_URL + "/api/derived-concepts/" + filteredData.id, requestOptions)
				.then((response) => {
					return response.json();
				})
				.then((responseData) => {
					i2b2.ONT.view.mInfo.calculateFacts(responseData);

					return responseData;
				})
				.catch(error => console.warn(error));
		}
	}
	i2b2.ONT.view.mInfo.editDerivedConceptDialog(handleSubmit);
}

i2b2.ONT.view.mInfo.calculateFacts = function(data) {
	let loginProjectName = i2b2.PM.model.login_project;
    let getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
    let sessionId = getSessionData["session_id"];
    let username = getSessionData["user_name"];
 
	let loginHeader = new Headers();
    loginHeader.set('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
	loginHeader.append('X-Project-Name', loginProjectName)

	var requestOptions = {
		method: 'POST',
		headers: loginHeader,
		credentials: 'include'
	};

	// fetch(VIEW_MINFO_BASE_URL + "/api/derived-concepts/" + data.id + "/calculate-facts", requestOptions)
	fetch(VIEW_MINFO_BASE_URL + "/cdi-api/compute-facts?path="+data.path, requestOptions)
		.then((response) => {
			return response.json();
		})
		.then((responseData) => {
			return responseData;
		})
		.catch(error => console.warn(error));
}

// ================================================================================================= //
i2b2.ONT.view.mInfo.editDerivedConceptDialog = function(handleSubmit) {
	var handleCancel = function() {
		this.cancel();
	};
	var handleUpdate = function() {
		i2b2.CRC.view.editDerivedConceptDialog.submitterFunction();
	};

	i2b2.CRC.view.editDerivedConceptDialog = new YAHOO.widget.SimpleDialog("editDerivedConceptDialog", {
		width: "500px",
		fixedcenter: true,
		constraintoviewport: true,
		modal: true,
		zindex: 700,
		buttons: [{
			text: "Update",
			handler: handleUpdate,
			isDefault: true
		}, {
			text: "Cancel",
			handler: handleCancel
		}]
	});
	$('editDerivedConceptDialog').show(); 
	

	i2b2.CRC.view.editDerivedConceptDialog.render(document.body);

	// manage the event handler for submit
	delete i2b2.CRC.view.editDerivedConceptDialog.submitterFunction;
	i2b2.CRC.view.editDerivedConceptDialog.submitterFunction = handleSubmit;
	// display the dialoge
	i2b2.CRC.view.editDerivedConceptDialog.center();
	i2b2.CRC.view.editDerivedConceptDialog.show();
}
// ================================================================================================= //

i2b2.ONT.view.mInfo.createDerivedConceptTemplate = async function(p_sType, p_aArgs, p_oValue) {
	var handleSubmit = function() {
		if(this.submit()) {
			let tempConceptPath = i2b2.CRC.view.displayTabs.formatPathWithSlash(document.getElementById('dcPath').value);
			let tempDerivedConceptPath = i2b2.CRC.view.displayTabs.modifyPathWithTitle(tempConceptPath, 'Derived');
			var payload = JSON.stringify({
				"path": tempDerivedConceptPath,
				"code": $('createDerivedConceptTempDialog').select('INPUT#dcCode')[0].value,
				"description": $('createDerivedConceptTempDialog').select('INPUT#dcDescription')[0].value,
				"type": 'NUMERIC',
				"queryTemplateName": $('createDerivedConceptTempDialog').select('#dcTemplate :selected')[0].value,
				"rawConceptPath": (p_oValue.origData.dim_code).replace(/\\/g, "\\\\"),
				"temporalConstraintConceptPath1": i2b2.ONT.view.mInfo.tempConstraintDiv1ConceptPath ? i2b2.ONT.view.mInfo.tempConstraintDiv1ConceptPath.replace(/\\/g, "\\\\") : null,
				"temporalConstraintConceptPath2": i2b2.ONT.view.mInfo.tempConstraintDiv2ConceptPath ? i2b2.ONT.view.mInfo.tempConstraintDiv2ConceptPath.replace(/\\/g, "\\\\") : null
			})

			let loginProjectName = i2b2.PM.model.login_project;
     		let getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
     		let sessionId = getSessionData["session_id"];
     		let username = getSessionData["user_name"];
 
     		let loginHeader = new Headers();
     		loginHeader.set('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
	 		loginHeader.append('X-Project-Name', loginProjectName)

			var requestOptions = {
				method: 'POST',
				headers: loginHeader,
				body: payload,
				credentials: 'include'
			};

			// fetch(VIEW_MINFO_BASE_URL + "/api/derived-concepts/", requestOptions)
			fetch(VIEW_MINFO_BASE_URL + "/cdi-api/derived-concepts", requestOptions)
				.then((response) => {
					return response.json();
				})
				.then((responseData) => {
					i2b2.ONT.view.mInfo.calculateFacts(responseData);
					i2b2.ONT.view.nav.doRefreshAll();
					return responseData;
				})
				.catch(error => {
					alert("Failed to create derived concept")
				});
		}
	}
	i2b2.ONT.view.mInfo.createDerivedConceptTempDialog(handleSubmit, p_oValue);
}

// Temporal Template
i2b2.ONT.view.mInfo.dCTempDialogActive = false;
i2b2.ONT.view.mInfo.rawDerivedConceptObj;

i2b2.ONT.view.mInfo.createDerivedConceptTempDialog = function(handleSubmit, p_oValue) {

	var handleCancel = function() {
		i2b2.ONT.view.mInfo.dCTempDialogActive = false;
		document.getElementById("temporalConstEvent").style.display = "none";
		i2b2.ONT.view.nav.doRefreshAll();
		this.cancel();
	};
	var handleUpdate = function() {
		i2b2.CRC.view.createDerivedConceptTempDialog.submitterFunction();
		i2b2.ONT.view.mInfo.dCTempDialogActive = false;
	};

	i2b2.CRC.view.createDerivedConceptTempDialog = new YAHOO.widget.SimpleDialog("createDerivedConceptTempDialog", {
		width: "400px",
		fixedcenter: true,
		constraintoviewport: false,
		close: false,
		zindex: 700,
		buttons: [{
			text: "Save",
			handler: handleUpdate,
			isDefault: true
		}, {
			text: "Cancel",
			handler: handleCancel
		}]
	});
	i2b2.ONT.view.mInfo.dCTempDialogActive = true;
	
	document.getElementById("tempConstraintDiv1").innerHTML = '';
	document.getElementById("tempConstraintDiv2").innerHTML = '';
	document.getElementById("temporalConstEvent").style.display = "none";
	
	$('createDerivedConceptTempDialog').show(); 
		
	i2b2.CRC.view.createDerivedConceptTempDialog.render(document.body);
	// manage the event handler for submit
	delete i2b2.CRC.view.createDerivedConceptTempDialog.submitterFunction;
	i2b2.CRC.view.createDerivedConceptTempDialog.submitterFunction = handleSubmit;
	// display the dialoge
	i2b2.CRC.view.createDerivedConceptTempDialog.center();
	i2b2.CRC.view.createDerivedConceptTempDialog.show();

	// Assign raw derived concept object for future need
	i2b2.ONT.view.mInfo.rawDerivedConceptObj = p_oValue.origData;

	let dcPath = origConceptPath(p_oValue.origData) + " - MIN";
	let dcCode = p_oValue.origData.basecode + "-MIN";
	let dcDesc = "The Minimum value of the " + p_oValue.origData.name;
	updateDerivedConceptInputFields(dcPath, dcCode, dcDesc);
}

i2b2.ONT.view.mInfo.createMLPredictionTemplate = async function(p_sType, p_aArgs, p_oValue) {
	var handleSubmit = function() {
		if(this.submit()) {
			let tempConceptPath = i2b2.CRC.view.displayTabs.formatPathWithSlash(document.getElementById('mlPredPath').value);
			let concept_code = $('createMLPredictionTempDialog').select('INPUT#mlPredCode')[0].value
			let description = $('createMLPredictionTempDialog').select('TEXTAREA#mlPredDescription')[0].value
			let time_buffer_value =  $('createMLPredictionTempDialog').select('INPUT#timerBuffer')[0].value
			let time_buffer_unit =  $('createMLPredictionTempDialog').select('#timeBufferUnit :selected')[0].value
			let time_buffer = calculateTimeBuffer(time_buffer_value, time_buffer_unit)

			var blob = {
				"concept_script": "demo",
				"positive_path": i2b2.ONT.view.mInfo.positiveConceptPath ? i2b2.ONT.view.mInfo.positiveConceptPath : null,
				"negative_path": i2b2.ONT.view.mInfo.negativeConceptPath ? i2b2.ONT.view.mInfo.negativeConceptPath : null,
				"given_path": i2b2.ONT.view.mInfo.givenConceptPath ? i2b2.ONT.view.mInfo.givenConceptPath : null,
				"time_buffer": time_buffer
			}

			var payload = JSON.stringify({
				"path": tempConceptPath,
				"definitionType": "Derived-ML",
				"blob" : blob,
				"description" : description,
				"code" : concept_code
			})

			console.log(payload)

			let loginProjectName = i2b2.PM.model.login_project;
     		let getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
     		let sessionId = getSessionData["session_id"];
     		let username = getSessionData["user_name"];
 
     		let loginHeader = new Headers();
     		loginHeader.set('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
	 		loginHeader.append('X-Project-Name', loginProjectName)

			var requestOptions = {
				method: 'POST',
				headers: loginHeader,
				body: payload,
				credentials: 'include'
			};

			// fetch(VIEW_MINFO_BASE_URL + "/api/derived-concepts/", requestOptions)
			fetch(VIEW_MINFO_BASE_URL + "/cdi-api/derived-concepts", requestOptions)
				.then((response) => {
					return response.json();
				})
				.then((responseData) => {
					// i2b2.ONT.view.mInfo.calculateFacts(responseData);
					i2b2.ONT.view.nav.doRefreshAll();
					return responseData;
				})
				.catch(error => {
					alert("Failed to create derived concept")
				});
		}
	}
	i2b2.ONT.view.mInfo.createMLPredictionTempDialog(handleSubmit, p_oValue);
}

function calculateTimeBuffer(time_buffer_value, time_buffer_unit) {
	if (time_buffer_unit == 'day') {
		return time_buffer_value * 24 * 60 * 60
	} else if (time_buffer_unit == 'week') {
		return time_buffer_value * 7 * 24 * 60 * 60
	} else if (time_buffer_unit == 'month') {
		return time_buffer_value * 30 * 24 * 60 * 60
	}
}

i2b2.ONT.view.mInfo.rawMLPredictionObj;

i2b2.ONT.view.mInfo.createMLPredictionTempDialog = function(handleSubmit, p_oValue) {

	i2b2.ONT.view.mInfo.positiveConceptPath = [];
	i2b2.ONT.view.mInfo.negativeConceptPath = [];
	i2b2.ONT.view.mInfo.givenConceptPath = [];

	var handleCancel = function() {
		i2b2.ONT.view.mInfo.dCTempDialogActive = false;
		// document.getElementById("temporalConstEvent").style.display = "none";
		i2b2.ONT.view.nav.doRefreshAll();
		this.cancel();
	};
	var handleUpdate = function() {
		i2b2.CRC.view.createMLPredictionTempDialog.submitterFunction();
		i2b2.ONT.view.mInfo.dCTempDialogActive = false;
	};

	i2b2.CRC.view.createMLPredictionTempDialog = new YAHOO.widget.SimpleDialog("createMLPredictionTempDialog", {
		width: "400px",
		fixedcenter: true,
		constraintoviewport: false,
		close: false,
		zindex: 700,
		buttons: [{
			text: "Save",
			handler: handleUpdate,
			isDefault: true
		}, {
			text: "Cancel",
			handler: handleCancel
		}]
	});
	i2b2.ONT.view.mInfo.dCTempDialogActive = true;
	
	// document.getElementById("tempConstraintDiv1").innerHTML = '';
	// document.getElementById("tempConstraintDiv2").innerHTML = '';
	document.getElementById("negativeConcept").innerHTML = '';
	document.getElementById("positiveConcept").innerHTML = '';
	document.getElementById("given").innerHTML = '';
	// document.getElementById("mlPredictionPrecedingEvent").innerHTML = '';
	document.getElementById("temporalConstEvent").style.display = "none";
	
	$('createMLPredictionTempDialog').show(); 
		
	i2b2.CRC.view.createMLPredictionTempDialog.render(document.body);
	// manage the event handler for submit
	delete i2b2.CRC.view.createMLPredictionTempDialog.submitterFunction;
	i2b2.CRC.view.createMLPredictionTempDialog.submitterFunction = handleSubmit;
	// display the dialoge
	i2b2.CRC.view.createMLPredictionTempDialog.center();
	i2b2.CRC.view.createMLPredictionTempDialog.show();

	// Assign raw derived concept object for future need
	i2b2.ONT.view.mInfo.rawMLPredictionObj = p_oValue.origData;

	let dcPath = origConceptPath(p_oValue.origData);
	let dcCode = p_oValue.origData.basecode
	updateMLPredictionInputFields(dcPath, dcCode);
}

function origConceptPath (origData) {
	const key = i2b2.CRC.view.displayTabs.modifyNodeKey(origData.key);
	const splitArr = key.split("\\");
	const filtered = splitArr.filter(function (el) {
  		return el !== null && el !== "";
	});

	const lastElement = filtered[filtered.length - 1];
	const dc_path = key + lastElement;
	return dc_path;
}

function modifyPath (path) {
	const tempConceptPath = path;
    
	const splitArr = tempConceptPath.split("\\");
	var filtered = splitArr.filter(function (el) {
  		return el !== null && el !== "";
	});
		
	const lastElement = filtered[filtered.length - 1];
	const searchString = lastElement.split('-')[0].trim();

	filtered.splice(filtered.length - 1, 1);
	const joinedArr = filtered.join("\\");

	let finalPath;
	if (joinedArr.includes(searchString)) {
    	filtered.splice(filtered.length - 1, 1);
	}
    let newArr = filtered.concat(lastElement);
	finalPath = "\\" + newArr.join("\\") + "\\";
	return finalPath;
}

function mlPredictionModifyPath (path) {
	const tempConceptPath = path;
    
	const splitArr = tempConceptPath.split("\\");
	var filtered = splitArr.filter(function (el) {
  		return el !== null && el !== "";
	});
		
	const lastElement = filtered[filtered.length - 1];
	const searchString = lastElement.split('-')[0].trim();

	filtered.splice(filtered.length - 1, 1);
	const joinedArr = filtered.join("\\");

	let finalPath;
	if (joinedArr.includes(searchString)) {
    	filtered.splice(filtered.length - 1, 1);
	}
    let newArr = filtered.concat(lastElement);
	finalPath = "\\ML-Prediction\\" + newArr.join("\\") + "\\";
	return finalPath;
}
// ================================================================================================= //

var updateDerivedConceptInputFields = function (path, code, description) {
	$('createDerivedConceptTempDialog').select('INPUT#dcPath')[0].value = modifyPath(path);
	$('createDerivedConceptTempDialog').select('INPUT#dcCode')[0].value = code;
	$('createDerivedConceptTempDialog').select('INPUT#dcDescription')[0].value = description;
}

var updateMLPredictionInputFields = function (path, code, description) {
	$('createMLPredictionTempDialog').select('INPUT#mlPredPath')[0].value = mlPredictionModifyPath(path);
	// $('createMLPredictionTempDialog').select('INPUT#dcCode')[0].value = code;

}

i2b2.ONT.view.mInfo.queryTemplateNameSelected = function(event) {
	let rawDCObj = i2b2.ONT.view.mInfo.rawDerivedConceptObj;
	let dcPath = origConceptPath(rawDCObj);
	let dcCode = rawDCObj.basecode;
	let dcDesc;

	switch(event.target.value) {
		case "MINIMUM":
			dcPath += " - MIN";
			dcCode += "-MIN";
			dcDesc = "The Minimum value of the " + rawDCObj.name;
			updateDerivedConceptInputFields(dcPath, dcCode, dcDesc);
			break;
		case "MAXIMUM":
			dcPath += " - MAX";
			dcCode += "-MAX";
			dcDesc = "The MAXIMUM value of the " + rawDCObj.name;
			updateDerivedConceptInputFields(dcPath, dcCode, dcDesc);
			break;
		case "AVERAGE":
			dcPath += " - AVERAGE";
			dcCode += "-AVERAGE";
			dcDesc = "The AVERAGE value of the " + rawDCObj.name;
			updateDerivedConceptInputFields(dcPath, dcCode, dcDesc);
			break;
		case "COUNT":
			dcPath += " - COUNT";
			dcCode += "-COUNT";
			dcDesc = "The total COUNT of the " + rawDCObj.name;
			updateDerivedConceptInputFields(dcPath, dcCode, dcDesc);
			break;
		case "SUM":
			dcPath += " - SUM";
			dcCode += "-SUM";
			dcDesc = "The total SUM of the " + rawDCObj.name;
			updateDerivedConceptInputFields(dcPath, dcCode, dcDesc);
			break;
		case "FIRST_OCCURRENCE":
			dcPath += " - FIRST";
			dcCode += "-FIRST";
			dcDesc = "First occurrence of the " + rawDCObj.name;
			updateDerivedConceptInputFields(dcPath, dcCode, dcDesc);
			break;
		case "LAST_OCCURRENCE":
			dcPath += " - LAST";
			dcCode += "-LAST";
			dcDesc = "Last occurrence of the " + rawDCObj.name;
			updateDerivedConceptInputFields(dcPath, dcCode, dcDesc);
			break;
		case "STANDARD_DEVIATION":
			dcPath += " - STANDARD_DEVIATION";
			dcCode += "-STANDARD_DEVIATION";
			dcDesc = "The STANDARD_DEVIATION value of the " + rawDCObj.name;
			updateDerivedConceptInputFields(dcPath, dcCode, dcDesc);
			break;
	  }
}

i2b2.ONT.view.mInfo.temporalConstSelected = function(event) {
	if(event.target.checked) {
		document.getElementById("temporalConstEvent").style.display = "block";
	} else {
		document.getElementById("temporalConstEvent").style.display = "none";
	} 
}

i2b2.ONT.view.mInfo.dropEventConstraint1 = function (ev) {
	ev.preventDefault();

	const oldNode = document.getElementById("tempConstraintDiv1");
	oldNode.innerHTML = '';

	var data = ev.dataTransfer.getData("constraint");
	const conceptDetailObj = JSON.parse(decodeURI(data));
	var node = document.createElement("img")
	node.setAttribute("src", "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch.gif");
	node.setAttribute("class", "defaultIcon");
	
	var textnode = document.createTextNode(conceptDetailObj.conceptName);
	i2b2.ONT.view.mInfo.tempConstraintDiv1ConceptPath = filterTempConceptPath(conceptDetailObj.conceptPath);

	ev.target.appendChild(node);
	ev.target.appendChild(textnode);
}

var filterTempConceptPath = function (rawConceptPath) {
	if (rawConceptPath !== null && rawConceptPath !== undefined) {
		let firstLevelFilter = rawConceptPath.split(/\\\\(.+)/)[1];
		var conceptPath = "\\".concat(firstLevelFilter.split(/\\(.+)/)[1]);
		return conceptPath;
	} else {
		return null;
	}
};

i2b2.ONT.view.mInfo.allowDropEventConstraint1 = function allowDropEvent1(ev) {
	ev.preventDefault();
}

i2b2.ONT.view.mInfo.dropEventConstraint2 = function (ev) {
	ev.preventDefault();

	const oldNode = document.getElementById("tempConstraintDiv2");
	oldNode.innerHTML = '';

	var data = ev.dataTransfer.getData("constraint");
	const conceptDetailObj = JSON.parse(decodeURI(data));
	var node = document.createElement("img")
	node.setAttribute("src", "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch.gif");
	node.setAttribute("class", "defaultIcon");
	
	var textnode = document.createTextNode(conceptDetailObj.conceptName);
	i2b2.ONT.view.mInfo.tempConstraintDiv2ConceptPath = filterTempConceptPath(conceptDetailObj.conceptPath);

	ev.target.appendChild(node);
	ev.target.appendChild(textnode);
}

i2b2.ONT.view.mInfo.allowDropEventConstraint2 = function allowDropEvent1(ev) {
	ev.preventDefault();
}

i2b2.ONT.view.mInfo.allowDropEventNegativeConcept = function allowDropEvent1(ev) {
	ev.preventDefault();
}

i2b2.ONT.view.mInfo.allowDropEventGiven = function allowDropEvent1(ev) {
	ev.preventDefault();
}

i2b2.ONT.view.mInfo.allowDropEventPositiveConcept = function allowDropEvent1(ev) {
	ev.preventDefault();
}

i2b2.ONT.view.mInfo.allowDropMLPredictionEvent = function allowDropEvent1(ev) {
	ev.preventDefault();
}

i2b2.ONT.view.mInfo.positiveConceptPath = [];
i2b2.ONT.view.mInfo.negativeConceptPath = [];
i2b2.ONT.view.mInfo.givenConceptPath = [];

i2b2.ONT.view.mInfo.dropEventNegativeConcept = function (ev) {
	ev.preventDefault();

	// const oldNode = document.getElementById("negativeConcept");
	// oldNode.innerHTML = '';

	var data = ev.dataTransfer.getData("constraint");
	const conceptDetailObj = JSON.parse(decodeURI(data));
	var node = document.createElement("img")
	node.setAttribute("src", "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch.gif");
	node.setAttribute("class", "defaultIcon");
	
	var textnode = document.createTextNode(conceptDetailObj.conceptName);
	i2b2.ONT.view.mInfo.negativeConceptPath.push(filterTempConceptPath(conceptDetailObj.conceptPath).replace(/\\/g, "\\\\"));

	ev.target.appendChild(node);
	ev.target.appendChild(textnode);
}

i2b2.ONT.view.mInfo.dropEventPositiveConcept = function (ev) {
	ev.preventDefault();

	// const oldNode = document.getElementById("positiveConcept");
	// oldNode.innerHTML = '';

	var data = ev.dataTransfer.getData("constraint");
	const conceptDetailObj = JSON.parse(decodeURI(data));
	var node = document.createElement("img")
	node.setAttribute("src", "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch.gif");
	node.setAttribute("class", "defaultIcon");
	
	var textnode = document.createTextNode(conceptDetailObj.conceptName);
	i2b2.ONT.view.mInfo.positiveConceptPath.push(filterTempConceptPath(conceptDetailObj.conceptPath).replace(/\\/g, "\\\\"));

	ev.target.appendChild(node);
	ev.target.appendChild(textnode);
}

i2b2.ONT.view.mInfo.dropEventGiven = function (ev) {
	ev.preventDefault();

	// const oldNode = document.getElementById("given");
	// oldNode.innerHTML = '';

	var data = ev.dataTransfer.getData("constraint");
	const conceptDetailObj = JSON.parse(decodeURI(data));
	var node = document.createElement("img")
	node.setAttribute("src", "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch.gif");
	node.setAttribute("class", "defaultIcon");
	
	var textnode = document.createTextNode(conceptDetailObj.conceptName);
	i2b2.ONT.view.mInfo.givenConceptPath.push(filterTempConceptPath(conceptDetailObj.conceptPath).replace(/\\/g, "\\\\"));

	ev.target.appendChild(node);
	ev.target.appendChild(textnode);
}

i2b2.ONT.view.mInfo.dropEventProcedingMLPrediction = function (ev) {
	ev.preventDefault();

	const oldNode = document.getElementById("mlPredictionPrecedingEvent");
	oldNode.innerHTML = '';

	var data = ev.dataTransfer.getData("constraint");
	const conceptDetailObj = JSON.parse(decodeURI(data));
	var node = document.createElement("img")
	node.setAttribute("src", "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch.gif");
	node.setAttribute("class", "defaultIcon");
	
	var textnode = document.createTextNode(conceptDetailObj.conceptName);
	i2b2.ONT.view.mInfo.tempConstraintDiv1ConceptPath = filterTempConceptPath(conceptDetailObj.conceptPath);

	ev.target.appendChild(node);
	ev.target.appendChild(textnode);
}

// ================================================================================================= //

i2b2.ONT.view.mInfo.deleteDerivedConcept = async function(p_sType, p_aArgs, p_oValue) {
	document.getElementById('overlay').style.display = 'block';

	var requestOptions = {
		method: 'GET',
		headers: getAPIFetchHeader(),
		credentials: 'include'
	};
	
	try {
		const response = await fetch(VIEW_MINFO_BASE_URL + "/api/derived-concepts", requestOptions);
		const responseData = await response.json();
			var filtered = [];
			for (var i = 0; i < responseData.length; i++) {
				if (responseData[i].path == p_oValue.origData.dim_code) {
					filtered.push(responseData[i]);
				}
			}

			if (filtered.length > 0) {
				document.getElementById('overlay').style.display = 'none';
				i2b2.ONT.view.mInfo.deleteDerivedConceptForm(filtered);
			} else {
				document.getElementById('overlay').style.display = 'none';
			}
	}
	catch (error) {
		document.getElementById('overlay').style.display = 'none';
		return console.warn(error);
	}
}
// ================================================================================================= //
i2b2.ONT.view.mInfo.deleteDerivedConceptForm = function(filteredData) {
	var handleSubmit = function() {
		if(this.submit()) {
			var requestOptions = {
				method: 'DELETE',
				headers: getAPIFetchHeader(),
				credentials: 'include'
			};

			fetch(VIEW_MINFO_BASE_URL + "/api/derived-concepts/" + filteredData[0].id, requestOptions)
				.then((response) => {
					return response.json();
				})
				.then((responseData) => {
					i2b2.ONT.view.nav.doRefreshAll();
					return responseData;
				})
				.catch(error => console.warn(error));
		}
	}
	i2b2.ONT.view.mInfo.deleteDerivedConceptDialog(handleSubmit);
}
// ================================================================================================= //
i2b2.ONT.view.mInfo.deleteDerivedConceptDialog = function(handleSubmit) {
	var handleCancel = function() {
		this.cancel();
	};
	var handleDelete = function() {
		i2b2.CRC.view.deleteDerivedConceptDialog.submitterFunction();
	};

	i2b2.CRC.view.deleteDerivedConceptDialog = new YAHOO.widget.SimpleDialog("deleteDerivedConceptDialog", {
		width: "500px",
		fixedcenter: true,
		constraintoviewport: true,
		modal: true,
		zindex: 700,
		buttons: [{
			text: "Yes",
			handler: handleDelete,
			isDefault: true
		}, {
			text: "Cancel",
			handler: handleCancel
		}]
	});
	$('deleteDerivedConceptDialog').show(); 
	

	i2b2.CRC.view.deleteDerivedConceptDialog.render(document.body);

	// manage the event handler for submit
	delete i2b2.CRC.view.deleteDerivedConceptDialog.submitterFunction;
	i2b2.CRC.view.deleteDerivedConceptDialog.submitterFunction = handleSubmit;
	// display the dialoge
	i2b2.CRC.view.deleteDerivedConceptDialog.center();
	i2b2.CRC.view.deleteDerivedConceptDialog.show();
}

console.timeEnd('execute time');
console.groupEnd();
