import { LoginCredentials, User } from "../lib/auth";

export async function login(credentials: LoginCredentials): Promise<{
  access_token: string;
  user_id: string;
}> {
  const formData = new FormData();
  formData.append("username", credentials.username);
  formData.append("password", credentials.password);

  const res = await fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login failed");
  }

  const data = await res.json();
  return { access_token: data.access_token, user_id: data.user_id };
}
