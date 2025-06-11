import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // You can add additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to dashboard only if user is authenticated
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
} 