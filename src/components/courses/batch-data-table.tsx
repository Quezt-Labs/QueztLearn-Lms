"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  BookOpen,
} from "lucide-react";

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

interface BatchDataTableProps {
  batches: Batch[];
  basePath: "admin" | "teacher";
  onEdit: (batchId: string) => void;
  onDelete: (batch: { id: string; name: string }) => void;
  canManageCourse: boolean;
  showEditButton?: boolean;
}

export function BatchDataTable({
  batches,
  basePath,
  onEdit,
  onDelete,
  canManageCourse,
  showEditButton = true,
}: BatchDataTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Utility function to strip HTML tags and decode entities
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const filteredBatches = batches.filter((batch: Batch) => {
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

  const handleViewCourse = (batchId: string) => {
    router.push(`/${basePath}/courses/${batchId}`);
  };

  console.log(batches, "batches");

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search courses, exams, classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px] max-w-[350px]">
                Course
              </TableHead>
              <TableHead className="w-[100px]">Class</TableHead>
              <TableHead className="w-[120px]">Exam</TableHead>
              <TableHead className="w-[140px]">Start Date</TableHead>
              <TableHead className="w-[140px]">End Date</TableHead>
              <TableHead className="w-[120px]">Price</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="font-semibold mb-2">No courses found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search criteria or filters"
                        : "Get started by creating your first course"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBatches.map((batch: Batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium max-w-[350px]">
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold line-clamp-2 break-words">
                        {batch.name}
                      </div>
                      {batch.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 break-words">
                          {stripHtml(batch.description)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>Class {batch.class}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                      <span>{batch.exam}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(batch.startDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(batch.endDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-primary">
                        {formatPrice(
                          calculateDiscountedPrice(
                            batch.totalPrice,
                            batch.discountPercentage
                          )
                        )}
                      </span>
                      {batch.discountPercentage > 0 && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(batch.totalPrice)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {getStatusBadge(batch)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleViewCourse(batch.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {canManageCourse && showEditButton && (
                          <>
                            <DropdownMenuItem onClick={() => onEdit(batch.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {canManageCourse && (
                          <DropdownMenuItem
                            onClick={() => onDelete(batch)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
