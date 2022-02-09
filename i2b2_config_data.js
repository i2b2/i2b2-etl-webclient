{
	urlProxy: "index.php",
	urlFramework: "js-i2b2/",
	startZoomed: true,
	//-------------------------------------------------------------------------------------------
	// THESE ARE ALL THE DOMAINS A USER CAN LOGIN TO
	lstDomains: [
		{ domain: "i2b2demo",
		  name: "HarvardDemo",
		  urlCellPM: "http://i2b2-wildfly:8080/i2b2/services/PMService/",
		  // urlCellPM: "http://services.i2b2.org/i2b2/services/PMService/", 
		  allowAnalysis: true,
		  //installer: "/webclient/plugin_installer/",
		  debug: true
		}
	]
	//-------------------------------------------------------------------------------------------
}
