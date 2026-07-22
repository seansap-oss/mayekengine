export type WordEntry = {
  id: string;
  standardRoman: string;
  meiteiMayek: string;
  englishTranslation: string;
  frequencyScore: number;
};

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  words: WordEntry[] = [];
}

export class PredictiveEngine {
  root = new TrieNode();

  constructor(words: WordEntry[]) {
    for (const word of words) {
      this.insert(word);
    }
  }

  insert(word: WordEntry) {
    let node = this.root;
    for (const char of word.standardRoman.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.words.push(word);
  }

  predict(prefix: string, limit = 5): WordEntry[] {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char)!;
    }
    
    const results: WordEntry[] = [];
    const traverse = (n: TrieNode) => {
      results.push(...n.words);
      for (const child of n.children.values()) {
        traverse(child);
      }
    };
    traverse(node);
    return results.sort((a, b) => b.frequencyScore - a.frequencyScore).slice(0, limit);
  }
}
