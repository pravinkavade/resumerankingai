import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { Navbar } from "./components/Navbar.js";
import { Sidebar } from "./components/Sidebar.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { JobsPage } from "./pages/JobsPage.js";
import { CreateJobPage } from "./pages/CreateJobPage.js";
import { CandidatesPage } from "./pages/CandidatesPage.js";
import { UploadResumePage } from "./pages/UploadResumePage.js";
import { AnalyticsPage } from "./pages/AnalyticsPage.js";
import { EthicsPage } from "./pages/EthicsPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { CandidateDetailModal } from "./components/CandidateDetailModal.js";
import { ApplicationStatus } from "./types/index.js";

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [filterJobId, setFilterJobId] = useState<string | undefined>(undefined);

  // Modal inspection state
  const [inspectCandidateId, setInspectCandidateId] = useState<string | null>(null);
  const [inspectApplicationId, setInspectApplicationId] = useState<string | undefined>(undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Initializing TalentRank AI Engine...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (authView === "register") {
      return <RegisterPage onSwitchToLogin={() => setAuthView("login")} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView("register")} />;
  }

  const handleOpenCandidateModal = (candidateId: string, applicationId?: string) => {
    setInspectCandidateId(candidateId);
    setInspectApplicationId(applicationId);
  };

  const handleNavigateToJob = (jobId: string) => {
    setFilterJobId(jobId);
    setCurrentTab("candidates");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            if (tab === "candidates") {
              setFilterJobId(undefined);
            }
            setCurrentTab(tab);
          }}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950/70">
          {currentTab === "dashboard" && (
            <DashboardPage
              onSelectCandidate={handleOpenCandidateModal}
              onNavigateToJob={handleNavigateToJob}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === "jobs" && (
            <JobsPage
              onNavigateCreateJob={() => setCurrentTab("create-job")}
              onViewJobCandidates={handleNavigateToJob}
            />
          )}

          {currentTab === "create-job" && (
            <CreateJobPage
              onJobCreated={(newJobId) => {
                setFilterJobId(newJobId);
                setCurrentTab("jobs");
              }}
              onCancel={() => setCurrentTab("jobs")}
            />
          )}

          {currentTab === "candidates" && (
            <CandidatesPage
              initialJobId={filterJobId}
              onSelectCandidate={handleOpenCandidateModal}
              onNavigateUpload={() => setCurrentTab("upload")}
            />
          )}

          {currentTab === "upload" && (
            <UploadResumePage
              onCandidateProcessed={(candId, appId) => {
                handleOpenCandidateModal(candId, appId);
              }}
              onNavigateCandidates={() => setCurrentTab("candidates")}
            />
          )}

          {currentTab === "analytics" && <AnalyticsPage />}

          {currentTab === "ethics" && <EthicsPage />}
        </main>
      </div>

      {/* Deep-Dive Candidate & AI Match Modal */}
      {inspectCandidateId && (
        <CandidateDetailModal
          candidateId={inspectCandidateId}
          applicationId={inspectApplicationId}
          onClose={() => {
            setInspectCandidateId(null);
            setInspectApplicationId(undefined);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
