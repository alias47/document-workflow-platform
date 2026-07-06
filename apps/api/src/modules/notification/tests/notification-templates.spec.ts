import {
  NOTIFICATION_TEMPLATES,
  isValidTemplateKey,
  renderTemplate,
} from '../templates/notification-templates';

describe('notification templates', () => {
  describe('renderTemplate', () => {
    it('interpolates variables into subject and body', () => {
      const { subject, html } = renderTemplate(NOTIFICATION_TEMPLATES.DOCUMENT_APPROVED, {
        applicantName: 'Jane Doe',
        documentName: 'Passport',
        consultancyName: 'Acme',
        portalUrl: 'https://app.test',
      });

      expect(subject).toContain('approved');
      expect(html).toContain('Jane Doe');
      expect(html).toContain('Passport');
      expect(html).toContain('Acme');
      expect(html).toContain('https://app.test');
    });

    it('renders unknown tokens as empty string (never leaks {{raw}})', () => {
      const { html } = renderTemplate(NOTIFICATION_TEMPLATES.STAFF_WELCOME, {
        staffName: 'Bob',
        // consultancyName intentionally omitted
      });

      expect(html).toContain('Bob');
      expect(html).not.toContain('{{');
      expect(html).not.toContain('}}');
    });

    it('supports whitespace inside tokens', () => {
      const { html } = renderTemplate(NOTIFICATION_TEMPLATES.APPLICANT_WORKFLOW_STAGE_CHANGED, {
        applicantName: 'Ann',
        workflowStage: 'Review',
        consultancyName: 'Acme',
      });
      expect(html).toContain('Review');
    });
  });

  describe('isValidTemplateKey', () => {
    it('accepts known keys', () => {
      expect(isValidTemplateKey(NOTIFICATION_TEMPLATES.STAFF_WELCOME)).toBe(true);
    });

    it('rejects unknown keys', () => {
      expect(isValidTemplateKey('not_a_template')).toBe(false);
    });
  });
});
