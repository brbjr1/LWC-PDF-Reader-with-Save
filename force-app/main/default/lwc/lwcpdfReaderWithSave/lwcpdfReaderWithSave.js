/*
Author: Bruce Behrens
Date: 2-2020
Info: This component allows you to create an action button on a Salesforce record that provides the ability to preview a PDF document with save functionality.
*/
import { LightningElement, track, api } from "lwc";
import fetchPDF from "@salesforce/apex/lwcpdfReaderWithSaveController.fetchVFPDFOutput";
import savePDF from "@salesforce/apex/lwcpdfReaderWithSaveController.saveToSalesforce";
import getSaveNameFromRecordField from "@salesforce/apex/lwcpdfReaderWithSaveController.getSaveNameFromRecordField";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import sresource from "@salesforce/resourceUrl/pdfjs";
import { loadStyle } from "lightning/platformResourceLoader";

export default class LwcpdfReaderWithSave extends LightningElement {
  @track myopenModal = false;
  @api get openModal() {
    return this.myopenModal;
  }
  set openModal(value) {
    this.myopenModal = value;
    if (this.myopenModal === false) {
      this.dispatchEvent(
        new CustomEvent("close", {
          composed: true,
          bubbles: true,
          cancelable: true,
          detail: {}
        })
      );
    }
  }
  @track pdfData;
  @track vfpageURL;
  @track showLoadingSpinner = false;
  @api recordId;
  @api showConsoleLogs = false;
  @track viewerUrl;
  @api documentsaveName = "Document";
  @api documentsaveExt = ".pdf";
  @api VFReportPageName;
  @api modalTitle = "Reports";
  hasInitialized = false;

  @api doOpen(payload) {
    let myevent = { detail: { payload: payload } };

    this.handleLoad(myevent);
  }

  renderedCallback() {
    if (this.hasInitialized) {
      return;
    }
    this.hasInitialized = true;

    loadStyle(this, sresource + "/custom1.css");
    this.viewerUrl = sresource + "/web/viewer.html?file=Document.pdf";
    if (this.showConsoleLogs) {
      console.log({
        log: "renderedCallback",
        viewerUrl: this.viewerUrl
      });
    }
  }

  get modalClass() {
    return this.openModal
      ? "slds-modal slds-modal_large slds-fade-in-open"
      : "slds-modal slds-modal_large";
  }

  onLoad() {
    let myiframe = this.template.querySelector("iframe");
    if (myiframe) {
      myiframe.contentWindow.postMessage(this.pdfData, "*");
    }
  }

  handleSave() {
    this.showLoadingSpinner = true;
    let filesavenam = this.documentsaveName
      ? this.documentsaveName
      : "Document.pdf";
    if (!filesavenam.endsWith(this.documentsaveExt)) {
      filesavenam += this.documentsaveExt;
    }
    let saveparms = {
      data: this.pdfData,
      parentId: this.recordId,
      filename: filesavenam
    };
    if (this.showConsoleLogs) {
      console.log({
        log: "handleSave",
        saveparms: saveparms
      });
    }
    savePDF(saveparms)
      .then(() => {
        eval("$A.get('e.force:refreshView').fire();");
        this.showNotification(
          "Success",
          "Document successfully saved",
          "success"
        );
        this.closeModal();
      })
      .catch(error => {
        this.showLoadingSpinner = false;
        if (this.showConsoleLogs) {
          console.log(error);
        }
        let myerror =
          "Error saving document. Details:" +
          (error.message
            ? error.message
            : error.body.message
            ? error.body.message
            : error);
        this.showNotification("Error", myerror, "error");
      });
  }

  handleLoad(event) {
    let payload = event.detail.payload;
    this.showLoadingSpinner = true;
    if (this.showConsoleLogs) {
      console.log({
        log: "handleLoad",
        payload: payload ? JSON.stringify(payload) : ""
      });
    }

    let getsavename = false;
    if (payload) {
      if (
        payload.hasOwnProperty("documentsaveName") &&
        payload.documentsaveName !== ""
      ) {
        this.documentsaveName = payload.documentsaveName;
        this.viewerUrl = sresource + "/web/viewer.html?file=" + this.documentsaveName;
      }
      if (
        payload.hasOwnProperty("VFReportPageName") &&
        payload.VFReportPageName !== ""
      ) {
        this.VFReportPageName = payload.VFReportPageName;
      }
      if (payload.hasOwnProperty("modalTitle") && payload.modalTitle !== "") {
        this.modalTitle = payload.modalTitle;
      }
      if (
        payload.hasOwnProperty("documentsaveFormulaField") &&
        payload.documentsaveFormulaField !== ""
      ) {
        getsavename = true;
        getSaveNameFromRecordField({
          recordId: this.recordId,
          fieldAPIName: payload.documentsaveFormulaField
        })
          .then(result => {
            if (this.showConsoleLogs) {
              console.log({
                log: "getSaveNameFromRecordField",
                result: result
              });
            }
            this.documentsaveName = result;
            this.viewerUrl = sresource + "/web/viewer.html?file=" + this.documentsaveName;
            this.handleLoad2();
          })
          .catch(error => {
            this.showLoadingSpinner = false;
            let myerror =
              "Error getting document save name. Details:" +
              (error.message
                ? error.message
                : error.body.message
                ? error.body.message
                : error);
            this.showNotification("Error", myerror, "error");
            this.closeModal();
          });
      }
    }

    if (getsavename === false) {
      this.handleLoad2();
    }
  }

  handleLoad2() {
    if (this.VFReportPageName && this.VFReportPageName != "") {
      this.vfpageURL =
        "/apex/" + this.VFReportPageName + "?Id=" + this.recordId;
      if (this.showConsoleLogs) {
        console.log({
          log: "handleLoad2",
          vfpageURL: this.vfpageURL,
          VFReportPageName: this.VFReportPageName
        });
      }

      this.pdfData = undefined;
      fetchPDF({
        vfpageURL: this.vfpageURL
      })
        .then(result => {
          this.openModal = true;
          this.pdfData = result;
          this.showLoadingSpinner = false;
          this.onLoad();
        })
        .catch(error => {
          this.showLoadingSpinner = false;
          let myerror =
            "Error getting document. Details:" +
            (error.message
              ? error.message
              : error.body.message
              ? error.body.message
              : error);
          this.showNotification("Error", myerror, "error");
          this.closeModal();
        });
    } else {
      this.showLoadingSpinner = false;
      this.showNotification(
        "Error",
        "Error VFReportPageName not defined",
        "error"
      );
      this.closeModal();
    }
  }

  closeModal() {
    this.openModal = false;
    this.showLoadingSpinner = false;
  }

  showNotification(t, m, v) {
    if (this.showConsoleLogs) {
      console.log({
        log: "showNotification",
        title: t,
        message: m,
        variant: v
      });
    }

    const evt = new ShowToastEvent({
      title: t,
      message: m,
      variant: v
    });
    this.dispatchEvent(evt);
  }
}
