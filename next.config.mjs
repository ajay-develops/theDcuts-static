/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/studio',
        destination: 'https://devender-saroha-portfolio.sanity.studio/',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
