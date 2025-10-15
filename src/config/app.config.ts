export default () => ({
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Cardano Configuration (API-Only, No Local Node)
    cardano: {
        network: process.env.CARDANO_NETWORK || 'preprod', // preprod, preview, mainnet
        nodeUrl: process.env.CARDANO_NODE_URL || 'https://cardano-preprod.blockfrost.io/api/v0',
        apiKey: process.env.CARDANO_API_KEY || '',
        escrowContractAddress: process.env.ESCROW_CONTRACT_ADDRESS || '',
        minUtxo: process.env.MIN_UTXO || '1000000', // 1 ADA in lovelace
        // Preprod testnet specific settings
        networkId: process.env.CARDANO_NETWORK_ID || '1', // Preprod network ID
        protocolMagic: process.env.CARDANO_PROTOCOL_MAGIC || '1', // Preprod protocol magic
        // API-only configuration
        useLocalNode: false, // Always false - using BlockFrost API
        apiTimeout: parseInt(process.env.CARDANO_API_TIMEOUT || '30000', 10), // 30 seconds
        retryAttempts: parseInt(process.env.CARDANO_RETRY_ATTEMPTS || '3', 10),
    },

    // Security Configuration
    security: {
        corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
        rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10), // minutes
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // requests per window
    },

    // Notification Configuration
    notifications: {
        email: {
            provider: process.env.EMAIL_PROVIDER || 'console', // console, sendgrid, aws-ses
            apiKey: process.env.EMAIL_API_KEY || '',
            fromEmail: process.env.FROM_EMAIL || 'noreply@escrow-marketplace.com',
        },
        push: {
            provider: process.env.PUSH_PROVIDER || 'console', // console, fcm, web-push
            apiKey: process.env.PUSH_API_KEY || '',
        },
    },

    // IPFS Configuration
    ipfs: {
        gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
        apiUrl: process.env.IPFS_API_URL || '',
        apiKey: process.env.IPFS_API_KEY || '',
    },

    // Escrow Configuration
    escrow: {
        defaultExpiryDays: parseInt(process.env.ESCROW_DEFAULT_EXPIRY_DAYS || '30', 10),
        disputeResolutionDays: parseInt(process.env.DISPUTE_RESOLUTION_DAYS || '7', 10),
        autoRefundAfterExpiry: process.env.AUTO_REFUND_AFTER_EXPIRY === 'true',
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined',
    },
});
