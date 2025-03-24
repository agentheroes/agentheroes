"use client";

export function LoadingState() {
  return (
    <div className="text-center py-12">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading media...</p>
    </div>
  );
} 