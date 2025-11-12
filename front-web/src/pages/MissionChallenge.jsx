import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function MissionChallenge(){
  const [todayMission, setTodayMission] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [file, setFile] = useState(null)
  const [desc, setDesc] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const load = async ()=>{
      try{
        // Récupérer la mission du jour
        const { data: mission } = await api.get('/api/missions/today')
        setTodayMission(mission)
        
        // Vérifier si l'utilisateur a déjà fait cette mission
        const { data: completedData } = await api.get(`/api/missions/${mission.id}/completed`)
        setIsCompleted(completedData.completed)
        
      }catch(e){ 
        console.error(e)
        if(e.response?.status === 404) {
          setTodayMission(null)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  },[])

  const submit = async e =>{
    e.preventDefault()
    if(!file || !todayMission) return setMsg('Fichier et mission requis')
    if(isCompleted) return setMsg('Vous avez déjà complété cette mission')
    
    try{
      const fd = new FormData()
      fd.append('image', file)
      fd.append('mission_id', todayMission.id)
      fd.append('description', desc)

      const { data } = await api.post('/api/pictures', fd, { headers: {'Content-Type':'multipart/form-data'} })
      setMsg(data.message + ' Rechargement de la nouvelle mission...')
      setFile(null)
      setDesc('')
      setIsCompleted(true) // Marquer comme complété
      
      // Recharger après 2 secondes pour afficher la nouvelle mission du jour
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }catch(err){
      setMsg(err.response?.data?.error || 'Erreur')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!todayMission) {
    return (
      <div className="container">
        <div className="card">
          <h2>Défi du jour</h2>
          <p>Aucune mission disponible aujourd'hui. Revenez demain !</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Défi du jour</h2>
        <h3>{todayMission.title}</h3>
        <p>{todayMission.description}</p>
        {todayMission.location && <p className="small">📍 {todayMission.location}</p>}
        <p className="small">
          🏆 {todayMission.reward_points} points • 
          📊 Difficulté: {todayMission.difficulty_level === 'easy' ? 'Facile' : 
                         todayMission.difficulty_level === 'medium' ? 'Moyen' : 'Difficile'}
        </p>
        
        {isCompleted ? (
          <div style={{padding: 16, background: '#d1fae5', borderRadius: 8, marginTop: 16}}>
            <h4 style={{color: '#065f46', margin: 0}}>✅ Mission accomplie !</h4>
            <p style={{color: '#047857', margin: '8px 0 0 0'}}>
              Vous avez déjà complété cette mission. Revenez demain pour un nouveau défi !
            </p>
          </div>
        ) : (
          <form className="form" onSubmit={submit} style={{marginTop: 16}}>
            <h4>Partagez votre photo</h4>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e=>setFile(e.target.files[0])} 
              required
            />
            <textarea 
              placeholder="Décrivez votre photo (optionnel)" 
              value={desc} 
              onChange={e=>setDesc(e.target.value)}
              rows={3}
            />
            <button className="button" type="submit" disabled={!file}>
              {file ? 'Envoyer la photo' : 'Sélectionnez une photo'}
            </button>
          </form>
        )}
        
        {msg && (
          <div className="small" style={{
            marginTop: 8, 
            padding: 8, 
            borderRadius: 4,
            background: msg.includes('succès') || msg.includes('complétée') ? '#d1fae5' : '#fee2e2',
            color: msg.includes('succès') || msg.includes('complétée') ? '#065f46' : '#991b1b'
          }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}
