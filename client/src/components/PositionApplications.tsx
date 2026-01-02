import { useMemo, useState } from "react";
import { usePositions, type PositionFilterType } from "../hooks/usePositions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Briefcase, Clock, DollarSign, Calendar, CheckCircle2, XCircle, AlertCircle, Check, X } from "lucide-react";
import type { Position, Application } from "../services/positionApi";
import type { UserRole } from "../App";

interface PositionApplicationsProps {
  /** temporary stand-in for auth */
  studentId?: string;
  positions?: Position[];
  applications?: Application[];
  onApply?: (application: Omit<Application, "id" | "appliedDate" | "status">) => void;
  userRole?: UserRole;
  onUpdateApplication?: (id: string, status: "accepted" | "rejected", reason?: string) => void;
}

export function PositionApplications({
  studentId,
  positions: propPositions,
  applications: propApplications,
  onApply: propOnApply,
  userRole,
  onUpdateApplication
}: PositionApplicationsProps) {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<PositionFilterType>("all");

  // Use the usePositions hook to manage data fetching
  const {
    positions: hookPositions,
    applications: hookApplications,
    submitApplication: hookSubmitApplication,
  } = usePositions({
    studentId: studentId,
    availableOnly: true
  });

  // Use props if provided, otherwise fall back to hook data
  const positions = propPositions || hookPositions;
  const applications = propApplications || hookApplications;
  const onApply = propOnApply || hookSubmitApplication;



  // For role-based logic, determine what user can see/do
  const canApply = userRole === "student";
  const canReviewApplications = userRole === "admin" || userRole === "faculty";



  // Helper functions
  const hasApplied = (positionId: string) => {
    return applications.some(app => app.positionId === positionId && app.studentId === studentId);
  };

  const submitApplication = async (applicationData: any) => {
    if (!onApply) throw new Error("Application submission not available");
    return onApply(applicationData);
  };
  
  // Form state
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [formStudentId, setFormStudentId] = useState("");
  const [gpa, setGpa] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  //this controls the badge color based on position type
  const getPositionTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "TA": return "default";
      case "RA": return "secondary";
      case "ST": return "outline";
      default: return "default";
    }
  };
  // Filtering positions (ST/RA/TA)
  const availablePositions = useMemo(() => {
    const filtered = filterType === "all" ? positions : positions.filter((p) => p.type === filterType);
    // backend already supports availableOnly=true, but keep safety net
    return filtered.filter((p) => p.filled < p.spots);
  }, [filterType, positions]);
 
  //Submit application, ekhane 3 ta jinish handle kortesi: form validation, check if already applied, and then call onApply prop
  const handleApply = async () => {
    if (!selectedPosition || !studentName || !email || !formStudentId || !gpa || !expertiseInput || !availability || !experience || !coverLetter) {
      alert("Please fill in all fields");
      return;
    }

    if (hasApplied(selectedPosition.id)) {
      alert("You have already applied for this position");
      return;
    }

    const expertise = expertiseInput.split(",").map((e) => e.trim()).filter((e) => e);

    try {
      await submitApplication({
        positionId: selectedPosition.id,
        studentName,
        email,
        studentId: formStudentId,
        gpa,
        expertise,
        availability,
        experience,
        coverLetter
      });

      // Reset form
      setStudentName("");
      setEmail("");
      setFormStudentId("");
      setGpa("");
      setExpertiseInput("");
      setAvailability("");
      setExperience("");
      setCoverLetter("");
      setIsDialogOpen(false);
      alert("Application submitted successfully!");
    } catch (e: any) {
      alert(e?.message ?? "Failed to submit application");
    }
  };

  const openApplicationDialog = (position: Position) => {
    setSelectedPosition(position);
    setIsDialogOpen(true);
  };

  const myApplications = applications;

  return (
    <Tabs defaultValue="browse" className="space-y-6">
      <TabsList>
        <TabsTrigger value="browse">Browse Positions</TabsTrigger>
        <TabsTrigger value="my-applications">My Applications ({myApplications.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="browse" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Position Opportunities</CardTitle>
            <CardDescription>Apply for ST, RA, and TA positions based on your expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
              >
                All Positions
              </Button>
              <Button
                variant={filterType === "TA" ? "default" : "outline"}
                onClick={() => setFilterType("TA")}
              >
                Teaching Assistant
              </Button>
              <Button
                variant={filterType === "RA" ? "default" : "outline"}
                onClick={() => setFilterType("RA")}
              >
                Research Assistant
              </Button>
              <Button
                variant={filterType === "ST" ? "default" : "outline"}
                onClick={() => setFilterType("ST")}
              >
                Student Tutor
              </Button>
            </div>

            <div className="space-y-4">
              {positions.length === 0 && (
                <p className="text-gray-500 text-center py-8">Loading positions...</p>
              )}
              {availablePositions.map((position) => (
                <Card key={position.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-gray-900">{position.title}</h3>
                            <Badge variant={getPositionTypeBadgeVariant(position.type)}>
                              {position.type === "TA" && "Teaching Assistant"}
                              {position.type === "RA" && "Research Assistant"}
                              {position.type === "ST" && "Student Tutor"}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{position.department}</p>
                          {position.course && (
                            <p className="text-gray-500">{position.course} • {position.faculty}</p>
                          )}
                          {!position.course && (
                            <p className="text-gray-500">{position.faculty}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900">{position.spots - position.filled} spots available</p>
                          <p className="text-gray-500">of {position.spots} total</p>
                        </div>
                      </div>

                      <p className="text-gray-700">{position.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4" />
                          <span>{position.hoursPerWeek} hrs/week</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="size-4" />
                          <span>{position.payRate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>{new Date(position.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(position.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-700 mb-2">Requirements:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {position.requirements.map((req: string, index: number) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        {canApply && (
                          <Button
                            onClick={() => openApplicationDialog(position)}
                            disabled={hasApplied(position.id)}
                          >
                            <Briefcase className="size-4 mr-2" />
                            {hasApplied(position.id) ? "Already Applied" : "Apply Now"}
                          </Button>
                        )}

                        {canApply && (
                          <Dialog open={isDialogOpen && selectedPosition?.id === position.id} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) setSelectedPosition(null);
                            if (open) setSelectedPosition(position);
                          }}>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Apply for {selectedPosition?.title}</DialogTitle>
                                <DialogDescription>
                                  Fill out the application form below. All fields are required.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="student-name">Full Name *</Label>
                                    <Input
                                      id="student-name"
                                      placeholder="Rafsan Rahman"
                                      //this is my example name
                                      value={studentName}
                                      onChange={(e) => setStudentName(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                      id="email"
                                      type="email"
                                      placeholder="Rafsan.Rahman@university.edu"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="student-id">Student ID *</Label>
                                    <Input
                                      id="student-id"
                                      placeholder="22201972"
                                      value={formStudentId}
                                      onChange={(e) => setFormStudentId(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="gpa">GPA *</Label>
                                    <Input
                                      id="gpa"
                                      placeholder="3.8"
                                      value={gpa}
                                      onChange={(e) => setGpa(e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="expertise">Areas of Expertise *</Label>
                                  <Input
                                    id="expertise"
                                    placeholder="Data Structures, Algorithms, Java, Python (comma-separated)"
                                    value={expertiseInput}
                                    onChange={(e) => setExpertiseInput(e.target.value)}
                                  />
                                  <p className="text-gray-500">Separate multiple areas with commas</p>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="availability">Availability *</Label>
                                  <Input
                                    id="availability"
                                    placeholder="e.g., Monday-Friday, 2-6 PM"
                                    value={availability}
                                    onChange={(e) => setAvailability(e.target.value)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="experience">Relevant Experience *</Label>
                                  <Textarea
                                    id="experience"
                                    placeholder="Describe your relevant experience, coursework, or previous positions..."
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    rows={3}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="cover-letter">Cover Letter *</Label>
                                  <Textarea
                                    id="cover-letter"
                                    placeholder="Explain why you're interested in this position and what makes you a good fit..."
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    rows={5}
                                  />
                                </div>

                                <Button onClick={handleApply} className="w-full">
                                  Submit Application
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {availablePositions.length === 0 && (
                <p className="text-gray-500 text-center py-8">No positions available in this category</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="my-applications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {canReviewApplications ? "Application Management" : "My Applications"}
            </CardTitle>
            <CardDescription>
              {canReviewApplications
                ? "Review and manage ST/RA/TA applications"
                : "Track the status of your submitted applications"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">You haven't submitted any applications yet</p>
            ) : (
              <div className="space-y-4">
                {myApplications.map((application) => {
                  const position = positions.find(p => p.id === application.positionId);
                  if (!position) return null;

                  return (
                    <Card key={application._id} className="border-2">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-gray-900">{position.title}</h3>
                                <Badge variant={getPositionTypeBadgeVariant(position.type)}>
                                  {position.type}
                                </Badge>
                              </div>
                              <p className="text-gray-600">{position.department}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant={
                                  application.status?.toLowerCase() === "accepted" ? "default" :
                                  application.status?.toLowerCase() === "rejected" ? "destructive" :
                                  "secondary"
                                }
                                className="flex items-center gap-1"
                              >
                                {application.status?.toLowerCase() === "accepted" && <CheckCircle2 className="size-3" />}
                                {application.status?.toLowerCase() === "rejected" && <XCircle className="size-3" />}
                                {application.status?.toLowerCase() === "pending" && <AlertCircle className="size-3" />}
                                {application.status?.charAt(0).toUpperCase() + application.status?.slice(1).toLowerCase()}
                              </Badge>

                              {canReviewApplications && application.status?.toLowerCase() === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() => onUpdateApplication?.(application._id, "accepted")}
                                  >
                                    <Check className="size-3 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => onUpdateApplication?.(application._id, "rejected")}
                                  >
                                    <X className="size-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
                            <div>
                              <p className="text-gray-500">Applied on</p>
                              <p>{new Date(application.appliedAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">GPA</p>
                              <p>{application.gpa}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-500 mb-1">Expertise</p>
                            <div className="flex flex-wrap gap-2">
                              {application.expertise?.map((skill: string, index: number) => (
                                <Badge key={index} variant="outline">{skill}</Badge>
                              )) || []}
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-500 mb-1">Availability</p>
                            <p className="text-gray-700">{application.availability}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
