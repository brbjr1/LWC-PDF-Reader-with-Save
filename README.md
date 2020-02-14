Description: This Salesforce LWC component allows you to create an action button on a record that provides the ability to preview a PDF document with save functionality.

![alt text](https://github.com/brbjr1/LWC-PDF-Reader-with-Save/raw/master/images/sample-animation.gif "")

Github: https://github.com/brbjr1/LWC-PDF-Reader-with-Save

Deployment instructions: 
1. Install package 
  -	Production: https://login.salesforce.com/packagingSetupUI/ipLanding.app?apvId=04t6g000006xy8CAAQ 
  -	Sandbox: https://test.salesforce.com/packagingSetupUI/ipLanding.app?apvId=04t6g000006xy8CAAQ 

2. Create a visualforce page to generate the PDF document. 
  -	Example: 
    - Name: AccountReport 
    - Code: 

```html
<apex:page standardcontroller="Account"
           title="Test Account Report"
           lightningstylesheets="false"
           renderAs="pdf"
           applybodytag="false">
    <!--applybodytag="false" is used to make sure that styles are correctly applied to the generated pdf-->
    <!--standardcontroller="Account" allows getting data from the account object without writing a class-->       
    <head>
        <style type="text/css">
            .rpt * {
                padding: 0;
                margin: 0;
                -webkit-box-shadow: none;
                -ms-box-shadow: none;
                box-shadow: none;
            }
            .rpt-page {
                font: 9pt 'Open Sans', Arial, sans-serif;
                line-height: 1.4em;
            }
            .rpt-page-header {
                overflow: auto;
            }
            .rpt-page-header .rpt-header {
                    width: auto;
                    margin: 0;
            }
            .rpt-page {
                width: 7.4in;
                overflow: hidden;
                margin: .5in;
            }
        </style>
    </head>

    <body>
        <div class="rpt">
            <div class="rpt-page">
                <div class="rpt-header">
                    My Test Report
                </div>

                <table>
                    <tbody>
                        <tr>
                            <td>Name:</td>
                            <td>
                                <apex:outputText value="{!Account.Name}"/>
                                
                            </td>
                        </tr>
                        <tr>
                            <td>Create Date:</td>
                            <td>
                                <apex:outputText value="{0, date, MM'/'dd'/'yyyy}">
                                    <apex:param value="{!Account.CreatedDate}" />
                                </apex:outputtext>
                            </td>
                        </tr>
                    </tbody>
                </table>

            <!--End rpt-page-->
            </div>
        <!--End rpt-->
        </div>
    </body>
</apex:page>
```
3. Create a Lightning Component (aura component, at the time of this writing quick actions are not possible to create on LWC). 
  - Open the Salesforce development console and click on File => New => Lightning Component  
  ![alt text](https://github.com/brbjr1/LWC-PDF-Reader-with-Save/raw/master/images/Picture1.png "")
  - Enter a name (this is going to be used by our record action button) 
  - Check Lightning Record Page and Lightning Quick Action 
  ![alt text](https://github.com/brbjr1/LWC-PDF-Reader-with-Save/raw/master/images/Picture2.png "")
  - Update the Component markup to: 

```html
<aura:component implements="force:lightningQuickActionWithoutHeader,force:hasRecordId">
	<aura:handler name="init" value="{!this}" action="{!c.doInit}"/>
	<c:lwcpdfReaderWithSave aura:id="my-viewer" onclose="{!c.handleClose}" showConsoleLogs="false" recordId="{!v.recordId}" />
	<aura:attribute name="isLoading" type="Boolean" default="true" />
	<aura:if isTrue="{!v.isLoading}">
		<div>
			<lightning:spinner alternativeText="Loading" size="small" />
		</div>
	</aura:if> 
</aura:component>
``` 
![alt text](https://github.com/brbjr1/LWC-PDF-Reader-with-Save/raw/master/images/Picture3.png "")

4. Update the Controller (Modify line “myviewer.doOpen({'documentsaveFormulaField':'','documentsaveName':'Document.pdf','VFReportPageName':'AccountReport','modalTitle':'Account Report'});” for your report) 
  -	Configuration Options: 
    -	documentsaveFormulaField: this is used to dynamically create a name for the save report. The report name is queried from the record you are generating the report from. The value you enter needs to be the field API name on the object you are saving the report to. Example on our account report if I enter Name the saved file name will be the accounts name or you could create a formula field on account that equals the Name plus todays date. (enter a blank value to disable)
    -	documentsaveName: Enter a static name to save the document as. (enter a blank value if using documentsaveFormulaField) 
    -	VFReportPageName: enter the name of the visualforce page that generates the pdf. 
    -	modalTitle: enter the name that displays on the top of the preview modal. 

```html    
({
	doInit : function(component, event, helper) {
        window.setTimeout(
            $A.getCallback(function() {
				let myviewer = component.find("my-viewer");
				myviewer.doOpen({'documentsaveFormulaField':'','documentsaveName':'Document.pdf','VFReportPageName':'AccountReport','modalTitle':'Account Report'});
				component.set("v.isLoading", false);
			}), 0
        );
    },
	handleClose : function(component, event, helper) {
		$A.get("e.force:closeQuickAction").fire();  
	}

})

```
![alt text](https://github.com/brbjr1/LWC-PDF-Reader-with-Save/raw/master/images/Picture4.png "")
 
4. Create an action button on the target object and add the button to the target page layout 
 ![alt text](https://github.com/brbjr1/LWC-PDF-Reader-with-Save/raw/master/images/Picture5.png "")
 ![alt text](https://github.com/brbjr1/LWC-PDF-Reader-with-Save/raw/master/images/Picture6.png "")
 ![alt text](https://github.com/brbjr1/LWC-PDF-Reader-with-Save/raw/master/images/Picture7.png "")
 
 

5. Test 

