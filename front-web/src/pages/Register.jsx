import React, { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [form, setForm] = useState({ username:'', email:'', password:'', first_name:'', last_name:'' })
  const [err, setErr] = useState('')
  const navigate = useNavigate()

  const handle = e => setForm({...form, [e.target.name]: e.target.value})

  const submit = async e =>{
    e.preventDefault()
    try{
      await api.post('/api/auth/register', form)
      navigate('/login')
    }catch(error){
      setErr(error.response?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Inscription</h2>
        <form className="form" onSubmit={submit}>
          <input name="username" placeholder="Nom d'utilisateur" value={form.username} onChange={handle} />
          <input name="email" placeholder="Email" value={form.email} onChange={handle} />
          <input name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handle} />
          <input name="first_name" placeholder="Prénom" value={form.first_name} onChange={handle} />
          <input name="last_name" placeholder="Nom" value={form.last_name} onChange={handle} />
          <button className="button" type="submit">S'inscrire</button>
          {err && <div className="small" style={{color:'red'}}>{err}</div>}
        </form>
      </div>
    </div>
  )
}
