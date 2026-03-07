import {
    Component,
    signal,
    HostListener,
    AfterViewInit,
    PLATFORM_ID,
    Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements AfterViewInit {
    isScrolled = signal(false);
    menuOpen = signal(false);

    constructor(@Inject(PLATFORM_ID) private platformId: object) { }

    @HostListener('window:scroll')
    onScroll(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.isScrolled.set(window.scrollY > 20);
        }
    }

    toggleMenu(): void {
        this.menuOpen.update(v => !v);
    }

    ngAfterViewInit(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.15 }
        );

        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }
}
