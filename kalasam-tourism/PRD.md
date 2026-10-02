# Kalasam Tourism Website — Product Requirements Document

**Status:** Draft for client review  
**Version:** 1.0  
**Product:** Kalasam Tourism public website and staff dashboard  
**Primary market:** South India, with visitors from India, Malaysia, Singapore, and Sri Lanka

## 1. Product Summary

Kalasam Tourism is a mobile-friendly tourism website focused on spiritual journeys, temple heritage, family ceremonies, and senior-friendly travel in South India. The website will help prospective travelers discover destinations and services, understand how Kalasam supports their trip, and submit an inquiry for a staff member to follow up.

The product includes a public marketing and inquiry website plus an invite-only staff dashboard for managing published website content and incoming inquiries. It is a lead-generation product in v1: visitors request information or a quote, and staff handle confirmation and payment outside the website.

The supplied design image is the visual reference for layout, tone, and responsive behavior. It is not an authoritative source for final business copy, prices, contact information, or policy wording. The client supplies approved copy, logo, licensed photography, contact details, privacy text, and consent wording.

## 2. Goals and Success Criteria

### Product goals

- Explain Kalasam Tourism’s South Indian spiritual and cultural travel offer clearly.
- Make journeys, destinations, temple circuits, family ceremonies, and senior assistance easy to discover.
- Convert interested visitors into complete, actionable inquiries.
- Let authorized staff update public content and manage inquiries without code changes.
- Provide a strong technical and editorial SEO foundation for organic discovery.
- Deliver a usable experience on mobile, desktop, keyboard, and assistive technology.

### Launch acceptance criteria

- Visitors can navigate all v1 public pages and submit a valid inquiry on supported screen sizes.
- Every successfully submitted inquiry is stored and visible to staff, even if email notification fails.
- Only invited staff can access management screens or mutate content and inquiry records.
- Staff can publish or unpublish content without a new application deployment.
- Public pages are indexable, have unique metadata and canonical URLs, and are represented in generated sitemap and robots directives.
- The site has no known critical accessibility, security, or broken-link issues at launch.

### Measurement

Track, without collecting unnecessary personal data:

- Organic search sessions and landing pages.
- Journey, destination, and service page engagement.
- Inquiry form starts, valid submissions, and validation failures.
- Inquiry conversion rate by page and inquiry type.
- Inquiry notification delivery failures.
- Core Web Vitals and page performance by route/device.

Analytics vendor and consent behavior are deployment decisions to confirm with the client. Do not add nonessential tracking before the client approves the privacy and cookie requirements.

## 3. Audience and User Needs

- **Pilgrims and cultural travelers:** Find temple destinations, curated circuits, and practical trip information.
- **Families planning ceremonies:** Understand ceremony and milestone services, then ask about arrangements.
- **Senior travelers and their families:** Find information about transport, pacing, assistance, and accessibility support.
- **International visitors:** Understand the offer and request help planning travel to South India from their country of origin.
- **Travel partners:** Learn how to partner with Kalasam and submit a business inquiry.
- **Kalasam staff:** Keep public information current and follow up on inquiries from one protected dashboard.

## 4. Scope

### Included in v1

- Responsive public website in English.
- Home page, journey index and detail pages, destination index and detail pages, temple circuits, family ceremonies, senior assistance, B2B partners, custom itinerary request, and contact pages.
- Reusable inquiry form supporting journey, ceremony, senior assistance, partner, and general contact inquiry types.
- Click-to-chat WhatsApp links using a client-provided number.
- Invite-only staff authentication and a single staff-admin permission level.
- Staff dashboard for content publishing and inquiry status management.
- Supabase Postgres, Auth, and Storage integration.
- Resend email notification to a configured staff address.
- Inquiry retention and deletion controls described in section 9.
- Search engine and social sharing metadata, sitemap, robots directives, structured data, and SEO-oriented content controls.

### Explicitly out of scope for v1

- Live inventory, date availability, or instant booking confirmation.
- Customer accounts, saved itineraries, or traveler self-service portal.
- Online checkout, deposits, or payment processing.
- Automated WhatsApp Business messaging.
- CRM synchronization, external booking-engine integration, or third-party tour inventory.
- Multiple languages, automatic translation, or language negotiation.
- Public user reviews or unmoderated user-generated content.

## 5. Information Architecture and Key User Journeys

### Public navigation

- Home
- Journeys
- Destinations
- Temple Circuits
- Family Ceremonies
- Senior Assistance
- B2B Partners
- Contact
- Primary action: Plan My Journey
- Persistent WhatsApp contact action, subject to mobile and keyboard accessibility

Journey and destination index pages link to individual detail pages. The custom itinerary request page is reachable from the primary action and from relevant content pages. Footer navigation includes contact and client-approved legal/policy links.

### Visitor journeys

1. **Discover a journey:** Home → journey or destination index → detail page → inquiry form → confirmation → staff follow-up.
2. **Plan a custom trip:** Any primary planning CTA → custom itinerary request → submit preferences and contact details → confirmation → staff follow-up.
3. **Request ceremony or senior support:** Service page → relevant inquiry form → confirmation → staff follow-up.
4. **Contact or partner:** Contact/B2B page → typed inquiry → confirmation → staff follow-up.

### Staff journey

1. Staff member signs in through an invited account.
2. Staff reviews new inquiries and updates their status or deletes a record.
3. Staff creates or edits a content entry, previewing its title, URL slug, images, and SEO fields.
4. Staff publishes or unpublishes the entry; public content updates without an application deployment.

## 6. Functional Requirements

### Public content and navigation

- **FR-01:** Render all public pages and detail pages from published content.
- **FR-02:** Support readable, stable, human-friendly slugs for journeys and destinations.
- **FR-03:** Provide a consistent site header, mobile navigation, footer, breadcrumbs where useful, and prominent inquiry/contact actions.
- **FR-04:** Show approved client copy and licensed media; do not invent prices, guarantees, availability, or testimonials.
- **FR-05:** Show loading, empty, missing-page, and content-fetch error states without exposing secrets or raw backend errors.
- **FR-06:** Provide working email and WhatsApp links from client-approved contact settings.

### Inquiry forms

- **FR-07:** Accept inquiry type: `journey`, `ceremony`, `senior`, `partner`, or `contact`.
- **FR-08:** Collect name, email or phone contact method, country/region of origin, travel window or flexibility, traveler count where relevant, interests, and free-text message. Keep service-specific fields concise.
- **FR-09:** Require explicit consent using client-approved privacy wording and link to the applicable privacy page.
- **FR-10:** Validate and normalize submitted values server-side; show accessible field-level errors and preserve safe form values on failure.
- **FR-11:** Return a receipt ID and a clear confirmation state after successful storage.
- **FR-12:** Reduce spam with server-side request controls and a honeypot field; do not rely on client-side validation alone.
- **FR-13:** Do not request medical diagnoses or other sensitive health information. Accessibility requests, if offered, must ask only for practical arrangements needed for the trip.

### Staff dashboard

- **FR-14:** Provide invite-only authentication; disable public signup.
- **FR-15:** Require staff authorization on every dashboard page, action, and data operation.
- **FR-16:** Create, edit, publish, and unpublish destinations, journeys, temple circuits, services, testimonials, and site settings.
- **FR-17:** Manage media references for approved content images through Supabase Storage.
- **FR-18:** List and inspect inquiries; filter by type and status; update status to `new`, `contacted`, `qualified`, or `closed`.
- **FR-19:** Allow authorized staff to delete an inquiry before the retention deadline.
- **FR-20:** Show email notification status or a warning when notification delivery fails; the stored inquiry remains the source of truth.
- **FR-21:** Provide basic SEO fields for editable pages: SEO title, meta description, canonical URL override only when needed, and social share image. Generate a safe default from page content when optional fields are absent.

## 7. Content Requirements

### Content types

- **Destination:** Name, slug, region, summary, full description, hero image, gallery, related journeys/circuits, publication state, SEO fields.
- **Journey:** Name, slug, summary, description, destination links, duration text if supplied, audience/experience tags, images, inquiry CTA, publication state, SEO fields.
- **Temple circuit:** Name, slug, summary, ordered temple/destination stops, images, publication state, SEO fields.
- **Service:** Service category and copy for family ceremonies, senior assistance, and partner information; images and inquiry CTA.
- **Testimonial:** Client-approved quote, attribution, optional location, and publication state.
- **Site settings:** Brand/contact details, WhatsApp number, social links, navigation/footer links, default SEO/social metadata.
- **Inquiry:** Inquiry type, contact data, trip preferences, message, consent timestamp/text version, source page, status, created/updated timestamps, and notification delivery state.

### Editorial rules

- Client-approved facts, spelling, names, travel details, and policy language are required before publication.
- Each indexable detail page needs distinct useful copy and a unique page title/description.
- Avoid thin near-duplicate destination or journey pages. Pages without sufficient unique content should remain unpublished or be marked `noindex` until complete.
- Alt text describes meaningful image content; decorative images use empty alt text.
- Dates, distances, inclusions, accessibility claims, and service guarantees must be verified by the client before publishing.

## 8. SEO Requirements

SEO is a launch requirement across technical implementation, content entry, and release checks.

### Technical SEO

- **SEO-01:** Use semantic HTML landmarks, one clear primary heading per page, descriptive link text, and crawlable ordinary links between related pages.
- **SEO-02:** Render primary page content and metadata on the server so search crawlers receive meaningful HTML without requiring client-side interaction.
- **SEO-03:** Set a unique title and meta description for every indexable route; use sensible templates only as a fallback.
- **SEO-04:** Emit absolute canonical URLs based on the production site URL; avoid duplicate indexable URLs from query parameters or trailing-slash variants.
- **SEO-05:** Generate `sitemap.xml` containing only canonical, published, indexable URLs; update it as staff publish/unpublish content.
- **SEO-06:** Provide `robots.txt` that permits public pages and blocks private dashboard/auth routes. Do not block CSS, JavaScript, or images required to render pages.
- **SEO-07:** Add Open Graph and social card metadata for shareable pages, with a branded fallback image.
- **SEO-08:** Return correct HTTP status codes, including a real 404 for unknown slugs; use redirects when a published slug changes and prevent redirect loops.
- **SEO-09:** Optimize images with responsive dimensions, modern formats where supported, meaningful filenames, and stable aspect ratios. Lazy-load below-the-fold images and prioritize the main hero image.
- **SEO-10:** Keep dashboard, sign-in, inquiry confirmation, and other private/utility pages out of search results.
- **SEO-11:** Add structured data only when it accurately represents visible, client-confirmed content. Use `TravelAgency`/`Organization` for the business identity and `BreadcrumbList` for breadcrumb navigation where appropriate. Do not mark up fabricated ratings, reviews, prices, or availability.
- **SEO-12:** Do not ship placeholder copy, starter-template titles, broken metadata, or unapproved image credits on public routes.

### Content and local discovery SEO

- Use descriptive page titles and headings around actual offerings, destinations, and services without keyword stuffing.
- Interlink destination, journey, circuit, ceremony, and senior-assistance pages where the relationship is useful to travelers.
- Include accurate company name, address/service area, phone, and opening/contact details only after the client supplies and approves them.
- Keep business identity and contact details consistent across header/footer, contact page, and structured data.
- Do not create doorway pages for countries or cities without distinct useful information and client approval.
- Provide editable title, description, social image, and slug fields to staff. Include a preview/checklist for missing title, description, alt text, and meaningful body copy before publication.

### Performance and accessibility supporting SEO

- Target Core Web Vitals at the 75th percentile when sufficient field data exists: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. Use these as monitoring goals, not a promise independent of hosting and client assets.
- Avoid layout shifts by reserving image dimensions; minimize client-side JavaScript and avoid blocking font/image delivery.
- Meet WCAG 2.2 AA as the product target: keyboard-operable navigation and forms, visible focus, sufficient contrast, labels and error announcements, reduced-motion support, and useful image alternatives.
- Test common mobile breakpoints and low-bandwidth behavior; compress and size client images before publication.

## 9. Data, Privacy, and Security

- Keep public read access limited to published content. Inquiry records and staff-managed data are private.
- Apply Supabase Row Level Security to all relevant tables. Anonymous visitors may submit inquiries only through the server endpoint; they cannot query inquiry rows or write content directly.
- Store Supabase service-role credentials and Resend API keys only in server-side environment variables. Never expose them in `NEXT_PUBLIC_*` variables or client bundles.
- Verify staff sessions and authorization on every server mutation; use secure cookie-based server-side authentication.
- Validate field lengths/types, escape rendered user content, rate-limit inquiry submission, and avoid logging inquiry message/contact values unnecessarily.
- Store only data required to respond to the request. Do not collect payment information or health diagnoses.
- Retain inquiry records for 12 months from submission, with staff deletion available earlier. Run a scheduled server-side cleanup and record operational failures without logging personal data.
- The client supplies the approved privacy notice and consent language. Client/legal review must confirm the policy and retention behavior before launch.
- Use HTTPS in deployed environments and separate development, preview, and production credentials/data.

## 10. High-Level Architecture and Integrations

### Components

1. **Next.js App Router:** Public server-rendered pages, static/shared UI, route metadata, sitemap/robots generation, inquiry API, and protected staff dashboard.
2. **Supabase:** Postgres content/inquiry storage, Auth for invited staff, Storage for approved media, and RLS policies.
3. **Resend:** Staff email notification after inquiry persistence.
4. **WhatsApp click-to-chat:** External `wa.me` link using the configured business phone; no message API integration.
5. **Deployment/runtime:** Deploy the existing Next.js application to a compatible managed host with environment-separated secrets and HTTPS. Confirm final domain and hosting account with the client before release.

### Inquiry flow

1. Browser submits form to `POST /api/inquiries`.
2. Server validates request, consent, spam checks, and field bounds.
3. Server inserts inquiry through a privileged server-side Supabase client.
4. Server attempts a Resend notification and records success/failure.
5. API returns receipt ID and received status. If email is unavailable, staff still find the inquiry in the dashboard.

### Public API contract

`POST /api/inquiries`

Request JSON fields: `type`, `name`, `email`, `phone`, `country`, `travelWindow`, `travelerCount`, `interests`, `message`, `consent`, and `sourcePath`. Email or phone must be supplied. Fields irrelevant to a request type may be omitted. Consent must be true.

Success response: `{ "id": "<receipt-id>", "status": "received" }` with HTTP 201. Validation errors return HTTP 400 with field errors; spam/rate-limit responses use an appropriate 4xx status; unexpected persistence failures return a generic HTTP 5xx response without internal details. Email failure does not change the successful inquiry response.

Admin content mutations use authenticated server actions; do not expose a public content-write API. Any future external integration should receive a separate authenticated endpoint and contract.

## 11. Non-Functional Requirements

- **Reliability:** Inquiry persistence is independent of email delivery; errors are observable to staff/operators.
- **Security:** Least privilege, RLS, server-only secrets, authorized mutations, request validation, and spam controls.
- **Performance:** Server-render public content; keep images responsive and client JavaScript limited to interactive controls.
- **Accessibility:** Target WCAG 2.2 AA and test with keyboard navigation and automated accessibility checks.
- **Maintainability:** Reusable page templates and content components; typed server/client boundaries; environment validation; documented database setup and deployment steps.
- **SEO:** Follow section 8 and verify a production build’s metadata, crawl directives, sitemap, and structured data.
- **Browser support:** Current and previous major versions of Chrome, Safari, Firefox, and Edge; prioritize mobile Safari and Chrome.

## 12. Risks and Dependencies

- Final brand assets, licensed photography, copy, business details, and policy wording depend on the client.
- Search performance depends on content quality, site authority, indexing, and external competition; implementation cannot guarantee rankings.
- Email delivery requires a verified sender domain, valid Resend credentials, and a working notification address.
- Staff access requires Supabase project setup and accounts invited before launch.
- Hosting, production domain, analytics consent, and regional data-processing requirements must be confirmed with the client before production configuration.
- Image transformation features and hosting limits can vary by plan; verify the chosen service tier before relying on paid optimization features.

## 13. Release and Acceptance Checklist

### Functional

- [ ] All public routes and related links work; unknown slugs return 404.
- [ ] Inquiry form works for all five types, validates correctly, records consent, and gives a receipt.
- [ ] Notification success and failure are handled; stored inquiries remain visible.
- [ ] Staff can sign in, edit/publish/unpublish content, update inquiry status, and delete inquiries.
- [ ] Public users cannot access staff data or write content.
- [ ] Retention cleanup removes expired inquiries and can be operationally monitored.

### SEO

- [ ] Every public indexable route has unique title, description, canonical, and social metadata.
- [ ] Production sitemap contains only canonical published pages; robots rules exclude private routes.
- [ ] Structured data validates and matches visible, approved page content.
- [ ] Images have appropriate alt text and dimensions; important images load correctly on mobile.
- [ ] No placeholder titles, duplicate page descriptions, broken internal links, or unintended `noindex` rules.
- [ ] Search Console or equivalent ownership and sitemap submission is completed by the client/operator after launch.

### Quality

- [ ] Responsive visual review at mobile, tablet, and desktop widths against the supplied design.
- [ ] Keyboard, screen-reader labels/errors, contrast, and reduced-motion checks.
- [ ] Build, lint, type-check, API/integration tests, and end-to-end smoke flows pass.
- [ ] Production secrets are configured outside source control; backup and deployment rollback procedures are documented.

## 14. Open Client Inputs Before Production Launch

- Approved logo, copy, photography, image usage rights, and testimonials.
- Business name, contact email/phone, WhatsApp number, service-area/address details, and social links.
- Verified sender domain and staff notification recipient.
- Staff email addresses to invite.
- Approved privacy notice and inquiry consent wording.
- Production domain, hosting account, and any analytics/cookie-consent requirements.
- Confirmed facts for destinations, temple circuits, journeys, ceremony services, accessibility support, and partner program.
