import { Component, input } from '@angular/core';

export type EquipeIconName =
  | 'owner'
  | 'scrum'
  | 'docs'
  | 'backend'
  | 'frontend'
  | 'qa'
  | 'advisor'
  | 'objective'
  | 'methodology'
  | 'rationale'
  | 'angular'
  | 'python'
  | 'database'
  | 'ml'
  | 'docker'
  | 'jwt';

@Component({
  selector: 'app-equipe-icon',
  standalone: true,
  template: `
    <svg
      class="equipe-icon-svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('owner') {
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
        }
        @case ('scrum') {
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        }
        @case ('docs') {
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        }
        @case ('backend') {
          <rect x="2" y="3" width="20" height="6" rx="2" />
          <rect x="2" y="15" width="20" height="6" rx="2" />
          <path d="M6 6h.01M6 18h.01M18 6h.01M18 18h.01" />
        }
        @case ('frontend') {
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M3 9h18M8 19h8" />
        }
        @case ('qa') {
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        }
        @case ('advisor') {
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
        }
        @case ('objective') {
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        }
        @case ('methodology') {
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M9 12h6M9 16h6M9 8h6" />
        }
        @case ('rationale') {
          <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />
        }
        @case ('angular') {
          <path d="M12 2 2 6.5l10 17L22 6.5 12 2Z" />
          <path d="M12 2v17M2 6.5h20M7 6.5 12 19l5-12.5" />
        }
        @case ('python') {
          <path d="M12 2C8 2 8 4 8 5v2h8V5c0-1 0-3-4-3Z" />
          <rect x="6" y="7" width="12" height="10" rx="2" />
          <path d="M12 17c4 0 4 2 4 3s0 3-4 3-4-2-4-3 0-3 4-3Z" />
          <circle cx="10" cy="5" r="1" fill="currentColor" stroke="none" />
          <circle cx="14" cy="19" r="1" fill="currentColor" stroke="none" />
        }
        @case ('database') {
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        }
        @case ('ml') {
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          <path d="M19 3v4h4" />
        }
        @case ('docker') {
          <path d="M22 12c0 5.5-4.5 8-10 8-4 0-7.5-2-9-5 3 0 5.5-1 7-3-2.5-2.5-2-6.5-2-6.5 1.5 2 4 2.5 6 2 2.5-1.5 3.5-4.5 3.5-4.5s1 3 3.5 4.5c2 .5 4.5 0 6-2 0 0 .5 4-2 6.5 1.5 2 4 3 7 3-1.5 3-5 5-9 5Z" />
          <rect x="2" y="14" width="3" height="3" rx=".5" />
          <rect x="6" y="14" width="3" height="3" rx=".5" />
          <rect x="10" y="14" width="3" height="3" rx=".5" />
        }
        @case ('jwt') {
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }

    .equipe-icon-svg {
      display: block;
      flex-shrink: 0;
    }
  `,
})
export class EquipeIconComponent {
  name = input.required<EquipeIconName>();
  size = input<number>(24);
}
