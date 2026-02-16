import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: 'objects',
    renderMode: RenderMode.Server
  },
  {
    path: 'objects/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'account',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
    status: 404
  }
];
