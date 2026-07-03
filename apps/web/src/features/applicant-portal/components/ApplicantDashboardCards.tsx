import type { ApplicantDashboard } from '../types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  dashboard: ApplicantDashboard;
}

export function ApplicantDashboardCards({ dashboard }: Props) {
  const { documentCounts, assignedConsultant } = dashboard;

  const cards = [
    { label: 'Required Documents', value: documentCounts.required, color: 'text-gray-900' },
    { label: 'Uploaded', value: documentCounts.uploaded, color: 'text-blue-600' },
    { label: 'Approved', value: documentCounts.approved, color: 'text-green-600' },
    { label: 'Rejected', value: documentCounts.rejected, color: 'text-red-600' },
    { label: 'Pending', value: documentCounts.pending, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignedConsultant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Assigned Consultant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {assignedConsultant.firstName} {assignedConsultant.lastName}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
