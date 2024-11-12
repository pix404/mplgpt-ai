module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.together.ai',
        pathname: '/imgproxy/**',
      },
      {
        protocol: 'https',
        hostname: 'together-ai-bfl-images-prod.s3.us-west-2.amazonaws.com',
        pathname: '/images/**',
      }
    ],
  }
} 