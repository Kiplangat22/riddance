const API_BASE_URL = "/api/v1/releases";

async function request(path = "", options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  if (response.status === 204) return undefined;
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "Something went wrong. Please try again.");
  return body.data;
}

export const releaseApi = {
  list: () => request(),
  create: (input) => request("", { method: "POST", body: JSON.stringify(input) }),
  update: (id, input) => request(`/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (id) => request(`/${id}`, { method: "DELETE" }),
};
