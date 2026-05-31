import {
    Component,
    signal,
    HostListener,
    AfterViewInit,
    PLATFORM_ID,
    Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements AfterViewInit {
    isScrolled = signal(false);
    menuOpen = signal(false);
    entered = signal(false);

    constructor(@Inject(PLATFORM_ID) private platformId: object) {
        if (!isPlatformBrowser(this.platformId)) {
            this.entered.set(true);
        }
    }

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

        requestAnimationFrame(() => {
            this.entered.set(true);
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        document.querySelectorAll('.fade-in-scroll').forEach(el => {
            observer.observe(el);
        });
    }
}
