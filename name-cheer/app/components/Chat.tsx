'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// コメントの型定義
type CommentType = {
    content: string;
    fav: number;
    id: number;
};

// Socket.io のインスタンスをグローバルに保持
let socket: any;

const Chat = () => {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [inputValue, setInputValue] = useState('');

    // 初期データの読み込み & Socket.io 接続
    useEffect(() => {
        // すでにソケットが存在する場合は再接続しない
        if (!socket) {
            socket = io();
        }

        // localStorage からコメントデータを取得
        const storedComments = localStorage.getItem('comments');
        if (storedComments) {
            setComments(JSON.parse(storedComments));
        }

        // サーバーからメッセージを受信
        socket.on('message', (msg: string) => {
            setComments((prevComments) => {
                const newComments = [
                    ...prevComments,
                    { content: msg, fav: 0, id: prevComments.length + 1 }
                ];
                localStorage.setItem('comments', JSON.stringify(newComments)); // 更新
                return newComments;
            });
        });

        return () => {
            socket.off('message'); // イベントリスナーを解除
        };
    }, []);

    // メッセージを送信
    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() !== '') {
            socket.emit('message', inputValue);
            setInputValue('');
        }
    };

    // いいねボタンを押したとき
    const incrementFav = (id: number) => {
        setComments((prevComments) => {
            const newComments = prevComments.map((comment) =>
                comment.id === id ? { ...comment, fav: comment.fav + 1 } : comment
            );
            localStorage.setItem('comments', JSON.stringify(newComments));
            return newComments;
        });
    };

    return (
        <div>
            <h2>Chat</h2>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>

            <ul>
                {comments.map((comment) => (
                    <li key={comment.id} style={{ display: 'flex', gap: '10px' }}>
                        <p>{comment.content}</p>
                        <button onClick={() => incrementFav(comment.id)}>★{comment.fav}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Chat;
