
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimpleAuthProvider } from "@/contexts/SimpleAuthContext";
import SimpleProtectedRoute from "@/components/auth/SimpleProtectedRoute";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ProjectBoard from "./pages/ProjectBoard";
import SimpleAuth from "./pages/SimpleAuth";
import ReviewPage from "./pages/ReviewPage";
import Pricing from "./pages/Pricing";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProjects from "./pages/AdminProjects";
import AdminBlog from "./pages/AdminBlog";
import AdminAICosts from "./pages/AdminAICosts";
import AdminWaitlist from "./pages/AdminWaitlist";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ApiWaitlist from "./pages/ApiWaitlist";
import NotFound from "./pages/NotFound";
import PromptLayout from "./components/layout/PromptLayout";
import PromptEditPage from "./pages/prompt/PromptEditPage";
import PromptAnalyzePage from "./pages/prompt/PromptAnalyzePage";
import PromptCommentsPage from "./pages/prompt/PromptCommentsPage";
import PromptReviewsPage from "./pages/prompt/PromptReviewsPage";
import PromptTestPage from "./pages/prompt/PromptTestPage";
import PromptHistoryPage from "./pages/prompt/PromptHistoryPage";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<SimpleAuth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/api-waitlist" element={<ApiWaitlist />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/review/:token" element={<ReviewPage />} />
              <Route
                path="/dashboard"
                element={
                  <SimpleProtectedRoute>
                    <Dashboard />
                  </SimpleProtectedRoute>
                }
              />
              <Route
                path="/project/:projectId"
                element={
                  <SimpleProtectedRoute>
                    <ProjectBoard />
                  </SimpleProtectedRoute>
                }
              />
              {/* Prompt Pages */}
              <Route
                path="/project/:projectId/prompt/:promptId"
                element={
                  <SimpleProtectedRoute>
                    <PromptLayout />
                  </SimpleProtectedRoute>
                }
              >
                <Route index element={<PromptEditPage />} />
                <Route path="edit" element={<PromptEditPage />} />
                <Route path="analyze" element={<PromptAnalyzePage />} />
                <Route path="comments" element={<PromptCommentsPage />} />
                <Route path="reviews" element={<PromptReviewsPage />} />
                <Route path="test" element={<PromptTestPage />} />
                <Route path="history" element={<PromptHistoryPage />} />
              </Route>
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="ai-costs" element={<AdminAICosts />} />
                <Route path="waitlist" element={<AdminWaitlist />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SimpleAuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
