import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="font-medium mb-2">Products</h2>
          <div className="flex flex-col gap-2">
            <Link to="/admin/products" className="text-blue-600">
              View Products
            </Link>
            <Link to="/admin/products/new" className="text-blue-600">
              Add New Product
            </Link>
          </div>
        </div>

        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="font-medium mb-2">Categories</h2>
          <div className="flex flex-col gap-2">
            <Link to="/admin/categories/new" className="text-blue-600">
              Add New Category
            </Link>
          </div>
        </div>

        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="font-medium mb-2">Orders</h2>
          <div className="flex flex-col gap-2">
            <Link to="/admin/orders" className="text-blue-600">
              View Orders
            </Link>
          </div>
        </div>

        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="font-medium mb-2">Carousels</h2>
          <div className="flex flex-col gap-2">
            <Link to="/admin/carousel" className="text-blue-600">
              View Carousels
            </Link>
            <Link to="/admin/carousel/add" className="text-blue-600">
              Add Carousel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}