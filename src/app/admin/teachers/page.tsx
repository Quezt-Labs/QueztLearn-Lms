"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  GraduationCap,
  Star,
  Clock,
} from "lucide-react";

// Mock data for teachers
const mockTeachers = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    subjects: ["Physics", "Mathematics"],
    highlights: {
      experience: "10+ years",
      education: "PhD in Physics",
      achievements: ["Best Teacher Award 2023", "Published 15 Research Papers"],
    },
    batchIds: ["batch-1", "batch-2"],
    batches: [
      { id: "batch-1", name: "JEE 2026 Master Batch" },
      { id: "batch-2", name: "NEET Biology Masterclass" },
    ],
    rating: 4.9,
    students: 1250,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Prof. Michael Chen",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    subjects: ["Mathematics", "Chemistry"],
    highlights: {
      experience: "8+ years",
      education: "MSc in Mathematics",
      achievements: ["IIT Graduate", "JEE Expert"],
    },
    batchIds: ["batch-3"],
    batches: [{ id: "batch-3", name: "Mathematics for JEE Advanced" }],
    rating: 4.8,
    students: 800,
    createdAt: "2024-01-20",
    updatedAt: "2024-02-01",
  },
  {
    id: "3",
    name: "Dr. Priya Sharma",
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    subjects: ["Biology", "Chemistry"],
    highlights: {
      experience: "12+ years",
      education: "PhD in Biology",
      achievements: ["NEET Expert", "Medical College Professor"],
    },
    batchIds: ["batch-2"],
    batches: [{ id: "batch-2", name: "NEET Biology Masterclass" }],
    rating: 4.9,
    students: 2100,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
];

export default function AdminTeachersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredTeachers = mockTeachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some((subject) =>
        subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesSubject =
      subjectFilter === "all" || teacher.subjects.includes(subjectFilter);
    return matchesSearch && matchesSubject;
  });

  const handleCreateTeacher = () => {
    router.push("/admin/teachers/create");
  };

  const handleEditTeacher = (teacherId: string) => {
    router.push(`/admin/teachers/${teacherId}/edit`);
  };

  const handleViewTeacher = (teacherId: string) => {
    router.push(`/admin/teachers/${teacherId}`);
  };

  const handleDeleteTeacher = (teacher: { id: string; name: string }) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Implement delete API call
    console.log("Deleting teacher:", selectedTeacher?.id);
    setIsDeleteDialogOpen(false);
    setSelectedTeacher(null);
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
      month: "short",
      day: "numeric",
    });
  };

  const allSubjects = Array.from(
    new Set(mockTeachers.flatMap((teacher) => teacher.subjects))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                All Teachers
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage teachers and their batch assignments
              </p>
            </div>
            <Button onClick={handleCreateTeacher} className="bg-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Teachers
                  </p>
                  <p className="text-2xl font-bold">{mockTeachers.length}</p>
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
                    {mockTeachers
                      .reduce((sum, teacher) => sum + teacher.students, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg Rating
                  </p>
                  <p className="text-2xl font-bold">
                    {(
                      mockTeachers.reduce(
                        (sum, teacher) => sum + teacher.rating,
                        0
                      ) / mockTeachers.length
                    ).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Batches
                  </p>
                  <p className="text-2xl font-bold">
                    {mockTeachers.reduce(
                      (sum, teacher) => sum + teacher.batchIds.length,
                      0
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
                    placeholder="Search teachers, subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {allSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <Card
              key={teacher.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={teacher.imageUrl} alt={teacher.name} />
                    <AvatarFallback className="text-lg">
                      {getInitials(teacher.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {teacher.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">
                            {teacher.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({teacher.students.toLocaleString()} students)
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTeacher(teacher.id)}
                          aria-label={`View ${teacher.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTeacher(teacher.id)}
                          aria-label={`Edit ${teacher.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Delete ${teacher.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {teacher.subjects.map((subject) => (
                          <Badge
                            key={subject}
                            variant="secondary"
                            className="text-xs"
                          >
                            {subject}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{teacher.highlights.experience}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>{teacher.highlights.education}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">
                          Assigned Batches:
                        </p>
                        <div className="space-y-1">
                          {teacher.batches.map((batch) => (
                            <div
                              key={batch.id}
                              className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded"
                            >
                              {batch.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mt-3">
                        Added: {formatDate(teacher.createdAt)} • Updated:{" "}
                        {formatDate(teacher.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No teachers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || subjectFilter !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "Get started by adding your first teacher"}
              </p>
              {!searchQuery && subjectFilter === "all" && (
                <Button onClick={handleCreateTeacher}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Teacher
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Teacher</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedTeacher?.name}
                &quot;? This action cannot be undone. The teacher will be
                removed from all assigned batches.
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
                Delete Teacher
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
