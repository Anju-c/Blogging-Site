import axios from "axios"
import { useState,useEffect } from "react"
function Dashboard(){
 const[blogs , setBlogs]=useState([])
 useEffect(()=>{
    axios.get("http://localhost:3003/blogs").then((res)=>{
        setBlogs(res.data)
    })
 },[])
   return(
    <div>
    <div style={{display:"flex",justifyContent:"space-between"}}> 
      <div>
      <button onClick={()=>{window.location.href="/createblogs"}}>Create</button>
      </div> 
       <div>
      <button onClick={()=>{window.location.href="/myfollowersblogs"}}>FriendsBlogs</button>
      </div>
       <div>
      <button onClick={()=>{window.location.href="/friends"}}>Friends</button>
      </div>  
       <div>
      <button onClick={()=>{window.location.href="/signup"}}>Logout</button>
      </div>  
     </div>
     <div>
         {blogs.map(e=><div key={e.id} style={{border:"1px solid black",margin:"10px",padding:"10px"}}>
            <h2>{e.title}</h2>
            <h4>{e.content}</h4>
            
            <button onClick={()=>{
                localStorage.setItem("id",e.id)
                window,location.href="/blogsind"
            }}>
                Show
            </button>
            <button onClick={()=>{
                localStorage.setItem("id",e.id)
                window.location.href="/reply"
            }}>
                Reply
            </button>
         </div>)}
        </div>  
    </div>
   ) 
}
export default Dashboard