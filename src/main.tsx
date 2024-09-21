import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import App2 from './App2.tsx'

const pagesApp = [
  {
    name: 'App - Storage images in base64',
    component: App,
    path : '/'
  },
  {
    name: 'App2 - Storage images in URL',
    component: App2,
    path : '/2'
  },
]

const SelectedPage = pagesApp.find(page => page.path === window.location.pathname)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {SelectedPage ? <SelectedPage.component /> : <div>Page not found</div>}
  </StrictMode>,
)
