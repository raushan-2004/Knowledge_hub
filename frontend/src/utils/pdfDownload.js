/**
 * Download article as PDF
 * @param {Object} article - Article object containing title, content, createdBy, etc.
 */
export const downloadArticleAsPDF = async (article) => {
  // Load html2pdf library dynamically
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  
  script.onload = () => {
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.lineHeight = '1.6';
    element.style.color = '#333';
    
    // Create PDF content
    element.innerHTML = `
      <h1 style="margin-bottom: 10px; color: #333;">${article.title}</h1>
      <div style="margin-bottom: 20px; color: #666; font-size: 14px;">
        <p><strong>Author:</strong> ${article.createdBy?.name || 'Unknown'}</p>
        <p><strong>Created:</strong> ${new Date(article.createdAt).toLocaleDateString()}</p>
        ${article.updatedAt !== article.createdAt ? `<p><strong>Updated:</strong> ${new Date(article.updatedAt).toLocaleDateString()}</p>` : ''}
        ${article.tags && article.tags.length > 0 ? `<p><strong>Tags:</strong> ${article.tags.join(', ')}</p>` : ''}
      </div>
      ${article.summary ? `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #333;">AI Summary</h3>
          <p>${article.summary}</p>
        </div>
      ` : ''}
      <div style="margin-top: 20px; color: #333; white-space: pre-wrap;">
        ${article.content}
      </div>
    `;
    
    const opt = {
      margin: 10,
      filename: `${article.title.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save();
  };
  
  document.head.appendChild(script);
};
