# Restaurant Review Application

## Overview

This is a full-stack restaurant review application built with React and Express. The app allows users to browse restaurants, add new ones, and submit reviews with ratings for price, quality, food options, and bureaucracy. It features a modern UI built with shadcn/ui components and TailwindCSS, with a RESTful API backend and PostgreSQL database integration through Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/bundling
- **Routing**: Wouter for client-side routing (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with custom design tokens and CSS variables
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas for request validation
- **Storage**: Abstracted storage interface with in-memory implementation (MemStorage)
- **API Design**: RESTful API endpoints following standard HTTP conventions
- **Development**: Hot reload with Vite middleware integration in development

### Data Storage Solutions
- **Database**: PostgreSQL with Neon Database serverless driver
- **ORM**: Drizzle ORM for type-safe database queries
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Local Storage**: Browser localStorage for client-side data persistence

### Authentication and Authorization
- Currently no authentication system implemented
- Session management configured with connect-pg-simple for future use
- CORS and security headers handled by Express middleware

### External Dependencies
- **Database**: Neon Database (PostgreSQL serverless)
- **UI Components**: Radix UI primitives for accessible component foundation
- **Image Hosting**: Unsplash for placeholder restaurant images
- **Fonts**: Google Fonts (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)
- **Development**: Replit integration with cartographer plugin and error overlay

The application follows a traditional client-server architecture with clear separation between frontend and backend concerns. The frontend handles user interactions and state management while the backend provides RESTful API endpoints and database operations. The system is designed for scalability with abstracted storage interfaces and modular component architecture.