import axios from "axios"
import { useState } from "react"
function Signin(){
    const[username,setusername]=useState("")
    
    const[password,setpass]=useState("")
    function signin(){
        axios.post("http://localhost:3003/signin",{username,password}).then((res)=>{
            console.log(res.data)
            if (res.data.message=="Signed in"){
                const t=res.data.t
                localStorage.setItem("token",t)
                window.location.href="/dashboard"
                console.log("okkk")
            }
        })
    }
   return(
    <div>
    <input type="text" placeholder="Enter username" value={username} onChange={(e)=>setusername(e.target.value)}/><br/><br/>
    
    <input type="text" placeholder="Enter password" value={password} onChange={(e)=>setpass(e.target.value)}/><br/>
    <button onClick={signin}>Submit</button>
    </div>

   )
}
export default Signin