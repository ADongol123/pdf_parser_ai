"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, File, X, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { uploadFile } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function PDFUploadPage() {
  const router = useRouter();
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(
        (file) => file.type === "application/pdf"
      );
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFiles = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === "application/pdf"
      );
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
  
    setUploading(true);
    setUploadProgress(0);
  
    let completed = 0;
  
    try {
      for (const file of files) {
        await uploadFile(file);
        completed++;
        setUploadProgress(Math.round((completed / files.length) * 100));
      }
      setUploadStatus("success");
      router.push("/chat");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFiles([]);
    setUploadStatus("idle");
    setUploadProgress(0);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent p-4">
      <Card className="w-full max-w-2xl border border-gray-200 shadow-sm bg-transparent">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl font-semibold text-white">
            PDF Upload
          </CardTitle>
          <CardDescription className="text-white">
            Upload multiple PDF documents at once
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {uploadStatus === "idle" && (
            <div
              className="mb-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-8 transition-colors hover:border-gray-400"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="mb-4 h-10 w-10 text-white" />
              <p className="mb-2 text-sm font-medium text-white">
                Drag and drop your PDF files here
              </p>
              <p className="mb-4 text-xs text-white">or</p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-white bg-transparent text-white hover:bg-white hover:text-black"
              >
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {uploadStatus === "success" ? (
            <div className="flex flex-col items-center py-8">
              <CheckCircle className="mb-4 h-16 w-16 text-white" />
              <p className="text-center text-lg font-medium text-white">
                Upload Complete!
              </p>
              <p className="mt-2 text-center text-sm text-white">
                {files.length} files uploaded successfully
              </p>
            </div>
          ) : uploadStatus === "error" ? (
            <div className="flex flex-col items-center py-8">
              <AlertCircle className="mb-4 h-16 w-16 text-black" />
              <p className="text-center text-lg font-medium">Upload Failed</p>
              <p className="mt-2 text-center text-sm text-gray-500">
                There was an error uploading your files
              </p>
            </div>
          ) : null}

          {files.length > 0 && uploadStatus === "idle" && (
            <div className="mt-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">
                  Selected Files ({files.length})
                </h3>
                <Button
                  variant="ghost"
                  onClick={resetUpload}
                  className="h-8 text-xs text-white hover:text-black"
                >
                  Clear All
                </Button>
              </div>

              <div className="max-h-[300px] overflow-y-auto rounded-md border border-gray-200">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-100 p-3 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                        <File className="h-5 w-5 " />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate max-w-[300px] text-white">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-gray-100"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only text-white">Remove file</span>
                    </Button>
                  </div>
                ))}
              </div>

              {uploadStatus === "idle" && files.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mr-2 border-gray-200"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add More
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Upload {files.length}{" "}
                    {files.length === 1 ? "File" : "Files"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {uploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">
                  Uploading {files.length}{" "}
                  {files.length === 1 ? "file" : "files"}
                </p>
                <Badge variant="outline" className="text-xs text-white">
                  {uploadProgress}%
                </Badge>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-gray-100 pt-4">
          {uploadStatus !== "idle" ? (
            <Button
              onClick={resetUpload}
              className="w-48 bg-black text-white hover:bg-gray-800 border border-white"
            >
              Upload More Files
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </main>
  );
}
