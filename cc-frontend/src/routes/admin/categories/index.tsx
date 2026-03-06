import { DataTable } from '@/components/shared/data-display/data-table'
import { useCategories } from '@/hooks/use-category'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/categories/')({
  component: RouteComponent,
})

function RouteComponent() {
    let { data, isLoading } = useCategories()
    let categories = data?.result || []
    
    const columns = [
      {
        key: 'name',
        header: 'Name',
        cell: (cat: typeof categories[number]) => cat.name,
      },
      {
        key: 'icon',
        header: 'Icon',
        cell: (cat: typeof categories[number]) => cat.icon || '—',
      },
      {
        key: 'parent',
        header: 'Parent Category',
        cell: (cat: typeof categories[number]) => {
          if (!cat.parent) return '—'
          if (typeof cat.parent === 'string') return cat.parent
          return cat.parent.name || '—'
        }
      }
    ]

    return <div>
      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        rowKey={(cat) => cat._id}
      />
    </div>
}
