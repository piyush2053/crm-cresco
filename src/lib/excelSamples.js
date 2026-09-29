// Buyer headings mirror the backend UPLOAD_HEADERS constant in buyers.service.js.
const buyerHeaders = [
  "PAN", "PAN to GST Status", "GST", "status", "errdata", "BUSINESS TYPE",
  "data_basicDetails_aadharVerified", "data_basicDetails_Legal_Name", "data_basicDetails_gstin",
  "data_basicDetails_Ekyc_Flag", "data_basicDetails_compositionRate", "BUSINESS CONSTITUTION",
  "data_basicDetails_tradeNam", "data_basicDetails_aadharVerDate", "data_basicDetails_ctj",
  "data_basicDetails_percentTaxInCash", "data_basicDetails_mandatedeInvoice",
  "data_basicDetails_aggreTurnOverFY", "data_basicDetails_jurisdiction",
  "data_basicDetails_registrationType", "data_basicDetails_aggreTurnOver",
  "data_basicDetails_cancelationDate", "data_basicDetails_businessNature",
  "data_basicDetails_registrationDate", "data_basicDetails_registrationStatus",
  "data_basicDetails_ekycVdt", "data_basicDetails_percentTaxInCashFY",
  "data_basicDetails_einvoiceStatus", "data_basicDetails_memberDetails",
  "data_basicDetails_mobile", "data_basicDetails_email", "data_hsnDetails_goods",
  "data_branchDetails_permanentAdd_address", "data_branchDetails_permanentAdd_dealsIn",
  "data_branchDetails_additionalAdd",
];

const buyerRequiredValues = {
  PAN: "Valid PAN required",
  GST: "GST or GSTIN required",
  status: "Must be SUCCESS",
  data_basicDetails_gstin: "GST or GSTIN required",
  data_branchDetails_permanentAdd_address: "Must resolve to a district",
};

const buyerValues = {
  PAN: "ABCDR1234E",
  "PAN to GST Status": "Active",
  GST: "27ABCDR1234E1Z5",
  status: "SUCCESS",
  "BUSINESS TYPE": "TRD",
  data_basicDetails_Legal_Name: "Example Trading Private Limited",
  data_basicDetails_gstin: "27ABCDR1234E1Z5",
  data_basicDetails_jurisdiction: "State - Maharashtra",
  data_basicDetails_registrationType: "Regular",
  data_basicDetails_registrationStatus: "Active",
  data_basicDetails_memberDetails: "[\"Aarav Mehta\"]",
  data_basicDetails_mobile: "9876543210",
  data_basicDetails_email: "accounts@example.in",
  data_branchDetails_permanentAdd_address: "Unit 12, MIDC Andheri East, Mumbai, Maharashtra - 400093",
  data_branchDetails_permanentAdd_dealsIn: "Trading",
};

export const buyerExcelSample = {
  title: "Buyer Bulk Upload — Sample Excel",
  description: "Use the GST source export format shown below. Keep the header names exactly as displayed.",
  headers: buyerHeaders.map((name) => ({ name, valueRule: buyerRequiredValues[name] })),
  rows: [buyerValues],
  rules: [
    "All 35 column headers are required, even when some cells are blank.",
    "Each row needs a valid PAN, status SUCCESS, and a valid GSTIN in GST or data_basicDetails_gstin; the GSTIN PAN must match.",
    "The permanent address must provide a pincode or address/state that maps unambiguously to an active District Master entry.",
    "Other cell values may be blank unless needed to identify a district; the optional GST column may be blank when data_basicDetails_gstin contains the GSTIN.",
  ],
};

// These are the exact required headings from the backend freight-import service.
export const freightExcelSample = {
  title: "Freight Rates — Sample Excel",
  description: "Enter one freight rate per row. The Excel and CSV importer use the same four headings.",
  headers: [
    { name: "FROM", valueRule: "Required value" },
    { name: "TO", valueRule: "Required value" },
    { name: "LOAD", valueRule: "Positive quantity (KG)" },
    { name: "FREIGHT", valueRule: "Non-negative rate (Rs/Kg)" },
  ],
  rows: [
    { FROM: "DIST-AHMEDABAD-GUJARAT", TO: "DIST-INDORE-MADHYA-P", LOAD: "5000", FREIGHT: "1.25" },
    { FROM: "DIST-AHMEDABAD-GUJARAT", TO: "DIST-INDORE-MADHYA-P", LOAD: "10000", FREIGHT: "1.10" },
  ],
  rules: [
    "All four headings and values are required.",
    "FROM and TO must use an active District Master code or an exact, unique district name.",
    "LOAD must be greater than zero in KG; FREIGHT must be zero or greater in Rs/Kg.",
    "Duplicate FROM + TO + LOAD combinations in one upload are rejected.",
  ],
};
