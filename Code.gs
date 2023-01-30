function getData() {
  var today = new Date();
  var date = convertNewDate(today);
  Logger.log("New Script");
  var ms2 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Master2'); //Master sheet
  var updateDate = ms2.getRange("A1").getValue();
  updateDate = convertNewDate(updateDate);


  if (updateDate != date) {
    updateMaster2(); //Update Master2 Sheet
  }


  var lastRow = ms2.getLastRow();


  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('JobSheet'); //Name of sheet to be updated (Name of new sheet should remain same)
  var lr = ss.getLastRow();


  var lastDate = ss.getRange(lr, 1).getValue();//Date from last row
  lastDate = convertNewDate(lastDate);


  if (lastDate == date) {
    var row = lr; //Same Row
  }
  else {
    var row = lr + 1; //New Row
    ss.getRange(row, 1).setValue(date);
  }


  var lastBoxNum = ss.getLastColumn();


  for (var i = 2; i <= lastRow; i++) {
    var ms2BoxName = ms2.getRange(i, 1).getValue();
    var ms2BoxTime = ms2.getRange(i, 2).getDisplayValue();
    var ms2Range = ms2.getRange(i, 3);
    var ms2RangeVal = ms2Range.getValue();


    if (ms2RangeVal == '') {
      for (var j = 2; j <= lastBoxNum; j++) //job name reading
      {
        var ssBoxName = ss.getRange(1, j).getValue();
        var range = ss.getRange(row, j);
        var boxcomptime = range.getValue();


        if (ssBoxName == ms2BoxName) {
          if (boxcomptime == "") //Run only if time is not updated
          {
            var threads = GmailApp.search("label:sb-alerts " + ssBoxName, 0, 2);
            // var threads = GmailApp.search("label:jaws JAWS Alert: Jobstream "+ ssBoxName +" Complete ", 0, 2);


            {
              if (threads[0] != null) {
                var mailDateTime = threads[0].getLastMessageDate(); ///reads date & time of mail //[0] means latest mail for the date/type
                var mailDate = convertNewDate(mailDateTime);
                if (date == mailDate) {
                  var mailTime = convertTime(mailDateTime);
                  range.setValue(mailTime);
                  ms2Range.setValue(mailTime);
                }
                else {
                  if (threads[1] != null) {
                    var mailDateTime = threads[1].getLastMessageDate(); ///reads date & time of mail //[1] means latest mail for the date/type
                    var mailDate = convertNewDate(mailDateTime);
                    if (date == mailDate) {
                      var mailTime = convertTime(mailDateTime);
                      range.setValue(mailTime);
                      ms2Range.setValue(mailTime);
                    }
                    else {
                      var currentTime = convertTime(today);
                      if (ms2BoxTime != '') {
                        currentTime = changeTimeLen(currentTime);
                        ms2BoxTime = changeTimeLen(ms2BoxTime);
                        if (ms2BoxTime < currentTime) {
                          Logger.log("Send Email " + ms2BoxName);
                          sendEmail(ms2BoxName, ms2BoxTime); //email for late box
                        }
                      }
                    }
                  }
                  else {
                    // sendEmail(ms2BoxName, ms2BoxTime); //email for late box
                    Logger.log("Only one mail found for box " + ssBoxName);
                  }
                }
              }
              else {
                // sendEmail(ms2BoxName, ms2BoxTime); //email for late box                
                Logger.log("No Mails Found for box " + ssBoxName);
              }
            }
          }
          j = lastBoxNum; //Exit if Box found
        }
      }
    }
  }
  return ms2BoxName;
}


function updateMaster2() {


  var ms2 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Master2');
  var today = new Date();
  var date = convertNewDate(today);


  ms2.getRange("A2:Z100").clearContent();
  //  ms2.getRange("A2:Z100").clearFormat();


  ms2.getRange(1, 1).setValue(date); //Update the date in MasterSheet2


  var day = (Utilities.formatDate(today, 'GMT+05:30', 'EEEEEE'));
  var ms = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Master');
  var totalRows = ms.getLastRow(); //Total Rows in master sheet
  var a = 2;


  for (var i = 2; i <= 8; i++) {
    var SheetDay = ms.getRange(1, i).getValue(); //Read Day from Sheet
    if (SheetDay == day) {


      for (var j = 2; j <= totalRows; j++) {
        var BoxRun = ms.getRange(j, i).getValue();
        if (BoxRun == 'Yes') {


          var BoxName = ms.getRange(j, 1).getValue(); //Box Name
          var Benchmark = ms.getRange(j, 9).getDisplayValue(); //Benchmark


          ms2.getRange(a, 1).setValue(BoxName);
          ms2.getRange(a, 2).setValue(Benchmark);
          a++;
        }
      }
      i = 8; //Exit Day loop
    }
  }


  ms2.setFrozenRows(1);
  ms2.sort(2);


}


function sendEmail(ms2BoxName, ms2BoxTime) {
  var ms2BoxName, ms2BoxTime;
  var subject = '';
  var body = '';
  var html = '';
  var to = '';
// Logger.log('Test Email');
//   subject = 'Test Mail - ' + ms2BoxName + ' Box is late';


  to = 'jhanavi.dave.01@gmail.com';
  subject = ms2BoxName + ' Box is late';




  html = 'The <b>' + ms2BoxName + '</b> box is late today. Expected completion time was <b>' + ms2BoxTime + '.</b><br> Please take appropriate action.<br><br>This is an auto generated email.<br><br>Link to sheet- https://docs.google.com/spreadsheets/';


  GmailApp.sendEmail(to, subject, body, { htmlBody: html });
}


function convertNewDate(date) {
  var newDate = (Utilities.formatDate(date, 'GMT+05:30', 'dd/MMM/yyyy'));
  return newDate;
}


function convertTime(time) {
  var newTime = (Utilities.formatDate(time, 'GMT+05:30', 'HH:mm:ss'));
  return newTime;
}


function changeTimeLen(time1) {
  var timeLength = time1.length;
  if (timeLength == 7) {
    time1 = 0 + time1;
  }
  return time1;
}




function onOpen() { //creating menu
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('User Guide')
    .addItem('FAQ', 'link')
    .addToUi();
}


function link() {
  var html = 'https://docs.google.com/document/d/1oGXtewFC0tbVGxm_1wWNL2aeW2pj0VKnC66SUcEDs-k/edit?usp=sharing';
  var xyz = SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput('<html><body><a href="' + html + '" target="_blank" onclick="window.open()">FAQ</a></body></html>'), 'Loading. Please wait...');
}






// Reference
//    Logger.log(Utilities.formatDate(date, 'GMT+05:30', 'EEEEEE dd/MMMM/yyyy hh:mm:ss aaa Z'));
//    Logger.log(Utilities.formatDate(date, 'GMT+05:30', 'dd/MMMM/yyyy'));
