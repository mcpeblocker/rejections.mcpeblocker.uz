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
    <div className="bg-slate-900 text-slate-100 min-h-screen flex flex-col">
      {/* Subtle background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation bar */}
      <nav className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-b border-slate-800">
        {/* Brand/Logo */}
        <Link href="/" className="text-lg sm:text-xl font-bold text-white hover:text-blue-400 transition-colors">
          rejections.mcpeblocker.uz
        </Link>
        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto items-center">
          <Link 
            href="https://github.com/mcpeblocker/rejections.mcpeblocker.uz" 
            className="px-4 sm:px-6 py-2 sm:py-3 text-slate-400 hover:text-white transition-colors text-center text-sm sm:text-base" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            ↗ Contribute on Github
          </Link>
          <button 
            className="px-4 sm:px-6 py-2 sm:py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-md text-center text-sm sm:text-base font-semibold" 
            onClick={handleNavigationToDashboard}
          >
            Enter ➡️
          </button>
        </div>
      </nav>

      {/* Hero section */}
      <header className="relative z-10 flex flex-col md:flex-row items-center justify-center text-center my-16 md:my-24 px-4">
        <div className="md:mr-16 lg:mr-72 max-w-xl text-center md:text-left mb-8 md:mb-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 md:mb-8 text-white">
            Turn Your <span className="text-blue-400">Rejections</span> into <span className="text-blue-400">Strength</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400">
            Join our community of resilient individuals who share their rejection stories to inspire and empower each other. Together, we transform setbacks into comebacks!
          </p>
        </div>
        <div className="text-6xl sm:text-7xl md:text-9xl flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
          🚫💔<span className="text-3xl sm:text-4xl md:text-5xl">➡️</span>💪🔥
        </div>
      </header>

      {/* CTA: Multi-step rejection experience log form */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pb-8">
        <div className="bg-slate-800/50 border border-slate-700 p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-2xl backdrop-blur-md">
          <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 md:mb-8 text-center text-blue-400">
            Log Your Own Rejection Experience!
          </h2>
          {/* Current step label */}
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-center px-2 text-white">
            {stepLabels[currentStep]}
          </h3>
          {/* Form content based on current step */}
          <div>
            {currentStep === FormInputStep.CATEGORY && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {Object.values(RejectionCategory).map((category) => (
                  <button
                    key={category}
                    className={`p-3 sm:p-4 cursor-pointer rounded-lg border-2 text-sm sm:text-base transition-colors ${
                      rejectionDetails.category === category 
                        ? "border-blue-500 bg-blue-500/20 text-white" 
                        : "border-slate-600 hover:bg-slate-700 text-slate-300"
                    }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
            {currentStep === FormInputStep.DETAILS && (
              <textarea
                className="w-full p-3 sm:p-4 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 outline-none resize-none text-sm sm:text-base text-white placeholder-slate-400"
                rows={6}
                placeholder="Describe the rejection experience in detail..."
                value={rejectionDetails.content}
                onChange={(e) => handleDetailsChange(e.target.value)}
              />
            )}
            {currentStep === FormInputStep.REFLECTIONS && (
              <textarea
                className="w-full p-3 sm:p-4 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 outline-none resize-none text-sm sm:text-base text-white placeholder-slate-400"
                rows={6}
                placeholder="Share your reflections on the rejection experience..."
                value={rejectionDetails.reflections}
                onChange={(e) => handleReflectionsChange(e.target.value)}
              />
            )}
            {currentStep === FormInputStep.TITLE && (
              <input
                type="text"
                className="w-full p-3 sm:p-4 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 outline-none text-sm sm:text-base text-white placeholder-slate-400"
                placeholder="Give your rejection experience a title..."
                value={rejectionDetails.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            )}
          </div>
          {/* Navigation buttons */}
          {currentStep > FormInputStep.CATEGORY && (
            <div className="flex justify-between mt-4 sm:mt-6 gap-2">
              <Button
                variant="text"
                color="default"
                onClick={handlePreviousStep}
                className="text-sm sm:text-base"
              >
                Previous
              </Button>
              {currentStep < FormInputStep.TITLE ? (
                <Button 
                  type="primary" 
                  onClick={handleNextStep} 
                  className="ml-auto text-sm sm:text-base" 
                  disabled={!isNextActive}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  onClick={handleSubmit} 
                  className="ml-auto text-sm sm:text-base" 
                  disabled={!isSubmitActive}
                >
                  Submit
                </Button>
              )}
            </div>
          )}
        </div>
        <SuccessLogModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col items-center justify-center p-4 mt-auto text-center text-xs sm:text-sm bg-slate-900 border-t border-slate-800 text-slate-500">
        <p className="px-4">
          © 2025 rejections.mcpeblocker.uz - Made with ❤️ by{" "}
          <Link href="https://mcpeblocker.uz" className="underline hover:text-slate-300">Alisher Ortiqov</Link>
        </p>
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
      title={<span className="text-sm sm:text-base">Access the community of resilient people worldwide!</span>}
      footer={null}
      onCancel={onClose}
      width="90%"
      style={{ maxWidth: 500 }}
    >
      <Result
        status="success"
        title={<span className="text-base sm:text-lg">Just one more step to let us know it's you!</span>}
        subTitle={<span className="text-xs sm:text-sm">To share your experience with our community, please sign in or create an account. Do not worry, we respect your privacy.</span>}
        extra={[
          <form key="login-form" className="w-full" onSubmit={handleEnter}>
            <div className="flex flex-col gap-3 sm:gap-4 items-center">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                allowClear
                size="large"
              />
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                allowClear
                size="large"
              />
            </div>
            <span className="block text-center text-xs sm:text-sm mt-2 mb-4 text-gray-500 px-2">
              Do not have an account? We got your back! <br />
              Just press the "Enter" button to create one automatically.
            </span>
            <Button type="primary" htmlType="submit" className="w-full" loading={loading} size="large">
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
