// import React, { use, useContext } from 'react'
// import { UserContext } from '../App';

// const ChildC = ({ title }) => {

//     const user = useContext(UserContext);
//   return (
//     <div>
//         <h1>Hello, {user.name}</h1>
//     </div>
//   )
// }

// export default ChildC

import React, { useContext } from 'react'
import { UserContext } from '../App'

const ChildC = () => {
    const user = useContext(UserContext);
  return (
    <div>
        <h1>Hello, {user.name} and my age is{user.age}</h1>
    </div>
  )
}

export default ChildC