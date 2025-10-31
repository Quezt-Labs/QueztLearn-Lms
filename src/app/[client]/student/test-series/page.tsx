"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Tag,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import {
  useClientTestSeriesList,
  ClientExamType,
} from "@/hooks/test-series-client";
import { ErrorMessage } from "@/components/common/error-message";

const EXAM_FILTERS: (ClientExamType | "ALL")[] = [
  "ALL",
  "JEE",
  "NEET",
  "UPSC",
  "BANK",
  "SSC",
  "GATE",
  "CAT",
  "NDA",
  "CLAT",
  "OTHER",
];

export default function StudentTestSeriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState<ClientExamType | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error } = useClientTestSeriesList({
    page,
    limit,
    exam: examFilter !== "ALL" ? examFilter : undefined,
  });

  const testSeries = data?.data || [];
  const pagination = data?.pagination;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Filter by search query on client side (or you can add it to API)
  const filteredTestSeries = testSeries.filter((series) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      series.title.toLowerCase().includes(query) ||
      series.description?.html?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Series"
        description="Browse and enroll in test series to practice and improve your skills"
        breadcrumbs={[
          { label: "Student", href: "/student/dashboard" },
          { label: "Test Series" },
        ]}
      />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Available Test Series</CardTitle>
          <CardDescription>
            Explore test series for various competitive exams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search test series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Exam Filter */}
            <Select
              value={examFilter}
              onValueChange={(value) => {
                setExamFilter(value as ClientExamType | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Exams" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_FILTERS.map((exam) => (
                  <SelectItem key={exam} value={exam}>
                    {exam === "ALL" ? "All Exams" : exam}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error State */}
          {error && (
            <ErrorMessage
              error="Failed to load test series. Please try again later."
              className="mb-6"
            />
          )}

          {/* Loading State */}
          {isLoading && <LoadingSkeleton />}

          {/* Test Series Grid */}
          {!isLoading && filteredTestSeries.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredTestSeries.map((series, index) => (
                <motion.div
                  key={series.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                    {series.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                        <img
                          src={series.imageUrl}
                          alt={series.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {series.title}
                        </CardTitle>
                        {series.isEnrolled && (
                          <Badge variant="default" className="flex-shrink-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Enrolled
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{series.exam}</Badge>
                        {series.isFree && (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-3 text-sm">
                        {series.durationDays > 0 && (
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            Valid for {series.durationDays} days
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          {series.isFree ? (
                            <span className="text-lg font-semibold text-green-600">
                              Free
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {series.discountPercentage > 0 && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(series.totalPrice)}
                                </span>
                              )}
                              <span className="text-lg font-semibold">
                                {formatPrice(series.finalPrice)}
                              </span>
                              {series.discountPercentage > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  <Tag className="h-3 w-3 mr-1" />
                                  {series.discountPercentage}% OFF
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        asChild
                        className="w-full"
                        variant={series.isEnrolled ? "outline" : "default"}
                      >
                        <Link href={`/student/test-series/${series.id}`}>
                          {series.isEnrolled ? "View Details" : "View & Enroll"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages} (
                {pagination.totalCount} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevious}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredTestSeries.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No test series found" : "No test series available"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Check back later for new test series"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

