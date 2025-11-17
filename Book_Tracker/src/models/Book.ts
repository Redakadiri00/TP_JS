import mongoose, { Schema, Document } from 'mongoose';

export enum BookStatus {
  READ = 'Read',
  REREAD = 'Re-read',
  DNF = 'DNF',
  CURRENTLY_READING = 'Currently reading',
  RETURNED_UNREAD = 'Returned Unread',
  WANT_TO_READ = 'Want to read'
}

export enum BookFormat {
  PRINT = 'Print',
  PDF = 'PDF',
  EBOOK = 'Ebook',
  AUDIOBOOK = 'AudioBook'
}

export interface IBook extends Document {
  title: string;
  author: string;
  numberOfPages: number;
  status: BookStatus;
  price: number;
  pagesRead: number;
  format: BookFormat;
  suggestedBy: string;
  finished: boolean;
  currentlyAt(): number;
  deleteBook(): Promise<void>;
}

const bookSchema = new Schema<IBook>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  numberOfPages: { type: Number, required: true, min: 1 },
  status: { 
    type: String, 
    required: true,
    enum: Object.values(BookStatus)
  },
  price: { type: Number, required: true, min: 0 },
  pagesRead: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
  format: { 
    type: String, 
    required: true,
    enum: Object.values(BookFormat)
  },
  suggestedBy: { type: String, required: true },
  finished: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Pre-save middleware to auto-update finished status
bookSchema.pre('save', function(next) {
  if (this.pagesRead >= this.numberOfPages) {
    this.finished = true;
  } else {
    this.finished = false;
  }
  
  // Ensure pagesRead doesn't exceed numberOfPages
  if (this.pagesRead > this.numberOfPages) {
    this.pagesRead = this.numberOfPages;
  }
  
  next();
});

// Method: currentlyAt - returns reading progress percentage
bookSchema.methods.currentlyAt = function(): number {
  if (this.numberOfPages === 0) return 0;
  return Math.round((this.pagesRead / this.numberOfPages) * 100);
};

// Method: deleteBook
bookSchema.methods.deleteBook = async function(): Promise<void> {
  await this.deleteOne();
};

export const Book = mongoose.model<IBook>('Book', bookSchema);