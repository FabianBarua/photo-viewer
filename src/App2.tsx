 
 
import { useState, useEffect } from 'react';
import { Dropbox } from 'dropbox';
import { useToken } from './useToken';
import './GaleriaComponent.css'; 

interface Photo {
  id: string;
  name: string;
  url: string; // Cambiado de base64 a url
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
  
      const uniqueAndDifferentFiles = files.filter((file) => { 
        return photos ? !photos.some((photo) => photo.id === file.id) : true;
      });
  
      for (const file of uniqueAndDifferentFiles) {
        const downloadResponse = await dbx.filesGetTemporaryLink({ path: file.path_lower! });
        
        const url = downloadResponse.result.link; // Obtener el enlace temporal
  
        // Espera 2 segundos
        await new Promise(resolve => setTimeout(resolve, 2000));
  
        setPhotos((prevPhotos) => 
          prevPhotos ? [...prevPhotos, { id: file.id, name: file.name, url }] : [{ id: file.id, name: file.name, url }]
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
  

  // after 3 hours reload page
  const HOURS = 3;
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, HOURS * 3600000);
  
    return () => clearInterval(interval);
  }
  , []);

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
        src={photos[currentIndex].url} // Cambiado de base64 a url
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
