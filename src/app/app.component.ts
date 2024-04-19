import { Component } from '@angular/core';
import { PdfReaderService } from './services/pdf-reader.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  csvText = '';
  data: string[][] = [];
  files: File[] = [];
  textAreaRows = 0;

  constructor(
    private pdfReaderService: PdfReaderService
  ) { }

  async convert() {
    this.csvText = '';
    this.data = [];
    this.textAreaRows = 0;

    for (const file of this.files) {
      const item = await this.pdfReaderService.getData(file);
      this.data.push(item);
      this.csvText += item.join('\n') + '\n'; // Concatenate CSV data for all files
      this.textAreaRows += item.length;
    }

    this.textAreaRows += 5;
  }

  incomingFiles(event: any) {
    this.files = event.target.files;
    this.csvText = '';
  }

  save() {
    let wb = XLSX.utils.book_new();
    let ws_name = "SheetJS";

    for (const file of this.data) {
      let ws_data = file.map(line => [line]); // Convert each line to array for XLSX format
      let ws = XLSX.utils.aoa_to_sheet(ws_data);
      XLSX.utils.book_append_sheet(wb, ws, ws_name);
    }

    XLSX.writeFile(wb, 'output.xlsx');
  }
}
