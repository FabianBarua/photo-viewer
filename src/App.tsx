/* eslint-disable @typescript-eslint/ban-ts-comment */
 
import { useState, useEffect } from 'react';
import { Dropbox } from 'dropbox';
import { useToken } from './useToken';
import './GaleriaComponent.css'; 

interface Photo {
  id: string;
  name: string;
  base64: string;
}

 
const toggleFullscreen = (mode = true, el = 'body', ui = 'auto') =>
  mode
    ? document.querySelector(el)?.requestFullscreen({ navigationUI: ui as FullscreenNavigationUI })
    : document.exitFullscreen();


const GaleriaComponent = () => {
  const { TOKEN, refreshToken } = useToken();

  // setFullscreen(true, 'body', 'hide');

  useEffect(() => {
    document.addEventListener('click', () => {
      toggleFullscreen(true, 'body', 'hide');
    });
  }   , []);

  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const init = async () => {
    try {
      const dbx = new Dropbox({ accessToken: TOKEN });
      const response = await dbx.filesListFolder({ path: '/galeria/' });
      const files = response.result.entries.filter((entry) => entry[".tag"] === "file");

      const uniqueAndDiferentFiles = files.filter((file) => { 
        return photos ? !photos.some((photo) => photo.id === file.id) : true;
      });

 
      for (const file of uniqueAndDiferentFiles) {
        const downloadResponse = await dbx.filesDownload({ path: file.path_lower! });
        
        // @ts-ignore
        const blob = downloadResponse.result.fileBlob;

        const base64Data = await blobToBase64(blob);

        // Espera 2 segundos
        await new Promise(resolve => setTimeout(resolve, 6000));

        setPhotos((prevPhotos) => 

          prevPhotos ? [...prevPhotos, { id: file.id, name: file.name, base64: base64Data }] : [{ id: file.id, name: file.name, base64: base64Data }]

        );
      }

    } catch (error) {
      console.error("Error", error);
    }
  };

  useEffect(() => {
    if (TOKEN) {
      init();
    }
  }, [TOKEN]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (photos ? (prevIndex + 1) % photos.length : 0));
    }, 3000);

    return () => clearInterval(interval);
  }, [photos]);

  const MINUTES = 10;

  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, MINUTES * 60000); 
  
    return () => clearInterval(interval); 
  }, []);
  

  return (
    <div className={'galeria-container'}>
      <div className=' abajo '>
      <p>
        {currentIndex + 1}/{photos ? photos.length : 0}
      </p>
      <p>
        Para subir tus fotos aca ingresa al qr de la mesa
      </p>
      </div>
      {photos && photos.length > 0 ? (
        <img 
          src={photos[currentIndex].base64} 
          alt={photos[currentIndex].name} 
          className="galeria-image" 
        />
      ) : (
        <p>No hay fotos disponibles o estan cargando...</p>
      )}
    </div>
  );
};

export default GaleriaComponent;
