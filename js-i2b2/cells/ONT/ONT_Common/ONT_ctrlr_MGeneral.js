/**
 * @projectDescription	Event controller for general ONT functionality.
 * @inherits 	i2b2.ONT.ctrlr
 * @namespace	i2b2.ONT.ctrlr.MGeneral
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
 console.group('Load & Execute component file: ONT > ctrlr > MGeneral');
 console.time('execute time');

i2b2.ONT.ctrlr.MGen = new Object;

const GENERAL_BASE_URL = window.location.origin;
window.mainNodeDerivedData;

i2b2.ONT.ctrlr.MGen.getDerivedConcept = function(modelCategories) {
	let loginProjectName = i2b2.PM.model.login_project;
    let getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
    let sessionId = getSessionData["session_id"];
    let username = getSessionData["user_name"];
 
    let loginHeader = new Headers();
    loginHeader.set('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
	loginHeader.append('X-Project-Name', loginProjectName)

	var requestOptions = {
		method: 'GET',
		headers: loginHeader,
		credentials: 'include'
	};

	// fetch(GENERAL_BASE_URL + "/api/derived-concepts", requestOptions)
	fetch(GENERAL_BASE_URL + "/cdi-api/derived-concepts", requestOptions)
		.then((response) => {
			return response.json();
		})
		.then((responseData) => {
			window.mainNodeDerivedData = responseData;
			i2b2.ONT.ctrlr.MGen.loadData(responseData, modelCategories);
		})
		.catch(error => console.warn(error));
}

i2b2.ONT.ctrlr.MGen.loadData = function(data, modelData) {
	data.forEach(el => {
		modelData.forEach(el1 => {
			if (el.concept_path.startsWith(el1.dim_code)) {
				el1.isDerived = true;
				// el1.derivedId = el.id;
				el1.derivedCode = el.concept_cd;

				var name = el1.tooltip;
				var imageNode = document.querySelector("[title=" + CSS.escape(name) + "]");
				imageNode.classList.add('derived_lock_icon');
			}
		})
	})
}


console.timeEnd('execute time');
console.groupEnd();