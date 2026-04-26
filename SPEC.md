# Personalized Diet Recommendation System - Frontend Specification

## 1. Project Overview

- **Project Name**: Diet System
- **Type**: Multi-page Web Application (Frontend)
- **Core Functionality**: A comprehensive diet management system with role-based dashboards for Users, Dietitians, and Administrators
- **Target Users**: Individuals seeking diet plans, Dietitians managing clients, Administrators managing the system

## 2. UI/UX Specification

### Color Palette

| Role           | Color         | Hex Code |
| -------------- | ------------- | -------- |
| Background     | Soft Green    | #f0faf4  |
| Primary Accent | Vibrant Green | #2ecc71  |
| Primary Dark   | Forest Green  | #27ae60  |
| Text Primary   | Deep Charcoal | #1a1a2e  |
| Text Secondary | Gray          | #6c757d  |
| White          | Pure White    | #ffffff  |
| Warning        | Amber         | #f39c12  |
| Danger         | Red           | #e74c3c  |
| Success        | Green         | #2ecc71  |
| Info           | Blue          | #3498db  |

### Typography

- **Headings**: Nunito (Google Fonts)
  - H1: 2.5rem, weight 700
  - H2: 2rem, weight 700
  - H3: 1.5rem, weight 600
  - H4: 1.25rem, weight 600
- **Body**: DM Sans (Google Fonts)
  - Regular: 1rem, weight 400
  - Small: 0.875rem, weight 400

### Layout Structure

- **Sidebar**: 260px fixed width, collapsible on mobile
- **Main Content**: Fluid width with max-width 1400px
- **Cards**: Border-radius 12px, box-shadow: 0 4px 20px rgba(0,0,0,0.08)
- **Spacing**: 8px base unit (0.5rem)

### Responsive Breakpoints

- Mobile: < 768px (sidebar becomes hamburger menu)
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Components

- **Buttons**: Primary (green), Secondary (outline), Danger (red)
- **Inputs**: Rounded corners (8px), focus ring with primary color
- **Cards**: White background, subtle shadow, 12px border-radius
- **Tables**: Striped rows, hover effects
- **Charts**: Chart.js with custom color scheme

## 3. Page Specifications

### 3.1 Login/Register Page (index.html)

- Centered card layout with toggle
- Login form: Email, Password, Remember me
- Register form: Name, Email, Password, Confirm Password, Role dropdown
- Password strength indicator (weak/medium/strong)
- Real-time validation feedback
- Role options: User, Dietitian, Admin

### 3.2 User Dashboard

**Sidebar Navigation:**

- Home
- Enter Health Data
- Food Tracker
- Diet Plan
- Reports
- Logout

**Home Section:**

- Welcome card with user name
- Today's calorie summary with progress ring chart
- Quick stats: Calories consumed, remaining, protein/carbs/fat

**Health Data Form:**

- Age (number input)
- Weight (kg)
- Height (cm)
- BMI Calculator (auto-calculate on input)
- BMI Category: Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), Obese (30+)
- Activity Level: Sedentary, Light, Moderate, Active, Very Active
- Dietary Preference: Vegetarian, Non-Vegetarian, Vegan
- Health Goals: Weight Loss, Weight Gain, Maintain Weight, Muscle Gain

**Food Tracker:**

- Meal type selector: Breakfast, Lunch, Dinner, Snacks
- Food name input with autocomplete
- Calories input
- Quantity input
- Add button
- Searchable food log table with delete option

**Diet Plan View:**

- Card layout with time slots: Morning, Afternoon, Evening, Night
- Each slot shows meal items with calories

**Daily Calorie Report:**

- Bar chart using Chart.js
- Weekly intake visualization
- Calorie warning banner (sticky, appears when limit exceeded)

### 3.3 Dietitian Dashboard

**Sidebar Navigation:**

- Home
- Assigned Users
- Create Meal Plan
- Feedback
- Logout

**Home Section:**

- Stats cards: Total Patients, Plans Created, Pending Feedback

**Assigned Users Table:**

- User Name, Health Goal, BMI, Status
- "Create Plan" button per row

**Create Meal Plan Form:**

- User selector dropdown
- Time slot tabs: Morning, Afternoon, Evening, Night
- Meal items with calories per slot
- Calorie target input
- Submit button

**Feedback Form:**

- User dropdown selector
- Textarea for feedback/notes
- Submit button

### 3.4 Admin Dashboard

**Sidebar Navigation:**

- Home
- Manage Users
- Manage Dietitians
- Manage Plans
- Reports
- Logout

**Home Section:**

- Summary stats cards

**Manage Users/Dietitians:**

- CRUD table with View, Edit, Delete actions
- Search/filter functionality

**Manage Plans:**

- Table of all plans
- Assign/reassign dietitian to user

**Reports:**

- Pie chart: User distribution by role
- Bar chart: Plans created per month
- Summary statistics

## 4. JavaScript Features

### Form Validation

- Email format validation
- Password strength (min 8 chars, 1 uppercase, 1 number)
- Required field validation
- Real-time feedback with visual indicators

### BMI Calculator

- Formula: weight(kg) / height(m)²
- Auto-calculate on weight/height change
- Display category label with color coding

### Calorie Counter

- Real-time sum of daily calories
- Color coding: Green (<80%), Yellow (80-100%), Red (>100%)
- Sticky warning banner when exceeded

### Dynamic Tables

- Add/remove food log entries
- No page reload required
- LocalStorage for persistence demo

### Charts (Chart.js)

- Progress ring chart for daily calories
- Bar chart for weekly intake
- Pie chart for user distribution
- Bar chart for monthly plans

### Role-Based Redirect

- Store role in localStorage after login
- Redirect to appropriate dashboard based on role

## 5. External Resources

### CDN Links

- Google Fonts: https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap
- Font Awesome 6: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
- Chart.js: https://cdn.jsdelivr.net/npm/chart.js

## 6. File Structure

```
Diet_System/
├── index.html          (Login/Register)
├── user-dashboard.html (User Dashboard)
├── dietitian-dashboard.html (Dietitian Dashboard)
├── admin-dashboard.html (Admin Dashboard)
├── css/
│   └── styles.css      (Main stylesheet)
└── js/
    ├── auth.js         (Authentication logic)
    ├── user.js         (User dashboard logic)
    ├── dietitian.js    (Dietitian dashboard logic)
    ├── admin.js        (Admin dashboard logic)
    └── charts.js       (Chart configurations)
```
