import { Card } from "@frontend/components/ui/card";

interface ModelSelectionCardProps {
  category: string;
  models: any[];
  selectedModels: string[];
  onModelSelect: (modelId: string) => void;
  isRequired?: boolean;
}

export function ModelSelectionCard({
  category,
  models,
  selectedModels,
  onModelSelect,
  isRequired = false,
}: ModelSelectionCardProps) {
  // Format category name for display (e.g., "normal-image" -> "Normal Image")
  const formattedCategory = category
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Card className={`mb-6 p-6 ${isRequired ? 'border-red-500' : ''}`}>
      <h2 className="text-xl font-semibold mb-4">
        {formattedCategory}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models?.map((model) => (
          <div 
            key={model.model} 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedModels.includes(model.model) 
                ? 'bg-blue-100 border-blue-500' 
                : isRequired ? 'hover:bg-gray-50 border-red-200' : 'hover:bg-gray-50'
            }`}
            onClick={() => onModelSelect(model.model)}
          >
            <div className="font-medium">{model.label}</div>
            <div className="text-sm text-gray-500">Service: {model.identifier}</div>
          </div>
        ))}
        
        {(!models || models.length === 0) && (
          <p className="text-gray-500">No models available for this category</p>
        )}
      </div>
    </Card>
  );
} 