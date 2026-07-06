import { ApiProperty } from '@nestjs/swagger';

/**
 * A single staff row in the workload widget (Sprint 11.5 §13).
 *
 * Task-based columns (open/completed/overdue tasks) from the TASK.md spec are
 * omitted: there is no Task module in this codebase (decision recorded in the
 * sprint report). Workload % is each member's share of the busiest member's
 * assigned-applicant load.
 */
export class StaffWorkloadItemDto {
  @ApiProperty()
  staffId: string = '';

  @ApiProperty()
  name: string = '';

  @ApiProperty()
  role: string = '';

  @ApiProperty()
  assignedApplicants: number = 0;

  @ApiProperty({ description: 'Assigned-applicant share of the busiest member, 0–100' })
  workloadPercent: number = 0;
}
