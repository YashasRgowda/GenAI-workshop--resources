import './App.css'
import { createContext } from 'react'
import ChildA from './components/ChildA';
import { useState } from 'react';

// step=1 creating the context 
// step=2 wrap all the child inside a provider
// step=3 provide the value to be shared
// step=4 consume the value in the child component
const UserContext = createContext();

function App() {
  const [user, setUser] = useState({name: "Yashas", age: 22});
  return (
    <>
      <UserContext.Provider value={user}> 
        <ChildA />
      </UserContext.Provider>
    </>
  )
}

export default App
export {UserContext}
