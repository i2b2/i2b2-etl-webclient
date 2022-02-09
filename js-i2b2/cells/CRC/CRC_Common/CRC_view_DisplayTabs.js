/**
 * @projectDescription	View controller for the Find viewport. (CRC's "previous queries" window)
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.DisplayTabs
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: CRC > view > DisplayTabs');
console.time('execute time');
 
// create and save the screen objects
i2b2.CRC.view.displayTabs = new i2b2Base_cellViewController(i2b2.CRC, 'displayTabs');
i2b2.CRC.view.displayTabs.visible = false;

i2b2.CRC.view.displayTabs.modifyNodeKey = function(key) {
	let keyStr = decodeURI(key).replace(/^\\+/g, '').replace(/\\$/, '').replace(/\//g, '\\');
	let keySplit = keyStr.split("\\");
	let removefirstKey = keySplit.slice(1);
	let keyJoin = "\\" + removefirstKey.join("\\") + "\\";
	return keyJoin;
}
 
i2b2.CRC.view.displayTabs.formatPathWithSlash = function(conceptPath) {
	if(conceptPath!==null && conceptPath !== '' && conceptPath !== undefined) {
		let rawPath = conceptPath.replaceAll('/','\\');
		rawPath = rawPath.startsWith('\\') ? rawPath : '\\' + rawPath;
		conceptPath = rawPath.endsWith('\\') ? rawPath : rawPath + '\\';
	}
	return conceptPath;
}

i2b2.CRC.view.displayTabs.modifyPathWithTitle = function(path, title) {
	const splitConceptPath = path.split('\\');
    const uppercased = splitConceptPath.map( a => a.charAt(0).toUpperCase() + a.substr(1) );
    const firstValue = uppercased[1];
    const joinedValue = uppercased.join('\\');

    let modifiedPath;
    if (firstValue === title) {
        modifiedPath = joinedValue;
    } else if (firstValue !== title) {
        modifiedPath = '\\' + title + joinedValue;
    }
	return modifiedPath;
}


i2b2.CRC.view.displayTabs.modifyPathWithTitleTabulation = function(path, title, conceptCode) {
	const splitConceptPath = path.split('\\');
    const givenPath = splitConceptPath.map( a => a.charAt(0).toLowerCase() + a.substr(1) );

	// Let's add the conceptCode at last by deleting letest last path code
	var lastValue = givenPath[givenPath.length - 2]

	if (lastValue !== conceptCode) {
		givenPath.splice(givenPath.length - 2, 1);
		givenPath[givenPath.length - 1] = conceptCode
		givenPath[givenPath.length] = ""
	}
	const firstValue = givenPath[1].charAt(0).toUpperCase() + givenPath[1].substr(1);
    
    let modifiedPath;
    if (firstValue === title) {
		givenPath[1] = givenPath[1].charAt(0).toUpperCase() + givenPath[1].substr(1);
    	const joinedValue = givenPath.join('\\');
        modifiedPath = joinedValue;
    } else if (firstValue !== title) {
		const joinedValue = givenPath.join('\\');
        modifiedPath = '\\' + title + joinedValue;
    }
	
	return modifiedPath;
}

i2b2.CRC.view.displayTabs.resetEtlList = function() {
	var dropDown = document.getElementById("selectList");
	dropDown.selectedIndex = 0;
}

i2b2.CRC.view.displayTabs.openTab = function(evt, tabName) {
	// i2b2.CRC.view.displayTabs.resetEtlList();
	switch (tabName) {
		case "QT":
			// i2b2.ONT.view.nav.doRefreshAll();
			i2b2.CRC.view.status.show();
			break;
		case "Etl":
			// i2b2.ONT.view.nav.doRefreshAll();
			i2b2.CRC.view.status.hide();
			$('i2b2etl.bodyBox').show();
			i2b2.CRC.view.etl.buttonDisplay();
			break;
		case "Tabulation":
			i2b2.ONT.view.nav.doRefreshAll();
			i2b2.CRC.view.status.hide();
			// document.getElementById("compute").disabled = true;
			$('i2b2tabulation.bodyBox').show();
			break;
		case "D3":
			i2b2.CRC.view.status.hide();
			$('i2b2d3.bodyBox').show();
			// i2b2.ONT.view.nav.doRefreshAll();
			break;
		case "Facts":
			// i2b2.ONT.view.nav.doRefreshAll();
			i2b2.CRC.view.status.hide();
			$('i2b2facts.bodyBox').show();
			i2b2.CRC.view.facts.getAnnotationFacts();
			break;
		case "FactsAll":
			// i2b2.ONT.view.nav.doRefreshAll();
			i2b2.CRC.view.status.hide();
			$('i2b2factsAll.bodyBox').show();
			i2b2.CRC.view.AF.getAllFactsData();
			break;
		case "Sankey":
			i2b2.CRC.view.status.hide();
			$('i2b2sankey.bodyBox').hide();
			// i2b2.ONT.view.nav.doRefreshAll();
			break;
		default:
			console.error("No tab available");
	}

	var i, tabcontent, tabBox;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
	  tabcontent[i].style.display = "none";
	}
	tabBox = document.getElementsByClassName("tabBox");
	for (i = 0; i < tabBox.length; i++) {
	  tabBox[i].className = tabBox[i].className.replace(" active", "");
	}
	document.getElementById(tabName).style.display = "block";
	evt.currentTarget.className += " active";
}

//================================================================================================== //
i2b2.events.initView.subscribe((function(eventTypeName, newMode) {
// -------------------------------------------------------
    this.visible = true;
// -------------------------------------------------------
}),'',i2b2.CRC.view.displayTabs);
  
console.timeEnd('execute time');
console.groupEnd();
 
