import { Injectable } from '@angular/core';
import * as pdfjslib from 'pdfjs-dist';
import { FileReaderService } from './file-reader.service';

pdfjslib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';

@Injectable({
  providedIn: 'root'
})
export class PdfReaderService {

  constructor(
    private fileReaderService: FileReaderService
  ) { }

  async getData(file: File) {
    const buffer = await this.fileReaderService.readAsArrayBuffer(file);
    const pdf = await pdfjslib.getDocument({ data: buffer.data }).promise;
    const numPages = pdf.numPages;
    const allPagesText: string[][] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const pageText = await this.getPageText(pageNum, pdf);
      allPagesText.push(pageText);
    }

    return allPagesText;
  }

  private async getPageText(pageNum: number, pdfDocumentInstance: any): Promise<string[]> {
    try {
      const pdfPage = await pdfDocumentInstance.getPage(pageNum);
      const textContent = await pdfPage.getTextContent();
      const textItems = textContent.items;
      const data: any = {};

      for (const item of textItems) {
        if ((item.str !== undefined) && (!item.hasEOL)) {
          const y: any = item.transform['5'];
          (data[y] = data[y] || []).push(item.str.trim());
        }
      }

      const result: string[] = [];
      Object.keys(data)
        .sort((y1, y2) => parseFloat(y2) - parseFloat(y1))
        .forEach((y) => {
          result.push((data[y] || []).join(';'));
        });

      return result;
    } catch (error) {
      console.error('Error retrieving text from page', error);
      return [];
    }
  }

}
