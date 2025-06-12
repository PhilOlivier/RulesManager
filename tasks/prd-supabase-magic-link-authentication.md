# Product Requirements Document: Supabase Magic Link Authentication

## Introduction/Overview

This feature implements Supabase magic link authentication for the QDEX Rules Builder application. Currently, the application has no authentication system, allowing unrestricted access to all functionality. This feature will add a simple, secure authentication layer that requires users to verify their identity via email-based magic links before accessing the application.

The goal is to provide secure access control while maintaining ease of use through passwordless authentication, leveraging users' existing email security as the primary protection mechanism.

## Goals

1. **Implement secure authentication** for the Rules Builder application
2. **Provide passwordless login experience** using Supabase magic links
3. **Restrict access to pre-approved users only** (no self-registration)
4. **Maintain simple user experience** with minimal friction
5. **Integrate seamlessly** with existing application functionality

## User Stories

**Primary User Story:**
- As a rules administrator, I want to log in without remembering a password so that it's easy for me to use the site securely.

**Supporting User Stories:**
- As a rules administrator, I want to access the application using only my email address so that I don't need to manage another password.
- As a rules administrator, I want my login session to persist for a reasonable time so that I don't need to re-authenticate frequently.

## Functional Requirements

### Authentication Flow
1. **The system must redirect unauthenticated users to a login page** when they attempt to access any protected route.
2. **The login page must display the QDEX logo and "Rules Builder" text** (consistent with existing navbar styling) and a simple email input field with "Enter email address to log in" instruction.
3. **The system must validate email format** before sending magic links.
4. **The system must send magic link emails only to pre-registered user accounts** (no new account creation via login).
5. **The system must display appropriate feedback** when magic links are sent successfully.
6. **The system must handle magic link clicks** and authenticate users automatically.
7. **Upon successful authentication, the system must redirect users to the scenarios page** (`/test-scenarios`).

### Session Management  
8. **The system must maintain user sessions for approximately one week** before requiring re-authentication.
9. **The system must provide a logout mechanism** accessible from the navigation.
10. **The system must handle session expiration gracefully** by redirecting to the login page.

### Integration
11. **The authentication system must work independently** of the existing environment toggle (MVP/UAT).
12. **Authenticated users must retain access to all existing functionality** including environment switching.
13. **The system must protect all existing routes** except the login page and authentication callbacks.

### Error Handling
14. **The system must redirect users with expired magic links** back to the login page with appropriate messaging.
15. **The system must handle authentication errors gracefully** with user-friendly error messages.
16. **The system must prevent access attempts with invalid magic links**.

## Non-Goals (Out of Scope)

- **Role-based permissions or access control** - all authenticated users have the same access level
- **User registration/signup functionality** - users must be pre-created by administrators
- **User management interface** - user administration will be handled directly in Supabase dashboard
- **Password-based authentication options**
- **Social authentication providers** beyond email magic links  
- **Complex session management or multi-device session handling**
- **Rate limiting on magic link requests** (due to small user base)
- **Advanced email delivery error handling** (due to small user base)
- **Custom email templates or branding** beyond default Supabase emails

## Design Considerations

### Login Page Design
- **Simple, clean layout** with QDEX logo and "Rules Builder" text (matching navbar style)
- **Single email input field** with clear labeling
- **Minimal visual elements** - focus on functionality over aesthetics
- **Responsive design** that works on desktop and mobile
- **Consistent styling** with existing application theme

### User Experience
- **Immediate feedback** when magic links are sent
- **Clear error messaging** for common failure scenarios
- **Seamless integration** with existing navigation and layouts

## Technical Considerations

### Supabase Setup
- **Initial Supabase project configuration** required
- **Magic link authentication enabled** (default Supabase feature)
- **Callback URL configuration** for application domain
- **User management setup** for pre-creating authorized accounts

### Next.js Integration
- **Supabase Auth client setup** in Next.js application
- **Authentication middleware** for route protection
- **Session management** using Supabase's built-in session handling
- **Environment variable configuration** for Supabase credentials

### Database Requirements
- **User accounts must be pre-created** in Supabase Auth
- **No additional user profile tables required** for initial implementation

## Success Metrics

1. **100% of application routes are protected** except login and auth callbacks
2. **Magic link authentication flow completes successfully** for all authorized users
3. **Session persistence works correctly** for the configured duration (≈1 week)
4. **Zero unauthorized access incidents** to protected application areas
5. **User satisfaction with login experience** (informal feedback from 2-3 internal users)

## Implementation Priority

### Phase 1 (Core Authentication)
- Supabase project setup and configuration
- Basic login page implementation
- Magic link email sending functionality
- Authentication middleware for route protection

### Phase 2 (User Experience)
- Session management and persistence
- Logout functionality
- Error handling and user feedback
- Integration testing with existing features

### Phase 3 (Polish)
- UI/UX refinements
- Error message improvements
- Documentation and user setup instructions

## Implementation Notes

- **User Management**: All user administration (adding/removing authorized users) will be handled directly in the Supabase dashboard, not through the application interface.
- **Magic Link Expiration**: Default Supabase setting (1 hour) is acceptable for magic link expiration.
- **Environment Independence**: The authentication system is independent of the API environment toggle (MVP/UAT) - all users have the same access regardless of which API environment they select.
- **Bookmark Handling**: Users who bookmark specific pages will be redirected to login if not authenticated, then can navigate to their desired page after login.

## Dependencies

- **Supabase account and project setup**
- **Email service configuration** (Supabase's default SMTP or custom provider)
- **Domain configuration** for magic link callbacks
- **Environment variables setup** for Supabase credentials

---

*This PRD should provide sufficient detail for a junior developer to understand the requirements and begin implementation of the Supabase magic link authentication feature.* 