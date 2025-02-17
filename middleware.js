import { auth, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";


const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/forum(.*)'
])

const isPublicRoute = createRouteMatcher([
  '/dashboard/interview/(.*)'  // Add this to allow public access to interview routes
]);

export default clerkMiddleware((auth,req)=>{
  if (isPublicRoute(req)) {
      return; // Allow access to public routes
  }
  if(isProtectedRoute(req)) auth().protect();
})

// export const config = {
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};