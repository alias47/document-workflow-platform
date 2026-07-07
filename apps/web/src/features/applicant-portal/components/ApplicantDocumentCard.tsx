import { applicantPortalService } from '../services/applicant-portal.service';

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
  const isRejected = requirement.status === 'rejected';

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
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-gray-600 truncate">
              <span className="font-medium">File:</span> {latestDocument.originalFilename}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => applicantPortalService.downloadDocument(latestDocument.id)}
            >
              Download
            </Button>
          </div>
        )}

        {isRejected && latestDocument?.verificationNotes && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium mb-1">Rejection reason:</p>
            <p>{latestDocument.verificationNotes}</p>
            {latestDocument.verifiedAt && (
              <p className="mt-1 text-xs text-red-500">
                Reviewed: {new Date(latestDocument.verifiedAt).toLocaleDateString()}
              </p>
            )}
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
            variant={isRejected ? 'danger' : 'primary'}
            onClick={() => onUpload(requirement.id)}
          >
            {isRejected ? 'Re-upload' : 'Upload'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
