"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@frontend/components/ui/button";
import { Spinner } from "@frontend/components/ui/spinner";
import { Label } from "@frontend/components/ui/label";
import { useFetch } from "@frontend/hooks/use-fetch";
import { X, Upload, Image, Check, AlertCircle } from "lucide-react";

interface UploadingFile {
  id: string;
  file: File;
  progress: 'uploading' | 'success' | 'error';
  previewUrl: string;
}

interface CharacterUploadStep1Props {
  uploadedImages: Array<{id: string, url: string}>;
  onImagesUploaded: (images: Array<{id: string, url: string}>) => void;
  onImagesSelected: (images: string[]) => void;
  onNext: () => void;
}

export function CharacterUploadStep1({
  uploadedImages,
  onImagesUploaded,
  onImagesSelected,
  onNext,
}: CharacterUploadStep1Props) {
  const [error, setError] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedImagesRef = useRef<Array<{id: string, url: string}>>(uploadedImages);
  const fetch = useFetch();

  // Update ref when prop changes
  if (uploadedImages !== uploadedImagesRef.current) {
    uploadedImagesRef.current = uploadedImages;
  }

  // Generate a unique ID for an image
  const generateUniqueId = () => {
    return Date.now().toString() + Math.random().toString(36).substring(2, 11);
  };

  const getFilePreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError("");
    
    // Create uploading file objects with previews
    const newUploadingFiles: UploadingFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Only image files are allowed");
        continue;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        continue;
      }

      newUploadingFiles.push({
        id: generateUniqueId(),
        file,
        progress: 'uploading',
        previewUrl: getFilePreview(file)
      });
    }
    
    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);
    
    // Create an array to track successfully uploaded images
    const successfulUploads: Array<{id: string, url: string}> = [];
    
    // Process each file upload individually
    const uploadPromises = newUploadingFiles.map(async (uploadingFile) => {
      try {
        const formData = new FormData();
        formData.append('file', uploadingFile.file);

        const response = await fetch('/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          
          // Update uploading file status to success
          setUploadingFiles(prev => 
            prev.map(file => 
              file.id === uploadingFile.id 
                ? { ...file, progress: 'success' } 
                : file
            )
          );
          
          // Add to successful uploads
          successfulUploads.push({
            id: uploadingFile.id,
            url: result.url
          });
        } else {
          // Update uploading file status to error
          setUploadingFiles(prev => 
            prev.map(file => 
              file.id === uploadingFile.id 
                ? { ...file, progress: 'error' } 
                : file
            )
          );
          setError("Failed to upload some images");
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        // Update uploading file status to error
        setUploadingFiles(prev => 
          prev.map(file => 
            file.id === uploadingFile.id 
              ? { ...file, progress: 'error' } 
              : file
          )
        );
        setError("Failed to upload some images");
      }
    });
    
    // Wait for all uploads to finish
    await Promise.all(uploadPromises);
    
    // If we have successful uploads, update the parent component's state once
    if (successfulUploads.length > 0) {
      onImagesUploaded([...uploadedImagesRef.current, ...successfulUploads]);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (id: string) => {
    // Remove from uploading files if it's still there
    setUploadingFiles(prev => prev.filter(file => file.id !== id));
    
    // Remove from uploaded images
    const newUploadedImages = uploadedImages.filter(img => img.id !== id);
    onImagesUploaded(newUploadedImages);
  };

  const handleContinue = () => {
    if (uploadedImages.length < 1) {
      setError("Please upload at least 2 images");
      return;
    }

    // Check if any files are still uploading
    if (uploadingFiles.some(file => file.progress === 'uploading')) {
      setError("Please wait for all uploads to complete");
      return;
    }

    onImagesSelected(uploadedImages.map(img => img.url));
    onNext();
  };

  // Remove error status uploads from the list
  const cleanupFailedUploads = () => {
    setUploadingFiles(prev => prev.filter(file => file.progress !== 'error'));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Step 1: Upload Your Character Images
        </h3>
        <p className="text-gray-500 mb-4">
          Upload at least 1 images of your character to train the model.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center">
            <Image className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500 mb-2">Drag and drop your images here, or</p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              Supported formats: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start justify-between">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
            {uploadingFiles.some(file => file.progress === 'error') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={cleanupFailedUploads}
                className="text-red-700 hover:text-red-800"
              >
                Clear failed
              </Button>
            )}
          </div>
        )}

        {uploadingFiles.length > 0 && (
          <div>
            <Label className="mb-2 block">Uploads ({uploadingFiles.length})</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadingFiles.map((file) => (
                <div key={file.id} className="relative group">
                  <div className={`border rounded-lg overflow-hidden aspect-square ${file.progress === 'error' ? 'border-red-300 bg-red-50' : ''}`}>
                    <img
                      src={file.previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${file.progress === 'uploading' ? 'bg-black/20' : 'bg-transparent opacity-0'}`}>
                      {file.progress === 'uploading' && (
                        <Spinner className="h-8 w-8 text-white" />
                      )}
                    </div>
                    {file.progress === 'success' && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full h-6 w-6 flex items-center justify-center">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    {file.progress === 'error' && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center !p-0">
                        <X className="!p-0 h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 left-2 h-8 w-8 !p-0 flex items-center justify-center"
                    onClick={() => handleRemoveImage(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadedImages.length > 0 && uploadedImages.some(img => !uploadingFiles.some(file => file.id === img.id)) && (
          <div>
            <Label className="mb-2 block">Uploaded Images ({uploadedImages.filter(img => !uploadingFiles.some(file => file.id === img.id)).length})</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedImages
                .filter(img => !uploadingFiles.some(file => file.id === img.id))
                .map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="border rounded-lg overflow-hidden aspect-square">
                      <img
                        src={image.url}
                        alt="Uploaded character"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 flex items-center justify-center"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={uploadedImages.length < 2 || uploadingFiles.some(file => file.progress === 'uploading')}
          >
            Continue to Training
          </Button>
        </div>
      </div>
    </div>
  );
} 