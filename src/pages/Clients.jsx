import CrudPage from "../components/CrudPage";

export default function Clients() {
  return <CrudPage title="Clients" heading="All Clients" description="Manage client, GST and contact information." endpoint="/clients" actionLabel="Add Client" columns={[{ key: "company_name", label: "Company" }, { key: "gst_number", label: "GST" }, { key: "contact_name", label: "Contact" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }]} fields={[{ key: "company_name", label: "Company name", required: true }, { key: "gst_number", label: "GST number" }, { key: "contact_name", label: "Contact name" }, { key: "email", label: "Email", type: "email" }, { key: "phone", label: "Phone" }, { key: "country", label: "Country" }, { key: "currency", label: "Currency" }, { key: "payment_terms", label: "Payment terms" }, { key: "address", label: "Address", full: true }]} />;
}
