import { BookOpen, Play, RotateCcw } from "lucide-react";

interface TitleScreenProps {
  note: string;
  unlockedCount: number;
  totalCount: number;
  onNewGame: () => void;
  onCollection: () => void;
}

export function TitleScreen({ note, unlockedCount, totalCount, onNewGame, onCollection }: TitleScreenProps) {
  return (
    <main className="screen title-screen">
      <section className="title-hero">
        <div className="tower-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="eyebrow">原创怪物收集肉鸽 Demo</p>
          <h1>开局一个蛋</h1>
          <p className="hero-copy">唤醒初始伙伴，登上 10 层活塔，记录沿途出现的异质生命。</p>
          {note && <p className="run-note">{note}</p>}
        </div>
        <div className="title-actions">
          <button className="primary-action" onClick={onNewGame}>
            <Play size={18} />
            开始新游戏
          </button>
          <button className="secondary-action" onClick={onCollection}>
            <BookOpen size={18} />
            图鉴 / 收集
          </button>
        </div>
        <div className="save-strip">
          <RotateCcw size={16} />
          已记录 {unlockedCount} / {totalCount}
        </div>
      </section>
    </main>
  );
}
