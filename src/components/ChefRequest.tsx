"use client";

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChefLogo } from "./ChefLogo";
import { getTranslations, type Locale } from "@/lib/i18n";
import {
  useRequestChefAccessMutation,
  useGetChefRequestQuery,
  useLoginChefMutation,
} from "@/features/api/apiSlice";
import { useAppDispatch } from "@/app/hooks";
import toast from "react-hot-toast";
import { setCredentials } from "@/features/auth/authSlice";

interface ChefRequestProps {
  locale: Locale;
}

export function ChefRequest({ locale }: ChefRequestProps) {
  const t = getTranslations(locale);
  const { headChefId = "" } = useParams<{ headChefId: string }>();
  const [storedId, setStoredId] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("chefUserId") : null
  );
  const [storedHeadChefId, setStoredHeadChefId] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("chefHeadChefId") : null
  );
  
  // Clear stored data if headChefId doesn't match
  useEffect(() => {
    if (storedHeadChefId && storedHeadChefId !== headChefId) {
      localStorage.removeItem("chefUserId");
      localStorage.removeItem("chefHeadChefId");
      setStoredId(null);
      setStoredHeadChefId(null);
    }
  }, [headChefId, storedHeadChefId]);

  const { data: request } = useGetChefRequestQuery(storedId as string, {
    skip: !storedId,
  });
  const [requestAccess, { isLoading }] = useRequestChefAccessMutation();
  const [loginChef] = useLoginChefMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    
    if (!lastName.trim()) {
      toast.error("Last name is required");
      return;
    }
    
    requestAccess({ 
      headChefId, 
      firstName: firstName.trim(), 
      lastName: lastName.trim()
    })
      .unwrap()
      .then((data) => {
        localStorage.setItem("chefUserId", data.userId);
        localStorage.setItem("chefHeadChefId", headChefId);
        setStoredId(data.userId);
        setStoredHeadChefId(headChefId);
        toast.success("Access request submitted successfully!");
      })
      .catch((error) => {
        toast.error(error?.data?.message || "Registration failed");
      });
  };

  const handleLogin = useCallback(() => {
    loginChef({ chefId: storedId as string, headChefId })
      .unwrap()
      .then((data) => {
        dispatch(setCredentials(data));
        navigate("/dashboard");
        toast.success("Welcome back, Chef!");
      })
      .catch((err) => {
        console.error("Pending Approval", err);
        toast.error("Pending Approval");
      });
  }, [loginChef, storedId, headChefId, dispatch, navigate]);

  useEffect(() => {
    if (storedId && request) {
      if (request?.data?.status !== "pending") {
        handleLogin();
      }
    }
  }, [storedId, request, handleLogin]);

  if (storedId && request) {
    if (request?.data?.status === "pending") {
      return (
        <div className="min-h-screen bg-[#0F1A24] flex items-center justify-center text-center p-4">
          <p className="text-lg text-white mt-6">{t.pendingApproval}</p>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1A24] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <ChefLogo />
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <Input
            placeholder={t.firstName}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full h-14 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-lg focus:border-[#D4B896] focus:ring-[#D4B896]"
            required
          />
          <Input
            placeholder={t.lastName}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full h-14 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-lg focus:border-[#D4B896] focus:ring-[#D4B896]"
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-[#D4B896] text-[#0F1A24] text-xl font-semibold hover:bg-[#C4A886] transition-colors"
          >
            {t.submit}
          </Button>
        </form>
      </div>
    </div>
  );
}
