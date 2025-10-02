# AI Text Analysis Frontend

A modern, professional AI Text Analysis web application built with Next.js 14+, TypeScript, shadcn/ui, and Tailwind CSS.

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **shadcn/ui** components
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Firebase** for authentication

## Project Structure

```
app/
├── layout.tsx          # Root layout with providers
├── page.tsx            # Main analysis page
├── loading.tsx         # Loading state skeleton
├── analysis/
│   └── [id]/
│       └── page.tsx    # Individual analysis detail page
components/
├── ui/                 # shadcn/ui components
├── header.tsx          # Header component
├── text-input-section.tsx
├── analysis-options.tsx
├── results-section.tsx
├── job-card.tsx
├── analysis-details-sheet.tsx
├── empty-state.tsx
└── theme-provider.tsx
lib/
├── utils.ts            # Utility functions
└── types.ts            # TypeScript interfaces
```

## Components

### Main Page (`app/page.tsx`)
- Hero section with animated background
- Text input section with character counter
- Analysis options with switches and sliders
- Results section with job cards
- Empty state when no jobs exist

### Header (`components/header.tsx`)
- Logo and title
- Navigation tabs
- Dark mode toggle
- Notifications bell
- User avatar

### Text Input Section (`components/text-input-section.tsx`)
- Textarea with auto-resize
- Character counter with color coding
- File upload with drag & drop
- Clear and example buttons
- Analyze button with loading state

### Analysis Options (`components/analysis-options.tsx`)
- Sentiment Analysis switch
- Keyword Extraction switch
- Smart Summary switch
- Language selector
- Analysis depth slider
- Custom stop words input

### Results Section (`components/results-section.tsx`)
- Search functionality
- Filter options
- Refresh button
- Job cards list
- Empty state handling

### Job Card (`components/job-card.tsx`)
- Status badge
- Original text preview
- Analysis results display
- View details and delete actions
- Loading and error states

### Analysis Details Sheet (`components/analysis-details-sheet.tsx`)
- Detailed view of analysis results
- Tabbed interface for different sections
- Export options

## Features

- **Responsive Design**: Works on all device sizes
- **Dark Mode**: Toggle between light and dark themes
- **Real-time Updates**: Automatic job status updates
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Toast Notifications**: User feedback for actions
- **Loading States**: Skeleton loaders for better UX

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```