import axios from "axios"
import { useState } from "react"
function CreateBlogs(){

    const[title,settitle]=useState("")
     const[content,setcontent]=useState("")
     function create(){
        axios.post("http://localhost:3003/create-blogs",{title , content },{headers:{token:localStorage.getItem("token")}}).then((res)=>{
            if(res.data=="Added"){
                window.location.href="/dashboard"
            }
        })
     }
  return(
    <div>
        <input type="text" placeholder="Enter title" value={title} onChange={(e)=>{settitle(e.target.value)}}/><br/><br/>
        <input type="text" placeholder="Enter content" value={content} onChange={(e)=>{setcontent(e.target.value)}}/><br/>
        <button onClick={create}>create</button>
    </div>
  )
}
export default CreateBlogs