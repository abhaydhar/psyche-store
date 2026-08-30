/**
 * Google Apps Script - T-Shirt Order Webhook Handler
 *
 * Setup:
 * 1. Open your Google Sheet (or create one named "T-Shirt Orders")
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file into Code.gs
 * 4. Click Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the deployment URL and set it as GOOGLE_SHEETS_WEBHOOK_URL in .env
 *
 * IMPORTANT: After pasting new code, you must create a NEW deployment
 * (not "Manage deployments" > edit). Each code change needs a new deployment URL.
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    // Use the spreadsheet this script is attached to (no ID needed)
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Orders");
    if (!sheet) {
      sheet = ss.insertSheet("Orders");
    }

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Order ID",
        "Order Number",
        "Category",
        "Color",
        "Size",
        "Design Image URL",
        "Mockup URL",
        "Placement X",
        "Placement Y",
        "Scale Width",
        "Scale Height",
        "Rotation",
        "Customer Name",
        "Phone",
        "Address",
        "Status",
        "Timestamp"
      ]);
      sheet.getRange(1, 1, 1, 17).setFontWeight("bold");
    }

    var transform = payload.canvasTransform || {};

    sheet.appendRow([
      payload.orderId || "",
      payload.orderNumber || "",
      payload.category || "",
      payload.color || "",
      payload.size || "",
      payload.designImageUrl || "",
      payload.mockupUrl || "",
      transform.x || 0,
      transform.y || 0,
      transform.width || 0,
      transform.height || 0,
      transform.rotation || 0,
      payload.customerName || "",
      payload.customerPhone || "",
      payload.customerAddress || "",
      payload.status || "",
      payload.timestamp || new Date().toISOString()
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, rows: sheet.getLastRow() })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Orders");
    var rows = sheet ? sheet.getLastRow() : 0;
    return ContentService.createTextOutput(
      JSON.stringify({ status: "T-Shirt Order Webhook is active", sheetName: ss.getName(), orderRows: rows })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "active", error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
