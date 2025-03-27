import { Button } from 'flowbite-react'
import React from 'react'

export default function Home() {
  return (
    <div>
      <Button onClick={()=>(window.location.href = '/addpost')}>Add Post</Button>

    </div>
  )
}
