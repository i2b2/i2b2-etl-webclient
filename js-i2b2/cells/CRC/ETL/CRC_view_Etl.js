/**
 * @projectDescription	View controller for the etl
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.Etl
 * @version 	
 * ----------------------------------------------------------------------------------------
 */

 "use strict";

 const API_BASE_URL = window.location.origin;

 var timer;
   
 // ETL
 console.group('Load & Execute component file: CRC > view > Etl');
 console.time('execute time');
  
  // create and save the screen objects
 i2b2.CRC.view.etl = new i2b2Base_cellViewController(i2b2.CRC, 'etl');
  
 i2b2.events.initView.subscribe((function(eventTypeName, newMode) {
     newMode = newMode[0];
     this.viewMode = newMode;
     this.visible = false;
     $('i2b2etl.bodyBox').hide();
 }),'',i2b2.CRC.view.etl);
  // ================================================================================================== //
  
 // DELETE & UNDO ENABLE/DISABLE START
 
 async function displayBtn() {
     let loginProjectName = i2b2.PM.model.login_project;
     let getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
     let sessionId = getSessionData["session_id"];
     let username = getSessionData["user_name"];
 
     let loginHeader = new Headers();
     loginHeader.set('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
 
     try {
         const response = await fetchGet(API_BASE_URL + "/etl/checkUserDatabase?loginProject=" + loginProjectName, { headers : loginHeader });
         const responseData = await response.json();
 
         enableEtlBtn(responseData);
         clearTimeout(timer);
         return responseData;
     }
     catch (error) {
         clearTimeout(timer);
         return console.warn(error);
     }
 }
 
 i2b2.CRC.view.etl.buttonDisplay = function() {
    timer = setTimeout(function() {
        displayBtn();
    },1000);
 }
 
 function enableEtlBtn(response) {
     if (response.data === true) {
         document.getElementById('etl-delete-btn').disabled = false;
         if (response.volume_data === true) {
             document.getElementById('etl-undo-btn').disabled = true;
         } 
         else if (response.volume_data === false) {
             document.getElementById('etl-undo-btn').disabled = false;
         }
     }
     else {
         document.getElementById('etl-delete-btn').disabled = true;
         document.getElementById('etl-undo-btn').disabled = true;
     }
 }
 
  // DELETE & UNDO ENABLE/DISABLE END
  // =================================file upload================================================ //
  var inputElement = document.querySelector("#input");
  const progressBarFill = document.querySelector("#progressBar > .progress-bar-fill");
  const progressBarText = progressBarFill.querySelector(".progress-bar-text");
  const apiResponse = document.querySelector("#apiResponse")
  const logApiResponse = document.querySelector("#logApiResponse")
  const apiUrl = API_BASE_URL;
  
  function hideProgressBar() {
      progressBarFill.style.width = "0%";
      progressBarText.textContent = "0%";
      document.querySelector("#progressBar").hide();
  }
  
  function showProgressBar() {
      progressBarFill.style.width = "0%";
      progressBarText.textContent = "0%";
      document.querySelector("#progressBar").show();
  }
  
  function hideFileUploadStatus() {
      hideProgressBar();
      document.querySelector("#fileUploadStatus").hide();
      hideApiResponse();
  }
  
  function showFileUploadStatus() {
      showProgressBar();
      showFileUploadDetails();
  }
  
  function showFileUploadDetails() {
      var fileStatus = document.querySelector("#fileUploadStatus");
      fileStatus.show();
      fileStatus.querySelector(".file-upload-details").innerHTML = "";
      apiResponse.querySelector(".file-upload-details").innerHTML="";
  }
  
  function hideApiResponse() {
      apiResponse.querySelector(".file-upload-details").innerHTML="";
      apiResponse.hide();
  }
  
  function showApiResponse(response) {
      apiResponse.show();
      apiResponse.querySelector(".file-upload-details").innerHTML=response;
  }
  
  function uploadFile(files,inputLabel,inputLabelValue){
    const xhr = new XMLHttpRequest();
    var params = "loginProject="+ i2b2.PM.model.login_project;
    xhr.open("POST",apiUrl+'/etl/data'+'?'+params, true);
    showLogApiResponse(" Printing logs..");
    xhr.withCredentials = true;
    xhr.responseType = 'json';
  
    var getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials'));
    var sessionId = getSessionData["session_id"];
    var username = getSessionData["user_name"];
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
  
    showProgressBar();
  
    xhr.upload.addEventListener("progress", function(event) {
      const percent = event.lengthComputable ? (event.loaded/event.total) * 100 : 0;
      progressBarFill.style.width = percent.toFixed(2) + "%";
      progressBarText.textContent = percent.toFixed(2) + "%";
    });
  
    xhr.onload = function() {
        if(xhr.readyState === xhr.DONE) {
            if(xhr.status === 200) {
                let msg = "Files uploaded successfully"
                showApiResponse(msg);
                showEtlLogs();
                // i2b2.CRC.view.displayTabs.resetEtlList();
            } else if (xhr.status === 500) {
                progressBarText.textContent = "0%";
                showApiResponse("<p style='color: red;'>" + ("Status: "+ xhr.status+" "+ xhr.statusText) + "</p>" );
                 showLogApiResponse(xhr.statusText);
             } else {
                 progressBarText.textContent = "0%";
                showApiResponse("<p style='color: red;'> Status: "+xhr.status+" "+xhr.statusText
                +"</p>"+(xhr.response.error?xhr.response.error:''));
                showEtlLogs();
            }
 
            inputLabel.innerHTML=inputLabelValue;
            var inputBox = document.querySelector('#file-1.inputfile');
            inputBox.value = "";
        }
    }
  
    var formData = new FormData();
    var fileCount = 0;
  
    for (fileCount = 0; fileCount < files.length; fileCount++) {
      formData.append('files', files[fileCount]);
    }
    xhr.send(formData);
  }
  
  // ********* handle file   ****************** // 
  function handleFiles(files) { 
    let nBytes = 0;
    var nFiles = files.length;
    var fileNames = "";
    for (let nFileId = 0; nFileId < nFiles; nFileId++) {
      nBytes += files[nFileId].size;
      fileNames += files.item(nFileId).name + " ";
    }
    let sOutput = nBytes + " bytes";
    // optional code for multiples approximation
    const aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    for (let nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
      sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " (" + nBytes + " bytes)";
    }
    // end of optional code
  
    document.getElementById("uploadedFileNames").innerHTML = "<strong>Files: </strong>" + fileNames;
    document.getElementById("uploadedFileTotalSize").innerHTML = "<strong>Total Size: </strong>" + sOutput;
    
  }
  
  console.timeEnd('execute time');
  console.groupEnd();
  // ============================================================================================
  
  // ****************** < file upload controller>  ******************** //
  ;( function ( document, window, index )
  {
      var inputs = document.querySelectorAll( '.inputfile' );
      Array.prototype.forEach.call( inputs, function( input )
      {
          var label	 = input.nextElementSibling,
              labelVal = label.innerHTML;
  
          input.addEventListener('change', function( e ) {
              if(this.files.length > 0) {
                  var fileName = '';
                  if( this.files && this.files.length > 1 )
                      fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
                  else
                      fileName = e.target.value.split( '\\' ).pop();
      
                  if( fileName )
                      label.querySelector( 'span' ).innerHTML = fileName;
                  else
                      label.innerHTML = labelVal;
                  
                  showFileUploadStatus();
                  handleFiles(this.files);
                  uploadFile(this.files,label,labelVal);

              }
          });
          
          // Firefox bug fix
          input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
          input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
      });
  }( document, window, 0 ));
  
  // ************** <end> ******************* //
  
  
  
 // #########################<Delete Dialog>################################ //
 var handleCancelButton = function() {
     i2b2.CRC.view.dialogDelete.hide();
 };
 
 var loopBackSubmitButton = function() {
     hideFileUploadStatus();
     i2b2.CRC.view.dialogDelete.hide();
     i2b2.CRC.view.LoadingMask.show("DELETING...");
     deleteDataAPI('DELETE');
 };		
  
 i2b2.CRC.view.dialogDelete = new YAHOO.widget.SimpleDialog("dialogDelete", {
     width: "400px",
     fixedcenter: true,
     constraintoviewport: true,
     modal: true,
     zindex: 700,
     buttons: [{
         text: "Delete",
         handler: loopBackSubmitButton,
         isDefault: true
     }, {
         text: "Cancel",
         handler: handleCancelButton
     }]
 });
 
 var deleteData = function() {
    // i2b2.CRC.view.displayTabs.resetEtlList();
     $('dialogDelete').show();
     i2b2.CRC.view.dialogDelete.render(document.body);
     i2b2.CRC.view.dialogDelete.show();
 };
 // #######################<Delete Dialog>################################### //
 
 
 // #######################<UNDO DATA>################################### //
 var undoHandleCancelButton = function() {
     i2b2.CRC.view.dialogUndo.hide();
 };
 
 var undoLoopBackSubmitButton = function() {
     hideFileUploadStatus();
     i2b2.CRC.view.dialogUndo.hide();
     i2b2.CRC.view.LoadingMask.show("REMOVING THE LAST UPLOAD...");
     deleteDataAPI('UNDO');
 };		
     
 i2b2.CRC.view.dialogUndo = new YAHOO.widget.SimpleDialog("dialogUndo", {
     width: "400px",
     fixedcenter: true,
     constraintoviewport: true,
     modal: true,
     zindex: 700,
     buttons: [{
         text: "Undo",
         handler: undoLoopBackSubmitButton,
         isDefault: true
     }, {
         text: "Cancel",
         handler: undoHandleCancelButton
     }]
 });
 
 var undoData = function() {
    // i2b2.CRC.view.displayTabs.resetEtlList();
     $('dialogUndo').show();
     i2b2.CRC.view.dialogUndo.render(document.body);
     i2b2.CRC.view.dialogUndo.show();
 };
 // #######################<UNDO DATA>################################### //
  
 // #######################<Loading Mask>################################### //
 i2b2.CRC.view.LoadingMask = {
     show: function(title) {
         var sz = document.viewport.getDimensions();
 
             var w =  window.innerWidth || (window.document.documentElement.clientWidth || window.document.body.clientWidth);
             var h =  window.innerHeight || (window.document.documentElement.clientHeight || window.document.body.clientHeight);
 
         if (w < 840) {w = 840;}
         if (h < 517) {h = 517;}
         var mn = $('topMask');
         mn.style.width=w-10;
         mn.style.height=h-10;
         mn.innerHTML = "<TABLE height='100%' width='100%'><TR><TD align='center' valign='center'><BR/><H1><FONT size='12' color='white'>"+title+"</FONT></H1></TD></TR></TABLE>";
         mn.zindex = 50000;
         mn.style.cursor = 'wait';
         mn.show();
     },
     hide: function() {
         // hide the loading mask
         var mn = $('topMask');
         mn.innerHTML='';
         mn.hide();
     }
 };
 // #######################<Loading Mask>################################### //
 
 var deleteDataAPI = function(eventName){
     var loginProject = i2b2.PM.model.login_project;
     var getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
     var sessionId = getSessionData["session_id"];
     var username = getSessionData["user_name"];
 
     var loginHeader = new Headers();
     loginHeader.set('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
 
     var etlUrl;
     if (eventName === 'DELETE') {
         etlUrl = apiUrl+'/etl/data?loginProject=' + loginProject;
     } else if (eventName === 'UNDO') {
         etlUrl = apiUrl+'/etl/data?loginProject=' + loginProject + '&operation=UNDO';
     }
 
     fetchDelete(etlUrl, { headers : loginHeader })
         .then(response => response)
         .then(result => {
             if(result.ok) {
                 hideFileUploadStatus();
                 var deleteMsg;
                 if (eventName === 'DELETE') {
                     deleteMsg = "Data deleted successfully";
                 } else if (eventName === 'UNDO') {
                     deleteMsg = "Undo operation completed";
                 }
                 showApiResponse(deleteMsg);
                 showEtlLogs();
             }
             else {
                 hideFileUploadStatus();
                 showApiResponse("Couldn't delete data<br>Status: "+result.status+" "+result.statusText);
             }
             i2b2.CRC.view.LoadingMask.hide();
         })
         .catch(error => {
             hideFileUploadStatus();
             showApiResponse("Couldn't delete data");
             i2b2.CRC.view.LoadingMask.hide();
             console.error(error.stack);
         })
 }
  
 function showLogApiResponse(response) {
     logApiResponse.show();
     logApiResponse.querySelector(".etl-log-details").innerHTML=response;
     
 }
 
 function showEtlLogs() {
     var intervalId;
     showLogApiResponse(" Printing logs..");
     intervalId = setTimeout(function(){
         callShowEtlLogs(intervalId);
     }, 5000);
 }
  
  var callShowEtlLogs = async function (intervalId) {
      var loginProject = i2b2.PM.model.login_project;
      var getSessionData = JSON.parse(sessionStorage.getItem('loginCredentials')); 
      var sessionId = getSessionData["session_id"];
      var username = getSessionData["user_name"];
  
      var loginHeaders = new Headers();
      loginHeaders.set('Authorization', 'Basic ' + btoa(username + ":" + sessionId));
      loginHeaders.set('Cache-Control','no-cache');
  
      let response  = await fetch(apiUrl+'/etl/logs?loginProject=' + loginProject, {
          method: 'GET',headers: loginHeaders
          });
      if (response.ok) {
          // Call the API again if content is not available on ETL backend log file.
          if (response.status == 204) {
            showEtlLogs();
          } else {
            let logs = await response.text();
            console.log(response);
            console.log(logs);
            // Apply colours to log string
            logs = applyColoursToLogString(logs);
            showLogApiResponse('Printing...\n' + logs)
            
            // Refresh ontology
            i2b2.ONT.ctrlr.gen.loadCategories();
            i2b2.ONT.view.nav.PopulateCategories();
            
            if (isBreakInterval(logs)) {
                clearTimeout(intervalId);
                showLogApiResponse(logs);
                i2b2.CRC.view.etl.buttonDisplay();
            }
            
            // Scroll to bottom
            var pre = jQuery("#logApiResponse");
            pre.scrollTop( pre.prop("scrollHeight") );
            displayBtn();
        }
      } else {
        let errJson = await response.json();
        showLogApiResponse("Couldn't get logs<br>Status: "+response.status+" "+response.statusText + "<br>Error Message: " + errJson.error);
      }
  }
  
  function applyColoursToLogString(logs) {
      var re = new RegExp('SUCCESS', 'g');
      logs = logs.replace(re, '<span style="color:green;">SUCCESS</span>');
      
      var re = new RegExp('INFO', 'g');
      logs = logs.replace(re, '<span style="color:yellow;">INFO</span>');
  
      var re = new RegExp('ERROR', 'g');
      logs = logs.replace(re, '<span style="color:red;">ERROR</span>');
  
      return logs;
  }
  
  function isBreakInterval(logs) {
      let spllitedStr = logs.split('\n');
      let logRow = spllitedStr[spllitedStr.length - 2];
      if (logRow.includes("operation completed !!")) {
          return true;
      }
      return false
 }
  
  
  console.timeEnd('execute time');
  console.groupEnd();
