import React, { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [form, setForm] = useState({ email:'', password:'' })
  const [err, setErr] = useState('')
  const navigate = useNavigate()

  const handle = e => setForm({...form, [e.target.name]: e.target.value})

  const submit = async e =>{
    e.preventDefault()
    try{
      const { data } = await api.post('/api/auth/login', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.user.username)
      navigate('/')
    }catch(error){
      setErr(error.response?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Connexion</h2>
        <form className="form" onSubmit={submit}>
          <input name="email" placeholder="Email" value={form.email} onChange={handle} />
          <input name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handle} />
          <button className="button" type="submit">Se connecter</button>
          {err && <div className="small" style={{color:'red'}}>{err}</div>}
        </form>
      </div>
    </div>
  )
}
