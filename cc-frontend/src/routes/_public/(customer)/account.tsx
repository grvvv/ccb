import ManageAccount from '@/components/features/account/manage-account';
import { useAddAddress, useMyProfile, useRemoveAddress } from '@/hooks/use-user';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/(customer)/account')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useMyProfile()
  let addAddressMutation = useAddAddress()
  let removeAddressMutation = useRemoveAddress()

  return <ManageAccount
    user={data}      
    onAddAddress={async (body: object) => {
      await addAddressMutation.mutateAsync(body)
    }}
    onDeleteAddress={async (id: string) => {
      await removeAddressMutation.mutateAsync(id);
    }}
  />
  }

