# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a yoga dashboard application built with Next.js 14 that allows users to create and manage yoga training sequences by dragging and dropping asanas (yoga poses) into different training steps.

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run asana migration script using ts-node

## Architecture & Key Components

### Core Application Structure
- **Next.js 14 App Router**: Uses the modern app directory structure with TypeScript
- **Drag & Drop Interface**: Built with `@dnd-kit/core` for asana card interactions
- **Local Storage**: Training data is persisted locally via browser localStorage
- **Supabase Integration**: Configured but primarily used for data migration

### Key Directories
- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable React components organized by feature
- `src/constants/` - Static data including asana definitions and training steps
- `src/models/` - TypeScript interfaces and type definitions
- `src/services/` - Business logic and data persistence layer
- `src/lib/` - External service configurations (Supabase)
- `src/utils/` - Utility functions

### Data Models
- **Asana**: Complete yoga pose definition with English/Sanskrit names, descriptions, benefits, and image URLs
- **Training**: Date-based training with steps containing arrays of asana identifiers
- **TrainingSteps**: Key-value mapping of step names to asana identifier arrays

### Training Flow
1. Users select a training date
2. Drag asanas from the available pool into training steps (set-up, warm-up, workout, cool-down, stretching, shavasanah)
3. Training data is automatically saved to localStorage
4. Previous trainings can be loaded by changing the date

### Component Architecture
- **TrainingPage**: Main container managing drag/drop state and training persistence
- **TrainingStep**: Droppable containers for each phase of training
- **AsanaCard**: Draggable cards representing individual yoga poses
- Components use CSS modules for styling

### Path Aliases
Uses `@/*` alias pointing to `src/*` directory for cleaner imports.

### Environment Variables
Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Supabase integration.

## Development Workflow
- Before every changes propose plan for it, structured in checkboxes list