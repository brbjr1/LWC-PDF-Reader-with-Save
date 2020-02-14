@isTest 
private class lwcpdfReaderWithSaveControllerTest {

	@isTest
	private static void fetchVFPDFOutputtest() {

		Test.startTest();

		String test1 = lwcpdfReaderWithSaveController.fetchVFPDFOutput('/');

		Test.stopTest();

		System.assert(test1 != '');
		System.assert(String.isNotBlank(test1));

	}

	@isTest
	private static void getSaveNameFromRecordFieldtest() {
		Account a1 = new Account(Name = 'Test');
		insert a1;

		Test.startTest();

		String test1 = lwcpdfReaderWithSaveController.getSaveNameFromRecordField(a1.Id, 'Name');

		Test.stopTest();

		System.assert(test1 != '');
		System.assert(String.isNotBlank(test1));
		System.assertEquals('Test', test1);
	}


	@isTest
	private static void saveToSalesforcetest() {

		Account a1 = new Account(Name = 'Test');
		insert a1;

		Test.startTest();

		String test1 = lwcpdfReaderWithSaveController.saveToSalesforce('tset', a1.Id, 'test.txt');

		Test.stopTest();

		System.assert(test1 == '');
		System.assert(String.isBlank(test1));

	}
}