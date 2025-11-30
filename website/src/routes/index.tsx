
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const HomePage = lazy(() => import('@/pages/Home/index'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-[#F7F7F5]">Loading...</div>}>
        <HomePage />
      </Suspense>
    ),
  },
]);

export default router;
