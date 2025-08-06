import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route,Routes,BrowserRouter } from 'react-router-dom'
import Signup from './components/signup'
import Signin from './components/signin'
import Dashboard from './components/dashboard'
import CreateBlogs from './components/createblogs'
import Reply from './components/reply'
function App() {
  const [count, setCount] = useState(0)
 
  return (
   <BrowserRouter>
   <Routes>
    <Route path="signup" element={<Signup/>}/>
     <Route path="signin" element={<Signin/>}/>
     <Route path="dashboard" element={<Dashboard/>}/>
     <Route path="createblogs" element={<CreateBlogs/>}/>
      <Route path="reply" element={<Reply/>}/>
   </Routes>
   </BrowserRouter>
  )
}

export default App
