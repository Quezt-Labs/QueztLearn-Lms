"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  Calendar,
  Globe,
} from "lucide-react";
import { useGetAllBatches, useDeleteBatch } from "@/hooks";
import { CreateBatchModal } from "@/components/common/create-batch-modal";
import { EditBatchModal } from "@/components/common/edit-batch-modal";
import { useRolePermissions } from "@/hooks/common";

interface Batch {
  id: string;
  name: string;
  description: string;
  class: string;
  exam: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  language: string;
  totalPrice: number;
  discountPercentage: number;
  faq: Array<{
    title: string;
    description: string;
  }>;
  teacherId: string;
  teacher?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface CourseListPageProps {
  basePath: "admin" | "teacher";
  title?: string;
  subtitle?: string;
  showEditButton?: boolean;
  displayMode?: "list" | "grid";
  headerTitle?: string;
}

export function CourseListPage({
  basePath,
  title,
  subtitle,
  showEditButton = true,
  displayMode = "list",
  headerTitle,
}: CourseListPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBatchForEdit, setSelectedBatchForEdit] =
    useState<Batch | null>(null);

  const { data: batches, isLoading } = useGetAllBatches();
  const deleteBatchMutation = useDeleteBatch();
  const { isAdmin, isTeacher, canDeleteCourses } = useRolePermissions();

  // Allow both admin and teacher to manage courses
  const canManageCourse = isAdmin || isTeacher;

  // Default titles based on basePath
  const defaultTitle =
    title || (basePath === "admin" ? "All Courses" : "My Courses");
  const defaultSubtitle =
    subtitle ||
    (basePath === "admin"
      ? "Manage your courses and batch assignments"
      : "Manage your courses and teaching assignments");

  const filteredBatches = (batches?.data || []).filter((batch: Batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.class.toLowerCase().includes(searchQuery.toLowerCase());

    const now = new Date();
    const startDate = new Date(batch.startDate);
    const endDate = new Date(batch.endDate);

    let matchesStatus = true;
    if (statusFilter === "upcoming") {
      matchesStatus = startDate > now;
    } else if (statusFilter === "ongoing") {
      matchesStatus = startDate <= now && endDate >= now;
    } else if (statusFilter === "completed") {
      matchesStatus = endDate < now;
    }

    return matchesSearch && matchesStatus;
  });

  const handleCreateCourse = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewCourse = (batchId: string) => {
    router.push(`/${basePath}/courses/${batchId}`);
  };

  const handleEditCourse = (batchId: string) => {
    if (basePath === "admin" && isAdmin) {
      const batch = batches?.data?.find((b: Batch) => b.id === batchId);
      if (batch) {
        setSelectedBatchForEdit(batch);
        setIsEditModalOpen(true);
      }
    } else {
      router.push(`/${basePath}/courses/${batchId}/edit`);
    }
  };

  const handleBatchUpdated = () => {
    // Refresh the page or refetch data
    window.location.reload();
  };

  const handleDeleteCourse = (batch: { id: string; name: string }) => {
    if (canManageCourse) {
      setSelectedBatch(batch);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (selectedBatch) {
      deleteBatchMutation.mutate(selectedBatch.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedBatch(null);
        },
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const calculateDiscountedPrice = (
    totalPrice: number,
    discountPercentage: number
  ) => {
    return totalPrice - (totalPrice * discountPercentage) / 100;
  };

  const getStatusBadge = (batch: Batch) => {
    const now = new Date();
    const startDate = new Date(batch.startDate);
    const endDate = new Date(batch.endDate);

    if (startDate > now) {
      return <Badge variant="secondary">Upcoming</Badge>;
    } else if (startDate <= now && endDate >= now) {
      return <Badge variant="default">Ongoing</Badge>;
    } else {
      return <Badge variant="outline">Completed</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {headerTitle || defaultTitle}
              </h1>
              <p className="text-muted-foreground mt-2">{defaultSubtitle}</p>
            </div>
            <Button onClick={handleCreateCourse} className="bg-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Courses
                  </p>
                  <p className="text-2xl font-bold">
                    {batches?.data?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Courses
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      filteredBatches.filter((batch: Batch) => {
                        const now = new Date();
                        const startDate = new Date(batch.startDate);
                        const endDate = new Date(batch.endDate);
                        return startDate <= now && endDate >= now;
                      }).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Upcoming
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      filteredBatches.filter((batch: Batch) => {
                        const now = new Date();
                        const startDate = new Date(batch.startDate);
                        return startDate > now;
                      }).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPrice(
                      (batches?.data || []).reduce(
                        (sum: number, batch: Batch) =>
                          sum + (batch.totalPrice || 0),
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search courses, exams, classes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Display */}
        {displayMode === "list" ? (
          // List View (Admin Style)
          <div className="space-y-3">
            {filteredBatches.map((batch: Batch) => (
              <Card
                key={batch.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-base">
                          {batch.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Class {batch.class} • {batch.exam}
                        </p>
                      </div>
                      {getStatusBadge(batch)}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCourse(batch.id)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      {canManageCourse && showEditButton && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCourse(batch.id)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                      )}
                      {canManageCourse && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(batch)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Grid View (Teacher Style)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch: Batch) => (
              <Card
                key={batch.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                    {batch.imageUrl ? (
                      <Image
                        src={batch.imageUrl}
                        alt={batch.name}
                        className="w-full h-full object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(batch)}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {batch.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>Class {batch.class}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{batch.exam}</span>
                          </div>
                        </div>
                      </div>

                      {batch.teacher && (
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={batch.teacher.imageUrl}
                              alt={batch.teacher.name}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(batch.teacher.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {batch.teacher.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Instructor
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Starts: {formatDate(batch.startDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Ends: {formatDate(batch.endDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{batch.language}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(
                              calculateDiscountedPrice(
                                batch.totalPrice,
                                batch.discountPercentage
                              )
                            )}
                          </p>
                          {batch.discountPercentage > 0 && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatPrice(batch.totalPrice)}
                            </p>
                          )}
                        </div>
                        {batch.discountPercentage > 0 && (
                          <Badge variant="destructive">
                            {batch.discountPercentage}% OFF
                          </Badge>
                        )}
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCourse(batch.id)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        {canManageCourse && showEditButton && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCourse(batch.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canManageCourse && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCourse(batch)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredBatches.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "Get started by creating your first course"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={handleCreateCourse}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Course
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Course</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedBatch?.name}
                &quot;? This action cannot be undone. All associated data
                including student enrollments will be permanently removed.
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
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteBatchMutation.isPending}
              >
                {deleteBatchMutation.isPending
                  ? "Deleting..."
                  : "Delete Course"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Batch Modal */}
        <CreateBatchModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
          }}
        />

        {/* Edit Batch Modal - Only for Admin */}
        {isAdmin && (
          <EditBatchModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedBatchForEdit(null);
            }}
            batch={selectedBatchForEdit}
            onSuccess={handleBatchUpdated}
          />
        )}
      </div>
    </div>
  );
}
