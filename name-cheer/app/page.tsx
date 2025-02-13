'use client';
import { useEffect, useState } from 'react';
import { io, socket } from './socket';
import Chat from './components/Chat';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div>
      <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <h1 style={{ fontSize: '2em', marginRight: '20px' }}>Name Cheer</h1>
        <NamePrompt />
      </div>

      <br />
      <Chat />
      <br />
      <div style={{ marginLeft: '20px' }}>
        <p>Status: {isConnected ? "connected" : "disconnected"}</p>
        <p>Transport: {transport}</p>
      </div>
    </div>
  );
}

const NamePrompt = () => {
  const [name, setName] = useState('');
  const [isNameEntered, setIsNameEntered] = useState(false);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() !== '') {
      setIsNameEntered(true);
      console.log('name', name);
      socket.emit('sign-in', name);
    }
  };

  if (!isNameEntered) {
    return (
      <form onSubmit={handleNameSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Enter your name'
        />
        <button type="submit">Submit</button>
      </form>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <h2>Hello, {name}, {socket.id}</h2>
    </div>
  );
};