


import { ref, listAll, getDownloadURL } from "firebase/storage";
import { hasFirebaseStorageBucket, storage } from "../../../../firebaseConfig";

export const getTextureUrls = async (): Promise<string[]> => {
  if (!hasFirebaseStorageBucket) {
    return [];
  }

  try {
   
    const texturesRef = ref(storage, "media/asteroid/textures");
    
   
    const textureItems = (await listAll(texturesRef)).items;
    
    const urls = await Promise.all(
      textureItems.map(item => getDownloadURL(item))
    );
    
    return urls;
    
  } catch (error) {
    console.error("Failed to get texture URLs:", {
     error
    });
    return []; 
  }
};
