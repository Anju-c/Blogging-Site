import axios from "axios"
import { useState } from "react"
function Signup(){
    const[username,setusername]=useState("")
    const[email,setemail]=useState("")
    const[password,setpass]=useState("")
    function signup(){
        axios.post("http://localhost:3003/signup",{username,password,email}).then((res)=>{
            console.log(res.data)
            if (res.data.message=="Created"){
                window.location.href="/signin"
                console.log("okkk")
            }
        })
    }
   return(
    <div>
    <input type="text" placeholder="Enter username" value={username} onChange={(e)=>setusername(e.target.value)}/><br/><br/>
    <input type="text" placeholder="Enter email" value={email} onChange={(e)=>setemail(e.target.value)}/><br/><br/>
    <input type="text" placeholder="Enter password" value={password} onChange={(e)=>setpass(e.target.value)}/><br/>
    <button onClick={signup}>Submit</button>
    </div>

   )
}
export default Signup