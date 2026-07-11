import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogAdmin from "./pages/BlogAdmin";
import AdminCertificates from "./pages/AdminCertificates";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInternships from "./pages/AdminInternships";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfileSettings from "./pages/ProfileSettings";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import Internships from "./pages/Internships";
import Enroll from "./pages/Enroll";
import CourseContent from "./pages/CourseContent";
import VerifyEnrollment from "./pages/VerifyEnrollment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/blog/admin" element={<BlogAdmin />} />
            <Route path="/admin/certificates" element={<AdminCertificates />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/internships" element={<AdminInternships />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile/settings" element={<ProfileSettings />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/courses/enroll" element={<Enroll />} />
            <Route path="/courses/:courseId/learn" element={<CourseContent />} />
            <Route path="/courses/verify" element={<VerifyEnrollment />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
