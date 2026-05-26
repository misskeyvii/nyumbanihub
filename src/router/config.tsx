import type { RouteObject } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import Home from '../pages/home/page';
import ListingPage from '../pages/listing/page';
import ExplorePage from '../pages/explore/page';
import CategoriesPage from '../pages/categories/page';
import MarketplacePage from '../pages/marketplace/page';
import ProductDetailPage from '../pages/marketplace/product/page';
import ServicesPage from '../pages/services/page';
import ServiceDetailPage from '../pages/services/detail/page';
import EntertainmentPage from '../pages/entertainment/page';
import HowItWorksPage from '../pages/how-it-works/page';
import SignInPage from '../pages/signin/page';
import PostListingPage from '../pages/post-listing/page';
import ProfilePage from '../pages/profile/page';
import AdminPage from '../pages/admin/page';

const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/listing/:id', element: <ListingPage /> },
  { path: '/explore', element: <ExplorePage /> },
  { path: '/categories', element: <CategoriesPage /> },
  { path: '/marketplace', element: <MarketplacePage /> },
  { path: '/marketplace/product/:id', element: <ProductDetailPage /> },
  { path: '/services', element: <ServicesPage /> },
  { path: '/services/:type', element: <ServiceDetailPage /> },
  { path: '/entertainment', element: <EntertainmentPage /> },
  { path: '/how-it-works', element: <HowItWorksPage /> },
  { path: '/signin', element: <SignInPage /> },
  { path: '/post-listing', element: <PostListingPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/kelly', element: <AdminPage /> },
  { path: '*', element: <NotFound /> },
];

export default routes;
