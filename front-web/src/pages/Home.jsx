import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { getImageUrl } from '../utils/images'

export default function Home(){
  const [todayMission, setTodayMission] = useState(null)
  const [todayPictures, setTodayPictures] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async ()=>{
    try{
      // Récupérer la mission du jour
      const { data: mission } = await api.get('/api/missions/today')
      setTodayMission(mission)
      
      // Récupérer toutes les photos de la mission du jour
      const { data: pics } = await api.get('/api/pictures/today')
      setTodayPictures(pics)
    }catch(err){ 
      console.error(err) 
      // Si pas de mission du jour, afficher un message
      if(err.response?.status === 404) {
        setTodayMission(null)
        setTodayPictures([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    load()
    
    // Recharger les données toutes les 30 secondes pour voir les nouvelles photos
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  },[])

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Chargement de la mission du jour...</p>
        </div>
      </div>
    )
  }

  if (!todayMission) {
    return (
      <div className="container">
        <div className="card">
          <h2>Aucune mission disponible aujourd'hui</h2>
          <p>Revenez plus tard pour découvrir de nouvelles missions !</p>
          <button className="button" onClick={load} style={{marginTop: 12}}>
            Actualiser
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Mission du jour : {todayMission.title}</h2>
        <p className="small">Créée par {todayMission.creator_username}</p>
        <p>{todayMission.description}</p>
        {todayMission.location && <p className="small">📍 {todayMission.location}</p>}
      </div>
      
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <h3>Photos partagées par la communauté ({todayPictures.length})</h3>
        <div className="small" style={{color: '#6b7280'}}>
          🔄 Mise à jour automatique toutes les 30s
        </div>
      </div>
      
      {todayPictures.length === 0 ? (
        <div className="card">
          <p>Aucune photo n'a encore été partagée pour cette mission. Soyez le premier à relever le défi !</p>
        </div>
      ) : (
        <div className="grid">
          {todayPictures.map(pic => (
            <div key={pic.id} className="card">
              <img className="thumb" src={getImageUrl(pic.file_path)} alt={pic.description || 'Mission photo'} />
              <div className="small" style={{marginTop: 8}}>
                <strong>Par {pic.username}</strong>
                {pic.first_name && ` (${pic.first_name}${pic.last_name ? ' ' + pic.last_name : ''})`}
              </div>
              {pic.description && <p className="small">{pic.description}</p>}
              <div className="small" style={{color: '#9ca3af'}}>
                {new Date(pic.upload_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
