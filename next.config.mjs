/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: ['apod.nasa.gov'],
  },
  webpack(config, { isServer }) {
      // Добавляем загрузчик для файлов .glsl
      config.module.rules.push({
          test: /\.(glsl|vs|fs)$/,
          exclude: /node_modules/,
          use: 'raw-loader',
      });

      // Расширение для разрешения файлов
      config.resolve.extensions.push('.glsl', '.vs', '.fs');

      return config;
  },
};

export default nextConfig;
