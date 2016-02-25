sap.ui.jsview("custominbox.index", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf custominbox.index
	*/ 
	getControllerName : function() {
		return "custominbox.index";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf custominbox.index
	*/ 
	createContent : function(oController) {
		var oBaseVerticalLayout = new sap.ui.commons.layout.VerticalLayout({width : "100%"});
		oBaseVerticalLayout.addStyleClass("midDisplayClass");
		
		var oBasePanel = new sap.ui.commons.Panel({
			text: "Open Task",
			width : "100%",
			showCollapseIcon : false, 
			tooltip : ""
		});
		oBasePanel.addStyleClass("commonPanel").addStyleClass("panel-default");
		
		var oBrandDropdown = new sap.ui.commons.DropdownBox({
			items : [new sap.ui.core.ListItem({text:"Open Task", key:"ne"}),
			         new sap.ui.core.ListItem({text:"Completed Task", key:"eq"})],
			change : function(event){oController.callBPMTasks(event); }});
		var oTaskLabel=new sap.ui.commons.Label({text:"All Tasks: "});
		var oRefreshButton=new sap.ui.commons.Button({tooltip:"Refresh",icon : "sap-icon://refresh",press:function(oEvent){
			oController.refreshTableData(oEvent);
		}});
		var oTable = new sap.ui.table.Table({
			visibleRowCount: 10,
			selectionMode: sap.ui.table.SelectionMode.None,
			selectionBehavior : sap.ui.table.SelectionBehavior.RowSelector,
			extension: [
			   new sap.ui.commons.layout.MatrixLayout({columns: 4, widths:["12%","15%","12%","61%"]}).createRow(oTaskLabel,oBrandDropdown,oRefreshButton,"")
					]
		});
		
		oTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({text: "Task Title",textAlign :"Left"}),
			template: new sap.ui.commons.Link({textAlign :"Left",press:function(oEvent){var oRow=oEvent.getSource();
			callBPMDialog(parseInt(oRow.getBindingContext().sPath.split("/")[1]));}}).bindProperty("text", "TaskTitle"),
			sortProperty: "TaskTitle",
			filterProperty: "TaskTitle",
			visible: true,
			width:"30%"
		}));
		
		oTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({text: "Creation Date",textAlign :"Left"}),
			template: new sap.ui.commons.TextView({textAlign :"Left"}).bindProperty("text", 
					{
				 parts: [
				 {path: "CreatedOn", type: new
				 sap.ui.model.type.String()}
				 ],
				 formatter: function(CreatedOn){
				 var value="";
				 if(CreatedOn)
				 {
				 var date = new Date(parseInt(CreatedOn.substring(6,19)));
				 value=oController.changeDateFormat(date);
				 }
				 else{
				 value="";
				 }
									      	     		 	            
				 return value;
				 }
				 }		
			),
			resizable:false,
			sortProperty: "CreatedOn",
			filterProperty: "CreatedOn",
			width:"20%"
		}));
		
		oTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({text: "Due Date",textAlign :"Left"}),
			template: new sap.ui.commons.TextView({textAlign :"Left"}).bindProperty("text", {
				 parts: [
						 {path: "CompletionDeadLine", type: new
						 sap.ui.model.type.String()}
						 ],
						 formatter: function(CompletionDeadLine){
						 var value="";
						 if(CompletionDeadLine)
						 {
						 var date = new Date(parseInt(CompletionDeadLine.substring(6,19)));
						 value=oController.changeDateFormat(date);
						 }
						 else{
						 value="";
						 }
											      	     		 	            
						 return value;
						 }
						 }),
			resizable:false,
			width:"20%",
			sortProperty: "CompletionDeadLine",
			filterProperty: "CompletionDeadLine"
			
		}));
		
		oTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({text: "Status",textAlign :"Left"}),
			template: new sap.ui.commons.TextView({textAlign :"Left"}).bindProperty("text", "Status"),
			resizable:false,
			width:"15%",
			sortProperty: "Status",
			filterProperty: "Status"
		}));
		
		oTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({text: "Priority", textAlign :"Left"}),
			template: new sap.ui.commons.TextView({textAlign :"Left"}).bindProperty("text", "Priority"),
			resizable:false,
			width:"15%",
			sortProperty: "Priority",
			filterProperty: "Priority"
		}));
		oTable.bindRows("/");
		oBasePanel.addContent(oTable);		
		oBaseVerticalLayout.addContent(oBasePanel);
		
		return oBaseVerticalLayout;
	}

});
