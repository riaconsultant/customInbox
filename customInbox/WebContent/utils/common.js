/**
 * custom application specific functionlity and various back-end data calls
 */
var loggedInUser = "";
var getWidgets = "";
var getCustomWidgets = "";
var oBPModel = "";
var isVendor = "";
var loggedInUID = "";
var data={};
var search={};
var dashboardWidgets="";
data.department="";
search.department="";
var depName="";
var emaild="";
function getTicketCount(loggedInData){
	var oHeader= {"Content-Type":"application/json;charset=utf-8"};
	if(isVendor === "true"){
		var url="/VendorPortal/albl/ticket/getTicketCount/" + loggedInUID;
	}else{
		var url="/VendorPortal/albl/ticket/getTicketCount/''";
	}
	if(loggedInData.vendor == "true"){
		data.userId = loggedInData.email;
	}else{
		var temp="";
		for(i in loggedInData.groups){
			if(loggedInData.groups[i].groupUniqName.match("VP_VR"))
				data.department = data.department+loggedInData.groups[i].groupUniqName.substring(6)+",";
		}
		temp=data.department.split(",");
			data.department=temp[0];
	}
	var tktCountModel = new sap.ui.model.json.JSONModel();
	tktCountModel.loadData("/VendorPortal/albl/ticket/getTicketCount",JSON.stringify(data),false,"POST",false,false,oHeader);
	if(tktCountModel.oData.list){
		setTicketCount(tktCountModel.oData);
	}
}

function setTicketCount(data){
	if(Array.isArray((data.list))){
		for(var i = 0 ; i < data.list.length ; i++){
			if(data.list[i].deptName.toUpperCase() === "CSE"){
				$("#ITTicket").css("display","block");
				$("#cseTicketCount")[0].textContent = data.list[i].ticketCount;
			}
			if(data.list[i].deptName.toUpperCase() === "FINANCE"){
				$("#FiananceTicket").css("display","block");
				$("#financeTicketCount")[0].textContent = data.list[i].ticketCount;
			}
			if(data.list[i].deptName.toUpperCase() === "SOURCING"){
				$("#SourcingTicket").css("display","block");
				$("#sourcingTicketCount")[0].textContent = data.list[i].ticketCount;
			}
			if(data.list[i].deptName.toUpperCase() === "WAREHOUSE"){
				$("#WareTicket").css("display","block");
				$("#warehouseTicketCount")[0].textContent = data.list[i].ticketCount;
			}
		}
	}else{
		if(data.list.deptName.toUpperCase() === "CSE"){
			$("#ITTicket").css("display","block");
			$("#cseTicketCount")[0].textContent = data.list.ticketCount;
		}
		if(data.list.deptName.toUpperCase() === "FINANCE"){
			$("#FiananceTicket").css("display","block");
			$("#financeTicketCount")[0].textContent = data.list.ticketCount;
		}
		if(data.list.deptName.toUpperCase() === "SOURCING"){
			$("#SourcingTicket").css("display","block");
			$("#sourcingTicketCount")[0].textContent = data.list.ticketCount;
		}
		if(data.list.deptName.toUpperCase() === "WAREHOUSE"){
			$("#WareTicket").css("display","block");
			$("#warehouseTicketCount")[0].textContent = data.list.ticketCount;
		}
	}
}

function handleErrTktCount(data){
	$("#cseTicketCount")[0].textContent = data.message;
	$("#financeTicketCount")[0].textContent = data.message;
	$("#sourcingTicketCount")[0].textContent = data.message;
	$("#warehouseTicketCount")[0].textContent = data.message;
}

function ajaxCall(url,method,oParam){
	var data;
	$.ajax({
	  method: method,
	  url: url,
	  data: JSON.stringify(oParam),
	  dataType:"application/json",
	  cache:false,
	  beforeSend:function(){
		  $("#preloader").show();
	  },
	  complete:function(arg){
		  $("#preloader").hide();
		  data=JSON.parse(arg.responseText);
		  getVendorRouting(data);
		  isVendor = data.vendor;
		  emaild=data.email;
		  loggedInUID = data.userId;
		  loggedInUser=data;
		  getTicketCount(data);
		  getAutoComplete(data);
		  //getItemsForSearch(data);
		  setMyProfile(isVendor);
		  if(data.vendor === "true"){
			  setWidgets(data.customizedWidget,data.roles);
			  applySortable();
			  //loadWidgetsUrl();
			  dashboardWidgets=data.customizedWidget;
			  addWidgetNavClick();
		  }
	  },
	  error:function(){
		  $("#preloader").hide();
	  }
	});
	return data;
}

function setMyProfile(arg){
	if(arg==="true"){
		$(".user-body").show();
//		$(".small-box-footer").hide();
	}else{
		$(".user-body").hide();
	}
}
function getVendorRouting(data){
	if(data.vendor == "true"){
		// means Vendor Users Only
		if(!data.requestId && !data.vendorCode){
			window.location.href = "/vendorportal/page/vendorregindex.html";
		}else if(data.requestId && !data.vendorCode){
			window.location.href = "/vendorportal/page/vendorregindex.html?"+data.requestId;
		}else if(data.vendorCode){
			if(data.memberSince){
				window.sMemberSince = data.memberSince.substring(8,10)+"-"+data.memberSince.substring(5,7)+"-"+data.memberSince.substring(0,4);
			}
			$(".wrapper").css("display","block");
			addSideBarContent(data.vendor,data);
		}
		else{
			$(".wrapper").css("display","block");
			//$("#PollDay").load("widget/showpoll.html");
			//$("#MyPerf").load("widget/myorder.html");
			//$("#Calendar").load("widget/calendar.html");
			addSideBarContent(data.vendor,data);
		}
	}else{
		// for ALBL Users
		$(".wrapper").css("display","block");
		addSideBarContent(data.vendor,data);
	}
	setUserName(data);
	getBPMTask();
	if(JSON.parse(data.blocked)||JSON.parse(data.userBlocked)){
		blackListVendor();
	}
}

function blackListVendor(){
	$('.sidebar-menu *:not("#reportsId *,#ticketId1 *")').attr("href",null);
}
function widgetNav(sAccess){

	$(".sidebar-menu").append("<li class='treeview' id='myWidgets'></li>");
	$("#myWidgets").append("<a href='#'> <i class='fa fa-dashboard'> </i> <span>My Widgets</span> <i class='fa fa-angle-right pull-right'></i> </a>");
	$("#myWidgets").append("<ul class='treeview-menu'></ul>");
//////For widgets we are fetching data based on roles but we are hiding the div since it is much easier to do that///////
	if(sAccess.match("VP_OTIF")){
	$("#otifSection").css("display","block");
	$("#myWidgets>ul").append("<li class='draggable'><a href='#'><i class='fa fa-circle-o'></i> My OTIF</a></li>");
	}
	else{
		$("#otifSection").css("display","none");
		$("li:has('a'):contains('My OTIF')").remove();
	}
	if(sAccess.match("VP_DAILY_POLL")){
		$("#pollSection").css("display","block");
		$("#myWidgets>ul").append("<li class='draggable'><a href='#'><i class='fa fa-circle-o'></i> My Poll</a></li>");
	}
	else{
		$("#pollSection").css("display","none");
		$("li:has('a'):contains('My Poll')").remove();
	}
	
	if(sAccess.match("VP_ORDER")){
		//$("#ratingSection").css("display","block");
		$("#orderSection").css("display","block");
		$("#myWidgets>ul").append("<li class='draggable'><a href='#'><i class='fa fa-circle-o'></i> My Order</a></li>");
	}
	else{
	//	$("#ratingSection").css("display","none");
		$("#orderSection").css("display","none");
		$("li:has('a'):contains('My Order')").remove();
	}
	
	if(sAccess.match("VP_TRAN")){
		$("#calenderSection").css("display","block");
		$("#myWidgets>ul").append("<li class='draggable'><a href='#'><i class='fa fa-circle-o'></i>Payment Calendar</a></li>");
	}
	else{
		$("#calenderSection").css("display","none");
		$("li:has('a'):contains('Payment Calendar')").remove();
	}
	
	if(sAccess.match("VP_RAT")){
		$("#ratingSection").css("display","none");
		$("#myWidgets>ul").append("<li class='draggable'><a href='#'><i class='fa fa-circle-o'></i>Rating & Ranking</a></li>");
	}
	else{
		$("#ratingSection").css("display","none");
		$("li:has('a'):contains('Rating & Ranking')").remove();
	}

}
function getWidgetNav(roles){
	var navData='<li class="treeview active" id="myWidgets"><a href="#"><i class="fa fa-dashboard"></i> <span>My Widgets</span> <i class="fa fa-angle-right pull-right"></i></a>';
		navData+='<ul class="treeview-menu menu-open" style="display: block;">';
		for(var k=0;k<roles.length;k++){
			if(roles[k].roleUniqName == "VP_ORDER"){
				navData+='<li class="draggable"><a href="#" lang="'+roles[k].roleUniqName+'" ><i class="fa fa-circle-o"></i> My Order</a></li>';
			}
			if(roles[k].roleUniqName == "VP_DAILY_POLL"){
				navData+='<li class="draggable"><a href="#" lang="'+roles[k].roleUniqName+'" ><i class="fa fa-circle-o"></i> My Poll</a></li>';
			}
			if(roles[k].roleUniqName == "VP_TRAN"){
				navData+='<li class="draggable"><a href="#" lang="'+roles[k].roleUniqName+'" ><i class="fa fa-circle-o"></i> Payment Calendar</a></li>';
			}
			if(roles[k].roleUniqName == "VP_OTIF"){
				navData+='<li class="draggable"><a href="#" lang="'+roles[k].roleUniqName+'" ><i class="fa fa-circle-o"></i> My OTIF</a></li>';
			}
			/*if(roles[k].roleUniqName == "VP_RAT"){
				navData+='<li class="draggable"><a href="#" lang="'+roles[k].roleUniqName+'" ><i class="fa fa-circle-o"></i> Rating & Ranking</a></li>';
			}*/
			
		}
		navData+='</ul>';
		navData+='</li>';
	return navData;
}
function addWidgetNavClick(){
	$(".draggable > a").on('click',function(arg){
		var name=$(this).attr('lang');
		addWidget(""+name);
	});
}
function addSideBarContent(isVendor,vendorData){
	var tempAccess = vendorData.roles;
	var aAccess=[];
	for(i in tempAccess){
		aAccess.push(tempAccess[i].roleUniqName);
	}
	//var aAccess=["VP_ASN","VP_BAR","VP_RECO","VP_REP_ASN","VP_REP_GRN","VP_REP_INV","VP_REP_PAYM"];
	var sAccess = aAccess.join();		
	
	////////My Widgets/////////////////
	if(JSON.parse(isVendor)){	
		$(".sidebar-menu").append("<li class='header'>NAVIGATION</li>");
		$(".sidebar-menu").append(getWidgetNav(vendorData.roles));
//	if(sAccess.match("VP_DAILY_POLL")||sAccess.match("VP_ORDER")||sAccess.match("VP_TRAN")){
//		widgetNav(sAccess);
//	}
	
	////////////////////My Finance////////////////////
	///////////////////Give Id's if necessary////////////
	if(sAccess.match("VP_PAY")||sAccess.match("VP_ALBL_RECO")){
	$(".sidebar-menu").append("<li class='treeview' id='myFinance'></li>");
	$("#myFinance").append("<a href='#'>"
      +"<i class='fa fa-money'></i>"
      +"<span>My Finance</span>"
      +"<i class='fa fa-angle-right pull-right'></i>"
      +"</a>");
	$("#myFinance").append("<ul class='treeview-menu'>"+"</ul>");
	if(sAccess.match("VP_PAY"))
		$("#myFinance>ul").append("<li><a href='#page/payment'><i class='fa fa-download'></i> My Payment Voucher</a></li>");
	if(sAccess.match("VP_ALBL_RECO"))
	$("#myFinance>ul").append("<li><a href='#recon/finance'><i class='fa fa-download'></i> Reconciliation</a></li>");
	}
  ////////////////////////////////////////////////////

	//////////////////////Place my operations///////////////////
	if(sAccess.match("VP_ASN")){
	$(".sidebar-menu").append("<li class='treeview' id='myOp'></li>");
	$("#myOp").append("<a href='#'>"+
      "<i class='fa fa-truck'></i> <span>My Operations</span>"+
      "<i class='fa fa-angle-right pull-right'></i>"+
    "</a>");
	$("#myOp").append("<ul class='treeview-menu'>"+"</ul>");
	if(sAccess.match("VP_ASN"))
    $("#myOp>ul").append("<li><a class='newLink' href='#page/asn'><i class='fa fa-circle-o'></i> Place ASN</a></li>");
	if(sAccess.match("VP_BAR"))
    $("#myOp>ul").append("<li><a href='#page/barcode'><i class='fa fa-circle-o'></i> Place Barcode</a></li>");
	}
/////////////////////Vendor Reco//////////////////////
	if(sAccess.match("VP_RECO")&&JSON.parse(isVendor)){
    $(".sidebar-menu").append("<li class='treeview' id='vendorReco'></li>");
    $("#vendorReco").append("<a href='#'>"+
    		 "<i class='fa fa-truck'></i> <span>Reconciliation</span>"+
             "<i class='fa fa-angle-right pull-right'></i>"+
    		 "</a>");
    $("#vendorReco").append("<ul class='treeview-menu'>"+"</ul>");
    $("#vendorReco>ul").append("<li><a href='#recon/vendor'><i class='fa fa-circle-o'></i> Vendor Reconciliation</a></li>");
	}
  ///////////////////////////////////////////////////  

  ////////////////////Reports////////////////////////////
	if(sAccess.match("VP_REP_")){
    $(".sidebar-menu").append("<li class='treeview' id='reportsId'></li>");
    $("#reportsId").append("<a href='#'>"+
    		 "<i class='fa fa-pie-chart'></i> <span>Reports</span>"+
             "<i class='fa fa-angle-right pull-right'></i>"+
    "</a>");
    $("#reportsId").append("<ul class='treeview-menu'>"+"</ul>");
    if(sAccess.match("VP_REP_ASN"))
    $("#reportsId>ul").append("<li><a href='#report/asn'><i class='fa fa-truck'></i> ASN </a></li>");
    if(sAccess.match("VP_REP_BAR"))
    $("#reportsId>ul").append("<li><a href='#report/bar'><i class='fa fa-barcode'></i> Barcode </a></li>");
    if(sAccess.match("VP_REP_GRN"))
    $("#reportsId>ul").append("<li><a href='#report/grn'><i class='fa fa-briefcase'></i> GRN </a></li>");
    /*if(sAccess.match("VP_REP_OTIF"))
    $("#reportsId>ul").append("<li><a href='#report/otif'><i class='fa fa-bar-chart'></i> OTIF </a></li>");*/
    if(sAccess.match("VP_REP_SAL"))
    $("#reportsId>ul").append("<li><a href='#report/sales'><i class='fa fa-superscript'></i> Sales </a></li>");
    if(sAccess.match("VP_REP_SOH"))
    $("#reportsId>ul").append("<li><a href='#report/soh'><i class='fa fa-hand-o-right'></i> Stock on Hand </a></li>");
    if(sAccess.match("VP_REP_RTV"))
    $("#reportsId>ul").append("<li><a href='#report/rtv'><i class='fa fa-undo'></i> RTV </a></li>");
    if(sAccess.match("VP_REP_LED"))
    $("#reportsId>ul").append("<li><a href='#report/ledger'><i class='fa fa-money'></i> Ledger </a></li>");
    if(sAccess.match("VP_REP_INV"))
    $("#reportsId>ul").append("<li><a href='#report/invoice'><i class='fa fa-inr'></i> Invoice </a></li>");
    if(sAccess.match("VP_REP_PO"))
    $("#reportsId>ul").append("<li><a href='#report/po'><i class='fa fa-cart-arrow-down'></i> PO </a></li>");
    if(sAccess.match("VP_REP_CRED"))
    $("#reportsId>ul").append("<li><a href='#report/credit'><i class='fa fa-credit-card'></i> Accounting Line Items </a></li>");
    /*if(sAccess.match("VP_REP_RAT"))
    $("#reportsId>ul").append("<li><a href='#report/rating'><i class='fa fa-renren'></i> Rating & Ranking </a></li>");*/
    if(sAccess.match("VP_REP_DESC_GRN"))
    $("#reportsId>ul").append("<li><a href='#report/grndesc'><i class='fa fa-renren'></i> GRN Discrepancy </a></li>");
    if(sAccess.match("VP_REP_RETDESC_GRN"))
	$("#reportsId>ul").append("<li><a href='#report/descReturns'><i class='fa fa-renren'></i> GRN Discrepancy Returns </a></li>");

	}
  ///////////////////////////////////////////////////////
    
	///////////////////////////Help and feedback//////////////////
	if(sAccess.match("VP_FEEDBACK")||sAccess.match("VP_REQUEST_TICKET")||sAccess.match("VP_POLL_CREATE")||sAccess.match("VP_NEWSGAL")){
    $(".sidebar-menu").append("<li class='treeview' id='helpId'></li>");
    $("#helpId").append("<a href='#'>"+
    		"<i class='fa fa-info'></i> <span>Help</span>"+
            "<i class='fa fa-angle-right pull-right'></i>"+
          "</a>");
    $("#helpId").append("<ul class='treeview-menu'>"+"</ul>");
    //$("#helpId>ul").append("<li><a href='#manual/video.html'><i class='fa fa-youtube-play'></i> Video</a></li>");
    //$("#helpId>ul").append("<li><a href='#manul/faq.html'><i class='fa fa-question-circle'></i> FAQ</a></li>");
//    $("#helpId>ul").append("<li><a href='#manual/manual.html'><i class='fa fa-user'></i> User Manual</a></li>");
    if(sAccess.match("VP_REQUEST_TICKET"))
    $("#helpId>ul").append("<li id='ticketId1'><a href='#ticket/ticket.html'><i class='fa fa-hand-paper-o'></i> Raise Ticket</a></li>");
    if(sAccess.match("VP_FEEDBACK")&&!JSON.parse(isVendor))
    $("#helpId>ul").append("<li><a href='#page/feedback'><i class='fa fa-comment'></i> Feedback</a></li>");
    if(sAccess.match("VP_POLL_CREATE")&&!JSON.parse(isVendor))
        $("#helpId>ul").append("<li><a href='#poll/createPoll'><i class='fa fa-comment'></i> Create Poll</a></li>");
    /*if(sAccess.match("VP_NEWSGAL")&&JSON.parse(isVendor))
        $("#helpId>ul").append("<li><a href='#page/updateurls'><i class='fa fa-comment'></i> Create News/Gallery</a></li>");
    */	
	}
    //////////////////////////////////////////////////////////////
//	To display the widgets

}else{
		////////////////////My Finance////////////////////
		///////////////////Give Id's if necessary////////////
		if(sAccess.match("VP_PAY")||sAccess.match("VP_CREATE_TRAN")||sAccess.match("VP_ALBL_RECO")){
		$(".sidebar-menu").append("<li class='treeview' id='myFinance'></li>");
		$("#myFinance").append("<a href='#'>"
	      +"<i class='fa fa-money'></i>"
	      +"<span>My Finance</span>"
	      +"<i class='fa fa-angle-right pull-right'></i>"
	      +"</a>");
		$("#myFinance").append("<ul class='treeview-menu'>"+"</ul>");
		/*if(sAccess.match("VP_REP_LED"))
		$("#myFinance>ul").append("<li><a href='#report/ledger'><i class='fa fa-circle-o'></i> My Ledger</a></li>");
		if(sAccess.match("VP_REP_INV"))
		$("#myFinance>ul").append("<li><a href='#report/invoice'><i class='fa fa-inr'></i> My Invoices</a></li>");
		*/
		/*if(sAccess.match("VP_TRAN"))
		$("#myFinance>ul").append("<li><a href='#page/calender'><i class='fa fa-calendar'></i> Payment Calendar</a></li>");
		*/if(sAccess.match("VP_PAY"))
		$("#myFinance>ul").append("<li><a href='#page/payment'><i class='fa fa-download'></i> My Payment Voucher</a></li>");
		if(sAccess.match("VP_CREATE_TRAN"))
		$("#myFinance>ul").append("<li><a href='#page/uploadCSV'><i class='fa fa-download'></i> Schedule Payments</a></li>");
		if(sAccess.match("VP_ALBL_RECO"))
		$("#myFinance>ul").append("<li><a href='#recon/finance'><i class='fa fa-download'></i> Reconciliation</a></li>");
		}
		//////////////////////////////My Warehouse/////////////////
		////////////////////////////Give Id's if necessary//////////
		if(sAccess.match("VP_UPL_RETDESC_GRN")){
			$(".sidebar-menu").append("<li class='treeview' id='myWarehouse'></li>");
			$("#myWarehouse").append("<a href='#'>"
		      +"<i class='fa fa-money'></i>"
		      +"<span>My Warehouse</span>"
		      +"<i class='fa fa-angle-right pull-right'></i>"
		      +"</a>");
			$("#myWarehouse").append("<ul class='treeview-menu'>"+"</ul>");
			$("#myWarehouse>ul").append("<li><a href='#page/grnDesFileUp'><i class='fa fa-download'></i> GRN Discrepancy</a></li>");
		}
//////////////////////Place my operations///////////////////
		if(sAccess.match("VP_ASN")){
		$(".sidebar-menu").append("<li class='treeview' id='myOp'></li>");
		$("#myOp").append("<a href='#'>"+
	      "<i class='fa fa-truck'></i> <span>My Operations</span>"+
	      "<i class='fa fa-angle-right pull-right'></i>"+
	    "</a>");
		$("#myOp").append("<ul class='treeview-menu'>"+"</ul>");
		if(sAccess.match("VP_ASN"))
	    $("#myOp>ul").append("<li><a class='newLink' href='#page/asn'><i class='fa fa-circle-o'></i> Place ASN</a></li>");
		if(sAccess.match("VP_BAR"))
	    $("#myOp>ul").append("<li><a href='#page/barcode'><i class='fa fa-circle-o'></i> Place Barcode</a></li>");
		}
		
	/////////////////////Vendor Reco//////////////////////
		if(sAccess.match("VP_RECO")){
	    $(".sidebar-menu").append("<li class='treeview' id='vendorReco'></li>");
	    $("#vendorReco").append("<a href='#'>"+
	    		 "<i class='fa fa-truck'></i> <span>Reconcilation</span>"+
	             "<i class='fa fa-angle-right pull-right'></i>"+
	    		 "</a>");
	    $("#vendorReco").append("<ul class='treeview-menu'>"+"</ul>");
	    $("#vendorReco>ul").append("<li><a href='#recon/vendor'><i class='fa fa-circle-o'></i> Vendor Reconcilation</a></li>");
		}
	  ///////////////////////////////////////////////////  
	    
	  ////////////////////Reports////////////////////////////
		if(sAccess.match("VP_REP_")){
	    $(".sidebar-menu").append("<li class='treeview' id='reportsId'></li>");
	    $("#reportsId").append("<a href='#'>"+
	    		 "<i class='fa fa-pie-chart'></i> <span>Reports</span>"+
	             "<i class='fa fa-angle-right pull-right'></i>"+
	    "</a>");
	    $("#reportsId").append("<ul class='treeview-menu'>"+"</ul>");
	    if(sAccess.match("VP_REP_ASN"))
	    $("#reportsId>ul").append("<li><a href='#report/asn'><i class='fa fa-truck'></i> ASN </a></li>");
	    if(sAccess.match("VP_REP_BAR"))
	    $("#reportsId>ul").append("<li><a href='#report/bar'><i class='fa fa-barcode'></i> Barcode </a></li>");
	    if(sAccess.match("VP_REP_GRN"))
	    $("#reportsId>ul").append("<li><a href='#report/grn'><i class='fa fa-briefcase'></i> GRN </a></li>");
	   /* if(sAccess.match("VP_REP_OTIF"))
	    $("#reportsId>ul").append("<li><a href='#report/otif'><i class='fa fa-bar-chart'></i> OTIF </a></li>");*/
	    if(sAccess.match("VP_REP_SAL"))
	    $("#reportsId>ul").append("<li><a href='#report/sales'><i class='fa fa-superscript'></i> Sales </a></li>");
	    if(sAccess.match("VP_REP_SOH"))
	    $("#reportsId>ul").append("<li><a href='#report/soh'><i class='fa fa-hand-o-right'></i> Stock on Hand </a></li>");
	    if(sAccess.match("VP_REP_RTV"))
	    $("#reportsId>ul").append("<li><a href='#report/rtv'><i class='fa fa-undo'></i> RTV </a></li>");
	    
	    if(sAccess.match("VP_REP_LED"))
	    $("#reportsId>ul").append("<li><a href='#report/ledger'><i class='fa fa-money'></i> Ledger </a></li>");
	    if(sAccess.match("VP_REP_INV"))
	    $("#reportsId>ul").append("<li><a href='#report/invoice'><i class='fa fa-inr'></i> Invoice </a></li>");
	    if(sAccess.match("VP_REP_PO"))
	    $("#reportsId>ul").append("<li><a href='#report/po'><i class='fa fa-cart-arrow-down'></i> PO </a></li>");
	    if(sAccess.match("VP_REP_CRED"))
	    $("#reportsId>ul").append("<li><a href='#report/credit'><i class='fa fa-credit-card'></i> Accounting Line Items </a></li>");
	    /*if(sAccess.match("VP_REP_RAT"))
	    $("#reportsId>ul").append("<li><a href='#report/rating'><i class='fa fa-renren'></i> Rating & Ranking </a></li>");*/
	    if(sAccess.match("VP_REP_DESC_GRN"))
	    $("#reportsId>ul").append("<li><a href='#report/grndesc'><i class='fa fa-renren'></i> GRN Discrepancy </a></li>");
	    if(sAccess.match("VP_REP_RETDESC_GRN"))
		$("#reportsId>ul").append("<li><a href='#report/descReturns'><i class='fa fa-renren'></i> GRN Discrepancy Returns </a></li>");
		}
	  ///////////////////////////////////////////////////////
	    
		///////////////////////////Role for Rating and Ranking quality inpputs//////////
	/*	if(sAccess.match("VP_RAT_RANK")){ //VP_RAT
			//fa fa-dashboard
			$(".sidebar-menu").append("<li class='treeview' id='ratUI'></li>");
		    $("#ratUI").append("<a href='#'>"+
		    		"<i class='fa fa-dashboard'></i> <span> Sourcing Inputs</span>"+
		            "<i class='fa fa-angle-right pull-right'></i>"+
		          "</a>");
		    $("#ratUI").append("<ul class='treeview-menu'>"+"</ul>");
		    $("#ratUI>ul").append("<li><a href='#page/sourcingQaInput'><i class='fa fa-circle-o'></i> Qualitative Inputs</a></li>");
		    
		}*/
		
		/////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////Help and feedback//////////////////
		if(sAccess.match("VP_FEEDBACK")||sAccess.match("VP_REQUEST_TICKET")||sAccess.match("VP_POLL_CREATE")){
	    $(".sidebar-menu").append("<li class='treeview' id='helpId'></li>");
	    $("#helpId").append("<a href='#'>"+
	    		"<i class='fa fa-info'></i> <span>Help</span>"+
	            "<i class='fa fa-angle-right pull-right'></i>"+
	          "</a>");
	    $("#helpId").append("<ul class='treeview-menu'>"+"</ul>");
	    //$("#helpId>ul").append("<li><a href='#manual/video.html'><i class='fa fa-youtube-play'></i> Video</a></li>");
	    //$("#helpId>ul").append("<li><a href='#manul/faq.html'><i class='fa fa-question-circle'></i> FAQ</a></li>");
	    //$("#helpId>ul").append("<li><a href='#manual/manual.html'><i class='fa fa-user'></i> User Manual</a></li>");
	    if(sAccess.match("VP_REQUEST_TICKET"))
	    $("#helpId>ul").append("<li><a href='#ticket/ticket.html'><i class='fa fa-hand-paper-o'></i> Raise Ticket</a></li>");
	    if(sAccess.match("VP_FEEDBACK"))
	    $("#helpId>ul").append("<li><a href='#page/feedback'><i class='fa fa-comment'></i> Feedback</a></li>");
		if(sAccess.match("VP_POLL_CREATE")&&!JSON.parse(isVendor))
	        $("#helpId>ul").append("<li><a href='#poll/createPoll'><i class='fa fa-comment'></i> Create Poll</a></li>");
		if(sAccess.match("VP_NEWSGAL")&&!JSON.parse(isVendor))
	        $("#helpId>ul").append("<li><a href='#page/updateurls'><i class='fa fa-comment'></i> Create News/Gallery</a></li>");
	    		
		}
	    //////////////////////////////////////////////////////////////
		
		////////////////////////Blacklist vendor/////////////////////
		if(sAccess.match("VP_BLACKLIST")){
		    $(".sidebar-menu").append("<li class='treeview' id='blacklistV'></li>");
		    $("#blacklistV").append("<a href='#'>"+
		      "<i class='fa fa-truck'></i> <span>Blacklist Vendor</span>"+
		      "<i class='fa fa-angle-right pull-right'></i>"+
		    "</a>");
		    $("#blacklistV").append("<ul class='treeview-menu'>"+"</ul>");
		    $("#blacklistV>ul").append("<li><a href='#page/blackList'><i class='fa fa-circle-o'></i> Blacklist Vendor</a></li>");
			}
		
		$("#orderSection").css("display","none");
	}
}


function setUserName(data){
	//$("#shortUserName").text(data.firstName+" "+data.lastName);
	
	if((data.firstName === undefined)&&(data.lastName === undefined)){
	$("#shortUserName").text("");
	}
	else{
	$("#shortUserName").text(data.firstName+" "+data.lastName);
	}
	
//	if(window.sMemberSince)
//		var txt=data.firstName+"  "+data.lastName+" - "+"<small>Member since "+window.sMemberSince+" </small>";
//	else
//		var txt=data.firstName+"  "+data.lastName+" - "+"<small></small>";
	
	if((data.firstName === undefined)&&(data.lastName === undefined)&&(window.sMemberSince=== undefined)){
	var txt = "";
	}
	else if(((data.firstName === undefined)&&(data.lastName === undefined))||(window.sMemberSince=== undefined)){
	var txt=data.firstName+"  "+data.lastName+"<small></small>";
	}
	else{
	var txt=data.firstName+"  "+data.lastName+" - "+"<small>Member since "+window.sMemberSince+" </small>";
	}
		
	$("#fullUserName").html(txt);
		if(data.firstName == "manoj"){
			$("#usrProfileImg").attr("src","img/manoj.png");
			$("#usrProfileImgFull").attr("src","img/manoj.png");
		}
}
function getLoggedInUser(){
	var url="/VendorPortal/albl/vendorRegistration/getLoggedInUserDetails";
	ajaxCall(url,"GET");
	//search.department = search.department+loggedInData.groups[i].groupUniqName.substring(6)+",";
	
}
function getProjectUrl(){
	var refUrl="/";
	var cUrl= window.location.pathname.split("/");
	for(var i=1;i<cUrl.length-1;i++){
		refUrl += cUrl[i]+"/";
	}
	return refUrl;
}

function getSAPCall(url,method,oParam){
	var oHeader={"Content-Type":"application/json; charset=utf-8"};
    var oModel = new sap.ui.model.json.JSONModel(); 
    oModel.loadData(url, JSON.stringify(oParam), false,method,false,false,oHeader);
     oModel.attachRequestCompleted(function(){
 	   //$("#ajaxloader").fadeOut(10);
     });
     if(oModel.getData() && Object.keys(oModel.getData()).length){
     	//console.log(oModel.getData());
         return oModel;
     }else{
     	return ;
     } 
}

function getBPMTask(){
	var url="/bpmodata/tasks.svc/TaskCollection?$skip=0&$orderby=CreatedOn desc&$filter=Status ne 'COMPLETED'&$expand=TaskDefinitionData&$format=json";
	oBPModel = getSAPCall(url,"GET",null);
	var tasks=oBPModel.getData().d.results;
	$("#taskCount").text(tasks.length);
	$("#taskHeader").text("You have "+ tasks.length +" tasks");
	taskDisplay(tasks);
}
function getAllBPMTasks(typeOfTask){
	var url="/bpmodata/tasks.svc/TaskCollection?$skip=0&$orderby=CreatedOn desc&$filter=Status "+typeOfTask+" 'COMPLETED'&$expand=TaskDefinitionData&$format=json";
	oBPModel = getSAPCall(url,"GET",null);
	return oBPModel.getData().d.results;
	
}
function taskDisplay(data){
	var taskMenu = document.getElementById("taskMenu");
	if(taskMenu.hasChildNodes()){
		taskMenu.innerHTML = "";
	}
	
	var str="";
	for(var i=0;i<data.length;i++){
		str="";
		//str ='<li onclick=callBPMDialog('+i+');><a href="#bpminbox/'+i+'"><h3>'+data[i].TaskTitle+'<small class="pull-right"></small></h3><div class="progress xs"><div class="progress-bar progress-bar-aqua" style="width: 100%" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div></div></a></li>';
		str ='<li onclick=callBPMDialog('+i+');><a href="#"><h3>'+data[i].TaskTitle.substring(0,38)+'</h3><h3>'+data[i].TaskTitle.substring(38,78)+'</h3><h3>'+data[i].TaskTitle.substring(78)+'</h3></a></li>';
		$("#taskMenu").append(str);
		/*var id = "#bpminbox/"+i;
		$(id).prop("title",data[i].TaskTitle);*/
	}
	//$("#taskMenu").add(str);
}
function getTaskUrl(arg){
	var obj=oBPModel.getData().d.results[arg];
	var urlLink=obj.UIExecutionLink.__deferred.uri+"?$format=json";
	var oTaskModel = getSAPCall(urlLink,"GET",null);
	var link=oTaskModel.getData().d.GUI_Link;
	return link;
}
function finalUrlFunc(arg){
	var len=arg.split("/");
	var lastFileUrl=len[len.length-1];
	var subPath=len[len.length-2];
	var cUrl=window.location.origin+"/"+subPath+"/"+lastFileUrl;
	return cUrl;
}
function callBPMDialog(arg){
	
	var _url=getTaskUrl(arg);
	var finalUrl=_url;
		BootstrapDialog.show({
		title: 'Task Detail',
		message:  function(dialog) {
	            var $content = $('<div><iframe id="iframeId" src="'+finalUrl+'" width="100%" height="600px"></iframe></div>');
	            return $content;
		}
	    });
	
}
function setTitleRoadmap(mainTitle,subTitle){
	//var textTitle=mainTitle+"<small>"+capitalize(subTitle)+"</small>";
	var textTitle=mainTitle;
	$("#pageTitle").html("");
}
function setActiveMenu(pageUrl){
	if(pageUrl){
		var elements = $('a[href="#'+pageUrl+'"]');
		$(".active").find("li").removeClass("active");
		if(elements[0]){
			if(elements[0].parentElement){
				elements[0].parentElement.className += " active";
			}
		}
	}
}
function sRoutingPath(getUrl){
	if(getUrl!="#" || getUrl !="undefined"){
		var getHash = getUrl.split("#");
		if(getHash.length >1){
			if(getHash[1]=="dashboard"){
				window.location.hash=getHash[1];
				$("#dashboardContent").show();
				$("#contentFrameDiv").hide();
				$("#bpmFrameDiv").hide();
				$("#viewAllTicketsDiv").hide();
				
				setTitleRoadmap("Dashboard","");
			}else if(getHash[1]=="refreshTask"){
				getBPMTask();
			}else if(getHash[1]=="bpminbox"){
				//window.open("/bpminbox/inbox.html","_blank");
				$("#bpmFrameDiv").show();
				$("#dashboardContent").hide();
				$("#contentFrameDiv").hide();
				$("#viewAllTicketsDiv").hide();
				callBpmIndex();
				setTitleRoadmap("","");
			}
			else if(getHash[1] !="" || getHash !="undefined"){
				window.location.hash=getHash[1];
				var path = getHash[1].split("/"); 
				var dynaUrl = "";
				setActiveMenu(getHash[1]);
				if(path[0]=="widget"){
					
				}
				else if(path[0]=="poll"){
					dynaUrl=getProjectUrl()+"widget/createPoll.html";
					$("#dashboardContent").hide();
					$("#bpmFrameDiv").hide();
					$("#viewAllTicketsDiv").hide();
					$("#contentFrameDiv").show();
					$("#contentFrameId").attr("src",dynaUrl);
					//$("#contentFrameId").height($(".content").height()-70+"px");
					$("#contentFrameId").height("700px");
					setTitleRoadmap("Create Poll","createPoll");
					window.scrollTo(0,0);
				}
				else if(path[0]=="report"){
					dynaUrl=getProjectUrl()+path[0]+"/index.html?"+path[1];
					$("#dashboardContent").hide();
					$("#bpmFrameDiv").hide();
					$("#viewAllTicketsDiv").hide();
					$("#contentFrameDiv").show();
					$("#contentFrameId").attr("src",dynaUrl);
					//$("#contentFrameId").height($(".content").height()-70+"px");
					$("#contentFrameId").height("1000px");
					setTitleRoadmap("Report",path[1]);
					window.scrollTo(0,0);
				}
				else if(path[0]=="ticket"){
					dynaUrl=getProjectUrl()+path[0]+"index.html";
					$("#dashboardContent").hide();
					$("#bpmFrameDiv").hide();
					$("#viewAllTicketsDiv").hide();
					$("#contentFrameDiv").show();
					$("#contentFrameId").attr("src",dynaUrl);
					//$("#contentFrameId").height($(".content").height()-70+"px");
					$("#contentFrameId").height("700px");
					setTitleRoadmap("Report","");
					window.scrollTo(0,0);
				}
				else if(path[0]=="recon"){
					dynaUrl=getProjectUrl()+path[0]+".html?"+path[1];
					$("#dashboardContent").hide();
					$("#bpmFrameDiv").hide();
					$("#viewAllTicketsDiv").hide();
					$("#contentFrameDiv").show();
					$("#contentFrameId").attr("src",dynaUrl);
					//$("#contentFrameId").height($(".content").height()-70+"px");
					$("#contentFrameId").height("700px");
					setTitleRoadmap("Report",path[1]);
					window.scrollTo(0,0);
				}
				else if(path[0]=="page"){
					dynaUrl=getProjectUrl()+path[0]+"/"+path[1]+".html";
					$("#dashboardContent").hide();
					$("#contentFrameDiv").show();
					$("#bpmFrameDiv").hide();
					$("#viewAllTicketsDiv").hide();
					$("#contentFrameId").attr("src",dynaUrl);
					$("#contentFrameId").height("700px");
					//$("#contentFrameId").height($(".content").height()-70+"px");
					setTitleRoadmap(path[1],"");
					window.scrollTo(0,0);
				}else if(path[0]=="manual"){
					$("#dashboardContent").hide();
					$("#contentFrameDiv").show();
					$("#bpmFrameDiv").hide();
					$("#viewAllTicketsDiv").hide();
					$("#contentFrameId").attr("src",dynaUrl);
					//$("#contentFrameId").height($(".content").height()-70+"px");
					$("#contentFrameId").height("700px");
					window.scrollTo(0,0);
				}
				else if(path[0]=="bpminbox"){
					//window.location.hash=path[0];
					callBpmIndex();
					$("#bpmFrameDiv").show();
					$("#viewAllTicketsDiv").hide();
					$("#dashboardContent").hide();
					$("#contentFrameDiv").hide();
				}
				else if(path[0]=="viewAllTickets"){
					getAllTickets();
					$("#viewAllTicketsDiv").show();
					$("#dashboardContent").hide();
					$("#contentFrameDiv").hide();
					setTitleRoadmap("","");
				}else{
					
				}
			}else{
				
			}
		}

		else if(getHash[0]=="http://www.arvindbrands.com/"){
			window.open('http://www.arvindbrands.com/', '_blank');
		}
		else{
			if(getUrl.search("logout") != -1){
				window.location=getUrl;
			}
		}
	}
}
function callBpmIndex(){
	sap.ui.localResources("page");
	var view = sap.ui.view({viewName:"page.bpminbox.index", type:sap.ui.core.mvc.ViewType.JS});
	view.placeAt("bpmFrameDiv","only");
}
function getAllTickets(){
	
	sap.ui.localResources("ticket");
	if(isVendor=="true"){
	var view = sap.ui.view({viewName:"ticket.ticketHistory", type:sap.ui.core.mvc.ViewType.JS,viewData: [isVendor, depName, emaild]});
	}
	else{
	var view = sap.ui.view({viewName:"ticket.ticketHistory", type:sap.ui.core.mvc.ViewType.JS,viewData: [isVendor, data.department]});
	}
	view.placeAt("viewAllTicketsDiv","only");
}
function onSearchOfItem(searchedItem){
	var item=searchedItem;
	if(item=="PO Report"){
		dynaUrl=getProjectUrl()+"report/index.html?po";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Report","po");
		window.scrollTo(0,0);
	
	}else if(item=="My Invoice"||item=="Invoice Report"){
		dynaUrl=getProjectUrl()+"report/index.html?invoice";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Report","invoice");
		window.scrollTo(0,0);
	}
	else if(item=="My Order"){
		$("#dashboardContent").show();
		$("#contentFrameDiv").hide();
		$("#pollSection").css("display","none");
//		$("#ratingSection").css("display","none");
		$("#calenderSection").css("display","none");
//		$("#performanceSection").css("display","none");
		$("#orderSection").css("display","block");
	}
	else if(item=="Accounting Line Items"){
		dynaUrl=getProjectUrl()+"report/index.html?credit";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Report","credit");
		window.scrollTo(0,0);
	}
	else if(item=="Ledger Report"){
		dynaUrl=getProjectUrl()+"report/index.html?ledger";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Report","ledger");
		window.scrollTo(0,0);
	}
	else if(item=="OTIF Report"){
		dynaUrl=getProjectUrl()+"report/index.html?otif";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Report","otif");
		window.scrollTo(0,0);
	}
//	else if(item=="Rating Report"){
//		dynaUrl=getProjectUrl()+"report/index.html?rating";
//		$("#dashboardContent").hide();
//		$("#contentFrameDiv").show();
//		$("#contentFrameId").attr("src",dynaUrl);
//		//$("#contentFrameId").height($(".content").height()-70+"px");
//		$("#contentFrameId").height("700px");
//		setTitleRoadmap("Report","rating");
//		window.scrollTo(0,0);
//	}
	else if(item=="Poll Create"){
		dynaUrl=getProjectUrl()+"widget/createPoll.html";
		$("#dashboardContent").hide();
		$("#bpmFrameDiv").hide();
		$("#viewAllTicketsDiv").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Create Poll","createPoll");
		window.scrollTo(0,0);
	}
	else if(item=="Sales Report"){
		dynaUrl=getProjectUrl()+"report/index.html?sales";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Report","sales");
		window.scrollTo(0,0);
	}
	else if(item=="SOH Report"){
		dynaUrl=getProjectUrl()+"report/index.html?soh";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Report","soh");
		window.scrollTo(0,0);
	}
	else if(item=="ASN Report"){
		dynaUrl=getProjectUrl()+"report/index.html?asn";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Report","asn");
		window.scrollTo(0,0);
	}
	else if(item=="GRN Discrepancy Report"){
		dynaUrl=getProjectUrl()+"report/index.html?grndesc";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Report","grndesc");
		window.scrollTo(0,0);
	}
	else if(item=="GRN Report"){
		dynaUrl=getProjectUrl()+"report/index.html?grn";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Report","grn");
		window.scrollTo(0,0);
	}
	else if(item=="My Warehouse"){
		dynaUrl=getProjectUrl()+"page/grnDesFileUp.html";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		//$("#contentFrameId").height($(".content").height()-70+"px");
		$("#contentFrameId").height("700px");
		setTitleRoadmap("Report","grn");
		window.scrollTo(0,0);
	}
	/*else if(item=="Rating & Ranking"){
		$("#dashboardContent").show();
		$("#contentFrameDiv").hide();
		$("#pollSection").css("display","none");
//		$("#ratingSection").css("display","block");
		$("#calenderSection").css("display","none");
//		$("#performanceSection").css("display","none");
		$("#orderSection").css("display","none");
	}*/
	else if(item=="My Poll"){
		$("#dashboardContent").show();
		$("#contentFrameDiv").hide();
		$("#pollSection").css("display","block");
//		$("#ratingSection").css("display","none");
		$("#calenderSection").css("display","none");
//		$("#performanceSection").css("display","none");
		$("#orderSection").css("display","none");
	}
	else if(item=="Calendar"){
		$("#dashboardContent").show();
		$("#contentFrameDiv").hide();
		$("#pollSection").css("display","none");
//		$("#ratingSection").css("display","none");
		$("#calenderSection").css("display","block");
//		$("#performanceSection").css("display","none");
		$("#orderSection").css("display","none");
		
	}
	else if(item=="Payment Schedular") {
		dynaUrl=getProjectUrl()+"page/uploadCSV.html";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("Report","rtv");
		window.scrollTo(0,0);
	}
	else if(item=="RTV Report") {
		dynaUrl=getProjectUrl()+"report/index.html?rtv";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("Report","rtv");
		window.scrollTo(0,0);
	}
	else if(item=="Barcode Report") {
		dynaUrl=getProjectUrl()+"report/index.html?bar";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("Report","barcode");
		window.scrollTo(0,0);
	}
	else if(item=="Barcode Request"){
		dynaUrl=getProjectUrl()+"page/barcode.html";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("barcodeRequest","");
		window.scrollTo(0,0);
		
	}
	else if(item=="Feedback"){
		dynaUrl=getProjectUrl()+"page/feedback.html";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("barcodeRequest","");
		window.scrollTo(0,0);
		
	}
	else if(item=="News/Gallery"){
		dynaUrl=getProjectUrl()+"page/updateurls.html";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("barcodeRequest","");
		window.scrollTo(0,0);
	}
	else if(item=="Vendor Reconciliation"||item=="Finance Reconciliation"){
		if(JSON.parse(isVendor)){
		dynaUrl=getProjectUrl()+"recon.html?vendor";
		}
		else{
			dynaUrl=getProjectUrl()+"recon.html?finance";
		}
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("barcodeRequest","");
		window.scrollTo(0,0);
	}
	else if(item=="Raise Ticket"){
		dynaUrl=getProjectUrl()+"ticketindex.html";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("barcodeRequest","");
		window.scrollTo(0,0);
	}
	else if(item=="User Manual"){
		dynaUrl=getProjectUrl()+"manual/manual.html";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("barcodeRequest","");
		window.scrollTo(0,0);
	}
	else if(item=="ASN Request"){
		dynaUrl=getProjectUrl()+"page/asn.html";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("barcodeRequest","");
		window.scrollTo(0,0);
	}
	else if(item=="Payment Voucher"){
		dynaUrl=getProjectUrl()+"page/payment.html";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("paymentVocher","");
		window.scrollTo(0,0);
	}
	else if(item=="GRN Discrepancy Upload"){
		dynaUrl=getProjectUrl()+"page/grnDesFileUp.html";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("GRN Discrepancy Upload","");
		window.scrollTo(0,0);
	}
	else if(item=="GRN Discrepancy Returns Report"){
		dynaUrl=getProjectUrl()+"report/index.html?descReturns";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("descReturns","");
		window.scrollTo(0,0);
		
	}
	else if(item=="Blacklist Vendor"){
		dynaUrl=getProjectUrl()+"page/blackList.html";
		$("#dashboardContent").hide();
		$("#contentFrameDiv").show();
		$("#contentFrameId").attr("src",dynaUrl);
		$("#contentFrameId").height("700px");
		//$("#contentFrameId").height($(".content").height()-70+"px");
		setTitleRoadmap("blackList","");
		window.scrollTo(0,0);
	}
}



$(document).ready(function() {
	sRoutingPath(window.location.href);
	getLoggedInUser();
	//getAutoComplete();
	//$(".draggable" ).draggable({
      //connectToSortable: "#sortable",
     // helper: "clone",
      //revert: "invalid"
	//});
});

$(function() {
	$(document).on("click", 'a', function(evt) {
		evt.preventDefault();
		sRoutingPath(this.href);
	});
	$(document).on("ready","PollDay",function(evt){
		$("#PollDay").load("widget/showpoll.html");
	});
//	$(document).on("ready","myOrd",function(evt){
//		$("#myOrd").load("widget/myshipment.html");
//	});
	$(document).on("ready","MyPerf",function(evt){
		$("#MyPerf").load("widget/myorder.html");
	});
	
	  });
function onClickLink(departmentName){
	depName=departmentName.split("_")[0];
}

function getAutoComplete(loggedInData) {
    var availableTags = "";
    var tempAccess = loggedInData.roles;
	var aAccess=[];
	for(i in tempAccess){
		aAccess.push(tempAccess[i].roleUniqName);
	}
	var sAccess = aAccess.join();
	var autoCompleteArray=[];
	autoCompleteArray.push("User Manual");
	if(sAccess.match("VP_REP_")){
	if(sAccess.match("VP_REP_ASN")){
		autoCompleteArray.push("ASN Report");
	}
	if(sAccess.match("VP_REP_BAR")){
		autoCompleteArray.push("Barcode Report");
	}
	if(sAccess.match("VP_REP_GRN")){
		autoCompleteArray.push("GRN Report");
	}
	if(sAccess.match("VP_REP_OTIF")){
		autoCompleteArray.push("OTIF Report");
	}
	if(sAccess.match("VP_REP_RTV")){
		autoCompleteArray.push("RTV Report");
	}
	if(sAccess.match("VP_REP_SAL")){
		autoCompleteArray.push("Sales Report");
	}
	if(sAccess.match("VP_REP_SOH")){
		autoCompleteArray.push("SOH Report");
	}
	if(sAccess.match("VP_REP_INV")){
		autoCompleteArray.push("Invoice Report");
	}
	if(sAccess.match("VP_REP_LED")){
		autoCompleteArray.push("Ledger Report");
	}
	if(sAccess.match("VP_REP_CRED")){
		autoCompleteArray.push("Accounting Line Items");
	}
	if(sAccess.match("VP_REP_PO")){
		autoCompleteArray.push("PO Report");
	}
	if(sAccess.match("VP_REP_RETDESC_GRN")){
		autoCompleteArray.push("GRN Discrepancy Returns Report");
	}
	if(sAccess.match("VP_REP_DESC_GRN")){
		autoCompleteArray.push("GRN Discrepancy Report");
	}
		}
	if(sAccess.match("VP_ASN")){
		autoCompleteArray.push("ASN Request");
	}
	if(sAccess.match("VP_BAR")){
		autoCompleteArray.push("Barcode Request");
	}
	if(sAccess.match("VP_PAY")){
		autoCompleteArray.push("Payment Voucher");
	}
	//Widgets Roles --Start
//	if(aAccess.match("VP_TRAN")){
//		autoCompleteArray.push("Calendar");
//	}
//	if(aAccess.match("VP_DAILY_POLL")){
//		autoCompleteArray.push("My Poll");
//	}
//	if(aAccess.match("VP_ORDER")){
//		autoCompleteArray.push("My Order");
//	}
//	if(aAccess.match("VP_OTIF")){
//		autoCompleteArray.push("My OTIF");
//	}
	
//	---End----
	
	if(sAccess.match("VP_RECO")){
		autoCompleteArray.push("Vendor Reconciliation");
	}
	if(sAccess.match("VP_NEWSGAL")){
		autoCompleteArray.push("News/Gallery");
	}
	if(sAccess.match("VP_REQUEST_TICKET")){
		autoCompleteArray.push("Raise Ticket");
	}
	if(sAccess.match("VP_FEEDBACK")){
		autoCompleteArray.push("Feedback");
	}
	if(sAccess.match("VP_ALBL_RECO")){
		autoCompleteArray.push("Finance Reconciliation");
	}
	if(sAccess.match("VP_POLL_CREATE")){
		autoCompleteArray.push("Poll Create");
	}
	if(sAccess.match("VP_UPL_RETDESC_GRN")){
		autoCompleteArray.push("GRN Discrepancy Upload");
	}
	if(sAccess.match("VP_CREATE_TRAN")){
		autoCompleteArray.push("Payment Schedular");
	}
	if(sAccess.match("VP_BLACKLIST")){
		autoCompleteArray.push("Blacklist Vendor");
	}
	
	
	
    /*var sourcingScreens=[
         	"Blacklist Vendor",
         	"Calendar",
         	"RTV Report",
         	"ASN Report",
         	"Barcode Report",
         	"Credit Debit Report",
         	"GRN Discrepancy Report",
         	"GRN Report",
         	"Invoice Report",
         	"Ledger Report",
         	"OTIF Report",
         	"PO Report",
         	//"Rating Report",
         	"Sales Report",
         	"SOH Report",
         	"GRN Discrepancy Returns Report"];


         var wareHouseScreens=["ASN Report",
         	"GRN Report",
         	"GRN Discrepancy Returns Report",
         	"Invoice Report",
         	"My Warehouse"];
         var barCodeScreens=["Barcode Report"];
         var cseScreens=[
	         	"Poll Create",
	         	"Calendar",
	         	"Blacklist Vendor",
	         	"GRN Report",
	         	"OTIF Report",
	         	"Sales Report",
	         	"SOH Report",
	         	"ASN Report",
	         	"RTV Report",
	         	"PO Report",
	         	//"Rating Report",
	         	"Barcode Report",
	         	"Credit Debit Report",
	         	"GRN Discrepancy Report",
	         	"GRN Discrepancy Returns Report",
	         	"Invoice Report",
	         	"Ledger Report",
	         	//"Video",
	         	//"FAQ",
	         	"User Manual",
	         	"Feedback",
	         	"News/Gallery"];
         var financeScreens=[
	         	"Payment Schedular",
	         	"Blacklist Vendor",
	         	"Payment Voucher",
	         	"Credit Debit Report",
	         	"Invoice Report",
	         	"Ledger Report",
	         	"Finance Reconciliation",
	         	"GRN Discrepancy Report"];
                     
         var vendorScreens=[
	            "ASN Report",
	            "Ledger Report",
	            "RTV Report",
	            "Credit Debit Report",
	            "Barcode Report",
	            "Payment Voucher",
	            "PO Report",
	            "GRN Discrepancy Report",
	            "GRN Discrepancy Returns Report",
	            "GRN Report",
	            "OTIF Report",
	            //"Rating Report",
	            "Calendar",
	            "Sales Report",
	         	"SOH Report",
	         	"Invoice Report",
	         	"Vendor Reconciliation",
	         	"ASN Request",
	         	"Barcode Request",
	         	"My Poll",
	         	//"Video",
	         	//"FAQ",
	         	"Raise Ticket",
	         	"User Manual"];
                     
            if(data.department=="SOURCING"){
            	availableTags=sourcingScreens;
            }
            else if(data.department=="FINANCE"){
            	availableTags=financeScreens;
            }
            else if(data.department=="WAREHOUSE"){
            	availableTags=wareHouseScreens;
            }
            else if(data.department=="CSE"){
            	availableTags=cseScreens;
            }
            else if(data.department=="BARCODE"||data.department=="BARCOD"){
            	availableTags=barCodeScreens;
            }
            else{
            	availableTags=vendorScreens;
            }*/
       
    $( "#tags" ).autocomplete({source: autoCompleteArray,
        select: function( event, ui ) {
            onSearchOfItem(ui.item.value);
            console.log(document.getElementById("tags").value);
        }
    });
    $("#ui-id-1").addClass("menuItemCss");
  }
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
function pleaseCloseMe(){
	$( '.modal' ).modal( 'hide' ).data( 'bs.modal', null );
}
function pleaseNotyMe(msg,msgType,elem){
	if(elem){
		$("#"+elem).notify(msg,{position:"right",autoHide:true,autoHideDelay:10000,className:msgType});
	}else{
		$.notify(msg,{position:"t c",autoHide:true,autoHideDelay:10000,className:msgType});
	}
	$(".notifyjs-corner").css("left","18%");
	$(".notifyjs-corner").css("right","18%");
}
function clear(){
	localStorage.setItem("savedPass", "");
	localStorage.setItem("savedUser", "");
}