"use client";

import { FC, useState, useEffect } from "react";
import { useAppSelector, treeSlice, workflowSlice, useAppDispatch } from "../store";

interface GenerateImagePreviewProps {
  nodeId: string;
}

export const GenerateImagePreview: FC<GenerateImagePreviewProps> = ({ nodeId }) => {
  const dispatch = useAppDispatch();
  
  // Get node data from Redux store
  const node = useAppSelector((state) => 
    state.tree.find(n => n.id === nodeId)
  );
  
  const nodeInputs = node?.inputs || {};
  const nodeOutputs = node?.outputs || {};
  
  // Get the node's parent to build the path
  const parentId = node?.parent;
  const nodePath = parentId ? `${parentId}/${nodeId}` : nodeId;

  // Status can be "idle", "generating", "success", or "error"
  const [status, setStatus] = useState<string>(nodeOutputs.status || "idle");
  
  // Mock images for the preview (in a real app, these would come from an API)
  const [images, setImages] = useState<string[]>(nodeOutputs.images || []);
  const [selected, setSelected] = useState<number>(0);

  // This effect would trigger the actual image generation in a real application
  // Here we're just simulating it with a timeout
  const generateImages = async () => {
    if (!nodeInputs.prompt) {
      return;
    }
    
    setStatus("generating");
    dispatch(treeSlice.actions.updateNodeOutputs({ 
      id: nodeId, 
      outputs: { status: "generating" } 
    }));
    
    // Simulate API call with delay
    setTimeout(() => {
      // Mock image URLs based on the prompt
      const generatedImages = Array(nodeInputs.numImages || 1)
        .fill(0)
        .map((_, i) => 
          `https://picsum.photos/seed/${nodeInputs.prompt?.substring(0, 10)}${i}/${nodeInputs.width || 512}/${nodeInputs.height || 512}`
        );
      
      setImages(generatedImages);
      setStatus("success");
      
      const outputData = { 
        status: "success", 
        images: generatedImages,
        // Include the prompt in the outputs so downstream nodes can use it
        prompt: nodeInputs.prompt,
        imageData: {
          prompt: nodeInputs.prompt,
          modelType: nodeInputs.modelType,
          width: nodeInputs.width,
          height: nodeInputs.height
        }
      };
      
      // Update the store with our results
      dispatch(treeSlice.actions.updateNodeOutputs({ 
        id: nodeId, 
        outputs: outputData
      }));
      
      // Also directly update the workflow path data
      dispatch(workflowSlice.actions.updatePathData({
        nodeId: nodePath,
        data: outputData
      }));
    }, 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Image Generation</h3>
        
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            status === "generating"
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
          onClick={generateImages}
          disabled={status === "generating" || !nodeInputs.prompt}
        >
          {status === "generating" ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Images"
          )}
        </button>
      </div>
      
      {status === "idle" && !images.length && (
        <div className="bg-gray-50 p-6 rounded-md border border-gray-200 flex flex-col items-center justify-center text-center h-64">
          <p className="text-gray-500 mb-4">No images generated yet</p>
          <p className="text-sm text-gray-400">
            Configure your image settings and click "Generate Images" to create your images
          </p>
        </div>
      )}
      
      {status === "error" && (
        <div className="bg-red-50 p-6 rounded-md border border-red-200 flex flex-col items-center justify-center text-center h-64">
          <p className="text-red-500 mb-4">Error generating images</p>
          <p className="text-sm text-red-400">
            Please check your settings and try again
          </p>
        </div>
      )}
      
      {(status === "success" || images.length > 0) && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
            <img 
              src={images[selected]} 
              alt={`Generated image ${selected + 1}`}
              className="w-full h-auto rounded-md"
            />
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(index)}
                  className={`p-1 rounded-md border-2 ${
                    selected === index
                      ? "border-indigo-500"
                      : "border-transparent"
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-auto rounded-md"
                  />
                </button>
              ))}
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-500 font-medium">Prompt</p>
                <p className="text-gray-700">{nodeInputs.prompt || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Model</p>
                <p className="text-gray-700">{nodeInputs.modelType || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Size</p>
                <p className="text-gray-700">{nodeInputs.width || 0} x {nodeInputs.height || 0}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Images</p>
                <p className="text-gray-700">{images.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 