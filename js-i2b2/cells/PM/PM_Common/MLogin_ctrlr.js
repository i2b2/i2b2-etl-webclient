/**
 * @projectDescription	View controller for the Login
 * @inherits 	i2b2
 * @namespace	i2b2.PM
 * @version 	1.5
 * ----------------------------------------------------------------------------------------
 * updated 9-15-09: Refactor loading process to allow CELL loading timeouts and failures [Nick Benik] 
 * updated 11-9-09: Changes to announcement dialog functionality [Charles McGow]
 * updated 11-23-09: Bug Fix for Firefox's 4k XML node text limit [Nick Benik]
 */

console.group('Load & Execute component file: cells > PM > MLogin > ctrlr');
console.time('execute time');

i2b2.PM.view.mLog = new i2b2Base_cellViewController(i2b2.PM, 'mLog');
const LOGIN_BASE_URL = window.location.origin;

i2b2.PM.view.mLog.setLoginCredentials = function(sessionId, loginUsername, projectId) {
    var loginDetails = JSON.stringify({
        'session_id': sessionId,
        'user_name': loginUsername + "\\" + projectId
    });
    sessionStorage.setItem('loginCredentials', loginDetails); 
}

// var getEtlDropdownList = async function() {
// 	var getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
// 	var sessionId = getSessionData["session_id"];
// 	var username = getSessionData["user_name"];

// 	var loginHeaders = new Headers();
// 	loginHeaders.set('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
// 	loginHeaders.set('Cache-Control','no-cache');

// 	let response  = await fetch(LOGIN_BASE_URL+'/cdi-api/get-file-list', {
// 		method: 'GET',
// 		headers: loginHeaders
// 	});
// 	if (response.ok) {
// 		let getList = await response.json();
// 		etlSelectDropdownList(getList);
// 	} else {
// 		let errJson = await response.json();
// 		alert(errJson);
// 	}
// }

// var etlSelectDropdownList = function(list) {
// 	var selectDiv = document.getElementById('selectList');
// 	selectDiv.innerHTML = '';
// 	var html = '<option value="" selected="true" disabled="disabled">-- Select CSV --</option>';
// 	for (let i=0; i<list.length; i++) {
// 		html += "<option value='" + list[i] + "'>" + (list[i]).trim() + "</option>";
// 	}
// 	selectDiv.innerHTML += html; 
// }

// var download = async function(url, filename) {
// 	var getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
// 	var sessionId = getSessionData["session_id"];
// 	var username = getSessionData["user_name"];

// 	var loginHeaders = new Headers();
// 	loginHeaders.set('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
// 	loginHeaders.set('Cache-Control','no-cache');

// 	let response = await fetch(url, {
// 		method: 'GET',
// 		headers: loginHeaders
// 	});
// 	if (response.ok) {
// 		return response.blob().then((b)=>{
// 			var a = document.createElement("a");
// 			a.href = URL.createObjectURL(b);
// 			a.setAttribute("download", filename);
// 			a.click();
// 		});
// 	} else {
// 		let errJson = await response.json();
// 		alert(errJson);
// 	}
// }

// var changeDropdown = function(obj) {
// 	var selectedValue = (obj.value);

// 	download(LOGIN_BASE_URL+`/cdi-api/get-file?FileName=${selectedValue}`, selectedValue);
// }

i2b2.PM.view.mLog.logout = function() {
	sessionStorage.removeItem("loginCredentials");
	var logoutHeader = new Headers();

	var logoutOptions = {
        method: 'POST',
        headers: logoutHeader,
        redirect: 'follow'
	};

	fetch(LOGIN_BASE_URL + "/logout", logoutOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

i2b2.PM.view.mLog.getUserInfo = function() {
	var getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
	var sessionId = getSessionData["session_id"];
	var username = getSessionData["user_name"];

	var loginHeader = new Headers();
	loginHeader.set('Cache-Control','no-cache');

	var formdata = new FormData();
	formdata.append("username", username);
	formdata.append("password", sessionId);

	var requestOptions = {
        method: 'POST',
        headers: loginHeader,
        body: formdata,
        redirect: 'follow',
        credentials: 'include'
	};

	// fetch(LOGIN_BASE_URL + "/login", requestOptions)
    //     .then(response => response.text())
    //     .then(result => {
	// 		if(i2b2.PM.model.userRoles.includes('POPULATION_FACT_VIEWER')){
	// 			i2b2.sdx.TypeControllers.MConcept.conceptLoadDerived();
	// 		}
        // })
        // .catch(error => console.log('error', error));
}

function getAPIFetchHeader() {
	let setProjectId = i2b2.PM.model.login_project;
	let login_project = "";
	if (setProjectId !== 'Demo') {
		login_project =  setProjectId;
	}

	return {
		'Content-Type': 'application/json',
		'Sec-Fetch-Site': 'same-origin',
		'X-Project-Name': login_project
	}
}

function getnewAPIFetchHeader() {
	let loginProjectName = i2b2.PM.model.login_project;
     let getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
     let sessionId = getSessionData["session_id"];
     let username = getSessionData["user_name"];
 
     let loginHeader = new Headers();
     loginHeader.set('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
	 loginHeader.append('X-Project-Name', loginProjectName)

	return loginHeader
}

async function fetchGet (url, extraHeaders = {}){
	try {
		let customHeaders={
			method:'GET',		
			credentials: 'include',
			headers: getnewAPIFetchHeader(),
		} 
		const response = await fetch(url, {
		...customHeaders,
		...extraHeaders,
		}).catch((err) => {
			// log error here..
			throw err;
		});
		if (response) {
			if (response.ok) {
			// if HTTP-status is 200-299
			return response;
			}
			let err=await response.json()
			throw { ...new Error(), ...err };
		} else {
			throw new Error(`Something went wrong while fetching API: ${url}`);
		}
	} catch (e) {
			// log error here..
			if(e?.error)
				alert(e.error)
			else
				alert('Network response was not ok.')
			throw e;
	}
}

async function fetchPost (url, body={}, extraHeaders = {}){
	try {
		let customHeaders={
			method:'POST',		
			credentials: 'include',
			headers: getnewAPIFetchHeader(),
		} 
		const response = await fetch(url,  {
			body:JSON.stringify(body),
			...customHeaders,
			...extraHeaders,
		
		}).catch((err) => {	
			// log error here..
			throw err;
		});
		if (response) {
			if (response.ok || response.status==405) {
			// if HTTP-status is 200-299
			return response;
			}
			let err=await response.json()
			throw { ...new Error(), ...err };
		} else {
			throw new Error(`Something went wrong while fetching API: ${url}`);
		}
		} catch (e) {
			// log error here..
			if(e?.error)
				alert(e.error)
			else
				alert('Network response was not ok.')
		}
}

async function fetchPut (url, body={}, extraHeaders = {}){
	try {
		let customHeaders={
			method:'PUT',		
			credentials: 'include',
			headers: getnewAPIFetchHeader(),
		} 
		const response = await fetch(url,  {
			body:JSON.stringify(body),
			...customHeaders,
			...extraHeaders,
		
		}).catch((err) => {	
			// log error here..
			throw err;
		});
		if (response) {
			if (response.ok) {
			// if HTTP-status is 200-299
			return response;
			}
			let err=await response.json()
			throw { ...new Error(), ...err };
		} else {
			throw new Error(`Something went wrong while fetching API: ${url}`);
		}
		} catch (e) {
			// log error here..
			if(e?.error)
				alert(e.error)
			else
				alert('Network response was not ok.')
			throw e;
		}
}

async function fetchDelete (url, body={}, extraHeaders = {}){
	try {
		let customHeaders={
			method:'DELETE',		
			credentials: 'include',
			headers: getnewAPIFetchHeader(),
		} 
		const response = await fetch(url,  {
			body:JSON.stringify(body),
			...customHeaders,
			...extraHeaders,
		
		}).catch((err) => {	
			// log error here..
			throw err;
		});
		if (response) {
			if (response.ok) {
			// if HTTP-status is 200-299
			return response;
			}
			let err=await response.json()
			throw { ...new Error(), ...err };
		} else {
			throw new Error(`Something went wrong while fetching API: ${url}`);
		}
		} catch (e) {
			// log error here..
			if(e?.error)
				alert(e.error)
			else
				alert('Network response was not ok.')
			throw e;
		}
}

i2b2.PM.view.mLog.showTabsBasedOnRoles = function(rolesArray) {
	document.getElementById('etl-delete-btn').disabled = true;
	document.getElementById('etl-undo-btn').disabled = true;
	if(!(rolesArray.includes('DATA_AUTHOR')) && rolesArray.includes('POPULATION_FACT_VIEWER')){
		document.getElementById("createDerivedConceptBox").classList.add("hide_tabs");
		document.getElementById("createPatientSetBox").classList.add("hide_tabs");
		document.getElementById("computeDerivedFactBox").classList.add("hide_tabs");
		document.getElementById("tabEtl").classList.add("hide_tabs");
		document.getElementById("tabFacts").classList.add("hide_tabs");
		document.getElementById("tabFactsAll").classList.add("hide_tabs");
		document.getElementById("tabSankey").classList.remove("hide_tabs");
		document.getElementById("tabTabulation").classList.remove("hide_tabs");
		document.getElementById("tabPatientTabulation").classList.remove("hide_tabs");
		document.getElementById("tabD3").classList.remove("hide_tabs");
		
		if (env.sankey === true) {
			document.getElementById("sankeyName").disabled = true;
			document.getElementById("sankeyConceptPath").disabled = true;
			document.getElementById("sankeyConceptCode").disabled = true;
			document.getElementById("compute-btn").classList.add("disabled-btn");
			document.getElementById("update-btn").classList.add("disabled-btn");
			document.getElementById("reset-btn").classList.add("disabled-btn");
		}

		if (env.tabulation === true) {
			document.getElementById("conceptPath").disabled = true;
			document.getElementById("conceptCode").disabled = true;
			document.getElementById("save").disabled = true;
			document.getElementById("compute").disabled = true;
			document.getElementById("reset").disabled = true;	
		}	

		if (env.d3 === true) {
			document.getElementById("d_Name").disabled = true;
			document.getElementById("d_ConceptPath").disabled = true;
			document.getElementById("d_ConceptCode").disabled = true;
			document.getElementById("d-save-btn").classList.add("disabled-btn");
			document.getElementById("d-reset-btn").classList.add("disabled-btn");
			// document.getElementById("d-update-btn").classList.add("disabled-btn");
		}
	} else if(!(rolesArray.includes('DATA_AUTHOR')) && !(rolesArray.includes('POPULATION_FACT_VIEWER'))) {
		
		document.getElementById("createDerivedConceptBox").classList.add("hide_tabs");
		document.getElementById("createPatientSetBox").classList.add("hide_tabs");
		document.getElementById("computeDerivedFactBox").classList.add("hide_tabs");
		document.getElementById("tabEtl").classList.add("hide_tabs");
		document.getElementById("tabFacts").classList.add("hide_tabs");
		document.getElementById("tabFactsAll").classList.add("hide_tabs");
		document.getElementById("tabSankey").classList.add("hide_tabs");
		document.getElementById("tabTabulation").classList.add("hide_tabs");
		document.getElementById("tabPatientTabulation").classList.add("hide_tabs");
		document.getElementById("tabD3").classList.add("hide_tabs");
	}
}

i2b2.PM.view.mLog.commonCode = function(setSession, login_username, ProjId) {
	i2b2.PM.view.mLog.setLoginCredentials(setSession, login_username, ProjId);
	i2b2.PM.view.mLog.getUserInfo();
	// getEtlDropdownList();
}

function hasClass(element, cls) {
	return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}


i2b2.events.initView.subscribe((function(eventTypeName, newMode) {
    newMode = newMode[0];
    this.viewMode = newMode;
}),'',i2b2.PM.view.mLog);

console.timeEnd('execute time');
console.groupEnd();
