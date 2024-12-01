export interface DocumentFile {
    id: string;
    name: string;
    type: 'pdf' | 'epub';
    url: string;
    lastOpened?: Date;
  }
  
  export interface DocumentSelection {
    text: string;
    pageNumber: number;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }