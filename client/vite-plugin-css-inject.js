// vite-plugin-css-inject.js
export default function cssInjectPlugin() {
  return {
    name: 'css-inject',
    
    transformIndexHtml(html) {
      // During build, we'll handle this differently
      return html;
    },
    
    generateBundle(options, bundle) {
      // Find the CSS file in the bundle
      const cssFile = Object.keys(bundle).find(key => key.endsWith('.css'));
      
      if (cssFile) {
        // Find the HTML file
        const htmlFile = Object.keys(bundle).find(key => key.endsWith('.html'));
        
        if (htmlFile) {
          const html = bundle[htmlFile].source;
          const cssLink = `<link rel="stylesheet" href="/${cssFile}">`;
          
          // Inject CSS link into head
          const updatedHtml = html.replace(
            '</head>',
            `${cssLink}\n</head>`
          );
          
          bundle[htmlFile].source = updatedHtml;
        }
      }
    }
  };
}