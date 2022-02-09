/**
 * @projectDescription	The Asynchronous Query Status controller (GUI-only controller).
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.MQryStatus
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.0
 * ----------------------------------------------------------------------------------------
 * updated 8-10-09: Initial Creation [Nick Benik] 
 */

 const M_QRY_STATUS_BASE_URL = window.location.origin;

 i2b2.CRC.ctrlr.MQryStatus = function(dispDIV) { this.dispDIV = dispDIV; };
 
 i2b2.CRC.ctrlr.MQryStatus._GetTitle = function(resultType, oRecord, oXML) {
     var title = "";
     switch (resultType) {
         case "PATIENT_ENCOUNTER_SET":
             // use given title if it exist otherwise generate a title
             try {
                 var t = i2b2.h.XPath(oXML,'self::query_result_instance/description')[0].firstChild.nodeValue;
             } catch(e) {
                 var t = null;
             }
             if (!t) { t = "Encounter Set"; }
             // create the title using shrine setting
             if (oRecord.size >= 10) {
                 if (i2b2.PM.model.isObfuscated) {
                     title = t+" - "+oRecord.size+"&plusmn;"+i2b2.UI.cfg.obfuscatedDisplayNumber.toString()+" encounters";
                 } else {
                     title = t; //+" - "+oRecord.size+" encounters";
                 }
             } else {
                 if (i2b2.PM.model.isObfuscated) {
                     title = t+" - 10 encounters or less";
                 } else {
                     title = t; //+" - "+oRecord.size+" encounters";
                 }
             }
             break;		
         case "PATIENTSET":
             // use given title if it exist otherwise generate a title
             try {
                 var t = i2b2.h.XPath(oXML,'self::query_result_instance/description')[0].firstChild.nodeValue;
             } catch(e) {
                 var t = null;
             }
             if (!t) { t = "Patient Set"; }
             // create the title using shrine setting
             if (oRecord.size >= 10) {
                 if (i2b2.PM.model.isObfuscated) {
                     title = t+" - "+oRecord.size+"&plusmn;"+i2b2.UI.cfg.obfuscatedDisplayNumber.toString()+" patients";
                 } else {
                     title = t; //+" - "+oRecord.size+" patients";
                 }
             } else {
                 if (i2b2.PM.model.isObfuscated) {
                     title = t+" - 10 patients or less";
                 } else {
                     title = t; //+" - "+oRecord.size+" patients";
                 }
             }
             break;
         case "PATIENT_COUNT_XML":
             // use given title if it exist otherwise generate a title
             try {
                 var t = i2b2.h.XPath(oXML,'self::query_result_instance/description')[0].firstChild.nodeValue;
             } catch(e) {
                 var t = null;
             }
             if (!t) { t="Patient Count"; }
             // create the title using shrine setting
             if (oRecord.size >= 10) {
                 if (i2b2.PM.model.isObfuscated) {
                     title = t+" - "+oRecord.size+"&plusmn;"+i2b2.UI.cfg.obfuscatedDisplayNumber.toString()+" patients";
                 } else {
                     title = t+" - "+oRecord.size+" patients";
                 }
             } else {
                 if (i2b2.PM.model.isObfuscated) {
                     title = t+" - 10 patients or less";
                 } else {
                     title = t+" - "+oRecord.size+" patients";
                 }
             }
             break;
         default : 
             try {
                 title = i2b2.h.XPath(oXML,'self::query_result_instance/query_result_type/description')[0].firstChild.nodeValue;
             } catch(e) {
             }		
             break;
     }
 
     return title;
 };
 
 
 function trim(sString)
 {
   while (sString.substring(0,1) == '\n')
   {
   sString = sString.substring(1, sString.length);
   }
   while (sString.substring(sString.length-1, sString.length) == '\n')
   {
   sString = sString.substring(0,sString.length-1);
   }
   return sString;
 } 
 
 i2b2.CRC.ctrlr.MQryStatus.prototype = function() {
     var private_singleton_isRunning = false;
     var private_startTime = false; 
     var private_refreshInterrupt = false;
         
     function private_pollStatus() {
         var self = i2b2.CRC.ctrlr.currentQueryStatus;
         // this is a private function that is used by all QueryStatus object instances to check their status
         // callback processor to check the Query Instance
         var scopedCallbackQI = new i2b2_scopedCallback();
         scopedCallbackQI.scope = self;
         scopedCallbackQI.callback = function(results) {
             if (results.error) {
                 alert(results.errorMsg);
                 return;
             } else {
                 // find our query instance
                 var qi_list = results.refXML.getElementsByTagName('query_instance');
                 var l = qi_list.length;
                 for (var i=0; i<l; i++) {
                     var temp = qi_list[i];
                     var qi_id = i2b2.h.XPath(temp, 'descendant-or-self::query_instance_id')[0].firstChild.nodeValue;
                     
                         this.QI.message = i2b2.h.getXNodeVal(temp, 'message');
                         this.QI.start_date = i2b2.h.getXNodeVal(temp, 'start_date');
                         if (!Object.isUndefined(this.QI.start_date)) {
                             //alert(sDate.substring(0,4) + ":" + sDate.substring(5,7)  + ":" + sDate.substring(8,10));
                             //012345678901234567890123
                             //2010-12-21T16:12:01.427
                             this.QI.start_date =  new Date(this.QI.start_date.substring(0,4), this.QI.start_date.substring(5,7)-1, this.QI.start_date.substring(8,10), this.QI.start_date.substring(11,13),this.QI.start_date.substring(14,16),this.QI.start_date.substring(17,19),this.QI.start_date.substring(20,23));
                         }						
                         this.QI.end_date = i2b2.h.getXNodeVal(temp, 'end_date');
                         if (!Object.isUndefined(this.QI.end_date)) {
                             //alert(sDate.substring(0,4) + ":" + sDate.substring(5,7)  + ":" + sDate.substring(8,10));
                             this.QI.end_date =  new Date(this.QI.end_date.substring(0,4), this.QI.end_date.substring(5,7)-1, this.QI.end_date.substring(8,10), this.QI.end_date.substring(11,13),this.QI.end_date.substring(14,16),this.QI.end_date.substring(17,19),this.QI.end_date.substring(20,23));
                         }					
                     
                     if (qi_id == this.QI.id) {
                         // found the query instance, extract the info
                         this.QI.status = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/name')[0].firstChild.nodeValue;
                         this.QI.statusID = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/status_type_id')[0].firstChild.nodeValue;
                         private_singleton_isRunning = false;
                         
                         i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryInstanceId("CRC:QueryStatus", {qi_key_value: self.QI.id}, scopedCallbackQRS);
                     
                         break;
                     }
                 }
             }
         }
         
 
         // callback processor to check the Query Result Set
         var scopedCallbackQRS = new i2b2_scopedCallback();
         scopedCallbackQRS.scope = self;
         scopedCallbackQRS.callback = function(results) {
             if (results.error) {
                 alert(results.errorMsg);
                 return;
             } else {
                 // find our query instance
                 var qrs_list = results.refXML.getElementsByTagName('query_result_instance');
                 var l = qrs_list.length;
                 for (var i=0; i<l; i++) {
                     var temp = qrs_list[i];
                     var qrs_id = i2b2.h.XPath(temp, 'descendant-or-self::result_instance_id')[0].firstChild.nodeValue;
                     if (self.QRS.hasOwnProperty(qrs_id)) {
                         var rec = self.QRS[qrs_id];
                     } else {
                         var rec = new Object();
                         rec.QRS_ID = qrs_id;
                         rec.size = i2b2.h.getXNodeVal(temp, 'set_size');
                         rec.start_date = i2b2.h.getXNodeVal(temp, 'start_date');
                         if (!Object.isUndefined(rec.start_date)) {
                             //alert(sDate.substring(0,4) + ":" + sDate.substring(5,7)  + ":" + sDate.substring(8,10));
                             //012345678901234567890123
                             //2010-12-21T16:12:01.427
                             rec.start_date =  new Date(rec.start_date.substring(0,4), rec.start_date.substring(5,7)-1, rec.start_date.substring(8,10), rec.start_date.substring(11,13),rec.start_date.substring(14,16),rec.start_date.substring(17,19),rec.start_date.substring(20,23));
                         }						
                         rec.end_date = i2b2.h.getXNodeVal(temp, 'end_date');
                         if (!Object.isUndefined(rec.end_date)) {
                             //alert(sDate.substring(0,4) + ":" + sDate.substring(5,7)  + ":" + sDate.substring(8,10));
                             rec.end_date =  new Date(rec.end_date.substring(0,4), rec.end_date.substring(5,7)-1, rec.end_date.substring(8,10), rec.end_date.substring(11,13),rec.end_date.substring(14,16),rec.end_date.substring(17,19),rec.end_date.substring(20,23));
                         }						
                         
                         rec.QRS_DisplayType = i2b2.h.XPath(temp, 'descendant-or-self::query_result_type/display_type')[0].firstChild.nodeValue;						
                         rec.QRS_Type = i2b2.h.XPath(temp, 'descendant-or-self::query_result_type/name')[0].firstChild.nodeValue;
                         rec.QRS_Description = i2b2.h.XPath(temp, 'descendant-or-self::description')[0].firstChild.nodeValue;						
                         rec.QRS_TypeID = i2b2.h.XPath(temp, 'descendant-or-self::query_result_type/result_type_id')[0].firstChild.nodeValue;
                     }
                     rec.QRS_Status = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/name')[0].firstChild.nodeValue;
                     rec.QRS_Status_ID = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/status_type_id')[0].firstChild.nodeValue;
                     // create execution time string
                     var d = new Date();
                     var t = Math.floor((d.getTime() - private_startTime)/100)/10;
                     var exetime = t.toString();
                     if (exetime.indexOf('.') < 0) {
                         exetime += '.0';
                     }
                     // deal with time/status setting
                     if (!rec.QRS_time) { rec.QRS_time = exetime; }
                     
                     // set the proper title if it was not already set
                     if (!rec.title) {
                         rec.title = i2b2.CRC.ctrlr.MQryStatus._GetTitle(rec.QRS_Type, rec, temp);
                     }				
                     self.QRS[qrs_id] = rec;
                 }
                 i2b2.CRC.ctrlr.history.Refresh();
             }
             // force a redraw
             i2b2.CRC.ctrlr.currentQueryStatus.refreshStatus();
             //i2b2.CRC.view.graphs.clearGraphs('making graphs ...');
         }
         
         
         // fire off the ajax calls
         i2b2.CRC.ajax.getQueryInstanceList_fromQueryMasterId("CRC:QueryStatus", {qm_key_value: self.QM.id}, scopedCallbackQI);
 
 
                 // make graph - snm0
                                 //alert("HERE WITH THIS:\n" + sCompiledResultsTest); //snm0 
         //i2b2.CRC.view.graphs.createGraphs("infoQueryStatusChart", i2b2.CRC.view.graphs.returnTestString(false)), false);  // single site testing
         //i2b2.CRC.view.graphs.createGraphs("infoQueryStatusChart", i2b2.CRC.view.graphs.returnTestString(true), true);  // multisite testing
 
 
   }  // end of private_pollStatus
     
     function private_refresh_status() {
         var sCompiledResultsTest = "";  // snm0 - this is the text for the graph display
                 // callback processor to check the Query Instance
         var scopedCallbackQRSI = new i2b2_scopedCallback();
         scopedCallbackQRSI.scope = self;
         // This is where each breakdown in the results is obtained
         // each breakdown comes through here separately
         scopedCallbackQRSI.callback = function(results) {
             if (results.error) {
                 alert(results.errorMsg);
                 return;
             } else {
                 // find our query instance
 
                 var ri_list = results.refXML.getElementsByTagName('query_result_instance');
                 var l = ri_list.length;
                 var description = "";  // Query Report BG
                 for (var i=0; i<l; i++) {
                     var temp = ri_list[i];
                     // get the query name for display in the box
                     description = i2b2.h.XPath(temp, 'descendant-or-self::description')[0].firstChild.nodeValue;
                     self.dispDIV.innerHTML += "<div class=\"mainGrp\" style=\"clear: both;  padding-top: 10px; font-weight: bold;\">" + description + "</div>";					// Query Report BG
                     sCompiledResultsTest += description + '\n';  //snm0
                 } 
                 var crc_xml = results.refXML.getElementsByTagName('crc_xml_result');
                 l = crc_xml.length;
                 for (var i=0; i<l; i++) {			
                     var temp = crc_xml[i];
                     var xml_value = i2b2.h.XPath(temp, 'descendant-or-self::xml_value')[0].firstChild.nodeValue;
 
                     var xml_v = i2b2.h.parseXml(xml_value);	
                         
                     var params = i2b2.h.XPath(xml_v, 'descendant::data[@column]/text()/..');
                     for (var i2 = 0; i2 < params.length; i2++) {
                         var name = params[i2].getAttribute("name");
                         if (i2b2.PM.model.isObfuscated) {
                             if ( params[i2].firstChild.nodeValue < 4) {
                                 var value = "<"+i2b2.UI.cfg.obfuscatedDisplayNumber.toString();	
                             } else {
                                 var value = params[i2].firstChild.nodeValue + "&plusmn;"+i2b2.UI.cfg.obfuscatedDisplayNumber.toString() ;
                             }
                         } else
                         {
                             var value = params[i2].firstChild.nodeValue;							
                         }
                         if(i2b2.UI.cfg.useFloorThreshold){
                             if (params[i2].firstChild.nodeValue < i2b2.UI.cfg.floorThresholdNumber){
                                 var value = i2b2.UI.cfg.floorThresholdText + i2b2.UI.cfg.floorThresholdNumber.toString();
                             }
                         }
                         // N.Benik - Override the display value if specified by server setting the "display" attribute
                         var displayValue = value;
                         if (typeof params[i2].attributes.display !== 'undefined') {
                             displayValue = params[i2].attributes.display.textContent;
                         }
                         var graphValue = displayValue;
                        if (typeof params[i2].attributes.comment !== 'undefined') {
                             displayValue += ' &nbsp; <span style="color:#090;">[' + params[i2].attributes.comment.textContent + ']<span>';
                             graphValue += '|' + params[i2].attributes.comment.textContent;
                         }
 
                         // display a line of results in the status box
                         self.dispDIV.innerHTML += "<div class=\'" + description + "\' style=\"clear: both; margin-left: 20px; float: left; height: 16px; line-height: 16px;\">" + params[i2].getAttribute("column") + ": <font color=\"#0000dd\">" + displayValue + "</font></div>";  //Query Report BG
 
                         //sCompiledResultsTest += params[i2].getAttribute("column").substring(0,20) + " : " + value + "\n"; //snm0
                         if (params[i2].getAttribute("column") == 'patient_count') {
                             sCompiledResultsTest += params[i2].getAttribute("column").substring(0,20) + " : " + graphValue + "\n"; //snm0
                         } else {
                         sCompiledResultsTest += params[i2].getAttribute("column").substring(0,20) + " : " + value + "\n"; //snm0
                         }
                     }
                     var ri_id = i2b2.h.XPath(temp, 'descendant-or-self::result_instance_id')[0].firstChild.nodeValue;
                 }
                 
                 i2b2.CRC.view.graphs.createGraphs("infoQueryStatusChart", sCompiledResultsTest, i2b2.CRC.view.graphs.bIsSHRINE);
                 if (i2b2.CRC.view.graphs.bisGTIE8) {
                     // Resize the query status box depending on whether breakdowns are included
                     if (sCompiledResultsTest.includes("breakdown")) {
                         i2b2.CRC.cfg.config.ui.statusBox = i2b2.CRC.cfg.config.ui.largeStatusBox; 
                     }
                     else {
                         i2b2.CRC.cfg.config.ui.statusBox = i2b2.CRC.cfg.config.ui.defaultStatusBox;
                         
                         document.getElementById('createDerivedConceptDialog_mask').style.display = 'none';
                         onLoadDerivedConceptForm();
                         getQueryMasterData();
                     }
                     i2b2.CRC.view.status.selectTab('graphs'); 
                     window.dispatchEvent(new Event('resize'));	
                 }
             }
         }
 
         
         var self = i2b2.CRC.ctrlr.currentQueryStatus;
         // this private function refreshes the display DIV
         var d = new Date();
         var t = Math.floor((d.getTime() - private_startTime)/100)/10;
         var s = t.toString();
         if (s.indexOf('.') < 0) {
             s += '.0';
         }
         if (private_singleton_isRunning) {
             self.dispDIV.innerHTML = '<div style="clear:both;"><div style="float:left; font-weight:bold">Running Query: "'+self.QM.name+'"</div>';
             // display the current run duration
 
             self.dispDIV.innerHTML += '<div style="float:right">['+s+' secs]</div>';
         } else {
             self.dispDIV.innerHTML = '<div style="clear:both;"><div style="float:left; font-weight:bold">Finished Query: "'+self.QM.name+'"</div>';
             self.dispDIV.innerHTML += '<div style="float:right">['+s+' secs]</div>';
             
             //Query Report BG
             if((!Object.isUndefined(self.QI.start_date)) && (!Object.isUndefined(self.QI.end_date)))
             {
                 var startDateElem = "<input type=\"hidden\" id=\"startDateElem\" value=\"" + self.QI.start_date + "\">";
                 var startDateMillsecElem = "<input type=\"hidden\" id=\"startDateMillsecElem\" value=\"" + moment(self.QI.start_date) + "\">";
                 var endDateElem = "<input type=\"hidden\" id=\"endDateElem\" value=\"" + self.QI.end_date + "\">";
                 var endDateMillisecElem = "<input type=\"hidden\" id=\"endDateMillsecElem\" value=\"" + moment(self.QI.end_date) + "\">";
                 self.dispDIV.innerHTML += startDateElem + startDateMillsecElem + endDateElem + endDateMillisecElem;
             }
             //End Query Report BG
             //		self.dispDIV.innerHTML += '<div style="margin-left:20px; clear:both; height:16px; line-height:16px; "><div height:16px; line-height:16px; ">Compute Time: ' + (Math.floor((self.QI.end_date - self.QI.start_date)/100))/10 + ' secs</div></div>';
             //		self.dispDIV.innerHTML += '</div>';
             $('runBoxText').innerHTML = "Run Query";
 
         }
         self.dispDIV.innerHTML += '</div>';
         if ((!private_singleton_isRunning) && (undefined != self.QI.end_date)){
             self.dispDIV.innerHTML += '<div style="margin-left:20px; clear:both; line-height:16px; ">Compute Time: '+ (Math.floor((self.QI.end_date - self.QI.start_date)/100))/10 +' secs</div>';
         }
         
         var foundError = false;
 
         
 
         for (var i in self.QRS) {
             var rec = self.QRS[i];			
             if (rec.QRS_time) {
                 var t = '<font color="';
                 // display status of query in box
                 switch(rec.QRS_Status) {
                     case "ERROR":
                         self.dispDIV.innerHTML += '<div style="clear:both; height:16px; line-height:16px; "><div style="float:left; font-weight:bold; height:16px; line-height:16px; ">'+rec.title+'</div><div style="float:right; height:16px; line-height:16px; "><font color="#dd0000">ERROR</font></div>';
                         //	self.dispDIV.innerHTML += '<div style="float:right; height:16px; line-height:16px; "><font color="#dd0000">ERROR</font></div>'; //['+rec.QRS_time+' secs]</div>';
                         foundError = true;
                         document.getElementById('overlay').style.display = 'none';
                         break;
                     case "COMPLETED":
                         document.getElementById('overlay').style.display = 'none';
                     case "FINISHED":
                         foundError = false;
                         document.getElementById('overlay').style.display = 'none';
                         onLoadDerivedConceptForm();
                         
                         //t += '#0000dd">'+rec.QRS_Status;
                         break;
                     case "INCOMPLETE":
                         document.getElementById('overlay').style.display = 'none';
                     case "WAITTOPROCESS":
                     case "PROCESSING":
                         self.dispDIV.innerHTML += '<div style="clear:both; height:16px;line-height:16px; "><div style="float:left; font-weight:bold;  height:16px; line-height:16px; ">'+rec.title+'</div><div style="float:right; height:16px; line-height:16px; "><font color="#00dd00">PROCESSING</font></div>';	
                         alert('Your query has timed out and has been rescheduled to run in the background.  The results will appear in "Previous Queries"');
                         foundError = true;
                         //t += '#00dd00">'+rec.QRS_Status;
                         break;
                 }
                 t += '</font> ';
                 //self.dispDIV.innerHTML += '<div style="float:right; height:16px; line-height:16px; ">'+t+'['+rec.QRS_time+' secs]</div>';
             }
             self.dispDIV.innerHTML += '</div>';
             if (foundError == false) {
                 if (rec.QRS_DisplayType == "CATNUM") {
                     i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryResultInstanceId("CRC:QueryStatus", {qr_key_value: rec.QRS_ID}, scopedCallbackQRSI);
                 } else if ((rec.QRS_DisplayType == "LIST") && (foundError == false)) {
                     self.dispDIV.innerHTML += "<div style=\"clear: both; padding-top: 10px; font-weight: bold;\">" + rec.QRS_Description + "</div>";
                 } 
                 if (rec.QRS_Type == "PATIENTSET") {
                 
                     // Check to see if timeline is checked off, if so switch to timeline
                     var t2 = $('dialogQryRun').select('INPUT.chkQueryType');
                     for (var i=0;i<t2.length; i++) {
                         var curItem = t2[i].nextSibling.data;
                         if (curItem != undefined)
                         {
                             curItem = curItem.toLowerCase();
                             //curitem = curItem.trim();
                         }
                         if ((t2[i].checked == true) && (rec.size > 0) && (curItem == " timeline")  
                         && !(i2b2.h.isBadObjPath('i2b2.Timeline.cfg.config.plugin'))
                         ) {
 
                             i2b2.hive.MasterView.setViewMode('Analysis');
                             i2b2.PLUGINMGR.ctrlr.main.selectPlugin("Timeline");
                     
                             //Process PatientSet
                             rec.QM_id = self.QM.id;
                             rec.QI_id = self.QI.id;
                             rec.PRS_id = rec.QRS_ID;
                             rec.result_instance_id = rec.PRS_id;
                             var sdxData = {};
                             sdxData[0] = i2b2.sdx.Master.EncapsulateData('PRS', rec);							
                             i2b2.Timeline.prsDropped(sdxData);
                             
                             i2b2.Timeline.setShowMetadataDialog(false);
                             
                             //Process Concepts, put all concepts in one large set
                             sdxData = {};
                             for (var j2 = 0; j2 < i2b2.CRC.model.queryCurrent.panels.length; j2++) {
                             var panel_list = i2b2.CRC.model.queryCurrent.panels[j2]
                             var panel_cnt = panel_list.length;
                             
                             for (var p2 = 0; p2 < panel_cnt; p2++) {
                                 // Concepts
                                 for (var i2=0; i2 < panel_list[p2].items.length; i2++) {
                                     sdxData[0] = panel_list[p2].items[i2];
                                     if (sdxData[0].sdxInfo.sdxType == "CONCPT")
                                     i2b2.Timeline.conceptDropped(sdxData, false); // nw096 - turn off dialogs when auto-generating timeline
                                 }
                             }
                             }
                             //$('Timeline-pgstart').value = '1';
                             //$('Timeline-pgsize').value = '10';
                             //i2b2.Timeline.pgGo(0);
                             i2b2.Timeline.yuiTabs.set('activeIndex', 1);
                             
                             i2b2.Timeline.setShowMetadataDialog(true);
                         }
                     } 
 
                     // For derived Concept Query Run
                     var t3 = $('derivedConceptQryRun').select('INPUT.chkQueryType');
                     for (var i=0;i<t3.length; i++) {
                         var curItem = t3[i].nextSibling.data;
                         if (curItem != undefined)
                         {
                             curItem = curItem.toLowerCase();
                             //curitem = curItem.trim();
                         }
                         if ((t3[i].checked == true) && (rec.size > 0) && (curItem == " timeline")  
                         && !(i2b2.h.isBadObjPath('i2b2.Timeline.cfg.config.plugin'))
                         ) {
 
                             i2b2.hive.MasterView.setViewMode('Analysis');
                             i2b2.PLUGINMGR.ctrlr.main.selectPlugin("Timeline");
                     
                             //Process PatientSet
                             rec.QM_id = self.QM.id;
                             rec.QI_id = self.QI.id;
                             rec.PRS_id = rec.QRS_ID;
                             rec.result_instance_id = rec.PRS_id;
                             var sdxData = {};
                             sdxData[0] = i2b2.sdx.Master.EncapsulateData('PRS', rec);							
                             i2b2.Timeline.prsDropped(sdxData);
                             
                             i2b2.Timeline.setShowMetadataDialog(false);
                             
                             //Process Concepts, put all concepts in one large set
                             sdxData = {};
                             for (var j2 = 0; j2 < i2b2.CRC.model.queryCurrent.panels.length; j2++) {
                             var panel_list = i2b2.CRC.model.queryCurrent.panels[j2]
                             var panel_cnt = panel_list.length;
                             
                             for (var p2 = 0; p2 < panel_cnt; p2++) {
                                 // Concepts
                                 for (var i2=0; i2 < panel_list[p2].items.length; i2++) {
                                     sdxData[0] = panel_list[p2].items[i2];
                                     if (sdxData[0].sdxInfo.sdxType == "CONCPT")
                                     i2b2.Timeline.conceptDropped(sdxData, false); // nw096 - turn off dialogs when auto-generating timeline
                                 }
                             }
                             }
                             
                             i2b2.Timeline.yuiTabs.set('activeIndex', 1);
                             
                             i2b2.Timeline.setShowMetadataDialog(true);
                         }
                     }
                 }
             }
         }
         if ((undefined != self.QI.message)  && (foundError == false))
         {
             self.dispDIV.innerHTML += '<div style="clear:both; float:left;  padding-top: 10px; font-weight:bold">Status</div>';
             
             
             var mySplitResult = self.QI.message.split("<?xml");
 
             for(i3 = 1; i3 < mySplitResult.length; i3++){
 
                 var xml_v = i2b2.h.parseXml(trim("<?xml " + mySplitResult[i3]));	
                 for (var i2 = 0; i2 < xml_v.childNodes.length; i2++) {
                     try { 
                         if (i2b2.PM.model.isObfuscated) {
                             if (i2b2.h.XPath(xml_v, 'descendant::total_time_second/text()/..')[i2].firstChild.nodeValue < 4)
                             {
                                 var value = "<"+i2b2.UI.cfg.obfuscatedDisplayNumber.toString();
                             } else {
                                 var value = i2b2.h.XPath(xml_v, 'descendant::total_time_second/text()/..')[i2].firstChild.nodeValue + "&plusmn;"+i2b2.UI.cfg.obfuscatedDisplayNumber.toString();
                             }
                         } else
                         {
                             var value =  i2b2.h.XPath(xml_v, 'descendant::total_time_second/text()/..')[i2].firstChild.nodeValue;							
                         }
                         if(i2b2.UI.cfg.useFloorThreshold){
                             if (i2b2.h.XPath(xml_v, 'descendant::total_time_second/text()/..')[i2].firstChild.nodeValue < i2b2.UI.cfg.floorThresholdNumber){
                                 var value = i2b2.UI.cfg.floorThresholdText + i2b2.UI.cfg.floorThresholdNumber.toString();
                             }
                         }
                         self.dispDIV.innerHTML += '<div style="margin-left:20px; clear:both; line-height:16px; ">' + i2b2.h.XPath(xml_v, 'descendant::name/text()/..')[i2].firstChild.nodeValue + '<font color="#0000dd">: ' + value + ' secs</font></div>';
                     } catch (e) {}
                 }
             }
         }
         
         self.dispDIV.style.display = 'none';
         self.dispDIV.style.display = 'block';
 
         if (!private_singleton_isRunning && private_refreshInterrupt) {
             // make sure our refresh interrupt is turned off
             try {
                 clearInterval(private_refreshInterrupt);
                 private_refreshInterrupt = false;
             } catch (e) {}
         }
     }
     
  	// LOAD API FOR 'Get Query Master Data'
    async function getQueryMasterData() {
         if (i2b2.CRC.view.QT.isShowingTemporalQueryUI === true) {
             var queryName = '(t) ' + i2b2.CRC.ctrlr.QT.setQueryName;
         } else {
             var queryName = i2b2.CRC.ctrlr.QT.setQueryName;	
         }
         
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
 
         try {
            //  const response = await fetch(M_QRY_STATUS_BASE_URL + "/api/derived-concepts/querymaster?name=" + queryName, requestOptions);
             const response = await fetch(M_QRY_STATUS_BASE_URL + "/cdi-api/querymaster?name=" + queryName, requestOptions);
             const responseData = await response.json();
             document.getElementById('code').value = responseData.name;
             document.getElementById('factQuery').value = responseData.generatedSql;
             return responseData;
         }
         catch (error) {
             return console.warn(error);
         }
   }

    async function addDerivedConcept() {
        let codeValue = document.getElementById('code').value;
        let codeIndex = (codeValue.substring(codeValue.indexOf(")")+1)).trim();
        let cPath = i2b2.CRC.view.displayTabs.formatPathWithSlash(document.getElementById('path').value);
        let derivedConceptPath = i2b2.CRC.view.displayTabs.modifyPathWithTitle(cPath, 'Derived');
        var rawData = JSON.stringify({
            "description": document.getElementById('description').value,
            "path": derivedConceptPath,
            "code": codeIndex,
            "factQuery": document.getElementById('factQuery').value,
            "type": document.getElementById("type1").checked ? 'TEXTUAL' : 'NUMERIC'
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
            body: rawData,
            credentials: 'include'
        };
            
        try {
            // const response = await fetch(M_QRY_STATUS_BASE_URL + "/api/derived-concepts", requestOptions);
            const response = await fetch(M_QRY_STATUS_BASE_URL + "/cdi-api/derived-concepts", requestOptions);
            const responseData = await response.json();
            
            i2b2.ONT.view.mInfo.calculateFacts(responseData);
            i2b2.ONT.view.nav.doRefreshAll();
            return responseData;
        }
        catch (error_1) {
            return console.warn(error_1);
        }
    }
    
     // DERIVED CONCEPT FORM ONLOAD FUNCTIONALITY START
     function onLoadDerivedConceptForm() {
         // callback for dialog submission
         var handleSubmit = function() {
             // submit value(s)
             if(this.submit()) {
                 addDerivedConcept();
             }
         }
         
         // display the query name input dialog
         this._loadDerivedConceptDialog(handleSubmit);
     }
     // DERIVED CONCEPT FORM ONLOAD FUNCTIONALITY END
 
     // DIALOG FOR DERIVED CONCEPT FORM START
     this._loadDerivedConceptDialog = function(handleSubmit) {
         var handleCancel = function() {
             this.cancel();
             document.getElementById('createDerivedConceptDialog_c').style.display = 'none';
             document.getElementById('createDerivedConceptDialog_mask').style.display = 'none';
         };
         var handleSave = function() {
             i2b2.CRC.view.createDerivedConceptDialog.submitterFunction();
         };
 
         i2b2.CRC.view.createDerivedConceptDialog = new YAHOO.widget.SimpleDialog("createDerivedConceptDialog", {
             width: "500px",
             fixedcenter: true,
             constraintoviewport: true,
             modal: true,
             zindex: 700,
             buttons: [{
                 text: "Save",
                 handler: handleSave,
                 isDefault: true
             }, {
                 text: "Cancel",
                 handler: handleCancel
             }]
         });
         $('createDerivedConceptDialog').show(); 
           
         i2b2.CRC.view.createDerivedConceptDialog.validate = function(){
            // now process the form data
            var msgError = '';
            var path = $('createDerivedConceptDialog').select('INPUT#path')[0];
            var code = $('createDerivedConceptDialog').select('INPUT#code')[0];
                    
            if (!path || path.value.blank()) {
                alert('Concept Path is empty or null.');
                return false;
            }
    
            if (!code || code.value.blank()) {
                alert('Concept Code is empty or null');
            }
    
            return true;
         };
     
 
         i2b2.CRC.view.createDerivedConceptDialog.render(document.body);
 
         // manage the event handler for submit
         delete i2b2.CRC.view.createDerivedConceptDialog.submitterFunction;
         i2b2.CRC.view.createDerivedConceptDialog.submitterFunction = handleSubmit;
         // display the dialoge
         i2b2.CRC.view.createDerivedConceptDialog.center();
         i2b2.CRC.view.createDerivedConceptDialog.show();
     }
 
     function private_cancelQuery() {                                             
         if (private_singleton_isRunning) {
             try {
                 var self = i2b2.CRC.ctrlr.currentQueryStatus;
                 if (i2b2.CRC.ctrlr.deleteCurrentQuery && i2b2.CRC.ctrlr.deleteCurrentQuery.QM !== false) { // BD2K/BD2K-79 & I2B2/WEBCLIENT-211
                     i2b2.CRC.ctrlr.history.queryDeleteNoPrompt(i2b2.CRC.ctrlr.deleteCurrentQuery.QM);
                 }
                 clearInterval(private_refreshInterrupt);
                 private_refreshInterrupt = false;
                 private_singleton_isRunning = false;
                 $('runBoxText').innerHTML = "Run Query";
                 self.dispDIV.innerHTML += '<div style="clear:both; height:16px; line-height:16px; text-align:center; color:r#ff0000;">QUERY CANCELLED</div>';
                 i2b2.CRC.ctrlr.currentQueryStatus = false;
                 document.getElementById('overlay').style.display = 'none';
             } catch (e) {}	
         }
     }
 
     function private_startQuery() {
         var self = i2b2.CRC.ctrlr.currentQueryStatus;
         if (private_singleton_isRunning) { return false; }
         private_singleton_isRunning = true;
         self.dispDIV.innerHTML = '<b>Processing Query: "'+this.name+'"</b>';
         i2b2.CRC.ctrlr.deleteCurrentQuery.QM = false; // WEBCLIENT-211
         i2b2.CRC.ctrlr.deleteCurrentQuery.cancelled = false;
         self.QM.name = this.name; 
         self.QRS = {};
          self.QI = {};
         
         // callback processor to run the query from definition
         this.callbackQueryDef = new i2b2_scopedCallback();
         this.callbackQueryDef.scope = this;
         this.callbackQueryDef.callback = function(results) {
             try{
                 if (results.error) {
                         var temp = results.refXML.getElementsByTagName('response_header')[0];
                         if (undefined != temp) {
                             results.errorMsg = i2b2.h.XPath(temp, 'descendant-or-self::result_status/status')[0].firstChild.nodeValue;
                             if (results.errorMsg.substring(0,9) == "LOCKEDOUT")
                             {
                                 results.errorMsg = 'As an "obfuscated user" you have exceeded the allowed query repeat and are now LOCKED OUT, please notify your system administrator.';
                             }
                         }
                     alert(results.errorMsg);
                     private_cancelQuery();
                     return;
                 } else {
                     //Check to see if condition failed
                     var condition = results.refXML.getElementsByTagName('condition')[0];
                     if (condition.getAttribute("type") == "ERROR")
                     {
                         
                         results.errorMsg = 'ERROR: ' + condition.firstChild.nodeValue;
                         alert(results.errorMsg);
                         private_cancelQuery();
                         return;
                     }
                     var temp = results.refXML.getElementsByTagName('query_master')[0];
                     self.QM.id = i2b2.h.getXNodeVal(temp, 'query_master_id');
                     i2b2.CRC.ctrlr.deleteCurrentQuery.QM = self.QM.id;
                     // Check if user cancelled query  // WEBCLIENT-211
                     if((i2b2.CRC.ctrlr.deleteCurrentQuery.QM !== false) && i2b2.CRC.ctrlr.deleteCurrentQuery.cancelled){
                         i2b2.CRC.ctrlr.history.queryDeleteNoPrompt(i2b2.CRC.ctrlr.deleteCurrentQuery.QM);
                     }
                     //Query Report BG
                     //Update the userid element when query is run first time
                     var userId = i2b2.h.getXNodeVal(temp,'user_id');
                     if(userId)
                     {
                         var existingUserIdElemList = $$("#userIdElem");
                         if(existingUserIdElemList)
                         {
                             existingUserIdElemList.each(function(existingUserIdElem){
                                 existingUserIdElem.remove();
                             });
                         }
                         $("crcQueryToolBox.bodyBox").insert(new Element('input',{'type':'hidden','id':'userIdElem','value':userId}));
                     }
                     //End Query Report BG
                     self.QM.name = i2b2.h.XPath(temp, 'descendant-or-self::name')[0].firstChild.nodeValue;
 
                     // save the query instance
                     var temp = results.refXML.getElementsByTagName('query_instance')[0];
                     self.QI.id = i2b2.h.XPath(temp, 'descendant-or-self::query_instance_id')[0].firstChild.nodeValue;
                     self.QI.start_date = i2b2.h.XPath(temp, 'descendant-or-self::start_date')[0].firstChild.nodeValue; //Query Report BG
                     var temp = i2b2.h.XPath(temp, 'descendant-or-self::end_date')[0];
                     if (undefined != temp) {
                        self.QI.end_date = i2b2.h.XPath(temp, 'descendant-or-self::end_date')[0].firstChild.nodeValue; //Query Report BG
                     }
                     var temp = self.QI.status = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/name')[0];
                     if (undefined != temp) {
                         self.QI.status = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/name')[0].firstChild.nodeValue;
                     }
                     var temp = self.QI.statusID = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/status_type_id')[0];
                     if (undefined != temp) {
                         self.QI.statusID = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/status_type_id')[0].firstChild.nodeValue;
                     }
                     
                     // we don't need to poll, all Result instances are listed in this message
                     if (false && (self.QI.status == "INCOMPLETE" || self.QI.status == "COMPLETED" || self.QI.status == "ERROR")) {
                         // create execution time string
                         var d = new Date();
                         var t = Math.floor((d.getTime() - private_startTime)/100)/10;
                         var exetime = t.toString();
                         if (exetime.indexOf('.') < 0) {
                             exetime += '.0';
                         }
                         var qi_list = results.refXML.getElementsByTagName('query_result_instance');
                         var l = qi_list.length;
                         for (var i=0; i<l; i++) {
                             try {
                                 var qi = qi_list[i];
                                 var temp = new Object();
                                 temp.size = i2b2.h.getXNodeVal(qi, 'set_size');
                                 temp.QI_ID = i2b2.h.getXNodeVal(qi, 'query_instance_id');
                                 temp.QRS_ID = i2b2.h.getXNodeVal(qi, 'result_instance_id');
                                 temp.QRS_Type = i2b2.h.XPath(qi, 'descendant-or-self::query_result_type/name')[0].firstChild.nodeValue;
                                 temp.QRS_TypeID = i2b2.h.XPath(qi, 'descendant-or-self::query_result_type/result_type_id')[0].firstChild.nodeValue;
                                 temp.QRS_Status = i2b2.h.XPath(qi, 'descendant-or-self::query_status_type/name')[0].firstChild.nodeValue;
                                 temp.QRS_Status_ID = i2b2.h.XPath(qi, 'descendant-or-self::query_status_type/status_type_id')[0].firstChild.nodeValue;
                                 temp.QRS_time = exetime;
                                 // set the proper title if it was not already set
                                 if (!temp.title) {
                                     temp.title = i2b2.CRC.ctrlr.MQryStatus._GetTitle(temp.QRS_Type, temp, qi);
                                 }
                                 self.QRS[temp.QRS_ID] = temp;
                             } catch	(e) {}
                         }
                         private_singleton_isRunning = false;
                         
                     } else {
                         // another poll is required
                         if(i2b2.CRC.ctrlr.currentQueryStatus !== false){ // WEBCLIENT-211
                             setTimeout("i2b2.CRC.ctrlr.currentQueryStatus.pollStatus()", this.polling_interval);
                         }
                     }				
                 }
             } catch(e){
                 
                 i2b2.CRC.ctrlr.currentQueryStatus.cancelQuery();
                 i2b2.CRC.ctrlr.currentQueryStatus = false;
             }
         }
         
         // switch to status tab
         i2b2.CRC.view.status.showDisplay();
 
         // timer and display refresh stuff
         private_startTime = new Date();
         private_refreshInterrupt = setInterval("i2b2.CRC.ctrlr.currentQueryStatus.refreshStatus()", 100);
 
         // AJAX call
         i2b2.CRC.ajax.runQueryInstance_fromQueryDefinition("CRC:QueryTool", this.params, this.callbackQueryDef);
     }
     return {
         name: "",
         polling_interval: 1000,
         QM: {id:false, status:""},
         QI: {id:false, status:""},
         QRS:{},
         displayDIV: false,
         running: false,
         started: false,
         startQuery: function(queryName, ajaxParams) {
             this.name = queryName;
             this.params = ajaxParams;
             private_startQuery.call(this);
         },
         cancelQuery: function() {
             private_cancelQuery();
         },
         isQueryRunning: function() {
             return private_singleton_isRunning;
         },
         refreshStatus: function() {
             private_refresh_status();
         },
         pollStatus: function() {
             private_pollStatus();
         }
     };
 }();
 
 i2b2.CRC.ctrlr.currentQueryStatus = false; 
 i2b2.CRC.ctrlr.deleteCurrentQuery = {
     QM : false,
     cancelled : false
 };
 