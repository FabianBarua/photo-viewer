import axios from "axios";
import { useState, useEffect } from "react";

export const useToken = () => {

    const [TOKEN, setTOKEN] = useState("")
    
    const isValidToken = async (token: string) => {
  
      try {
        await axios.post("https://api.dropboxapi.com/2/users/get_current_account", null, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        return true;
      }
      catch (error) {
        console.error("Token inválido", error)
        return false
      }
  
    }
  
    const refreshToken = async () => {
  
      const refresh_token = import.meta.env.VITE_REFRESH_TOKEN
      const grant_type = "refresh_token"
      const client_id = import.meta.env.VITE_CLIENT_ID
      const client_secret = import.meta.env.VITE_CLIENT_SECRET
      const finalUrl = `https://api.dropbox.com/oauth2/token?refresh_token=${refresh_token}&grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}`
  
      axios.post(finalUrl).then((response) => {
        setTOKEN(response.data.access_token)
        localStorage.setItem("token", response.data.access_token)
      })
  
    }
  
  
    useEffect(() => {
      const init = async () => {
        const storagedToken = localStorage.getItem("token")
        if (storagedToken && await isValidToken(storagedToken)) {
          setTOKEN(storagedToken)
        } else {
          refreshToken()
        }
      }
      init()
    }, [])
  
    return{
      TOKEN,
      setTOKEN,
      refreshToken,
      isValidToken,
    }
  }

  