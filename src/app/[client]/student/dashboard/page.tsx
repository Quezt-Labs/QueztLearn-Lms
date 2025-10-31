"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  TrendingUp,
  Calendar,
  Play,
  CheckCircle,
  Star,
  Award,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import {
  useClientMyEnrollments,
  ClientTestSeriesListItem,
} from "@/hooks/test-series-client";
import Link from "next/link";

export default function StudentDashboard() {
  const {
    data: testSeriesData,
    isLoading: testSeriesLoading,
    error: testSeriesError,
  } = useClientMyEnrollments({ page: 1, limit: 10 });

  const enrolledTestSeries = testSeriesData?.data || [];
  const totalTestSeries = testSeriesData?.pagination?.totalCount || 0;

  // Calculate test series stats
  const completedTests = enrolledTestSeries.filter(() => {
    // You can add completion logic based on enrollmentDetails if available
    return false; // For now, assume none completed
  }).length;

  // Mock student progress data (can be replaced with real API later)
  const studentProgress = {
    totalTestSeries: totalTestSeries,
    completedTestSeries: completedTests,
    inProgressTestSeries: totalTestSeries - completedTests,
    totalTests: enrolledTestSeries.length * 5, // Estimated
    completedTests: completedTests * 2, // Estimated
    studyStreak: 7,
    totalStudyTime: 24, // hours
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Learning Dashboard"
        description="Track your progress and continue your learning journey."
        breadcrumbs={[{ label: "Student", href: "/student/dashboard" }]}
        actions={
          <Button asChild>
            <Link href="/student/test-series">
              <FileText className="mr-2 h-4 w-4" />
              Browse Test Series
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Enrolled Test Series
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studentProgress.totalTestSeries}
              </div>
              <p className="text-xs text-muted-foreground">
                {studentProgress.completedTestSeries} completed
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
                Study Streak
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studentProgress.studyStreak} days
              </div>
              <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studentProgress.totalStudyTime}h
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  studentProgress.totalTests > 0
                    ? (studentProgress.completedTests /
                        studentProgress.totalTests) *
                        100
                    : 0
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                {studentProgress.completedTests}/{studentProgress.totalTests}{" "}
                tests
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Test Series */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Test Series</CardTitle>
                  <CardDescription>
                    Continue your test preparation
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/student/test-series">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {testSeriesError ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Failed to load test series. Please try again later.
                  </p>
                </div>
              ) : testSeriesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-muted rounded animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : enrolledTestSeries.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t enrolled in any test series yet.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/student/test-series">Browse Test Series</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledTestSeries
                    .slice(0, 3)
                    .map((series: ClientTestSeriesListItem, index: number) => {
                      return (
                        <motion.div
                          key={series.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{series.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{series.exam}</Badge>
                                {series.isFree && (
                                  <Badge variant="secondary">Free</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {series.durationDays > 0 &&
                                `${series.durationDays} days validity`}
                              {series.durationDays === 0 && "Unlimited access"}
                            </p>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/student/test-series/${series.id}`}>
                              <Play className="h-4 w-4" />
                            </Link>
                          </Button>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Classes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Classes</CardTitle>
              <CardDescription>
                Your scheduled learning sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium">React Fundamentals</h4>
                    <p className="text-sm text-muted-foreground">
                      Tomorrow at 2:00 PM
                    </p>
                  </div>
                  <Badge variant="outline">Live</Badge>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium">TypeScript Workshop</h4>
                    <p className="text-sm text-muted-foreground">
                      Friday at 10:00 AM
                    </p>
                  </div>
                  <Badge variant="outline">Workshop</Badge>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium">Q&A Session</h4>
                    <p className="text-sm text-muted-foreground">
                      Next Monday at 3:00 PM
                    </p>
                  </div>
                  <Badge variant="outline">Q&A</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>
              Celebrate your learning milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium">First Course Complete</h4>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">7-Day Streak</h4>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Quick Learner</h4>
                  <p className="text-sm text-muted-foreground">1 week ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
