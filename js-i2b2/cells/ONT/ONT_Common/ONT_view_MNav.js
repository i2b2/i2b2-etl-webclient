/**
 * @projectDescription	View controller for ONT's "Navigate Terms" tab.
 * @inherits 	i2b2.ONT.view
 * @namespace	i2b2.ONT.view.mNav
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: ONT > view > mNav');
console.time('execute time');
 
 
// create and save the view object
i2b2.ONT.view.mNav = new i2b2Base_cellViewController(i2b2.ONT, 'mNav');
  
i2b2.ONT.view.mNav.PCategories = function(sdxDataNode) {
    if(i2b2.PM.model.userRoles.includes('POPULATION_FACT_VIEWER') && i2b2.sdx.TypeControllers.MConcept.errorStatusCode === 200){ 
        if (window.mainNodeDerivedData !== undefined) {
            window.mainNodeDerivedData.forEach(el => {
                if (el.path === sdxDataNode.origData.dim_code) {
                    sdxDataNode.origData.isDerived = true;
                }
            })
        }
    }
}

i2b2.ONT.view.mNav.CMenuValidate = function(contextRecord, tvNode, mil) {
    if (i2b2.PM.model.userRoles.includes('DATA_AUTHOR') && i2b2.sdx.TypeControllers.MConcept.errorStatusCode === 200) {
        if (env.derivedConceptTemporal === true) {
            mil.push({ text: "Create Derived Concept", id: "derived-concept", onclick: { fn: i2b2.ONT.view.mInfo.createDerivedConceptTemplate, obj: contextRecord } });
        }
    }
    
    var element = document.getElementById(contextRecord.renderData.htmlID);
    if (element !== null && (i2b2.PM.model.userRoles.includes('DATA_AUTHOR') && i2b2.sdx.TypeControllers.MConcept.errorStatusCode === 200)) {
        window.mainNodeDerivedData.forEach(el => {
            if (el.path == contextRecord.origData.dim_code) {
                contextRecord.origData.derivedId = el.id;
                contextRecord.origData.derivedCode = el.code
                
                mil.push({ text: "Edit", onclick: { fn: i2b2.ONT.view.mInfo.editDerivedConcept, obj: contextRecord }});

                mil.push({ text: "Delete", onclick: { fn: i2b2.ONT.view.mInfo.deleteDerivedConcept, obj: contextRecord }});
            }
        })
    }
}

i2b2.ONT.view.mNav.CreateMLPrediction = function(contextRecord, tvNode, mil) {
    if (i2b2.PM.model.userRoles.includes('DATA_AUTHOR') && i2b2.sdx.TypeControllers.MConcept.errorStatusCode === 200) {
        if (env.createMLPrediction === true) {
            mil.push({ text: "Create ML Prediction", id: "ml-prediction", onclick: { fn: i2b2.ONT.view.mInfo.createMLPredictionTemplate, obj: contextRecord } });
        }
    }
}
 
console.timeEnd('execute time');
console.groupEnd();
 