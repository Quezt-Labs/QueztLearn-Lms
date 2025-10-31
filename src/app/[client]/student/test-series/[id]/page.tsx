"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Tag,
  DollarSign,
  FileText,
  Play,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import {
  useClientTestSeriesDetail,
  useClientTestsInSeries,
  useClientCheckoutTestSeries,
  useClientEnrollFreeTestSeries,
  useClientVerifyPayment,
  ClientTestInSeries,
} from "@/hooks/test-series-client";
import {
  ErrorMessage,
  SuccessMessage,
} from "@/components/common/error-message";

// Razorpay types
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void | Promise<void>;
  prefill?: Record<string, string>;
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function StudentTestSeriesDetailPage() {
  const params = useParams();
  const identifier = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data fetching
  const {
    data: testSeriesData,
    isLoading,
    refetch: refetchTestSeries,
  } = useClientTestSeriesDetail(identifier);

  const { data: testsData, isLoading: isLoadingTests } =
    useClientTestsInSeries(identifier);

  // Mutations
  const checkoutMutation = useClientCheckoutTestSeries();
  const enrollFreeMutation = useClientEnrollFreeTestSeries();
  const verifyPaymentMutation = useClientVerifyPayment();

  const testSeries = testSeriesData?.data;
  const tests = testsData?.data || [];
  const isEnrolled = testSeries?.isEnrolled || false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleEnrollFree = async () => {
    if (!testSeries?.id) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      await enrollFreeMutation.mutateAsync(testSeries.id);
      setSuccessMessage("You have been enrolled in this test series.");
      setIsEnrollDialogOpen(false);
      refetchTestSeries();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to enroll. Please try again.";
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!testSeries?.id) return;

    try {
      setIsProcessing(true);
      const response = await checkoutMutation.mutateAsync(testSeries.id);
      const orderData = response.data;

      // Initialize Razorpay checkout
      if (typeof window !== "undefined" && window.Razorpay) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: testSeries.title,
          description: `Payment for ${testSeries.title}`,
          order_id: orderData.razorpayOrderId,
          handler: async function (response: RazorpayResponse) {
            try {
              await verifyPaymentMutation.mutateAsync({
                orderId: orderData.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });

              setSuccessMessage(
                "Payment successful! You have been enrolled in this test series."
              );
              setIsEnrollDialogOpen(false);
              refetchTestSeries();
              setTimeout(() => setSuccessMessage(null), 5000);
            } catch (error: unknown) {
              const errorMessage =
                (error as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message ||
                "Failed to verify payment. Please contact support.";
              setErrorMessage(errorMessage);
              setTimeout(() => setErrorMessage(null), 5000);
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            // You can get user details from auth context
          },
          theme: {
            color: "#4F46E5",
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        throw new Error("Razorpay SDK not loaded");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to initiate checkout. Please try again.";
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(null), 5000);
      setIsProcessing(false);
    }
  };

  const handleEnroll = () => {
    if (testSeries?.isFree) {
      handleEnrollFree();
    } else {
      handleCheckout();
    }
  };

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!testSeries) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Test Series Not Found</h3>
          <Button asChild variant="outline">
            <Link href="/student/test-series">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Test Series
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={testSeries.title}
        description={`Test series for ${testSeries.exam} exam`}
        breadcrumbs={[
          { label: "Student", href: "/student/dashboard" },
          { label: "Test Series", href: "/student/test-series" },
          { label: testSeries.title },
        ]}
      />

      {/* Success/Error Messages */}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <ErrorMessage
          error={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          {testSeries.imageUrl && (
            <Card>
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={testSeries.imageUrl}
                  alt={testSeries.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          )}

          {/* Tabs */}
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tests">Tests ({tests.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  {testSeries.description?.html ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: testSeries.description.html,
                      }}
                      className="prose prose-sm max-w-none"
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      No description available.
                    </p>
                  )}
                </div>

                {testSeries.description?.features && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {testSeries.description.features.map(
                        (feature: string, index: number) => (
                          <li key={index}>{feature}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tests" className="space-y-4">
                {isLoadingTests ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading tests...
                  </div>
                ) : tests.length > 0 ? (
                  <div className="space-y-3">
                    {tests.map((test: ClientTestInSeries) => (
                      <Card key={test.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{test.title}</h4>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {test.durationMinutes} min
                                </span>
                                <span>{test.totalMarks} marks</span>
                                {test.isFree && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Free
                                  </Badge>
                                )}
                              </div>
                              {test.attemptStatus && (
                                <Badge
                                  variant={
                                    test.attemptStatus === "COMPLETED"
                                      ? "default"
                                      : test.attemptStatus === "IN_PROGRESS"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="mt-2"
                                >
                                  {test.attemptStatus === "COMPLETED"
                                    ? "Completed"
                                    : test.attemptStatus === "IN_PROGRESS"
                                    ? "In Progress"
                                    : "Not Started"}
                                </Badge>
                              )}
                            </div>
                            {isEnrolled && (
                              <Button
                                asChild
                                size="sm"
                                variant={
                                  test.attemptStatus === "COMPLETED"
                                    ? "outline"
                                    : "default"
                                }
                              >
                                <Link
                                  href={`/student/tests/${test.id}/instructions`}
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  {test.attemptStatus === "COMPLETED"
                                    ? "Review"
                                    : test.attemptStatus === "IN_PROGRESS"
                                    ? "Resume"
                                    : "Start"}
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tests available in this series.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnrolled ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg dark:bg-green-900/10 dark:border-green-800/20 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    You are enrolled in this test series.
                  </span>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {testSeries.isFree ? (
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">
                          Free
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {testSeries.discountPercentage > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(testSeries.totalPrice)}
                            </span>
                            <Badge variant="destructive">
                              <Tag className="h-3 w-3 mr-1" />
                              {testSeries.discountPercentage}% OFF
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                          <span className="text-2xl font-bold">
                            {formatPrice(testSeries.finalPrice)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {testSeries.durationDays > 0 && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      Valid for {testSeries.durationDays} days
                    </div>
                  )}

                  <Button
                    onClick={() => setIsEnrollDialogOpen(true)}
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {testSeries.isFree ? "Enroll for Free" : "Enroll Now"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Exam</span>
                <Badge variant="outline">{testSeries.exam}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tests</span>
                <span className="font-medium">{tests.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in Test Series</DialogTitle>
            <DialogDescription>
              {testSeries.isFree
                ? "Are you sure you want to enroll in this free test series?"
                : `You will be redirected to payment. Amount: ${formatPrice(
                    testSeries.finalPrice
                  )}`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEnrollDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleEnroll} disabled={isProcessing}>
              {isProcessing
                ? "Processing..."
                : testSeries.isFree
                ? "Enroll"
                : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
