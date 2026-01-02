import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "./Dashboard";
import { ProjectsList } from "./ProjectsList";
import { ProjectDetails } from "./ProjectDetails";
import { DeskReservation } from "./DeskReservation";
import { LabAvailability } from "./LabAvailability";
import { MeetingRoomReservation } from "./MeetingRoomReservation";
import { Reservation } from "./Reservation";
import { MyReservations } from "./MyReservations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import { projectApi } from "../services/projectService";
import { evaluationApi } from "../services/evaluationApi";
import { applicationApi } from "../services/positionApi";
import { PositionApplications } from "./PositionApplications";
import Studentview from "./Studentview";
import Messaging from "./Messaging";
import TeamFinder from "./TeamFinder";
import LocationManagement from "./LocationManagement";
import LocationFinder from "./LocationFinder";
import { BookOpen, Building, Calendar, MonitorSmartphone, Users } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "../contexts/AuthContext";

export type UserRole = "admin" | "faculty" | "student" | "assessor";
export type AssessorRole = "Supervisor" | "Co-Supervisor" | "ST" | "RA" | "TA" | "External Examiner";
export type EvaluationStatus = "Pending" | "Submitted";

export interface Project {
  id: string;
  title: string;
  studentName: string;
  studentId: string;
  description: string;
  department: string;
  status: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  evaluation?: {
    marks?: number;
    remarks?: string;
  };
}

export type Criterion = {
  name: string;
  maxScore: number;
};

export interface Evaluation {
  id: string;
  projectName: string;
  studentName: string;
  studentId: string;
  criteria: Criterion[];
  totalMarks: number;
  maxMarks: number;
  status: EvaluationStatus;
  submittedAt?: string;
  evaluatedAt?: string;
  evaluatedBy?: string;
  remarks?: string;
}

export interface Position {
  id: string;
  title: string;
  type: string;
  department: string;
  description: string;
  requirements: string[];
  duration: string;
  stipend?: string;
  postedBy: string;
  postedDate: string;
  deadline: string;
  status: string;
  applicants: number;
}

export type PageView = "dashboard" | "projects" | "project-details" | "reservations" | "positions" | "users" | "faculty-directory" | "group-posts" | "messaging" | "locations" | "location-finder";

export default function AppContent() {
  const { user, userRole, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageView>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: "1",
      type: "desk",
      resourceName: "Desk A-12",
      date: "2025-12-25",
      startTime: "09:00",
      endTime: "11:00",
      userName: "Rafsan Rahman",
      userType: "student",
      purpose: "Study session"
    },
    {
      id: "2",
      type: "lab",
      resourceName: "Lab 301 - PC 5",
      date: "2025-12-26",
      startTime: "14:00",
      endTime: "16:00",
      userName: "Rafsan Rahman",
      userType: "student",
      purpose: "Project work"
    },
    {
      id: "3",
      type: "meeting-room",
      resourceName: "Meeting Room B-05",
      date: "2025-12-27",
      startTime: "10:00",
      endTime: "12:00",
      userName: "Dr. Smith",
      userType: "faculty",
      purpose: "Thesis defense prep"
    }
  ]);

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
  };

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage("project-details");
  };

  const refreshMyProjects = async () => {
    try {
      const myProjects = await projectApi.getMyProjects();
      setProjects(myProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  const handleAssignEvaluation = async (projectId: string, evaluation: Evaluation) => {
    try {
      await evaluationApi.createEvaluation(evaluation);
      toast.success("Evaluation assigned successfully");
      refreshMyProjects();
    } catch (error) {
      console.error("Error assigning evaluation:", error);
      toast.error("Failed to assign evaluation");
    }
  };

  useEffect(() => {
    refreshMyProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                CampusConnect
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{userRole}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <ModeToggle />
                <button
                  onClick={logout}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors bg-red-100 text-red-800 border border-red-300 hover:bg-red-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          userRole={userRole}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 p-6">
          {currentPage === "dashboard" && (
            <Dashboard
              userRole={userRole}
              onNavigate={handleNavigate}
              onViewProject={handleViewProject}
              projects={projects}
              evaluations={evaluations}
            />
          )}
          {currentPage === "projects" && (
            <ProjectsList
              userRole={userRole}
              onViewProject={handleViewProject}
              projects={projects}
              evaluations={evaluations}
              onProjectCreated={refreshMyProjects}
              onAssignEvaluation={handleAssignEvaluation}
              studentName={user?.name || "Your name"}
            />
          )}
          {currentPage === "project-details" && selectedProjectId && (
            <ProjectDetails
              projectId={selectedProjectId}
              onBack={() => setCurrentPage("projects")}
            />
          )}
          {currentPage === "reservations" && (
            <Tabs defaultValue="desk" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="desk">Desk</TabsTrigger>
                <TabsTrigger value="lab">Lab</TabsTrigger>
                <TabsTrigger value="meeting-room">Meeting Room</TabsTrigger>
                <TabsTrigger value="my">My Reservations</TabsTrigger>
              </TabsList>
              <TabsContent value="desk">
                <DeskReservation />
              </TabsContent>
              <TabsContent value="lab">
                <LabAvailability />
              </TabsContent>
              <TabsContent value="meeting-room">
                <MeetingRoomReservation />
              </TabsContent>
              <TabsContent value="my">
                <MyReservations reservations={reservations} />
              </TabsContent>
            </Tabs>
          )}
          {currentPage === "positions" && userRole === "student" && (
            <PositionApplications />
          )}
          {currentPage === "users" && userRole === "admin" && (
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">User Management</h2>
              <p className="text-gray-600">User management features coming soon...</p>
            </div>
          )}
          {currentPage === "faculty-directory" && (
            <Studentview />
          )}
          {currentPage === "group-posts" && (
            <TeamFinder />
          )}
          {currentPage === "messaging" && (
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Messages</h2>
              <Messaging />
            </div>
          )}
          {currentPage === "locations" && <LocationManagement />}
          {currentPage === "location-finder" && <LocationFinder />}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
