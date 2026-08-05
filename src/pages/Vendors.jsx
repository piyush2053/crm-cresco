import CrudPage from "../components/CrudPage";

export default function Vendors() {
  return <CrudPage title="Vendors" heading="Supplier Directory" description="Manage supplier records and verify vendor details." endpoint="/vendors" actionLabel="Add Vendor" columns={[{ key: "company_name", label: "Company" }, { key: "gst_number", label: "GST" }, { key: "contact_name", label: "Contact" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }]} fields={[{ key: "company_name", label: "Company name", required: true }, { key: "gst_number", label: "GST number" }, { key: "contact_name", label: "Contact name" }, { key: "email", label: "Email", type: "email" }, { key: "phone", label: "Phone" }, { key: "country", label: "Country" }, { key: "currency", label: "Currency" }, { key: "address", label: "Address", full: true }]} />;
}
