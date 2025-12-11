import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppBreadcrumb } from '@/components/common/AppBreadcrumb';

export default function CheckDetailPage() {
  const { checkId } = useParams();

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'COTON Check', href: '/dashboard/admin/check' },
    { label: `Poste ${checkId}`, isCurrent: true },
  ];

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={breadcrumbItems} />

      <Card className="rounded-xl shadow-sm">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-xl font-semibold">Détail du poste</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-muted-foreground">
            Chargement des informations du poste...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
