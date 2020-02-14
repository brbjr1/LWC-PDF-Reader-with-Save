public with sharing class lwcpdfReaderWithSaveController {
    
    @AuraEnabled
	public static String fetchVFPDFOutput(String vfpageURL) {

		PageReference pdfPage = new PageReference(vfpageURL);
		Blob pageBlob = !Test.isRunningTest() ? pdfPage.getContent() : Blob.valueOf('Some Text for a boring PDF file...');
		return EncodingUtil.Base64Encode(pageBlob);
	}


	@AuraEnabled
	public static String getSaveNameFromRecordField(Id recordId, String fieldAPIName) {
		string result = '';
		if (recordId != null && String.isNotBlank(fieldAPIName)){
			String sobjectName = recordId.getSobjectType().getDescribe().getName();

			List<SObject> records = Database.query('Select '+fieldAPIName+' from '+sobjectName+' WHERE Id = :recordId');
			if (!records.isEmpty()){
				result = String.valueOf(records.get(0).get(fieldAPIName));
			}

		}
		return result;
	}


	@AuraEnabled
	public static String saveToSalesforce(String data, Id parentId, string filename) {

		Blob pdfBlob = EncodingUtil.base64Decode(data);
		if (String.isBlank(filename)) {
			filename = 'Document.pdf';
		}

		String ext = filename.substringAfter('.');
		String title = filename.substring(0, filename.length() - (ext.length() + 1));
		
		ContentVersion ContVerFile = new ContentVersion();
		ContVerFile.VersionData = pdfBlob;
		ContVerFile.Title = title;
		ContVerFile.ContentLocation = 's';
		ContVerFile.PathOnClient = filename;
		insert ContVerFile;

		Id conDoc = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :ContVerFile.Id].ContentDocumentId;
		ContentDocumentLink cDe = new ContentDocumentLink();
		cDe.ContentDocumentId = conDoc;
		cDe.LinkedEntityId = parentId;
		cDe.ShareType = 'I';
		cDe.Visibility = 'AllUsers';
		insert cDe;

		return '';
	}
}
