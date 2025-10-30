"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Edit,
  Trash2,
  FileText,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Globe,
  Calendar,
  DollarSign,
  Rocket,
  BarChart3,
} from "lucide-react";
import {
  useTestSeries,
  useDeleteTestSeries,
  usePublishTestSeries,
  useTestSeriesStats,
  useTestsByTestSeries,
  TestSeries,
} from "@/hooks/test-series";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { TestListSection } from "./test-list-section";
import { EditTestSeriesModal } from "./edit-test-series-modal";

interface TestSeriesDetailPageProps {
  basePath?: "admin" | "teacher";
}

export function TestSeriesDetailPage({
  basePath = "admin",
}: TestSeriesDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const testSeriesId = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  // Data fetching
  const {
    data: testSeriesData,
    isLoading,
    refetch: refetchTestSeries,
  } = useTestSeries(testSeriesId);
  const { data: statsData } = useTestSeriesStats(testSeriesId);
  const { data: testsData, refetch: refetchTests } =
    useTestsByTestSeries(testSeriesId);

  // Mutations
  const deleteMutation = useDeleteTestSeries();
  const publishMutation = usePublishTestSeries();

  const testSeries = testSeriesData?.data as TestSeries | undefined;
  const stats = statsData?.data;
  const tests = Array.isArray(testsData?.data) ? testsData.data : [];

  const handleGoBack = () => {
    router.push(`/${basePath}/test-series`);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(testSeriesId);
      router.push(`/${basePath}/test-series`);
    } catch (error) {
      console.error("Failed to delete test series:", error);
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(testSeriesId);
      setIsPublishDialogOpen(false);
    } catch (error) {
      console.error("Failed to publish test series:", error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not published";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!testSeries) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Test Series Not Found</h3>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Test Series
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Test Series
            </Button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                {testSeries.imageUrl && (
                  <img
                    src={testSeries.imageUrl}
                    alt={testSeries.title}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover border"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {testSeries.title}
                  </h1>
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge variant="outline" className="text-sm">
                      {testSeries.exam}
                    </Badge>
                    <Badge
                      variant={testSeries.isActive ? "default" : "secondary"}
                      className={
                        testSeries.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : ""
                      }
                    >
                      {testSeries.isActive ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </Badge>
                    {testSeries.publishedAt && (
                      <Badge variant="outline" className="text-xs">
                        <Rocket className="mr-1 h-3 w-3" />
                        Published
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>{testSeries.testCount} Tests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{testSeries.totalQuestions} Questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{testSeries.durationDays} Days Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(testSeries.createdAt)}</span>
                </div>
                {testSeries.publishedAt && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Published {formatDate(testSeries.publishedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              {!testSeries.publishedAt && (
                <Button
                  onClick={() => setIsPublishDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={publishMutation.isPending}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Publish
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tests">
              Tests
              {testSeries.testCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {testSeries.testCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="mr-2 h-4 w-4" />
              Stats & Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Description Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testSeries.description?.html ? (
                      <div
                        className="prose prose-sm max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: testSeries.description.html,
                        }}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        No description provided
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Features Card */}
                {testSeries.description?.features &&
                  testSeries.description.features.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {testSeries.description.features.map(
                            (feature, index) => (
                              <li
                                key={index}
                                className="flex items-start space-x-2"
                              >
                                <CheckCircle className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                {/* Pricing Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Pricing</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testSeries.isFree ? (
                      <div>
                        <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                          FREE
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          {testSeries.totalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(testSeries.totalPrice)}
                            </span>
                          )}
                          <span className="text-3xl font-bold">
                            {formatPrice(
                              (testSeries.discountedPrice ??
                                testSeries.finalPrice) ||
                                0
                            )}
                          </span>
                        </div>
                        {testSeries.discountPercentage > 0 && (
                          <Badge
                            variant="secondary"
                            className="w-full justify-center py-1"
                          >
                            {testSeries.discountPercentage}% OFF
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Tests
                      </span>
                      <span className="font-semibold">
                        {testSeries.testCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Questions
                      </span>
                      <span className="font-semibold">
                        {testSeries.totalQuestions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Duration
                      </span>
                      <span className="font-semibold">
                        {testSeries.durationDays} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge
                        variant={testSeries.isActive ? "default" : "secondary"}
                      >
                        {testSeries.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            <TestListSection
              testSeriesId={testSeriesId}
              tests={tests}
              onRefetch={() => {
                refetchTests();
                refetchTestSeries();
              }}
              basePath={basePath}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Enrollment Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Enrollments
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {stats.totalEnrollments || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          All time enrollments
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Active Enrollments
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {stats.activeEnrollments || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Currently active
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Revenue
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPrice(stats.revenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Total revenue generated
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <EditTestSeriesModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          testSeries={testSeries}
          onSuccess={() => {
            refetchTestSeries();
          }}
        />

        <Dialog
          open={isPublishDialogOpen}
          onOpenChange={setIsPublishDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish Test Series</DialogTitle>
              <DialogDescription>
                Are you sure you want to publish this test series? Once
                published, it will be visible to students and ready for
                enrollment.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPublishDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700"
                disabled={publishMutation.isPending}
              >
                {publishMutation.isPending ? "Publishing..." : "Publish"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                test series and all associated tests, sections, and questions.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
