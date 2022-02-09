/**
 * @projectDescription	View controller for the Find viewport. (CRC's "previous queries" window)
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.MComputeFact
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
 console.group('Load & Execute component file: CRC > view > MComputeFact');
 console.time('execute time');
  
 // create and save the screen objects
 i2b2.CRC.view.mCompute = new i2b2Base_cellViewController(i2b2.CRC, 'mCompute');
 const M_COMPUTE_FACT_BASE_URL = window.location.origin;
 i2b2.CRC.view.mCompute.visible = false;

 i2b2.CRC.view.mCompute.computeDerivedFact = function() {
    i2b2.CRC.view.LoadingMask.show("Calling Computation Facts...");
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

	// fetch(M_COMPUTE_FACT_BASE_URL + "/api/derived-concepts/calculate-facts", requestOptions)
	fetch(M_COMPUTE_FACT_BASE_URL + "/cdi-api/compute-facts", requestOptions)
		.then((response) => {
			i2b2.CRC.view.LoadingMask.hide();
			alert("Computation has started.")
			return response.json();
		})
		.then((responseData) => {
			return responseData;
		})
		.catch(error => {
			i2b2.CRC.view.LoadingMask.hide();
			console.warn(error)
			// alert("Failed to Compute derived fact! \n Try Again...."+ error)
		});
}

i2b2.CRC.view.mCompute.fetchConceptStatus = async function() {
    // i2b2.CRC.view.LoadingMask.show("Fetching All Job Status Data...");
	 let loginProjectName = i2b2.PM.model.login_project;
     let getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
     let sessionId = getSessionData["session_id"];
     let username = getSessionData["user_name"];
 
     let loginHeaders = new Headers();
     loginHeaders.set('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
	 loginHeaders.set('Cache-Control','no-cache');
	 loginHeaders.append('X-Project-Name', loginProjectName);

	try {
		const response  = await fetch(API_BASE_URL+'/cdi-api/allDerivedJobsStatus', {
			method: 'GET',
			headers: loginHeaders
		});
		const responseData = await response.json();
		createFetchConceptStatusTempDialog(responseData)
		return responseData;
	}
	catch (error) {
		clearTimeout(timer);
		return console.warn(error);
	}
}

createFetchConceptStatusTempDialog = function(response) {

	var handleCancel = function() {
		this.cancel();
	};

	i2b2.CRC.view.createFetchConceptStatusTempDialog = new YAHOO.widget.SimpleDialog("createFetchConceptStatusTempDialog", {
		width: "400px",
		fixedcenter: true,
		constraintoviewport: false,
		close: false,
		zindex: 700,
		buttons: [{
			text: "Cancel",
			handler: handleCancel
		}]
	});
	
	$('createFetchConceptStatusTempDialog').show(); 
		
	i2b2.CRC.view.createFetchConceptStatusTempDialog.render(document.body);
	i2b2.CRC.view.createFetchConceptStatusTempDialog.center();
	i2b2.CRC.view.createFetchConceptStatusTempDialog.show();

	document.getElementById("derivedAllJobs").innerHTML = "<table id='jobStatusTable' style='margin-left: auto;margin-right: auto;width: 100%'>" +
		'<tr>' +
			'<th></th>' +
			'<th>Pending</th>' +
			'<th>Error</th> ' +
			'<th>Processing</th>' +
			'<th>Completed</th>' +
		'</tr>' +
		'<tr>' +
			'<td>Derived</td>' +
			'<td>' + response["resp"]["DERIVED"]["pending"] + '</td>' +
			'<td>' + response["resp"]["DERIVED"]["error"] + '</td>' +
			'<td>' + response["resp"]["DERIVED"]["processing"] + '</td>' +
			'<td>' + response["resp"]["DERIVED"]["completed"] + '</td>' +
		'</tr>' + 
		'<tr>' +
			'<td>Derived-ML</td>' +
			'<td>' + response["resp"]["DERIVED-ML"]["pending"] + '</td>' +
			'<td>' + response["resp"]["DERIVED-ML"]["error"] + '</td>' +
			'<td>' + response["resp"]["DERIVED-ML"]["processing"] + '</td>' +
			'<td>' + response["resp"]["DERIVED-ML"]["completed"] + '</td>' +
		'</tr>' + 
		'<tr>' +
			'<td>Tabulation</td>' +
			'<td>' + response["resp"]["TABULATION"]["pending"] + '</td>' +
			'<td>' + response["resp"]["TABULATION"]["error"] + '</td>' +
			'<td>' + response["resp"]["TABULATION"]["processing"] + '</td>' +
			'<td>' + response["resp"]["TABULATION"]["completed"] + '</td>' +
		'</tr>' + 
	'</table>'
}
 
//================================================================================================== //
i2b2.events.initView.subscribe((function(eventTypeName, newMode) {
// -------------------------------------------------------
    this.visible = true;
// -------------------------------------------------------
}),'',i2b2.CRC.view.mCompute);
    
console.timeEnd('execute time');
console.groupEnd();
