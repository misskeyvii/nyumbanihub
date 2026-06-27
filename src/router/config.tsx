import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import Home from '../pages/home/page';
import NotFound from '../pages/NotFound';

const ListingPage       = lazy(() => import('../pages/listing/page'));
const ExplorePage       = lazy(() => import('../pages/explore/page'));
const CategoriesPage    = lazy(() => import('../pages/categories/page'));
const MarketplacePage   = lazy(() => import('../pages/marketplace/page'));
const ProductDetailPage = lazy(() => import('../pages/marketplace/product/page'));
const ServicesPage      = lazy(() => import('../pages/services/page'));
const ServiceDetailPage = lazy(() => import('../pages/services/detail/page'));
const EntertainmentPage = lazy(() => import('../pages/entertainment/page'));
const HowItWorksPage    = lazy(() => import('../pages/how-it-works/page'));
const SignInPage        = lazy(() => import('../pages/signin/page'));
const SignUpPage        = lazy(() => import('../pages/signup/page'));
const PostListingPage   = lazy(() => import('../pages/post-listing/page'));
const ProfilePage       = lazy(() => import('../pages/profile/page'));
const ChatPage          = lazy(() => import('../pages/chat/page'));
const AuthCallbackPage  = lazy(() => import('../pages/auth/callback'));
const AdminPage         = lazy(() => import('../pages/admin/page'));
const MarketerPage      = lazy(() => import('../pages/marketer/page'));
const PrivacyPolicyPage = lazy(() => import('../pages/privacy/page'));
const TermsOfUsePage    = lazy(() => import('../pages/terms/page'));
const AntiScamPage      = lazy(() => import('../pages/anti-scam/page'));
const EditListingPage   = lazy(() => import('../pages/edit-listing/page'));
const ContactPage       = lazy(() => import('../pages/contact/page'));

const wrap = (el: React.ReactElement) => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-emerald-600 text-sm">Loading...</span></div>}>
    {el}
  </Suspense>
);

const routes: RouteObject[] = [
  { path: '/',                        element: <Home /> },
  { path: '/listing/:id',             element: wrap(<ListingPage />) },
  { path: '/explore',                 element: wrap(<ExplorePage />) },
  { path: '/categories',              element: wrap(<CategoriesPage />) },
  { path: '/marketplace',             element: wrap(<MarketplacePage />) },
  { path: '/marketplace/product/:id', element: wrap(<ProductDetailPage />) },
  { path: '/services',                element: wrap(<ServicesPage />) },
  { path: '/services/:type',          element: wrap(<ServiceDetailPage />) },
  { path: '/entertainment',           element: wrap(<EntertainmentPage />) },
  { path: '/how-it-works',            element: wrap(<HowItWorksPage />) },
  { path: '/signin',                  element: wrap(<SignInPage />) },
  { path: '/signup',                  element: wrap(<SignUpPage />) },
  { path: '/post-listing',            element: wrap(<PostListingPage />) },
  { path: '/profile',                 element: wrap(<ProfilePage />) },
  { path: '/chat',                    element: wrap(<ChatPage />) },
  { path: '/auth/callback',           element: wrap(<AuthCallbackPage />) },
  { path: '/kelly',                   element: wrap(<AdminPage />) },
  { path: '/marketer',                element: wrap(<MarketerPage />) },
  { path: '/privacy',                 element: wrap(<PrivacyPolicyPage />) },
  { path: '/terms',                   element: wrap(<TermsOfUsePage />) },
  { path: '/anti-scam',               element: wrap(<AntiScamPage />) },
  { path: '/edit-listing/:id',        element: wrap(<EditListingPage />) },
  { path: '/contact',                 element: wrap(<ContactPage />) },
  { path: '*',                        element: <NotFound /> },
];

export default routes;