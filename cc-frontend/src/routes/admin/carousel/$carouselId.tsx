import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/carousel/$carouselId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  )
}
