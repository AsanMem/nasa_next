/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'apod.nasa.gov' },
        { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      ],
    },
    eslint: {      
       ignoreDuringBuilds: true,
        },
           // typescript: {
              //   ignoreBuildErrors: true,
                 // },
                 transpilePackages: ['noisejs'],
    webpack(config, { isServer }) {
      config.module.rules.push({
        test: /\.(glsl|vs|fs)$/,
        exclude: /node_modules/,
        use: 'raw-loader',
      });
  
      config.resolve.extensions.push('.glsl', '.vs', '.fs');


      return config;
    },
  };
  
  export default nextConfig;
  
