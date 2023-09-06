/*----------------------------------------------------------------*/
/*                                                                */
/*   Utilities.js - javascript functions for the                  */
/*                  One-Click Install trigger sample page         */
/*                                                                */
/*   Copyright © 2001-2002 InstallShield Software Corporation     */
/*                                                                */
/*----------------------------------------------------------------*/

/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */
/* The following are helper  functions to check browser and   */
/* OS requirements, to display error messages, get the Setup  */
/* URL, and check JAVA versions                               */
/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */

var SETUP_FINISHED                   =      1;
var SETUP_ERR_GENERAL                =  -5001;
var SETUP_ERR_LOADMEDIA              =  -5002;
var SETUP_ERR_INSTALLKERNEL          =  -5003;
var SETUP_ERR_STARTKERNEL            =  -5004;
var SETUP_ERR_OPENCAB                =  -5005;
var SETUP_ERR_INSTALLSUPPORT         =  -5006;
var SETUP_ERR_SETTEXTSUB             =  -5007;
var SETUP_ERR_INITINFO               =  -5008;
var SETUP_ERR_GETSETUPDRIVER         =  -5009;
var SETUP_ERR_INITPROPERTIES         =  -5010;
var SETUP_ERR_RUNINSTALL             =  -5011;
var SETUP_ERR_UNINSTALLSUPPORT       =  -5012;
var SETUP_ERR_EXTRACTBOOT            =  -5013;
var SETUP_ERR_DOWNLOADFILE           =  -5014;
var SETUP_ERR_CANCELLED              =  -5015;



function getSetupURL() {
    //  To support relative paths 
    var strWebPageURL = new String(window.location.href);  
    var nFwd = strWebPageURL.lastIndexOf("/");      
    var nBck = strWebPageURL.lastIndexOf("\\");
    var nLast  = (nFwd > nBck) ? nFwd:nBck; 
    var strSetupURL = strWebPageURL.substring(0, nLast);
    
    return strSetupURL;
}

function chkJava()
{
    for (i=0; i < navigator.plugins.length; i++)
    {
	var vPlugin = navigator.plugins[i];
	var vMimeType;
        for (j = 0; j < vPlugin.length; j++)
        {
            vMimeType = vPlugin[j];
            if(vMimeType)
            {
                //alert(vMimeType.type);
                if(vMimeType.type == "application/x-java-vm")
                {
                    //alert("You are running Netscape with Java Plugin - OK");
                    return;
                }
            }   
        }
    }
    alert("You must install and enable Java to run this installation.");
}
                    
function chkBrowser() {
    var agt=navigator.userAgent.toLowerCase(); 
    var is_major = parseInt(navigator.appVersion); 
    var is_minor = parseFloat(navigator.appVersion);
    var is_win32 = (agt.indexOf("win95")!=-1) || (agt.indexOf("windows 95")!=-1) ||
    (agt.indexOf("win98")!=-1) || (agt.indexOf("windows 98")!=-1) ||
    (agt.indexOf("winnt")!=-1) || (agt.indexOf("windows nt")!=-1) ||
    ((is_major >= 4) && (navigator.platform == "Win32")) ||
    (agt.indexOf("win32")!=-1) || (agt.indexOf("32bit")!=-1);
    
    result = 'needBrwsr';
    
    if (is_win32 == false) return 'needOS';
    
    if (agt.indexOf("msie") != -1) 
        if (is_major < 4) return 'needBrwsr';
        else if (is_major >= 4) return 'ie4up';
    
    // Note: Opera and WebTV spoof Navigator.  
    var is_nav  = ((agt.indexOf('mozilla')!=-1) && (agt.indexOf('spoofer')==-1) 
                && (agt.indexOf('compatible') == -1) && (agt.indexOf('opera')==-1) 
                && (agt.indexOf('webtv')==-1)); 
                
    if (is_nav == true)
        if  (is_minor >= 5.00)
        {
                chkJava();
                return 'nav600up';
        }
        if  (is_minor >= 4.06)
                return 'nav406up';

    return result;
}

/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */
/* Assists developers/end users with setup difficulties */
/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */
function iHelp(strObject, strMethod, nErrNum) {
    if (strObject == "document")
        strErrMsg = 'The Setup Player cannot be referenced from this Web page.  Check the syntax of your ' + strMethod + ' tag.';
    else { // Only player errors left at this point
        if (strMethod == "init") {
            if (nErrNum == ERR_CONTROL_LOAD) 
                strErrMsg = 'Setup cannot run from this Web page.  Verify you have the correct browser security settings, click Refresh, and select Yes when asked to install the InstallShield Wizard.';
            else {
                if (nErrNum == ERR_APPLET_PERMISSIONS)
                    strErrMsg = 'Setup cannot run from this Web page.  Click Reload and select Grant on the Java Security dialog.';
                else {
                    if (nErrNum == ERR_HTTP_VER)
                        strErrMsg = 'Setup cannot run from this Web page.  Either the web server you are connecting to or the proxy server you are connecting through is not HTTP 1.1 compliant.';
                    else
                        strErrMsg = 'Unable to initialize the setup.  Error code ' + nErrNum;
                }
            }
        }
        else 
            strErrMsg = 'Unable to open the setup.  Error code ' + nErrNum;
    }
    
    // display error on the Web page
    writeText("txtMsg", strErrMsg);
}

/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */
/* Used to replace static text on page             */
/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */
function writeText(id, str) {
    if (document.getElementById)
        document.getElementById(id).innerHTML = str;
    
    else if (document.all)
        document.all[id].innerHTML = str;
}