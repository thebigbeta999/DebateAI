# AI Debate Platform

## Overview

This is a real-time AI debate platform built with React and Express that allows users to engage in structured debates with an AI opponent. The application provides an interactive debate environment where users can practice argumentation skills across different debate formats, receive real-time feedback on their performance, and get detailed analysis after completion. The platform supports multiple debate formats (Oxford, Parliamentary, Lincoln-Douglas), adjustable AI difficulty levels, and comprehensive scoring systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with custom styling using Tailwind CSS
- **Component System**: shadcn/ui design system for consistent, accessible components
- **Styling**: Tailwind CSS with CSS variables for theming support

### Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Data Storage**: In-memory storage implementation with interface for easy database migration
- **API Design**: RESTful endpoints for debates, arguments, and analysis
- **Development Setup**: Vite middleware integration for hot module replacement

### Database Schema
- **Users**: Basic user management with username/password authentication
- **Debates**: Core debate entities with topic, format, position, difficulty, and status tracking
- **Arguments**: Individual debate contributions with scoring and feedback storage
- **Debate Results**: Comprehensive analysis and scoring after debate completion

### Real-time Features
- **Timer System**: Custom React hook for debate phase timing with visual indicators
- **Live Feedback**: Real-time argument analysis and scoring during debates
- **Phase Management**: Automatic progression through debate phases (opening, rebuttal, closing)

### AI Integration
- **OpenAI Integration**: GPT-4 for argument generation, analysis, and performance evaluation
- **Argument Analysis**: Multi-dimensional scoring (strength, logic, persuasiveness)
- **Strategic AI**: Adaptive AI opponent that adjusts to user skill level and debate context
- **Performance Analytics**: Detailed feedback generation with strengths and improvement areas

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, TanStack Query for data fetching
- **Backend**: Express.js, Drizzle ORM for PostgreSQL integration
- **Build Tools**: Vite with React plugin, ESBuild for production builds

### Database & Storage
- **Database**: PostgreSQL via Neon serverless with connection pooling
- **ORM**: Drizzle ORM with Zod integration for schema validation
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### AI & External Services
- **OpenAI API**: GPT-4 integration for AI debate opponent and analysis
- **Environment**: Replit-specific plugins for development environment integration

### UI & Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS with PostCSS, class-variance-authority for component variants
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling