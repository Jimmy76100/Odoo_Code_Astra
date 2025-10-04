# ExpenseFlow - Modern Expense Management System

A sleek, professional expense management web application featuring a stunning liquid glass design with a black background and enhanced user experience.

## ✨ Features

- **Liquid Glass Design**: Beautiful glassmorphism effects with enhanced transparency and reflections
- **Professional UI**: Clean, modern interface with premium typography (Inter font family)
- **Black Theme**: Elegant black background with subtle color accents
- **Role-Based Access**: Admin, Manager, and Employee modes with different permissions
- **Expense Management**: Create, track, and approve expenses with OCR receipt scanning
- **Multi-Level Approval**: Configurable approval workflows
- **Currency Support**: Multi-currency expense tracking with automatic conversion
- **Real-time Notifications**: Toast notifications for user feedback
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 How to Run

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Quick Start

1. **Download/Clone the project**
   ```bash
   git clone <repository-url>
   cd expense-management-app
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local server for better performance:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (if you have http-server installed)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Access the application**
   - Direct file: Open `index.html` in your browser
   - Local server: Navigate to `http://localhost:8000`

### Demo Credentials

The application comes with pre-configured demo accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@expenseflow.com | password123 | Full access to all features |
| **Manager** | sarah@expenseflow.com | password123 | Team management and approvals |
| **Employee** | mike@expenseflow.com | password123 | Submit and view own expenses |
| **Employee** | lisa@expenseflow.com | password123 | Submit and view own expenses |

## 🎨 Design Features

### Liquid Glass Effects
- **Enhanced Transparency**: Subtle background blur with refined opacity
- **Dynamic Reflections**: Animated highlights and shadows
- **Smooth Animations**: Fluid transitions and hover effects
- **Professional Shadows**: Multi-layered shadow system for depth

### Typography
- **Primary Font**: Inter (Google Fonts) - Modern, clean, professional
- **Monospace Font**: JetBrains Mono - For code and technical elements
- **Font Weights**: 300-800 range for visual hierarchy
- **Anti-aliasing**: Optimized text rendering

### Color Scheme
- **Background**: Pure black (#000000) with subtle gradient overlays
- **Accent Colors**: Blue, green, yellow, red for different states
- **Glass Elements**: White with varying opacity levels
- **Text**: High contrast white text for readability

## 🛠️ Technical Details

### File Structure
```
expense-management-app/
├── index.html          # Main HTML file
├── script.js           # JavaScript application logic
├── style/
│   ├── main.css        # Core styles and liquid glass effects
│   ├── components.css  # Component-specific styles
│   └── pages.css       # Page-specific layouts
├── package.json        # Dependencies (if using Node.js)
└── README.md          # This file
```

### Key Technologies
- **HTML5**: Semantic markup
- **CSS3**: Advanced styling with backdrop-filter, custom properties
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **Chart.js**: For data visualization
- **Font Awesome**: Icon library
- **Google Fonts**: Typography

### Browser Support
- Chrome 76+
- Firefox 72+
- Safari 13+
- Edge 79+

## 🎯 Usage Guide

### Getting Started
1. **Login**: Use any of the demo credentials above
2. **Navigate**: Use the bottom navigation bar to switch between sections
3. **Mode Switch**: Click the "Mode" button in the bottom nav to change user roles
4. **Submit Expenses**: Go to Expenses → Add Expense to create new entries

### Key Features
- **Dashboard**: Overview of expenses, pending approvals, and statistics
- **Expenses**: Manage your expense submissions with OCR receipt scanning
- **Approvals**: Review and approve team expenses (Manager/Admin only)
- **People**: User management (Admin only)
- **Settings**: Configure approval rules and company settings (Admin only)

### Navigation
- **Bottom Navigation**: Fixed glass navigation bar with smooth animations
- **Mode Switcher**: Moved from top header to bottom navigation for better UX
- **Responsive**: Adapts to different screen sizes automatically

## 🔧 Customization

### Changing Colors
Edit the CSS custom properties in `style/main.css`:
```css
:root {
    --primary-blue: #3b82f6;
    --success-green: #10b981;
    --warning-yellow: #f59e0b;
    --error-red: #ef4444;
}
```

### Modifying Glass Effects
Adjust the liquid glass properties:
```css
.liquid-glass {
    background: var(--glass-bg);
    backdrop-filter: blur(25px);
    border-radius: 24px;
}
```

### Adding New Features
The application is built with modular JavaScript classes. Extend the `ExpenseFlow` class to add new functionality.

## 🐛 Troubleshooting

### Common Issues

1. **Glass effects not working**
   - Ensure you're using a modern browser
   - Check if hardware acceleration is enabled

2. **Fonts not loading**
   - Verify internet connection for Google Fonts
   - Check browser console for network errors

3. **Navigation not responding**
   - Clear browser cache
   - Ensure JavaScript is enabled

4. **Mobile display issues**
   - Use responsive design mode in browser dev tools
   - Check viewport meta tag

### Performance Tips
- Use a local server instead of opening files directly
- Enable hardware acceleration in browser settings
- Close unnecessary browser tabs for better performance

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- Touch-friendly navigation
- Optimized glass effects for mobile performance
- Responsive typography scaling
- Mobile-specific interactions

## 🔒 Security Note

This is a demo application with hardcoded credentials. In a production environment:
- Implement proper authentication
- Use secure password hashing
- Add CSRF protection
- Validate all user inputs
- Use HTTPS

## 📄 License

This project is for demonstration purposes. Feel free to use and modify as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

---

**Enjoy using ExpenseFlow!** 🎉

For any questions or support, please refer to the troubleshooting section above or create an issue in the repository.