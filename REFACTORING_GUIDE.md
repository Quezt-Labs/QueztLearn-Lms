# Code Refactoring Guide

This guide documents the common utilities and hooks created to reduce code duplication and improve maintainability.

## 🎯 Overview

We've identified and extracted common patterns from the codebase into reusable utilities and hooks:

- **Form Validation**: Centralized validation logic
- **Error Handling**: Consistent error management
- **Loading States**: Unified loading state management
- **Storage**: Safe localStorage/sessionStorage operations
- **Formatting**: Common formatting utilities

## 📁 New File Structure

```
src/
├── lib/
│   └── utils/
│       ├── validation.ts      # Form validation utilities
│       ├── error-handling.ts # Error handling utilities
│       ├── format.ts         # Formatting utilities
│       ├── storage.ts        # Storage utilities
│       └── index.ts         # Main exports
└── hooks/
    └── common/
        ├── use-form-validation.ts  # Form validation hook
        ├── use-loading-state.ts    # Loading state hook
        ├── use-async-operation.ts  # Async operation hook
        ├── use-debounce.ts         # Debounce hooks
        └── index.ts               # Common hooks exports
```

## 🛠️ Utilities

### Validation Utilities (`src/lib/utils/validation.ts`)

```typescript
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/utils/validation";

// Email validation
const emailResult = validateEmail("user@example.com");
if (!emailResult.isValid) {
  console.log(emailResult.error); // "Please enter a valid email address"
}

// Password validation
const passwordResult = validatePassword("weak");
if (!passwordResult.isValid) {
  console.log(passwordResult.error); // "Password must be at least 8 characters long"
}

// Password strength calculation
const strength = calculatePasswordStrength("StrongPass123!");
console.log(strength); // { score: 100, label: "Strong", color: "text-green-500" }
```

### Error Handling Utilities (`src/lib/utils/error-handling.ts`)

```typescript
import {
  getFriendlyErrorMessage,
  extractApiError,
} from "@/lib/utils/error-handling";

try {
  await apiCall();
} catch (error) {
  // Get user-friendly error message
  const message = getFriendlyErrorMessage(error);
  console.log(message); // "Network error. Please check your connection and try again."

  // Extract detailed API error
  const apiError = extractApiError(error);
  console.log(apiError); // { message: "...", code: "NETWORK_ERROR", status: 500 }
}
```

### Formatting Utilities (`src/lib/utils/format.ts`)

```typescript
import {
  formatDate,
  formatRelativeTime,
  formatFileSize,
} from "@/lib/utils/format";

// Date formatting
const formatted = formatDate(new Date()); // "January 1, 2024"
const relative = formatRelativeTime(new Date(Date.now() - 3600000)); // "1 hour ago"

// File size formatting
const size = formatFileSize(1024); // "1 KB"
```

### Storage Utilities (`src/lib/utils/storage.ts`)

```typescript
import {
  localStorage,
  sessionStorage,
  useLocalStorage,
} from "@/lib/utils/storage";

// Direct storage operations
localStorage.set("key", { data: "value" });
const data = localStorage.get("key", "default");

// React hook for localStorage
const [value, setValue, removeValue] = useLocalStorage("key", "default");
```

## 🎣 Common Hooks

### Form Validation Hook (`useFormValidation`)

```typescript
import { useFormValidation } from "@/hooks/common";

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
  } = useFormValidation({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAllFields()) return;
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={getFieldValue("email")}
        onChange={(e) => updateField("email", e.target.value)}
        onBlur={() => validateFieldOnBlur("email")}
      />
      {getFieldError("email") && <span>{getFieldError("email")}</span>}
    </form>
  );
}
```

### Loading State Hook (`useLoadingState`)

```typescript
import { useLoadingState } from "@/hooks/common";

function MyComponent() {
  const { isLoading, error, setError, executeWithLoading } = useLoadingState();

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

### Async Operation Hook (`useAsyncOperation`)

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

### Debounce Hooks

```typescript
import { useDebounce, useDebouncedCallback } from "@/hooks/common";

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const debouncedSearch = useDebouncedCallback((term) => {
    // Perform search
  }, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform search with debounced term
    }
  }, [debouncedSearchTerm]);

  return (
    <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
  );
}
```

## 🔄 Migration Guide

### Before (Old Pattern)

```typescript
// ❌ Old way - duplicated validation logic
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
import { useFormValidation } from "@/hooks/common";

const { updateField, getFieldValue, getFieldError } = useFormValidation({
  email: "",
});

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

## 📋 Refactoring Checklist

- [ ] Replace manual validation with `useFormValidation` hook
- [ ] Replace manual error handling with `getFriendlyErrorMessage`
- [ ] Replace manual loading states with `useLoadingState` hook
- [ ] Replace manual debouncing with `useDebounce` hooks
- [ ] Replace manual storage operations with storage utilities
- [ ] Update imports to use new utility functions
- [ ] Test all refactored components

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

## 📚 Next Steps

1. Gradually refactor existing components to use new utilities
2. Add more specific validation rules as needed
3. Extend error handling for different error types
4. Add more formatting utilities as requirements grow
5. Consider adding internationalization support to utilities

## 🔗 Related Files

- `src/app/login/page-refactored.tsx` - Example of refactored login page
- `src/app/register-admin/page-refactored.tsx` - Example of refactored registration page
- `src/lib/utils/` - All utility functions
- `src/hooks/common/` - All common hooks
