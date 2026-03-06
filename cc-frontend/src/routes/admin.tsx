import { authService } from '@/lib/auth';
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    authService.requireAdmin();
  },
  component: About,
})

function About() {
  return (
    <div>
      <Outlet />
    </div>
)}