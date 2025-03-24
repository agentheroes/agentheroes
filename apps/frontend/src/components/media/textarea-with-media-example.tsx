'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@frontend/components/ui/card";
import { TextareaWithMedia } from "@frontend/components/ui/textarea-with-media";
import { Media } from "@frontend/types/media";

export function TextareaWithMediaExample() {
  // Create state for multiple textareas
  const [textarea1, setTextarea1] = useState("");
  const [textarea1Media, setTextarea1Media] = useState<Media[]>([]);
  
  const [textarea2, setTextarea2] = useState("");
  const [textarea2Media, setTextarea2Media] = useState<Media[]>([]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Post Caption</CardTitle>
        </CardHeader>
        <CardContent>
          <TextareaWithMedia
            value={textarea1}
            onChange={setTextarea1}
            selectedMedia={textarea1Media}
            onMediaChange={setTextarea1Media}
            placeholder="Write your caption here..."
            maxMediaSelections={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Post Description</CardTitle>
        </CardHeader>
        <CardContent>
          <TextareaWithMedia
            value={textarea2}
            onChange={setTextarea2}
            selectedMedia={textarea2Media}
            onMediaChange={setTextarea2Media}
            placeholder="Add a detailed description..."
            maxMediaSelections={5}
          />
        </CardContent>
      </Card>
    </div>
  );
} 