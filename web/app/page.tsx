"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Button, Modal, Result, Spin, Input } from "antd";
import { API_BASE_URL } from "@/api";

enum RejectionCategory {
  JOB = "Job",
  COLLEGE = "College/University",
  RELATIONSHIP = "Relationship",
  OTHER = "Other",
}

interface RejectionDetails {
  title: string;
  category: RejectionCategory | null;
  content?: string;
  reflections?: string;
}

enum FormInputStep {
  CATEGORY = 1,
  DETAILS = 2,
  REFLECTIONS = 3,
  TITLE = 4,
}

const stepLabels = {
  [FormInputStep.CATEGORY]: "What kind of Rejection have you experienced?",
  [FormInputStep.DETAILS]: "What was the Rejection About?",
  [FormInputStep.REFLECTIONS]: "What did you learn from this experience?",
  [FormInputStep.TITLE]: "Finally: Give your Rejection a title!",
}

export default function Home() {
  const [rejectionDetails, setRejectionDetails] = useState<RejectionDetails>({
    title: "",
    category: null,
    content: "",
    reflections: "",
  });
  const [currentStep, setCurrentStep] = useState<FormInputStep>(FormInputStep.CATEGORY);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCategorySelect = (category: RejectionCategory) => {
    setRejectionDetails((prev) => ({
      ...prev,
      category,
    }));
    setCurrentStep(FormInputStep.DETAILS);
  };
  const handleDetailsChange = (details: string) => {
    setRejectionDetails((prev) => ({
      ...prev,
      content: details,
    }));
  };
  const handleReflectionsChange = (reflections: string) => {
    setRejectionDetails((prev) => ({
      ...prev,
      reflections,
    }));
  };
  const handleTitleChange = (title: string) => {
    setRejectionDetails((prev) => ({
      ...prev,
      title,
    }));
  };
  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };
  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };
  const handleSubmit = () => {
    if (!isSubmitActive) return;

    // Save rejectionDetails to local storage
    addToLocalStorage(rejectionDetails);

    const isAuthenticated = goToDashboardIfAuthenticated();
    if (!isAuthenticated) {
      // Show modal to prompt sign in / sign up
      setIsModalOpen(true);
    }
  };

  const handleNavigationToDashboard = () => {
    const isAuthenticated = goToDashboardIfAuthenticated();
    if (!isAuthenticated) {
      setIsModalOpen(true);
    }
  }

  const isNextActive = useMemo(() => {
    switch (currentStep) {
      case FormInputStep.CATEGORY:
      case FormInputStep.DETAILS:
      case FormInputStep.REFLECTIONS:
      case FormInputStep.TITLE:
        return rejectionDetails.category !== null;
      default:
        return false;
    }
  }, [currentStep, rejectionDetails]);

  const isSubmitActive = useMemo(() => {
    return rejectionDetails.title && rejectionDetails.title.trim().length > 0 && rejectionDetails.category !== null;
  }, [rejectionDetails]);

  return (
    <div className="bg-gradient-to-bl from-purple-500 via-pink-500 to-red-500 min-h-screen text-white h-screen flex flex-col justify-between">
      {/* Navigation bar */}
      <nav className="flex items-center justify-between p-4">
        {/* Brand/Logo */}
        <Link href="/" className="text-xl font-bold">rejections.mcpeblocker.uz</Link>
        {/* CTA */}
        <div className="flex gap-4">
          <Link href="https://github.com/mcpeblocker/rejections.mcpeblocker.uz" className="px-6 py-3 cursor-pointer hover:opacity-60" target="_blank" rel="noopener noreferrer">
            ↗ Contribute on Github
          </Link>
          <Link href="#" className="px-6 py-3 cursor-pointer hover:opacity-60" onClick={handleNavigationToDashboard}>
            Enter ➡️
          </Link>
        </div>
      </nav>
      {/* Hero section */}
      <header className="flex flex-col md:flex-row items-center justify-center text-center my-16 px-4">
        <div className="md:mr-72 max-w-xl text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-8">Turn Your <span className="text-yellow-300">Rejections</span> into <span className="text-green-300">Strength</span></h1>
          <p className="text-lg md:text-xl">Join our community of resilient individuals who share their rejection stories to inspire and empower each other. Together, we transform setbacks into comebacks!</p>
        </div>
        <div className="text-9xl mt-8 flex items-center justify-center gap-8">🚫💔<span className="text-5xl">➡️</span>💪🔥</div>
      </header>
      {/* CTA: Multi-step rejection experience log form */}
      {/* Asks for category, details, reflections and title */}
      <main className="flex flex-col items-center justify-center px-4">
        <div className="bg-white/20 p-8 rounded-lg w-full max-w-2xl backdrop-blur-md">
          <h2 className="text-lg font-bold mb-8 text-center text-green-300">Log Your Own Rejection Experience!</h2>
          {/* Current step label */}
          <h3 className="text-2xl font-semibold mb-4 text-center">{stepLabels[currentStep]}</h3>
          {/* Form content based on current step */}
          <div>
            {currentStep === FormInputStep.CATEGORY && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(RejectionCategory).map((category) => (
                  <button
                    key={category}
                    className={`p-4 cursor-pointer rounded-lg border-2 ${rejectionDetails.category === category ? "border-yellow-300 bg-white/30" : "border-transparent hover:bg-white/20"}`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
            {currentStep === FormInputStep.DETAILS && (
              <textarea
                className="w-full p-4 rounded-lg bg-white/20 border border-transparent focus:border-yellow-300 resize-none"
                rows={6}
                placeholder="Describe the rejection experience in detail..."
                value={rejectionDetails.content}
                onChange={(e) => handleDetailsChange(e.target.value)}
              />
            )}
            {currentStep === FormInputStep.REFLECTIONS && (
              <textarea
                className="w-full p-4 rounded-lg bg-white/20 border border-transparent focus:border-yellow-300 resize-none"
                rows={6}
                placeholder="Share your reflections on the rejection experience..."
                value={rejectionDetails.reflections}
                onChange={(e) => handleReflectionsChange(e.target.value)}
              />
            )}
            {currentStep === FormInputStep.TITLE && (
              <input
                type="text"
                className="w-full p-4 rounded-lg bg-white/20 border border-transparent focus:border-yellow-300"
                placeholder="Give your rejection experience a title..."
                value={rejectionDetails.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            )}
          </div>
          {/* Navigation buttons */}
          {currentStep > FormInputStep.CATEGORY && (
            <div className="flex justify-between mt-6">
              <Button
                variant="text"
                color="default"
                onClick={handlePreviousStep}
              >
                Previous
              </Button>
              {currentStep < FormInputStep.TITLE ? (
                <Button type="primary" onClick={handleNextStep} className="ml-auto" disabled={!isNextActive}>
                  Next
                </Button>
              ) : (
                <Button type="primary" onClick={handleSubmit} className="ml-auto" disabled={!isSubmitActive}>
                  Submit
                </Button>
              )}
            </div>
          )}
        </div>
        <SuccessLogModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>
      {/* Footer */}
      <footer className="flex flex-col items-center justify-center p-4 mt-8 text-center text-sm bg-white/20 text-white-800">
        <p>© 2025 rejections.mcpeblocker.uz - Made with ❤️ by <Link href="https://mcpeblocker.uz">Alisher Ortiqov</Link></p>
      </footer>
    </div>
  );
}

interface SuccessLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SuccessLogModal({ isOpen, onClose }: SuccessLogModalProps) {
  /**
   * Tells that rejection experience is almost ready to be shared in the platform
   * Asks for user to sign in / sign up right on the spot! (via email, password)
   */
  const [loading, setLoading] = useState(false);

  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Try login first
    try {
      setLoading(true);
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!loginResponse.ok) {
        throw new Error("Login failed");
      }
      const data = await loginResponse.json();
      const isSuccess = data.success;
      if (isSuccess) {
        // Successfully logged in
        onClose();
        proceedToDashboard(data.authToken);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Login error:", error);
    }

    // If login fails, try sign up
    try {
      const signupResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!signupResponse.ok) {
        throw new Error("Signup failed");
      }
      const data = await signupResponse.json();
      const isSuccess = data.success;
      if (isSuccess) {
        // Successfully signed up
        alert("We are creating your account. Check your email for verification link!");
        onClose();
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Signup error:", error);
    }

    // If both login and signup fail
    alert("Please check your credentials and try again.");
    setLoading(false);
  };

  return (
    <Modal
      open={isOpen}
      title="Access the community of resilient people worldwide!"
      footer={null}
      onCancel={onClose}
    >
      <Result
        status="success"
        title="Just one more step to let us know it's you!"
        subTitle="To share your experience with our community, please sign in or create an account. Do not worry, we respect your privacy."
        extra={[
          <form key="login-form" className="w-full" onSubmit={handleEnter}>
            <div className="flex flex-col gap-4 items-center">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                allowClear
              />
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                allowClear
              />
            </div>
            <span className="block text-center text-xs mt-2 mb-4 text-sm text-gray-500">
              Do not have an account? We got your back! <br />
              Just press the "Enter" button to create one automatically.
            </span>
            <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
              Enter
            </Button>
          </form>,
        ]}
      />
    </Modal>
  );
}

const goToDashboardIfAuthenticated = (): boolean => {
  const authToken = localStorage.getItem("auth_token");
  if (authToken) {
    // Redirect to dashboard
    proceedToDashboard(authToken);
    return true;
  }
  return false;
};

const addToLocalStorage = (rejectionDetails: RejectionDetails) => {
  const existingRejections = localStorage.getItem("rejection_experiences");
  let rejectionsArray: RejectionDetails[] = [];
  if (existingRejections) {
    rejectionsArray = JSON.parse(existingRejections);
  }
  rejectionsArray.push(rejectionDetails);
  localStorage.setItem("rejection_experiences", JSON.stringify(rejectionsArray));
};

const syncLocalRejections = async (authToken: string) => {
  const existingRejections = localStorage.getItem("rejection_experiences");
  if (!existingRejections) return;
  const rejectionsArray: RejectionDetails[] = JSON.parse(existingRejections);

  for (const rejection of rejectionsArray) {
    try {
      const response = await fetch(`${API_BASE_URL}/rejections/log-from-website`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(rejection),
      });
      if (!response.ok) {
        console.error("Failed to sync rejection:", rejection);
      }
    } catch (error) {
      console.error("Error syncing rejection:", rejection, error);
    }
  }

  // Clear local storage after syncing
  localStorage.removeItem("rejection_experiences");
}

const proceedToDashboard = (authToken: string) => {
  // Save the auth token to local storage
  localStorage.setItem("auth_token", authToken);
  // Sync local rejections
  syncLocalRejections(authToken);
  // Redirect to dashboard
  window.location.href = "/app";
};
