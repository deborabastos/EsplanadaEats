# Esplanada Eats Product Requirements Document (PRD)

## Epic 2 Restaurant Management System

**Epic Goal:** Implement complete restaurant registration system with form validation, image upload capabilities, and comprehensive data management. This epic delivers the core functionality that allows users to contribute restaurant information to the platform.

### Story 2.1 Restaurant Registration Form
As a restaurant owner, I want to register my restaurant with all required information, so that users can discover and evaluate my establishment.

**Acceptance Criteria:**
1.1: Registration modal with all mandatory fields (name, hours, price, quality, vegetarian options, access)
1.2: Optional fields for description and photos
1.3: Real-time validation with visual feedback (red highlighting) for errors
1.4: Form validation includes minimum 4 characters for name, positive price values, 0-5 star ratings
1.5: Success message and new restaurant appears first in list after registration

### Story 2.2 Image Upload & Optimization
As a restaurant owner, I want to upload photos of my restaurant, so that users can see the establishment before visiting.

**Acceptance Criteria:**
2.1: Support for uploading up to 4 images per restaurant
2.2: File validation for JPG, PNG, WebP formats
2.3: Size限制 (2MB maximum) with client-side validation
2.4: Automatic image optimization using Canvas API for web display
2.5: Image preview before final submission

### Story 2.3 Restaurant Detail Modal Content
As a user, I want to see comprehensive restaurant information in a modal, so that I can make informed decisions about visiting.

**Acceptance Criteria:**
3.1: Modal displays complete restaurant information (hours, status, description, address)
3.2: Operating hours with current open/closed status indication
3.3: Photo gallery with multiple image support
3.4: "Avaliar" button to trigger rating modal
3.5: Information clearly organized and visually appealing

### Story 2.4 Form Validation & Error Handling
As a user, I want clear feedback when form data is invalid, so that I can correct errors and complete my submission.

**Acceptance Criteria:**
4.1: Real-time validation for all form fields
4.2: Specific error messages for each validation failure
4.3: Visual feedback (red borders, error icons) for invalid fields
4.4: Form submission blocked until all mandatory fields are valid
4.5: Graceful handling of storage quota exceeded scenarios

---

*This document is part of the sharded PRD. See [README.md](./README.md) for the complete document structure.*