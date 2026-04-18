import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, CalendarDays, Ban, Briefcase, Clock, Settings, Calendar, Users, ListOrdered, FileText, Repeat, Shield, Upload, ClipboardCheck, FileDown, LayoutDashboard, MessageSquare } from "lucide-react";
import BookingsTab from "./tabs/BookingsTab";
import AvailabilityTab from "./tabs/AvailabilityTab";
import ServicesTab from "./tabs/ServicesTab";
import SchedulesTab from "./tabs/SchedulesTab";
import SettingsTab from "./tabs/SettingsTab";
import HolidaysTab from "./tabs/HolidaysTab";
import PatientsTab from "./tabs/PatientsTab";
import WaitlistTab from "./tabs/WaitlistTab";
import SessionNotesTab from "./tabs/SessionNotesTab";
import SeriesTab from "./tabs/SeriesTab";
import AuditLogTab from "./tabs/AuditLogTab";
import DocumentsTab from "./tabs/DocumentsTab";
import AssessmentsTab from "./tabs/AssessmentsTab";
import ReportsTab from "./tabs/ReportsTab";
import CalendarViewTab from "./tabs/CalendarViewTab";
import AgendaDashboard from "./tabs/AgendaDashboard";
import CommunicationLogTab from "./tabs/CommunicationLogTab";

type TabKey = "agenda" | "calendar" | "bookings" | "series" | "availability" | "services" | "schedules" | "holidays" | "patients" | "waitlist" | "notes" | "documents" | "assessments" | "reports" | "comms" | "audit" | "settings";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "agenda", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: "calendar", label: "Calendar", icon: <Calendar className="w-4 h-4" /> },
  { key: "bookings", label: "Appointments", icon: <CalendarDays className="w-4 h-4" /> },
  { key: "series", label: "Series", icon: <Repeat className="w-4 h-4" /> },
  { key: "notes", label: "Notes", icon: <FileText className="w-4 h-4" /> },
  { key: "services", label: "Services", icon: <Briefcase className="w-4 h-4" /> },
  { key: "schedules", label: "Schedule", icon: <Clock className="w-4 h-4" /> },
  { key: "availability", label: "Blocks", icon: <Ban className="w-4 h-4" /> },
  { key: "holidays", label: "Holidays", icon: <Calendar className="w-4 h-4" /> },
  { key: "patients", label: "Patients", icon: <Users className="w-4 h-4" /> },
  { key: "documents", label: "Documents", icon: <Upload className="w-4 h-4" /> },
  { key: "assessments", label: "Assessments", icon: <ClipboardCheck className="w-4 h-4" /> },
  { key: "waitlist", label: "Waitlist", icon: <ListOrdered className="w-4 h-4" /> },
  { key: "reports", label: "Reports", icon: <FileDown className="w-4 h-4" /> },
  { key: "comms", label: "Comms Log", icon: <MessageSquare className="w-4 h-4" /> },
  { key: "audit", label: "Audit Log", icon: <Shield className="w-4 h-4" /> },
  { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("agenda");

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground">Admin Dashboard</h1>
            <p className="font-body text-sm text-muted-foreground">Dr. Matilda Molefe's Practice</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="font-body gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-body text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "agenda" && <AgendaDashboard />}
        {activeTab === "calendar" && <CalendarViewTab />}
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "series" && <SeriesTab />}
        {activeTab === "services" && <ServicesTab />}
        {activeTab === "schedules" && <SchedulesTab />}
        {activeTab === "availability" && <AvailabilityTab />}
        {activeTab === "holidays" && <HolidaysTab />}
        {activeTab === "patients" && <PatientsTab />}
        {activeTab === "documents" && <DocumentsTab />}
        {activeTab === "assessments" && <AssessmentsTab />}
        {activeTab === "waitlist" && <WaitlistTab />}
        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "comms" && <CommunicationLogTab />}
        {activeTab === "notes" && <SessionNotesTab />}
        {activeTab === "audit" && <AuditLogTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;
