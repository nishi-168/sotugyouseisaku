export function getRank(count: number): string {
    if (count >= 50)return "ダイアモンド";
    if (count >= 30)return "プラチナ";
    if (count >= 15)return "ゴールド";
    if (count >= 5)return "シルバー";
    return "ブロンズ";
    
}