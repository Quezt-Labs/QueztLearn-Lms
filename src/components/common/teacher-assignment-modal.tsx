"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, X, Star, Users, Check } from "lucide-react";
import {
  useGetTeachersByBatch,
  useAssignTeacherToBatch,
  useRemoveTeacherFromBatch,
} from "@/hooks";

interface TeacherAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  batchName: string;
  onAssignmentChange?: () => void;
}

// Mock data for available teachers
const mockAvailableTeachers = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    subjects: ["Physics", "Mathematics"],
    rating: 4.9,
    students: 1250,
    experience: "10+ years",
  },
  {
    id: "2",
    name: "Prof. Michael Chen",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    subjects: ["Mathematics", "Chemistry"],
    rating: 4.8,
    students: 800,
    experience: "8+ years",
  },
  {
    id: "3",
    name: "Dr. Priya Sharma",
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    subjects: ["Biology", "Chemistry"],
    rating: 4.9,
    students: 2100,
    experience: "12+ years",
  },
  {
    id: "4",
    name: "Dr. Rajesh Kumar",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    subjects: ["Physics", "Chemistry"],
    rating: 4.7,
    students: 950,
    experience: "9+ years",
  },
];

export function TeacherAssignmentModal({
  isOpen,
  onClose,
  batchId,
  batchName,
  onAssignmentChange,
}: TeacherAssignmentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [assignedTeachers, setAssignedTeachers] = useState<string[]>([]);

  const { data: batchTeachers, isLoading } = useGetTeachersByBatch(batchId);
  const assignTeacherMutation = useAssignTeacherToBatch();
  const removeTeacherMutation = useRemoveTeacherFromBatch();

  // Mock assigned teachers for now
  const mockAssignedTeachers = ["1", "2"];

  useEffect(() => {
    if (batchTeachers?.data) {
      setAssignedTeachers(
        batchTeachers.data.map((teacher: { id: string }) => teacher.id)
      );
    } else {
      // Use mock data for now
      setAssignedTeachers(mockAssignedTeachers);
    }
  }, [batchTeachers]);

  const filteredTeachers = mockAvailableTeachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some((subject) =>
        subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  const handleTeacherSelect = (teacherId: string) => {
    if (selectedTeachers.includes(teacherId)) {
      setSelectedTeachers((prev) => prev.filter((id) => id !== teacherId));
    } else {
      setSelectedTeachers((prev) => [...prev, teacherId]);
    }
  };

  const handleAssignTeachers = async () => {
    try {
      for (const teacherId of selectedTeachers) {
        if (!assignedTeachers.includes(teacherId)) {
          await assignTeacherMutation.mutateAsync({
            teacherId,
            batchId,
          });
        }
      }
      setSelectedTeachers([]);
      onAssignmentChange?.();
    } catch (error) {
      console.error("Failed to assign teachers:", error);
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    try {
      await removeTeacherMutation.mutateAsync({
        teacherId,
        batchId,
      });
      onAssignmentChange?.();
    } catch (error) {
      console.error("Failed to remove teacher:", error);
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

  const isTeacherAssigned = (teacherId: string) => {
    return assignedTeachers.includes(teacherId);
  };

  const isTeacherSelected = (teacherId: string) => {
    return selectedTeachers.includes(teacherId);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign Teachers to {batchName}</DialogTitle>
            <DialogDescription>
              Select teachers to assign to this batch
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading teachers...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Assign Teachers to {batchName}</DialogTitle>
          <DialogDescription>
            Select teachers to assign to this batch. You can assign multiple
            teachers at once.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-6 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search teachers by name or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
            {/* Available Teachers */}
            <div className="space-y-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Available Teachers</h3>
                <Badge variant="outline">
                  {filteredTeachers.length} teachers
                </Badge>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-96">
                {filteredTeachers.map((teacher) => (
                  <Card
                    key={teacher.id}
                    className={`cursor-pointer transition-all ${
                      isTeacherSelected(teacher.id)
                        ? "ring-2 ring-primary bg-primary/5"
                        : isTeacherAssigned(teacher.id)
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-md"
                    }`}
                    onClick={() =>
                      !isTeacherAssigned(teacher.id) &&
                      handleTeacherSelect(teacher.id)
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={teacher.imageUrl}
                            alt={teacher.name}
                          />
                          <AvatarFallback className="text-sm">
                            {getInitials(teacher.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium truncate">
                              {teacher.name}
                            </h4>
                            {isTeacherSelected(teacher.id) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                            {isTeacherAssigned(teacher.id) && (
                              <Badge variant="secondary" className="text-xs">
                                Assigned
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">
                              {teacher.rating}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {teacher.students.toLocaleString()} students
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {teacher.subjects.map((subject) => (
                              <Badge
                                key={subject}
                                variant="outline"
                                className="text-xs"
                              >
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Assigned Teachers */}
            <div className="space-y-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Assigned Teachers</h3>
                <Badge variant="outline">
                  {mockAssignedTeachers.length} assigned
                </Badge>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-96">
                {mockAssignedTeachers.map((teacherId) => {
                  const teacher = mockAvailableTeachers.find(
                    (t) => t.id === teacherId
                  );
                  if (!teacher) return null;

                  return (
                    <Card
                      key={teacherId}
                      className="border-green-200 bg-green-50/50"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={teacher.imageUrl}
                              alt={teacher.name}
                            />
                            <AvatarFallback className="text-sm">
                              {getInitials(teacher.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium truncate">
                                {teacher.name}
                              </h4>
                              <Badge variant="default" className="text-xs">
                                Assigned
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-muted-foreground">
                                {teacher.rating}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {teacher.students.toLocaleString()} students
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {teacher.subjects.map((subject) => (
                                <Badge
                                  key={subject}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTeacher(teacherId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedTeachers.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {selectedTeachers.length} teacher(s) selected
                  </span>
                </div>
                <Button
                  onClick={handleAssignTeachers}
                  disabled={assignTeacherMutation.isPending}
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {assignTeacherMutation.isPending
                    ? "Assigning..."
                    : "Assign Teachers"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
