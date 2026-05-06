# Help Center Components

A comprehensive help center system with modal functionality for displaying help information, terms of service, privacy policy, and refund policy.

## Components

### HelpCenter
The main modal component that displays all help content with tabbed navigation.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed

### HelpButton
A reusable button to trigger the help center.

**Props:**
- `onClick: () => void` - Click handler
- `variant?: 'floating' | 'inline'` - Button style (default: 'floating')
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `className?: string` - Additional CSS classes

### HelpCenterProvider
Context provider that manages help center state.

**Props:**
- `children: ReactNode` - Child components

### HelpCenterLayout
A layout wrapper that includes the help center provider and optional floating button.

**Props:**
- `children: ReactNode` - Child components
- `showFloatingButton?: boolean` - Show floating help button (default: true)

## Usage Examples

### 1. Basic Usage with Provider

```jsx
import { HelpCenterProvider, HelpButton, useHelpCenterContext } from '@/components/help';

function MyComponent() {
  const { openHelpCenter } = useHelpCenterContext();

  return (
    <div>
      <h1>My App</h1>
      <HelpButton onClick={openHelpCenter} />
    </div>
  );
}

function App() {
  return (
    <HelpCenterProvider>
      <MyComponent />
    </HelpCenterProvider>
  );
}
```

### 2. Using HelpCenterLayout (Recommended)

```jsx
import { HelpCenterLayout } from '@/components/layout/HelpCenterLayout';

function App() {
  return (
    <HelpCenterLayout>
      <div>
        <h1>My App</h1>
        <p>Your app content here</p>
        {/* Floating help button will appear automatically */}
      </div>
    </HelpCenterLayout>
  );
}
```

### 3. Custom Implementation

```jsx
import { HelpCenter, HelpButton } from '@/components/help';
import { useState } from 'react';

function CustomHelpImplementation() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div>
      <HelpButton onClick={() => setIsHelpOpen(true)} variant="inline" />
      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
```

### 4. In Navigation/Header

```jsx
import { HelpButton, useHelpCenterContext } from '@/components/help';

function Header() {
  const { openHelpCenter } = useHelpCenterContext();

  return (
    <header className="flex justify-between items-center p-4">
      <h1>My App</h1>
      <nav>
        <a href="/home">Home</a>
        <a href="/about">About</a>
        <HelpButton onClick={openHelpCenter} variant="inline" size="sm" />
      </nav>
    </header>
  );
}
```

## Features

### Help Center Tab
- Welcome message and introduction
- Contact options (Email, Live Chat, Phone)
- Frequently Asked Questions
- Useful tips for users

### Terms of Service Tab
- Important rules and regulations
- Usage policies
- User responsibilities
- Link to full terms document

### Privacy Policy Tab
- Data collection practices
- Storage and security information
- Data usage explanations
- User data rights and controls

### Refund Policy Tab
- Refund eligibility criteria
- Refund timeline
- Step-by-step refund process
- Non-refundable items
- Contact support options

## Styling

The components use Tailwind CSS classes and are fully customizable. The modal is responsive and works on all screen sizes.

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly

## Integration Tips

1. **Wrap your app with HelpCenterProvider** or use HelpCenterLayout
2. **Add HelpButton components** where users might need assistance
3. **Use the floating button** for global access
4. **Customize the styling** by modifying the Tailwind classes
5. **Update contact information** in the HelpCenter component

## Customization

You can easily customize:
- Colors and styling (modify Tailwind classes)
- Contact information (update in HelpCenter.jsx)
- FAQ content (modify in HelpCenter.jsx)
- Modal size (adjust max-width in HelpCenter.jsx)
- Tab labels and content
