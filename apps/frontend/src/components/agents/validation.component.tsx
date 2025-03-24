"use client";

import { FC, useEffect } from "react";
import {
  useAppDispatch,
  useAppSelector,
  validationErrors,
} from "@frontend/components/agents/store";
import { Alert, AlertDescription } from "@frontend/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const ValidationComponent: FC<{ id: string }> = (params) => {
  const errors = useAppSelector((p) => p.validation.validation[params.id]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      dispatch(
        validationErrors.actions.deleteAll(),
      );
    };
  }, []);

  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mt-3 border border-red-800 bg-red-950/40 rounded-xl">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <AlertDescription className="text-red-300">
        <ul className="list-disc pl-5 mt-1">
          {errors.map((error, index) => (
            <li key={index} className="text-sm font-medium">{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
