import Loading from '@/components/Loading';
import React, { lazy, Suspense } from 'react';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

const Home = lazy(() => import('../pages/Home'));

function Router(): React.JSX.Element {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Outlet />,
      children: [
        {
          path: '',
          element: <Home />,
        },
      ],
    },
  ]);

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default Router;
