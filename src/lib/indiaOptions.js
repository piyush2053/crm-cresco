export const INDIAN_STATES_AND_UTS = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const STATE_OPTIONS = INDIAN_STATES_AND_UTS.map(value => ({ value, label: value }));
export const GST_SLAB_OPTIONS = ["0-40 Lakh", "40 Lakh-1.5 Cr", "1.5-5 Cr", "5-25 Cr", "25-100 Cr", "100-500 Cr", "500 Cr and above"].map(value => ({ value, label: value }));
