sap.ui.controller("custominbox.index", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf custominbox.index
*/
	oModel:new sap.ui.model.json.JSONModel(),
	oData:"",
	onInit: function() {
		othis=this;
		selectedKey="ne";
		oColumn="";
		oData=getAllBPMTasks(selectedKey);
		var view=this.getView();
		oTable=this.getView().getContent()[0].getContent()[0].getContent()[0];
		oDropDown=oTable.getExtension()[0].getAggregation("rows")[0].getCells()[0].getContent()[0];
		othis.oModel.setData(oData);
		sap.ui.getCore().setModel(othis.oModel);
		var ua = navigator.userAgent;
	     browerEx = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	     browerEx = browerEx[2] ? [browerEx[1], browerEx[2]] : [navigator.appName, navigator.appVersion, '-?'];
	 if ((tem = ua.match(/version\/(\d+)/i)) !=null) {
	 browerEx.splice(1,1,tem[1]);
	 }
	},
	callBPMTasks:function(oEvent){
		var linkTemplate=new sap.ui.commons.Link({textAlign :"Left",press:function(oEvent){
				var oRow=oEvent.getSource();
				callBPMDialog(parseInt(oRow.getBindingContext().sPath.split("/")[1]));
			}}).bindProperty("text", "TaskTitle");
		var textTemplate=new sap.ui.commons.TextView({textAlign :"Left"}).bindProperty("text","TaskTitle");
		oColumn=oTable.getColumns()[0];
		selectedKey=oEvent.getSource().getSelectedKey();
		var oData=getAllBPMTasks(selectedKey);
		var count=oData.length;
		othis.oModel.setData(oData);
		othis.oModel.refresh(true);
		if(selectedKey=="ne"){
			oColumn.setTemplate(linkTemplate);
			this.setHeaderCount("Open Tasks ( "+count+" )");
		}
		else{
			oColumn.setTemplate(textTemplate);
			this.setHeaderCount("Completed Tasks ( "+count+" )");
		}
		oTable.rerender();
	 	sap.ui.getCore().setModel(othis.oModel);
	},
	setHeaderCount:function(arg){
		var pId=$(".commonPanel").attr('id');
		$("#"+pId+"-title").text(arg);
	},
	changeDateFormat:function(date){
		if(browerEx[0]==="Chrome"){
		var time=date.toLocaleString().split(",")[1];
		
		var changedDate=othis.getCorrectFormat(date);
  		 var formDate = changedDate+" "+time;
	}
		if(browerEx[0]==="Firefox"){
			var formDate = date.toLocaleFormat();
		}
		if(browerEx[0]==="Trident"||browerEx[0]==="Safari"){
			var time=date.toLocaleTimeString();
			var changedDate=othis.getCorrectFormat(date);
			var formDate = changedDate+" "+time;
		}
  		 return formDate;
	},
	refreshTableData:function(oEvent){
		var oData="";
		if(selectedKey=="ne"){
			oData=getAllBPMTasks(selectedKey);
			this.setHeaderCount("Open Tasks ( "+oData.length+" )");
		}
		else{
			oData=getAllBPMTasks(selectedKey);
			this.setHeaderCount("Completed Tasks ( "+oData.length+" )");
		}
		oTable.rerender();
		othis.oModel.setData(oData);
		othis.oModel.refresh(true);
	 	sap.ui.getCore().setModel(othis.oModel);
	},
	getCorrectFormat:function(date){
		var dd=date.getUTCDate();
		var month = date.getUTCMonth()+1;
  		 var mm ;
  		 var yy = date.getUTCFullYear();
		
  		 switch(month){
		
		 case 1 : mm = "Jan";
		 break;
		
		 case 2 : mm = "Feb";
		 break;
		
		 case 3 : mm = "Mar";
		 break;
		
		 case 4 : mm = "Apr";
		 break;
		
		 case 5 : mm = "May";
		 break;
		
		 case 6 : mm = "Jun";
		 break;
		
		 case 7 : mm = "Jul";
		 break;
		
		 case 8 : mm = "Aug";
		 break;
		
		 case 9 : mm = "Sep";
	 	 break;
		
		 case 10 : mm = "Oct";
		 break;
		
		 case 11 : mm = "Nov";
		 break;
		
		 case 12 : mm = "Dec";
		 break;
		
		 }
  		 return mm +" "+dd+", "+yy;
	},
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf bpminbox.index
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf bpminbox.index
*/
	onAfterRendering: function() {
		this.setHeaderCount("Open Tasks ( "+oData.length+" )");
	}

});