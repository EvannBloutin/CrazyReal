import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function NavBar(){
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')

  const logout = ()=>{
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/')
  }

  return (
    <nav>
      <div style={{flex:1}}>
        <Link to="/">CrazyReal</Link>
      </div>
      <div>
        <Link to="/">Home</Link>
        {token ? (
          <>
            <Link to="/create">Créer mission</Link>
            <Link to="/challenge">Défi du jour</Link>
            <button onClick={logout} style={{marginLeft:8}} className="button">Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  )
}
