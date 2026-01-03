# RechargeEarn - Modern Utility Services Platform

A beautiful, modern web application for purchasing data, airtime, electricity, and cable TV subscriptions. Built with Next.js 16, TypeScript, Tailwind CSS, and Framer Motion.

## ✨ Features

- 🔐 **Authentication System**
  - User registration with OTP verification
  - Secure login/logout
  - Password reset functionality
  - Protected routes

- 💰 **Wallet Management**
  - View wallet balance
  - Fund wallet via Paystack
  - Transaction history
  - Real-time balance updates

- 📱 **Data Purchase**
  - Browse data plans for all networks (MTN, Airtel, GLO, 9Mobile)
  - Quick purchase with phone number
  - Real-time plan availability

- 💳 **Airtime Top-up**
  - Instant airtime purchase
  - Quick amount selection
  - Support for all networks

- ⚡ **Electricity Bills**
  - Meter verification
  - Multiple Disco support
  - Easy bill payment

- 📺 **Cable TV Subscription**
  - Multiple providers (DStv, GOtv, StarTimes)
  - Various subscription plans
  - Smartcard number support

- 👤 **User Profile**
  - View and manage profile
  - Change password
  - Account information

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (see API documentation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recharge-earn-fe
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
recharge-earn-fe/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Main dashboard page
│   ├── wallet/            # Wallet management
│   ├── data/              # Data purchase page
│   ├── airtime/           # Airtime purchase page
│   ├── electricity/       # Electricity bills page
│   ├── cable/             # Cable TV page
│   ├── profile/           # User profile page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── verify-otp/        # OTP verification page
│   └── forgot-password/   # Password reset page
├── components/              # React components
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/                   # Utilities and services
│   ├── api.ts             # API client and endpoints
│   ├── store.ts           # Zustand state management
│   └── utils.ts           # Helper functions
└── public/                # Static assets
```

## 🛠️ Technologies Used

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📱 Pages

### Public Pages
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/verify-otp` - OTP verification
- `/forgot-password` - Password reset

### Protected Pages (Require Authentication)
- `/dashboard` - Main dashboard with quick actions
- `/wallet` - Wallet balance and funding
- `/data` - Data purchase
- `/airtime` - Airtime purchase
- `/electricity` - Electricity bill payment
- `/cable` - Cable TV subscription
- `/profile` - User profile management

## 🎨 Design Features

- **Modern UI/UX** - Clean, intuitive interface designed for young users
- **Gradient Backgrounds** - Beautiful gradient color schemes
- **Smooth Animations** - Framer Motion animations for better UX
- **Responsive Design** - Works perfectly on all devices
- **Dark Mode Support** - Automatic dark mode based on system preference
- **Loading States** - Proper loading indicators throughout
- **Error Handling** - User-friendly error messages

## 🔒 Security Features

- JWT token-based authentication
- Secure token storage in localStorage
- Protected routes with automatic redirect
- Password validation and encryption
- OTP verification for sensitive operations

## 📝 API Integration

The application integrates with a RESTful API. All API endpoints are defined in `lib/api.ts`. Make sure your backend API is running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`.

### Key API Endpoints Used:
- `/users/*` - Authentication and user management
- `/wallet/*` - Wallet operations
- `/payments/*` - Payment processing (Paystack)
- `/utilities/*` - Utility services (data, airtime, electricity, cable)

## 🚀 Building for Production

```bash
npm run build
npm start
```

## 📦 Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

For production, update the URL to your production API endpoint.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🎯 Future Enhancements

- [ ] Transaction history page
- [ ] Notifications system
- [ ] Referral program
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

## 💬 Support

For support, email support@rechargeearn.com or open an issue in the repository.

---

Built with ❤️ using Next.js and modern web technologies.
