export async function registerAdmin(formData) {
  try {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    const res = await fetch("/api/admins/register", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Unknown error");

    return result;
  } catch (err) {
    console.error("Registration failed:", err);
    throw err;
  }
}
