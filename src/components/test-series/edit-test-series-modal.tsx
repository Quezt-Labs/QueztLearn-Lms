"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { useUpdateTestSeries, ExamType, TestSeries } from "@/hooks/test-series";

interface EditTestSeriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testSeries: TestSeries;
  onSuccess?: () => void;
}

const EXAM_OPTIONS: ExamType[] = [
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

export function EditTestSeriesModal({
  open,
  onOpenChange,
  testSeries,
  onSuccess,
}: EditTestSeriesModalProps) {
  const [formData, setFormData] = useState({
    exam: testSeries.exam,
    title: testSeries.title,
    description: testSeries.description?.html || "",
    slug: testSeries.slug,
    imageUrl: testSeries.imageUrl || "",
    totalPrice: testSeries.totalPrice,
    discountPercentage: testSeries.discountPercentage,
    isFree: testSeries.isFree,
    durationDays: testSeries.durationDays,
    isActive: testSeries.isActive,
  });

  const updateMutation = useUpdateTestSeries();

  useEffect(() => {
    if (testSeries) {
      setFormData({
        exam: testSeries.exam,
        title: testSeries.title,
        description: testSeries.description?.html || "",
        slug: testSeries.slug,
        imageUrl: testSeries.imageUrl || "",
        totalPrice: testSeries.totalPrice,
        discountPercentage: testSeries.discountPercentage,
        isFree: testSeries.isFree,
        durationDays: testSeries.durationDays,
        isActive: testSeries.isActive,
      });
    }
  }, [testSeries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        id: testSeries.id,
        data: {
          title: formData.title,
          description: {
            html: formData.description,
            features: testSeries.description?.features || [],
          },
          totalPrice: formData.isFree ? 0 : formData.totalPrice,
          discountPercentage: formData.isFree ? 0 : formData.discountPercentage,
        },
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update test series:", error);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, title, slug });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Test Series</DialogTitle>
          <DialogDescription>
            Update the test series information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="JEE Main 2025 Complete Test Series"
              value={formData.title}
              onChange={handleTitleChange}
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              placeholder="jee-main-2025-complete-test-series"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Comprehensive test series covering all topics..."
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
            />
          </div>

          {/* Free/Paid Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isFree"
              checked={formData.isFree}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isFree: checked })
              }
            />
            <Label htmlFor="isFree">Free Test Series</Label>
          </div>

          {/* Pricing (only if not free) */}
          {!formData.isFree && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalPrice">
                  Price (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="2999"
                  value={formData.totalPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  required={!formData.isFree}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount (%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="20"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercentage: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="durationDays">Duration (Days)</Label>
            <Input
              id="durationDays"
              type="number"
              min="1"
              placeholder="365"
              value={formData.durationDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  durationDays: parseInt(e.target.value) || 365,
                })
              }
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="isActive">Active (visible to students)</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Test Series"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
