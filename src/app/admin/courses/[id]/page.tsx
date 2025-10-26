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
  GraduationCap,
  Plus,
  Settings,
  BarChart3,
  FileText,
  Video,
  ImageIcon,
  Download,
  Share2,
  X,
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
import { FileUpload } from "@/components/common/file-upload";

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
  subjects: string[];
  highlights: string;
  batchIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Subject {
  id: string;
  name: string;
  batchId: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTeacherAssignmentOpen, setIsTeacherAssignmentOpen] = useState(false);
  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: batch, isLoading } = useGetBatch(courseId);
  const { data: teachers, isLoading: teachersLoading } =
    useGetTeachersByBatch(courseId);
  const { data: subjects, isLoading: subjectsLoading } =
    useGetSubjectsByBatch(courseId);
  const deleteBatchMutation = useDeleteBatch();
  const deleteTeacherMutation = useDeleteTeacher();
  const deleteSubjectMutation = useDeleteSubject();

  const handleGoBack = () => {
    router.push("/admin/courses");
  };

  const handleEditCourse = () => {
    router.push(`/admin/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteBatchMutation.mutate(courseId, {
      onSuccess: () => {
        router.push("/admin/courses");
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
    setSelectedTeacher(teacher);
    setIsEditTeacherOpen(true);
  };

  const handleTeacherCreated = () => {
    // Invalidate teachers query to refetch data
    queryClient.invalidateQueries({
      queryKey: ["teachers", "batch", courseId],
    });
  };

  const handleTeacherUpdated = () => {
    // Invalidate teachers query to refetch data
    queryClient.invalidateQueries({
      queryKey: ["teachers", "batch", courseId],
    });
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${teacher.name}? This action cannot be undone.`
      )
    ) {
      try {
        await deleteTeacherMutation.mutateAsync(teacher.id);
        // Invalidate teachers query to refetch data
        queryClient.invalidateQueries({
          queryKey: ["teachers", "batch", courseId],
        });
      } catch (error) {
        console.error("Failed to delete teacher:", error);
      }
    }
  };

  const handleCreateSubject = () => {
    setIsCreateSubjectOpen(true);
  };

  const handleSubjectCreated = () => {
    queryClient.invalidateQueries({
      queryKey: ["subjects", "batch", courseId],
    });
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${subject.name}? This action cannot be undone.`
      )
    ) {
      try {
        await deleteSubjectMutation.mutateAsync(subject.id);
        queryClient.invalidateQueries({
          queryKey: ["subjects", "batch", courseId],
        });
      } catch (error) {
        console.error("Failed to delete subject:", error);
      }
    }
  };

  const handleViewSubject = (subjectId: string) => {
    router.push(`/admin/courses/${courseId}/subjects/${subjectId}`);
  };

  const handleSubjectUpdated = () => {
    queryClient.invalidateQueries({
      queryKey: ["subjects", "batch", courseId],
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading course details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!batch?.data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Course not found</h2>
            <p className="text-muted-foreground mb-4">
              The course you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const courseData = batch.data as Batch;

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
              <Button variant="outline" onClick={handleAssignTeachers}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Assign Teachers
              </Button>
              <Button variant="outline" onClick={handleEditCourse}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Course
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteCourse}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Course Image */}
        {courseData.imageUrl && (
          <div className="mb-8">
            <div className="h-64 w-full rounded-lg overflow-hidden relative">
              <Image
                src={courseData.imageUrl}
                alt={`Course image for ${courseData.name}`}
                className="w-full h-full object-cover"
                fill
                priority
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Class
                        </p>
                        <p className="text-lg">{courseData.class}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Exam
                        </p>
                        <p className="text-lg">{courseData.exam}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Language
                        </p>
                        <p className="text-lg">{courseData.language}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-lg">
                          {Math.ceil(
                            (new Date(courseData.endDate).getTime() -
                              new Date(courseData.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ Section */}
                {courseData.faq && courseData.faq.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {courseData.faq.map((faq, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-primary pl-4"
                          >
                            <h4 className="font-medium mb-2">{faq.title}</h4>
                            <p className="text-muted-foreground">
                              {faq.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Pricing Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Original Price
                        </span>
                        <span className="text-lg font-semibold">
                          {formatPrice(courseData.totalPrice)}
                        </span>
                      </div>
                      {courseData.discountPercentage > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Discount
                          </span>
                          <Badge variant="destructive">
                            {courseData.discountPercentage}% OFF
                          </Badge>
                        </div>
                      )}
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Final Price</span>
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(
                              calculateDiscountedPrice(
                                courseData.totalPrice,
                                courseData.discountPercentage
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Teacher Card */}
                {courseData.teacher && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Assigned Teacher</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={courseData.teacher.imageUrl}
                            alt={courseData.teacher.name}
                          />
                          <AvatarFallback>
                            {getInitials(courseData.teacher.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {courseData.teacher.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Instructor
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Course
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Course Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Subjects</CardTitle>
                  <Button variant="outline" onClick={handleCreateSubject}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subject
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {subjectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">
                      Loading subjects...
                    </span>
                  </div>
                ) : subjects?.data && subjects.data.length > 0 ? (
                  <div className="space-y-3">
                    {subjects.data.map((subject: Subject) => (
                      <Card
                        key={subject.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {subject.thumbnailUrl && (
                                <div className="h-12 w-12 relative rounded overflow-hidden">
                                  <Image
                                    src={subject.thumbnailUrl}
                                    alt={subject.name}
                                    className="object-cover"
                                    fill
                                    sizes="48px"
                                  />
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-base">
                                  {subject.name}
                                </h3>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewSubject(subject.id)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewSubject(subject.id)}
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSubject(subject)}
                                className="text-red-500 hover:text-red-700"
                                disabled={deleteSubjectMutation.isPending}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">
                      No subjects added yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding subjects to this course.
                    </p>
                    <Button onClick={handleCreateSubject}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Assigned Teachers</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleCreateTeacher}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Teacher
                    </Button>
                    <Button onClick={handleAssignTeachers}>
                      <Plus className="mr-2 h-4 w-4" />
                      Assign Teachers
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {teachersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">
                      Loading teachers...
                    </span>
                  </div>
                ) : teachers?.data && teachers.data.length > 0 ? (
                  <div className="space-y-4">
                    {teachers.data.map((teacher: Teacher) => (
                      <Card
                        key={teacher.id}
                        className="border-l-4 border-l-primary"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage
                                src={teacher.imageUrl}
                                alt={teacher.name}
                              />
                              <AvatarFallback className="text-lg">
                                {getInitials(teacher.name)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                  {teacher.name}
                                </h3>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditTeacher(teacher)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteTeacher(teacher)}
                                    disabled={deleteTeacherMutation.isPending}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    {deleteTeacherMutation.isPending
                                      ? "Deleting..."
                                      : "Remove"}
                                  </Button>
                                </div>
                              </div>

                              {teacher.subjects &&
                                teacher.subjects.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {teacher.subjects.map((subject) => (
                                      <Badge key={subject} variant="secondary">
                                        {subject}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                              {teacher.highlights && (
                                <div className="mt-3">
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                    Highlights & Achievements
                                  </h4>
                                  <div
                                    className="text-sm text-muted-foreground prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{
                                      __html: teacher.highlights.replace(
                                        /\n/g,
                                        "<br>"
                                      ),
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No teachers assigned</h3>
                    <p className="text-muted-foreground mb-4">
                      Create a new teacher or assign existing teachers to this
                      course.
                    </p>
                    <div className="flex space-x-2 justify-center">
                      <Button variant="outline" onClick={handleCreateTeacher}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Teacher
                      </Button>
                      <Button onClick={handleAssignTeachers}>
                        <Plus className="mr-2 h-4 w-4" />
                        Assign Teachers
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No students enrolled</h3>
                  <p className="text-muted-foreground">
                    Students will appear here once they enroll in this course.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Course Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No analytics data</h3>
                  <p className="text-muted-foreground">
                    Analytics will be available once students start enrolling
                    and engaging with the course.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Settings</h3>
                  <p className="text-muted-foreground">
                    Course settings and configuration options will be available
                    here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Course</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{courseData.name}
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

        {/* Teacher Assignment Modal */}
        <TeacherAssignmentModal
          isOpen={isTeacherAssignmentOpen}
          onClose={() => setIsTeacherAssignmentOpen(false)}
          batchId={courseId}
          batchName={courseData.name}
          onAssignmentChange={() => {
            // Refresh course data
            // This will be handled by the query invalidation in the hooks
          }}
        />

        {/* Create Teacher Modal */}
        <CreateTeacherModal
          isOpen={isCreateTeacherOpen}
          onClose={() => setIsCreateTeacherOpen(false)}
          batchId={courseId}
          onSuccess={handleTeacherCreated}
        />

        {/* Edit Teacher Modal */}
        <EditTeacherModal
          isOpen={isEditTeacherOpen}
          onClose={() => {
            setIsEditTeacherOpen(false);
            setSelectedTeacher(null);
          }}
          teacher={selectedTeacher}
          batchId={courseId}
          onSuccess={handleTeacherUpdated}
        />

        {/* Create Subject Modal */}
        <CreateSubjectModal
          isOpen={isCreateSubjectOpen}
          onClose={() => setIsCreateSubjectOpen(false)}
          batchId={courseId}
          onSuccess={handleSubjectCreated}
        />

        {/* Edit Subject Modal */}
        <EditSubjectModal
          isOpen={isEditSubjectOpen}
          onClose={() => {
            setIsEditSubjectOpen(false);
            setSelectedSubject(null);
          }}
          subject={selectedSubject}
          onSuccess={handleSubjectUpdated}
        />
      </div>
    </div>
  );
}
