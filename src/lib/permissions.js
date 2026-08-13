export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export function can(action) {
  return currentUser().permissions?.actions?.[action] === true;
}
