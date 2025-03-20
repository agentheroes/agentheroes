"use client";

import { FC, useState, useEffect } from "react";
import { Textarea } from "@frontend/components/ui/textarea";
import { Button } from "@frontend/components/ui/button";

interface PromptInputProps {
  initialValue: string;
  placeholder?: string;
  label?: string;
  helpText?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  inputFromPreviousNode?: string;
  allowOverride?: boolean;
}

export const PromptInput: FC<PromptInputProps> = ({
  initialValue = "",
  placeholder = "Enter a prompt...",
  label = "Prompt",
  helpText,
  onChange,
  disabled = false,
  inputFromPreviousNode,
  allowOverride = true,
}) => {
  const [value, setValue] = useState<string>(initialValue);
  const [isOverriding, setIsOverriding] = useState<boolean>(!inputFromPreviousNode);
  
  useEffect(() => {
    // If we have a value from a previous node and we're not overriding, use that
    if (inputFromPreviousNode && !isOverriding) {
      setValue(inputFromPreviousNode);
      onChange(inputFromPreviousNode);
    } else if (initialValue && !value) {
      setValue(initialValue);
    }
  }, [inputFromPreviousNode, isOverriding, initialValue, value, onChange]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange(newValue);
  };

  const toggleOverride = () => {
    if (allowOverride) {
      const newOverrideState = !isOverriding;
      setIsOverriding(newOverrideState);
      
      // If turning off override, use the input from previous node
      if (!newOverrideState && inputFromPreviousNode) {
        setValue(inputFromPreviousNode);
        onChange(inputFromPreviousNode);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        
        {inputFromPreviousNode && allowOverride && (
          <Button
            type="button"
            onClick={toggleOverride}
            variant="outline"
            className={`text-xs px-2 py-1 h-auto ${
              isOverriding 
                ? "bg-orange-100 text-orange-700 hover:bg-orange-200" 
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {isOverriding ? "Using Custom" : "Using Upstream"}
          </Button>
        )}
      </div>
      
      {inputFromPreviousNode && !isOverriding ? (
        <div className="relative">
          <Textarea
            value={inputFromPreviousNode}
            readOnly
            className="bg-gray-50"
            rows={3}
            disabled={true}
          />
          <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-tr-md">
            From Upstream
          </div>
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          disabled={disabled}
        />
      )}
      
      {helpText && (
        <p className="text-xs text-gray-500 mt-1">
          {helpText}
        </p>
      )}
    </div>
  );
}; 