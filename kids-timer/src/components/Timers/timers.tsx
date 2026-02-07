import { useState } from "react";
import  "../App";
import "./timers.css";


const Timers = () => {
const [time, setTime] = useState(0);
const [timeLeft, setTimeLeft] = useState(0);

    if (time > 0) {
        setTime(time);
      }

    return(
      <>
      <form className="activeMinutes">
        <input type="number" placeholder="hur länge?"/>
      </form>
      <h2 className="timersTitle">Timers</h2>
      <p>Timers</p>
      </>
    )
}
