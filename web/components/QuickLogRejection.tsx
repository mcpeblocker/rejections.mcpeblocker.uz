"use client";
import { useState } from "react";
import { Modal, Input, Button } from "antd";
import toast from "react-hot-toast";
import { apiService } from "@/lib/api.service";

const { TextArea } = Input;

enum RejectionCategory {
  JOB = "Job",
  COLLEGE = "College/University",
  RELATIONSHIP = "Relationship",
  OTHER = "Other",
}

interface QuickLogRejectionProps {
  onSuccess?: () => void;
}

export default function QuickLogRejection({ onSuccess }: QuickLogRejectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<RejectionCategory | null>(null);
  const [description, setDescription] = useState("");

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    // Reset form
    setTitle("");
    setCategory(null);
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category) {
      toast.error("Please provide at least a title and category!");
      return;
    }

    setLoading(true);

    try {
      await apiService.logRejectionFromWebsite({
        title: title.trim(),
        category,
        description: description.trim() || undefined,
      });

      // Success!
      handleClose();
      
      // Show success message
      toast.success("🎉 Rejection logged successfully! You're one step closer to growth!");
      
      // Trigger custom event for other components to refresh
      window.dispatchEvent(new Event('rejectionLogged'));
      
      // Trigger refresh callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error logging rejection:", error);
      toast.error("Failed to log rejection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-2xl group"
        title="Quick Log Rejection"
      >
        <span className="group-hover:scale-110 transition-transform">➕</span>
      </button>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        width="90%"
        style={{ maxWidth: 600 }}
        centered
      >
        <div className="py-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Quick Log a Rejection 🚀
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Track your growth journey - every rejection is a learning opportunity!
          </p>

          <div className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(RejectionCategory).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      category === cat
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Give it a Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., Software Engineer at TechCorp"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="large"
                maxLength={100}
                showCount
              />
            </div>

            {/* Description (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Details <span className="text-slate-400">(Optional)</span>
              </label>
              <TextArea
                placeholder="What happened? How do you feel? What did you learn?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                showCount
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                loading={loading}
                disabled={!title.trim() || !category}
                className="flex-1"
              >
                🎯 Log Rejection
              </Button>
              <Button
                size="large"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Motivational Footer */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <p className="text-xs text-slate-600 text-center">
              💪 <b>Remember:</b> Every rejection brings you closer to success!
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
