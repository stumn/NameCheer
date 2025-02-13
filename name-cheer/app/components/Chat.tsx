'use client';

import { useEffect, useState } from 'react';
import { io, socket } from '../socket';

// コメントの型定義
type CommentType = {
    content: string;
    fav: number;
    id: number;
};

const Chat = () => {
    const [comments, setComments] = useState<CommentType[]>([]);

    // 初期データの読み込み & Socket.io 接続
    useEffect(() => {
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

    // 全コメントのいいね数の平均を計算
    const avgFav = comments.length > 0
        ? comments.reduce((acc, comment) => acc + comment.fav, 0) / comments.length
        : 0;

    const addComment = (newComment: string) => {
        setComments((prevComments) => [
            ...prevComments,
            { content: newComment, fav: 0, id: prevComments.length + 1 },
        ]);
        localStorage.setItem('comments', JSON.stringify([...comments, { content: newComment, fav: 0, id: comments.length + 1 }])); // localStorageにデータを保存
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

    // 🔽 追加：全てのコメントの fav を +1 する関数
    const incrementAllFav = () => {
        setComments((prevComments) =>
            prevComments.map((comment) => ({ ...comment, fav: comment.fav + 1 }))
        );
        localStorage.setItem('comments', JSON.stringify(comments)); // localStorageにデータを保存
    };

    const clearLocalStorage = () => {
        localStorage.clear(); // 全てのデータを削除
        setComments([]); // コメント状態を空にリセット
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <br />
            <Comment comments={comments} incrementFav={incrementFav} avgFav={avgFav} />
            <br />
            <InputCommentForm addComment={addComment} />
            <br />
            <ClappingButton incrementAllFav={incrementAllFav} /> {/* 修正：関数を渡す */}
            <br /><br />
            <button onClick={clearLocalStorage} style={{ padding: '5px 10px', border: 'gray 2px solid', borderRadius: '5px' }}>
                localStorageをクリア
            </button>
            <br />
        </div>
    );
};

// コメント一覧コンポーネントの型定義
type CommentProps = {
    comments: CommentType[];
    incrementFav: (id: number) => void;
    avgFav: number;
};

function Comment({ comments, incrementFav, avgFav }: CommentProps) {
    return (
        <ul style={{ border: 'gray 1px solid', width: '70%', padding: '20px', margin: 'auto' }}>
            {comments.map((comment) => {
                const isAboveAverage = comment.fav > avgFav;
                const styleRule = isAboveAverage ? ['green', 'bold', 'green'] : ['black', 'normal', 'darkorange'];
                return (
                    <li key={comment.id} style={{
                        color: styleRule[0], //
                        fontWeight: styleRule[1],
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'left'
                    }}>
                        <p style={{ color: styleRule[0] }}>No.{comment.id}</p>
                        <p>{comment.content}</p>
                        <FavButton fav={comment.fav} id={comment.id} incrementFav={incrementFav} styleRule={styleRule} />
                    </li>
                );
            })}
        </ul>
    );
}

// いいねボタンの型定義
type FavButtonProps = {
    fav: number;
    id: number;
    incrementFav: (id: number) => void;
    styleRule: string[];
};

function FavButton({ fav, id, incrementFav, styleRule }: FavButtonProps) {
    const handleClick = () => {
        incrementFav(id);
    };

    return (
        <button style={{ color: styleRule[2] }} onClick={handleClick}>
            ★{fav}
        </button>
    );
}

// コメント入力フォームの型定義
type InputCommentFormProps = {
    addComment: (newComment: string) => void;
};

function InputCommentForm({ addComment }: InputCommentFormProps) {
    const [inputValue, setInputValue] = useState<string>('');

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() !== '') {
            socket.emit('message', inputValue);
            setInputValue('');
        }
    };
    return (
        <form onSubmit={sendMessage}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="コメントを入力してください"
                style={{ width: '60%', height: '30px' }}
            />
            <button
                type="submit"
                style={{
                    marginLeft: '10px',
                    width: '30px',
                    height: '30px',
                    border: 'gray 2px solid',
                    borderRadius: '5px'
                }}
            >
                👆
            </button>
        </form>
    );
}

type ClappingButtonProps = {
    incrementAllFav: () => void;
};

function ClappingButton({ incrementAllFav }: ClappingButtonProps) {
    const [isClicked, setIsClicked] = useState(false);
    const [showEffect, setShowEffect] = useState(false);

    const handleClap = (e: React.FormEvent) => {
        e.preventDefault();
        setIsClicked(true);
        incrementAllFav();
        console.log("👏 全てのコメントにいいね！");

        // クリックアニメーションを少し後で戻す
        setTimeout(() => setIsClicked(false), 200);

        // エフェクトを表示
        setShowEffect(true);
        setTimeout(() => setShowEffect(false), 600);
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <button
                onClick={handleClap}
                style={{
                    padding: "5px 10px",
                    border: "darkorange 2px solid",
                    borderRadius: "5px",
                    transform: isClicked ? "scale(1.2)" : "scale(1)", // 押したら拡大
                    transition: "transform 0.2s ease",
                }}
            >
                みんなを応援👏
            </button>

            {/* 拍手エフェクト */}
            {showEffect && (
                <div
                    style={{
                        position: "absolute",
                        top: "-200px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "20px",
                        color: "orange",
                        animation: "fadeOut 0.6s ease-out",
                    }}
                >
                    👏👏👏
                </div>
            )}
        </div>
    );
}

export default Chat;
