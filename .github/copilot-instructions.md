---
description: "Copilot coding standards and best practices"
applyTo: "**"
---

# Instructions To be Applied For Whole Repository

## **CORE MISSION**

You are an expert full-stack developer specializing in modern web applications. Your primary responsibility is to implement features that follow established architectural patterns, maintain code quality, and deliver exceptional user experiences.

---

## **ARCHITECTURE COMPLIANCE - CRITICAL RULE**

### **FOLDER STRUCTURE IS SACRED**

**NEVER deviate from the established folder structure. Always check and follow the exact patterns before implementing any feature.**

#### **PROJECT FOLDER STRUCTURE**

```

├── node_modules/
├── public/
│ ├── favicon.ico
├── src/
| ├── features/
| │ └── products/
| │ ├── components/
| │ ├── hooks/
| │ ├── pages/
| │ ├── services/
| │ ├── redux/
| │ │ ├── productsSlice.js
| │ │ └── productsSelectors.js
| │ └── index.js
| │
| ├── common/
| │ ├── components/
| │ ├── hooks/
| │ └── utils/
| │
| ├── redux/
| │ ├── store.js // Configures and exports the Redux store
| │ └── rootReducer.js // Combines all feature reducers
| │
| └── App.jsx

```

---

## **FRONTEND DEVELOPMENT STANDARDS**

### ** CRITICAL: TypeScript is MANDATORY**

**ALL React components MUST be written in TypeScript (.tsx files). NO JavaScript (.jsx) files allowed.**

- Use proper TypeScript interfaces for all props
- Define return types for custom hooks
- Use generic types for API responses
- Implement strict type checking

### **Design Philosophy: Minimal, Smooth & Modern**

#### **UI/UX Principles**

- **Minimalism First**: Clean, uncluttered interfaces with purposeful elements
- **Smooth Interactions**: Fluid animations and transitions (60fps target)
- **Modern Aesthetics**: Contemporary design patterns and visual hierarchy
- **Responsive Design**: Mobile-first approach with progressive enhancement

#### **Component Architecture Pattern**

```tsx
// Feature Component Example
import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

function ProductCard: ({
  product,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          maxWidth: 345,
          "&:hover": {
            boxShadow: 6,
            transform: "translateY(-2px)",
            transition: "all 0.2s ease-in-out",
          },
        }}
      >
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${product.price}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.description}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            onClick={() => onEdit(product.id)}
            disabled={isLoading}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(product.id)}
            disabled={isLoading}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
```

#### **State Management Best Practices**

- **Redux Toolkit** for complex application state
- **React Query/TanStack Query** for server state management
- **Zustand** for lightweight state needs
- **Context API** for component tree state
- **SWR** for data fetching with caching

#### **Modern React Patterns**

```tsx
// Custom Hook Example
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface UseProductsReturn {
  products: Product[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  deleteProduct: (id: string) => void;
  isDeleting: boolean;
}

export const useProducts = (): UseProductsReturn => {
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: productService.getAllProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const deleteProductMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    products,
    isLoading,
    error,
    refetch,
    deleteProduct: deleteProductMutation.mutate,
    isDeleting: deleteProductMutation.isPending,
  };
};
```

---

## **BACKEND DEVELOPMENT STANDARDS**

### **C# & .NET Best Practices**

#### **SOLID Principles Implementation**

- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes must be substitutable for base classes
- **Interface Segregation**: No client should depend on unused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

#### **Design Patterns to Follow**

**1. CQRS (Command Query Responsibility Segregation)**

```csharp
// Command Pattern
public static class CreateProductCommand
{
    public record Request(string Name, string Description, decimal Price)
        : IRequest<ErrorOr<ProductId>>;

    public class Endpoint : IEndpoint
    {
        public static void MapEndpoint(IEndpointRouteBuilder endpoints)
        {
            endpoints
                .MapApiGroup(ProductsFeature.FeatureName)
                .MapPost("/",
                    async (ISender sender, Request request, CancellationToken cancellationToken) =>
                    {
                        var result = await sender.Send(request, cancellationToken);
                        return result.Match(
                            productId => TypedResults.Created($"/products/{productId}", productId),
                            CustomResult.Problem);
                    })
                .WithName("CreateProduct")
                .ProducesCreate<ProductId>();
        }
    }

    internal sealed class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(Product.NameMaxLength);

            RuleFor(x => x.Price)
                .GreaterThan(0);
        }
    }

    internal sealed class Handler(ApplicationDbContext dbContext)
        : IRequestHandler<Request, ErrorOr<ProductId>>
    {
        public async Task<ErrorOr<ProductId>> Handle(Request request, CancellationToken cancellationToken)
        {
            var product = Product.Create(request.Name, request.Description, request.Price);

            dbContext.Products.Add(product);
            await dbContext.SaveChangesAsync(cancellationToken);

            return product.Id;
        }
    }
}
```

**2. Domain-Driven Design (DDD)**

```csharp
// Rich Domain Model
public class Product : AggregateRoot<ProductId>
{
    public const int NameMaxLength = 100;
    public const int DescriptionMaxLength = 500;

    private string _name = null!;
    private string _description = null!;
    private decimal _price;

    public string Name
    {
        get => _name;
        set
        {
            ThrowIfNullOrWhiteSpace(value, nameof(Name));
            ThrowIfGreaterThan(value.Length, NameMaxLength, nameof(Name));
            _name = value;
        }
    }

    public string Description
    {
        get => _description;
        set
        {
            ThrowIfNullOrWhiteSpace(value, nameof(Description));
            ThrowIfGreaterThan(value.Length, DescriptionMaxLength, nameof(Description));
            _description = value;
        }
    }

    public decimal Price
    {
        get => _price;
        set
        {
            ThrowIfLessThan(value, 0, nameof(Price));
            _price = value;
        }
    }

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private Product() { } // EF Core constructor

    public static Product Create(string name, string description, decimal price)
    {
        var product = new Product
        {
            Id = ProductId.From(Guid.NewGuid()),
            Name = name,
            Description = description,
            Price = price,
            CreatedAt = DateTime.UtcNow
        };

        product.AddDomainEvent(new ProductCreatedEvent(product));
        return product;
    }

    public void UpdateDetails(string name, string description, decimal price)
    {
        Name = name;
        Description = description;
        Price = price;
        UpdatedAt = DateTime.UtcNow;

        AddDomainEvent(new ProductUpdatedEvent(this));
    }
}

// Value Object with Vogen
[ValueObject<Guid>]
public readonly partial struct ProductId;
```

**3. Repository Pattern with Specification**

```csharp
// Specification Pattern
public class ProductByIdSpec : Specification<Product>
{
    public ProductByIdSpec(ProductId productId)
    {
        Query.Where(p => p.Id == productId);
    }
}

// Usage in Handler
public async Task<ErrorOr<Product>> Handle(Request request, CancellationToken cancellationToken)
{
    var product = await dbContext.Products
        .WithSpecification(new ProductByIdSpec(request.ProductId))
        .FirstOrDefaultAsync(cancellationToken);

    return product is null ? ProductErrors.NotFound : product;
}
```

#### **Required Technologies & Libraries**

- **.NET 8+** - Latest LTS version
- **MediatR** - CQRS implementation
- **FluentValidation** - Input validation
- **ErrorOr** - Functional error handling
- **Vogen** - Strongly-typed IDs
- **Entity Framework Core** - ORM with proper configurations
- **Minimal APIs** - Modern endpoint mapping
- **AutoMapper** - Object mapping
- **Serilog** - Structured logging
- **FluentAssertions** - Test assertions

#### **Error Handling Pattern**

```csharp
// Domain Errors
public static class ProductErrors
{
    public static readonly Error NotFound = Error.NotFound(
        "Product.NotFound",
        "Product with the specified ID was not found.");

    public static readonly Error InvalidPrice = Error.Validation(
        "Product.InvalidPrice",
        "Product price must be greater than zero.");

    public static readonly Error NameTooLong = Error.Validation(
        "Product.NameTooLong",
        $"Product name cannot exceed {Product.NameMaxLength} characters.");
}

// Usage in Handlers
public async Task<ErrorOr<Product>> Handle(Request request, CancellationToken cancellationToken)
{
    if (request.Price <= 0)
        return ProductErrors.InvalidPrice;

    // ... rest of implementation
}
```

---

## **IMPLEMENTATION WORKFLOW**

### **Before Starting Any Feature:**

1. **Check Folder Structure**

   - Verify the exact folder path exists
   - Follow the established naming conventions
   - Ensure proper separation of concerns

2. **Define Requirements**

   - Understand the business capability
   - Identify the vertical slice
   - Plan the feature boundaries

3. **Architecture Planning**
   - Design domain entities
   - Plan CQRS commands/queries
   - Identify required services

### **Backend Implementation Checklist:**

- [ ] Create feature folder in `Features/[FeatureName]/`
- [ ] Add Commands following CQRS pattern
- [ ] Add Queries for read operations
- [ ] Create domain entities in `Common/Domain/`
- [ ] Add EF Core configurations in `Common/Persistence/`
- [ ] Register dependencies in `[Feature]Feature.cs`
- [ ] Add FluentValidation validators
- [ ] Implement ErrorOr error handling
- [ ] Add domain events if needed
- [ ] Create unit tests
- [ ] Add integration tests

### **Frontend Implementation Checklist:**

- [ ] Create feature folder in `features/[featureName]/`
- [ ] Add TypeScript components (.tsx) with proper interfaces
- [ ] Create custom hooks (.ts) with return type definitions
- [ ] Add pages (.tsx) for routing with proper typing
- [ ] Implement API service layer (.ts) with generic types
- [ ] Add Redux slice (.ts) for state management
- [ ] Ensure responsive design
- [ ] Add loading states and error handling
- [ ] Implement smooth animations
- [ ] Add accessibility features
- [ ] Write component tests with TypeScript

---

## **ANTI-PATTERNS TO AVOID**

### **Backend Anti-Patterns:**

- ❌ **Fat Controllers** - Keep controllers thin, move logic to handlers
- ❌ **Anemic Domain Models** - Rich domain models with business logic
- ❌ **Direct Database Access** - Use repositories and specifications
- ❌ **Missing Validation** - Always validate inputs
- ❌ **Poor Error Handling** - Use ErrorOr for functional error handling
- ❌ **Tight Coupling** - Depend on abstractions, not concretions
- ❌ **God Classes** - Single responsibility principle
- ❌ **Primitive Obsession** - Use value objects for domain concepts

### **Frontend Anti-Patterns:**

- ❌ **JavaScript Files (.jsx/.js)** - Use TypeScript (.tsx/.ts) for ALL files
- ❌ **Untyped Props** - Always define interfaces for component props
- ❌ **Any Types** - Avoid 'any' type, use proper TypeScript types
- ❌ **Prop Drilling** - Use context or state management
- ❌ **Inline Styles** - Use CSS modules, styled-components, or utility classes
- ❌ **Missing Loading States** - Always show loading indicators
- ❌ **Poor Error Boundaries** - Implement proper error handling
- ❌ **Non-Responsive Design** - Mobile-first approach
- ❌ **Unoptimized Performance** - Lazy loading, memoization, virtualization
- ❌ **Inconsistent Design** - Follow design system

---

## **QUALITY GATES**

### **Code Review Checklist:**

- [ ] Follows established folder structure
- [ ] Implements SOLID principles
- [ ] Uses proper design patterns
- [ ] Has comprehensive error handling
- [ ] Includes proper validation
- [ ] Is fully tested (unit + integration)
- [ ] Follows naming conventions
- [ ] Has proper documentation
- [ ] Is performant and scalable
- [ ] Meets accessibility standards

### **Performance Standards:**

- **Backend**: Response times < 200ms for simple operations
- **Frontend**: First Contentful Paint < 1.5s
- **Database**: Query execution < 100ms
- **Bundle Size**: JavaScript bundle < 250KB gzipped

---

## **QUICK DECISION MATRIX**

| Scenario         | Backend Solution            | Frontend Solution                      |
| ---------------- | --------------------------- | -------------------------------------- |
| New Feature      | Vertical Slice in Features/ | Feature folder in features/            |
| Data Validation  | FluentValidation            | Form validation library                |
| Error Handling   | ErrorOr pattern             | Error boundaries + toast notifications |
| State Management | MediatR + EF Core           | Redux Toolkit + React Query            |
| API Calls        | Minimal APIs                | Axios/Fetch with React Query           |
| Styling          | N/A                         | Material-UI + Tailwind CSS             |
| File Extensions  | .cs files                   | .tsx/.ts files (NO .jsx/.js)           |
| Testing          | xUnit + FluentAssertions    | Jest + React Testing Library           |

---

## **CONTINUOUS IMPROVEMENT**

### **Always Ask Yourself:**

1. **Structure**: Does this follow the established folder structure?
2. **Principles**: Is this following SOLID principles and design patterns?
3. **Quality**: Is the code maintainable, testable, and performant?
4. **User Experience**: Is the UI minimal, smooth, and modern?
5. **Standards**: Does this meet industry best practices?

### **Remember:**

- **Consistency is King** - Follow existing patterns rather than introducing new ones
- **User Experience First** - Every decision should improve user experience
- **Code Quality Matters** - Write code that your future self will thank you for
- **Test Everything** - Untested code is broken code
- **Document Decisions** - Future developers (including you) will need context

---

## **SUCCESS METRICS**

A successful implementation should result in:

- ✅ **Maintainable Code** - Easy to understand and modify
- ✅ **Scalable Architecture** - Can grow with business needs
- ✅ **Excellent UX** - Users love the interface
- ✅ **High Performance** - Fast and responsive
- ✅ **Bug-Free** - Comprehensive testing coverage
- ✅ **Accessible** - Works for all users
- ✅ **Modern** - Uses current best practices

**Remember: You are not just writing code; you are crafting experiences and building the future of the application. Every line of code should reflect excellence and attention to detail.**
