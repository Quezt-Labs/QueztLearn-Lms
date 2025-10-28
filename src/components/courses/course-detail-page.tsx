"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Users,
  BookOpen,
  Calendar,
  Globe,
  Plus,
  Download,
  Share2,
  Eye,
} from "lucide-react";
import {
  useGetBatch,
  useDeleteBatch,
  useGetTeachersByBatch,
  useDeleteTeacher,
  useGetSubjectsByBatch,
  useDeleteSubject,
} from "@/hooks";
import { TeacherAssignmentModal } from "@/components/common/teacher-assignment-modal";
import { CreateTeacherModal } from "@/components/common/create-teacher-modal";
import { EditTeacherModal } from "@/components/common/edit-teacher-modal";
import { CreateSubjectModal } from "@/components/common/create-subject-modal";
import { EditSubjectModal } from "@/components/common/edit-subject-modal";
import { useCurrentUser } from "@/hooks";
import { ROLES } from "@/lib/constants";
import { SubjectDataTable } from "@/components/courses/subject-data-table";

// Interfaces
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

interface Teacher {
  id: string;
  name: string;
  imageUrl?: string;
  highlights: string;
  subjects: string[];
  batchIds: string[];
  rating?: number;
  experience?: string;
  totalStudents?: number;
  totalCourses?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Subject {
  id: string;
  name: string;
  batchId: string;
  description?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CourseDetailPageProps {
  basePath?: "admin" | "teacher";
  showSubjectsTab?: boolean;
  showAnalyticsTab?: boolean;
  showSettingsTab?: boolean;
}

export function CourseDetailPage({
  basePath = "admin",
  showSubjectsTab = true,
  showAnalyticsTab = true,
  showSettingsTab = true,
}: CourseDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;
  const { data: currentUser } = useCurrentUser();

  // Detect role from current path
  const currentRole = basePath === "admin" ? ROLES.ADMIN : ROLES.TEACHER;
  const isAdmin = currentRole === ROLES.ADMIN;
  const isTeacher = currentRole === ROLES.TEACHER;

  // Allow both admin and teacher to manage courses
  const canManageCourse = isAdmin || isTeacher;

  // State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTeacherAssignmentOpen, setIsTeacherAssignmentOpen] = useState(false);
  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // API Hooks
  const { data: batch, isLoading } = useGetBatch(courseId);
  const { data: teachers, isLoading: teachersLoading } =
    useGetTeachersByBatch(courseId);
  const { data: subjects, isLoading: subjectsLoading } =
    useGetSubjectsByBatch(courseId);
  const deleteBatchMutation = useDeleteBatch();
  const deleteTeacherMutation = useDeleteTeacher();
  const deleteSubjectMutation = useDeleteSubject();

  // Handlers
  const handleGoBack = () => {
    router.push(`/${basePath}/courses`);
  };

  const handleEditCourse = () => {
    router.push(`/${basePath}/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteBatchMutation.mutate(courseId, {
      onSuccess: () => {
        router.push(`/${basePath}/courses`);
      },
    });
  };

  const handleAssignTeachers = () => {
    setIsTeacherAssignmentOpen(true);
  };

  const handleCreateTeacher = () => {
    setIsCreateTeacherOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher({
      ...teacher,
      highlights: teacher.highlights || "",
      subjects: teacher.subjects || [],
      batchIds: teacher.batchIds || [],
    });
    setIsEditTeacherOpen(true);
  };

  const handleTeacherCreated = () => {
    queryClient.invalidateQueries({
      queryKey: ["teachers", "batch", courseId],
    });
  };

  const handleTeacherUpdated = () => {
    queryClient.invalidateQueries({
      queryKey: ["teachers", "batch", courseId],
    });
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (window.confirm(`Are you sure you want to remove ${teacher.name}?`)) {
      deleteTeacherMutation.mutate(teacher.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["teachers", "batch", courseId],
          });
        },
      });
    }
  };

  const handleCreateSubject = () => {
    setIsCreateSubjectOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject({
      ...subject,
      batchId: subject.batchId || courseId,
    } as Subject);
    setIsEditSubjectOpen(true);
  };

  const handleSubjectCreated = () => {
    queryClient.invalidateQueries({
      queryKey: ["subjects", "batch", courseId],
    });
  };

  const handleSubjectUpdated = () => {
    queryClient.invalidateQueries({
      queryKey: ["subjects", "batch", courseId],
    });
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (window.confirm(`Are you sure you want to delete ${subject.name}?`)) {
      deleteSubjectMutation.mutate(subject.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["subjects", "batch", courseId],
          });
        },
      });
    }
  };

  const handleViewSubject = (subject: Subject) => {
    router.push(`/${basePath}/courses/${courseId}/subjects/${subject.id}`);
  };

  // Helper functions
  const getStatusBadge = (course: Batch) => {
    const now = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);

    if (now < startDate) {
      return <Badge className="bg-blue-500">Upcoming</Badge>;
    } else if (now > endDate) {
      return <Badge className="bg-gray-500">Completed</Badge>;
    } else {
      return <Badge className="bg-green-500">Active</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    const discountPrice = price * (1 - 0.01);
    return {
      original: price.toLocaleString(),
      discounted: discountPrice.toLocaleString(),
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const courseData = batch?.data as Batch;

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Course not found</p>
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
              Back to Courses
            </Button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-3xl font-bold tracking-tight">
                  {courseData.name}
                </h1>
                {getStatusBadge(courseData)}
              </div>
              <p className="text-muted-foreground text-lg mb-4">
                {courseData.description}
              </p>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Class {courseData.class}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{courseData.exam}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>{courseData.language}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(courseData.startDate)} -{" "}
                    {formatDate(courseData.endDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {canManageCourse && (
                <>
                  <Button variant="outline" onClick={handleEditCourse}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" onClick={handleDeleteCourse}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
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
          <TabsList
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${
                [showSubjectsTab, showAnalyticsTab, showSettingsTab].filter(
                  Boolean
                ).length + 3
              }, minmax(0, 1fr))`,
            }}
          >
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {showSubjectsTab && (
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
            )}
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            {showAnalyticsTab && (
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            )}
            {showSettingsTab && (
              <TabsTrigger value="settings">Settings</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">
                        {courseData.description}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">FAQ</h3>
                      {courseData.faq && courseData.faq.length > 0 ? (
                        <div className="space-y-4">
                          {courseData.faq.map((faq, index) => (
                            <div key={index}>
                              <h4 className="font-medium">{faq.title}</h4>
                              <p className="text-muted-foreground">
                                {faq.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          No FAQ available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{formatPrice(courseData.totalPrice).original}
                        </span>
                        <span className="text-2xl font-bold">
                          ₹{formatPrice(courseData.totalPrice).discounted}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {courseData.discountPercentage}% discount
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Subjects Tab */}
          {showSubjectsTab && (
            <TabsContent value="subjects" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Subjects</CardTitle>
                  {canManageCourse && (
                    <Button onClick={handleCreateSubject}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subject
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {subjectsLoading ? (
                    <div className="text-center py-8">Loading subjects...</div>
                  ) : subjects?.data && subjects.data.length > 0 ? (
                    <SubjectDataTable
                      subjects={subjects.data as Subject[]}
                      basePath={basePath}
                      courseId={courseId}
                      onEdit={handleEditSubject}
                      onDelete={handleDeleteSubject}
                      canManageCourse={canManageCourse}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No subjects added yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Teachers</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleAssignTeachers}>
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Teacher
                  </Button>
                  {canManageCourse && (
                    <Button onClick={handleCreateTeacher}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Teacher
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {teachersLoading ? (
                  <div className="text-center py-8">Loading teachers...</div>
                ) : teachers?.data && teachers.data.length > 0 ? (
                  <div className="space-y-4">
                    {teachers.data.map((teacher: Teacher) => (
                      <Card key={teacher.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarImage src={teacher.imageUrl} />
                                <AvatarFallback>
                                  {teacher.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">
                                  {teacher.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {teacher.highlights}
                                </p>
                              </div>
                            </div>
                            {canManageCourse && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditTeacher(teacher)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteTeacher(teacher)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No teachers assigned yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Student management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {showAnalyticsTab && (
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Analytics coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {showSettingsTab && (
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Settings coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Modals */}
        <TeacherAssignmentModal
          isOpen={isTeacherAssignmentOpen}
          onClose={() => setIsTeacherAssignmentOpen(false)}
          batchId={courseId}
          batchName={courseData.name}
        />

        <CreateTeacherModal
          isOpen={isCreateTeacherOpen}
          onClose={() => setIsCreateTeacherOpen(false)}
          batchId={courseId}
          onSuccess={handleTeacherCreated}
        />

        <EditTeacherModal
          isOpen={isEditTeacherOpen}
          onClose={() => {
            setIsEditTeacherOpen(false);
            setSelectedTeacher(null);
          }}
          teacher={selectedTeacher}
          onSuccess={handleTeacherUpdated}
        />

        {showSubjectsTab && (
          <>
            <CreateSubjectModal
              isOpen={isCreateSubjectOpen}
              onClose={() => setIsCreateSubjectOpen(false)}
              batchId={courseId}
              onSuccess={handleSubjectCreated}
            />

            <EditSubjectModal
              isOpen={isEditSubjectOpen}
              onClose={() => {
                setIsEditSubjectOpen(false);
                setSelectedSubject(null);
              }}
              subject={selectedSubject}
              onSuccess={handleSubjectUpdated}
            />
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Course</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this course? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
