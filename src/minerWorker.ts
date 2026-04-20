import { sha1 } from "js-sha1";

self.onmessage = (e) => {
  const { last_hash, expected_hash, diff, id, threads } = e.data;
  
  let nonce = 0;
  let startTime = Date.now();
  
  // Multi-threaded nonce splitting
  // Each thread starts at its 'id' and jumps by 'threads' count
  for (nonce = id; nonce < diff * 100 + 1; nonce += threads) {
    const hash = sha1(last_hash + nonce);
    
    if (hash === expected_hash) {
      const endTime = Date.now();
      const hashrate = nonce / ((endTime - startTime) / 1000);
      self.postMessage({ result: nonce, hashrate });
      return;
    }

    // Periodically report progress to calculate hashrate even if not found yet
    if (nonce % 5000 === 0) {
       const currentTime = Date.now();
       const currentHashrate = nonce / ((currentTime - startTime) / 1000);
       self.postMessage({ hashrate: currentHashrate });
    }
  }
  
  self.postMessage({ error: "Nonce not found" });
};
