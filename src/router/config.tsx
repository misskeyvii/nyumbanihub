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
import SignUpPage from '../pages/signup/page';
import PostListingPage from '../pages/post-listing/page';
import ProfilePage from '../pages/profile/page';
import AdminPage from '../pages/admin/page';
import MarketerPage from '../pages/marketer/page';
import PrivacyPolicyPage from '../pages/privacy/page';
import TermsOfUsePage from '../pages/terms/page';
import AntiScamPage from '../pages/anti-scam/page';
import ChatPage from '../pages/chat/page';
import AuthCallbackPage from '../pages/auth/callback';
import EditListingPage from '../pages/edit-listing/page';
import ContactPage from '../pages/contact/page';

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
  { path: '/signup', element: <SignUpPage /> },
  { path: '/post-listing', element: <PostListingPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/chat', element: <ChatPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/kelly', element: <AdminPage /> },
  { path: '/marketer', element: <MarketerPage /> },
  { path: '/privacy', element: <PrivacyPolicyPage /> },
  { path: '/terms', element: <TermsOfUsePage /> },
  { path: '/anti-scam', element: <AntiScamPage /> },
  { path: '/edit-listing/:id', element: <EditListingPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '*', element: <NotFound /> },
];

export default routes;