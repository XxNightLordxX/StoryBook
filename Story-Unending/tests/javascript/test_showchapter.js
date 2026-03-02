// Test script to check if showChapter works
console.log('Testing showChapter function...');

// Wait for page to load
setTimeout(() => {
  console.log('AppState:', typeof AppState);
  console.log('AppState.chapters:', AppState.chapters ? AppState.chapters.length : 'undefined');
  console.log('AppState.totalGenerated:', AppState.totalGenerated);
  console.log('showChapter:', typeof showChapter);
  
  if (typeof showChapter === 'function' && AppState.chapters.length > 0) {
    console.log('Calling showChapter(1)...');
    showChapter(1);
  } else {
    console.error('Cannot test showChapter - function or chapters not available');
  }
}, 3000);
