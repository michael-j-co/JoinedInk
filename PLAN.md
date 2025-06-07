## JoinedInk: A Sentimental & Modern Keepsake Web App

This document outlines a comprehensive plan for developing "JoinedInk," a web application designed to facilitate the creation of collaborative, multimedia "keepsake books." It details the user flow, design principles, core features, and a technology stack for development.

---

### 1. Project Overview

**App Name:** JoinedInk
**Tagline:** Create & Cherish Collaborative Digital Keepsakes
**Purpose:** To streamline the process of collecting heartfelt notes, images, and creative contributions from multiple individuals for a single recipient, or for every member within a group, compiling them into a beautiful, personalized, and private digital "keepsake book."
**Target Audience:** Club organizers, group leaders, friends, family members, and anyone looking to create a memorable collective tribute for special occasions (graduations, farewells, birthdays, appreciation events, etc.).

---

### 2. User Roles & Core Flows

**User Roles:**

* **Organizer:** The person who initiates a "Keepsake Event," invites contributors, and manages the event's lifecycle.
* **Contributor:** An individual who writes a message and adds creative elements for a specific recipient within an event.
* **Recipient:** The person who receives the compiled "Keepsake Book."

**Core User Flows:**

#### 2.1 Organizer Flow

1.  **Account Creation/Login:**
    * Organizer signs up or logs in.
    * *Consideration:* Google/Social login for ease of use.
2.  **Dashboard:**
    * View active and past Keepsake Events.
    * Option to create a new event.
3.  **Create New Keepsake Event:**
    * **Step 1: Event Type Selection:**
        * **Individual Tribute:** One recipient receives a book from many contributors.
        * **Round Robin Exchange (New Feature):** Everyone in a defined group writes for everyone else in that group.
    * **Step 2: Event Details (Individual Tribute):**
        * Event Title (e.g., "Sarah's Graduation Tribute")
        * Recipient's Name (e.g., "Sarah Chen")
        * Recipient's Email Address (for delivery)
        * Contribution Deadline (date and time)
        * Optional: Event Description/Message to Contributors.
    * **Step 2: Event Details (Round Robin Exchange - "Circle of Kindred Notes"):**
        * Event Title (e.g., "Senior Send-Off 2025," "Team Appreciation Exchange")
        * **Group Member List:** Organizer uploads or manually inputs the names and email addresses of all participants in the exchange. Each person in this list will be both a contributor and a recipient.
        * Contribution Deadline (date and time)
        * Optional: Event Description/Message to Contributors.
    * **Step 3: Preview & Confirm:** Review details.
    * **Step 4: Get Contributor Link(s):**
        * For Individual Tribute: Unique, shareable link for contributors.
        * For Round Robin Exchange: A unique link is generated for *each participant* in the group. This link will take them to an interface where they can write a note for *every other person* in the group.
        * Copy link(s) to clipboard button.
        * Option to directly email the link(s) to contributors/participants.
4.  **Manage Event:**
    * View event status (open/closed).
    * Extend deadline (if open).
    * View number of contributions received (without seeing content).
    * Option to manually "Close Event" before the deadline.
    * **Trigger Delivery:** Once closed (either by deadline or manually), the app automatically compiles and sends the Keepsake Book(s) to the recipient(s).

#### 2.2 Contributor Flow

1.  **Access Contribution Page:**
    * Contributor clicks the unique "Contributor Link" provided by the Organizer.
    * *No login required for contributors for simplicity and anonymity.*
2.  **Recipient Confirmation/Selection:**
    * **Individual Tribute:** Page clearly states: "You are writing a message for [Recipient's Name] for the [Event Title]."
    * **Round Robin Exchange:** The contributor is presented with a list of all *other* group members. They can select who they want to write for. A progress tracker might show how many notes they've written.
    * Text input field for contributor's name (optional, can be left blank for full anonymity).
3.  **Write & Customize Message:**
    * **Rich Text Editor:** Area for writing the message.
        * Basic formatting (bold, italics).
        * Choice of font (from a curated selection that fits the "sentimental yet modern" aesthetic).
    * **Media & Decorations:**
        * **Image Upload:** Browse/drag-and-drop image upload.
        * **GIF Search/Upload:** Integration with a GIF library (e.g., Giphy API) or direct upload.
        * **Stickers:** Curated collection of themed stickers (sentimental, celebratory, quirky).
        * **Drawing Tool:** Simple canvas for freehand drawing/doodling.
    * **Digital Signature:**
        * "Draw Signature" tool (canvas for drawing).
        * "Type Signature" field (allows selection of a script-like font).
    * **Page Background/Stationery:** Select a subtle, aesthetically pleasing background theme for *their specific page* from a pre-defined library.
4.  **Preview & Submit:**
    * Preview their individual contribution as it will appear in the Keepsake Book.
    * "Submit Message" button.
5.  **Confirmation:**
    * "Your message for [Recipient's Name] has been submitted!"
    * **Round Robin Exchange:** Option to go back and write for another person in the group until all notes are complete.

#### 2.3 Recipient Flow

1.  **Email Notification:**
    * Recipient receives a personalized email from "JoinedInk" (or organizer's name via JoinedInk) with a subject like "Your Special Keepsake Book from [Event Title] is Here!"
    * Email contains a direct, secure link to their unique Keepsake Book.
2.  **Access Keepsake Book:**
    * Recipient clicks the link and is taken to their digital Keepsake Book on the JoinedInk web app.
3.  **View Keepsake Book:**
    * **Introduction Page:** A customizable cover page (e.g., "A Keepsake Book for [Recipient's Name]").
    * **Scrollable Experience:** The book is presented as a beautifully designed, scrollable single page or a multi-page flipbook view.
    * Each contributor's message (with their chosen elements: text, images, GIFs, drawings, signature, and page background) is displayed as a distinct "page" or section.
    * Clearly shows the *content* but does *not* show who sent which message unless the contributor explicitly added their name.
4.  **Download Options:**
    * **Download as PDF:** Generate a high-quality PDF of the entire Keepsake Book, preserving design and formatting.
    * **Download Raw Content:** Option to download a ZIP file containing individual messages as text files and media as separate files.
5.  **Sharing (Optional):**
    * A secure, read-only shareable link for the recipient to share their book with close family/friends. This feature would be clearly opt-in.

---

### 3. Design Principles & UI/UX

**Aesthetic:** Sentimental yet Modern.

* **Colors:** Soft, inviting color palettes. Use of muted tones, warm neutrals, with occasional pops of subtle, elegant accent colors.
* **Typography:** A blend of clean, readable sans-serif fonts for body text and headers, complemented by a selection of elegant, slightly decorative serif or script fonts for titles or special emphasis (e.g., digital signatures).
* **Layout:** Clean, minimalist layouts with ample whitespace to ensure focus on the content. Responsive design for seamless viewing on desktop and mobile.
* **Imagery:** Use of subtle textures, abstract patterns, and minimalist illustrations that evoke warmth and connection without being overly busy.
* **Animations:** Subtle, smooth transitions and micro-interactions (e.g., button hovers, page transitions) to enhance user experience without being distracting.

**Key UI/UX Considerations:**

* **Intuitive Navigation:** Clear calls to action, simple forms.
* **Contributor Editor:** Drag-and-drop functionality for media, easy access to drawing tools and sticker libraries. Real-time preview of their contribution. For **Circle of Kindred Notes**, a clear progress indicator and easy navigation between recipients.
* **Recipient Book View:** Engaging, fluid scrolling experience. Options for full-screen viewing.
* **Accessibility:** Ensure good color contrast, readable font sizes, and keyboard navigation where appropriate.

---

### 4. Core Features (Detailed)

#### 4.1 Organizer Features

* **User Authentication:** Secure sign-up/login (email/password, social logins like Google, GitHub).
* **Dashboard:** List of events, status, quick actions.
* **Event Creation Form:** Intuitive form for all event details, including the new **event type selection (Individual Tribute vs. Round Robin Exchange)**.
* **Group Member Management (for Round Robin Exchange):** Input fields or file upload for names and emails.
* **Contributor Link Generation & Management:** Unique URL per event (Individual Tribute) or per participant (Round Robin).
* **Basic Contributor Tracking:** Number of submitted notes, not content. For Round Robin, tracking which participants have completed their notes for everyone.
* **Event Closure:** Manual or automatic based on deadline.

#### 4.2 Contributor Features

* **Anonymous Access:** No login required to contribute.
* **Recipient Selection/Confirmation:** Clearly guides the contributor for Individual Tribute or presents the list of recipients for **Circle of Kindred Notes**.
* **Rich Text Editor:**
    * Basic formatting (bold, italic).
    * Font selection (curated list).
    * Word/character count.
* **Media Integration:**
    * **Image Upload:** File picker, drag-and-drop. Client-side image resizing/optimization.
    * **GIF Integration:** Giphy API integration for search and selection.
    * **Sticker Library:** Pre-uploaded, categorized sticker assets.
    * **Drawing Tool:** Simple HTML5 Canvas based drawing functionality (brush size, color, eraser).
* **Digital Signature:**
    * **Draw Signature:** Canvas for freehand drawing.
    * **Type Signature:** Input field with script font options.
* **Page Background Selection:** Pre-defined themes/textures.
* **Live Preview:** See how their individual contribution will look.
* **Submission & Confirmation:** Secure submission to backend.

#### 4.3 Recipient Features

* **Secure Unique Link Access:** One-time or time-limited access token in URL.
* **Dynamic Keepsake Book Rendering:**
    * Display each contribution beautifully.
    * Ensure all media (images, GIFs, drawings) are embedded correctly.
    * Maintain contributor's chosen font, background, and signature.
* **Download Options:**
    * **PDF Generation:** Server-side PDF rendering of the entire book.
    * **ZIP Download:** Package all raw text and media files.
* **Optional Sharing:** Generate a new, read-only shareable link.

#### 4.4 Admin Features (Backend)

* **User Management:** For organizers (create, read, update, delete).
* **Event Management:** View all events, status, troubleshoot.
* **Content Moderation (Future Consideration):** Manual review of submitted content if abuse becomes an issue.
* **Analytics:** Basic usage metrics (number of events created, books delivered).

---

### 5. Technology Stack (Popular & Well-Documented)

**Frontend:**

* **Framework:** **React** (or Next.js for SSR/SSG benefits if scalability/SEO is a major concern, but React alone is simpler to start).
    * *Why:* Component-based, large community, rich ecosystem, excellent for complex UIs.
* **State Management:** **React Context API** (for simpler cases) or **Zustand/Jotai** (lightweight alternatives to Redux for more complex state).
    * *Why:* Efficient state management for interactive components.
* **Styling:** **Tailwind CSS** (utility-first CSS framework) or **Styled-Components / Emotion** (CSS-in-JS).
    * *Why:* Rapid UI development, consistency, and highly customizable. Tailwind for speed, CSS-in-JS for component encapsulation.
* **UI Components:** Leverage a component library like **Material-UI** or **Chakra UI** for common elements (buttons, forms, modals) to accelerate development and ensure consistency, then customize their themes to fit JoinedInk's aesthetic.
* **Image/GIF Handling:**
    * `react-dropzone` for drag-and-drop.
    * Client-side image compression libraries (e.g., `compressorjs`).
    * Giphy API SDK for GIF search.
* **Drawing Tool:** HTML5 Canvas API, wrapped in a React component (`react-canvas-draw` or custom implementation).
* **Digital Signature:** `react-signature-canvas` or similar for drawing.

**Backend:**

* **Language/Framework:** **Node.js with Express.js**.
    * *Why:* JavaScript end-to-end, fast, scalable, huge community, well-suited for API development.
* **Database:** **PostgreSQL** (Relational Database).
    * *Why:* Robust, ACID compliant, widely used, excellent for structured data.
* **ORM:** **Prisma** or **Sequelize**.
    * *Why:* Simplified database interactions, type safety, migrations.
* **Authentication:** **Passport.js** (for email/password and social logins) or **JWT (JSON Web Tokens)** for session management and API authentication.
    * *Why:* Standard, secure authentication strategies.
* **Cloud Storage:** **AWS S3** or **Google Cloud Storage**.
    * *Why:* Scalable and reliable storage for uploaded images, GIFs, and generated PDFs.
* **Email Service:** **SendGrid** or **Mailgun**.
    * *Why:* Reliable transactional email delivery for contributor links and keepsake book notifications.
* **PDF Generation:** A headless browser solution like **Puppeteer** or a dedicated PDF generation library like `html-pdf-node` or `wkhtmltopdf` (requires external binary) on the server.
    * *Why:* To accurately render the complex HTML/CSS of the keepsake book into a high-fidelity PDF.

**Deployment & Hosting:**

* **Frontend (Static Hosting):** **Vercel** or **Netlify**.
    * *Why:* Excellent for deploying React apps, integrated CI/CD, fast CDN.
* **Backend (Server Hosting):** **Render**, **Heroku** (for smaller scale), **AWS EC2/Lambda** or **Google Cloud Run/App Engine** (for larger scale/serverless).
    * *Why:* Scalable and managed hosting solutions for Node.js applications.
* **Database Hosting:** Managed PostgreSQL services (e.g., AWS RDS, Google Cloud SQL, Render Postgres).

---

### 6. Development Phases & Milestones

This is a high-level roadmap. Each phase will involve iterative development, testing, and feedback.

#### Phase 1: Core MVP (Minimum Viable Product) - Individual Tributes

* **Goal:** Functional organizer event creation for individual tributes, anonymous contributor note submission, and basic recipient PDF delivery.
* **Features:**
    * Organizer signup/login.
    * Create event (title, recipient name/email, deadline).
    * Generate unique contributor link.
    * Contributor: Basic text editor for notes.
    * Automated compilation and email delivery of a simple PDF of notes.
    * Basic database setup (users, events, contributions).
* **Technologies Focus:** React, Node.js/Express, PostgreSQL, Prisma/Sequelize, SendGrid, basic PDF generation.

#### Phase 2: Enhanced Contributor & Recipient Experience

* **Goal:** Integrate rich media and design customization for contributions, and an interactive digital book for recipients.
* **Features:**
    * Contributor: Image upload, GIF integration, Sticker library, Drawing tool, Digital Signature.
    * Contributor: Page background selection.
    * Recipient: Interactive web-based keepsake book viewer (HTML rendering).
    * Improved PDF generation to match web design.
    * Download raw content (ZIP).
* **Technologies Focus:** Giphy API, HTML5 Canvas, AWS S3/GCS, Puppeteer for advanced PDF.

#### Phase 3: "Circle of Kindred Notes" Feature Integration

* **Goal:** Implement the group-to-group note exchange functionality.
* **Features:**
    * Organizer: New event type selection.
    * Organizer: Group member list input/upload.
    * Organizer: Generation of unique contributor links for each participant.
    * Contributor: Interface for selecting recipients within the group.
    * Automated compilation of individual keepsake books for each participant in the group.
* **Technologies Focus:** Expansion of backend logic for managing multiple recipients and contributions, UI updates for contributor selection.

#### Phase 4: Organizer & Quality of Life Improvements

* **Goal:** Enhance organizer dashboard, add management tools, and improve overall app polish.
* **Features:**
    * Organizer: Dashboard for managing events, viewing status for both types.
    * Organizer: Extend deadline, manually close event.
    * Recipient: Optional shareable link.
    * Enhanced UI/UX for all flows.
    * Error handling and validation.
    * User notifications within the app.
* **Technologies Focus:** Refinement of existing stack, minor new UI components.

#### Phase 5: Scaling & Future Enhancements (Post-MVP)

* **Goal:** Prepare for growth, add advanced features, and optimize performance.
* **Features:**
    * Themed template packs for organizers/contributors.
    * Analytics for organizers (e.g., "most popular sticker").
    * Premium features (e.g., more storage, custom domains).
    * Integration with other platforms (e.g., Slack for sharing contributor links).
    * Mobile app (React Native).
    * Payment gateway integration (Stripe) for premium features.
* **Technologies Focus:** Performance optimization, microservices architecture (if needed), payment APIs.

---

### 7. Testing Strategy

* **Unit Tests:** For individual functions and components (e.g., Jest, React Testing Library).
* **Integration Tests:** To ensure different parts of the system work together (e.g., API endpoints, database interactions).
* **End-to-End Tests:** Simulate full user flows (e.g., Cypress, Playwright).
* **Manual QA:** Regular testing across different browsers and devices.
* **Security Testing:** OWASP Top 10 considerations, secure coding practices.

