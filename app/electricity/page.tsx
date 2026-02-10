/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { verifyMeter, purchaseElectricity } from "@/lib/api";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ConfirmPurchaseModal from "@/components/ui/ConfirmPurchaseModal";
import { Bolt, Check, Loader2, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, generateReference } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const verifySchema = z.object({
  provider: z.string(),
  plan_type: z.enum(["prepaid", "postpaid"]),
  meter_number: z.string().min(10, "Meter number must be at least 10 digits"),
});

const purchaseSchema = z.object({
  phone_number: z.string().min(10, "Phone number is required"),
  amount: z.number().min(100, "Minimum amount is ₦100"),
});

type VerifyFormData = z.infer<typeof verifySchema>;
type PurchaseFormData = z.infer<typeof purchaseSchema>;

// Electricity providers with their plan IDs
const electricityProviders = [
  { name: "IKEDC", prepaid: 1, postpaid: 2 },
  { name: "EKEDC", prepaid: 3, postpaid: 4 },
  { name: "KEDCO", prepaid: 5, postpaid: 6 },
  { name: "PHED", prepaid: 7, postpaid: 8 },
  { name: "JED", prepaid: 9, postpaid: 10 },
  { name: "IBEDC", prepaid: 11, postpaid: 12 },
  { name: "KAEDCO", prepaid: 13, postpaid: 14 },
  { name: "AEDC", prepaid: 15, postpaid: 16 },
  { name: "EEDC", prepaid: 17, postpaid: 18 },
  { name: "BEDC", prepaid: 19, postpaid: 20 },
  { name: "ABA", prepaid: 22, postpaid: 23 },
  { name: "YEDC", prepaid: 24, postpaid: 25 },
];

export default function ElectricityPage() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<"verify" | "purchase" | "success">("verify");
  const [meterInfo, setMeterInfo] = useState<any>(null);
  const [planId, setPlanId] = useState<number>(15); // Default to AEDC prepaid
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [electricityToken, setElectricityToken] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const verifyForm = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      provider: "AEDC",
      plan_type: "prepaid",
    },
  });

  // Calculate plan ID based on provider and plan type
  const getPlanId = (
    provider: string,
    planType: "prepaid" | "postpaid"
  ): number => {
    const providerData = electricityProviders.find((p) => p.name === provider);
    if (!providerData) return 15; // Default to AEDC prepaid
    return planType === "prepaid"
      ? providerData.prepaid
      : providerData.postpaid;
  };

  const purchaseForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      phone_number: user?.phone || "",
    },
  });

  const onVerifySubmit = async (data: VerifyFormData) => {
    try {
      setIsVerifying(true);
      const calculatedPlanId = getPlanId(data.provider, data.plan_type);
      const response = await verifyMeter({
        plan_id: calculatedPlanId,
        meter_number: data.meter_number,
      });

      if (response.success) {
        setMeterInfo((response.data as any)?.data);
        setPlanId(calculatedPlanId);
        setStep("purchase");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to verify meter");
    } finally {
      setIsVerifying(false);
    }
  };

  const onConfirmOpen = () => {
    setShowConfirmModal(true);
  };

  const onConfirmSubmit = async () => {
    const data = purchaseForm.getValues();
    if (!meterInfo) return;

    try {
      setIsPurchasing(true);
      setShowConfirmModal(false);
      const response = await purchaseElectricity({
        phone_number: data.phone_number,
        plan_id: planId,
        amount: data.amount,
        meter_number: verifyForm.getValues("meter_number"),
      });

      if (response.success) {
        const token =
          (response.data as any)?.data?.token ||
          (response.data as any)?.token ||
          null;
        setElectricityToken(token);
        setStep("success");
        setTimeout(() => {
          setStep("verify");
          verifyForm.reset();
          purchaseForm.reset();
          setMeterInfo(null);
          setElectricityToken(null);
        }, 10000);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to purchase electricity");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-[#0f172a]">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#2563eb] dark:bg-[#3b82f6] rounded-xl">
                <Bolt className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Pay Electricity Bill
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Verify your meter and pay your electricity bill
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              {step === "verify" && (
                <form
                  onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meter Number
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your meter number"
                      error={verifyForm.formState.errors.meter_number?.message}
                      {...verifyForm.register("meter_number")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Electricity Provider (Disco)
                    </label>
                    <select
                      {...verifyForm.register("provider")}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
                    >
                      {electricityProviders.map((provider) => (
                        <option key={provider.name} value={provider.name}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Plan Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          verifyForm.setValue("plan_type", "prepaid");
                          verifyForm.trigger("plan_type");
                        }}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 text-left ${
                          verifyForm.watch("plan_type") === "prepaid"
                            ? "bg-[#2563eb] dark:bg-[#3b82f6] text-white border-[#2563eb] dark:border-[#3b82f6] shadow-lg"
                            : "bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#334155] hover:border-blue-300 dark:hover:border-blue-700"
                        }`}
                      >
                        <div>
                          <div className="font-semibold">Prepaid</div>
                          <p className="text-xs mt-1 opacity-80">
                            Load token on meter
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          verifyForm.setValue("plan_type", "postpaid");
                          verifyForm.trigger("plan_type");
                        }}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 text-left ${
                          verifyForm.watch("plan_type") === "postpaid"
                            ? "bg-[#2563eb] dark:bg-[#3b82f6] text-white border-[#2563eb] dark:border-[#3b82f6] shadow-lg"
                            : "bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#334155] hover:border-blue-300 dark:hover:border-blue-700"
                        }`}
                      >
                        <div>
                          <div className="font-semibold">Postpaid</div>
                          <p className="text-xs mt-1 opacity-80">
                            Monthly bill
                          </p>
                        </div>
                      </button>
                    </div>
                    {verifyForm.formState.errors.plan_type && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {verifyForm.formState.errors.plan_type.message}
                      </p>
                    )}
                    <input
                      type="hidden"
                      {...verifyForm.register("plan_type")}
                    />
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Selected Plan
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {verifyForm.watch("provider")} -{" "}
                      {verifyForm.watch("plan_type") === "prepaid"
                        ? "Prepaid"
                        : "Postpaid"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Plan ID:{" "}
                      {getPlanId(
                        verifyForm.watch("provider") || "AEDC",
                        verifyForm.watch("plan_type") || "prepaid"
                      )}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    isLoading={isVerifying}
                    className="w-full"
                  >
                    Verify Meter
                  </Button>
                </form>
              )}

              {step === "purchase" && meterInfo && (
                <div>
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Meter Verified
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {meterInfo.customer_name || "Customer"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {meterInfo.address || meterInfo.meter_number}
                    </p>
                  </div>

                  <form
                    onSubmit={purchaseForm.handleSubmit(onConfirmOpen)}
                    className="space-y-6"
                  >
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="08012345678"
                      error={
                        purchaseForm.formState.errors.phone_number?.message
                      }
                      {...purchaseForm.register("phone_number")}
                    />

                    <Input
                      label="Amount (NGN)"
                      type="number"
                      placeholder="Enter amount"
                      error={purchaseForm.formState.errors.amount?.message}
                      {...purchaseForm.register("amount", {
                        valueAsNumber: true,
                      })}
                    />

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-[#2563eb] dark:text-[#3b82f6]">
                          {purchaseForm.watch("amount")
                            ? formatCurrency(purchaseForm.watch("amount"))
                            : "₦0.00"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setStep("verify");
                          setMeterInfo(null);
                        }}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        Pay Now
                      </Button>
                    </div>
                  </form>

                  <ConfirmPurchaseModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={onConfirmSubmit}
                    title="Confirm Electricity Purchase"
                    details={[
                      {
                        label: "Meter Number",
                        value: verifyForm.getValues("meter_number") || "",
                      },
                      {
                        label: "Provider",
                        value: verifyForm.watch("provider") || "",
                      },
                      {
                        label: "Plan Type",
                        value:
                          verifyForm.watch("plan_type") === "prepaid"
                            ? "Prepaid"
                            : "Postpaid",
                      },
                      {
                        label: "Phone Number",
                        value: purchaseForm.watch("phone_number") || "",
                      },
                    ]}
                    amount={purchaseForm.watch("amount") || 0}
                    isLoading={isPurchasing}
                    confirmLabel="Confirm & Pay"
                  />
                </div>
              )}

              {step === "success" && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-lg text-gray-900 dark:text-white mb-2">
                    Payment successful!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your electricity bill has been paid.
                  </p>

                  {electricityToken && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Your Electricity Token
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-wider mb-4">
                        {electricityToken}
                      </p>
                      {meterInfo?.meter_number && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Meter: {meterInfo.meter_number}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(electricityToken);
                        }}
                        className="mt-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Token
                      </Button>
                      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          <strong>Instructions:</strong> Enter this token into
                          your prepaid meter to activate your electricity units.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
