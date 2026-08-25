import { useEffect } from "react";

const examples = [
  [/group name|company name/i, "Sunrise Polymers Pvt. Ltd."],
  [/\bpan\b/i, "ABCDE1234F"],
  [/gst slab/i, "18%"],
  [/gst|gstin/i, "27ABCDE1234F1Z5"],
  [/contact.*name|primary contact/i, "Rahul Sharma"],
  [/designation/i, "Purchase Manager"],
  [/phone|mobile|contact number/i, "9876543210"],
  [/email/i, "rahul@company.com"],
  [/address/i, "Plot 12, MIDC Industrial Area"],
  [/city|district/i, "Mumbai"],
  [/state/i, "Maharashtra"],
  [/country/i, "India"],
  [/pincode|postal/i, "400001"],
  [/warehouse.*name/i, "Bhiwandi Warehouse"],
  [/parent location|location/i, "Bhiwandi, Maharashtra"],
  [/group tag|supplier tag/i, "Priority Account"],
  [/reference/i, "IndiaMART Referral"],
  [/lead manager|collection owner/i, "Rahul Sharma"],
  [/monthly consumption/i, "10000"],
  [/credit interest/i, "Interested in 30-day credit"],
  [/order status/i, "Prospect"],
  [/product category|category/i, "Polymer Granules"],
  [/grade/i, "HDPE 5502"],
  [/quantity|volume|weight/i, "10000"],
  [/price|rate|freight|cost|amount|value|margin|charge/i, "125.50"],
  [/credit days/i, "30"],
  [/payment terms/i, "30 days from invoice"],
  [/invoice number/i, "INV-2026-001"],
  [/order reference|order id/i, "ORD-2026-001"],
  [/payment reference|bank reference/i, "UTR123456789"],
  [/route|lane/i, "Mumbai to Pune"],
  [/website|url/i, "https://example.com"],
  [/remarks|remark|notes|description|message|reason/i, "Buyer requested delivery before month-end"],
  [/search/i, "Search by name, ID or status"],
];

function fieldLabel(field) {
  const label = field.closest("label");
  const heading = label?.querySelector(":scope > span, :scope > small, :scope > b");
  return `${heading?.textContent || label?.textContent || ""} ${field.name || ""}`.replace(/\s+/g, " ").trim();
}

function exampleFor(field) {
  const type = field.type;
  const text = fieldLabel(field);
  const match = examples.find(([pattern]) => pattern.test(text));
  if (match) return match[1];
  if (type === "number") return "100";
  if (type === "email") return "name@company.com";
  if (type === "url") return "https://example.com";
  if (field.tagName === "TEXTAREA") return "Add relevant details here";
  return "Sample details";
}

function assist(root = document) {
  root.querySelectorAll('input:not([type="hidden"]):not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="date"]):not([type="time"]):not([type="datetime-local"]), textarea').forEach(field => {
    if (!field.placeholder) field.placeholder = exampleFor(field);
  });
}

export default function FormAssist() {
  useEffect(() => {
    assist();
    const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) assist(node.matches?.("input, textarea") ? node.parentElement : node);
    })));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
