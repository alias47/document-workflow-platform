import type { ApplicantDocumentRequirement, RequirementStatus } from '../types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STATUS_BADGE: Record<
  RequirementStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  uploaded: { label: 'Uploaded', variant: 'info' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

interface Props {
  requirement: ApplicantDocumentRequirement;
  onUpload: (requirementId: string) => void;
}

export function ApplicantDocumentCard({ requirement, onUpload }: Props) {
  const badge = STATUS_BADGE[requirement.status];
  const latestDocument = requirement.documents[0];
  const canUpload = requirement.status !== 'approved';

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            {requirement.requirement.name}
            {requirement.requirement.isRequired && (
              <Badge variant="outline" className="ml-2 text-xs">
                Required
              </Badge>
            )}
          </CardTitle>
          {requirement.requirement.description && (
            <p className="text-sm text-gray-500">{requirement.requirement.description}</p>
          )}
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {latestDocument && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">File:</span> {latestDocument.originalFilename}
          </div>
        )}
        {requirement.completedAt && (
          <div className="text-sm text-gray-500">
            Completed: {new Date(requirement.completedAt).toLocaleDateString()}
          </div>
        )}
        {canUpload && (
          <Button
            size="sm"
            variant={requirement.status === 'rejected' ? 'danger' : 'primary'}
            onClick={() => onUpload(requirement.id)}
          >
            {requirement.status === 'rejected' ? 'Re-upload' : 'Upload'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
