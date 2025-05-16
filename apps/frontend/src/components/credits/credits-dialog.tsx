"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFetch } from "@frontend/hooks/use-fetch";
import { Button } from "@frontend/components/ui/button";
import { Card } from "@frontend/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@frontend/components/ui/dialog";

interface PricingOption {
  identifier: string;
  name: string;
  price: number;
  credits: number;
}

interface CreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditsDialog({ open, onOpenChange }: CreditsDialogProps) {
  const router = useRouter();
  const fetchApi = useFetch();
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Fetch pricing options when dialog opens
  useEffect(() => {
    if (open) {
      loadPricingOptions();
    }
  }, [open]);

  async function loadPricingOptions() {
    try {
      const response = await fetchApi("/users/pricing");
      const data = await response.json();
      setPricingOptions(data);
    } catch (error) {
      console.error("Failed to load pricing options", error);
    }
  }

  async function handlePurchase(identifier: string) {
    try {
      setIsLoading(true);
      setSelectedOption(identifier);
      
      const response = await fetchApi(`/users/pricing/${identifier}/url`, {
        headers: {
          "refer": window.location.href
        }
      });
      
      const data = await response.json();
      if (data && data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        throw new Error("Invalid payment response");
      }
    } catch (error) {
      console.error("Payment error", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Purchase Credits</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 mt-4">
          {pricingOptions.length === 0 ? (
            <div className="text-center py-6">Loading pricing options...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricingOptions.map((option) => (
                <Card 
                  key={option.identifier}
                  className={`p-6 flex flex-col items-center text-center cursor-pointer transition-all hover:border-[#FD7302] ${
                    selectedOption === option.identifier ? 'border-[#FD7302]' : ''
                  }`}
                  onClick={() => setSelectedOption(option.identifier)}
                >
                  <h3 className="text-lg font-semibold mb-2">{option.name}</h3>
                  <div className="text-3xl font-bold text-[#FD7302] mb-2">
                    ${option.price}
                  </div>
                  <p className="text-[#7E7E81] mb-4">{option.credits} credits</p>
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(option.identifier);
                    }}
                    disabled={isLoading && selectedOption === option.identifier}
                  >
                    {isLoading && selectedOption === option.identifier
                      ? "Processing..."
                      : "Purchase"
                    }
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 