"use client";

import { Button } from "@frontend/components/ui/button";
import { Card } from "@frontend/components/ui/card";
import { Trash2, Image, Download } from "lucide-react";
import { OpenGeneratorButton } from "./open-generator-button";
import { Media } from "@frontend/types/media";
import { useRef } from "react";

interface MediaCardProps {
  media: Media;
  onDelete: (id: string) => void;
  onDownload: (media: Media) => void;
  deleteConfirm: string | null;
  onVideoMouseEnter: (videoElement: HTMLVideoElement) => void;
  onVideoMouseLeave: (videoElement: HTMLVideoElement) => void;
}

export function MediaCard({
  media,
  onDelete,
  onDownload,
  deleteConfirm,
  onVideoMouseEnter,
  onVideoMouseLeave,
}: MediaCardProps) {
  const ref = useRef(null);
  return (
    <Card
      key={media.id}
      className="border border-[#3B3B3B] rounded-lg pt-4 pl-4 pr-4 flex flex-col bg-[#151515] relative"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-[#F0F0F0] line-clamp-1">
            {media.prompt}
          </h3>
          <p className="text-sm text-[#A0A0A0] mt-1">
            {new Date(media.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-1">
          {media.media && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(media);
              }}
              className="h-8 w-8 !p-0"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {media.media && media.type === "IMAGE" && (
            <OpenGeneratorButton
              refe={ref}
              mediaId={media.id}
              prompt={media.prompt}
            />
          )}
          <Button
            variant={deleteConfirm === media.id ? "destructive" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(media.id);
            }}
            className="h-8 w-8 !p-0"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="-mx-4 mt-4 flex-grow flex items-center justify-center">
        {media.media ? (
          <div className="w-full h-32 overflow-hidden border-2 border-[#3B3B3B]">
            {media.type === "IMAGE" ? (
              <img
                ref={ref}
                src={media.originalUrl}
                alt={media.prompt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails to load, replace with placeholder
                  (e.target as HTMLImageElement).src = media.media;
                }}
              />
            ) : (
              <video
                src={media.originalUrl}
                autoPlay={false}
                className="w-full h-full object-cover"
                controls={false}
                muted
                loop
                playsInline
                onMouseEnter={(e) => onVideoMouseEnter(e.currentTarget)}
                onMouseLeave={(e) => onVideoMouseLeave(e.currentTarget)}
                onError={(e) => {
                  // If image fails to load, replace with placeholder
                  (e.target as HTMLImageElement).src = media.media;
                }}
              />
            )}
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-[#2A2A2A] flex items-center justify-center">
            <Image className="h-16 w-16 text-[#F0F0F0]" />
          </div>
        )}
      </div>

      {media.text && (
        <p className="text-[#A0A0A0] mt-4 line-clamp-2 text-center">
          {media.text}
        </p>
      )}

      {deleteConfirm === media.id && (
        <DeleteConfirmDialog
          onConfirm={(e) => {
            e.stopPropagation();
            onDelete(media.id);
          }}
          onCancel={(e) => {
            e.stopPropagation();
          }}
        />
      )}
    </Card>
  );
}

interface DeleteConfirmDialogProps {
  onConfirm: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
}

function DeleteConfirmDialog({
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <div
      className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col rounded-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-white mb-4 text-center">
        Are you sure you want to delete this media?
      </p>
      <div className="flex space-x-2">
        <Button variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
