function setFocus() {  
  Logger.log('set focus');
  var js = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('JobSheet');
  var lastRow = js.getLastRow();
  Logger.log('last row ' + lastRow);
  js.getRange(lastRow,1).activate();
  js.getRange(lastRow,1).activateAsCurrentCell();  
}
