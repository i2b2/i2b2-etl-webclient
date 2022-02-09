/**
 * @projectDescription	Ontology Concept SDX data controller object.
 * @inherits 	i2b2.sdx.TypeControllers
 * @namespace	i2b2.sdx.TypeControllers.MConcept
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */

 console.group('Load & Execute component file: ONT > SDX > MConcept');
 console.time('execute time');
 
 i2b2.sdx.TypeControllers.MConcept = {};

 // CONCEPT CODE ADDED
 const CONCEPT_BASE_URL = window.location.origin;
 
 window.totalDerivedData;
 i2b2.sdx.TypeControllers.MConcept.errorStatusCode;
 
i2b2.events.afterCellInit.subscribe(
	(function() {
		let roles = i2b2.PM.model.userRoles;
		if(roles.includes('POPULATION_FACT_VIEWER')){
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
	
			

			// fetch(CONCEPT_BASE_URL + "/api/derived-concepts", requestOptions)
			fetch(CONCEPT_BASE_URL + "/cdi-api/derived-concepts", requestOptions)
				.then((response) => {
					i2b2.sdx.TypeControllers.MConcept.errorStatusCode = response.status;
					if (!response.ok) {
						throw new Error('Network response was not ok');
					} 
					else if (response.status === 200) {
					   return response.json();
					}  
				})
				.then((responseData) => {
					window.totalDerivedData = responseData;
				})
				.catch(error => console.warn(error));
		}
	})
);
 
 i2b2.sdx.TypeControllers.MConcept.derivedIcon_RenderHTML = function(sdxData) {
	if (window.mainNodeDerivedData !== undefined) {
		window.mainNodeDerivedData.forEach(el => {
			if (el.path === sdxData.origData.dim_code) {
				sdxData.origData.isDerived = true;
			}
			if (el.concept_path === sdxData.origData.dim_code) {
				sdxData.origData.isDerived = true;
				sdxData.origData.status = el.status;
			}
		})
	}
 }
 
 i2b2.sdx.TypeControllers.MConcept.runCode = function(sdxData, renderData) {
	 if (sdxData.origData.isDerived === true)
	 {
		 var element = document.getElementById(renderData.htmlID);
		 if (element !== null) {
			 element.classList.add('derived_lock_icon');
		 }
	 }
 }
 
 i2b2.sdx.TypeControllers.MConcept.AppendTreeNode = function(tmpNode) {
	if(window.totalDerivedData) {
		var derivedListData = window.totalDerivedData;
		for (var i = 0; i<derivedListData.length; i++) {
			if (derivedListData[i].path === tmpNode.data.i2b2_SDX.origData.dim_code) {
				var element = document.getElementById(tmpNode.data.i2b2_SDX.renderData.htmlID);
				if (element !== null) {
					element.classList.add('derived_lock_icon');
				}
			}
		}
	} else if (tmpNode.data.i2b2_SDX.origData.isDerived === true) {
		var element = document.getElementById(tmpNode.data.i2b2_SDX.renderData.htmlID);
		if (element !== null) {
			element.classList.add('derived_lock_icon');
		}
	}
}
 
 i2b2.sdx.TypeControllers.MConcept.LoadConcepts = function(sdxDataNode) {
	if (window.mainNodeDerivedData !== undefined && window.mainNodeDerivedData !== []) {
		window.mainNodeDerivedData.forEach(el => {
			if (el.path === sdxDataNode.origData.dim_code) {
				sdxDataNode.origData.isDerived = true;
			}
		})
	}
 }
 
 i2b2.sdx.TypeControllers.MConcept.LoadConcepts_addDerivedIcon = function(sdxDataNode, sdxRenderData) {
	 if (sdxDataNode.origData.isDerived === true) {
		 var element = document.getElementById(sdxRenderData.renderData.htmlID);
		 if (element !== null) {
			 element.classList.add('derived_lock_icon');
		 }
	 }
 }
 
 i2b2.sdx.TypeControllers.MConcept.MakeObject = function(o) {
	i2b2.sdx.TypeControllers.MConcept.loadChildData(o);
 }
 
 i2b2.sdx.TypeControllers.MConcept.loadChildData = function(modelData) {
	 window.totalDerivedData.forEach(el => {
		 if (el.concept_path.startsWith(modelData.dim_code)) {
			 modelData.isDerived = true;
			 modelData.derivedId = el.id;
			 modelData.derivedCode = el.concept_cd;
			 modelData.status = el.status;
		 }
		 
		 return modelData;
	 })
 }
 
 i2b2.sdx.TypeControllers.MConcept.handleOnDragTempConstraint = function(e, sdxData) {
	 e.dataTransfer.effectAllowed = "move";
	 e.dataTransfer.setData("constraint", sdxData);
 };
 
 console.timeEnd('execute time');
 console.groupEnd();
 