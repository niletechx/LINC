import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socketInstance = null

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    })
  }
  return socketInstance
}

export function useSocket(onConnect) {
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket
    if (!socket.connected) socket.connect()
    if (onConnect) onConnect(socket)
    return () => { /* keep alive */ }
  }, [onConnect])

  return socketRef
}
