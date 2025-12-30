import { useRef, useState } from 'react'
import './App.css'
import { useEffect } from 'react';

function App() {
  const [count, setCount] = useState(0);
  let val = useRef(0);

  let btnRef = useRef();

  function handleIncrement() {
    val.current = val.current + 1;
    console.log("Value of Val:", val.current);
    setCount(count +1);
  }

  function changeColor() {
    btnRef.current.style.backgroundColor = "red";
  }

  return (
    <>
      <div>
        <button ref={btnRef} onClick={handleIncrement}>
          Increment
        </button>

        <div>
          Count: {count}
        </div>

        <div  onClick={changeColor}>
          change color
        </div>
      </div>      
    </>
  )
};

export default App
