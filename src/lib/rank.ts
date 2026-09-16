export function getRank(count: number): string {
    if (count >= 50)return "レジェンド👑";
    if (count >= 30)return "ダイヤモンド💎";
    if (count >= 15)return "ゴールド🥇";
    if (count >= 5)return "シルバー🥈";
    return "ブロンズ🥉";
    
}