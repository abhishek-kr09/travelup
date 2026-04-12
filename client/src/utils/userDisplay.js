export function getUserDisplayName(user) {
  if (!user) return "User";

  const firstName = typeof user.firstName === "string" ? user.firstName.trim() : "";
  const lastName = typeof user.lastName === "string" ? user.lastName.trim() : "";

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;

  if (typeof user.username === "string" && user.username.trim()) return user.username.trim();
  if (typeof user.email === "string" && user.email.includes("@")) return user.email.split("@")[0];

  return "User";
}

export function getUserInitial(user) {
  const name = getUserDisplayName(user);
  return name.charAt(0).toUpperCase();
}
