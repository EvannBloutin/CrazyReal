import React, { useState } from 'react'
import api from '../services/api'

export default function CreateMission(){
  const [form, setForm] = useState({ title:'', description:'', location:'', latitude:'', longitude:'', reward_points:0, difficulty_level:'easy', max_participants:1, start_date:'', end_date:'' })
  const [msg, setMsg] = useState('')

  const handle = e => setForm({...form, [e.target.name]: e.target.value})

  const submit = async e =>{
    e.preventDefault()
    try{
      const { data } = await api.post('/api/missions', form)
      setMsg('Mission créée ! id: '+data.missionId)
      setForm({ title:'', description:'', location:'', latitude:'', longitude:'', reward_points:0, difficulty_level:'easy', max_participants:1, start_date:'', end_date:'' })
    }catch(err){
      setMsg(err.response?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Créer une mission</h2>
        <form className="form" onSubmit={submit}>
          <input name="title" placeholder="Titre" value={form.title} onChange={handle} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handle} />
          <input name="location" placeholder="Location" value={form.location} onChange={handle} />
          <input name="latitude" placeholder="Latitude" value={form.latitude} onChange={handle} />
          <input name="longitude" placeholder="Longitude" value={form.longitude} onChange={handle} />
          <input name="reward_points" type="number" placeholder="Points de récompense" value={form.reward_points} onChange={handle} />
          <select name="difficulty_level" value={form.difficulty_level} onChange={handle}>
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
          <input name="max_participants" type="number" placeholder="Participants max" value={form.max_participants} onChange={handle} />
          <input name="start_date" type="datetime-local" value={form.start_date} onChange={handle} />
          <input name="end_date" type="datetime-local" value={form.end_date} onChange={handle} />
          <button className="button" type="submit">Créer</button>
        </form>
        {msg && <div className="small" style={{marginTop:8}}>{msg}</div>}
      </div>
    </div>
  )
}
