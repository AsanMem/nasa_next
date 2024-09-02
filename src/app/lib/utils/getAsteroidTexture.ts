import fs from 'fs';
import path from 'path';

export const getAsteroidTexture = (index) => {
  const texturesPath = path.join(process.cwd(), 'public/media/asteroid/textures');
  const textureFiles = fs.readdirSync(texturesPath);

  // Получаем количество доступных текстур
  const textureCount = textureFiles.length;

  // Рассчитываем индекс текстуры
  const textureIndex = (index % textureCount) + 1;

  // Возвращаем путь к текстуре
  return `/media/asteroid/textures/stone-${textureIndex}.jpg`;
};
