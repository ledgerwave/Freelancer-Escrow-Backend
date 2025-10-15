# Cardano Escrow Marketplace Backend

A comprehensive NestJS backend for a Cardano-based freelancer escrow marketplace with Plutus smart contract integration.

## 🚀 Features

- **Escrow Management**: Complete lifecycle management (create, lock, deliver, release, refund)
- **Dispute Resolution**: Arbitration system with multiple resolution outcomes
- **Notifications**: Email and push notification system
- **Cardano Integration**: Ready for `escrow-contract.plutus` smart contract integration
- **JSON Storage**: File-based storage for development and testing
- **Swagger Documentation**: Comprehensive API documentation
- **Validation**: Input validation with class-validator
- **CORS Support**: Cross-origin resource sharing enabled

## 📋 Requirements

- Node.js 18+ 
- npm or yarn
- Cardano node (for blockchain integration)
- `escrow-contract.plutus` (Plutus smart contract)

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/ledgerwave/Freelancer-Escrow-Backend
cd escrow-backend

# Install dependencies
npm install

# Install validation packages
npm install class-validator class-transformer
```

## 🏃‍♂️ Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Build the application
npm run build
```

## 📚 API Documentation

Once running, access the comprehensive API documentation:

- **Swagger UI**: http://localhost:5000/docs
- **Test Endpoint**: http://localhost:5000/test
- **Health Check**: http://localhost:5000/

## 🏗️ Architecture

### Core Services

1. **EscrowService**: Manages escrow lifecycle and Cardano transaction integration
2. **DisputeService**: Handles dispute resolution and arbitration
3. **NotificationService**: Manages email and push notifications

### Data Models

- **Users**: User profiles with wallet addresses and reputation
- **Gigs**: Freelance job postings with IPFS metadata
- **Escrows**: Escrow transactions with state management
- **Disputes**: Dispute records with resolution tracking
- **Messages**: Communication between users
- **Notifications**: User notification history

### Cardano Integration Points

The system is designed to integrate with Cardano blockchain through:

1. **Smart Contract**: `escrow-contract.plutus` for fund locking and release
2. **Transaction Metadata**: Generation of transaction metadata for escrow operations
3. **UTxO Monitoring**: Tracking of on-chain transactions
4. **Signature Validation**: Verification of release/refund authorizations

## 🔄 Escrow State Machine

```
CREATED → LOCKED → DELIVERED → RELEASED/REFUNDED → CLOSED
```

- **CREATED**: Escrow created, awaiting buyer to lock funds
- **LOCKED**: Funds locked on-chain, seller can start work
- **DELIVERED**: Work delivered, buyer can review and release
- **RELEASED**: Funds released to seller
- **REFUNDED**: Funds refunded to buyer
- **CLOSED**: Transaction completed

## 🚨 Dispute Resolution

1. **Open Dispute**: Buyer or seller can open a dispute
2. **Arbiter Assignment**: System assigns an arbiter to the dispute
3. **Resolution**: Arbiter decides outcome (release to seller or refund to buyer)
4. **Execution**: Resolution is executed on-chain

## 📁 Data Storage

Currently uses JSON file storage (`data.json`) for development. The system is designed to be easily migrated to:
- PostgreSQL
- MongoDB
- Redis
- Any other database system

## 🔧 Configuration

Environment variables:
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 API Endpoints

### Escrows
- `POST /escrows` - Create new escrow
- `GET /escrows/:id` - Get escrow by ID
- `POST /escrows/:id/lock` - Lock escrow with transaction hash
- `POST /escrows/:id/deliver` - Mark work as delivered
- `POST /escrows/:id/release` - Release funds to seller
- `POST /escrows/:id/refund` - Refund funds to buyer
- `GET /escrows/user/:userId` - Get user's escrows
- `POST /escrows/monitor` - Monitor escrows for timeouts

### Disputes
- `POST /disputes` - Open new dispute
- `GET /disputes/:id` - Get dispute by ID
- `POST /disputes/:id/resolve` - Resolve dispute
- `GET /disputes/escrow/:escrowId` - Get escrow disputes
- `GET /disputes/open/list` - Get open disputes
- `POST /disputes/:id/close` - Close dispute

### Notifications
- `GET /notifications/user/:userId` - Get user notifications
- `POST /notifications/:id/read` - Mark notification as read
- `POST /notifications/user/:userId/read-all` - Mark all as read
- `POST /notifications/email` - Send test email
- `POST /notifications/push` - Send test push notification

## 🔐 Security Considerations

- Input validation on all endpoints
- Signature verification for release/refund operations
- CORS configuration for cross-origin requests
- Rate limiting (to be implemented)
- Authentication/authorization (to be implemented)

## 🚀 Deployment

1. Build the application: `npm run build`
2. Set environment variables
3. Deploy to your preferred platform (Docker, AWS, Heroku, etc.)
4. Configure Cardano node connection
5. Deploy `escrow-contract.plutus` to Cardano blockchain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the Swagger documentation at `/docs`
- Review the API endpoints and examples

## 🔮 Future Enhancements

- Database integration
- Authentication system
- Rate limiting
- Advanced monitoring
- Multi-signature support
- Automated arbitration
- Integration with other Cardano dApps