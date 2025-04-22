import { LoginCredentials, RegisterCredentials, User } from "../lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";

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

export async function uploadFile(
  file: File,
  onUploadSuccess?: (fileId: string) => void,
  onError?: (errorMessage: string) => void
) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access_token");
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
    const fileId = data?.pdf_id;

    if (fileId) {
      localStorage.setItem("fileId", fileId);
      onUploadSuccess?.(fileId);
    }
  } catch (error: any) {
    onError?.(error.message || "An error occurred during upload");
  }
}

// -----------------------------------------CHAT------------------------------------------------------------
export const getConversationByPdfId = async () => {
  const token = localStorage.getItem("access_token");
  const pdfId = localStorage.getItem("fileId");

  const res = await fetch(`http://127.0.0.1:8000/conversations?pdf_id=${pdfId}`, {
    method: "GET", 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch previous conversation");
  }

  return res.json(); 
};




export const fetchPdf = async () => {
  const pdfId = localStorage.getItem("fileId");
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`http://127.0.0.1:8000/pdf/${pdfId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch PDF");
    }

    const blob = await response.blob();
    const pdfUrl = URL.createObjectURL(blob);

    return pdfUrl;
  } catch (error) {
    console.error("Error fetching PDF:", error);
  }
};


export const sendMessage = async (query: string) => {
  const pdfId = localStorage.getItem("fileId");
  const token = localStorage.getItem("token");

  const url = `http://127.0.0.1:8000/chat/?pdf_id=${encodeURIComponent(
    pdfId || ""
  )}&query=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};


export const sendQuery = async (query: string) => {
  const pdfId = localStorage.getItem("fileId");
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch("http://127.0.0.1:8000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        pdf_id: pdfId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response from API");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in sendQuery:", error);
    throw error;
  }
};



export const getChatRooms = async () => {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`http://127.0.0.1:8000/get_chat_rooms`, {
    method: "GET", 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch previous conversation");
  }

  return res.json(); 
};

export const createChatRoom = async ({title}:any) => {
  const token = localStorage.getItem('access_token') // or use cookies/session
  if (!title.trim()) return

  try {
    await fetch(`http://127.0.0.1:8000/create_chat_rooms?title=${title}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // body: JSON.stringify({ title }),
    })
  } catch (error) {
    console.error('Error creating chat room:', error)
  }
}