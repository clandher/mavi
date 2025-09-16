import { Component, AfterViewInit } from '@angular/core';
import { FormControlName } from '@angular/forms';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


const originFormControlNameNgOnChanges = FormControlName.prototype.ngOnChanges;
FormControlName.prototype.ngOnChanges = function () {
  const result = originFormControlNameNgOnChanges.apply(this, arguments as any);
  ((this.control as any).nativeElement as any) = (this.valueAccessor as any)?._elementRef?.nativeElement;
  return result;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'mavi';

  constructor(private toastr: ToastrService, private router: Router) { }

  ngAfterViewInit() {
    const runWowEffect = () => {
      setTimeout(() => {
        const wowContainer = document.getElementById('wow-anim');
        if (wowContainer) {
          // Configura el número de niveles a ignorar
          const IGNORE_LEVELS = 2; // Cambia este valor según lo que necesites

          // Clases de animación disponibles
          const wowVariants = [
            'wow-left', 'wow-right', 'wow-top', 'wow-bottom'
          ];
          // Encuentra todos los elementos hijos directos visibles
          const children = Array.from(wowContainer.querySelectorAll('*'));
          // Guarda la variante asignada a cada elemento
          const variantsMap: Map<Element, string> = new Map();
          children.forEach((el) => {
            const variant = wowVariants[Math.floor(Math.random() * wowVariants.length)];
            (el as HTMLElement).classList.add('wow-hide', variant);
            variantsMap.set(el, variant);
          });
          // Animación por profundidad
          function getDepth(element: Element): number {
            let depth = 0;
            let parent = element.parentElement;
            while (parent && parent !== wowContainer) {
              depth++;
              parent = parent.parentElement;
            }
            return depth;
          }

          children.forEach((el) => {
            const depth = getDepth(el);
            if (depth > IGNORE_LEVELS) {
              setTimeout(() => {
                (el as HTMLElement).classList.remove('wow-hide');
                (el as HTMLElement).classList.add('wow-active');
                // Quita la clase de variante después de la animación
                setTimeout(() => {
                  const variant = variantsMap.get(el);
                  if (variant) {
                    (el as HTMLElement).classList.remove(variant);
                  }
                }, 400);
              }, 320 * depth);
            } else {
              // Los padres ignorados se muestran sin animación
              (el as HTMLElement).classList.remove('wow-hide');
              (el as HTMLElement).classList.add('wow-active');
              const variant = variantsMap.get(el);
              if (variant) {
                (el as HTMLElement).classList.remove(variant);
              }
            }
          });
        }
      }, 400); // Espera a que el DOM esté listo
    };

    // Ejecuta el efecto al cargar
    // runWowEffect();

    // // Ejecuta el efecto en cada cambio de ruta
    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationEnd) {
    //     runWowEffect();
    //   }
    // });
  }
}
