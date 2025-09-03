import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { Note, ExportFormat } from '../types';

export class ExportService {
  static async exportNote(note: Note, format: ExportFormat): Promise<void> {
    switch (format) {
      case 'pdf':
        return this.exportToPDF(note);
      case 'docx':
        return this.exportToDocx(note);
      case 'txt':
        return this.exportToText(note);
      case 'html':
        return this.exportToHTML(note);
      case 'markdown':
        return this.exportToMarkdown(note);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private static async exportToPDF(note: Note): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    
    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(note.title, maxWidth);
    pdf.text(titleLines, margin, 30);
    
    // Metadata
    let yPos = 50 + (titleLines.length - 1) * 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(128, 128, 128);
    
    const metadata = [
      `Created: ${note.createdAt.toLocaleDateString()}`,
      `Updated: ${note.updatedAt.toLocaleDateString()}`,
      `Category: ${note.category.name}`,
      `Tags: ${note.tags.join(', ')}`,
      `Version: ${note.version}`,
      `Word Count: ${note.wordCount || 0}`
    ];
    
    metadata.forEach(line => {
      pdf.text(line, margin, yPos);
      yPos += 8;
    });
    
    // Content
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    
    // Convert HTML to plain text for PDF
    const plainContent = this.htmlToPlainText(note.content);
    const contentLines = pdf.splitTextToSize(plainContent, maxWidth);
    
    contentLines.forEach((line: string) => {
      if (yPos > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.text(line, margin, yPos);
      yPos += 6;
    });
    
    // AI Summary if available
    if (note.aiSummary) {
      yPos += 10;
      if (yPos > pdf.internal.pageSize.getHeight() - margin - 30) {
        pdf.addPage();
        yPos = margin;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Summary', margin, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const summaryLines = pdf.splitTextToSize(note.aiSummary, maxWidth);
      summaryLines.forEach((line: string) => {
        if (yPos > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.text(line, margin, yPos);
        yPos += 6;
      });
    }
    
    // Footer
    const pageCount = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Page ${i} of ${pageCount} • Exported from NotePad Pro`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    pdf.save(`${this.sanitizeFilename(note.title)}.pdf`);
  }

  private static async exportToDocx(note: Note): Promise<void> {
    const children = [
      // Title
      new Paragraph({
        children: [
          new TextRun({
            text: note.title,
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.TITLE,
      }),
      
      // Metadata
      new Paragraph({
        children: [
          new TextRun({
            text: `Created: ${note.createdAt.toLocaleDateString()} | `,
            italics: true,
            size: 20,
          }),
          new TextRun({
            text: `Updated: ${note.updatedAt.toLocaleDateString()} | `,
            italics: true,
            size: 20,
          }),
          new TextRun({
            text: `Version: ${note.version}`,
            italics: true,
            size: 20,
          }),
        ],
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: `Category: ${note.category.name} | Tags: ${note.tags.join(', ')}`,
            italics: true,
            size: 20,
          }),
        ],
      }),
      
      // Empty line
      new Paragraph({ children: [] }),
      
      // Content
      ...this.htmlToDocxParagraphs(note.content),
    ];

    // Add AI Summary if available
    if (note.aiSummary) {
      children.push(
        new Paragraph({ children: [] }), // Empty line
        new Paragraph({
          children: [
            new TextRun({
              text: 'AI Summary',
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: note.aiSummary,
              size: 22,
            }),
          ],
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([new Uint8Array(buffer)], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.sanitizeFilename(note.title)}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private static async exportToText(note: Note): Promise<void> {
    let content = `${note.title}\n`;
    content += '='.repeat(note.title.length) + '\n\n';
    
    content += `Created: ${note.createdAt.toLocaleDateString()}\n`;
    content += `Updated: ${note.updatedAt.toLocaleDateString()}\n`;
    content += `Category: ${note.category.name}\n`;
    content += `Tags: ${note.tags.join(', ')}\n`;
    content += `Version: ${note.version}\n`;
    content += `Word Count: ${note.wordCount || 0}\n\n`;
    
    content += this.htmlToPlainText(note.content);
    
    if (note.aiSummary) {
      content += '\n\nAI Summary\n';
      content += '-'.repeat(10) + '\n';
      content += note.aiSummary;
    }
    
    this.downloadTextFile(content, `${this.sanitizeFilename(note.title)}.txt`);
  }

  private static async exportToHTML(note: Note): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${note.title}</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #1f2937;
        }
        .metadata {
            color: #6b7280;
            font-size: 0.9rem;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }
        .content {
            font-size: 1.1rem;
            margin: 30px 0;
        }
        .ai-summary {
            background: #f3f4f6;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        .ai-summary h3 {
            margin: 0 0 10px 0;
            color: #1f2937;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 0.8rem;
        }
        @media print {
            body { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${note.title}</h1>
        <div class="metadata">
            <span>Created: ${note.createdAt.toLocaleDateString()}</span>
            <span>Updated: ${note.updatedAt.toLocaleDateString()}</span>
            <span>Category: ${note.category.name}</span>
            <span>Tags: ${note.tags.join(', ')}</span>
            <span>Version: ${note.version}</span>
            <span>Words: ${note.wordCount || 0}</span>
        </div>
    </div>
    
    <div class="content">
        ${note.content}
    </div>
    
    ${note.aiSummary ? `
    <div class="ai-summary">
        <h3>AI Summary</h3>
        <p>${note.aiSummary}</p>
    </div>
    ` : ''}
    
    <div class="footer">
        Exported from NotePad Pro on ${new Date().toLocaleDateString()}
    </div>
</body>
</html>`;

    this.downloadTextFile(html, `${this.sanitizeFilename(note.title)}.html`);
  }

  private static async exportToMarkdown(note: Note): Promise<void> {
    let markdown = `# ${note.title}\n\n`;
    
    markdown += `**Created:** ${note.createdAt.toLocaleDateString()}  \n`;
    markdown += `**Updated:** ${note.updatedAt.toLocaleDateString()}  \n`;
    markdown += `**Category:** ${note.category.name}  \n`;
    markdown += `**Tags:** ${note.tags.join(', ')}  \n`;
    markdown += `**Version:** ${note.version}  \n`;
    markdown += `**Word Count:** ${note.wordCount || 0}\n\n`;
    
    markdown += '---\n\n';
    
    // Convert HTML to Markdown (basic conversion)
    markdown += this.htmlToMarkdown(note.content);
    
    if (note.aiSummary) {
      markdown += '\n\n## AI Summary\n\n';
      markdown += `> ${note.aiSummary}\n`;
    }
    
    this.downloadTextFile(markdown, `${this.sanitizeFilename(note.title)}.md`);
  }

  private static htmlToPlainText(html: string): string {
    // Create a temporary div to parse HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Remove script and style elements
    const scripts = div.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Replace block elements with newlines
    const blockElements = div.querySelectorAll('div, p, br, h1, h2, h3, h4, h5, h6, li');
    blockElements.forEach(el => {
      if (el.tagName === 'BR') {
        el.replaceWith('\n');
      } else if (el.tagName === 'LI') {
        el.textContent = '• ' + el.textContent;
      }
    });
    
    return div.textContent || div.innerText || '';
  }

  private static htmlToMarkdown(html: string): string {
    // Basic HTML to Markdown conversion
    let markdown = html;
    
    // Headers
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
    
    // Bold and italic
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '_$1_');
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '_$1_');
    
    // Links
    markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    
    // Images
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');
    
    // Lists
    markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gs, '$1');
    markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gs, '$1');
    markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    
    // Paragraphs
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    
    // Line breaks
    markdown = markdown.replace(/<br[^>]*>/gi, '\n');
    
    // Code
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    markdown = markdown.replace(/<pre[^>]*>(.*?)<\/pre>/gs, '```\n$1\n```\n\n');
    
    // Blockquotes
    markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gs, '> $1\n\n');
    
    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    const div = document.createElement('div');
    div.innerHTML = markdown;
    markdown = div.textContent || div.innerText || '';
    
    // Clean up extra whitespace
    markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
    markdown = markdown.trim();
    
    return markdown;
  }

  private static htmlToDocxParagraphs(html: string): Paragraph[] {
    // Basic HTML to DOCX conversion
    const plainText = this.htmlToPlainText(html);
    const lines = plainText.split('\n').filter(line => line.trim());
    
    return lines.map(line => new Paragraph({
      children: [
        new TextRun({
          text: line,
          size: 22,
        }),
      ],
    }));
  }

  private static downloadTextFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .toLowerCase()
      .substring(0, 50); // Limit length
  }

  static async importFromFile(file: File): Promise<Partial<Note>> {
    const content = await this.readFileContent(file);
    const name = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    
    return {
      title: name,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      version: 1,
      history: []
    };
  }

  private static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}
