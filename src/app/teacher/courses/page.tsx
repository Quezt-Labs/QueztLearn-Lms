"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Star,
  BarChart3,
} from "lucide-react";

// Mock data for teacher's courses
const mockCourses = [
  {
    id: "1",
    name: "JEE Main Physics Complete Course",
    description:
      "Comprehensive physics course covering all JEE Main topics with detailed explanations and practice problems.",
    class: "12th",
    exam: "JEE Main",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
    totalPrice: 15000,
    discountedPrice: 12000,
    discountPercentage: 20,
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    validity: "1 year",
    status: "published",
    students: 1250,
    rating: 4.8,
    subjects: 3,
    chapters: 15,
    lectures: 120,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
    revenue: 15000000, // 1250 students * 12000 price
    completionRate: 78,
  },
  {
    id: "2",
    name: "Advanced Physics Concepts",
    description:
      "Deep dive into advanced physics concepts for competitive exams.",
    class: "12th",
    exam: "JEE Advanced",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop",
    totalPrice: 20000,
    discountedPrice: 18000,
    discountPercentage: 10,
    startDate: "2024-02-01",
    endDate: "2024-12-31",
    validity: "1 year",
    status: "published",
    students: 850,
    rating: 4.9,
    subjects: 2,
    chapters: 12,
    lectures: 90,
    createdAt: "2024-01-25",
    updatedAt: "2024-02-01",
    revenue: 15300000, // 850 students * 18000 price
    completionRate: 82,
  },
  {
    id: "3",
    name: "Physics Problem Solving Techniques",
    description:
      "Master problem-solving strategies for physics competitive exams.",
    class: "12th",
    exam: "NEET",
    language: "English",
    imageUrl:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop",
    totalPrice: 12000,
    discountedPrice: 10000,
    discountPercentage: 16.67,
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    validity: "1 year",
    status: "draft",
    students: 0,
    rating: 0,
    subjects: 1,
    chapters: 8,
    lectures: 60,
    createdAt: "2024-02-15",
    updatedAt: "2024-02-20",
    revenue: 0,
    completionRate: 0,
  },
];

export default function TeacherCoursesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCourse = () => {
    router.push("/teacher/courses/create");
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/teacher/courses/${courseId}/edit`);
  };

  const handleViewCourse = (courseId: string) => {
    router.push(`/teacher/courses/${courseId}`);
  };

  const handleDeleteCourse = (course: { id: string; name: string }) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Implement delete API call
    console.log("Deleting course:", selectedCourse?.id);
    setIsDeleteDialogOpen(false);
    setSelectedCourse(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalRevenue = mockCourses.reduce(
    (sum, course) => sum + course.revenue,
    0
  );
  const totalStudents = mockCourses.reduce(
    (sum, course) => sum + course.students,
    0
  );
  const averageRating =
    mockCourses
      .filter((c) => c.rating > 0)
      .reduce((sum, course) => sum + course.rating, 0) /
      mockCourses.filter((c) => c.rating > 0).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
              <p className="text-muted-foreground mt-2">
                Manage your courses and track their performance
              </p>
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
                    My Courses
                  </p>
                  <p className="text-2xl font-bold">{mockCourses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold">
                    {totalStudents.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPrice(totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg Rating
                  </p>
                  <p className="text-2xl font-bold">
                    {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
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
                    placeholder="Search your courses..."
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
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <Image
                  src={course.imageUrl}
                  alt={course.name}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  {getStatusBadge(course.status)}
                </div>
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-black">
                    {course.class}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {course.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {course.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{course.lectures} lectures</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {course.rating > 0 ? course.rating : "No rating"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span>{course.completionRate}% completion</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Revenue:
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatPrice(course.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Price:
                      </span>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatPrice(course.discountedPrice)}
                        </p>
                        {course.discountPercentage > 0 && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(course.totalPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      Updated: {formatDate(course.updatedAt)}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCourse(course.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCourse(course.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCourse(course)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
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
                Are you sure you want to delete &quot;{selectedCourse?.name}
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
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
