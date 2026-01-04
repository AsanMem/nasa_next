/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
    images: {
    domains: ['apod.nasa.gov','firebasestorage.googleapis.com'],
  // remotePatterns: [
  //     // APOD images
  //     { protocol: "https", hostname: "apod.nasa.gov" },
  //     // EPIC images (ты в логах видел таймаут именно отсюда)
  //     { protocol: "https", hostname: "epic.gsfc.nasa.gov" },

  //     // иногда NASA отдаёт контент с этих доменов (на будущее)
  //     { protocol: "https", hostname: "www.nasa.gov" },
  //     { protocol: "https", hostname: "images-assets.nasa.gov" },

  //     // Firebase Storage
  //     { protocol: "https", hostname: "firebasestorage.googleapis.com" },
  //   ],

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
  