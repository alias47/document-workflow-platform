'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { CreateApplicantData, UpdateApplicantData } from '@/services/applicant.service';
import type { ApiResponse } from '@/types/api';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { http } from '@/lib/http';

interface StaffOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

function useStaffOptions() {
  return useQuery({
    queryKey: ['staff', 'list'],
    queryFn: async () => {
      const res = await http.get<ApiResponse<StaffOption[]>>('/staff');
      return res.data.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

const GENDERS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

// Fields shared between create and edit. assignedStaffId only appears in create.
export interface ApplicantFormValues {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  assignedStaffId: string;
}

interface CreateProps {
  mode: 'create';
  onSubmit: (data: CreateApplicantData) => Promise<void>;
  isSubmitting: boolean;
}

interface EditProps {
  mode: 'edit';
  defaultValues: Partial<ApplicantFormValues>;
  onSubmit: (data: UpdateApplicantData) => Promise<void>;
  isSubmitting: boolean;
}

type ApplicantFormProps = CreateProps | EditProps;

const INPUT_STYLE = {
  width: '100%',
  height: '42px',
  padding: '0 12px',
  border: '1.5px solid #E2E8F0',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-size-base)',
  fontFamily: 'inherit',
  outline: 'none',
  background: '#FFFFFF',
} as const;

const SELECT_STYLE = {
  ...INPUT_STYLE,
  appearance: 'none' as const,
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 10px center' as const,
  paddingRight: '36px',
};

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }} role="alert">
      {message}
    </p>
  );
}

export function ApplicantForm(props: ApplicantFormProps) {
  const router = useRouter();
  const isCreate = props.mode === 'create';
  const { data: staffList = [], isLoading: staffLoading } = useStaffOptions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ApplicantFormValues>({
    defaultValues:
      props.mode === 'edit'
        ? {
            firstName: '',
            lastName: '',
            middleName: '',
            email: '',
            phone: '',
            gender: '',
            dateOfBirth: '',
            nationality: '',
            address: '',
            city: '',
            country: '',
            assignedStaffId: '',
            ...props.defaultValues,
          }
        : {
            firstName: '',
            lastName: '',
            middleName: '',
            email: '',
            phone: '',
            gender: '',
            dateOfBirth: '',
            nationality: '',
            address: '',
            city: '',
            country: '',
            assignedStaffId: '',
          },
  });

  const defaultValuesKey = props.mode === 'edit' ? JSON.stringify(props.defaultValues) : null;

  // Populate fields when edit data arrives after async load
  useEffect(() => {
    if (props.mode !== 'edit' || !props.defaultValues) return;
    reset({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      nationality: '',
      address: '',
      city: '',
      country: '',
      assignedStaffId: '',
      ...props.defaultValues,
    });
  }, [defaultValuesKey, reset]); // defaultValuesKey changes when async data loads

  async function onValid(values: ApplicantFormValues) {
    const optional: Record<string, string> = {};
    const optionalKeys: (keyof ApplicantFormValues)[] = [
      'middleName',
      'email',
      'phone',
      'gender',
      'dateOfBirth',
      'nationality',
      'address',
      'city',
      'country',
    ];
    optionalKeys.forEach((k) => {
      if (values[k]) optional[k as string] = values[k] as string;
    });

    if (isCreate) {
      await (props as CreateProps).onSubmit({
        firstName: values.firstName,
        lastName: values.lastName,
        assignedStaffId: values.assignedStaffId,
        ...optional,
      });
    } else {
      await (props as EditProps).onSubmit({
        firstName: values.firstName,
        lastName: values.lastName,
        ...optional,
      });
    }
  }

  // Warn about unsaved changes on navigate away
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Personal details */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Personal Information</div>
          </div>
          <div className="card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 'var(--space-5)',
              }}
            >
              {/* First name */}
              <div>
                <Label htmlFor="firstName">
                  First Name <span style={{ color: '#DC2626' }}>*</span>
                </Label>
                <div style={{ marginTop: '6px' }}>
                  <input
                    id="firstName"
                    type="text"
                    style={{
                      ...INPUT_STYLE,
                      borderColor: errors.firstName ? '#DC2626' : '#E2E8F0',
                    }}
                    placeholder="e.g. John"
                    {...register('firstName', {
                      required: 'First name is required',
                      maxLength: { value: 100, message: 'Max 100 characters' },
                    })}
                  />
                  <FieldError message={errors.firstName?.message} />
                </div>
              </div>

              {/* Middle name */}
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <div style={{ marginTop: '6px' }}>
                  <input
                    id="middleName"
                    type="text"
                    style={INPUT_STYLE}
                    placeholder="Optional"
                    {...register('middleName', {
                      maxLength: { value: 100, message: 'Max 100 characters' },
                    })}
                  />
                  <FieldError message={errors.middleName?.message} />
                </div>
              </div>

              {/* Last name */}
              <div>
                <Label htmlFor="lastName">
                  Last Name <span style={{ color: '#DC2626' }}>*</span>
                </Label>
                <div style={{ marginTop: '6px' }}>
                  <input
                    id="lastName"
                    type="text"
                    style={{
                      ...INPUT_STYLE,
                      borderColor: errors.lastName ? '#DC2626' : '#E2E8F0',
                    }}
                    placeholder="e.g. Doe"
                    {...register('lastName', {
                      required: 'Last name is required',
                      maxLength: { value: 100, message: 'Max 100 characters' },
                    })}
                  />
                  <FieldError message={errors.lastName?.message} />
                </div>
              </div>

              {/* Gender */}
              <div>
                <Label htmlFor="gender">Gender</Label>
                <div style={{ marginTop: '6px' }}>
                  <select id="gender" style={SELECT_STYLE} {...register('gender')}>
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date of birth */}
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div style={{ marginTop: '6px' }}>
                  <input
                    id="dateOfBirth"
                    type="date"
                    style={{
                      ...INPUT_STYLE,
                      borderColor: errors.dateOfBirth ? '#DC2626' : '#E2E8F0',
                    }}
                    {...register('dateOfBirth', {
                      validate: (v) => {
                        if (!v) return true;
                        const d = new Date(v);
                        if (isNaN(d.getTime())) return 'Invalid date';
                        if (d > new Date()) return 'Date of birth cannot be in the future';
                        return true;
                      },
                    })}
                  />
                  <FieldError message={errors.dateOfBirth?.message} />
                </div>
              </div>

              {/* Nationality */}
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <div style={{ marginTop: '6px' }}>
                  <input
                    id="nationality"
                    type="text"
                    style={INPUT_STYLE}
                    placeholder="e.g. Nepali"
                    {...register('nationality', {
                      maxLength: { value: 100, message: 'Max 100 characters' },
                    })}
                  />
                  <FieldError message={errors.nationality?.message} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Contact Information</div>
          </div>
          <div className="card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 'var(--space-5)',
              }}
            >
              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div style={{ marginTop: '6px' }}>
                  <input
                    id="email"
                    type="email"
                    style={{
                      ...INPUT_STYLE,
                      borderColor: errors.email ? '#DC2626' : '#E2E8F0',
                    }}
                    placeholder="applicant@example.com"
                    {...register('email', {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  <FieldError message={errors.email?.message} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div style={{ marginTop: '6px' }}>
                  <input
                    id="phone"
                    type="tel"
                    style={INPUT_STYLE}
                    placeholder="+977 98000 00000"
                    {...register('phone', {
                      maxLength: { value: 50, message: 'Max 50 characters' },
                    })}
                  />
                  <FieldError message={errors.phone?.message} />
                </div>
              </div>

              {/* Address */}
              <div style={{ gridColumn: '1 / -1' }}>
                <Label htmlFor="address">Address</Label>
                <div style={{ marginTop: '6px' }}>
                  <input
                    id="address"
                    type="text"
                    style={INPUT_STYLE}
                    placeholder="Street address"
                    {...register('address')}
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <Label htmlFor="city">City</Label>
                <div style={{ marginTop: '6px' }}>
                  <input
                    id="city"
                    type="text"
                    style={INPUT_STYLE}
                    placeholder="e.g. Kathmandu"
                    {...register('city', {
                      maxLength: { value: 100, message: 'Max 100 characters' },
                    })}
                  />
                  <FieldError message={errors.city?.message} />
                </div>
              </div>

              {/* Country */}
              <div>
                <Label htmlFor="country">Country</Label>
                <div style={{ marginTop: '6px' }}>
                  <input
                    id="country"
                    type="text"
                    style={INPUT_STYLE}
                    placeholder="e.g. Nepal"
                    {...register('country', {
                      maxLength: { value: 100, message: 'Max 100 characters' },
                    })}
                  />
                  <FieldError message={errors.country?.message} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment — create only */}
        {isCreate && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Assignment</div>
            </div>
            <div className="card-body">
              <div style={{ maxWidth: '480px' }}>
                <Label htmlFor="assignedStaffId">
                  Assigned Staff <span style={{ color: '#DC2626' }}>*</span>
                </Label>
                <div style={{ marginTop: '6px' }}>
                  <select
                    id="assignedStaffId"
                    style={{
                      ...SELECT_STYLE,
                      borderColor: errors.assignedStaffId ? '#DC2626' : '#E2E8F0',
                      color: '#0F172A',
                    }}
                    disabled={staffLoading}
                    {...register('assignedStaffId', {
                      required: 'Assigned staff is required',
                    })}
                  >
                    <option value="">
                      {staffLoading ? 'Loading staff…' : 'Select staff member'}
                    </option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.email})
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.assignedStaffId?.message} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            paddingBottom: 'var(--space-6)',
          }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={props.isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={props.isSubmitting}>
            {isCreate ? 'Create Applicant' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}
