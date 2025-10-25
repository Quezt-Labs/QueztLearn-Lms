"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  User,
  FileText,
  Video,
  Clock,
  HelpCircle,
  Eye,
  Check,
} from "lucide-react";

// Step components
import { BasicInfoStep } from "@/components/course-creation/basic-info-step";
import { TeacherSelectionStep } from "@/components/course-creation/teacher-selection-step";
import { SubjectCreationStep } from "@/components/course-creation/subject-creation-step";
import { ChapterTopicStep } from "@/components/course-creation/chapter-topic-step";
import { ContentUploadStep } from "@/components/course-creation/content-upload-step";
import { FAQStep } from "@/components/course-creation/faq-step";
import { PreviewStep } from "@/components/course-creation/preview-step";
import { ScheduleStep } from "@/components/course-creation/schedule-step";

const steps = [
  {
    id: 1,
    title: "Basic Information",
    description: "Course details and pricing",
    icon: BookOpen,
    component: BasicInfoStep,
  },
  {
    id: 2,
    title: "Teacher Assignment",
    description: "Assign teachers to the course",
    icon: User,
    component: TeacherSelectionStep,
  },
  {
    id: 3,
    title: "Subjects",
    description: "Create course subjects",
    icon: FileText,
    component: SubjectCreationStep,
  },
  {
    id: 4,
    title: "Chapters & Topics",
    description: "Organize course content",
    icon: FileText,
    component: ChapterTopicStep,
  },
  {
    id: 5,
    title: "Content Upload",
    description: "Add lectures and materials",
    icon: Video,
    component: ContentUploadStep,
  },
  {
    id: 6,
    title: "Course Schedule",
    description: "Set up class timings",
    icon: Clock,
    component: ScheduleStep,
  },
  {
    id: 7,
    title: "FAQ Section",
    description: "Add frequently asked questions",
    icon: HelpCircle,
    component: FAQStep,
  },
  {
    id: 8,
    title: "Preview & Publish",
    description: "Review and publish course",
    icon: Eye,
    component: PreviewStep,
  },
];

interface CourseData {
  // Basic Info
  name: string;
  description: string;
  class: string;
  exam: string;
  language: string;
  startDate: string;
  endDate: string;
  validity: string;
  totalPrice: number;
  discountPercentage: number;
  discountedPrice: number;
  imageUrl: string;

  // Teacher
  teacherId: string;

  // Subjects
  subjects: Array<{
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    teacherId: string;
  }>;

  // Chapters & Topics
  chapters: Array<{
    id: string;
    subjectId: string;
    name: string;
    lectureCount: number;
    lectureDuration: string;
    topics: Array<{
      id: string;
      name: string;
      content: Array<{
        id: string;
        name: string;
        type: "lecture" | "pdf";
        videoUrl?: string;
        pdfUrl?: string;
        videoThumbnail?: string;
        videoDuration?: number;
      }>;
    }>;
  }>;

  // Schedule
  schedules: Array<{
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    date?: string;
    isRecurring: boolean;
  }>;

  // FAQ
  faq: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [courseData, setCourseData] = useState<CourseData>({
    name: "",
    description: "",
    class: "",
    exam: "",
    language: "English",
    startDate: "",
    endDate: "",
    validity: "",
    totalPrice: 0,
    discountPercentage: 0,
    discountedPrice: 0,
    imageUrl: "",
    teacherId: "",
    subjects: [],
    chapters: [],
    schedules: [],
    faq: [],
  });

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleDataUpdate = (stepData: Partial<CourseData>) => {
    setCourseData((prev) => ({ ...prev, ...stepData }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      // TODO: Implement course creation API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to courses page
      router.push("/admin/courses");
    } catch (error) {
      setErrorMessage("Failed to create course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Course
          </h1>
          <p className="text-muted-foreground mt-2">
            Build a comprehensive course with rich content and interactive
            materials
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Steps */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Creation</CardTitle>
                <CardDescription>
                  Follow the steps to create your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    const Icon = step.icon;

                    return (
                      <button
                        key={step.id}
                        onClick={() => handleStepClick(step.id)}
                        className={`
                          w-full text-left p-3 rounded-lg transition-all
                          ${
                            isCurrent
                              ? "bg-primary text-primary-foreground"
                              : isCompleted
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-muted hover:bg-muted/80"
                          }
                          ${
                            step.id > currentStep
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }
                        `}
                        disabled={step.id > currentStep}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`
                            flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                            ${
                              isCurrent
                                ? "bg-primary-foreground text-primary"
                                : isCompleted
                                ? "bg-green-600 text-white"
                                : "bg-muted-foreground text-muted"
                            }
                          `}
                          >
                            {isCompleted ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{step.title}</p>
                            <p className="text-xs opacity-75">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      {React.createElement(steps[currentStep - 1].icon, {
                        className: "h-5 w-5",
                      })}
                      <span>{steps[currentStep - 1].title}</span>
                    </CardTitle>
                    <CardDescription>
                      {steps[currentStep - 1].description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    Step {currentStep} of {steps.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CurrentStepComponent
                      data={courseData}
                      onUpdate={handleDataUpdate}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      isFirstStep={currentStep === 1}
                      isLastStep={currentStep === steps.length}
                      isSubmitting={isSubmitting}
                      onSubmit={handleSubmit}
                    />
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
