'use client';
import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

export default function UploadMenuImage({ onUploaded }: { onUploaded: (url: string) => void }) {
  return (
    <UploadButton<OurFileRouter>
      endpoint="menuImage"
      onClientUploadComplete={(res) => {
        const url = res?.[0]?.url;
        if (url) onUploaded(url);
      }}
      onUploadError={(error: Error) => {
        console.error(error);
        alert('Upload failed');
      }}
    />
  );
}


