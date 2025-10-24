# Utilities and Hooks Usage Guide

This guide demonstrates how to use the new utilities and hooks throughout the QueztLearn LMS project.

## 🎯 Overview

We've created a comprehensive set of utilities and hooks to improve code reusability, consistency, and developer experience:

- **Form Validation**: Enhanced form validation with real-time feedback
- **Error Handling**: Consistent error management across the app
- **Loading States**: Unified loading state management
- **Storage**: Safe localStorage/sessionStorage operations
- **Formatting**: Common formatting utilities
- **Debouncing**: Performance optimization for user interactions

## 📁 File Structure

```
src/
├── lib/
│   ├── types/
│   │   └── api.ts                    # Comprehensive API types
│   └── utils/
│       ├── validation.ts            # Form validation utilities
│       ├── error-handling.ts        # Error handling utilities
│       ├── format.ts               # Formatting utilities
│       ├── storage.ts              # Storage utilities
│       └── index.ts                # Main exports
├── components/
│   └── common/
│       └── error-message.tsx        # Reusable error components
└── hooks/
    └── common/
        ├── use-enhanced-form-validation.ts  # Enhanced form validation
        ├── use-loading-state.ts      # Loading state management
        ├── use-async-operation.ts    # Async operation wrapper
        ├── use-debounce.ts          # Debounce hooks
        └── index.ts                 # Common hooks exports
```

## 🛠️ Utilities Usage

### 1. Validation Utilities

```typescript
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateOrganizationName,
  calculatePasswordStrength,
  generateSubdomain,
} from "@/lib/utils/validation";

// Email validation
const emailResult = validateEmail("user@example.com");
if (!emailResult.isValid) {
  console.log(emailResult.error); // "Please enter a valid email address"
}

// Password validation with strength calculation
const passwordResult = validatePassword("StrongPass123!");
const strength = calculatePasswordStrength("StrongPass123!");
console.log(strength); // { score: 100, label: "Strong", color: "text-green-500" }

// Organization name validation
const orgResult = validateOrganizationName("MIT University");
if (orgResult.isValid) {
  const subdomain = generateSubdomain("MIT University");
  console.log(subdomain); // "mit-university"
}
```

### 2. Error Handling Utilities

```typescript
import {
  getFriendlyErrorMessage,
  extractApiError,
  isNetworkError,
  isAuthError,
  retryOperation,
} from "@/lib/utils/error-handling";

// Get user-friendly error messages
try {
  await apiCall();
} catch (error) {
  const message = getFriendlyErrorMessage(error);
  console.log(message); // "Network error. Please check your connection and try again."
}

// Extract detailed API error information
const apiError = extractApiError(error);
console.log(apiError); // { message: "...", code: "NETWORK_ERROR", status: 500 }

// Check error types
if (isNetworkError(error)) {
  // Handle network-specific errors
} else if (isAuthError(error)) {
  // Handle authentication errors
}

// Retry operations with exponential backoff
const result = await retryOperation(
  () => apiCall(),
  3, // max retries
  1000 // initial delay
);
```

### 3. Formatting Utilities

```typescript
import {
  formatDate,
  formatRelativeTime,
  formatFileSize,
  formatNumber,
  formatCurrency,
  formatDuration,
  truncateText,
  capitalize,
  toTitleCase,
  getInitials,
} from "@/lib/utils/format";

// Date formatting
const formatted = formatDate(new Date()); // "January 1, 2024"
const relative = formatRelativeTime(new Date(Date.now() - 3600000)); // "1 hour ago"

// File size formatting
const size = formatFileSize(1024); // "1 KB"

// Number and currency formatting
const number = formatNumber(1234567); // "1,234,567"
const currency = formatCurrency(99.99); // "$99.99"

// Duration formatting
const duration = formatDuration(3661); // "1h 1m 1s"

// Text utilities
const truncated = truncateText("Long text here", 10); // "Long text..."
const capitalized = capitalize("hello world"); // "Hello world"
const titleCase = toTitleCase("hello world"); // "Hello World"
const initials = getInitials("John Doe"); // "JD"
```

### 4. Storage Utilities

```typescript
import {
  localStorage,
  sessionStorage,
  useLocalStorage,
  useSessionStorage,
} from "@/lib/utils/storage";

// Direct storage operations
localStorage.set("key", { data: "value" });
const data = localStorage.get("key", "default");

// React hooks for storage
function MyComponent() {
  const [value, setValue, removeValue] = useLocalStorage("key", "default");
  const [sessionValue, setSessionValue] = useSessionStorage("sessionKey", null);

  return (
    <div>
      <p>Value: {value}</p>
      <button onClick={() => setValue("new value")}>Update</button>
      <button onClick={removeValue}>Remove</button>
    </div>
  );
}
```

## 🎣 Hooks Usage

### 1. Enhanced Form Validation Hook

```typescript
import { useEnhancedFormValidation } from "@/hooks/common";

function MyForm() {
  const {
    formState,
    updateField,
    validateFieldOnBlur,
    validateAllFields,
    getFieldValue,
    getFieldError,
    isFieldValid,
    isFormValid,
    isFieldValidating,
    hasFieldBeenTouched,
    resetForm,
  } = useEnhancedFormValidation({
    email: "",
    password: "",
    username: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAllFields()) return;
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          value={getFieldValue("email")}
          onChange={(e) => updateField("email", e.target.value)}
          onBlur={() => validateFieldOnBlur("email")}
        />
        {getFieldError("email") && (
          <span className="error">{getFieldError("email")}</span>
        )}
        {isFieldValidating("email") && <div className="spinner" />}
      </div>

      <button type="submit" disabled={!isFormValid}>
        Submit
      </button>
    </form>
  );
}
```

### 2. Loading State Hook

```typescript
import { useLoadingState } from "@/hooks/common";

function MyComponent() {
  const { isLoading, error, setError, executeWithLoading } = useLoadingState({
    autoReset: true,
  });

  const handleAction = async () => {
    try {
      await executeWithLoading(async () => {
        await apiCall();
      });
    } catch (error) {
      setError("Operation failed");
    }
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <button onClick={handleAction} disabled={isLoading}>
        Action
      </button>
    </div>
  );
}
```

### 3. Async Operation Hook

```typescript
import { useAsyncOperation } from "@/hooks/common";

function MyComponent() {
  const { execute, isLoading, error, result } = useAsyncOperation(
    async (data) => {
      return await apiCall(data);
    },
    {
      onSuccess: (result) => console.log("Success!", result),
      onError: (error) => console.log("Error:", error),
    }
  );

  return (
    <div>
      <button onClick={() => execute({ id: 1 })} disabled={isLoading}>
        Execute
      </button>
      {result && <div>Result: {JSON.stringify(result)}</div>}
    </div>
  );
}
```

### 4. Debounce Hooks

```typescript
import { useDebounce, useDebouncedCallback } from "@/hooks/common";

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const debouncedSearch = useDebouncedCallback((term) => {
    // Perform search
    console.log("Searching for:", term);
  }, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform search with debounced term
      debouncedSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, debouncedSearch]);

  return (
    <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
  );
}
```

## 🎨 Component Usage

### 1. Error Message Component

```typescript
import { ErrorMessage } from "@/components/common/error-message";

function MyComponent() {
  const [error, setError] = useState(null);

  return (
    <div>
      <ErrorMessage
        error={error}
        onDismiss={() => setError(null)}
        variant="destructive"
      />
    </div>
  );
}
```

### 2. Success Message Component

```typescript
import { SuccessMessage } from "@/components/common/error-message";

function MyComponent() {
  const [successMessage, setSuccessMessage] = useState(null);

  return (
    <div>
      <SuccessMessage
        message={successMessage}
        onDismiss={() => setSuccessMessage(null)}
      />
    </div>
  );
}
```

## 🔄 Migration Examples

### Before (Old Pattern)

```typescript
// ❌ Old way - manual validation
const [email, setEmail] = useState("");
const [emailError, setEmailError] = useState("");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    setEmailError("Email is required");
    return false;
  }
  if (!emailRegex.test(email)) {
    setEmailError("Please enter a valid email address");
    return false;
  }
  setEmailError("");
  return true;
};

// ❌ Old way - manual error handling
try {
  await apiCall();
} catch (error) {
  const message = error.response?.data?.message || "An error occurred";
  setError(message);
}
```

### After (New Pattern)

```typescript
// ✅ New way - using utilities
import { validateEmail } from "@/lib/utils/validation";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { useEnhancedFormValidation } from "@/hooks/common";

const { updateField, getFieldValue, getFieldError } = useEnhancedFormValidation(
  {
    email: "",
  }
);

// ✅ New way - automatic validation
<input
  value={getFieldValue("email")}
  onChange={(e) => updateField("email", e.target.value)}
/>;
{
  getFieldError("email") && <span>{getFieldError("email")}</span>;
}

// ✅ New way - consistent error handling
try {
  await apiCall();
} catch (error) {
  setError(getFriendlyErrorMessage(error));
}
```

## 📋 Implementation Checklist

- [ ] Replace manual validation with `useEnhancedFormValidation` hook
- [ ] Replace manual error handling with `getFriendlyErrorMessage`
- [ ] Replace manual loading states with `useLoadingState` hook
- [ ] Replace manual debouncing with `useDebounce` hooks
- [ ] Replace manual storage operations with storage utilities
- [ ] Update imports to use new utility functions
- [ ] Test all refactored components
- [ ] Update documentation with new patterns

## 🧪 Testing the New Utilities

```typescript
// Test validation utilities
import { validateEmail, validatePassword } from "@/lib/utils/validation";

describe("Validation Utilities", () => {
  test("validates email correctly", () => {
    expect(validateEmail("test@example.com").isValid).toBe(true);
    expect(validateEmail("invalid-email").isValid).toBe(false);
  });

  test("validates password correctly", () => {
    expect(validatePassword("StrongPass123!").isValid).toBe(true);
    expect(validatePassword("weak").isValid).toBe(false);
  });
});
```

## 🚀 Benefits

1. **Reduced Code Duplication**: Common patterns extracted into reusable utilities
2. **Consistent Error Handling**: Unified error management across the app
3. **Better Type Safety**: TypeScript interfaces for all utilities
4. **Improved Maintainability**: Changes in one place affect all usage
5. **Enhanced Developer Experience**: Clear APIs and documentation
6. **Better Testing**: Utilities can be tested independently
7. **Performance**: Debounced operations and optimized re-renders

## 📚 Next Steps

1. Gradually refactor existing components to use new utilities
2. Add more specific validation rules as needed
3. Extend error handling for different error types
4. Add more formatting utilities as requirements grow
5. Consider adding internationalization support to utilities

## 🔗 Related Files

- `src/app/create-organization/page-refactored.tsx` - Example of refactored create organization page
- `src/app/set-password/page-refactored.tsx` - Example of refactored set password page
- `src/app/verify-email/page-refactored.tsx` - Example of refactored verify email page
- `src/app/[client]/login/page-refactored.tsx` - Example of refactored client login page
- `src/components/admin/invite-user-dialog-refactored.tsx` - Example of refactored invite user dialog
- `src/lib/utils/` - All utility functions
- `src/hooks/common/` - All common hooks
