import { LoginCredentials, RegisterCredentials, User } from "../lib/auth";

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

export async function register(credentials: RegisterCredentials): Promise<{
  message: string;
}> {
  const res = await fetch("http://127.0.0.1:8000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
      email: credentials.email,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Register failed");
  }

  const data = await res.json();
  return { message: "You have registered successfully" };
}


// -----------------------------------------UPLOAD PDF------------------------------------------------------------


// lib/api.tsx

// lib/api.tsx

export async function uploadFile(
  file: File,
  onUploadSuccess?: (fileId: string) => void,
  onError?: (errorMessage: string) => void
) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access_token");
    console.log(token, "token");
    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token || ""}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Upload failed");
    }

    const data = await response.json();
    const fileId = data?.file_id;

    if (fileId) {
      localStorage.setItem("fileId", fileId);
      onUploadSuccess?.(fileId);
    }
  } catch (error: any) {
    onError?.(error.message || "An error occurred during upload");
  }
}

